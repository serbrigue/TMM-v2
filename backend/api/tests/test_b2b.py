import pytest
from rest_framework.test import APIClient
from api.models import Producto, Cliente, Cotizacion
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile

@pytest.mark.django_db
def test_generate_quote():
    # Setup
    user = User.objects.create_user(username='b2buser', password='password')
    Cliente.objects.create(user=user, nombre_completo='B2B User', email='b2b@test.com', tipo_cliente='B2B')
    client = APIClient()
    client.force_authenticate(user=user)
    
    producto = Producto.objects.create(nombre='Kit Test', precio_venta=5000)
    
    data = {
        'items': [{'type': 'product', 'id': producto.id, 'quantity': 10}],
        'razon_social': 'Empresa Test',
        'rut_empresa': '76.123.456-7'
    }
    
    response = client.post('/api/b2b/quote/', data, format='json')
    assert response.status_code == 200
    assert response['Content-Type'] == 'application/pdf'
    assert Cotizacion.objects.count() == 1

@pytest.mark.django_db
def test_bulk_enroll():
    # Setup
    admin = User.objects.create_superuser(username='admin', password='password', email='admin@test.com')
    client = APIClient()
    client.force_authenticate(user=admin)
    
    # Create Taller
    from api.models import Taller
    taller = Taller.objects.create(
        nombre='Taller Masivo',
        descripcion='Desc',
        fecha_taller='2025-12-31',
        precio=10000,
        cupos_totales=100,
        cupos_disponibles=100
    )
    
    # Create CSV
    csv_content = b"email,nombre\nuser1@test.com,User 1\nuser2@test.com,User 2"
    file = SimpleUploadedFile("users.csv", csv_content, content_type="text/csv")
    
    data = {
        'file': file,
        'taller_id': taller.id
    }
    
    response = client.post('/api/b2b/bulk-enroll/', data, format='multipart')
    assert response.status_code == 200
    assert response.data['total'] == 2
    
    # Verify enrollments
    from api.models import Enrollment
    assert Enrollment.objects.count() == 2
