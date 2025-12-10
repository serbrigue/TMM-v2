import pytest
import threading
from django.db import connection
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from api.models import Cliente, Taller, Enrollment
from django.contrib.contenttypes.models import ContentType

@pytest.mark.django_db(transaction=True)
class TestConcurrency:
    def setup_method(self):
        # Taller with only 1 spot
        self.taller = Taller.objects.create(
            nombre="Taller Concurrente",
            precio=100,
            cupos_totales=10,
            cupos_disponibles=1, # CRITICAL
            fecha_taller="2025-12-25"
        )
        self.ct = ContentType.objects.get_for_model(self.taller)

    def attempt_enroll(self, username):
        """
        Helper to run in a thread.
        Each thread creates its own DB connection/cursor implicitly via Django logic.
        """
        try:
            user = User.objects.create_user(username=username, email=f'{username}@test.com')
            cliente = Cliente.objects.create(user=user, email=user.email)
            
            # We call the Service layer directly to test logic, 
            # as calling API via Client in threads is tricky with transaction isolation.
            from api.services import EnrollmentService
            
            # This service should handle atomic transaction and locking
            EnrollmentService.create_enrollment(user, 'taller', self.taller.id)
            return True
        except Exception as e:
            print(f"Thread {username} failed: {e}")
            return False
            
    # NOTE: Testing concurrency with SQLite is hard because of file locking.
    # This test might fail or serialize naturally on SQLite. 
    # It demonstrates the Logic Test pattern for Postgres.
    def test_race_condition_enrollment(self):
        """
        Try to over-enroll the last spot.
        """
        threads = []
        # 5 threads fighting for 1 spot
        for i in range(5):
            t = threading.Thread(target=self.attempt_enroll, args=(f'racer_{i}',))
            threads.append(t)
            
        for t in threads:
            t.start()
            
        for t in threads:
            t.join()
            
        # Verify db state
        self.taller.refresh_from_db()
        enrollment_count = Enrollment.objects.filter(
            content_type=self.ct, 
            object_id=self.taller.id
        ).count()
        
        # WE MUST NOT HAVE SOLD MORE THAN AVAILABLE
        assert self.taller.cupos_disponibles >= 0
        assert enrollment_count <= 2 # (Initial 1? No initial was 1 avail)
        # Original available = 1.
        # So we should have exactly 1 enrollment (or 0 if all failed).
        # We start with 10 total, 1 avail -> implies 9 sold?
        # Setup says cupos_totales=10, cupos_disponibles=1.
        # This means 9 "virtual" sold or just config.
        # If we sell 1, avail becomes 0.
        
        assert self.taller.cupos_disponibles == 0
        # If concurrency failed, we might see -1 or multiple enrollments
        assert enrollment_count <= 1
