from .settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'test_db.sqlite3',
    }
}

# Use console backend for emails during tests to avoid SMTP errors
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
