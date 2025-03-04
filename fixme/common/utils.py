"""This module houses common miscellaneous utils."""

import json

import requests
from django.contrib.postgres.search import SearchVector




def validate_post_data(request, required_fields):
    """Validate POST fields against a list of required fields."""
    try:
        request_data = json.loads(request.body)
        if "user_id" in required_fields:
            request_data["user_id"] = request.token["sub"]
    except json.JSONDecodeError:
        return False, {}, {"data": {}, "message": "Please provide valid JSON."}

    missing_fields = {}
    for field in required_fields:
        if field not in request_data:
            missing_fields[field] = "This field is required."

    return (
        len(missing_fields) == 0,
        request_data,
        {"data": missing_fields, "message": ""},
    )
