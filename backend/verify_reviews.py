import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Cliente, Curso, Resena, Interes

def verify():
    print("--- Starting Verification ---")
    
    # 1. Setup Data
    try:
        user, _ = User.objects.get_or_create(username='test_reviewer', email='test@example.com')
        cliente, _ = Cliente.objects.get_or_create(user=user, defaults={'nombre_completo': 'Test Reviewer', 'email': 'test@example.com'})
        
        categoria, _ = Interes.objects.get_or_create(nombre='Test Category')
        curso, _ = Curso.objects.get_or_create(titulo='Test Course', defaults={'precio': 10000, 'duracion': '1h', 'categoria': categoria})
        
        print(f"Initial Course Rating: {curso.rating}")
        
        # 2. Create Review
        print("Creating 5-star review...")
        Resena.objects.create(cliente=cliente, curso=curso, calificacion=5, comentario="Excellent!")
        
        curso.refresh_from_db()
        print(f"Course Rating after 5-star: {curso.rating}")
        
        if curso.rating == 5.0:
            print("✅ Rating updated correctly to 5.0")
        else:
            print(f"❌ Rating failed update. Expected 5.0, got {curso.rating}")

        # 3. Create another review
        print("Creating 1-star review...")
        Resena.objects.create(cliente=cliente, curso=curso, calificacion=1, comentario="Bad!")
        
        curso.refresh_from_db()
        print(f"Course Rating after 1-star: {curso.rating}")
        
        if curso.rating == 3.0:
            print("✅ Rating updated correctly to 3.0 (Average of 5 and 1)")
        else:
            print(f"❌ Rating failed update. Expected 3.0, got {curso.rating}")
            
    except Exception as e:
        print(f"❌ Verification failed with error: {e}")

if __name__ == '__main__':
    verify()
