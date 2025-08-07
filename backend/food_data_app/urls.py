from django.urls import path
from .views import FoodLogs, FoodLogSingle, NutritionLookup

urlpatterns = [
    path('', FoodLogs.as_view(), name='foodlogs'),
    path('<int:pk>/', FoodLogSingle.as_view(), name='foodlog-single'),
    path('nutrition/', NutritionLookup.as_view(), name='nutrition-lookup'),
]