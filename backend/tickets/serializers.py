from rest_framework import serializers
from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    requester_username = serializers.CharField(source="requester.username", read_only=True)
    assignee_username = serializers.CharField(source="assignee.username", read_only=True, allow_null=True, default=None)


    class Meta:
        model = Ticket
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "requester_username",
            "assignee_username",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "requester_username", "assignee_username"]
