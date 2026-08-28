from rest_framework import serializers
from django.contrib.auth import get_user_model
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
    assignee_username = serializers.CharField(source="assignee.username", read_only=True, allow_null=True, default=None)
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
        read_only_fields = ["id", "created_at", "updated_at", "requester_username", "assignee_username"]
