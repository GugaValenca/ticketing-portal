from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .authentication import NoOpAuthentication, enforce_csrf

# CookieJWTAuthentication lives in tickets/authentication.py, not here -
# see that module's docstring for why.


User = get_user_model()


def _cookie_kwargs() -> dict:
    return {
        "httponly": True,
        "secure": settings.AUTH_COOKIE_SECURE,
        "samesite": settings.AUTH_COOKIE_SAMESITE,
        "path": "/",
    }


def set_auth_cookies(
    response: Response,
    *,
    access: str | None = None,
    refresh: str | None = None,
    persistent: bool = True,
) -> None:
    """`persistent=False` sets a browser-session cookie (no Max-Age/Expires,
    so it's dropped when the browser closes) - the "Remember me" unchecked
    case. `persistent=True` keeps the cookie for the token's full lifetime,
    surviving a browser restart."""
    if access is not None:
        response.set_cookie(
            settings.AUTH_COOKIE_ACCESS,
            access,
            max_age=(
                int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds())
                if persistent
                else None
            ),
            **_cookie_kwargs(),
        )
    if refresh is not None:
        response.set_cookie(
            settings.AUTH_COOKIE_REFRESH,
            refresh,
            max_age=(
                int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds())
                if persistent
                else None
            ),
            **_cookie_kwargs(),
        )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(settings.AUTH_COOKIE_ACCESS, path="/")
    response.delete_cookie(settings.AUTH_COOKIE_REFRESH, path="/")


class UsernameOrEmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get("username", "").strip()
        if "@" in username:
            try:
                user = User.objects.get(email__iexact=username)
                attrs["username"] = user.get_username()
            except User.DoesNotExist:
                pass
        return super().validate(attrs)

    def get_token(self, user):
        # Embed the "remember me" choice as a token claim (not just an
        # in-memory flag) so a later refresh - which reuses this same
        # refresh token's payload, see ROTATE_REFRESH_TOKENS - still knows
        # whether the session should stay a persistent or browser-session
        # cookie. self.initial_data is the raw login payload.
        token = super().get_token(user)
        token["remember_me"] = bool(self.initial_data.get("remember_me", True))
        return token


class UsernameOrEmailTokenObtainPairView(TokenObtainPairView):
    """Logs a user in and sets the access/refresh tokens as httpOnly cookies."""

    serializer_class = UsernameOrEmailTokenObtainPairSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tokens = serializer.validated_data
        remember_me = bool(request.data.get("remember_me", True))

        response = Response({"detail": "Login successful."})
        set_auth_cookies(
            response,
            access=str(tokens["access"]),
            refresh=str(tokens["refresh"]),
            persistent=remember_me,
        )
        return response


class CookieTokenRefreshView(APIView):
    """Reads the refresh token from its cookie and rotates both cookies.

    Deliberately doesn't use the default CookieJWTAuthentication: it would
    try to validate the *access* token cookie before this view even runs -
    but the whole point of calling refresh is that the access token has
    usually just expired, so that would reject the one request meant to
    fix that. CSRF protection for the refresh_token cookie is enforced
    explicitly below instead.
    """

    authentication_classes = [NoOpAuthentication]
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "token_refresh"

    def post(self, request, *args, **kwargs):
        enforce_csrf(request)

        raw_refresh = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
        if not raw_refresh:
            raise InvalidToken("No refresh token cookie found.")

        serializer = TokenRefreshSerializer(data={"refresh": raw_refresh})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as exc:
            raise InvalidToken(exc.args[0]) from exc

        data = serializer.validated_data
        new_refresh = data.get("refresh", raw_refresh)
        # Rotation reuses the same token payload (just refreshing jti/exp/
        # iat), so the "remember me" claim set at login survives here.
        remember_me = bool(RefreshToken(new_refresh).get("remember_me", True))

        response = Response({"detail": "Token refreshed."})
        set_auth_cookies(
            response,
            access=str(data["access"]),
            refresh=str(new_refresh),
            persistent=remember_me,
        )
        return response


class LogoutView(APIView):
    """Blacklists the current refresh token and clears both auth cookies.

    Same reasoning as CookieTokenRefreshView: an already-expired access
    token cookie can't block logging out. CSRF is still enforced
    explicitly.
    """

    authentication_classes = [NoOpAuthentication]
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        enforce_csrf(request)

        raw_refresh = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
        if raw_refresh:
            try:
                RefreshToken(raw_refresh).blacklist()
            except TokenError:
                pass

        response = Response({"detail": "Logged out."})
        clear_auth_cookies(response)
        return response


@ensure_csrf_cookie
def csrf_view(request):
    """Seeds the csrftoken cookie so the frontend can read and send it back
    as the X-CSRFToken header on state-changing requests."""
    return JsonResponse({"detail": "CSRF cookie set."})
