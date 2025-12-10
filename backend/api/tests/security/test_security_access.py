import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from api.models import Cliente, Orden, Enrollment, Curso
from django.contrib.contenttypes.models import ContentType

@pytest.mark.django_db
class TestAccessControl:
    def setup_method(self):
        # Admin User
        self.admin_user = User.objects.create_superuser(username='admin', email='admin@test.com', password='adminpassword')
        self.admin_client = APIClient()
        self.admin_client.force_authenticate(user=self.admin_user)

        # Normal User A
        self.user_a = User.objects.create_user(username='user_a', email='a@test.com', password='password')
        self.cliente_a = Cliente.objects.create(user=self.user_a, email=self.user_a.email)
        self.client_a = APIClient()
        self.client_a.force_authenticate(user=self.user_a)

        # Normal User B
        self.user_b = User.objects.create_user(username='user_b', email='b@test.com', password='password')
        self.cliente_b = Cliente.objects.create(user=self.user_b, email=self.user_b.email)
        self.client_b = APIClient()
        self.client_b.force_authenticate(user=self.user_b)

    def test_admin_endpoints_protection(self):
        """
        Verify that normal users cannot access admin endpoints.
        """
        admin_urls = [
            '/api/admin/dashboard/',
            '/api/admin/revenue/',
        ]
        
        for url in admin_urls:
            response = self.client_a.get(url)
            assert response.status_code == status.HTTP_403_FORBIDDEN, f"User A should not access {url}"

    def test_idor_orders(self):
        """
        Target: AC-02 (IDOR)
        Verify User A cannot see User B's orders.
        """
        # Create Order for User B
        orden_b = Orden.objects.create(cliente=self.cliente_b, monto_total=100)
        
        # User A tries to access User B's order
        url = f'/api/orders/{orden_b.id}/' # Assuming this is the detail point
        # Note: If endpoint is /api/orders/ and it filters by user, 
        # checking DetailView is key. If explicit ID is used.
        
        # In TMM v2, we saw UserOrderDetailView takes 'pk'.
        url = f'/api/orders/{orden_b.id}/'
        response = self.client_a.get(url)
        
        # Should be 404 (Not Found in queryset) or 403
        assert response.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN]

    def test_idor_enrollments_update(self):
        """
        Target: AC-02 (IDOR)
        Verify User A cannot update User B's enrollment.
        """
        # Setup course and enrollment for B
        curso = Curso.objects.create(titulo="Curso Test", precio=100)
        ct = ContentType.objects.get_for_model(curso)
        enrollment_b = Enrollment.objects.create(
            cliente=self.cliente_b,
            content_type=ct,
            object_id=curso.id,
            estado_pago='PENDIENTE'
        )
        
        # User A tries to PATCH enrollment B (e.g., mark as paid)
        # Assuming there is an endpoint to update enrollment or checking logic
        # Typically ViewSets allow UPDATE if not filtered.
        
        # Let's assume a hypothetical endpoint or standard ViewSet behavior if exposed
        url = f'/api/enrollments/{enrollment_b.id}/' 
        # If this endpoint exists for users. If not, maybe /api/enroll/ but that's POST.
        
        # If the viewset is AdminEnrollmentViewSet, it's already protected (AC-01).
        # We need to check if there is a public enrollment update endpoint.
        # Based on file scan, there isn't one clearly exposed for users to update generic enrollments.
        # But let's verify Admin endpoint rejection too.
        
        url_admin = f'/api/admin/enrollments/{enrollment_b.id}/'
        response = self.client_a.patch(url_admin, {'estado_pago': 'PAGADO'})
        assert response.status_code == status.HTTP_403_FORBIDDEN
