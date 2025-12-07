from django.core.mail import send_mail
from django.conf import settings

def send_waitlist_notification(user, taller):
    """
    Envía un correo al usuario avisando que se liberó un cupo.
    """
    subject = f"¡Cupo disponible en {taller.nombre}!"
    message = f"""
    Hola {user.first_name},
    
    ¡Buenas noticias! Se ha liberado un cupo en el taller "{taller.nombre}" que estabas esperando.
    
    Ingresa ahora a la plataforma para inscribirte antes de que se ocupe nuevamente.
    
    Saludos,
    Equipo TMM
    """
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=True,
        )
        return True
    except Exception as e:
        print(f"Error enviando email lista espera: {e}")
        return False

# Placeholder for other email utils if they don't exist in this file context, 
# but assuming they might be elsewhere or I should append to existing email_utils.py if it exists.
# I will check if email_utils.py exists first.
