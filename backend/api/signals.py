from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Enrollment, ListaEspera
from .email_utils import send_waitlist_notification

@receiver(post_save, sender=Enrollment)
def liberar_cupo_handler(sender, instance, **kwargs):
    """
    Cuando se anula una inscripción a un Taller, verificar si hay lista de espera
    y notificar al siguiente usuario.
    """
    # Solo nos interesa si el estado cambia a ANULADO y es un Taller
    if instance.estado_pago == 'ANULADO' and instance.content_type.model == 'taller':
        taller = instance.content_object
        
        # Buscar el siguiente en la lista que no haya sido notificado
        siguiente = ListaEspera.objects.filter(taller=taller, notificado=False).first()
        
        if siguiente:
            # Enviar notificación
            send_waitlist_notification(siguiente.usuario, taller)
            
            # Marcar como notificado
            siguiente.notificado = True
            siguiente.save()

@receiver(post_save, sender='api.Orden')
def trigger_n8n_webhook(sender, instance, created, **kwargs):
    """
    Cuando una orden se paga, enviar datos a n8n para automatización de fidelización.
    """
    if instance.estado_pago == 'PAGADO':
        import requests
        import json
        from django.conf import settings
        
        # URL del Webhook de n8n (Debería estar en settings, hardcoded por ahora para demo)
        WEBHOOK_URL = getattr(settings, 'N8N_WEBHOOK_URL', 'https://n8n.webhook.url/post-venta')
        
        # Skip if using placeholder
        if 'n8n.webhook.url' in WEBHOOK_URL:
            print("n8n Webhook skipped: Using placeholder URL.")
            return

        payload = {
            "cliente": {
                "nombre": instance.cliente.nombre_completo,
                "email": instance.cliente.email,
                "tipo": instance.cliente.tipo_cliente
            },
            "compra": {
                "id": instance.id,
                "items": [d.producto.nombre for d in instance.detalles.all()],
                "fecha": instance.fecha.strftime('%Y-%m-%d'),
                "monto": int(instance.monto_total)
            },
            "accion_sugerida": "send_welcome_kit_email"
        }
        
        try:
            # Enviar async o fire-and-forget idealmente
            # Aquí lo hacemos síncrono con timeout corto para no bloquear
            requests.post(WEBHOOK_URL, json=payload, timeout=2)
        except Exception as e:
            print(f"Error enviando webhook n8n: {e}")
