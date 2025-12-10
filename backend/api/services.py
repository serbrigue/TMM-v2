from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from django.db import transaction, IntegrityError
from django.contrib.contenttypes.models import ContentType
from .models import Enrollment, Cliente, Taller, Resena, Curso, Orden, DetalleOrden, Producto, Transaccion
import logging

logger = logging.getLogger('api')

class ClientService:
    @staticmethod
    def resolve_client(user, data=None):
        """
        Finds or creates a Client profile for a User.
        """
        if hasattr(user, 'cliente_perfil'):
            return user.cliente_perfil
        
        # Check by email if detached
        cliente = Cliente.objects.filter(email=user.email).first()
        if cliente:
            if not cliente.user:
                cliente.user = user
                cliente.save()
            return cliente
            
        # Create new
        initial_data = {
            'user': user,
            'nombre_completo': f"{user.first_name} {user.last_name}".strip() or user.username,
            'email': user.email,
            'tipo_cliente': 'B2C',
            'estado_ciclo': 'LEAD',
            'origen': 'WEB'
        }
        
        if data and 'origen' in data:
            initial_data['origen'] = data['origen']
            
        return Cliente.objects.create(**initial_data)

class NotificationService:
    """Delagates to email_utils but provides a service interface."""
    @staticmethod
    def notify_new_workshop(taller, clients):
        from .email_utils import send_new_workshop_notification
        return send_new_workshop_notification(taller, clients)

    @staticmethod
    def notify_workshop_update(taller, clients, old_date, old_time):
        from .email_utils import send_workshop_update_notification
        return send_workshop_update_notification(taller, clients, old_date, old_time)

    @staticmethod
    def notify_workshop_cancellation(taller, clients):
        from .email_utils import send_workshop_cancellation
        return send_workshop_cancellation(taller, clients)
        
    @staticmethod
    def notify_activation(user, uid, token):
         from .email_utils import send_activation_email
         return send_activation_email(user, uid, token)
         
    @staticmethod
    def notify_password_reset(user, uid, token):
         from .email_utils import send_password_reset_email
         return send_password_reset_email(user, uid, token)

class OrderService:
    @staticmethod
    def create_order_from_cart(user, cart_items):
        """
        Creates an Order from cart items, handling stock locking and enrollments.
        """
        cliente = ClientService.resolve_client(user)
        
        if not cart_items:
            raise ValueError("El carrito está vacío")

        total_amount = 0
        enrollments_created = []

        try:
            with transaction.atomic():
                # 1. Create Order Shell
                orden = Orden.objects.create(
                    cliente=cliente,
                    monto_total=0 
                )

                # 2. Process Items
                for item in cart_items:
                    item_type = item.get('type')
                    item_id = item.get('id')
                    quantity = item.get('quantity', 1)

                    if item_type == 'product':
                        # Lock Product
                        producto = Producto.objects.select_for_update().get(id=item_id)
                        
                        if not producto.tiene_stock(quantity):
                            raise ValueError(f"Stock insuficiente para {producto.nombre}. Disponible: {producto.stock_actual}")
                        
                        DetalleOrden.objects.create(
                            orden=orden,
                            producto=producto,
                            cantidad=quantity,
                            precio_unitario=producto.precio_venta
                        )
                        
                        if producto.controlar_stock:
                            producto.stock_actual -= quantity
                            producto.save()
                        
                        total_amount += (producto.precio_venta * quantity)

                    elif item_type in ['workshop', 'course', 'taller', 'curso']:
                        if item_type in ['workshop', 'taller']:
                            backend_type = 'taller'
                        else:
                            backend_type = 'curso'
                        
                        # Use EnrollmentService logic (which handles locking too)
                        # Check existance first to avoid overhead if duplicate
                        ct = ContentType.objects.get_for_model(Taller if backend_type == 'taller' else Curso)
                        if Enrollment.objects.filter(cliente=cliente, content_type=ct, object_id=item_id).exists():
                            logger.info(f"User {user.email} already enrolled in {item_type} {item_id}, skipping in order.")
                            continue

                        enrollment, _ = EnrollmentService.create_enrollment(
                            user=user, 
                            item_type=backend_type, 
                            item_id=item_id, 
                            cliente=cliente
                        )
                        if enrollment:
                            enrollments_created.append(enrollment)
                            # Add full price to order total
                            if hasattr(enrollment.content_object, 'precio'):
                                total_amount += enrollment.content_object.precio
                            else:
                                total_amount += enrollment.monto_pagado

                # 3. Link Enrollments
                if enrollments_created:
                    orden.enrollments.set(enrollments_created)

                # 4. Update Total
                orden.monto_total = total_amount
                orden.save()
                
                return orden

        except Exception as e:
            logger.error(f"Error creating order: {e}")
            raise e

