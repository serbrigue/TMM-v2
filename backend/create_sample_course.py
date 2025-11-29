import os
import django
import sys
from decimal import Decimal

sys.path.append('c:/Users/HpNot/Desktop/TMM v2/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from api.models import Curso, Interes

# Create category if not exists
categoria, created = Interes.objects.get_or_create(
    nombre="Marketing Digital",
    defaults={'descripcion': 'Cursos sobre marketing digital'}
)

# Create sample course
curso, created = Curso.objects.get_or_create(
    titulo="Curso de Marketing Digital",
    defaults={
        'categoria': categoria,
        'descripcion': 'Aprende a vender más con estrategias digitales.',
        'precio': Decimal('50000'),
        'duracion': '10 horas',
        'esta_activo': True
    }
)

print(f"Course created/retrieved: ID={curso.id}, Title={curso.titulo}")
