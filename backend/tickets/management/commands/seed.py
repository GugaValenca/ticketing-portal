import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from tickets.models import Ticket

User = get_user_model()


class Command(BaseCommand):
    help = "Seed demo data: users + tickets"

    @staticmethod
    def ensure_user(
        *,
        username: str,
        email: str,
        password: str,
        is_staff: bool = False,
        is_superuser: bool = False,
    ):
        user, _ = User.objects.get_or_create(username=username)
        user.email = email
        user.is_staff = is_staff
        user.is_superuser = is_superuser
        user.set_password(password)
        user.save()
        return user

    def handle(self, *args, **options):
        # 1) Users
        admin = self.ensure_user(
            username="admin",
            email="admin@example.com",
            password="Admin@12345",
            is_staff=True,
            is_superuser=True,
        )
        lais = self.ensure_user(
            username="LaisLany",
            email="lais@example.com",
            password="Lais@12345",
        )
        guga = self.ensure_user(
            username="GugaTampa",
            email="gustavo_valenca@hotmail.com",
            password="@Tampa5000",
            is_staff=True,
            is_superuser=True,
        )

        self.stdout.write(self.style.SUCCESS("Users ensured: admin / LaisLany / GugaTampa"))

        # 2) Tickets
        titles = [
            "Fiber outage in Vila Nova district",
            "High latency on GPON segment",
            "Packet loss affecting business clients",
            "ONT offline after power fluctuations",
            "PPP authentication failures on edge router",
            "Intermittent internet drop in residential area",
        ]
        descriptions = [
            "Customers report complete internet outage. Validate OLT health and feeder signal levels.",
            "Average ping above SLA threshold during peak hours. Check congestion and QoS policies.",
            "Multiple clients report unstable video calls. Investigate uplink errors and route flaps.",
            "Device is unreachable from ACS. Confirm signal, reboot remotely, and schedule technician if needed.",
            "New sessions are failing with invalid credentials. Review RADIUS logs and recent config changes.",
            "Service drops every few minutes in one neighborhood. Inspect splitter path and distribution box.",
        ]

        priorities = [Ticket.Priority.LOW, Ticket.Priority.MEDIUM, Ticket.Priority.HIGH, Ticket.Priority.URGENT]
        statuses = [Ticket.Status.OPEN, Ticket.Status.IN_PROGRESS, Ticket.Status.RESOLVED]

        created_count = 0
        for i in range(12):
            t, created = Ticket.objects.get_or_create(
                title=f"{random.choice(titles)} #{i+1}",
                requester=random.choice([admin, lais, guga]),
                defaults={
                    "description": random.choice(descriptions),
                    "priority": random.choice(priorities),
                    "status": random.choice(statuses),
                    "assignee": random.choice([None, admin, lais, guga]),
                },
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Tickets created: {created_count}"))
        self.stdout.write(self.style.SUCCESS("Done. (Passwords: Admin@12345 / Lais@12345 / @Tampa5000)"))