class RevenueService:
    @staticmethod
    def get_total_revenue(client_type=None, period='all', start_date=None, end_date=None):
        service_revenue = RevenueService.get_service_revenue(client_type, period, start_date, end_date)
        product_revenue = RevenueService.get_product_revenue(client_type, period, start_date, end_date)
        return service_revenue + product_revenue

    @staticmethod
    def get_service_revenue(client_type=None, period='all', start_date=None, end_date=None):
        query = Enrollment.objects.filter(estado_pago='PAGADO')
        
        if client_type:
            query = query.filter(cliente__tipo_cliente=client_type)
            
        if start_date and end_date:
            query = query.filter(fecha_inscripcion__date__range=[start_date, end_date])
        elif period == 'month':
            today = timezone.now().date()
            start_month = today.replace(day=1)
            query = query.filter(fecha_inscripcion__gte=start_month)
            
        return int(query.aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0)

    @staticmethod
    def get_product_revenue(client_type=None, period='all', start_date=None, end_date=None):
        # Orden uses estado_pago, not estado.
        query = Orden.objects.filter(estado_pago='PAGADO')
        
        if client_type:
            query = query.filter(cliente__tipo_cliente=client_type)
            
        if start_date and end_date:
            query = query.filter(fecha__date__range=[start_date, end_date])
        elif period == 'month':
            today = timezone.now().date()
            start_month = today.replace(day=1)
            query = query.filter(fecha__gte=start_month)
            
        return int(query.aggregate(Sum('monto_total'))['monto_total__sum'] or 0)

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
    def get_new_leads_count(client_type=None, period='all', start_date=None, end_date=None):
        query = Cliente.objects.filter(estado_ciclo='LEAD')
        if client_type:
            query = query.filter(tipo_cliente=client_type)
            
        if start_date and end_date:
            query = query.filter(fecha_registro__date__range=[start_date, end_date])
        elif period == 'month':
            today = timezone.now().date()
            start_month = today.replace(day=1)
            query = query.filter(fecha_registro__gte=start_month)
            
        return query.count()
        
    @staticmethod
    def get_daily_revenue_chart(client_type=None, start_date=None, end_date=None):
        """Returns daily revenue for the current month or specified range."""
        from django.db.models.functions import TruncDay
        from datetime import datetime
        
        today = timezone.now().date()
        
        if start_date and end_date:
            # Parse if strings
            if isinstance(start_date, str):
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            if isinstance(end_date, str):
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            query_start = start_date
            query_end = end_date
        else:
            query_start = today.replace(day=1)
            query_end = today
        
        # Enrollments
        enrollment_query = Enrollment.objects.filter(
            fecha_inscripcion__date__gte=query_start,
            fecha_inscripcion__date__lte=query_end,
            estado_pago='PAGADO'
        )
        
        if client_type:
            enrollment_query = enrollment_query.filter(cliente__tipo_cliente=client_type)
            
        enrollment_revenue = enrollment_query.annotate(
            day=TruncDay('fecha_inscripcion')
        ).values('day').annotate(
            total=Sum('monto_pagado')
        ).order_by('day')

        # Orders
        order_query = Orden.objects.filter(
            fecha__date__gte=query_start,
            fecha__date__lte=query_end,
            estado_pago='PAGADO'
        )

        if client_type:
            order_query = order_query.filter(cliente__tipo_cliente=client_type)

        order_revenue = order_query.annotate(
            day=TruncDay('fecha')
        ).values('day').annotate(
            total=Sum('monto_total')
        ).order_by('day')
        
        # Merge Data
        revenue_map = {}
        for entry in enrollment_revenue:
            day_str = entry['day'].strftime('%Y-%m-%d')
            revenue_map[day_str] = revenue_map.get(day_str, 0) + int(entry['total'] or 0)

        for entry in order_revenue:
            day_str = entry['day'].strftime('%Y-%m-%d')
            revenue_map[day_str] = revenue_map.get(day_str, 0) + int(entry['total'] or 0)
        
        # Generate all days in range
        chart_data = []
        current = query_start
        while current <= query_end:
            day_str = current.strftime('%Y-%m-%d')
            # Display format can be just day or full date depending on range
            display_day = current.strftime('%d') if (query_end - query_start).days <= 31 else current.strftime('%d/%m')
            
            chart_data.append({
                "day": display_day,
                "full_date": day_str,
                "amount": int(revenue_map.get(day_str, 0))
            })
            current += timedelta(days=1)
            
        return chart_data

    @staticmethod
    def get_revenue_by_category(client_type=None, start_date=None, end_date=None):
        from datetime import datetime
        
        today = timezone.now().date()
        if start_date and end_date:
            if isinstance(start_date, str):
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            if isinstance(end_date, str):
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            query_start = start_date
            query_end = end_date
        else:
            query_start = today.replace(day=1)
            query_end = today

        category_revenue = {}

        # 1. Enrollments (Workshops & Courses)
        enrollments = Enrollment.objects.filter(
            fecha_inscripcion__date__gte=query_start,
            fecha_inscripcion__date__lte=query_end,
            estado_pago='PAGADO'
        ).select_related('content_type')
        
        if client_type:
            enrollments = enrollments.filter(cliente__tipo_cliente=client_type)

        for enrollment in enrollments:
            # Manually fetch category to avoid complex GFK queries
            try:
                obj = enrollment.content_object
                if hasattr(obj, 'categoria') and obj.categoria:
                    cat_name = obj.categoria.nombre
                    category_revenue[cat_name] = category_revenue.get(cat_name, 0) + enrollment.monto_pagado
                else:
                    # Fallback if no category
                    category_revenue['Otros'] = category_revenue.get('Otros', 0) + enrollment.monto_pagado
            except:
                continue

        # 2. Products (via Orders)
        # We need to look at DetalleOrden for approved orders
        order_details = DetalleOrden.objects.filter(
            orden__fecha__date__gte=query_start,
            orden__fecha__date__lte=query_end,
            orden__estado_pago='PAGADO'
        ).select_related('orden', 'producto')

        if client_type:
             order_details = order_details.filter(orden__cliente__tipo_cliente=client_type)

        product_total = 0
        for detail in order_details:
             line_total = detail.precio_unitario * detail.cantidad
             product_total += line_total
        
        if product_total > 0:
            category_revenue['Kits y Productos'] = category_revenue.get('Kits y Productos', 0) + product_total

        # Format for Recharts
        data = [{"name": k, "value": v} for k, v in category_revenue.items()]
        return sorted(data, key=lambda x: x['value'], reverse=True)

    @staticmethod
    def get_revenue_chart_data(months=4, client_type=None):
        from django.db.models.functions import TruncMonth
        
        # Use timezone aware datetimes
        now = timezone.now()
        end_date = now.date().replace(day=1) + timedelta(days=32)
        end_date = end_date.replace(day=1) # First day of next month
        start_date = end_date - timedelta(days=30 * months + 15) # Approx start
        start_date = start_date.replace(day=1)

        # Make aware if needed (though date comparison usually works with date objects in Django)
        # But for TruncMonth it's better to be consistent.

        # Enrollments
        enrollment_query = Enrollment.objects.filter(
            fecha_inscripcion__date__gte=start_date,
            fecha_inscripcion__date__lt=end_date,
            estado_pago='PAGADO'
        )

        if client_type:
            enrollment_query = enrollment_query.filter(cliente__tipo_cliente=client_type)

        enrollment_revenue = enrollment_query.annotate(
            month=TruncMonth('fecha_inscripcion')
        ).values('month').annotate(
            total=Sum('monto_pagado')
        ).order_by('month')

        # Orders
        order_query = Orden.objects.filter(
            fecha__date__gte=start_date,
            fecha__date__lt=end_date,
            estado_pago='PAGADO'
        )

        if client_type:
            order_query = order_query.filter(cliente__tipo_cliente=client_type)

        order_revenue = order_query.annotate(
            month=TruncMonth('fecha')
        ).values('month').annotate(
            total=Sum('monto_total')
        ).order_by('month')

        # Merge
        revenue_map = {}
        for entry in enrollment_revenue:
            month_str = entry['month'].strftime('%b')
            revenue_map[month_str] = revenue_map.get(month_str, 0) + int(entry['total'] or 0)

        for entry in order_revenue:
            month_str = entry['month'].strftime('%b')
            revenue_map[month_str] = revenue_map.get(month_str, 0) + int(entry['total'] or 0)
        
        revenue_chart = []
        for i in range(months - 1, -1, -1):
            month_date = now.date() - timedelta(days=30 * i)
            month_name = month_date.strftime('%b') # e.g., "Nov"
            revenue_chart.append({
                "month": month_name,
                "amount": int(revenue_map.get(month_name, 0))
            })
            
        return revenue_chart

    @staticmethod
    def get_year_revenue():
        year_start = timezone.now().date().replace(month=1, day=1)
        
        service_rev = int(Enrollment.objects.filter(
            fecha_inscripcion__gte=year_start,
            estado_pago='PAGADO'
        ).aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0)
        
        product_rev = int(Orden.objects.filter(
            fecha__gte=year_start,
            estado_pago='PAGADO'
        ).aggregate(Sum('monto_total'))['monto_total__sum'] or 0)
        
        return service_rev + product_rev

    @staticmethod
    def get_year_revenue_breakdown():
        year_start = timezone.now().date().replace(month=1, day=1)
        
        service_rev = int(Enrollment.objects.filter(
            fecha_inscripcion__gte=year_start,
            estado_pago='PAGADO'
        ).aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0)
        
        product_rev = int(Orden.objects.filter(
            fecha__gte=year_start,
            estado_pago='PAGADO'
        ).aggregate(Sum('monto_total'))['monto_total__sum'] or 0)
        
        return service_rev, product_rev

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
        
        # Fetch Enrollments
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
                'fecha': insc.fecha_inscripcion, # Keep as datetime object for sorting
                'monto': int(insc.monto_pagado),
                'estado': insc.estado_pago
            })

        # Fetch Orders
        orders = Orden.objects.select_related('cliente').order_by('-fecha')[:limit]
        for orden in orders:
            # Construct concept from details if possible, otherwise generic
            detalles_count = orden.detalles.count()
            concepto = f"Orden #{orden.id} ({detalles_count} productos)"
            
            recent_transactions.append({
                'id': f'ORD-{orden.id}',
                'cliente': orden.cliente.nombre_completo,
                'concepto': concepto,
                'fecha': orden.fecha, # Keep as datetime object for sorting
                'monto': int(orden.monto_total),
                'estado': orden.estado_pago
            })

        # Sort combined list by date desc
        # Normalize dates to ensure comparison works (handle naive vs aware)
        def get_sort_date(x):
            d = x['fecha']
            if timezone.is_naive(d):
                return timezone.make_aware(d)
            return d

        recent_transactions.sort(key=get_sort_date, reverse=True)
        
        # Slice to limit and format date
        final_transactions = []
        for t in recent_transactions[:limit]:
            t['fecha'] = t['fecha'].strftime('%d %b %Y')
            final_transactions.append(t)
            
        return final_transactions

    @staticmethod
    def get_popular_categories(client_type=None):
        """
        Calcula las categorías más populares basándose en el número de inscripciones y productos vendidos.
        """
        categories = {}
        
        # 1. Enrollments (Workshops/Courses)
        enrollments = Enrollment.objects.filter(estado_pago='PAGADO').prefetch_related('content_object')
        
        if client_type:
            enrollments = enrollments.filter(cliente__tipo_cliente=client_type)
            
        for enrollment in enrollments:
            item = enrollment.content_object
            if item and hasattr(item, 'categoria') and item.categoria:
                cat_name = item.categoria.nombre
                categories[cat_name] = categories.get(cat_name, 0) + 1
            else:
                categories['Sin Categoría'] = categories.get('Sin Categoría', 0) + 1

        # 2. Products (Orders)
        # We treat all products as "Productos" category for now, or "Tienda"
        from .models import DetalleOrden
        product_details = DetalleOrden.objects.filter(orden__estado_pago='PAGADO')
        
        if client_type:
            product_details = product_details.filter(orden__cliente__tipo_cliente=client_type)
            
        # Count total items sold
        total_products_sold = product_details.aggregate(Sum('cantidad'))['cantidad__sum'] or 0
        
        if total_products_sold > 0:
            categories['Productos'] = categories.get('Productos', 0) + total_products_sold
            
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
    def create_enrollment(user, item_type, item_id, cliente=None):
        """
        Creates an enrollment with STRICT ACID compliance.
        Can be called with 'user' (resolves client) or explicit 'cliente'.
        """
        # 1. Resolver el Cliente
        if cliente is None:
            cliente = ClientService.resolve_client(user)

        model_class = None
        if item_type == 'curso':
            model_class = Curso
        elif item_type == 'taller':
            model_class = Taller
        else:
            raise ValueError("Tipo de inscripción inválido")

        try:
            with transaction.atomic():
                if item_type == 'taller':
                    try:
                        item = model_class.objects.select_for_update().get(id=item_id)
                    except model_class.DoesNotExist:
                        raise ValueError(f"{item_type.capitalize()} no encontrado")
                    
                    if item.cupos_disponibles <= 0:
                        raise ValueError("Lo sentimos, no quedan cupos disponibles para este taller.")
                else:
                    item = model_class.objects.get(id=item_id)

                ct = ContentType.objects.get_for_model(model_class)

                existing_enrollment = Enrollment.objects.select_for_update().filter(
                    cliente=cliente, content_type=ct, object_id=item.id
                ).first()
                
                if existing_enrollment:
                    if existing_enrollment.estado_pago == 'ANULADO':
                         pass
                    else:
                        return existing_enrollment, "Ya estás inscrito en este item"

                if existing_enrollment and existing_enrollment.estado_pago == 'ANULADO':
                    enrollment = existing_enrollment
                    enrollment.estado_pago = 'PENDIENTE'
                    enrollment.monto_pagado = 0
                else:
                    enrollment = Enrollment(
                        cliente=cliente,
                        content_type=ct,
                        object_id=item.id,
                        monto_pagado=0,
                        estado_pago='PENDIENTE'
                    )
                
                if item_type == 'taller':
                    item.cupos_disponibles -= 1
                    item.save()
                elif item_type == 'curso' and not existing_enrollment: 
                    # For courses we just track students, unlimited quota usually?
                    # Or should we lock course too? Course 'estudiantes' count update.
                    # Let's lock to be safe if we are updating a counter.
                    # But simpler to just update.
                    from django.db.models import F
                    Curso.objects.filter(id=item.id).update(estudiantes=F('estudiantes') + 1)

                enrollment.save()

                if item.categoria:
                    cliente.intereses_cliente.add(item.categoria)
                
                if cliente.estado_ciclo in ['LEAD', 'PROSPECTO']:
                    cliente.estado_ciclo = 'CLIENTE'
                    cliente.save()

                return enrollment, "Inscripción creada exitosamente"

        except IntegrityError as e:
            raise ValueError(f"Error de integridad: {str(e)}")

    @staticmethod
    def update_enrollment_status(enrollment_id, new_status):
        with transaction.atomic():
            enrollment = Enrollment.objects.select_for_update().get(id=enrollment_id)
            old_status = enrollment.estado_pago
            
            if old_status == new_status:
                return enrollment

            enrollment.estado_pago = new_status
            enrollment.save()
            
            # Logic for Quota Restoration/Consumptions on Status Change
            # ANULADO means we restore quota.
            # Leaving ANULADO means we consume quota.
            
            is_leaving_anulado = (old_status == 'ANULADO' and new_status != 'ANULADO')
            is_entering_anulado = (new_status == 'ANULADO' and old_status != 'ANULADO')
            
            if enrollment.content_type.model == 'taller':
                taller = Taller.objects.select_for_update().get(id=enrollment.object_id)
                if is_entering_anulado:
                    taller.cupos_disponibles += 1
                elif is_leaving_anulado:
                    if taller.cupos_disponibles <= 0:
                        raise ValueError("No hay cupos disponibles para reactivar esta inscripción.")
                    taller.cupos_disponibles -= 1
                taller.save()
                
            elif enrollment.content_type.model == 'curso':
                from django.db.models import F
                if is_entering_anulado:
                    Curso.objects.filter(id=enrollment.object_id).update(estudiantes=F('estudiantes') - 1)
                elif is_leaving_anulado:
                    Curso.objects.filter(id=enrollment.object_id).update(estudiantes=F('estudiantes') + 1)

            return enrollment

    @staticmethod
    def delete_enrollment(enrollment_id):
        with transaction.atomic():
            enrollment = Enrollment.objects.select_for_update().get(id=enrollment_id)
            
            if enrollment.content_type.model == 'taller':
                taller = Taller.objects.select_for_update().get(id=enrollment.object_id)
                taller.cupos_disponibles += 1
                taller.save()
            elif enrollment.content_type.model == 'curso':
                from django.db.models import F
                Curso.objects.filter(id=enrollment.object_id).update(estudiantes=F('estudiantes') - 1)
            
            enrollment.delete()
