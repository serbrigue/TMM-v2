from django.core.management.base import BaseCommand
from api.models import Cliente, Taller, Inscripcion, Transaccion, Interaccion, Interes, Curso, InscripcionCurso, Empresa
from django.utils import timezone
from django.contrib.auth.models import User
import random
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Populates the database with test data for June-December 2025'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting data population...')
        
        # Setup dates
        start_date = timezone.make_aware(datetime(2025, 6, 1))
        end_date = timezone.make_aware(datetime(2025, 12, 31))
        
        # 1. Create Categories (Interes) if not exist
        categories = ['Liderazgo', 'Ventas', 'Tecnología', 'Bienestar', 'Finanzas']
        cat_objs = []
        for cat_name in categories:
            cat, _ = Interes.objects.get_or_create(nombre=cat_name, defaults={'descripcion': f'Cursos de {cat_name}'})
            cat_objs.append(cat)
            
        # 2. Create Workshops (Talleres)
        workshop_titles = [
            "Liderazgo Efectivo 2025", "Ventas B2B Avanzadas", "IA para Negocios", 
            "Mindfulness Corporativo", "Finanzas para No Financieros", "Gestión del Tiempo",
            "Comunicación Asertiva", "Negociación Estratégica", "Marketing Digital 360", "Excel Avanzado"
        ]
        
        talleres = []
        for i, title in enumerate(workshop_titles):
            # Random date between Jun and Dec 2025
            days_diff = (end_date - start_date).days
            random_days = random.randint(0, days_diff)
            taller_date = start_date + timedelta(days=random_days)
            
            taller_qs = Taller.objects.filter(nombre=title)
            if taller_qs.exists():
                taller = taller_qs.first()
            else:
                taller = Taller.objects.create(
                    nombre=title,
                    descripcion=f"Taller intensivo de {title}",
                    precio=random.choice([50000, 80000, 120000, 150000]),
                    fecha_taller=taller_date,
                    hora_taller=datetime.strptime('09:00', '%H:%M').time(),
                    cupos_totales=30,
                    cupos_disponibles=random.randint(0, 25),
                    categoria=random.choice(cat_objs),
                    esta_activo=True,
                    modalidad=random.choice(['ONLINE', 'PRESENCIAL'])
                )
                self.stdout.write(f'Created Taller: {taller.nombre} ({taller.fecha_taller})')
            talleres.append(taller)

        # 3. Create Companies (B2B Clients)
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
        
        self.stdout.write(f'Created {len(b2b_clients)} B2B clients')

        # 4. Create B2C Clients
        first_names = ["Juan", "Maria", "Pedro", "Ana", "Luis", "Carmen", "Jose", "Francisca", "Diego", "Camila"]
        last_names = ["Gonzalez", "Munoz", "Rojas", "Diaz", "Perez", "Soto", "Contreras", "Silva", "Martinez", "Sepulveda"]
        
        b2c_clients = []
        for i in range(30):
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
                
        self.stdout.write(f'Created {len(b2c_clients)} B2C clients')

        # 5. Create Enrollments and Transactions
        all_clients = b2b_clients + b2c_clients
        
        for cliente in all_clients:
            # Randomly enroll in 0-3 workshops
            num_enrollments = random.randint(0, 3)
            if num_enrollments == 0: continue
            
            selected_talleres = random.sample(talleres, num_enrollments)
            
            for taller in selected_talleres:
                # Calculate dates
                enrollment_date = taller.fecha_taller - timedelta(days=random.randint(5, 30))
                
                # Create enrollment
                inscripcion = Inscripcion.objects.create(
                    cliente=cliente,
                    taller=taller,
                    monto_pagado=0, # Will update with transaction
                    estado_pago='PENDIENTE'
                )
                # Force update date (bypass auto_now_add)
                Inscripcion.objects.filter(id=inscripcion.id).update(fecha_inscripcion=enrollment_date)
                # Refresh to get the date if needed, or just use enrollment_date variable
                
                # Determine payment status
                status_choice = random.choice(['PAGADO', 'PENDIENTE', 'PARCIAL'])
                
                transaction_date = enrollment_date + timedelta(days=1)
                
                if status_choice == 'PAGADO':
                    # Full payment transaction
                    t = Transaccion.objects.create(
                        inscripcion=inscripcion,
                        monto=taller.precio,
                        estado='APROBADO',
                        observacion='Pago automático populate'
                    )
                    Transaccion.objects.filter(id=t.id).update(fecha=transaction_date)
                    # This triggers auto-update of inscripcion due to model logic (save called on create)
                    # But we need to ensure the inscripcion update didn't reset the date? 
                    # No, inscripcion.save() updates 'modified' if auto_now=True, but fecha_inscripcion is auto_now_add.
                    
                elif status_choice == 'PARCIAL':
                    # Partial payment
                    t = Transaccion.objects.create(
                        inscripcion=inscripcion,
                        monto=taller.precio / 2,
                        estado='APROBADO',
                        observacion='Abono 50%'
                    )
                    Transaccion.objects.filter(id=t.id).update(fecha=transaction_date)
                    
                elif status_choice == 'PENDIENTE':
                    # Pending transaction (uploaded receipt but not approved)
                    t = Transaccion.objects.create(
                        inscripcion=inscripcion,
                        monto=taller.precio,
                        estado='PENDIENTE',
                        observacion='Transferencia enviada, revisar'
                    )
                    Transaccion.objects.filter(id=t.id).update(fecha=transaction_date)

        # 6. Create Interactions
        interaction_types = ['EMAIL', 'LLAMADA', 'WHATSAPP', 'REUNION']
        
        for cliente in all_clients:
            if random.random() > 0.5: # 50% chance of interaction
                for _ in range(random.randint(1, 3)):
                    int_date = start_date + timedelta(days=random.randint(0, 180))
                    Interaccion.objects.create(
                        cliente=cliente,
                        tipo=random.choice(interaction_types),
                        resumen=f"Interacción sobre {random.choice(['precios', 'fechas', 'contenidos'])}",
                        detalle=f"El cliente consultó sobre {random.choice(['precios', 'fechas', 'contenidos'])} y se le envió información.",
                        fecha=int_date,
                    )

        self.stdout.write(self.style.SUCCESS('Successfully populated database with 2025 data'))
