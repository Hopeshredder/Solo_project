from .models import Client
from rest_framework import serializers
from django.core.exceptions import ValidationError
from rest_framework.serializers import ModelSerializer, EmailField, CharField, BooleanField
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password

class ClientSerializer(ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=False)
    old_password = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=Client.objects.all(), message="Email already in use.")]
    )

    class Meta:
        model = Client
        fields = "__all__"

    # Used when creating a user
    def create(self, validated_data):
        validated_data["username"] = validated_data["email"]
        new_client = Client.objects.create_user(**validated_data)
        new_client.save()
        return new_client

    # Used when updating a user's info
    def update(self, instance, validated_data):
        # Extract and remove password fields from validated_data to avoid raw assignment
        old_pw = validated_data.pop("old_password", None)
        new_pw = validated_data.pop("new_password", None)
        validated_data.pop("password", None)  # never saves raw password

        # Basic profile fields update
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Handle password change if requested
        if new_pw:
            # If no old password is provided, throw error
            if not old_pw:
                raise serializers.ValidationError({"old_password": "Current password is required."})
            # If provided old password is incorrect, throw error
            if not instance.check_password(old_pw):
                raise serializers.ValidationError({"old_password": "Current password is incorrect."})

            try:
                # If old password is correct, validate and set the new password
                validate_password(new_pw, user=instance)
            except ValidationError as e:
                # Shows only the first validator message
                msg = e.messages[0] if e.messages else "Invalid password."
                raise serializers.ValidationError({"new_password": [msg]})
            instance.set_password(new_pw)

        instance.save()
        return instance
