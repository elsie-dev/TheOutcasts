"""Middleware for role-based access control."""

import os
import jwt
from functools import wraps
from django.http import JsonResponse


def require_roles(required_roles):
    """Decorator to enforce role-based access control."""

    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            token = request.headers.get("Authorization")
            if not token:
                return JsonResponse({"error": "Unauthorized."}, status=401)

            try:
                decoded = jwt.decode(
                    token.split(" ")[1],
                    os.environ["JWT_PUBLIC_KEY"],
                    algorithms=["RS256"],
                )
            except jwt.DecodeError:
                return JsonResponse({"error": "Invalid token."}, status=401)

            user_roles = decoded.get("roles", [])
            if not any(role in user_roles for role in required_roles):
                return JsonResponse({"error": "Forbidden."}, status=403)

            request.user = decoded["sub"]
            return view_func(request, *args, **kwargs)

        return wrapper

    return decorator
