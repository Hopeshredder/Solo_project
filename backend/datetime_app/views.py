from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as s

from .models import Day, Week
from .serializers import DaySerializer, WeekSerializer

class Weeks(APIView):
    def get(self, request):
        weeks = Week.objects.filter(user=request.user).order_by('-start_date')[:30]  # limit to past 12 weeks, most to least recent, only returns current user's info
        serializer = WeekSerializer(weeks, many=True)
        return Response(serializer.data)

class OneWeek(APIView):
    def get_week(self, pk):
        return get_object_or_404(Week, pk=pk)
        
    def get(self, request, pk):
        week = self.get_week(pk)
        serialized = WeekSerializer(week)
        return Response(serialized.data)

class Days(APIView):
    def get(self, request):
        days = Day.objects.filter(user=request.user).order_by('-date')[:30]  # limit to past 30 days, most to least recent, only returns current user's info
        serializer = DaySerializer(days, many=True)
        return Response(serializer.data)

class OneDay(APIView):
    def get_day(self, pk):
        return get_object_or_404(Day, pk=pk)

    def get(self, request, pk):
        day = self.get_day(pk)
        serialized = DaySerializer(day)
        return Response(serialized.data)