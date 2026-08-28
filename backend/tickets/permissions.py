from rest_framework.permissions import BasePermission


class IsRequesterOrAssigneeOrStaff(BasePermission):
    """
    Grants access if:
    - the user is staff/superuser
    - OR the user is the ticket's requester
    - OR the user is the ticket's assignee
    """

    def has_object_permission(self, request, view, obj):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_staff or user.is_superuser:
            return True

        return obj.requester_id == user.id or obj.assignee_id == user.id
