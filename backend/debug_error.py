import os
import django
import json
from rest_framework.exceptions import ValidationError

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from api.views import ResenaViewSet
from api.models import Cliente, Curso, Taller, Inscripcion
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory, force_authenticate

def debug_error():
    print("--- Debugging 400 Error ---")
    
    # 1. Setup
    factory = APIRequestFactory()
    user, _ = User.objects.get_or_create(username='debug_user', email='debug@example.com')
    cliente, _ = Cliente.objects.get_or_create(user=user, defaults={'nombre_completo': 'Debug User'})
    
    # Create a dummy workshop (no enrollment)
    taller, _ = Taller.objects.get_or_create(
        nombre='Debug Workshop', 
        defaults={
            'precio': 1000,
            'fecha_taller': '2025-12-12',
            'cupos_totales': 10,
            'descripcion': 'Debug'
        }
    )
    
    # 2. Simulate Request (Not Enrolled)
    view = ResenaViewSet.as_view({'post': 'create'})
    data = {
        'taller': taller.id,
        'calificacion': 5,
        'comentario': 'Test'
    }
    
    request = factory.post('/api/resenas/', data, format='json')
    force_authenticate(request, user=user)
    
    try:
        response = view(request)
        print(f"Status Code: {response.status_code}")
        print(f"Response Data: {json.dumps(response.data, indent=2)}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == '__main__':
    debug_error()
