from django.urls import path
from .views import FoodLogs, FoodLogSingle

urlpatterns = [
    path('foodlogs/', FoodLogs.as_view(), name='foodlogs'),
    path('foodlogs/<int:pk>/', FoodLogSingle.as_view(), name='foodlog-single'),
]