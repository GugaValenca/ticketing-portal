from django.contrib import admin
from .models import Ticket


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "status",
        "priority",
        "requester",
        "assignee",
        "created_at",
        "updated_at",
    )
    list_display_links = ("id", "title")
    list_filter = ("status", "priority", "created_at", "updated_at")
    search_fields = (
        "title",
        "description",
        "requester__username",
        "assignee__username",
    )
    autocomplete_fields = ("requester", "assignee")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)
    list_per_page = 20

    fieldsets = (
        ("Ticket Details", {
            "fields": ("title", "description")
        }),
        ("Workflow", {
            "fields": ("status", "priority")
        }),
        ("People", {
            "fields": ("requester", "assignee")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at")
        }),
    )