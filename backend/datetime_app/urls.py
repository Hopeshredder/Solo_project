from django.urls import path
from .views import Weeks, OneWeek, Days, OneDay

urlpatterns = [
    path('weeks/', Weeks.as_view(), name='weeks'),
    # Find week based off date of the first day of the week with the following format YYYY-MM-DD
    path('weeks/<str:start_date>/', OneWeek.as_view(), name='week-single'),

    path('days/', Days.as_view(), name='days'),
    # Find day based off date with the following format YYYY-MM-DD
    path('days/<str:date>/', OneDay.as_view(), name='day-single'),
]