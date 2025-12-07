import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from api.models import Producto, Orden, DetalleOrden, Cliente
from django.contrib.auth.models import User

@pytest.mark.django_db
def test_atomic_inventory_deduction():
    # Setup
    user = User.objects.create_user(username='testuser', password='password')
    client = APIClient()
    client.force_authenticate(user=user)
    
    producto = Producto.objects.create(
        nombre='Test Product',
        precio_venta=1000,
        stock_actual=1,
        controlar_stock=True,
        es_fisico=True
    )
    
    # Attempt to buy 1 (should succeed)
    data = {
        'items': [
            {'type': 'product', 'id': producto.id, 'quantity': 1}
        ]
    }
    
    response = client.post('/api/checkout/', data, format='json')
    assert response.status_code == 201
    
    producto.refresh_from_db()
    assert producto.stock_actual == 0
    
    # Attempt to buy 1 more (should fail)
    response = client.post('/api/checkout/', data, format='json')
    assert response.status_code == 400
    assert "Stock insuficiente" in str(response.data)

@pytest.mark.django_db
def test_inventory_check_without_purchase():
    # Setup
    user = User.objects.create_user(username='testuser2', password='password')
    client = APIClient()
    client.force_authenticate(user=user)
    
    producto = Producto.objects.create(
        nombre='Test Product 2',
        precio_venta=1000,
        stock_actual=5,
        controlar_stock=True
    )
    
    # Attempt to buy 6 (should fail)
    data = {
        'items': [
            {'type': 'product', 'id': producto.id, 'quantity': 6}
        ]
    }
    
    response = client.post('/api/checkout/', data, format='json')
    assert response.status_code == 400
    assert "Stock insuficiente" in str(response.data)
    
    producto.refresh_from_db()
    assert producto.stock_actual == 5
