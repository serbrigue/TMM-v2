import os
import django
import sys

sys.path.append('c:/Users/HpNot/Desktop/TMM v2/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from api.models import Curso

print("Listing all courses:")
for curso in Curso.objects.all():
    print(f"ID: {curso.id}, Title: {curso.titulo}, Active: {curso.esta_activo}")
