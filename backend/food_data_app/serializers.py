from rest_framework import serializers
from .models import FoodLog

class FoodLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodLog
        fields = '__all__'
        extra_kwargs = {
            'user': {'required': False}
        }
