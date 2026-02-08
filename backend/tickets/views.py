from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Ticket
from .serializers import TicketSerializer
from .permissions import IsRequesterOrAssigneeOrStaff


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated, IsRequesterOrAssigneeOrStaff]

    def get_queryset(self):
        user = self.request.user
        # staff/superuser vê tudo
        if user.is_staff or user.is_superuser:
            return Ticket.objects.all().order_by("-created_at")

        # usuário comum só vê:
        # - tickets que ele pediu (requester)
        # - tickets atribuídos a ele (assignee)
        return Ticket.objects.filter(
            Q(requester=user) | Q(assignee=user)
        ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)
