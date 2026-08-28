"""Settings used by `manage.py test` / CI.

Same as config.settings, except password hashing uses a fast (insecure)
hasher - the real hashers are deliberately slow, and the test suite creates
a lot of users. Never point this at anything but a throwaway test database.
"""

from .settings import *  # noqa: F401,F403

PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
