import pytest
from unittest.mock import patch
from api.models import Orden, Cliente, Producto, DetalleOrden
from django.contrib.auth.models import User

@pytest.mark.django_db
@patch('requests.post')
def test_n8n_webhook_trigger(mock_post):
    # Setup
    user = User.objects.create_user(username='loyaltyuser', email='loyalty@test.com')
    cliente = Cliente.objects.create(user=user, nombre_completo='Loyalty User', email='loyalty@test.com')
    
    producto = Producto.objects.create(nombre='Kit Loyalty', precio_venta=5000)
    
    orden = Orden.objects.create(cliente=cliente, monto_total=5000, estado_pago='PENDIENTE')
    DetalleOrden.objects.create(orden=orden, producto=producto, cantidad=1, precio_unitario=5000)
    
    # Trigger signal by changing status to PAGADO
    orden.estado_pago = 'PAGADO'
    orden.save()
    
    # Verify webhook call
    assert mock_post.called
    args, kwargs = mock_post.call_args
    
    # Check payload
    payload = kwargs['json']
    assert payload['cliente']['email'] == 'loyalty@test.com'
    assert payload['compra']['monto'] == 5000
    assert payload['accion_sugerida'] == 'send_welcome_kit_email'
