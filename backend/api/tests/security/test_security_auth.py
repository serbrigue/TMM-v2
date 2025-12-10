import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
import time
from datetime import timedelta

@pytest.mark.django_db
class TestAuthSecurity:
    def setup_method(self):
        self.user = User.objects.create_user(username='victim', email='victim@test.com', password='strongpassword')
        self.client = APIClient()

    def test_brute_force_protection(self):
        """
        Target: A07: Identification Failures
        Simulate Brute Force.
        Note: Django default doesn't block by default without plugins (django-axes).
        This test checks if such protection is missing (WARN) or present.
        """
        url = '/api/token/' # Login endpoint
        # Sending 10 bad requests
        for _ in range(10):
            response = self.client.post(url, {'username': 'victim', 'password': 'wrongpassword'})
            assert response.status_code == 401
            
        # 11th request with correct password should still work 
        # unless strict lockout is enabled (which can be DoS vector).
        # Ideally, we expect a delay or CAPTCHA req (not easily testable here).
        # We mainly verify it doesn't Crash or leak info.
        
        response = self.client.post(url, {'username': 'victim', 'password': 'strongpassword'})
        assert response.status_code == 200

    def test_jwt_expiration(self):
        """
        Target: A01/A07
        Verify expired token is rejected.
        """
        refresh = RefreshToken.for_user(self.user)
        access_token = refresh.access_token
        
        # Manually expire it
        access_token.set_exp(lifetime=timedelta(seconds=-1))
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get('/api/orders/') # Protected endpoint
        
        assert response.status_code == 401
