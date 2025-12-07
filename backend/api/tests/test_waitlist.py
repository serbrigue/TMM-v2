import pytest
from rest_framework.test import APIClient
from api.models import Taller, ListaEspera, Enrollment, Cliente
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType

@pytest.mark.django_db
def test_waitlist_notification(mailoutbox):
    # Setup
    user1 = User.objects.create_user(username='user1', email='user1@test.com')
    client1 = Cliente.objects.create(user=user1, nombre_completo='User 1', email='user1@test.com')
    
    user2 = User.objects.create_user(username='user2', email='user2@test.com')
    # User 2 doesn't need client profile for waitlist model strictly, but good to have
    
    taller = Taller.objects.create(
        nombre='Taller Lleno',
        fecha_taller='2025-12-31',
        precio=10000,
        cupos_totales=1,
        cupos_disponibles=0
    )
    
    # Enroll User 1 (taking the last spot - logically done before cupos=0 but we force it here)
    ct = ContentType.objects.get_for_model(Taller)
    enrollment = Enrollment.objects.create(
        cliente=client1,
        content_type=ct,
        object_id=taller.id,
        estado_pago='PAGADO'
    )
    
    # Add User 2 to Waitlist
    ListaEspera.objects.create(taller=taller, usuario=user2)
    
    # Cancel User 1's enrollment
    enrollment.estado_pago = 'ANULADO'
    enrollment.save()
    
    # Check if notification was sent
    assert len(mailoutbox) == 1
    assert mailoutbox[0].subject == f"¡Cupo disponible en {taller.nombre}!"
    assert mailoutbox[0].to == [user2.email]
    
    # Check if marked as notified
    assert ListaEspera.objects.get(usuario=user2).notificado == True
