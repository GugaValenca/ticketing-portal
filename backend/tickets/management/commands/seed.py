import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from tickets.models import Ticket

User = get_user_model()


class Command(BaseCommand):
    help = "Seed demo data: users + tickets"

    def handle(self, *args, **options):
        # 1) Users
        admin, created = User.objects.get_or_create(
            username="admin",
            defaults={"email": "admin@example.com", "is_staff": True, "is_superuser": True},
        )
        if not admin.check_password("Admin@12345"):
            admin.set_password("Admin@12345")
            admin.save(update_fields=["password"])

        lais, created = User.objects.get_or_create(
            username="LaisLany",
            defaults={"email": "lais@example.com"},
        )
        if not lais.check_password("Lais@12345"):
            lais.set_password("Lais@12345")
            lais.save(update_fields=["password"])

        guga, created = User.objects.get_or_create(
            username="GugaTampa",
            defaults={"email": "guga@example.com"},
        )
        if not guga.check_password("Guga@12345"):
            guga.set_password("Guga@12345")
            guga.save(update_fields=["password"])

        self.stdout.write(self.style.SUCCESS("Users ensured: admin / LaisLany / GugaTampa"))

        # 2) Tickets
        titles = [
            "Login bug on Safari",
            "Payment webhook retries",
            "UI: button misaligned",
            "Email notifications delayed",
            "Database connection spike",
            "Add priority to dashboard",
        ]
        descriptions = [
            "Repro steps included. Happens intermittently.",
            "Investigate provider timeouts and implement backoff.",
            "Minor CSS issue but affects conversion.",
            "Queue seems slow; verify worker autoscaling.",
            "Likely connection pool sizing issue.",
            "PM request: show high priority tickets first.",
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
        self.stdout.write(self.style.SUCCESS("Done. (Passwords: Admin@12345 / Lais@12345 / Guga@12345)"))
