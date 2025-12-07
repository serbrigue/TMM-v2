from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from .models import EmailLog
from django.utils.html import strip_tags

def get_html_template(subject, body, action_url=None, action_text=None):
    """
    Helper to generate HTML email content.
    In a real app, this would use a Django template.
    For now, we'll construct a nice HTML string.
    """
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .content {{ background: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0; }}
            .button {{ display: inline-block; padding: 12px 24px; background-color: #8b9490; color: #ffffff !important; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }}
            .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #888; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="color: #8b9490;">TMM Bienestar</h1>
            </div>
            <div class="content">
                {body.replace(chr(10), '<br>')}
                
                {f'<div style="text-align: center;"><a href="{action_url}" class="button">{action_text}</a></div>' if action_url else ''}
            </div>
            <div class="footer">
                <p>Enviado con cariño por el equipo de TMM Bienestar</p>
            </div>
        </div>
    </body>
    </html>
    """
    return html_content

def send_welcome_email(user):
    """Send welcome email when a new account is created"""
    try:
        subject = '¡Bienvenida a TMM Bienestar!'
        body = f"""
        Hola {user.first_name},
        
        ¡Bienvenida a TMM Bienestar! Estamos emocionadas de tenerte en nuestra comunidad.
        
        Ahora puedes:
        - Inscribirte en nuestros talleres presenciales
        - Acceder a cursos grabados
        - Explorar nuestro blog de bienestar
        
        ¡Esperamos verte pronto!
        """
        
        html_message = get_html_template(subject, body, "http://localhost:5173/profile", "Ir a mi Perfil")
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        EmailLog.objects.create(
            recipient=user.email,
            subject=subject,
            body_text=plain_message,
            status='SUCCESS'
        )
        return True
    except Exception as e:
        EmailLog.objects.create(
            recipient=user.email,
            subject=subject,
            body_text=str(e),
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
            body = f"""
            Hola {cliente.nombre_completo},
            
            ¡Tu inscripción ha sido confirmada!
            
            <strong>Taller:</strong> {item_name}
            <strong>Fecha:</strong> {fecha}
            <strong>Hora:</strong> {hora}
            <strong>Modalidad:</strong> {inscripcion.taller.modalidad}
            <strong>Monto:</strong> ${int(inscripcion.monto_pagado):,}
            
            Te esperamos con muchas ganas de compartir esta experiencia contigo.
            """
            action_url = f"http://localhost:5173/profile"
        else:  # curso
            item_name = inscripcion.curso.titulo
            subject = f'Confirmación de inscripción: {item_name}'
            body = f"""
            Hola {cliente.nombre_completo},
            
            ¡Tu inscripción ha sido confirmada!
            
            <strong>Curso:</strong> {item_name}
            <strong>Duración:</strong> {inscripcion.curso.duracion}
            <strong>Monto:</strong> ${int(inscripcion.monto_pagado):,}
            
            Ya puedes acceder al curso desde tu perfil. ¡Disfruta aprendiendo a tu ritmo!
            """
            action_url = f"http://localhost:5173/profile"
        
        html_message = get_html_template(subject, body, action_url, "Ver Detalle en mi Perfil")
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [cliente.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        EmailLog.objects.create(
            recipient=cliente.email,
            subject=subject,
            body_text=plain_message,
            status='SUCCESS',
            inscripcion=inscripcion if tipo == 'taller' else None
        )
        return True
    except Exception as e:
        EmailLog.objects.create(
            recipient=cliente.email if cliente else None,
            subject=subject if 'subject' in locals() else 'Error',
            body_text=str(e),
            status='FAIL',
            error_message=str(e)
        )
        return False

def send_workshop_cancellation(taller, clientes):
    """Send email to all enrolled clients when a workshop is cancelled"""
    print(f"DEBUG: send_workshop_cancellation called for {taller.nombre}")
    try:
        subject = f'Taller Cancelado: {taller.nombre}'
        
        for cliente in clientes:
            print(f"DEBUG: Sending cancellation email to {cliente.email}")
            body = f"""
            Hola {cliente.nombre_completo},
            
            Lamentamos informarte que el taller "{taller.nombre}" programado para el {taller.fecha_taller.strftime('%d de %B de %Y')} ha sido cancelado.
            
            Nos pondremos en contacto contigo pronto para coordinar el reembolso o reprogramación.
            
            Disculpa las molestias.
            """
            
            html_message = get_html_template(subject, body)
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [cliente.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            EmailLog.objects.create(
                recipient=cliente.email,
                subject=subject,
                body_text=plain_message,
                status='SUCCESS'
            )
        return True
    except Exception as e:
        print(f"DEBUG: Error in send_workshop_cancellation: {e}")
        return False

def send_spot_cancellation(inscripcion):
    """Send email when a specific enrollment spot is cancelled"""
    try:
        cliente = inscripcion.cliente
        taller = inscripcion.taller
        
        subject = f'Cancelación de inscripción: {taller.nombre}'
        body = f"""
        Hola {cliente.nombre_completo},
        
        Tu inscripción al taller "{taller.nombre}" ha sido cancelada.
        
        Si esto fue un error o tienes alguna pregunta, por favor contáctanos.
        """
        
        html_message = get_html_template(subject, body)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [cliente.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        EmailLog.objects.create(
            recipient=cliente.email,
            subject=subject,
            body_text=plain_message,
            status='SUCCESS',
            inscripcion=inscripcion
        )
        return True
    except Exception as e:
        EmailLog.objects.create(
            recipient=cliente.email if cliente else None,
            subject=subject if 'subject' in locals() else 'Error',
            body_text=str(e),
            status='FAIL',
            error_message=str(e),
            inscripcion=inscripcion
        )
        return False

def send_admin_email(recipient_data_list, subject_template, message_template):
    """
    Send custom email from admin panel with dynamic substitution.
    recipient_data_list: List of dicts, e.g., [{'email': 'a@b.com', 'context': {'nombre': 'Juan'}}]
    """
    success_count = 0
    errors = []
    for data in recipient_data_list:
        email = data['email']
        context = data.get('context', {})
        
        try:
            # Substitute placeholders in subject and message
            # Using .format(**context) is risky if user input has braces, so we use a safer replace loop or Template
            # For simplicity and safety with known placeholders:
            final_subject = subject_template
            final_message = message_template
            
            for key, value in context.items():
                placeholder = f"{{{key}}}"
                if value:
                    final_subject = final_subject.replace(placeholder, str(value))
                    final_message = final_message.replace(placeholder, str(value))
            
            html_message = get_html_template(final_subject, final_message, "http://localhost:5173/profile", "Ir a mi Perfil")
            plain_message = strip_tags(html_message)

            send_mail(
                final_subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                html_message=html_message,
                fail_silently=False,
            )
            
            EmailLog.objects.create(
                recipient=email,
                subject=final_subject,
                body_text=plain_message,
                status='SUCCESS'
            )
            success_count += 1
        except Exception as e:
            error_msg = str(e)
            errors.append(error_msg)
            EmailLog.objects.create(
                recipient=email,
                subject=subject_template,
                body_text=message_template,
                status='FAIL',
                error_message=error_msg
            )
    
    return success_count, errors

def send_receipt_accepted_email(transaccion):
    """Notify user that their payment receipt was accepted"""
    try:
        if transaccion.inscripcion:
            cliente = transaccion.inscripcion.cliente
            item_name = str(transaccion.inscripcion.content_object)
        elif transaccion.orden:
            cliente = transaccion.orden.cliente
            item_name = f"Orden #{transaccion.orden.id}"
        else:
            return False
        
        subject = f'Pago Aprobado: {item_name}'
        body = f"""
        Hola {cliente.nombre_completo},
        
        ¡Buenas noticias! Tu comprobante de pago para "{item_name}" ha sido verificado y aprobado exitosamente.
        
        Ya tienes acceso confirmado.
        """
        
        html_message = get_html_template(subject, body, "http://localhost:5173/profile", "Ver mi Inscripción")
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [cliente.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        EmailLog.objects.create(
            recipient=cliente.email,
            subject=subject,
            body_text=plain_message,
            status='SUCCESS',
            inscripcion=transaccion.inscripcion
        )
        return True
    except Exception as e:
        return False

def send_receipt_rejected_email(transaccion, motivo=''):
    """Notify user that their payment receipt was rejected"""
    try:
        if transaccion.inscripcion:
            cliente = transaccion.inscripcion.cliente
            item_name = str(transaccion.inscripcion.content_object)
        elif transaccion.orden:
            cliente = transaccion.orden.cliente
            item_name = f"Orden #{transaccion.orden.id}"
        else:
            return False
        
        subject = f'Problema con tu pago: {item_name}'
        body = f"""
        Hola {cliente.nombre_completo},
        
        Hemos revisado tu comprobante de pago para "{item_name}" y no hemos podido aprobarlo.
        
        <strong>Motivo:</strong> {motivo if motivo else 'La imagen no es legible o el monto no coincide.'}
        
        Por favor, intenta subir el comprobante nuevamente o contáctanos si tienes dudas.
        """
        
        html_message = get_html_template(subject, body, "http://localhost:5173/profile?tab=payments", "Subir Nuevo Comprobante")
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [cliente.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        EmailLog.objects.create(
            recipient=cliente.email,
            subject=subject,
            body_text=plain_message,
            status='SUCCESS',
            inscripcion=transaccion.inscripcion
        )
        return True
    except Exception as e:
        return False


def send_receipt_received_email(transaccion):
    """Notify user that their payment receipt was received and is under review"""
    try:
        if transaccion.inscripcion:
            cliente = transaccion.inscripcion.cliente
            item_name = str(transaccion.inscripcion.content_object)
        elif transaccion.orden:
            cliente = transaccion.orden.cliente
            item_name = f"Orden #{transaccion.orden.id}"
        else:
            return False
        
        subject = f'Comprobante Recibido: {item_name}'
        body = f"""
        Hola {cliente.nombre_completo},
        
        Hemos recibido tu comprobante de pago para "{item_name}".
        
        Nuestro equipo lo revisará a la brevedad. Te notificaremos por este medio una vez que sea aprobado.
        
        ¡Gracias por tu paciencia!
        """
        
        html_message = get_html_template(subject, body, "http://localhost:5173/profile", "Ir a mi Perfil")
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [cliente.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        EmailLog.objects.create(
            recipient=cliente.email,
            subject=subject,
            body_text=plain_message,
            status='SUCCESS',
            inscripcion=transaccion.inscripcion
        )
        return True
    except Exception as e:
        return False

def send_waitlist_notification(user, taller):
    """
    Envía un correo al usuario avisando que se liberó un cupo.
    """
    subject = f"¡Cupo disponible en {taller.nombre}!"
    body = f"""
    Hola {user.first_name},
    
    ¡Buenas noticias! Se ha liberado un cupo en el taller "{taller.nombre}" que estabas esperando.
    
    Ingresa ahora a la plataforma para inscribirte antes de que se ocupe nuevamente.
    """
    
    try:
        html_message = get_html_template(subject, body, f"http://localhost:5173/talleres/{taller.id}", "Inscribirme Ahora")
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=True,
        )
        
        EmailLog.objects.create(
            recipient=user.email,
            subject=subject,
            body_text=plain_message,
            status='SUCCESS'
        )
        return True
    except Exception as e:
        print(f"Error enviando email lista espera: {e}")
        return False

def send_new_workshop_notification(taller, clientes):
    """
    Send email to clients interested in the workshop's category.
    """
    print(f"DEBUG: send_new_workshop_notification called for {taller.nombre}")
    try:
        subject = f'Nuevo Taller: {taller.nombre}'
        
        count = 0
        for cliente in clientes:
            print(f"DEBUG: Sending new workshop notification to {cliente.email}")
            body = f"""
            Hola {cliente.nombre_completo},
            
            ¡Tenemos un nuevo taller que te podría interesar!
            
            <strong>{taller.nombre}</strong>
            
            <strong>Fecha:</strong> {taller.fecha_taller.strftime('%d de %B de %Y')}
            <strong>Hora:</strong> {taller.hora_taller.strftime('%H:%M') if taller.hora_taller else 'Por confirmar'}
            <strong>Modalidad:</strong> {taller.modalidad}
            
            {taller.descripcion[:200]}...
            
            ¡Inscríbete ahora y asegura tu cupo!
            """
            
            html_message = get_html_template(subject, body, f"http://localhost:5173/talleres/{taller.id}", "Ver Taller")
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [cliente.email],
                html_message=html_message,
                fail_silently=True,
            )
            
            EmailLog.objects.create(
                recipient=cliente.email,
                subject=subject,
                body_text=plain_message,
                status='SUCCESS'
            )
            count += 1
            
        return count
    except Exception as e:
        print(f"DEBUG: Error sending new workshop notification: {e}")
        return 0
