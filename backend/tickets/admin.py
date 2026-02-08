from django.contrib import admin

from .models import Ticket


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "status", "priority", "requester", "assignee", "created_at")
    list_filter = ("status", "priority", "created_at")
    search_fields = ("title", "description", "requester__username", "assignee__username")
    ordering = ("-created_at",)
