from django.shortcuts import render
from django.contrib.auth import login, logout, authenticate
from django.core.exceptions import ValidationError
from .serializers import ClientSerializer
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny
from rest_framework import status as s

# Handles the Sign-up feature
class Sign_Up(APIView):
    permission_classes = [AllowAny]

    def post(self,request):
        # Gets user information from the request and then sets the username to be equal to the email provided
        data = request.data.copy()
        data['username'] = data.get('email')

        # Serializes the newly created client
        new_client = ClientSerializer(data=data)

        # If all is good, make  the client and provide the verification token. If not, send a 400 error
        if new_client.is_valid():
            client = new_client.save()
            token_obj = Token.objects.create(user=client)
            return Response({'user': ClientSerializer(client).data, "token": token_obj.key}, status=s.HTTP_201_CREATED)
        else:
            return Response(new_client.errors, status=s.HTTP_400_BAD_REQUEST)

# Handles the Log-in feature
class Log_in(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Grabs who the user is from the request and authenticates them through their email and password
        data = request.data.copy()
        client = authenticate(username=data.get("email"), password=data.get("password"))
        
        # If the user was authenticated, log them in and assign a token, otherwise send an error
        if client:
            login(request, user=client)
            token_obj, token_created = Token.objects.get_or_create(user=client)
            return Response({'user': ClientSerializer(client).data, "token": token_obj.key}, status=s.HTTP_200_OK)
        else:
            return Response("No user matching credentials", status=s.HTTP_404_NOT_FOUND)

# Handles the Log-out feature
class Log_out(APIView):
    def post(self, request):
        # Deletes the currently used authentication token, loggin the user out
        request.user.auth_token.delete()
        logout(request)
        return Response({"success": True}, status=s.HTTP_204_NO_CONTENT)

# Handles grabbing the information of the currently signed in user and changing a user's account info
class Info(APIView):
    def get(self, request):
        serializer = ClientSerializer(request.user)
        return Response({"user": serializer.data})
    
    def put(self, request):
        try:
            data = request.data.copy()
            client_serializer = ClientSerializer(request.user, data=data, partial=True)
            if client_serializer.is_valid():
                client_serializer.save()
                return Response(client_serializer.data)
            else:
                return Response(client_serializer.errors)
        except ValidationError as e:
            return Response(e.message)
    
class Test_view(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response("Hello world")