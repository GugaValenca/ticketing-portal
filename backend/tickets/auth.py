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
    response: Response, *, access: str | None = None, refresh: str | None = None
) -> None:
    if access is not None:
        response.set_cookie(
            settings.AUTH_COOKIE_ACCESS,
            access,
            max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
            **_cookie_kwargs(),
        )
    if refresh is not None:
        response.set_cookie(
            settings.AUTH_COOKIE_REFRESH,
            refresh,
            max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
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


class UsernameOrEmailTokenObtainPairView(TokenObtainPairView):
    """Logs a user in and sets the access/refresh tokens as httpOnly cookies."""

    serializer_class = UsernameOrEmailTokenObtainPairSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tokens = serializer.validated_data

        response = Response({"detail": "Login successful."})
        set_auth_cookies(response, access=str(tokens["access"]), refresh=str(tokens["refresh"]))
        return response


class CookieTokenRefreshView(APIView):
    """Reads the refresh token from its cookie and rotates both cookies."""

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "token_refresh"

    def post(self, request, *args, **kwargs):
        raw_refresh = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
        if not raw_refresh:
            raise InvalidToken("No refresh token cookie found.")

        serializer = TokenRefreshSerializer(data={"refresh": raw_refresh})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as exc:
            raise InvalidToken(exc.args[0]) from exc

        data = serializer.validated_data
        response = Response({"detail": "Token refreshed."})
        set_auth_cookies(
            response,
            access=str(data["access"]),
            refresh=str(data.get("refresh", raw_refresh)),
        )
        return response


class LogoutView(APIView):
    """Blacklists the current refresh token and clears both auth cookies."""

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
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
