from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Ticket

User = get_user_model()


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class TicketSerializer(serializers.ModelSerializer):
    # Mirrors the frontend's minimum-length check - the client-side check
    # is a UX nicety, this is the actual enforcement.
    title = serializers.CharField(max_length=140, min_length=3)
    requester_username = serializers.CharField(source="requester.username", read_only=True)
    assignee_username = serializers.CharField(
        source="assignee.username", read_only=True, allow_null=True, default=None
    )
    assignee = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Ticket
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "assignee",
            "requester_username",
            "assignee_username",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "requester_username",
            "assignee_username",
        ]

    def validate(self, attrs):
        # A requester may set priority/assignee while filing a new ticket
        # (self.instance is None), but once a ticket exists, only staff
        # can change who it's assigned to or how urgent it is - everyone
        # else can only update its status.
        request = self.context.get("request")
        user = getattr(request, "user", None)
        is_staff = bool(user and (user.is_staff or user.is_superuser))

        if self.instance is not None and not is_staff:
            if "priority" in attrs:
                raise serializers.ValidationError(
                    {"priority": "Only staff can change ticket priority."}
                )
            if "assignee" in attrs:
                raise serializers.ValidationError({"assignee": "Only staff can reassign tickets."})

        return attrs
