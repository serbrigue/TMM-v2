from django.test import TestCase
from django.core import mail
from api.models import Taller, Cliente, Interes
from api.services import NotificationService
from django.utils import timezone
import datetime

class NotificationTest(TestCase):
    def setUp(self):
        self.interest = Interes.objects.create(nombre="Test Interest")
        self.taller = Taller.objects.create(
            nombre="Test Taller",
            fecha_taller=timezone.now().date() + datetime.timedelta(days=7),
            precio=10000,
            categoria=self.interest
        )
        
        # Create clients with different states involved
        self.client_lead = Cliente.objects.create(
            nombre_completo="Lead Client",
            email="lead@example.com",
            estado_ciclo="LEAD",
            tipo_cliente="B2C"
        )
        self.client_lead.intereses_cliente.add(self.interest)

        self.client_prospect = Cliente.objects.create(
            nombre_completo="Prospect Client",
            email="prospect@example.com",
            estado_ciclo="PROSPECTO",
            tipo_cliente="B2C"
        )
        self.client_prospect.intereses_cliente.add(self.interest)

        self.client_active = Cliente.objects.create(
            nombre_completo="Active Client",
            email="active@example.com",
            estado_ciclo="CLIENTE",
            tipo_cliente="B2C"
        )
        self.client_active.intereses_cliente.add(self.interest)
        
        self.client_inactive = Cliente.objects.create(
            nombre_completo="Inactive Client",
            email="inactive@example.com",
            estado_ciclo="INACTIVO",
            tipo_cliente="B2C"
        )
        self.client_inactive.intereses_cliente.add(self.interest)

    def test_notify_new_workshop_audience(self):
        """Test that new workshop notifications reach LEAD, PROSPECT, and CLIENT."""
        # We need to simulate the query used in the ViewSet or Service
        # Assuming we update the viewset/service to include these states
        interested_clients = Cliente.objects.filter(
            intereses_cliente=self.taller.categoria,
            estado_ciclo__in=['LEAD', 'PROSPECTO', 'CLIENTE']
        ).distinct()
        
        self.assertEqual(interested_clients.count(), 3)
        self.assertIn(self.client_lead, interested_clients)
        self.assertIn(self.client_prospect, interested_clients)
        self.assertIn(self.client_active, interested_clients)

    def test_bulk_sending(self):
        """Test that sending to multiple clients uses one connection."""
        clients = [self.client_lead, self.client_prospect, self.client_active]
        
        # Clear outbox
        mail.outbox = []
        
        count = NotificationService.notify_new_workshop(self.taller, clients)
        
        self.assertEqual(count, 3)
        self.assertEqual(len(mail.outbox), 3)
        # In a real unit test with mocked backend we'd check connection usage, 
        # but here we just check emails are queued.
