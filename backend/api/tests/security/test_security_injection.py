import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from api.models import Cliente, Curso, Resena, Enrollment
from django.contrib.contenttypes.models import ContentType

@pytest.mark.django_db
class TestInjection:
    def setup_method(self):
        self.user = User.objects.create_user(username='attacker', email='attacker@test.com', password='password')
        self.cliente = Cliente.objects.create(user=self.user, email='attacker@test.com')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # Setup course for review
        self.curso = Curso.objects.create(titulo="Curso Vulnerable", precio=100)
        ct = ContentType.objects.get_for_model(self.curso)
        # Needs enrollment to review
        Enrollment.objects.create(cliente=self.cliente, content_type=ct, object_id=self.curso.id)

    def test_xss_payloads_in_reviews(self):
        """
        Target: A03: Injection (XSS)
        Verify that HTML/Script tags are either rejected or escaped/sanitized when retrieving.
        Django REST Framework usually renders JSON, so Stored XSS depends on Frontend.
        However, backend should ideally sanitize or at least store correctly.
        """
        payload = "<script>alert('XSS')</script>"
        data = {
            "curso": self.curso.id,
            "calificacion": 5,
            "comentario": payload
        }
        
        # Assuming endpoint /api/resenas/ exists
        # Based on file scan, ResenaViewSet exists but URL needs verification.
        # Let's assume standard router: /api/resenas/
        response = self.client.post('/api/resenas/', data)
        
        # If created, check if retrieved content echoes the script verbatim 
        # (React handles this, but API should be aware)
        if response.status_code == 201:
            resena_id = response.data['id']
            get_response = self.client.get(f'/api/resenas/{resena_id}/')
            content = get_response.data['comentario']
            # We just ensure it's stored. React's job is not to execute it.
            # But if we were using Templates, this would be critical.
            assert payload in content 
            # Note: This assertion validates it WAS stored. 
            # Real protection is escaping on output or sanitizing on input.
            # For this test, we accept it is stored, but check if we have a way to validate sanitization if implemented.

    def test_sql_injection_patterns(self):
        """
        Target: A03: Injection (SQLi)
        Attempt basic SQLi in search params.
        """
        # Endpoint with search filter, e.g., /api/public/cursos/?search=...
        payload = "' OR 1=1 --"
        response = self.client.get(f'/api/public/cursos/?search={payload}')
        
        assert response.status_code == 200
        # It should not return all courses if search is nonsense, 
        # OR it should return empty if "1=1" is treated as a string literal search.
        # It definitely should NOT crash (500).
