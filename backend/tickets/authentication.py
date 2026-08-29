"""Cookie-based JWT authentication.

Kept separate from tickets/auth.py (which defines the login/refresh/logout
views) because REST_FRAMEWORK.DEFAULT_AUTHENTICATION_CLASSES is resolved
very early during DRF's own startup, before rest_framework.views has
finished importing. Anything reachable from that setting must not import
rest_framework.views (directly or indirectly) or Django hits a circular
import.
"""

from django.conf import settings
from rest_framework import exceptions
from rest_framework.authentication import CSRFCheck
from rest_framework_simplejwt.authentication import JWTAuthentication


def enforce_csrf(request) -> None:
    """Mirrors how DRF's SessionAuthentication protects cookie-carried
    credentials. Shared by CookieJWTAuthentication and by views (refresh,
    logout) that read the refresh_token cookie directly without going
    through it - see tickets/auth.py for why those can't rely on the
    authentication class here."""
    check = CSRFCheck(lambda r: None)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise exceptions.PermissionDenied(f"CSRF Failed: {reason}")


class NoOpAuthentication:
    """Never authenticates anyone - used on views (refresh, logout) that
    read the refresh_token cookie directly instead of going through the
    normal authentication pipeline (see tickets/auth.py for why).

    Its only job is to give DRF something to call `authenticate_header()`
    on: without any authentication_classes at all, DRF has no way to know
    whether a failure should be reported as 401 (no/bad credentials) or
    403 (authenticated but not allowed), and defaults to 403 for both.
    """

    def authenticate(self, request):
        return None

    def authenticate_header(self, request):
        return "Bearer"


class CookieJWTAuthentication(JWTAuthentication):
    """Authenticates from the Authorization header when present (API
    clients, Swagger), otherwise falls back to the access token cookie.
    Cookie-based auth additionally enforces CSRF, mirroring how DRF's
    SessionAuthentication protects cookie-carried credentials."""

    def authenticate(self, request):
        header = self.get_header(request)
        raw_token = self.get_raw_token(header) if header is not None else None
        from_cookie = False

        if raw_token is None:
            raw_token = request.COOKIES.get(settings.AUTH_COOKIE_ACCESS)
            from_cookie = raw_token is not None

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)

        if from_cookie:
            enforce_csrf(request)

        return self.get_user(validated_token), validated_token
