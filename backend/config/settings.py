

import os
from datetime import timedelta
from pathlib import Path
from urllib.parse import urlparse


BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: list[str] | None = None) -> list[str]:
    raw = os.getenv(name)
    if not raw:
        return default or []
    return [item.strip() for item in raw.split(",") if item.strip()]


# SECURITY WARNING: keep the secret key used in production secret!
# This fallback is for local development only. Production must set
# DJANGO_SECRET_KEY as an environment variable (see README).
SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-local-dev-only-do-not-use-in-production",
)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env_bool("DEBUG", default=False)

ALLOWED_HOSTS = env_list(
    "ALLOWED_HOSTS",
    default=[
        "127.0.0.1",
        "localhost",
        ".vercel.app",
    ],
)


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
        # Third-party
    "rest_framework",
    "corsheaders",
    "drf_spectacular",
    "tickets",
    "rest_framework_simplejwt.token_blacklist",



]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    parsed = urlparse(DATABASE_URL)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": parsed.path.lstrip("/"),
            "USER": parsed.username,
            "PASSWORD": parsed.password,
            "HOST": parsed.hostname,
            "PORT": parsed.port or "5432",
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }



# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# -----------------------------------------------------------------------------
# Default primary key field type
# -----------------------------------------------------------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# -----------------------------------------------------------------------------
# CORS (React dev server / Vite)
# -----------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = env_list(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ticketing-portal-web.vercel.app",
    ],
)

CSRF_TRUSTED_ORIGINS = env_list(
    "CSRF_TRUSTED_ORIGINS",
    default=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
)

# Required for the browser to send/receive the httpOnly JWT cookies below
# on cross-origin requests (frontend and backend live on separate hosts).
CORS_ALLOW_CREDENTIALS = True


# -----------------------------------------------------------------------------
# DRF + JWT + Swagger
# -----------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        # Points at tickets.authentication (not tickets.auth) - this
        # module must stay free of any import that touches
        # rest_framework.views, or DRF's own startup hits a circular
        # import (see tickets/authentication.py docstring).
        "tickets.authentication.CookieJWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {
        "anon": "60/hour",
        "user": "1000/hour",
        # Tighter, dedicated limits for the auth endpoints (see
        # tickets/auth.py), which are the most valuable brute-force target.
        "login": "5/min",
        "token_refresh": "20/min",
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

# -----------------------------------------------------------------------------
# JWT auth cookies
# -----------------------------------------------------------------------------
# Access and refresh tokens are delivered as httpOnly cookies instead of in
# the JSON response body, so they're never reachable from page JavaScript
# (mitigates token theft via XSS). State-changing requests are protected by
# Django's CSRF token instead (see tickets/authentication.py CookieJWTAuthentication).
#
# The frontend and backend are deployed on separate Vercel subdomains, which
# browsers treat as different sites, so production cookies need
# SameSite=None (which in turn requires Secure). Local dev runs both on
# "localhost" (different ports only), which is same-site, so Lax + non-Secure
# works over plain HTTP.
AUTH_COOKIE_ACCESS = "access_token"
AUTH_COOKIE_REFRESH = "refresh_token"
AUTH_COOKIE_SECURE = env_bool("AUTH_COOKIE_SECURE", default=not DEBUG)
AUTH_COOKIE_SAMESITE = os.getenv("AUTH_COOKIE_SAMESITE", "None" if not DEBUG else "Lax")

CSRF_COOKIE_SECURE = AUTH_COOKIE_SECURE
CSRF_COOKIE_SAMESITE = AUTH_COOKIE_SAMESITE
SESSION_COOKIE_SECURE = AUTH_COOKIE_SECURE


SPECTACULAR_SETTINGS = {
    "TITLE": "Ticketing Portal API",
    "DESCRIPTION": "API for Ticketing Portal (Django + DRF + JWT).",
    "VERSION": "1.0.0",
}

