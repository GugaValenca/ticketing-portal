import datetime

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

User = get_user_model()


class LoginTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="loginuser", email="login@example.com", password="Str0ngPass!23"
        )

    def test_login_with_username_sets_httponly_cookies(self):
        response = self.client.post(
            "/api/token/",
            {"username": "loginuser", "password": "Str0ngPass!23"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        # Tokens must never be reachable from page JavaScript.
        for cookie_name in (settings.AUTH_COOKIE_ACCESS, settings.AUTH_COOKIE_REFRESH):
            self.assertIn(cookie_name, response.cookies)
            self.assertTrue(response.cookies[cookie_name]["httponly"])

    def test_login_response_body_does_not_leak_raw_tokens(self):
        response = self.client.post(
            "/api/token/",
            {"username": "loginuser", "password": "Str0ngPass!23"},
            format="json",
        )

        self.assertNotIn("access", response.json())
        self.assertNotIn("refresh", response.json())

    def test_login_with_email_is_case_insensitive(self):
        response = self.client.post(
            "/api/token/",
            {"username": "LOGIN@example.com", "password": "Str0ngPass!23"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)

    def test_login_with_wrong_password_is_rejected(self):
        response = self.client.post(
            "/api/token/",
            {"username": "loginuser", "password": "wrong-password"},
            format="json",
        )

        self.assertEqual(response.status_code, 401)

    def test_login_is_rate_limited_after_repeated_attempts(self):
        limit = int(settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]["login"].split("/")[0])
        payload = {"username": "loginuser", "password": "wrong-password"}

        for _ in range(limit):
            response = self.client.post("/api/token/", payload, format="json")
            self.assertEqual(response.status_code, 401)

        response = self.client.post("/api/token/", payload, format="json")
        self.assertEqual(response.status_code, 429)


class RememberMeTests(TestCase):
    """'Remember me' controls whether the auth cookies survive a browser
    restart (persistent, Max-Age set) or not (session cookie, no Max-Age)."""

    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = User.objects.create_user(username="rememberuser", password="Str0ngPass!23")

    def test_default_login_is_persistent(self):
        response = self.client.post(
            "/api/token/",
            {"username": "rememberuser", "password": "Str0ngPass!23"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.cookies[settings.AUTH_COOKIE_REFRESH]["max-age"], "")

    def test_remember_me_false_sets_a_session_cookie(self):
        response = self.client.post(
            "/api/token/",
            {"username": "rememberuser", "password": "Str0ngPass!23", "remember_me": False},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        for cookie_name in (settings.AUTH_COOKIE_ACCESS, settings.AUTH_COOKIE_REFRESH):
            self.assertEqual(response.cookies[cookie_name]["max-age"], "")

    def test_remember_me_true_sets_a_persistent_cookie(self):
        response = self.client.post(
            "/api/token/",
            {"username": "rememberuser", "password": "Str0ngPass!23", "remember_me": True},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        for cookie_name in (settings.AUTH_COOKIE_ACCESS, settings.AUTH_COOKIE_REFRESH):
            self.assertNotEqual(response.cookies[cookie_name]["max-age"], "")

    def test_refresh_preserves_the_original_remember_me_choice(self):
        self.client.post(
            "/api/csrf/",
        )
        csrf_token = self.client.cookies["csrftoken"].value
        self.client.post(
            "/api/token/",
            {"username": "rememberuser", "password": "Str0ngPass!23", "remember_me": False},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        response = self.client.post("/api/token/refresh/", HTTP_X_CSRFTOKEN=csrf_token)

        self.assertEqual(response.status_code, 200)
        for cookie_name in (settings.AUTH_COOKIE_ACCESS, settings.AUTH_COOKIE_REFRESH):
            self.assertEqual(response.cookies[cookie_name]["max-age"], "")


class CookieSessionTests(TestCase):
    """Covers the full cookie lifecycle: authenticated requests, CSRF
    enforcement, refresh rotation, and logout."""

    def setUp(self):
        cache.clear()
        self.client = APIClient(enforce_csrf_checks=True)
        self.user = User.objects.create_user(username="cookieuser", password="Str0ngPass!23")

    def _login(self):
        self.client.get("/api/csrf/")
        csrf_token = self.client.cookies["csrftoken"].value
        self.client.post(
            "/api/token/",
            {"username": "cookieuser", "password": "Str0ngPass!23"},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        return csrf_token

    def test_me_endpoint_works_with_cookie_only(self):
        self._login()
        response = self.client.get("/api/me/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["username"], "cookieuser")

    def test_me_endpoint_rejects_no_cookie(self):
        response = self.client.get("/api/me/")
        self.assertEqual(response.status_code, 401)

    def test_write_request_without_csrf_header_is_rejected(self):
        self._login()

        response = self.client.post("/api/tickets/", {"title": "No CSRF header"}, format="json")

        self.assertEqual(response.status_code, 403)

    def test_write_request_with_csrf_header_succeeds(self):
        csrf_token = self._login()

        response = self.client.post(
            "/api/tickets/",
            {"title": "Has CSRF header"},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 201)

    def test_header_based_auth_does_not_require_csrf(self):
        # Simulates a non-browser API client (e.g. Swagger "Authorize",
        # a script) using the Authorization header instead of cookies -
        # CSRF only protects the ambient authority a cookie carries.
        access_token = str(RefreshToken.for_user(self.user).access_token)

        response = self.client.post(
            "/api/tickets/",
            {"title": "Header auth, no CSRF"},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {access_token}",
        )

        self.assertEqual(response.status_code, 201)

    def test_refresh_rotates_the_access_cookie(self):
        csrf_token = self._login()
        old_access = self.client.cookies[settings.AUTH_COOKIE_ACCESS].value

        response = self.client.post("/api/token/refresh/", HTTP_X_CSRFTOKEN=csrf_token)

        self.assertEqual(response.status_code, 200)
        new_access = self.client.cookies[settings.AUTH_COOKIE_ACCESS].value
        self.assertNotEqual(old_access, new_access)

    def test_refresh_without_cookie_is_rejected(self):
        self.client.get("/api/csrf/")
        csrf_token = self.client.cookies["csrftoken"].value

        response = self.client.post("/api/token/refresh/", HTTP_X_CSRFTOKEN=csrf_token)
        self.assertEqual(response.status_code, 401)

    def test_refresh_without_csrf_token_is_rejected(self):
        response = self.client.post("/api/token/refresh/")
        self.assertEqual(response.status_code, 403)

    def test_refresh_still_works_after_the_access_cookie_expires(self):
        # The whole point of this endpoint: an already-expired access
        # token must not block renewing it.
        csrf_token = self._login()
        expired_access = AccessToken.for_user(self.user)
        expired_access.set_exp(lifetime=datetime.timedelta(seconds=-10))
        self.client.cookies[settings.AUTH_COOKIE_ACCESS] = str(expired_access)

        response = self.client.post("/api/token/refresh/", HTTP_X_CSRFTOKEN=csrf_token)
        self.assertEqual(response.status_code, 200)

    def test_logout_clears_cookies_and_ends_the_session(self):
        csrf_token = self._login()

        response = self.client.post("/api/logout/", HTTP_X_CSRFTOKEN=csrf_token)
        self.assertEqual(response.status_code, 200)

        me_response = self.client.get("/api/me/")
        self.assertEqual(me_response.status_code, 401)

    def test_logout_blacklists_the_refresh_token(self):
        csrf_token = self._login()
        self.client.post("/api/logout/", HTTP_X_CSRFTOKEN=csrf_token)

        # The refresh cookie itself isn't cleared client-side by this
        # assertion (delete_cookie doesn't remove it from the test
        # client's jar), so refreshing again must still fail server-side
        # because the token was blacklisted.
        response = self.client.post("/api/token/refresh/", HTTP_X_CSRFTOKEN=csrf_token)
        self.assertEqual(response.status_code, 401)
