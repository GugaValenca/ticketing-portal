from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from tickets.auth import (
    CookieTokenRefreshView,
    LogoutView,
    UsernameOrEmailTokenObtainPairView,
    csrf_view,
)
from tickets.password_reset import PasswordResetConfirmView, PasswordResetRequestView

# Admin branding (professional)
admin.site.site_header = "Admin Control Center"
admin.site.site_title = "Admin Control Center"
admin.site.index_title = "Platform Administration"


def root_status(_request):
    return JsonResponse(
        {
            "status": "ok",
            "service": "ticketing-portal-api",
            "docs": "/api/docs/",
            "schema": "/api/schema/",
        }
    )


urlpatterns = [
    path("", root_status, name="root_status"),
    path("admin/", admin.site.urls),
    # OpenAPI schema + Swagger UI
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/token/", UsernameOrEmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("api/logout/", LogoutView.as_view(), name="logout"),
    path("api/csrf/", csrf_view, name="csrf"),
    path(
        "api/password-reset/request/",
        PasswordResetRequestView.as_view(),
        name="password_reset_request",
    ),
    path(
        "api/password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    # App APIs
    path("api/", include("tickets.urls")),
]
