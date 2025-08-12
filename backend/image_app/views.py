# backend/image_app/views.py
import requests
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as s
from rest_framework.permissions import IsAuthenticated

from food_data_app.models import FoodLog
from food_data_app.serializers import FoodLogSerializer

# Required for using Unsplash API
APP_UTM = "FullSnack"

# For use when making the preview cards when searching for new foods
class UnsplashPreview(APIView):

    def get(self, request):
        # Checks for details existing in query
        query = (request.query_params.get("q") or "").strip()
        if not query:
            return Response({"detail": "Missing query param 'q'."}, status=s.HTTP_400_BAD_REQUEST)

        # Sets variables to be used later when searching the unsplash API
        url = "https://api.unsplash.com/search/photos"
        params = {"query": query, "per_page": 6, "orientation": "squarish"}
        headers = {
            "Accept-Version": "v1",
            "Authorization": f"Client-ID {settings.UNSPLASH_API_KEY}",
        }

        # Tries to get an image from unsplash and throws errors if not able to
        try:
            r = requests.get(url, params=params, headers=headers, timeout=8)
        except requests.RequestException:
            return Response({"detail": "Failed to reach Unsplash."}, status=s.HTTP_502_BAD_GATEWAY)

        if r.status_code != 200:
            return Response({"detail": "Unsplash error.", "status": r.status_code},
                            status=s.HTTP_502_BAD_GATEWAY)

        results = (r.json() or {}).get("results", [])
        images = []
        for item in results:
            urls = item.get("urls") or {}
            user = item.get("user") or {}
            images.append({
                "id": item.get("id"),
                "alt": item.get("alt_description") or query,
                "thumb": urls.get("thumb"),
                "full": urls.get("regular") or urls.get("full"),
                "credit": {
                    "name": user.get("name"),
                    "profile": user.get("links", {}).get("html"),
                    "unsplash": item.get("links", {}).get("html"),
                },
            })

        return Response({"images": images}, status=s.HTTP_200_OK)


# Saves food image to the DB
class SetFoodLogImage(APIView):
    permission_classes = [IsAuthenticated]

    # Gets query if exists
    def patch(self, request, pk):
        q = (request.data.get("q") or request.query_params.get("q") or "").strip()
        if not q:
            return Response({"detail": "Missing query 'q'."}, status=s.HTTP_400_BAD_REQUEST)

        # Gets current user's foodlog based on foodlog ID
        foodlog = get_object_or_404(FoodLog, pk=pk, user=request.user)

        # Values used to query unsplash
        url = "https://api.unsplash.com/search/photos"
        params = {"query": q, "per_page": 1, "orientation": "squarish"}
        headers = {
            "Accept-Version": "v1",
            "Authorization": f"Client-ID {settings.UNSPLASH_API_KEY}",
        }

        # Queries Unsplash for an image and required citation info
        try:
            r = requests.get(url, params=params, headers=headers, timeout=8)
        except requests.RequestException:
            return Response({"detail": "Failed to reach Unsplash."}, status=s.HTTP_502_BAD_GATEWAY)

        if r.status_code != 200:
            return Response({"detail": "Unsplash error.", "status": r.status_code},
                            status=s.HTTP_502_BAD_GATEWAY)

        # Makes the response readable
        data = r.json() or {}
        results = data.get("results", [])
        if not results:
            return Response({"detail": "No images found for that query."}, status=s.HTTP_404_NOT_FOUND)

        # Gets image urls from response
        first = results[0]
        urls = first.get("urls") or {}
        chosen_url = urls.get("regular") or urls.get("full") or urls.get("small")
        if not chosen_url:
            return Response({"detail": "No usable image URL returned."}, status=s.HTTP_502_BAD_GATEWAY)

        # Builds credit info for client-side crediting of images
        user = first.get("user") or {}
        credit = {
            "name": user.get("name"),
            "profile": f'{user.get("links", {}).get("html")}?utm_source={APP_UTM}&utm_medium=referral',
            "unsplash": f'{first.get("links", {}).get("html")}?utm_source={APP_UTM}&utm_medium=referral',
        }

        # Update the FoodLog
        foodlog.image_url = chosen_url
        foodlog.save()

        return Response(
            {
                "foodlog": FoodLogSerializer(foodlog).data,
                "credit": credit,
            },
            status=s.HTTP_200_OK,
        )