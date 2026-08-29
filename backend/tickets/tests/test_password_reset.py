from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.core.cache import cache
from django.test import TestCase
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient

from tickets.password_reset import PasswordResetRequestView

User = get_user_model()


class PasswordResetRequestTests(TestCase):
    def setUp(self):
        cache.clear()
        mail.outbox = []
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="resetuser", email="reset@example.com", password="Old-Str0ngPass!"
        )

    def test_known_email_receives_a_reset_link(self):
        response = self.client.post(
            "/api/password-reset/request/", {"email": "reset@example.com"}, format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("reset@example.com", mail.outbox[0].to)
        self.assertIn("reset-password?uid=", mail.outbox[0].body)

    def test_known_email_is_matched_case_insensitively(self):
        response = self.client.post(
            "/api/password-reset/request/", {"email": "RESET@EXAMPLE.COM"}, format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)

    def test_unknown_email_gets_the_same_response_and_sends_nothing(self):
        response = self.client.post(
            "/api/password-reset/request/", {"email": "nobody@example.com"}, format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), PasswordResetRequestView.GENERIC_RESPONSE)
        self.assertEqual(len(mail.outbox), 0)

    def test_is_rate_limited(self):
        limit = int(
            settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]["password_reset"].split("/")[0]
        )
        for _ in range(limit):
            response = self.client.post(
                "/api/password-reset/request/", {"email": "reset@example.com"}, format="json"
            )
            self.assertEqual(response.status_code, 200)

        response = self.client.post(
            "/api/password-reset/request/", {"email": "reset@example.com"}, format="json"
        )
        self.assertEqual(response.status_code, 429)


class PasswordResetConfirmTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="confirmuser", email="confirm@example.com", password="Old-Str0ngPass!"
        )

    def _valid_uid_and_token(self, user=None):
        user = user or self.user
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        return uid, token

    def test_valid_token_changes_the_password(self):
        uid, token = self._valid_uid_and_token()

        response = self.client.post(
            "/api/password-reset/confirm/",
            {"uid": uid, "token": token, "new_password": "Brand-New-Pass!9"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("Brand-New-Pass!9"))

    def test_token_cannot_be_reused(self):
        uid, token = self._valid_uid_and_token()
        self.client.post(
            "/api/password-reset/confirm/",
            {"uid": uid, "token": token, "new_password": "Brand-New-Pass!9"},
            format="json",
        )

        response = self.client.post(
            "/api/password-reset/confirm/",
            {"uid": uid, "token": token, "new_password": "Another-New-Pass!1"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_garbage_token_is_rejected(self):
        uid, _ = self._valid_uid_and_token()

        response = self.client.post(
            "/api/password-reset/confirm/",
            {"uid": uid, "token": "not-a-real-token", "new_password": "Brand-New-Pass!9"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_garbage_uid_is_rejected(self):
        _, token = self._valid_uid_and_token()

        response = self.client.post(
            "/api/password-reset/confirm/",
            {"uid": "not-a-real-uid", "token": token, "new_password": "Brand-New-Pass!9"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_weak_new_password_is_rejected(self):
        uid, token = self._valid_uid_and_token()

        response = self.client.post(
            "/api/password-reset/confirm/",
            {"uid": uid, "token": token, "new_password": "123"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("Old-Str0ngPass!"))

    def test_reset_revokes_existing_refresh_tokens(self):
        client = APIClient()
        client.get("/api/csrf/")
        csrf_token = client.cookies["csrftoken"].value
        client.post(
            "/api/token/",
            {"username": "confirmuser", "password": "Old-Str0ngPass!"},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        uid, token = self._valid_uid_and_token()
        self.client.post(
            "/api/password-reset/confirm/",
            {"uid": uid, "token": token, "new_password": "Brand-New-Pass!9"},
            format="json",
        )

        response = client.post("/api/token/refresh/", HTTP_X_CSRFTOKEN=csrf_token)
        self.assertEqual(response.status_code, 401)
