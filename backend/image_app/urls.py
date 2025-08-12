from django.urls import path
from .views import UnsplashPreview, SetFoodLogImage

urlpatterns = [
    path("search/", UnsplashPreview.as_view(), name="unsplash-preview"),
    path("foodlogs/<int:pk>/set/", SetFoodLogImage.as_view(), name="set-foodlog-image"),
]