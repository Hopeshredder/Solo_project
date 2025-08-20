# backend/food_data_app/views.py
from datetime import date
import requests

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status as s

from .models import FoodLog
from .serializers import FoodLogSerializer


# ---------------------------------------------------------------------
# /api/v1/foods/           -> list/create (optionally filter by ?day=YYYY-MM-DD)
# /api/v1/foods/<pk>/      -> retrieve/update/delete (scoped to request.user)
# /api/v1/foods/nutrition/ -> USDA proxy: ?query=food name  (returns {"item": {...}})
# ---------------------------------------------------------------------

class FoodLogs(APIView):
    # List current user's food logs (optionally filter by day) or create a new one.
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Keeps track of what day it is (default today if not provided)
        day_str = request.query_params.get("day")
        if day_str:
            # Expecting YYYY-MM-DD; if invalid, just ignore and fall back to today
            try:
                target = date.fromisoformat(day_str)
            except ValueError:
                target = timezone.now().date()
        else:
            target = timezone.now().date()

        # Filter by user and the Day’s date (FoodLog has FK parent_day -> Day(date))
        logs = FoodLog.objects.filter(user=request.user, parent_day__date=target).order_by("-time_logged")
        serialized = FoodLogSerializer(logs, many=True)
        return Response(serialized.data, status=s.HTTP_200_OK)

    def post(self, request):
        # FoodLog.save() sets parent_day (Day/Week) and updates totals
        ser = FoodLogSerializer(data=request.data)
        if ser.is_valid():
            food = ser.save(user=request.user)
            return Response(FoodLogSerializer(food).data, status=s.HTTP_201_CREATED)
        return Response(ser.errors, status=s.HTTP_400_BAD_REQUEST)


class FoodLogSingle(APIView):
    # Retrieve, update, or delete a single FoodLog owned by the current user.

    def _get(self, request, pk):
        return get_object_or_404(FoodLog, pk=pk, user=request.user)

    def get(self, request, pk):
        food = self._get(request, pk)
        return Response(FoodLogSerializer(food).data, status=s.HTTP_200_OK)

    def put(self, request, pk):
        food = self._get(request, pk)
        ser = FoodLogSerializer(food, data=request.data)
        if ser.is_valid():
            updated = ser.save()  # model.save() will recalc day/week totals
            return Response(FoodLogSerializer(updated).data, status=s.HTTP_200_OK)
        return Response(ser.errors, status=s.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        # Gets the log to be deleted
        food = self._get(request, pk)
        # Saves the parent day of the log before deletion
        parent_day = food.parent_day

        # Removes the log then recomputes day/week totals
        food.delete()
        food.recalculate_totals()

        # Returns a message saying the delete was successful and the new daily calorie total
        parent_day.refresh_from_db(fields=["daily_calorie_total"])
        return Response({"detail": "Deleted.", "daily_total": parent_day.daily_calorie_total}, status=s.HTTP_200_OK)


# Looks up nutritional data from the FDC API from a given food name
class NutritionLookup(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Gets query if exists
        query = (request.query_params.get("query") or "").strip()
        if not query:
            return Response({"error": "Query parameter 'query' is required."}, status=s.HTTP_400_BAD_REQUEST)

        try:
            search_url = "https://api.nal.usda.gov/fdc/v1/foods/search"
            # Ask for multiple results and prioritize datasets that usually have full nutrients
            params = {
                "api_key": settings.FDC_API_KEY,
                "query": query,
                "pageSize": 5,
                "dataType": ["Survey (FNDDS)", "SR Legacy", "Branded"],
            }
            r = requests.get(search_url, params=params, timeout=10)
            if r.status_code != 200:
                return Response({"error": "USDA search failed."}, status=s.HTTP_502_BAD_GATEWAY)

            payload = r.json() or {}
            foods = payload.get("foods") or []
            if not foods:
                return Response({"items": []}, status=s.HTTP_200_OK)

            def extract_macros(food):
                # Return (desc, calories, protein_g, carbs_g, fat_g) from either foodNutrients or labelNutrients.

                # First try foodNutrients (array of dicts)
                fn = food.get("foodNutrients") or []
                

                def get_val(id_code=None, number_code=None):
                    for n in fn:
                        nid = n.get("nutrientId")
                        nnum = n.get("nutrientNumber")
                        if (id_code is not None and str(nid) == str(id_code)) or (
                            number_code is not None and str(nnum) == str(number_code)
                        ):
                            return n.get("value")
                    return None

                # Prefer nutrientId, but accept nutrientNumber
                calories = get_val(id_code=1008, number_code="208")  # Energy (kcal)
                protein  = get_val(id_code=1003, number_code="203")  # Protein (g)
                carbs    = get_val(id_code=1005, number_code="205")  # Carbs (g)
                fat      = get_val(id_code=1004, number_code="204")  # Fat (g)
                
                description = query.title()

                # Fallback: branded items often have labelNutrients
                if any(v in (None, 0) for v in [calories, protein, carbs, fat]):
                    ln = food.get("labelNutrients") or {}

                    def lv(key):
                        v = (ln.get(key) or {}).get("value")
                        return v if v is not None else None

                    calories = calories if calories not in (None, 0) else lv("calories")
                    protein  = protein  if protein  not in (None, 0) else lv("protein")
                    carbs    = carbs    if carbs    not in (None, 0) else lv("totalCarbohydrate")
                    fat      = fat      if fat      not in (None, 0) else lv("totalFat")

                return description, calories, protein, carbs, fat

            # Pick the first candidate with at least some macros present
            chosen = None
            for f in foods:
                desc, cal, pro, cho, fat = extract_macros(f)
                if any(v not in (None, 0) for v in [cal, pro, cho, fat]):
                    chosen = (desc, cal, pro, cho, fat)
                    break

            # If all were empty, just use the first (still renders zeros)
            if chosen is None:
                chosen = extract_macros(foods[0])

            description, calories, protein, carbs, fat = chosen

            # Return the data in the format expected by the front end
            normalized = {
                "name": description,
                "calories": round(float(calories or 0)),
                "protein_g": round(float(protein or 0)),
                "carbohydrates_total_g": round(float(carbs or 0)),
                "fat_total_g": round(float(fat or 0)),
            }
            return Response({"item": normalized}, status=s.HTTP_200_OK)

        except requests.RequestException:
            return Response({"error": "Failed to reach USDA API."}, status=s.HTTP_502_BAD_GATEWAY)
        except Exception:
            return Response({"error": "Unexpected error."}, status=s.HTTP_500_INTERNAL_SERVER_ERROR)
