from django.urls import path
from .views import Sign_Up, Log_in, Log_out, Info

urlpatterns = [
    # Directs to a feature that grabs the info of the current user
    path("info/", Info.as_view(), name='info'),
    # Directs to the Sign-up feature
    path("signup/", Sign_Up.as_view(), name='signup'),
    # Directs to the Log-in feature
    path("login/", Log_in.as_view(), name='login'),
    # Directs to the Sign-out feature
    path("logout/", Log_out.as_view(), name='logout'),
]
