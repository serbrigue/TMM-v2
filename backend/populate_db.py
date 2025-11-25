import os
import django
import random
from datetime import timedelta, date, time
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Interes, Cliente, Taller, Curso, Post, Inscripcion, InscripcionCurso

def clean_database():
    print("Limpiando base de datos...")
    Inscripcion.objects.all().delete()
    InscripcionCurso.objects.all().delete()
    Taller.objects.all().delete()
    Curso.objects.all().delete()
    Post.objects.all().delete()
    Cliente.objects.all().delete()
    User.objects.exclude(is_superuser=True).delete()
    Interes.objects.all().delete()
    print("Base de datos limpia.")

def create_interests():
    print("Creando intereses...")
    interests = [
        "Resina", "Encuadernación", "Bienestar", "Decoración", 
        "Arte", "Emprendimiento", "Autocuidado"
    ]
    created = []
    for name in interests:
        obj, _ = Interes.objects.get_or_create(nombre=name)
        created.append(obj)
    return {i.nombre: i for i in created}

def create_users_and_clients(n=20):
    print(f"Creando {n} usuarios y clientes...")
    clients = []
    names = [
        "Ana", "Maria", "Sofia", "Camila", "Valentina", "Isabella", "Fernanda", "Lucia", "Martina", "Catalina",
        "Elena", "Victoria", "Emilia", "Florencia", "Agustina", "Josefa", "Antonia", "Trinidad", "Francisca", "Constanza"
    ]
    lastnames = [
        "Gonzalez", "Munoz", "Rojas", "Diaz", "Perez", "Soto", "Contreras", "Silva", "Martinez", "Sepulveda",
        "Morales", "Rodriguez", "Lopez", "Fuentes", "Hernandez", "Torres", "Araya", "Flores", "Espinoza", "Valenzuela"
    ]

    for i in range(n):
        first_name = random.choice(names)
        last_name = random.choice(lastnames)
        username = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 999)}"
        email = f"{username}@example.com"
        
        if User.objects.filter(username=username).exists():
            continue

        user = User.objects.create_user(username=username, email=email, password="password123")
        user.first_name = first_name
        user.last_name = last_name
        user.save()

        client = Cliente.objects.create(
            user=user,
            nombre_completo=f"{first_name} {last_name}",
            email=email,
            telefono=f"+569{random.randint(10000000, 99999999)}",
            comuna_vive="Santiago",
            tipo_cliente='B2C',
            estado_ciclo=random.choice(['LEAD', 'PROSPECTO', 'CLIENTE'])
        )
        clients.append(client)
    return clients

def create_workshops(interests):
    print("Creando talleres...")
    workshops_data = [
        # Resina (5 niveles)
        {"nombre": "Resina Nivel 1: Introducción", "cat": "Resina", "precio": 45000},
        {"nombre": "Resina Nivel 2: Joyería", "cat": "Resina", "precio": 50000},
        {"nombre": "Resina Nivel 3: Bandejas y Posavasos", "cat": "Resina", "precio": 55000},
        {"nombre": "Resina Nivel 4: Geodas", "cat": "Resina", "precio": 60000},
        {"nombre": "Resina Nivel 5: Mesas de Río", "cat": "Resina", "precio": 80000},
        
        # Encuadernación (2 niveles)
        {"nombre": "Encuadernación Nivel 1: Costura Japonesa", "cat": "Encuadernación", "precio": 40000},
        {"nombre": "Encuadernación Nivel 2: Tapa Dura y Copta", "cat": "Encuadernación", "precio": 45000},
        
        # Otros
        {"nombre": "Taller de Estampados Botánicos", "cat": "Arte", "precio": 35000},
        {"nombre": "Creación de Timbres Artesanales", "cat": "Arte", "precio": 30000},
        {"nombre": "Aromaterapia Básica", "cat": "Bienestar", "precio": 35000},
        {"nombre": "Automaquillaje para el Día a Día", "cat": "Bienestar", "precio": 40000},
    ]

    created_workshops = []
    today = timezone.now().date()

    for data in workshops_data:
        # Create 2 dates for each workshop: one past, one future
        dates = [today - timedelta(days=random.randint(1, 30)), today + timedelta(days=random.randint(1, 30))]
        
        for d in dates:
            taller = Taller.objects.create(
                nombre=f"{data['nombre']} - {'Edición Pasada' if d < today else 'Próxima Edición'}",
                descripcion=f"Aprende todo sobre {data['nombre']} en este taller práctico y divertido. Incluye todos los materiales.",
                categoria=interests.get(data['cat'], interests['Arte']),
                fecha_taller=d,
                hora_taller=time(10, 0) if random.random() > 0.5 else time(15, 0),
                modalidad='PRESENCIAL',
                precio=data['precio'],
                cupos_totales=10,
                cupos_disponibles=10
            )
            created_workshops.append(taller)
    return created_workshops

