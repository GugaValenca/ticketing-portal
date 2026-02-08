from django.conf import settings
from django.db import models


class Ticket(models.Model):
    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        URGENT = "urgent", "Urgent"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_PROGRESS = "in_progress", "In Progress"
        RESOLVED = "resolved", "Resolved"
        CLOSED = "closed", "Closed"

    title = models.CharField(max_length=140)
    description = models.TextField(blank=True)

    priority = models.CharField(
        max_length=20, choices=Priority.choices, default=Priority.MEDIUM
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)

    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="requested_tickets",
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="assigned_tickets",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"#{self.id} {self.title}"
