"""This module houses API endpoints for the authentication app."""

import os

from django.db import IntegrityError
import jwt
from datetime import timedelta
from django.contrib.auth import authenticate
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from fixme.common.utils import validate_post_data
from .models import User


@csrf_exempt
@require_POST
@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user."""
    required_fields = User.REQUIRED_FIELDS + ["password"]
    is_valid, data, errors = validate_post_data(request, required_fields)
    if not is_valid:
        return Response({"errors": errors}, status=400)

    try:
        user = User.objects.create_user(**data)
        return Response({"message": "User registered successfully."}, status=201)
    except IntegrityError as e:
        return Response({"error": str(e)}, status=400)


@csrf_exempt
@require_POST
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """Authenticate a user and return a JWT."""
    is_valid, data, errors = validate_post_data(request, ["email", "password"])
    if not is_valid:
        return Response({"errors": errors}, status=400)

    user = authenticate(email=data["email"], password=data["password"])
    if user:
        now = timezone.now()
        payload = {
            "sub": str(user.uuid),
            "iat": now.timestamp(),
            "exp": (now + timedelta(days=7)).timestamp(),  # 7 days validity
        }
        token = jwt.encode(payload, os.environ["JWT_PRIVATE_KEY"], algorithm="RS256")
        return Response({"token": token, "user": user.full_name()}, status=200)
    else:
        return Response({"error": "Invalid credentials."}, status=401)


from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User
from .serializers import UserSerializer


class UserViewSet(ModelViewSet):
    """
    CRUD operations for users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ["create"]:
            return [AllowAny()]
        return [IsAuthenticated()]
