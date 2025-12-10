import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from api.models import Cliente, Taller, Enrollment, Orden
from django.contrib.contenttypes.models import ContentType

@pytest.mark.django_db
class TestStateMachine:
    def setup_method(self):
        self.user = User.objects.create_user(username='tester', email='test@test.com')
        self.cliente = Cliente.objects.create(user=self.user, email='test@test.com')
        self.taller = Taller.objects.create(
            nombre="Taller Estados", 
            precio=100, 
            cupos_totales=10, 
            cupos_disponibles=10,
            fecha_taller="2025-12-25"
        )
        self.ct = ContentType.objects.get_for_model(self.taller)

    def test_enrollment_cancellation_flow(self):
        """
        Verify: PENDIENTE -> ANULADO -> Release Cupo
        """
        # 1. Create Enrollment (PENDIENTE)
        enrollment = Enrollment.objects.create(
            cliente=self.cliente,
            content_type=self.ct,
            object_id=self.taller.id,
            estado_pago='PENDIENTE'
        )
        
        # Initial State: 10 available - 1 reserved (if logic subtracts on creation)
        # Assuming current logic: creation doesn't auto-subtract unless via Service.
        # Let's subtract manually to simulate 'sold' state
        self.taller.cupos_disponibles = 9
        self.taller.save()
        
        # 2. Anulate
        # Depending on how logic is implemented, maybe setting status alone triggers signal?
        # Or need to call a service method. 
        # Ideally, we test the Signal or Service.
        # Let's try Service if available or API.
        
        # If we use Admin API to update:
        admin_user = User.objects.create_superuser('admin', 'admin@a.com', 'p')
        client = APIClient()
        client.force_authenticate(user=admin_user)
        
        url = f'/api/admin/enrollments/{enrollment.id}/'
        response = client.patch(url, {'estado_pago': 'ANULADO'})
        assert response.status_code == 200
        
        # 3. Verify Cupo Released
        self.taller.refresh_from_db()
        # Should be back to 10?
        # NOTE: This depends on backend implementation of signals. 
        # If not implemented, this test FAILING is good -> detects missing feature.
        assert self.taller.cupos_disponibles == 10

    def test_illegal_order_transition(self):
        """
        Verify: Cannot mark Order as PAID if total is 0 but items have price?
        Or simply ensure Order status syncs with Enrollments.
        """
        pass
