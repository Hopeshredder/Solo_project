from django.urls import path
from .views import Weeks, OneWeek, Days, OneDay

urlpatterns = [
    path('weeks/', Weeks.as_view(), name='weeks'),
    # pk=primary key
    path('weeks/<int:pk>/', OneWeek.as_view(), name='week-single'),

    path('days/', Weeks.as_view(), name='weeks'),
    # pk=primary key
    path('days/<int:pk>/', OneWeek.as_view(), name='week-single'),
]