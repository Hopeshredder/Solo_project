from rest_framework import serializers
from .models import FoodLog

class FoodLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodLog
        fields = [
            "id",
            "food_name",
            "calories",
            "protein",
            "carbs",
            "fat",
            "image_url",
            "time_logged",
            "parent_day",
            "user",
        ]
        read_only_fields = ["id", "image_url", "time_logged", "parent_day", "user"]