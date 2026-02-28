from django.db.models import Q
from rest_framework import viewsets
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Ticket
from .permissions import IsRequesterOrAssigneeOrStaff
from .serializers import TicketSerializer, UserSummarySerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated, IsRequesterOrAssigneeOrStaff]

    def get_queryset(self):
        user = self.request.user
        queryset = Ticket.objects.select_related("requester", "assignee")

        if user.is_staff or user.is_superuser:
            return queryset.order_by("-created_at")

        return queryset.filter(Q(requester=user) | Q(assignee=user)).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)


class UserListView(generics.ListAPIView):
    serializer_class = UserSummarySerializer
    permission_classes = [IsAuthenticated]
    queryset = User.objects.order_by("username")