def create_courses(interests):
    print("Creando cursos grabados...")
    courses_data = [
        {"nombre": "Curso Online de Resina Epóxica", "cat": "Resina", "precio": 25000},
        {"nombre": "Encuadernación desde Casa", "cat": "Encuadernación", "precio": 20000},
        {"nombre": "Estampado Textil DIY", "cat": "Arte", "precio": 15000},
        {"nombre": "Introducción a la Aromaterapia", "cat": "Bienestar", "precio": 18000},
        {"nombre": "Automaquillaje Express", "cat": "Bienestar", "precio": 22000},
    ]

    created_courses = []
    for data in courses_data:
        curso = Curso.objects.create(
            titulo=data['nombre'],
            categoria=interests.get(data['cat'], interests['Arte']),
            descripcion=f"Curso completo de {data['nombre']} para ver a tu ritmo. Acceso de por vida.",
            precio=data['precio'],
            duracion=f"{random.randint(2, 10)} horas",
            rating=round(random.uniform(4.0, 5.0), 1),
            estudiantes=random.randint(0, 100)
        )
        created_courses.append(curso)
    return created_courses

def create_blogs(interests, users):
    print("Creando posts de blog...")
    blog_topics = [
        "5 Rutinas de Autocuidado para Empezar el Día",
        "Beneficios de la Aromaterapia en tu Hogar",
        "Cómo Organizar tu Espacio de Trabajo Creativo",
        "La Importancia de Dedicar Tiempo a tus Hobbies",
        "Guía Básica para Cuidar tus Piezas de Resina",
        "Ideas para Regalar Hechas a Mano",
        "Mindfulness y Manualidades: Una Conexión Poderosa",
        "Tendencias en Decoración 2024",
    ]

    admin_user = User.objects.filter(is_superuser=True).first() or users[0].user

    for title in blog_topics:
        Post.objects.create(
            titulo=title,
            extracto=f"Descubre {title.lower()} y mejora tu bienestar con estos simples consejos.",
            contenido=f"<p>Aquí te contamos todo sobre <strong>{title}</strong>.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>",
            autor=admin_user,
            categoria=interests['Bienestar'] if "Autocuidado" in title or "Aromaterapia" in title else interests['Arte'],
            fecha_publicacion=timezone.now() - timedelta(days=random.randint(1, 60))
        )

def enroll_users(clients, workshops, courses):
    print("Inscribiendo usuarios con datos históricos...")
    
    # Create enrollments with historical dates (last 12 months)
    for client in clients:
        # Determine how many months ago this client started (0-12 months)
        months_ago = random.randint(0, 12)
        base_date = timezone.now() - timedelta(days=30 * months_ago)
        
        # Enroll in workshops
        workshops_to_enroll = random.sample(workshops, k=random.randint(0, min(3, len(workshops))))
        for i, workshop in enumerate(workshops_to_enroll):
            if workshop.cupos_disponibles > 0:
                # Spread enrollments over time
                enrollment_date = base_date + timedelta(days=random.randint(0, 30 * min(i + 1, months_ago + 1)))
                
                inscripcion = Inscripcion.objects.create(
                    cliente=client,
                    taller=workshop,
                    monto_pagado=workshop.precio,
                    estado_pago=random.choice(['PAGADO', 'PAGADO', 'PAGADO', 'PENDIENTE'])  # 75% paid
                )
                # Manually set the fecha_inscripcion to historical date
                inscripcion.fecha_inscripcion = enrollment_date
                inscripcion.save(update_fields=['fecha_inscripcion'])
        
        # Enroll in courses
        courses_to_enroll = random.sample(courses, k=random.randint(0, min(2, len(courses))))
        for i, course in enumerate(courses_to_enroll):
            # Spread enrollments over time
            enrollment_date = base_date + timedelta(days=random.randint(0, 30 * min(i + 1, months_ago + 1)))
            
            inscripcion_curso = InscripcionCurso.objects.create(
                cliente=client,
                curso=course,
                monto_pagado=course.precio,
                estado_pago=random.choice(['PAGADO', 'PAGADO', 'PAGADO', 'PENDIENTE']),  # 75% paid
                progreso=random.randint(0, 100)
            )
            # Manually set the fecha_inscripcion to historical date
            inscripcion_curso.fecha_inscripcion = enrollment_date
            inscripcion_curso.save(update_fields=['fecha_inscripcion'])

def main():
    clean_database()
    interests = create_interests()
    clients = create_users_and_clients()
    workshops = create_workshops(interests)
    courses = create_courses(interests)
    create_blogs(interests, clients)
    enroll_users(clients, workshops, courses)
    print("¡Base de datos poblada con éxito!")

if __name__ == "__main__":
    main()
