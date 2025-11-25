from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from .models import EmailLog

def send_welcome_email(user):
    """Send welcome email when a new account is created"""
    try:
        subject = '¡Bienvenida a TMM Bienestar!'
        message = f"""
        Hola {user.first_name},
        
        ¡Bienvenida a TMM Bienestar! Estamos emocionadas de tenerte en nuestra comunidad.
        
        Ahora puedes:
        - Inscribirte en nuestros talleres presenciales
        - Acceder a cursos grabados
        - Explorar nuestro blog de bienestar
        
        ¡Esperamos verte pronto!
        
        Con cariño,
        El equipo de TMM Bienestar
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        EmailLog.objects.create(
            recipient=user.email,
            subject=subject,
            body_text=message,
            status='SUCCESS'
        )
        return True
    except Exception as e:
        EmailLog.objects.create(
            recipient=user.email,
            subject=subject,
            body_text=message,
            status='FAIL',
            error_message=str(e)
        )
        return False

def send_enrollment_confirmation(inscripcion, tipo='taller'):
    """Send confirmation email when user enrolls in a workshop or course"""
    try:
        cliente = inscripcion.cliente
        
        if tipo == 'taller':
            item_name = inscripcion.taller.nombre
            fecha = inscripcion.taller.fecha_taller.strftime('%d de %B de %Y')
            hora = inscripcion.taller.hora_taller.strftime('%H:%M') if inscripcion.taller.hora_taller else 'Por confirmar'
            subject = f'Confirmación de inscripción: {item_name}'
            message = f"""
            Hola {cliente.nombre_completo},
            
            ¡Tu inscripción ha sido confirmada!
            
            Taller: {item_name}
            Fecha: {fecha}
            Hora: {hora}
            Modalidad: {inscripcion.taller.modalidad}
            Monto: ${int(inscripcion.monto_pagado):,}
            
            Te esperamos con muchas ganas de compartir esta experiencia contigo.
            
            Con cariño,
            El equipo de TMM Bienestar
            """
        else:  # curso
            item_name = inscripcion.curso.titulo
            subject = f'Confirmación de inscripción: {item_name}'
            message = f"""
            Hola {cliente.nombre_completo},
            
            ¡Tu inscripción ha sido confirmada!
            
            Curso: {item_name}
            Duración: {inscripcion.curso.duracion}
            Monto: ${int(inscripcion.monto_pagado):,}
            
            Ya puedes acceder al curso desde tu perfil. ¡Disfruta aprendiendo a tu ritmo!
            
            Con cariño,
            El equipo de TMM Bienestar
            """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [cliente.email],
            fail_silently=False,
        )
        
        EmailLog.objects.create(
            recipient=cliente.email,
            subject=subject,
            body_text=message,
            status='SUCCESS',
            inscripcion=inscripcion if tipo == 'taller' else None
        )
        return True
    except Exception as e:
        EmailLog.objects.create(
            recipient=cliente.email if cliente else None,
            subject=subject if 'subject' in locals() else 'Error',
            body_text=message if 'message' in locals() else '',
            status='FAIL',
            error_message=str(e)
        )
        return False

def send_workshop_cancellation(taller, clientes):
    """Send email to all enrolled clients when a workshop is cancelled"""
    try:
        subject = f'Taller Cancelado: {taller.nombre}'
        
        for cliente in clientes:
            message = f"""
            Hola {cliente.nombre_completo},
            
            Lamentamos informarte que el taller "{taller.nombre}" programado para el {taller.fecha_taller.strftime('%d de %B de %Y')} ha sido cancelado.
            
            Nos pondremos en contacto contigo pronto para coordinar el reembolso o reprogramación.
            
            Disculpa las molestias.
            
            Con cariño,
            El equipo de TMM Bienestar
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [cliente.email],
                fail_silently=False,
            )
            
            EmailLog.objects.create(
                recipient=cliente.email,
                subject=subject,
                body_text=message,
                status='SUCCESS'
            )
        return True
    except Exception as e:
        return False

def send_spot_cancellation(inscripcion):
    """Send email when a specific enrollment spot is cancelled"""
    try:
        cliente = inscripcion.cliente
        taller = inscripcion.taller
        
        subject = f'Cancelación de inscripción: {taller.nombre}'
        message = f"""
        Hola {cliente.nombre_completo},
        
        Tu inscripción al taller "{taller.nombre}" ha sido cancelada.
        
        Si esto fue un error o tienes alguna pregunta, por favor contáctanos.
        
        Con cariño,
        El equipo de TMM Bienestar
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [cliente.email],
            fail_silently=False,
        )
        
        EmailLog.objects.create(
            recipient=cliente.email,
            subject=subject,
            body_text=message,
            status='SUCCESS',
            inscripcion=inscripcion
        )
        return True
    except Exception as e:
        EmailLog.objects.create(
            recipient=cliente.email if cliente else None,
            subject=subject if 'subject' in locals() else 'Error',
            body_text=message if 'message' in locals() else '',
            status='FAIL',
            error_message=str(e),
            inscripcion=inscripcion
        )
        return False

def send_admin_email(recipients, subject, message):
    """Send custom email from admin panel"""
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            recipients,
            fail_silently=False,
        )
        
        for recipient in recipients:
            EmailLog.objects.create(
                recipient=recipient,
                subject=subject,
                body_text=message,
                status='SUCCESS'
            )
        return True
    except Exception as e:
        for recipient in recipients:
            EmailLog.objects.create(
                recipient=recipient,
                subject=subject,
                body_text=message,
                status='FAIL',
                error_message=str(e)
            )
        return False

# Email Templates

def get_oferta_template(custom_message=''):
    """Returns template for promotional offers"""
    subject = '¡Oferta Especial en TMM Bienestar! 🎁'
    message = f"""
    ¡Hola!
    
    Tenemos una oferta especial para ti en TMM Bienestar.
    
    {custom_message if custom_message else 'Aprovecha nuestros descuentos exclusivos en talleres y cursos.'}
    
    No dejes pasar esta oportunidad de invertir en tu bienestar y desarrollo personal.
    
    ¡Te esperamos!
    
    Con cariño,
    El equipo de TMM Bienestar
    """
    return subject, message

def get_recordatorio_template(custom_message=''):
    """Returns template for reminders"""
    subject = 'Recordatorio: Próximo Taller en TMM Bienestar 📅'
    message = f"""
    ¡Hola!
    
    Te recordamos que tienes un taller próximo con nosotros.
    
    {custom_message if custom_message else 'No olvides confirmar tu asistencia y preparar los materiales necesarios.'}
    
    Estamos emocionadas de compartir esta experiencia contigo.
    
    Con cariño,
    El equipo de TMM Bienestar
    """
    return subject, message

def get_personalizado_template():
    """Returns empty template for custom messages"""
    subject = ''
    message = ''
    return subject, message

