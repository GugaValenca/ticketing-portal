from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

User = get_user_model()


class LoginThrottleTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        User.objects.create_user(username="throttleuser", password="Str0ngPass!23")

    def test_login_is_rate_limited_after_repeated_attempts(self):
        # Exercises the real "login" scope rate from settings.py (5/min)
        # rather than overriding it, since DRF's throttle cache is only
        # reliably reset between processes, not between overridden values
        # within a single test run.
        limit = int(settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]["login"].split("/")[0])
        payload = {"username": "throttleuser", "password": "wrong-password"}

        for _ in range(limit):
            response = self.client.post("/api/token/", payload, format="json")
            self.assertEqual(response.status_code, 401)

        response = self.client.post("/api/token/", payload, format="json")
        self.assertEqual(response.status_code, 429)
