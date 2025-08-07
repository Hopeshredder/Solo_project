from django.shortcuts import get_object_or_404
from django.db.models import Sum
import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as s
from .models import FoodLog
from .serializers import FoodLogSerializer
from datetime import date, timedelta
from datetime_app.models import Day, Week


class FoodLogs(APIView):
    def get(self, request):
        foods = FoodLog.objects.filter(user=request.user)
        serialized = FoodLogSerializer(foods, many=True)
        return Response(serialized.data)
    
    def post(self, request):
        data = request.data.copy()

        # Getting or creating a week object to then get or create a day object for the food log to exist within
        today=date.today()
        # Subtracts the current date by the number of days in the week have past to get the Monday of the current week
        week_start = today - timedelta(days=today.weekday())
        # Sees if a week exists based off this weeks Monday and makes one if not
        week, _ = Week.objects.get_or_create(start_date=week_start)
        # Sees if a day exists and assigns it to the current week if said date DNE
        day, _ = Day.objects.get_or_create(date=today, defaults={'parent_week':week})
        # Assigns the gotten or created day as the associated Day object for the current FoodLog entry
        data['parent_day'] = day.id

        serialized = FoodLogSerializer(data=data)
        if(serialized.is_valid()):
            serialized.save(user=request.user)
            return Response(serialized.data, status=s.HTTP_201_CREATED)
        return Response(serialized.errors, status=s.HTTP_400_BAD_REQUEST)

class FoodLogSingle(APIView):

    def get_food(self, request, pk):
        return get_object_or_404(FoodLog, pk=pk, user=request.user)

    def get(self, request, pk):
        food = self.get_food(request, pk)
        serialized = FoodLogSerializer(food)
        return Response(serialized.data)

    def put(self, request, pk):
        food = self.get_food(request, pk)
        serialized = FoodLogSerializer(food, data=request.data, partial=True)
        if serialized.is_valid():
            serialized.save()
            return Response(serialized.data, status=s.HTTP_200_OK)
        else:
            return Response(serialized.errors, status=s.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk):
        food=self.get_food(request, pk)
        # Saves some data from food before deleting
        day = food.parent_day
        food_name = food.food_name
        food.delete()

        # Checks to see if there are any FoodLogs left for the given week
        remaining_log = FoodLog.objects.filter(parent_day=day).first()
        # If so, recalculate the Daily and Weekly totals
        if remaining_log:
            remaining_log.recalculate_totals()
        # Otherwise, set the totals to 0
        else:
            day.daily_calorie_total = 0
            day.save()
            day.parent_week.weekly_calorie_total = 0
            day.parent_week.save()

        return Response(f'{food_name} has been deleted', status=s.HTTP_200_OK)

# Looks up nutritional data from the CalorieNinjas API from a given food name
class NutritionLookup(APIView):
    def get(self, request):
        query = request.query_params.get("query", "").strip()
        if not query:
            return Response({"error": "Query parameter 'query' is required."}, status=s.HTTP_400_BAD_REQUEST)

        try:
            # 1) Search for foods
            search_url = "https://api.nal.usda.gov/fdc/v1/foods/search"
            params = {
                "api_key": settings.FDC_API_KEY,
                "query": query,
                "pageSize": 1
            }
            # Searches the API with the above terms and times out after 10 seconds
            seach_result = requests.get(search_url, params=params, timeout=10)
            if seach_result.status_code != 200:
                return Response({"error": "USDA search failed."}, status=s.HTTP_502_BAD_GATEWAY)

            data = seach_result.json()
            # Gets a list of results from the search and makes sure it exists, then pulls the first entry
            foods = data.get("foods", [])
            if not foods:
                return Response({"items": []}, status=s.HTTP_200_OK)

            food = foods[0]

            # Grabs a description if available, and uses the name searched for if no description is available
            description = food.get("description") or query
            nutrients = food.get("foodNutrients", []) or []

            # Extract nutrients by nutrientNumber
            def get_nutrient(num):
                for n in nutrients:
                    if str(n.get("nutrientNumber")) == str(num):
                        return n.get("value")
                return 0

            # These Codes are what the given foods are referenced to when the USDA returns data
            calories = get_nutrient("1008")
            protein = get_nutrient("1003")
            carbs   = get_nutrient("1005")
            fat     = get_nutrient("1004")

            # Return the data in the format  expected by the front end
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