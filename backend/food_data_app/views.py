from django.shortcuts import get_object_or_404
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as s
from .models import FoodLog
from .serializers import FoodLogSerializer
from datetime import date, timedelta
from datetime_app.models import Day, Week


class FoodLogs(APIView):
    def get(self, request):
        print("USER:", request.user)
        print("Authenticated:", request.user.is_authenticated)
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