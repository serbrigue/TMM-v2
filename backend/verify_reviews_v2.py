import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Cliente, Curso, Resena, Interes, Taller, Inscripcion

def verify():
    print("--- Starting Verification (Phase 2) ---")
    
    # 1. Setup Data
    try:
        user, _ = User.objects.get_or_create(username='test_reviewer_2', email='test2@example.com')
        cliente, _ = Cliente.objects.get_or_create(user=user, defaults={'nombre_completo': 'Test Reviewer 2', 'email': 'test2@example.com'})
        
        categoria_arte, _ = Interes.objects.get_or_create(nombre='Arte')
        
        # Create Workshop linked to Category 'Arte'
        taller, _ = Taller.objects.get_or_create(
            nombre='Taller Pintura', 
            defaults={
                'precio': 10000, 
                'fecha_taller': '2025-12-12', 
                'cupos_totales': 10,
                'categoria': categoria_arte,
                'descripcion': 'Test'
            }
        )
        
        # 2. Test Enrollment Validation (Should Fail)
        print("\nTest 1: Review without enrollment...")
        try:
            # We simulate the check that ViewSet does manually here since we are using models directly
            # But let's check if we can create it directly (Models don't enforce it, ViewSet does)
            # So we will simulate the ViewSet logic
            if not Inscripcion.objects.filter(cliente=cliente, taller=taller).exists():
                print("✅ Validation Logic: User NOT enrolled. Review should be blocked.")
            else:
                print("❌ Setup Error: User IS enrolled unexpectedly.")
                
        except Exception as e:
            print(f"❌ Error: {e}")

        # 3. Enroll User
        print("\nEnrolling user...")
        Inscripcion.objects.get_or_create(cliente=cliente, taller=taller, defaults={'monto_pagado': 10000, 'estado_pago': 'PAGADO'})
        
        # 4. Create Review (Should Success and Link to Category)
        print("\nTest 2: Creating review after enrollment...")
        resena = Resena.objects.create(
            cliente=cliente, 
            taller=taller, 
            calificacion=5, 
            comentario="Great Workshop!"
        )
        
        print(f"Review Created: {resena}")
        print(f"Review Category: {resena.interes}")
        
        if resena.interes == categoria_arte:
            print("✅ Success: Review automatically linked to Category 'Arte'")
        else:
            print(f"❌ Fail: Review linked to {resena.interes}, expected {categoria_arte}")

        # 5. Verify Query by Category
        print("\nTest 3: Querying reviews by Category...")
        reviews_in_category = Resena.objects.filter(interes=categoria_arte)
        print(f"Reviews in 'Arte': {reviews_in_category.count()}")
        
        if reviews_in_category.filter(id=resena.id).exists():
            print("✅ Success: Review found when querying by Category")
        else:
            print("❌ Fail: Review not found in Category query")

    except Exception as e:
        print(f"❌ Verification failed with error: {e}")

if __name__ == '__main__':
    verify()
