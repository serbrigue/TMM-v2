from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
import calendar
from .models import Inscripcion, InscripcionCurso, Cliente, Taller

class RevenueService:
    @staticmethod
    def get_total_revenue(client_type=None):
        talleres_query = Inscripcion.objects.filter(estado_pago='PAGADO')
        cursos_query = InscripcionCurso.objects.filter(estado_pago='PAGADO')
        
        if client_type:
            talleres_query = talleres_query.filter(cliente__tipo_cliente=client_type)
            cursos_query = cursos_query.filter(cliente__tipo_cliente=client_type)
            
        total_revenue_talleres = talleres_query.aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
        total_revenue_cursos = cursos_query.aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
        return int(total_revenue_talleres + total_revenue_cursos)

    @staticmethod
    def get_active_students_count(client_type=None):
        query = Cliente.objects.filter(estado_ciclo='CLIENTE')
        if client_type:
            query = query.filter(tipo_cliente=client_type)
        return query.count()

    @staticmethod
    def get_upcoming_workshops_count(days=30, client_type=None):
        today = timezone.now().date()
        # Note: Workshops are not strictly B2B/B2C, but we can filter by enrollments if needed.
        # However, usually workshops are open to all. 
        # If the user wants to see workshops that have B2B enrollments, that's different.
        # For now, we'll keep it general or filter if the workshop is exclusive (not implemented).
        # Let's assume we return all workshops for now as they are products.
        return Taller.objects.filter(
            fecha_taller__gte=today,
            fecha_taller__lte=today + timedelta(days=days),
            esta_activo=True
        ).count()

    @staticmethod
    def get_new_leads_count(client_type=None):
        query = Cliente.objects.filter(estado_ciclo='LEAD')
        if client_type:
            query = query.filter(tipo_cliente=client_type)
        return query.count()

    @staticmethod
    def get_revenue_chart_data(months=4, client_type=None):
        revenue_chart = []
        for i in range(months - 1, -1, -1):
            month_date = timezone.now().date() - timedelta(days=30 * i)
            month_start = month_date.replace(day=1)
            if month_date.month == 12:
                month_end = month_date.replace(year=month_date.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                month_end = month_date.replace(month=month_date.month + 1, day=1) - timedelta(days=1)

            talleres_query = Inscripcion.objects.filter(
                fecha_inscripcion__gte=month_start,
                fecha_inscripcion__lte=month_end,
                estado_pago='PAGADO'
            )
            cursos_query = InscripcionCurso.objects.filter(
                fecha_inscripcion__gte=month_start,
                fecha_inscripcion__lte=month_end,
                estado_pago='PAGADO'
            )

            if client_type:
                talleres_query = talleres_query.filter(cliente__tipo_cliente=client_type)
                cursos_query = cursos_query.filter(cliente__tipo_cliente=client_type)

            talleres_revenue = talleres_query.aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
            cursos_revenue = cursos_query.aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0

            month_revenue = int(talleres_revenue + cursos_revenue)
            month_name = calendar.month_abbr[month_date.month][:3].capitalize()

            revenue_chart.append({
                "month": month_name,
                "amount": month_revenue
            })
        return revenue_chart

    @staticmethod
    def get_year_revenue():
        year_start = timezone.now().date().replace(month=1, day=1)
        talleres_year = Inscripcion.objects.filter(
            fecha_inscripcion__gte=year_start,
            estado_pago='PAGADO'
        ).aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
        
        cursos_year = InscripcionCurso.objects.filter(
            fecha_inscripcion__gte=year_start,
            estado_pago='PAGADO'
        ).aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
        
        return int(talleres_year + cursos_year)

    @staticmethod
    def get_pending_payments_stats():
        pending_talleres = Inscripcion.objects.filter(estado_pago='PENDIENTE').aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
        pending_cursos = InscripcionCurso.objects.filter(estado_pago='PENDIENTE').aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
        pending_payments = int(pending_talleres + pending_cursos)
        pending_count = Inscripcion.objects.filter(estado_pago='PENDIENTE').count() + InscripcionCurso.objects.filter(estado_pago='PENDIENTE').count()
        return pending_payments, pending_count

    @staticmethod
    def get_average_ticket():
        total_transactions = Inscripcion.objects.filter(estado_pago='PAGADO').count() + InscripcionCurso.objects.filter(estado_pago='PAGADO').count()
        total_all_revenue = Inscripcion.objects.filter(estado_pago='PAGADO').aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
        total_all_revenue += InscripcionCurso.objects.filter(estado_pago='PAGADO').aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
        return int(total_all_revenue / total_transactions) if total_transactions > 0 else 0

    @staticmethod
    def get_recent_transactions(limit=10):
        recent_transactions = []
        
        # Get recent workshop enrollments
        talleres_recientes = Inscripcion.objects.select_related('cliente', 'taller').order_by('-fecha_inscripcion')[:limit]
        for insc in talleres_recientes:
            recent_transactions.append({
                'id': f'TR-{insc.id}',
                'cliente': insc.cliente.nombre_completo,
                'concepto': insc.taller.nombre,
                'fecha': insc.fecha_inscripcion.strftime('%d %b %Y'),
                'monto': int(insc.monto_pagado),
                'estado': insc.estado_pago
            })
        
        # Get recent course enrollments
        cursos_recientes = InscripcionCurso.objects.select_related('cliente', 'curso').order_by('-fecha_inscripcion')[:limit]
        for insc in cursos_recientes:
            recent_transactions.append({
                'id': f'CR-{insc.id}',
                'cliente': insc.cliente.nombre_completo,
                'concepto': insc.curso.titulo,
                'fecha': insc.fecha_inscripcion.strftime('%d %b %Y'),
                'monto': int(insc.monto_pagado),
                'estado': insc.estado_pago
            })
        
        # Sort by date and take top N
        recent_transactions.sort(key=lambda x: x['fecha'], reverse=True)
        return recent_transactions[:limit]

    @staticmethod
    def get_popular_categories(client_type=None):
        """
        Calcula las categorías más populares basándose en el número de inscripciones (talleres y cursos).
        """
        from .models import Interes
        
        categories = {}
        
        talleres_query = Inscripcion.objects.filter(estado_pago='PAGADO')
        cursos_query = InscripcionCurso.objects.filter(estado_pago='PAGADO')
        
        if client_type:
            talleres_query = talleres_query.filter(cliente__tipo_cliente=client_type)
            cursos_query = cursos_query.filter(cliente__tipo_cliente=client_type)

        # Count workshop enrollments by category
        talleres_counts = talleres_query.values('taller__categoria__nombre').annotate(count=Count('id'))
        for item in talleres_counts:
            cat_name = item['taller__categoria__nombre'] or 'Sin Categoría'
            categories[cat_name] = categories.get(cat_name, 0) + item['count']
            
        # Count course enrollments by category
        cursos_counts = cursos_query.values('curso__categoria__nombre').annotate(count=Count('id'))
        for item in cursos_counts:
            cat_name = item['curso__categoria__nombre'] or 'Sin Categoría'
            categories[cat_name] = categories.get(cat_name, 0) + item['count']
            
        # Format for chart
        sorted_categories = sorted(categories.items(), key=lambda x: x[1], reverse=True)[:5]
        return [{"name": name, "value": count} for name, count in sorted_categories]

    @staticmethod
    def get_top_rated_workshops(client_type=None):
        """
        Obtiene los talleres mejor calificados basados en reseñas.
        Si no hay reseñas, usa el número de inscritos como proxy de popularidad.
        """
        from django.db.models import Avg, Q
        
        # If client_type is specified, we should ideally filter reviews by client type
        # But reviews are linked to client, so we can.
        
        reviews_query = Resena.objects.all()
        if client_type:
            reviews_query = reviews_query.filter(cliente__tipo_cliente=client_type)

        # This is a bit complex to do in one query efficiently with the current structure if we want to filter the AVG by client type
        # For simplicity, if client_type is set, we might rely more on the enrollment count proxy which is easier to filter
        
        # Try to get top rated by reviews first (filtered)
        # We need to annotate Taller with the avg rating of the filtered reviews
        # This is tricky in Django ORM without subqueries or complex annotations.
        # Let's stick to the enrollment proxy for B2B specific views as it's more robust for "Popularity"
        
        if client_type:
             # Fallback to most enrolled by that client type
            most_enrolled = Taller.objects.filter(
                inscripciones__cliente__tipo_cliente=client_type
            ).annotate(enrollment_count=Count('inscripciones')).order_by('-enrollment_count')[:5]
            return [{"name": t.nombre, "rating": 5.0, "reviews": t.enrollment_count, "is_enrollment_proxy": True} for t in most_enrolled]

        # Default behavior (All)
        top_rated = Taller.objects.annotate(avg_rating=Avg('resenas__calificacion')).filter(avg_rating__isnull=False).order_by('-avg_rating')[:5]
        
        if top_rated.exists():
            return [{"name": t.nombre, "rating": round(t.avg_rating, 1), "reviews": t.resenas.count()} for t in top_rated]
        
        # Fallback to most enrolled if no reviews
        most_enrolled = Taller.objects.annotate(enrollment_count=Count('inscripciones')).order_by('-enrollment_count')[:5]
        return [{"name": t.nombre, "rating": 5.0, "reviews": t.enrollment_count, "is_enrollment_proxy": True} for t in most_enrolled]
