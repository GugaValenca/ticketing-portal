import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    """Creates a single deterministic user for automated e2e tests to log
    in with. Only ever run against a disposable e2e database
    (SQLITE_DB_NAME=e2e.sqlite3), never a real one - the credentials are
    fixed and predictable on purpose."""

    help = "Seed a deterministic user for e2e tests."

    def handle(self, *args, **options):
        username = os.getenv("E2E_USERNAME", "e2e_user")
        password = os.getenv("E2E_PASSWORD", "E2E-test-password-1")

        user, _ = User.objects.get_or_create(
            username=username, defaults={"email": "e2e@example.com"}
        )
        user.set_password(password)
        user.save()

        self.stdout.write(self.style.SUCCESS(f"e2e user ready: {username}"))
