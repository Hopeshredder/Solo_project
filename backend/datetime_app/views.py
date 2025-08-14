from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime
from django.http import Http404

from .models import Day, Week
from food_data_app.models import FoodLog
from .serializers import DaySerializer, WeekSerializer

class Weeks(APIView):
    def get(self, request):
        # Filters based off of the user variable of the food logs of the days attached to it
        weeks = Week.objects.filter(days__logs__user=request.user).distinct().order_by('-start_date')[:30]  # limit to past 12 weeks, most to least recent, only returns current user's info
        serializer = WeekSerializer(weeks, many=True)
        return Response(serializer.data)

class OneWeek(APIView):
    def get_week(self, start_date):
        try:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
        except ValueError:
            raise Http404("Invalid date format. Use YYYY-MM-DD.")
        return get_object_or_404(Week, start_date=start_date_obj)
        
    def get(self, request, start_date):
        week = self.get_week(start_date)
        serialized = WeekSerializer(week)
        return Response(serialized.data)

class Days(APIView):
    def get(self, request):
        # Adds what day of week the day is when associating it with the parent week
        week_start = request.GET.get('week_start')
        if week_start:
            try:
                week_date = datetime.strptime(week_start, "%Y-%m-%d").date()
            except ValueError:
                return Response({"error": "Invalid week_start format. Use YYYY-MM-DD."}, status=400)

            # Filter days that belong to the week with this start_date and current user
            days = Day.objects.filter(
                parent_week__start_date=week_date,
                logs__user=request.user
            ).distinct().order_by('date')

            serializer = DaySerializer(days, many=True)
            return Response(serializer.data)
        
        # logs__user is a reverse of the foreign key, it looks through objects that have a foreign key with it and their related name, in this case for the user variable attached to it
        days = Day.objects.filter(logs__user=request.user).distinct().order_by('-date')[:30]  # limit to past 30 days, most to least recent, only returns current user's info
        serializer = DaySerializer(days, many=True)
        return Response(serializer.data)

class OneDay(APIView):
    def get_day(self, date):
        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            raise Http404("Invalid date format. Use YYYY-MM-DD.")
        return get_object_or_404(Day, date=date_obj)

    def get(self, request, date):
        day = self.get_day(date)
        serialized = DaySerializer(day)
        return Response(serialized.data)