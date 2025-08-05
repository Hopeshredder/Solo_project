from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as s
from .models import FoodLog
from .serializers import FoodLogSerializer


class FoodLogs(APIView):
    def get(self, request):
        foods = FoodLog.objects.filter(user=request.user)
        serialized = FoodLogSerializer(foods, many=True)
        return Response(serialized.data)
    
    def post(self, request):
        serialized = FoodLogSerializer(data=request.data)
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
        food_name = food.food_name
        food.delete()
        return Response(f'{food_name} has been deleted', status=s.HTTP_200_OK)