from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from django.core import mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

class AuthFlowTests(APITestCase):
    def test_registration_creates_inactive_user_and_sends_email(self):
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'testpassword123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        user = User.objects.get(email='newuser@example.com')
        self.assertFalse(user.is_active)
        
        # Check email sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Activa tu cuenta', mail.outbox[0].subject)

    def test_activation_activates_user(self):
        user = User.objects.create_user(
            username='inactiveuser',
            email='inactive@example.com',
            password='password123'
        )
        user.is_active = False
        user.save()
        
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        
        url = reverse('activate_account', kwargs={'uidb64': uid, 'token': token})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.is_active)

    def test_password_reset_flow(self):
        user = User.objects.create_user(
            username='resetuser',
            email='reset@example.com',
            password='oldpassword'
        )
        
        # 1. Request Reset
        url_request = reverse('password_reset_request')
        response = self.client.post(url_request, {'email': 'reset@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Recuperar Contraseña', mail.outbox[0].subject)
        
        # 2. Confirm Reset
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        
        url_confirm = reverse('password_reset_confirm', kwargs={'uidb64': uid, 'token': token})
        data = {'password': 'newpassword123'}
        response = self.client.post(url_confirm, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify login with new password
        login_url = reverse('token_obtain_pair')
        login_data = {'username': 'resetuser', 'password': 'newpassword123'}
        response = self.client.post(login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
