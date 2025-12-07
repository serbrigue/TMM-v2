from django.core.management.base import BaseCommand
from api.models import (
    Cliente, Taller, Enrollment, Transaccion, Interaccion, Interes, 
    Curso, Empresa, Orden, DetalleOrden, Producto, VentaProducto, DetalleVenta,
    Resena
)
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
import random
from datetime import datetime, timedelta
import pytz
import os
import shutil
from django.conf import settings

class Command(BaseCommand):
    help = 'Populates the database with test data for Jan-Dec 2025'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting data population for 2025...')
        
        # Setup dates
        tz = pytz.timezone('America/Santiago')
        start_date = datetime(2025, 1, 1, tzinfo=tz)
        end_date = datetime(2025, 12, 31, tzinfo=tz)

        # 0. Cleanup Database
        self.stdout.write('Cleaning up database...')
        Transaccion.objects.all().delete()
        DetalleOrden.objects.all().delete()
        Orden.objects.all().delete()
        Enrollment.objects.all().delete()
        Interaccion.objects.all().delete()
        Resena.objects.all().delete() # Clean reviews too
        Taller.objects.all().delete()
        Curso.objects.all().delete()
        Producto.objects.all().delete()
        Interes.objects.all().delete()
        Cliente.objects.all().delete() # Fix duplicate key issue
        User.objects.exclude(is_superuser=True).delete() # Clean non-admin users
        self.stdout.write('Database cleaned.')

        # Setup Images
        base_dir = settings.BASE_DIR
        source_img_dir = os.path.join(base_dir, 'source_images')
        media_root = settings.MEDIA_ROOT
        
        # Ensure media subdirectories exist
        os.makedirs(os.path.join(media_root, 'talleres'), exist_ok=True)
        os.makedirs(os.path.join(media_root, 'productos'), exist_ok=True)

        def get_image_for_keyword(text, category=None, type='taller'):
            text = text.lower()
            cat_text = category.lower() if category else ""
            img_name = None
            
            # 1. Try to match by keyword in text
            if 'resina' in text:
                img_name = 'resina_default.jpg'
            elif 'encuadernacion' in text or 'bitácora' in text or 'agenda' in text:
                img_name = 'encuadernacion_default.jpg'
            elif 'bienestar' in text or 'velas' in text or 'aromaterapia' in text or 'mindfulness' in text:
                img_name = 'aromaterapia_default.jpg'
            
            # 2. Fallback to category if no keyword match
            if not img_name and category:
                if 'resina' in cat_text:
                    img_name = 'resina_default.jpg'
                elif 'encuadernación' in cat_text or 'encuadernacion' in cat_text:
                    img_name = 'encuadernacion_default.jpg'
                elif 'bienestar' in cat_text:
                    img_name = 'aromaterapia_default.jpg'

            if img_name:
                src = os.path.join(source_img_dir, img_name)
                if os.path.exists(src):
                    # Map type to folder name
                    if type == 'taller':
                        dst_folder = 'talleres'
                    elif type == 'producto':
                        dst_folder = 'productos'
                    else: # curso
                        dst_folder = 'cursos'
                        
                    # Ensure destination folder exists
                    os.makedirs(os.path.join(media_root, dst_folder), exist_ok=True)
                    
                    dst = os.path.join(media_root, dst_folder, img_name)
                    shutil.copy2(src, dst)
                    return f"{dst_folder}/{img_name}"
            return None
        
        # 1. Create Categories (Interes)
        categories = ['Resina', 'Bienestar', 'Encuadernación']
        cat_objs = {}
        for cat_name in categories:
            cat, _ = Interes.objects.get_or_create(nombre=cat_name, defaults={'descripcion': f'Cursos de {cat_name}'})
            cat_objs[cat_name] = cat
            
        # 2. Create Products (Physical/Digital Kits)
        product_data = [
            ("Kit Inicial Resina", 45000, 'Resina'),
            ("Molde Silicona Posavasos", 12000, 'Resina'),
            ("Pigmentos Resina Pack", 15000, 'Resina'),
            ("Kit Encuadernación Básica", 35000, 'Encuadernación'),
            ("Prensa de Encuadernación", 25000, 'Encuadernación'),
            ("Papel Ecológico Pack", 8000, 'Encuadernación'),
            ("Kit Bienestar Aromaterapia", 30000, 'Bienestar'),
            ("Vela de Soja Artesanal", 12000, 'Bienestar'),
            ("Aceite Esencial Lavanda", 9000, 'Bienestar')
        ]
        products = []
        for p_name, p_price, p_cat in product_data:
            img_path = get_image_for_keyword(p_name, category=p_cat, type='producto')
            prod, _ = Producto.objects.update_or_create(
                nombre=p_name,
                defaults={
                    'precio_venta': p_price,
                    'stock_actual': 100,
                    'descripcion': f"Descripción de {p_name}",
                    'imagen': img_path
                }
            )
            products.append(prod)

        # 3. Create Courses (Cursos Grabados)
        course_data = [
            ("Masterclass Resina Epóxica", 'Resina'),
            ("Técnicas Avanzadas de Resina", 'Resina'),
            ("Encuadernación Copta Paso a Paso", 'Encuadernación'),
            ("Creación de Bitácoras de Viaje", 'Encuadernación'),
            ("Mindfulness y Bienestar Diario", 'Bienestar'),
            ("Aromaterapia para el Hogar", 'Bienestar')
        ]
        cursos = []
        for title, cat_name in course_data:
            img_path = get_image_for_keyword(title, category=cat_name, type='curso')
            curso, _ = Curso.objects.update_or_create(
                titulo=title,
                defaults={
                    'descripcion': f"Curso completo de {title}",
                    'precio': random.choice([35000, 50000, 75000]),
                    'duracion': "5 horas",
                    'categoria': cat_objs[cat_name],
                    'esta_activo': True,
                    'imagen': img_path
                }
            )
            cursos.append(curso)

        # 4. Create Workshops (Talleres) - Distributed throughout the year
        workshop_data = [
            ("Taller Resina Joyas", 'Resina'),
            ("Taller Resina Bandejas", 'Resina'),
            ("Taller Encuadernación Japonesa", 'Encuadernación'),
            ("Taller Creación de Agendas", 'Encuadernación'),
            ("Taller Velas de Soja y Aromaterapia", 'Bienestar'),
            ("Taller Mindfulness y Relajación", 'Bienestar')
        ]
        
        talleres = []
        # Create 2 workshops per month
        current_month = start_date
        while current_month <= end_date:
            for _ in range(2):
                title_base, cat_name = random.choice(workshop_data)
                title = f"{title_base} ({current_month.strftime('%B')})"
                taller_date = (current_month + timedelta(days=random.randint(5, 25))).date()
                is_active = taller_date >= datetime.now().date()
                img_path = get_image_for_keyword(title, category=cat_name, type='taller')
                
                taller, created = Taller.objects.update_or_create(
                    nombre=title,
                    defaults={
                        'descripcion': f"Taller intensivo de {title.split('(')[0]}",
                        'precio': random.choice([50000, 80000, 120000, 150000]),
                        'fecha_taller': taller_date,
                        'hora_taller': datetime.strptime('09:00', '%H:%M').time(),
                        'cupos_totales': 30,
                        'cupos_disponibles': 30, # Will be reduced by enrollments
                        'categoria': cat_objs[cat_name],
                        'esta_activo': is_active,
                        'modalidad': random.choice(['ONLINE', 'PRESENCIAL']),
                        'imagen': img_path
                    }
                )
                talleres.append(taller)
            
            # Next month
            if current_month.month == 12:
                break
            current_month = current_month.replace(month=current_month.month + 1)

        # 5. Create Companies (B2B Clients)
        company_names = [
            "TechSolutions SpA", "Inversiones Globales", "Constructora Andes", 
            "Retail Chile", "Consultora Estratégica"
        ]
        
        b2b_clients = []
        for company_name in company_names:
            empresa_obj, _ = Empresa.objects.get_or_create(razon_social=company_name)
            
            # Create 3-5 employees for each company
            for j in range(random.randint(3, 5)):
                email = f"contacto{j}@{company_name.lower().replace(' ', '')}.cl"
                if not Cliente.objects.filter(email=email).exists():
                    cliente = Cliente.objects.create(
                        nombre_completo=f"Empleado {j+1} {company_name}",
                        email=email,
                        telefono=f"+569{random.randint(10000000, 99999999)}",
                        tipo_cliente='B2B',
                        empresa=empresa_obj,
                        estado_ciclo=random.choice(['CLIENTE', 'PROSPECTO']),
                        origen='LINKEDIN'
                    )
                    b2b_clients.append(cliente)
                else:
                    b2b_clients.append(Cliente.objects.get(email=email))
        
        self.stdout.write(f'Created/Loaded {len(b2b_clients)} B2B clients')

        # 6. Create B2C Clients
        first_names = ["Juan", "Maria", "Pedro", "Ana", "Luis", "Carmen", "Jose", "Francisca", "Diego", "Camila"]
        last_names = ["Gonzalez", "Munoz", "Rojas", "Diaz", "Perez", "Soto", "Contreras", "Silva", "Martinez", "Sepulveda"]
        
        b2c_clients = []
        for i in range(50):
            fname = random.choice(first_names)
            lname = random.choice(last_names)
            email = f"{fname.lower()}.{lname.lower()}{i}@gmail.com"
            
            if not Cliente.objects.filter(email=email).exists():
                cliente = Cliente.objects.create(
                    nombre_completo=f"{fname} {lname}",
                    email=email,
                    telefono=f"+569{random.randint(10000000, 99999999)}",
                    tipo_cliente='B2C',
                    estado_ciclo=random.choice(['CLIENTE', 'LEAD', 'PROSPECTO']),
                    origen=random.choice(['INSTAGRAM', 'GOOGLE', 'REFERIDO']),
                    comuna_vive=random.choice(['Santiago', 'Providencia', 'Las Condes', 'Nunoa', 'La Florida'])
                )
                b2c_clients.append(cliente)
            else:
                b2c_clients.append(Cliente.objects.get(email=email))
                
        self.stdout.write(f'Created/Loaded {len(b2c_clients)} B2C clients')

        # 7. Generate Historical Data (Orders & Enrollments)
        all_clients = b2b_clients + b2c_clients
        taller_ct = ContentType.objects.get_for_model(Taller)
        curso_ct = ContentType.objects.get_for_model(Curso)

        # Simulate monthly activity
        current_sim_date = start_date
        while current_sim_date <= end_date:
            # Random number of transactions per month (10-20)
            monthly_transactions = random.randint(10, 20)
            
            for _ in range(monthly_transactions):
                client = random.choice(all_clients)
                tx_date = current_sim_date + timedelta(days=random.randint(0, 28), hours=random.randint(9, 18))
                
                # 80% chance of Order (Cart), 20% chance of Direct Enrollment (Legacy/Specific)
                if random.random() < 0.8:
                    # Create Order
                    order = Orden.objects.create(
                        cliente=client,
                        monto_total=0, # Calculated later
                        estado_pago='PENDIENTE'
                    )
                    # Force date
                    Orden.objects.filter(id=order.id).update(fecha=tx_date)
                    
                    total_amount = 0
                    
                    # Add 1-3 items to order
                    num_items = random.randint(1, 3)
                    for _ in range(num_items):
                        item_type = random.choice(['PRODUCT', 'WORKSHOP', 'COURSE'])
                        
                        if item_type == 'PRODUCT':
                            prod = random.choice(products)
                            qty = random.randint(1, 2)
                            DetalleOrden.objects.create(
                                orden=order,
                                producto=prod,
                                cantidad=qty,
                                precio_unitario=prod.precio_venta
                            )
                            total_amount += prod.precio_venta * qty
                            
                        elif item_type == 'WORKSHOP':
                            # Pick a workshop near this date
                            valid_workshops = [t for t in talleres if t.fecha_taller > tx_date.date()]
                            if valid_workshops:
                                ws = random.choice(valid_workshops)
                                try:
                                    # Create Enrollment linked to Order
                                    enrollment = Enrollment.objects.create(
                                        cliente=client,
                                        content_type=taller_ct,
                                        object_id=ws.id,
                                        monto_pagado=ws.precio, # Assuming full payment for order
                                        estado_pago='PENDIENTE' # Will update with Order payment
                                    )
                                    Enrollment.objects.filter(id=enrollment.id).update(fecha_inscripcion=tx_date)
                                    order.enrollments.add(enrollment)
                                    total_amount += ws.precio
                                except Exception as e:
                                    # Skip if full or other error
                                    pass
                                    
                        elif item_type == 'COURSE':
                            course = random.choice(cursos)
                            enrollment = Enrollment.objects.create(
                                cliente=client,
                                content_type=curso_ct,
                                object_id=course.id,
                                monto_pagado=course.precio,
                                estado_pago='PENDIENTE'
                            )
                            Enrollment.objects.filter(id=enrollment.id).update(fecha_inscripcion=tx_date)
                            order.enrollments.add(enrollment)
                            total_amount += course.precio

                    # Update Order Total
                    order.monto_total = total_amount
                    order.save()
                    
                    # Payment Logic (90% Approved)
                    if random.random() < 0.9:
                        tx = Transaccion.objects.create(
                            orden=order,
                            monto=total_amount,
                            estado='APROBADO',
                            observacion='Pago Webpay'
                        )
                        Transaccion.objects.filter(id=tx.id).update(fecha=tx_date)
                        order.actualizar_estado_pago() # This updates enrollments too
                    else:
                        order.estado_pago = 'RECHAZADO'
                        order.save()
                        
                else:
                    # Direct Enrollment (Legacy flow simulation)
                    ws = random.choice(talleres)
                    try:
                        enrollment = Enrollment.objects.create(
                            cliente=client,
                            content_type=taller_ct,
                            object_id=ws.id,
                            monto_pagado=0,
                            estado_pago='PENDIENTE'
                        )
                        Enrollment.objects.filter(id=enrollment.id).update(fecha_inscripcion=tx_date)
                        
                        # Payment
                        if random.random() < 0.7:
                            tx = Transaccion.objects.create(
                                inscripcion=enrollment,
                                monto=ws.precio,
                                estado='APROBADO',
                                observacion='Transferencia Directa'
                            )
                            Transaccion.objects.filter(id=tx.id).update(fecha=tx_date)
                            enrollment.actualizar_estado_pago()
                    except Exception:
                        pass

            # Move to next month
            if current_sim_date.month == 12:
                break
            current_sim_date = current_sim_date.replace(month=current_sim_date.month + 1)

        # 8. Create Interactions (CRM)
        interaction_types = ['EMAIL', 'LLAMADA', 'WHATSAPP', 'REUNION']
        
        for cliente in all_clients:
            if random.random() > 0.6: # 40% chance of interaction
                for _ in range(random.randint(1, 3)):
                    int_date = start_date + timedelta(days=random.randint(0, 360))
                    Interaccion.objects.create(
                        cliente=cliente,
                        tipo=random.choice(interaction_types),
                        resumen=f"Interacción sobre {random.choice(['precios', 'fechas', 'contenidos'])}",
                        detalle=f"El cliente consultó sobre {random.choice(['precios', 'fechas', 'contenidos'])} y se le envió información.",
                        fecha=int_date,
                    )

        # 9. Final Cleanup: Ensure all past workshops are inactive
        today = datetime.now().date()
        updated_count = Taller.objects.filter(fecha_taller__lt=today).update(esta_activo=False)
        self.stdout.write(f'Deactivated {updated_count} past workshops')

        # 10. Generate Reviews (Reseñas)
        self.stdout.write('Generating reviews...')
        comments_pool = [
            "Me encantó la experiencia, muy recomendada.",
            "Excelente taller, aprendí muchísimo.",
            "El ambiente fue increíble y la profesora muy dedicada.",
            "Muy buen curso, los materiales de excelente calidad.",
            "Una experiencia relajante y creativa, volveré.",
            "Todo perfecto, superó mis expectativas.",
            "Muy bien organizado y explicado.",
            "Me sirvió mucho para desconectar y aprender algo nuevo.",
            "100% recomendado para quienes buscan un hobby nuevo.",
            "Maravilloso, me fui feliz con mi creación."
        ]

        # Reviews for Workshops (only past ones usually have reviews, but we can add some for recent ones too)
        for taller in talleres:
            # Add reviews to 40% of workshops
            if random.random() < 0.4:
                num_reviews = random.randint(1, 5)
                reviewers = random.sample(b2c_clients, min(num_reviews, len(b2c_clients)))
                
                for client in reviewers:
                    Resena.objects.create(
                        cliente=client,
                        taller=taller,
                        calificacion=random.choices([5, 4, 3], weights=[0.7, 0.2, 0.1])[0],
                        comentario=random.choice(comments_pool)
                    )

        # Reviews for Courses
        for curso in cursos:
             # Add reviews to 60% of courses
            if random.random() < 0.6:
                num_reviews = random.randint(2, 8)
                reviewers = random.sample(b2c_clients, min(num_reviews, len(b2c_clients)))
                
                for client in reviewers:
                    Resena.objects.create(
                        cliente=client,
                        curso=curso,
                        calificacion=random.choices([5, 4, 3], weights=[0.8, 0.15, 0.05])[0],
                        comentario=random.choice(comments_pool)
                    )

        self.stdout.write(self.style.SUCCESS('Successfully populated database with 2025 historical data'))
