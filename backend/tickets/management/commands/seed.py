import os
import random
import secrets
import string

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from tickets.models import Ticket

User = get_user_model()


def generate_password() -> str:
    alphabet = string.ascii_letters + string.digits + "!@#%^&*-_="
    return "".join(secrets.choice(alphabet) for _ in range(16))


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
        # Passwords can be pinned via env vars for repeatable local setups;
        # otherwise each run generates fresh random passwords and prints
        # them once so they are never hardcoded in source control.
        admin_password = os.getenv("SEED_ADMIN_PASSWORD") or generate_password()
        lais_password = os.getenv("SEED_LAIS_PASSWORD") or generate_password()
        demo_password = os.getenv("SEED_DEMO_PASSWORD") or generate_password()

        admin = self.ensure_user(
            username="admin",
            email="admin@example.com",
            password=admin_password,
            is_staff=True,
            is_superuser=True,
        )
        lais = self.ensure_user(
            username="LaisLany",
            email="lais@example.com",
            password=lais_password,
        )
        guga = self.ensure_user(
            username="demo_agent",
            email="demo_agent@example.com",
            password=demo_password,
            is_staff=True,
            is_superuser=True,
        )

        self.stdout.write(self.style.SUCCESS("Users ensured: admin / LaisLany / demo_agent"))
        self.stdout.write(
            self.style.WARNING(
                "Generated passwords (save them now, they are not stored anywhere):\n"
                f"  admin: {admin_password}\n"
                f"  LaisLany: {lais_password}\n"
                f"  demo_agent: {demo_password}"
            )
        )

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

        priorities = [
            Ticket.Priority.LOW,
            Ticket.Priority.MEDIUM,
            Ticket.Priority.HIGH,
            Ticket.Priority.URGENT,
        ]
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
        self.stdout.write(self.style.SUCCESS("Done."))
