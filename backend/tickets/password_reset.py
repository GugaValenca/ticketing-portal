"""Forgot-password flow: request a reset link by email, then set a new
password with the uid+token from that link.

Uses Django's own PasswordResetTokenGenerator (the same one
django.contrib.auth's built-in reset views use) - the token embeds the
user's current password hash, so it's automatically invalidated the moment
the password is changed, and expires after PASSWORD_RESET_TIMEOUT (3 days
by default). Nothing custom to get wrong there.
"""

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

from .authentication import NoOpAuthentication

User = get_user_model()


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetRequestView(APIView):
    """Emails a reset link if the address matches an account. Always
    responds with the same generic message either way, so this can't be
    used to enumerate which emails have accounts."""

    authentication_classes = [NoOpAuthentication]
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset"

    GENERIC_RESPONSE = {
        "detail": "If an account exists for that email, a password reset link has been sent."
    }

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user is not None:
            self._send_reset_email(user)

        return Response(self.GENERIC_RESPONSE, status=status.HTTP_200_OK)

    def _send_reset_email(self, user) -> None:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

        send_mail(
            subject="Reset your NexaLink Telecom password",
            message=(
                f"Hi {user.username},\n\n"
                "Someone requested a password reset for this account. "
                f"If that was you, set a new password here:\n\n{reset_url}\n\n"
                "This link expires in 3 days. If you didn't request this, "
                "you can ignore this email - your password hasn't changed."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        try:
            user_pk = urlsafe_base64_decode(attrs["uid"]).decode()
            user = User.objects.get(pk=user_pk, is_active=True)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            raise serializers.ValidationError("Invalid or expired reset link.") from None

        if not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError("Invalid or expired reset link.")

        try:
            validate_password(attrs["new_password"], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"new_password": exc.messages}) from exc

        attrs["user"] = user
        return attrs


class PasswordResetConfirmView(APIView):
    """Sets a new password given a valid uid+token pair, then revokes every
    outstanding refresh token for that user - a password reset should end
    every existing session, not just future ones."""

    authentication_classes = [NoOpAuthentication]
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset"

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        user.set_password(serializer.validated_data["new_password"])
        user.save()
        self._revoke_existing_sessions(user)

        return Response({"detail": "Password updated. Please sign in again."})

    @staticmethod
    def _revoke_existing_sessions(user) -> None:
        for outstanding in OutstandingToken.objects.filter(user=user):
            BlacklistedToken.objects.get_or_create(token=outstanding)
