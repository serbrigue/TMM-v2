from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
import calendar
from .models import Enrollment, Cliente, Taller, Resena, Curso
from django.contrib.contenttypes.models import ContentType

class RevenueService:
    @staticmethod
    def get_total_revenue(client_type=None, period='all'):
        query = Enrollment.objects.filter(estado_pago='PAGADO')
        
        if client_type:
            query = query.filter(cliente__tipo_cliente=client_type)
            
        if period == 'month':
            today = timezone.now().date()
            start_month = today.replace(day=1)
            query = query.filter(fecha_inscripcion__gte=start_month)
            
        total_revenue = query.aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
        return int(total_revenue)

    @staticmethod
    def get_active_students_count(client_type=None):
        query = Cliente.objects.filter(estado_ciclo='CLIENTE')
        if client_type:
            query = query.filter(tipo_cliente=client_type)
        return query.count()

    @staticmethod
    def get_upcoming_workshops_count(days=30, client_type=None):
        today = timezone.now().date()
        return Taller.objects.filter(
            fecha_taller__gte=today,
            fecha_taller__lte=today + timedelta(days=days),
            esta_activo=True
        ).count()

    @staticmethod
    def get_new_leads_count(client_type=None, period='all'):
        query = Cliente.objects.filter(estado_ciclo='LEAD')
        if client_type:
            query = query.filter(tipo_cliente=client_type)
            
        if period == 'month':
            today = timezone.now().date()
            start_month = today.replace(day=1)
            query = query.filter(fecha_registro__gte=start_month)
            
        return query.count()
        
    @staticmethod
    def get_daily_revenue_chart(client_type=None):
        """Returns daily revenue for the current month."""
        from django.db.models.functions import TruncDay
        
        today = timezone.now().date()
        start_month = today.replace(day=1)
        
        query = Enrollment.objects.filter(
            fecha_inscripcion__gte=start_month,
            estado_pago='PAGADO'
        )
        
        if client_type:
            query = query.filter(cliente__tipo_cliente=client_type)
            
        revenue_per_day = query.annotate(
            day=TruncDay('fecha_inscripcion')
        ).values('day').annotate(
            total=Sum('monto_pagado')
        ).order_by('day')
        
        revenue_map = {entry['day'].strftime('%d'): entry['total'] for entry in revenue_per_day}
        
        # Generate all days until today
        chart_data = []
        current = start_month
        while current <= today:
            day_str = current.strftime('%d')
            chart_data.append({
                "day": day_str,
                "amount": int(revenue_map.get(day_str, 0))
            })
            current += timedelta(days=1)
            
        return chart_data

    @staticmethod
    def get_revenue_chart_data(months=4, client_type=None):
        from django.db.models.functions import TruncMonth
        
        end_date = timezone.now().date().replace(day=1) + timedelta(days=32)
        end_date = end_date.replace(day=1) # First day of next month
        start_date = end_date - timedelta(days=30 * months + 15) # Approx start
        start_date = start_date.replace(day=1)

        query = Enrollment.objects.filter(
            fecha_inscripcion__gte=start_date,
            fecha_inscripcion__lt=end_date,
            estado_pago='PAGADO'
        )

        if client_type:
            query = query.filter(cliente__tipo_cliente=client_type)

        revenue_per_month = query.annotate(
            month=TruncMonth('fecha_inscripcion')
        ).values('month').annotate(
            total=Sum('monto_pagado')
        ).order_by('month')

        # Format for frontend
        revenue_map = {entry['month'].strftime('%b'): entry['total'] for entry in revenue_per_month}
        
        revenue_chart = []
        for i in range(months - 1, -1, -1):
            month_date = timezone.now().date() - timedelta(days=30 * i)
            month_name = month_date.strftime('%b') # e.g., "Nov"
            # Spanish translation if needed, or keep English abbr
            revenue_chart.append({
                "month": month_name,
                "amount": int(revenue_map.get(month_name, 0))
            })
            
        return revenue_chart

    @staticmethod
    def get_year_revenue():
        year_start = timezone.now().date().replace(month=1, day=1)
        return int(Enrollment.objects.filter(
            fecha_inscripcion__gte=year_start,
            estado_pago='PAGADO'
        ).aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0)

    @staticmethod
    def get_pending_payments_stats():
        pending_query = Enrollment.objects.filter(estado_pago='PENDIENTE')
        pending_payments = int(pending_query.aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0)
        pending_count = pending_query.count()
        return pending_payments, pending_count

    @staticmethod
    def get_average_ticket():
        total_transactions = Enrollment.objects.filter(estado_pago='PAGADO').count()
        total_revenue = Enrollment.objects.filter(estado_pago='PAGADO').aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
        return int(total_revenue / total_transactions) if total_transactions > 0 else 0

    @staticmethod
    def get_recent_transactions(limit=10):
        recent_transactions = []
        enrollments = Enrollment.objects.select_related('cliente', 'content_type').order_by('-fecha_inscripcion')[:limit]
        for insc in enrollments:
            concepto = "Desconocido"
            if insc.content_object:
                if hasattr(insc.content_object, 'nombre'):
                    concepto = insc.content_object.nombre # Taller
                elif hasattr(insc.content_object, 'titulo'):
                    concepto = insc.content_object.titulo # Curso
            
            recent_transactions.append({
                'id': f'EN-{insc.id}',
                'cliente': insc.cliente.nombre_completo,
                'concepto': concepto,
                'fecha': insc.fecha_inscripcion.strftime('%d %b %Y'),
                'monto': int(insc.monto_pagado),
                'estado': insc.estado_pago
            })
        return recent_transactions

    @staticmethod
    def get_popular_categories(client_type=None):
        """
        Calcula las categorías más populares basándose en el número de inscripciones.
        """
        categories = {}
        
        # Optimized fetch: prefetch content_object to avoid N+1
        enrollments = Enrollment.objects.filter(estado_pago='PAGADO').prefetch_related('content_object')
        
        if client_type:
            enrollments = enrollments.filter(cliente__tipo_cliente=client_type)
            
        for enrollment in enrollments:
            item = enrollment.content_object
            # Safety check if item exists and has categoria
            if item and hasattr(item, 'categoria') and item.categoria:
                cat_name = item.categoria.nombre
                categories[cat_name] = categories.get(cat_name, 0) + 1
            else:
                categories['Sin Categoría'] = categories.get('Sin Categoría', 0) + 1
            
        sorted_categories = sorted(categories.items(), key=lambda x: x[1], reverse=True)[:5]
        return [{"name": name, "value": count} for name, count in sorted_categories]

    @staticmethod
    def get_top_rated_workshops(client_type=None):
        """
        Obtiene los talleres mejor calificados basados en reseñas.
        """
        from django.db.models import Avg
        
        # Default behavior (All)
        top_rated = Taller.objects.annotate(avg_rating=Avg('resenas__calificacion')).filter(avg_rating__isnull=False).order_by('-avg_rating')[:5]
        
        if top_rated.exists():
            return [{"name": t.nombre, "rating": round(t.avg_rating, 1), "reviews": t.resenas.count()} for t in top_rated]
        
        # Fallback to most enrolled if no reviews
        # We need to count enrollments for each workshop
        # Since Enrollment is generic, we can query Enrollment where content_type is Taller
        ct = ContentType.objects.get_for_model(Taller)
        
        # This is a bit manual without reverse relation on Taller to Enrollment (GenericRelation not defined on Taller yet)
        # Let's define it on Taller model? No, let's just query Enrollment.
        
        most_enrolled_ids = Enrollment.objects.filter(content_type=ct).values('object_id').annotate(count=Count('id')).order_by('-count')[:5]
        
        results = []
        for item in most_enrolled_ids:
            try:
                taller = Taller.objects.get(id=item['object_id'])
                results.append({
                    "name": taller.nombre, 
                    "rating": 5.0, 
                    "reviews": item['count'], 
                    "is_enrollment_proxy": True
                })
            except Taller.DoesNotExist:
                continue
                
        return results

