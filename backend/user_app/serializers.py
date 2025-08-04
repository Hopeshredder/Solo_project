from .models import Client
from django.core.exceptions import ValidationError
from rest_framework.serializers import ModelSerializer, EmailField, CharField, BooleanField
from rest_framework.validators import UniqueValidator

class ClientSerializer(ModelSerializer):
    password = CharField(write_only=True, required=True)
    new_password = CharField(write_only=True, required=False)
    old_password = CharField(write_only=True, required=False)
    email =  EmailField(
        validators=[UniqueValidator(queryset=Client.objects.all())]
    )


    class Meta:
        model = Client
        fields = "__all__"

    def create(self, validated):
        new_client = Client.objects.create_user(**validated)
        new_client.save()
        return new_client