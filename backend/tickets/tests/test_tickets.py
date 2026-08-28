from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from tickets.models import Ticket

User = get_user_model()


class TicketAccessTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff = User.objects.create_user(username="staff", password="pw", is_staff=True)
        self.alice = User.objects.create_user(username="alice", password="pw")
        self.bob = User.objects.create_user(username="bob", password="pw")

        self.alice_ticket = Ticket.objects.create(title="Alice's outage", requester=self.alice)
        self.bob_ticket = Ticket.objects.create(title="Bob's outage", requester=self.bob)
        self.assigned_to_alice = Ticket.objects.create(
            title="Assigned to Alice", requester=self.bob, assignee=self.alice
        )

    def test_anonymous_request_is_rejected(self):
        response = self.client.get("/api/tickets/")
        self.assertEqual(response.status_code, 401)

    def test_staff_sees_every_ticket(self):
        self.client.force_authenticate(self.staff)
        response = self.client.get("/api/tickets/")

        ids = {t["id"] for t in response.json()}
        self.assertEqual(ids, {self.alice_ticket.id, self.bob_ticket.id, self.assigned_to_alice.id})

    def test_regular_user_sees_only_own_and_assigned_tickets(self):
        self.client.force_authenticate(self.alice)
        response = self.client.get("/api/tickets/")

        ids = {t["id"] for t in response.json()}
        self.assertEqual(ids, {self.alice_ticket.id, self.assigned_to_alice.id})

    def test_user_cannot_retrieve_a_ticket_that_is_not_theirs(self):
        self.client.force_authenticate(self.alice)
        response = self.client.get(f"/api/tickets/{self.bob_ticket.id}/")

        # Not 403: the ticket is simply outside this user's queryset, so it
        # looks the same as it not existing (no information disclosure).
        self.assertEqual(response.status_code, 404)

    def test_user_can_update_their_own_ticket(self):
        self.client.force_authenticate(self.alice)
        response = self.client.patch(
            f"/api/tickets/{self.alice_ticket.id}/", {"status": "in_progress"}, format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.alice_ticket.refresh_from_db()
        self.assertEqual(self.alice_ticket.status, "in_progress")


class TicketCreateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.alice = User.objects.create_user(username="alice", password="pw")
        self.bob = User.objects.create_user(username="bob", password="pw")
        self.client.force_authenticate(self.alice)

    def test_create_ticket_sets_requester_to_current_user(self):
        response = self.client.post(
            "/api/tickets/", {"title": "New fiber outage report"}, format="json"
        )

        self.assertEqual(response.status_code, 201)
        ticket = Ticket.objects.get(id=response.json()["id"])
        self.assertEqual(ticket.requester_id, self.alice.id)

    def test_create_ticket_ignores_client_supplied_requester(self):
        # requester isn't a writable field on the serializer at all, so
        # sending one should be silently ignored rather than accepted.
        response = self.client.post(
            "/api/tickets/",
            {"title": "Spoofed requester attempt", "requester": self.bob.id},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        ticket = Ticket.objects.get(id=response.json()["id"])
        self.assertEqual(ticket.requester_id, self.alice.id)

    def test_create_ticket_rejects_short_title(self):
        response = self.client.post("/api/tickets/", {"title": "Hi"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("title", response.json())

    def test_create_ticket_defaults_to_medium_priority_and_open_status(self):
        response = self.client.post(
            "/api/tickets/", {"title": "Untouched priority/status"}, format="json"
        )

        self.assertEqual(response.status_code, 201)
        body = response.json()
        self.assertEqual(body["priority"], "medium")
        self.assertEqual(body["status"], "open")


class MeEndpointTests(TestCase):
    def test_me_returns_current_user_fields(self):
        user = User.objects.create_user(
            username="carol", email="carol@example.com", password="pw", is_staff=True
        )
        client = APIClient()
        client.force_authenticate(user)

        response = client.get("/api/me/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "id": user.id,
                "username": "carol",
                "email": "carol@example.com",
                "is_staff": True,
                "is_superuser": False,
            },
        )


class UserListTests(TestCase):
    def test_requires_authentication(self):
        response = APIClient().get("/api/users/")
        self.assertEqual(response.status_code, 401)

    def test_lists_users_for_assignee_selection(self):
        User.objects.create_user(username="dave", password="pw")
        user = User.objects.create_user(username="erin", password="pw")
        client = APIClient()
        client.force_authenticate(user)

        response = client.get("/api/users/")

        usernames = {u["username"] for u in response.json()}
        self.assertEqual(usernames, {"dave", "erin"})