class EnrollmentService:
    @staticmethod
    def create_enrollment(user, item_type, item_id):
        """
        Creates an enrollment for a user (client) into a course or workshop.
        """
        try:
            cliente = user.cliente_perfil
        except Cliente.DoesNotExist:
            raise ValueError("Perfil de cliente no encontrado")

        model_class = None
        if item_type == 'curso':
            model_class = Curso
        elif item_type == 'taller':
            model_class = Taller
        else:
            raise ValueError("Tipo de inscripción inválido")

        try:
            item = model_class.objects.get(id=item_id)
        except model_class.DoesNotExist:
            raise ValueError(f"{item_type.capitalize()} no encontrado")

        ct = ContentType.objects.get_for_model(model_class)
        
        # Check if already enrolled
        if Enrollment.objects.filter(cliente=cliente, content_type=ct, object_id=item.id).exists():
            return None, "Ya estás inscrito en este item"

        # Create enrollment
        # Validation (capacity) is handled in Enrollment.clean() called by full_clean() or save() if custom
        # We call full_clean() to ensure validation
        enrollment = Enrollment(
            cliente=cliente,
            content_type=ct,
            object_id=item.id,
            monto_pagado=0,
            estado_pago='PENDIENTE'
        )
        enrollment.full_clean()
        enrollment.save()
        
        return enrollment, "Inscripción creada exitosamente"
