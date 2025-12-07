from rest_framework import generics, permissions, viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.db.models import Sum, Q
from django.contrib.contenttypes.models import ContentType
from .serializers import (
    UserSerializer, MyTokenObtainPairSerializer, TallerSerializer, 
    ClienteSerializer, CursoSerializer, PostSerializer, ContactoSerializer,
    InteresSerializer, EnrollmentSerializer, ResenaSerializer,
    InteraccionSerializer, TransaccionSerializer, ProductoSerializer,
    OrdenSerializer
)
from .models import Taller, Cliente, Curso, Post, Contacto, Interes, Enrollment, Resena, Interaccion, Transaccion, Producto, Orden, DetalleOrden, Certificado, Cotizacion, Cotizacion, Empresa
import csv
import pandas as pd
from django.http import HttpResponse
from django.utils import timezone

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        from .email_utils import send_welcome_email
        
        user = serializer.save()
        # Crear perfil de Cliente asociado
        Cliente.objects.create(
            user=user,
            nombre_completo=f"{user.first_name} {user.last_name}",
            email=user.email,
            tipo_cliente='B2C',
            estado_ciclo='LEAD',
            origen=self.request.data.get('origen', 'OTRO')
        )
        
        # Send welcome email
        send_welcome_email(user)

class UserProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        from .serializers import UserProfileSerializer
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        data = request.data
        
        # Update User fields
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.save()
        
        # Update Cliente fields
        if hasattr(user, 'cliente_perfil'):
            cliente = user.cliente_perfil
            cliente.telefono = data.get('telefono', cliente.telefono)
            cliente.fecha_nacimiento = data.get('fecha_nacimiento', cliente.fecha_nacimiento)
            cliente.comuna_vive = data.get('comuna_vive', cliente.comuna_vive)
            cliente.save()
            
        from .serializers import UserProfileSerializer
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

# --- Admin Views ---

from .services import RevenueService

class AdminDashboardView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        client_type = request.query_params.get('type')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if client_type not in ['B2C', 'B2B']:
            client_type = None

        stats = {
            "total_revenue": RevenueService.get_total_revenue(client_type, period='month', start_date=start_date, end_date=end_date),
            "active_students": RevenueService.get_active_students_count(client_type),
            "upcoming_workshops": RevenueService.get_upcoming_workshops_count(client_type=client_type),
            "new_leads": RevenueService.get_new_leads_count(client_type, period='month', start_date=start_date, end_date=end_date),
            "revenue_chart": RevenueService.get_daily_revenue_chart(client_type=client_type, start_date=start_date, end_date=end_date),
            "popular_categories": RevenueService.get_popular_categories(client_type),
            "top_rated_workshops": RevenueService.get_top_rated_workshops(client_type)
        }
        return Response(stats)

class AdminRevenueView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        try:
            pending_payments, pending_count = RevenueService.get_pending_payments_stats()
            service_revenue, product_revenue = RevenueService.get_year_revenue_breakdown()
            
            return Response({
                'total_revenue_year': RevenueService.get_year_revenue(),
                'service_revenue_year': service_revenue,
                'product_revenue_year': product_revenue,
                'pending_payments': pending_payments,
                'pending_count': pending_count,
                'average_ticket': RevenueService.get_average_ticket(),
                'recent_transactions': RevenueService.get_recent_transactions(),
                'revenue_chart': RevenueService.get_revenue_chart_data(months=12)
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)


class AdminTallerViewSet(viewsets.ModelViewSet):
    queryset = Taller.objects.all()
    serializer_class = TallerSerializer
    permission_classes = (permissions.IsAdminUser,)

    def get_queryset(self):
        queryset = Taller.objects.all()
        client_type = self.request.query_params.get('type')
        if client_type and client_type in ['B2C', 'B2B']:
            # Filter by specific type OR 'AMBOS'
            queryset = queryset.filter(Q(tipo_cliente=client_type) | Q(tipo_cliente='AMBOS'))
        return queryset

    def perform_create(self, serializer):
        print("DEBUG: AdminTallerViewSet.perform_create called")
        taller = serializer.save()
        print(f"DEBUG: Taller created: {taller.id} - {taller.nombre}")
        
        # Send notification to interested clients
        try:
            if taller.categoria:
                print(f"DEBUG: Taller has category: {taller.categoria}")
                from .models import Cliente
                from .email_utils import send_new_workshop_notification
                
                # Find clients with this interest
                interested_clients = Cliente.objects.filter(
                    intereses_cliente=taller.categoria,
                    estado_ciclo='CLIENTE'
                ).distinct()
                
                print(f"DEBUG: Found {interested_clients.count()} interested clients")
                
                if interested_clients.exists():
                    count = send_new_workshop_notification(taller, interested_clients)
                    print(f"DEBUG: Sent {count} notifications")
            else:
                print("DEBUG: Taller has no category")
        except Exception as e:
            print(f"Error sending new workshop notifications: {e}")
            import traceback
            traceback.print_exc()

    def destroy(self, request, *args, **kwargs):
        print("DEBUG: AdminTallerViewSet.destroy called")
        from .email_utils import send_workshop_cancellation
        from django.contrib.contenttypes.models import ContentType
        from .models import Enrollment
        
        try:
            instance = self.get_object()
            print(f"DEBUG: Deleting taller: {instance.id} - {instance.nombre}")
            
            # Find enrolled clients (PAGADO or PENDIENTE)
            content_type = ContentType.objects.get_for_model(instance)
            enrollments = Enrollment.objects.filter(
                content_type=content_type, 
                object_id=instance.id,
                estado_pago__in=['PAGADO', 'PENDIENTE']
            ).select_related('cliente')
            
            clients = [e.cliente for e in enrollments]
            print(f"DEBUG: Found {len(clients)} enrolled clients to notify")
            
            if clients:
                send_workshop_cancellation(instance, clients)
                print("DEBUG: Cancellation emails sent")
            
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
             print(f"DEBUG: Error in destroy: {e}")
             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ProtectedError:
            return Response(
                {"error": "No se puede eliminar este taller porque tiene inscripciones asociadas."},
                status=status.HTTP_400_BAD_REQUEST
            )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Calculate stats
        ct = ContentType.objects.get_for_model(Taller)
        inscripciones = Enrollment.objects.filter(content_type=ct, object_id=instance.id).select_related('cliente')
        
        # Total Revenue
        total_revenue = Transaccion.objects.filter(
            inscripcion__in=inscripciones, 
            estado='APROBADO'
        ).aggregate(Sum('monto'))['monto__sum'] or 0
        
        # Enrolled list
        inscritos_data = []
        for inscripcion in inscripciones:
            inscritos_data.append({
                'id': inscripcion.cliente.id,
                'enrollment_id': inscripcion.id,
                'nombre': inscripcion.cliente.nombre_completo,
                'email': inscripcion.cliente.email,
                'telefono': inscripcion.cliente.telefono,
                'estado_pago': inscripcion.estado_pago,
                'monto_pagado': inscripcion.monto_pagado,
                'saldo_pendiente': inscripcion.saldo_pendiente,
                'fecha_inscripcion': inscripcion.fecha_inscripcion
            })

        data['stats'] = {
            'total_revenue': total_revenue,
            'inscritos_count': inscripciones.count(),
            'cupos_disponibles': instance.cupos_disponibles,
            'cupos_totales': instance.cupos_totales,
            'inscritos': inscritos_data
        }
        
        return Response(data)

class AdminClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = (permissions.IsAdminUser,)

    def get_queryset(self):
        queryset = Cliente.objects.all()
        client_type = self.request.query_params.get('type')
        if client_type:
            queryset = queryset.filter(tipo_cliente=client_type)
        return queryset.distinct()

class AdminClienteDetailView(APIView):
    permission_classes = (permissions.IsAdminUser,)
    
    def get(self, request, pk):
        try:
            cliente = Cliente.objects.get(pk=pk)
        except Cliente.DoesNotExist:
            return Response({"error": "Cliente no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get enrollments
        enrollments = Enrollment.objects.filter(cliente=cliente).order_by('-fecha_inscripcion')
        
        # Separate by type for frontend compatibility if needed, or just send all
        # Assuming frontend expects 'talleres' and 'cursos' separately
        talleres_enrollments = [e for e in enrollments if e.content_type.model == 'taller']
        cursos_enrollments = [e for e in enrollments if e.content_type.model == 'curso']
        
        # Get interests
        intereses = [interes.nombre for interes in cliente.intereses_cliente.all()]
        
        # Get interactions
        interacciones = Interaccion.objects.filter(cliente=cliente).order_by('-fecha')
        
        return Response({
            'cliente': ClienteSerializer(cliente).data,
            'talleres': EnrollmentSerializer(talleres_enrollments, many=True).data,
            'cursos': EnrollmentSerializer(cursos_enrollments, many=True).data,
            'intereses': intereses,
            'interacciones': InteraccionSerializer(interacciones, many=True).data
        })


class AdminCursoViewSet(viewsets.ModelViewSet):
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer
    permission_classes = (permissions.IsAdminUser,)

    def get_queryset(self):
        queryset = Curso.objects.all()
        client_type = self.request.query_params.get('type')
        if client_type and client_type in ['B2C', 'B2B']:
            # Filter by specific type OR 'AMBOS'
            queryset = queryset.filter(Q(tipo_cliente=client_type) | Q(tipo_cliente='AMBOS'))
        return queryset.distinct()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Calculate stats
        ct = ContentType.objects.get_for_model(Curso)
        inscripciones = Enrollment.objects.filter(content_type=ct, object_id=instance.id).select_related('cliente')
        
        # Total Revenue
        total_revenue = inscripciones.aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
        
        # Enrolled list
        inscritos_data = []
        for inscripcion in inscripciones:
            inscritos_data.append({
                'id': inscripcion.cliente.id,
                'enrollment_id': inscripcion.id,
                'nombre': inscripcion.cliente.nombre_completo,
                'email': inscripcion.cliente.email,
                'telefono': inscripcion.cliente.telefono,
                'estado_pago': inscripcion.estado_pago,
                'monto_pagado': inscripcion.monto_pagado,
                'fecha_inscripcion': inscripcion.fecha_inscripcion
            })

        data['stats'] = {
            'total_revenue': total_revenue,
            'inscritos_count': inscripciones.count(),
            'inscritos': inscritos_data
        }
        
        return Response(data)

class AdminPostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = (permissions.IsAdminUser,)

class AdminContactoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Contacto.objects.all()
    serializer_class = ContactoSerializer
    permission_classes = (permissions.IsAdminUser,)

    def get_queryset(self):
        queryset = Contacto.objects.all()
        client_type = self.request.query_params.get('type')
        if client_type:
            queryset = queryset.filter(email__in=Cliente.objects.filter(tipo_cliente=client_type).values('email'))
        return queryset

class AdminInteresViewSet(viewsets.ModelViewSet):
    queryset = Interes.objects.all()
    serializer_class = InteresSerializer
    permission_classes = (permissions.IsAdminUser,)

class AdminEnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = (permissions.IsAdminUser,)
    http_method_names = ['get', 'put', 'patch', 'delete', 'head', 'options']

class InteraccionViewSet(viewsets.ModelViewSet):
    queryset = Interaccion.objects.all()
    serializer_class = InteraccionSerializer
    permission_classes = (permissions.IsAdminUser,)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from django.db import transaction
        from .services import EnrollmentService

        user = request.user
        # Ensure client profile exists
        # Robust client resolution
        if hasattr(user, 'cliente_perfil'):
            cliente = user.cliente_perfil
        else:
            cliente = Cliente.objects.filter(email=user.email).first()
            if cliente:
                if not cliente.user:
                    cliente.user = user
                    cliente.save()
            else:
                cliente = Cliente.objects.create(
                    user=user,
                    nombre_completo=f"{user.first_name} {user.last_name}".strip() or user.username,
                    email=user.email,
                    tipo_cliente='B2C',
                    estado_ciclo='LEAD',
                    origen='WEB'
                )

        cart_items = request.data.get('items', [])
        if not cart_items:
            return Response({"error": "El carrito está vacío"}, status=status.HTTP_400_BAD_REQUEST)

        total_amount = 0
        
        try:
            with transaction.atomic():
                # 1. Create Order
                orden = Orden.objects.create(
                    cliente=cliente,
                    monto_total=0 # Will update later
                )

                enrollments_created = []

                # 2. Process Items
                for item in cart_items:
                    item_type = item.get('type')
                    item_id = item.get('id')
                    quantity = item.get('quantity', 1)

                    if item_type == 'product':
                        # Lock the product row to prevent race conditions
                        producto = Producto.objects.select_for_update().get(id=item_id)
                        
                        if not producto.tiene_stock(quantity):
                            raise ValueError(f"Stock insuficiente para {producto.nombre}. Disponible: {producto.stock_actual}")
                        
                        DetalleOrden.objects.create(
                            orden=orden,
                            producto=producto,
                            cantidad=quantity,
                            precio_unitario=producto.precio_venta
                        )
                        
                        # Update stock if managed
                        if producto.controlar_stock:
                            producto.stock_actual -= quantity
                            producto.save()
                        
                        total_amount += (producto.precio_venta * quantity)

                    elif item_type in ['workshop', 'course']:
                        # Use EnrollmentService or direct creation
                        # We need to link these enrollments to the order
                        
                        # Map frontend type to backend type
                        backend_type = 'taller' if item_type == 'workshop' else 'curso'
                        
                        # Check if already enrolled
                        ct = ContentType.objects.get_for_model(Taller if backend_type == 'taller' else Curso)
                        if Enrollment.objects.filter(cliente=cliente, content_type=ct, object_id=item_id).exists():
                            # Skip if already enrolled? Or error? 
                            # For now, let's skip to avoid double charge/error, but ideally frontend filters this
                            continue

                        enrollment, _ = EnrollmentService.create_enrollment(user, backend_type, item_id)
                        if enrollment:
                            enrollments_created.append(enrollment)
                            total_amount += enrollment.monto_pagado # Assuming full price for now

                # 3. Link Enrollments to Order
                if enrollments_created:
                    orden.enrollments.set(enrollments_created)

                # 4. Update Total
                orden.monto_total = total_amount
                orden.save()

                return Response({
                    "message": "Orden creada exitosamente",
                    "orden_id": orden.id,
                    "monto_total": total_amount
                }, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class TransaccionViewSet(viewsets.ModelViewSet):
    queryset = Transaccion.objects.all()
    serializer_class = TransaccionSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        queryset = Transaccion.objects.all()
        estado = self.request.query_params.get('estado', None)
        client_type = self.request.query_params.get('type')
        
        if not self.request.user.is_staff:
            try:
                cliente = self.request.user.cliente_perfil
                # Filter by enrollments OR orders belonging to client
                queryset = queryset.filter(
                    Q(inscripcion__cliente=cliente) | Q(orden__cliente=cliente)
                )
            except Cliente.DoesNotExist:
                return Transaccion.objects.none()
        
        if estado is not None:
            queryset = queryset.filter(estado=estado)
            
        if client_type:
            # Complex filter for client type in both relations
            queryset = queryset.filter(
                Q(inscripcion__cliente__tipo_cliente=client_type) | 
                Q(orden__cliente__tipo_cliente=client_type)
            )
            
        return queryset

    def create(self, request, *args, **kwargs):
        print(f"TransaccionViewSet.create called by user: {request.user} ({request.user.email})")
        
        # Robust client resolution
        if hasattr(request.user, 'cliente_perfil'):
            cliente = request.user.cliente_perfil
        else:
            # Check if client exists by email
            cliente = Cliente.objects.filter(email=request.user.email).first()
            
            if cliente:
                if not cliente.user:
                    cliente.user = request.user
                    cliente.save()
                    print(f"TransaccionViewSet: Linked existing client {cliente.id} to user {request.user}")
            else:
                # Create new client profile
                cliente = Cliente.objects.create(
                    user=request.user,
                    nombre_completo=f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username,
                    email=request.user.email,
                    tipo_cliente='B2C',
                    estado_ciclo='LEAD',
                    origen='WEB'
                )
                print(f"TransaccionViewSet: Created new client {cliente.id} for user {request.user}")
        
        if not cliente:
             return Response({"error": "No se pudo obtener ni crear el perfil de cliente"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        inscripcion_id = request.data.get('inscripcion_id')
        orden_id = request.data.get('orden_id')
        monto = request.data.get('monto')
        comprobante = request.data.get('comprobante')

        if not monto or not comprobante:
            return Response({"error": "Faltan datos requeridos"}, status=status.HTTP_400_BAD_REQUEST)

        if not inscripcion_id and not orden_id:
            return Response({"error": "Debe especificar inscripción u orden"}, status=status.HTTP_400_BAD_REQUEST)

        transaccion = None

        if inscripcion_id:
            try:
                inscripcion = Enrollment.objects.get(id=inscripcion_id, cliente=cliente)
            except Enrollment.DoesNotExist:
                return Response({"error": "Inscripción no encontrada"}, status=status.HTTP_404_NOT_FOUND)

            if Transaccion.objects.filter(inscripcion=inscripcion, estado='PENDIENTE').exists():
                return Response({"error": "Ya existe una transacción pendiente para esta inscripción"}, status=status.HTTP_400_BAD_REQUEST)

            transaccion = Transaccion.objects.create(
                inscripcion=inscripcion,
                monto=monto,
                comprobante=comprobante,
                estado='PENDIENTE'
            )

        elif orden_id:
            try:
                orden = Orden.objects.get(id=orden_id, cliente=cliente)
            except Orden.DoesNotExist:
                return Response({"error": "Orden no encontrada"}, status=status.HTTP_404_NOT_FOUND)

            if Transaccion.objects.filter(orden=orden, estado='PENDIENTE').exists():
                return Response({"error": "Ya existe una transacción pendiente para esta orden"}, status=status.HTTP_400_BAD_REQUEST)

            transaccion = Transaccion.objects.create(
                orden=orden,
                monto=monto,
                comprobante=comprobante,
                estado='PENDIENTE'
            )
        
        # Send receipt received email
        from .email_utils import send_receipt_received_email
        send_receipt_received_email(transaccion)
        
        serializer = self.get_serializer(transaccion)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        if not request.user.is_staff:
             return Response({"error": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)
             
        transaccion = self.get_object()
        if transaccion.estado != 'PENDIENTE':
             return Response({"error": "Solo se pueden aprobar transacciones pendientes"}, status=status.HTTP_400_BAD_REQUEST)
        
        transaccion.estado = 'APROBADO'
        transaccion.save()
        
        # Logic for Enrollment Balance
        if transaccion.inscripcion:
            transaccion.inscripcion.refresh_from_db()
            saldo_restante = transaccion.inscripcion.saldo_pendiente
            
            if saldo_restante > 0:
                exists_pending = Transaccion.objects.filter(
                    inscripcion=transaccion.inscripcion, 
                    estado='PENDIENTE'
                ).exists()
                
                if not exists_pending:
                    Transaccion.objects.create(
                        inscripcion=transaccion.inscripcion,
                        monto=saldo_restante,
                        estado='PENDIENTE',
                        observacion='Saldo restante generado automáticamente tras abono parcial'
                    )
        
        # Logic for Orden Balance (Simple full payment check for now)
        if transaccion.orden:
             transaccion.orden.actualizar_estado_pago()

        # Send acceptance email
        from .email_utils import send_receipt_accepted_email
        send_receipt_accepted_email(transaccion)

        return Response({"message": "Transacción aprobada"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        if not request.user.is_staff:
             return Response({"error": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)

        transaccion = self.get_object()
        if transaccion.estado != 'PENDIENTE':
             return Response({"error": "Solo se pueden rechazar transacciones pendientes"}, status=status.HTTP_400_BAD_REQUEST)
        
        observacion = request.data.get('observacion', '')
        transaccion.estado = 'RECHAZADO'
        transaccion.observacion = observacion
        transaccion.save()
        
        # Update Orden status if applicable
        if transaccion.orden:
            transaccion.orden.estado_pago = 'RECHAZADO'
            transaccion.orden.save()

        # Send rejection email
        from .email_utils import send_receipt_rejected_email
        send_receipt_rejected_email(transaccion, observacion)
        
        return Response({"message": "Transacción rechazada"}, status=status.HTTP_200_OK)

# ... (other viewsets)

class BulkEmailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        from .email_utils import send_admin_email
        
        client_ids = request.data.get('client_ids', [])
        subject = request.data.get('subject', '')
        message = request.data.get('message', '')
        item_name = request.data.get('item_name', '') # e.g., "Taller de Yoga"
        
        if not client_ids:
            return Response({"error": "No se seleccionaron clientes"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not subject or not message:
            return Response({"error": "Asunto y mensaje son requeridos"}, status=status.HTTP_400_BAD_REQUEST)
        
        clientes = Cliente.objects.filter(id__in=client_ids)
        
        recipient_data_list = []
        for cliente in clientes:
            recipient_data_list.append({
                'email': cliente.email,
                'context': {
                    'nombre': cliente.nombre_completo,
                    'taller_curso': item_name,
                    'email': cliente.email
                }
            })
        
        success_count, errors = send_admin_email(recipient_data_list, subject, message)
        
        if success_count > 0:
            return Response({
                "message": f"Emails enviados exitosamente a {success_count} clientes",
                "count": success_count
            }, status=status.HTTP_200_OK)
        else:
            error_msg = errors[0] if errors else "Error desconocido"
            return Response({"error": f"Error al enviar emails: {error_msg}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Public Views ---

class PublicTallerView(generics.ListAPIView):
    queryset = Taller.objects.filter(esta_activo=True).order_by('fecha_taller')
    serializer_class = TallerSerializer
    permission_classes = [permissions.AllowAny]

class PublicCursoView(generics.ListAPIView):
    queryset = Curso.objects.filter(esta_activo=True)
    serializer_class = CursoSerializer
    permission_classes = [permissions.AllowAny]

class PublicPostView(generics.ListAPIView):
    queryset = Post.objects.filter(esta_publicado=True).order_by('-fecha_publicacion')
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

class PublicCursoDetailView(generics.RetrieveAPIView):
    queryset = Curso.objects.filter(esta_activo=True)
    serializer_class = CursoSerializer
    permission_classes = [permissions.AllowAny]

class PublicTallerDetailView(generics.RetrieveAPIView):
    queryset = Taller.objects.filter(esta_activo=True)
    serializer_class = TallerSerializer
    permission_classes = [permissions.AllowAny]

class PublicPostDetailView(generics.RetrieveAPIView):
    queryset = Post.objects.filter(esta_publicado=True)
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

class PublicProductoView(generics.ListAPIView):
    queryset = Producto.objects.filter(esta_disponible=True).order_by('nombre')
    serializer_class = ProductoSerializer
    permission_classes = [permissions.AllowAny]

class PublicProductoDetailView(generics.RetrieveAPIView):
    queryset = Producto.objects.filter(esta_disponible=True)
    serializer_class = ProductoSerializer
    permission_classes = [permissions.AllowAny]

class EnrollmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from .services import EnrollmentService
        
        tipo = request.data.get('tipo') # 'curso' o 'taller'
        id_item = request.data.get('id')

        if not tipo or not id_item:
            return Response({"error": "Tipo e ID requeridos"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            enrollment, message = EnrollmentService.create_enrollment(request.user, tipo, id_item)
            if enrollment:
                return Response({"message": message, "id": enrollment.id}, status=status.HTTP_201_CREATED)
            else:
                return Response({"message": message}, status=status.HTTP_200_OK)
        except ValueError as e:
            print(f"Enrollment Error (ValueError): {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Enrollment Error (Exception): {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CancelEnrollmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        try:
            cliente = user.cliente_perfil
        except Cliente.DoesNotExist:
            return Response({"error": "Perfil de cliente no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        tipo = request.data.get('tipo')
        id_item = request.data.get('id')

        if not id_item or not tipo:
            return Response({"error": "ID y tipo requeridos"}, status=status.HTTP_400_BAD_REQUEST)

        model_class = None
        if tipo == 'curso':
            model_class = Curso
        elif tipo == 'taller':
            model_class = Taller
        else:
            return Response({"error": "Tipo inválido"}, status=status.HTTP_400_BAD_REQUEST)

        ct = ContentType.objects.get_for_model(model_class)
        try:
            enrollment = Enrollment.objects.get(cliente=cliente, content_type=ct, object_id=id_item)
            
            # Check for payments
            if enrollment.transacciones.exists():
                return Response({"error": "No puedes cancelar una inscripción con pagos asociados. Contacta a soporte."}, status=status.HTTP_400_BAD_REQUEST)
                
            enrollment.delete()
            return Response({"message": f"Inscripción a {tipo} cancelada exitosamente"}, status=status.HTTP_200_OK)
        except Enrollment.DoesNotExist:
            return Response({"error": f"No estás inscrito en este {tipo}"}, status=status.HTTP_404_NOT_FOUND)

class UserEnrollmentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
    def get(self, request):
        user = request.user
        
        # Robust client resolution
        if hasattr(user, 'cliente_perfil'):
            cliente = user.cliente_perfil
        else:
            cliente = Cliente.objects.filter(email=user.email).first()
            if cliente and not cliente.user:
                cliente.user = user
                cliente.save()
        
        if not cliente:
            return Response({"cursos": [], "talleres": []})

        enrollments = Enrollment.objects.filter(cliente=cliente).select_related('content_type').prefetch_related('content_object', 'transacciones')
        
        # Separate by type
        cursos_enrollments = [e for e in enrollments if e.content_type.model == 'curso']
        talleres_enrollments = [e for e in enrollments if e.content_type.model == 'taller']
        
        return Response({
            "cursos": EnrollmentSerializer(cursos_enrollments, many=True).data,
            "talleres": EnrollmentSerializer(talleres_enrollments, many=True).data
        })

class UserOrdersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Robust client resolution
        if hasattr(user, 'cliente_perfil'):
            cliente = user.cliente_perfil
        else:
            cliente = Cliente.objects.filter(email=user.email).first()
            if cliente and not cliente.user:
                cliente.user = user
                cliente.save()
        
        if not cliente:
            return Response([])

        ordenes = Orden.objects.filter(cliente=cliente).order_by('-fecha').prefetch_related(
            'detalles', 
            'detalles__producto',
            'transacciones'
        )
        serializer = OrdenSerializer(ordenes, many=True)
        return Response(serializer.data)

class UserOrderDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        user = request.user
        
        # Robust client resolution
        if hasattr(user, 'cliente_perfil'):
            cliente = user.cliente_perfil
        else:
            cliente = Cliente.objects.filter(email=user.email).first()
            if cliente and not cliente.user:
                cliente.user = user
                cliente.save()
                
        if not cliente:
            return Response({"error": "Perfil de cliente no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        try:
            orden = Orden.objects.prefetch_related(
                'detalles', 
                'detalles__producto',
                'transacciones'
            ).get(pk=pk, cliente=cliente)
            return Response(OrdenSerializer(orden).data)
        except Orden.DoesNotExist:
            return Response({"error": "Orden no encontrada"}, status=status.HTTP_404_NOT_FOUND)



class ContactView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ContactoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Mensaje enviado correctamente"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResenaViewSet(viewsets.ModelViewSet):
    queryset = Resena.objects.all()
    serializer_class = ResenaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        user = self.request.user
        try:
            cliente = user.cliente_perfil
        except Cliente.DoesNotExist:
            raise serializers.ValidationError("El usuario no tiene un perfil de cliente asociado.")

        curso_id = self.request.data.get('curso')
        taller_id = self.request.data.get('taller')

        if curso_id:
            ct = ContentType.objects.get_for_model(Curso)
            if not Enrollment.objects.filter(cliente=cliente, content_type=ct, object_id=curso_id).exists():
                raise serializers.ValidationError("Debes estar inscrito en este curso para dejar una reseña.")
        elif taller_id:
            ct = ContentType.objects.get_for_model(Taller)
            if not Enrollment.objects.filter(cliente=cliente, content_type=ct, object_id=taller_id).exists():
                raise serializers.ValidationError("Debes estar inscrito en este taller para dejar una reseña.")
        else:
            raise serializers.ValidationError("Debes especificar un curso o taller.")

        serializer.save(cliente=cliente)

    def get_queryset(self):
        queryset = Resena.objects.all()
        curso_id = self.request.query_params.get('curso', None)
        taller_id = self.request.query_params.get('taller', None)
        interes_id = self.request.query_params.get('interes', None)
        
        if curso_id is not None:
            queryset = queryset.filter(curso_id=curso_id)
        if taller_id is not None:
            queryset = queryset.filter(taller_id=taller_id)
        if interes_id is not None:
            queryset = queryset.filter(interes_id=interes_id)
            
        return queryset


class NewsletterViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def create(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'message': 'El email es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        cliente = Cliente.objects.filter(email=email).first()
        

class ExportDataView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        import logging
        logger = logging.getLogger(__name__)
        
        model_name = request.query_params.get('model')
        file_format = request.query_params.get('format', 'csv')
        client_type = request.query_params.get('type')
        
        logger.info(f"Export requested: model={model_name}, type={client_type}")

        if model_name == 'clientes':
            queryset = Cliente.objects.all()
            if client_type:
                queryset = queryset.filter(tipo_cliente=client_type)
            
            data = []
            for obj in queryset:
                data.append({
                    'Nombre': obj.nombre_completo,
                    'Email': obj.email,
                    'Telefono': obj.telefono,
                    'Tipo': obj.tipo_cliente,
                    'Empresa': obj.empresa.razon_social if obj.empresa else '',
                    'Ciclo': obj.get_estado_ciclo_display(),
                    'Origen': obj.get_origen_display(),
                    'Fecha Registro': obj.fecha_registro.strftime('%Y-%m-%d')
                })
        elif model_name == 'talleres':
            queryset = Taller.objects.all()
            if client_type:
                queryset = queryset.filter(Q(tipo_cliente=client_type) | Q(tipo_cliente='AMBOS'))
            
            data = []
            for obj in queryset:
                data.append({
                    'Nombre': obj.nombre,
                    'Fecha': obj.fecha_taller,
                    'Modalidad': obj.modalidad,
                    'Precio': obj.precio,
                    'Cupos Totales': obj.cupos_totales,
                    'Cupos Disponibles': obj.cupos_disponibles,
                    'Tipo Cliente': obj.tipo_cliente
                })
        elif model_name == 'cursos':
            queryset = Curso.objects.all()
            if client_type:
                queryset = queryset.filter(Q(tipo_cliente=client_type) | Q(tipo_cliente='AMBOS'))
            
            data = []
            for obj in queryset:
                data.append({
                    'Titulo': obj.titulo,
                    'Precio': obj.precio,
                    'Duracion': obj.duracion,
                    'Categoria': obj.categoria.nombre if obj.categoria else '',
                    'Activo': 'Si' if obj.esta_activo else 'No',
                    'Rating': obj.rating,
                    'Tipo Cliente': obj.tipo_cliente
                })
        elif model_name == 'ingresos':
            # Export Transactions (Ingresos)
            queryset = Transaccion.objects.all().order_by('-fecha')
            
            data = []
            for obj in queryset:
                item_name = "Desconocido"
                if obj.inscripcion:
                    if obj.inscripcion.content_type.model == 'taller':
                        item_name = f"Taller: {obj.inscripcion.content_object.nombre}"
                    else:
                        item_name = f"Curso: {obj.inscripcion.content_object.titulo}"
                elif obj.orden:
                    item_name = f"Orden #{obj.orden.id}"

                data.append({
                    'ID Transaccion': obj.id,
                    'Fecha': obj.fecha.strftime('%Y-%m-%d %H:%M') if obj.fecha else '',
                    'Cliente': obj.inscripcion.cliente.nombre_completo if obj.inscripcion else (obj.orden.cliente.nombre_completo if obj.orden else 'Unknown'),
                    'Item': item_name,
                    'Monto': obj.monto,
                    'Estado': obj.estado,
                    'Observacion': obj.observacion
                })
        else:
            return Response({"error": "Modelo no válido"}, status=status.HTTP_400_BAD_REQUEST)

        if file_format == 'excel':
            df = pd.DataFrame(data)
            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="{model_name}.xlsx"'
            df.to_excel(response, index=False)
            return response
        else:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{model_name}.csv"'
            
            if data:
                writer = csv.DictWriter(response, fieldnames=data[0].keys())
                writer.writeheader()
                writer.writerows(data)
            
            return response

class ImportDataView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        file = request.FILES.get('file')
        model_name = request.query_params.get('model', 'clientes')
        
        if not file:
            return Response({"error": "No se proporcionó ningún archivo"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if file.name.endswith('.csv'):
                df = pd.read_csv(file)
            elif file.name.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(file)
            else:
                return Response({"error": "Formato no soportado. Use CSV o Excel."}, status=status.HTTP_400_BAD_REQUEST)
            
            created_count = 0
            updated_count = 0
            errors = []

            for index, row in df.iterrows():
                try:
                    if model_name == 'clientes':
                        email = row.get('Email')
                        if not email: continue
                        
                        nombre = row.get('Nombre', 'Sin Nombre')
                        telefono = row.get('Telefono', '')
                        tipo = row.get('Tipo', 'B2C')
                        
                        cliente, created = Cliente.objects.update_or_create(
                            email=email,
                            defaults={
                                'nombre_completo': nombre,
                                'telefono': telefono,
                                'tipo_cliente': tipo
                            }
                        )
                        if created: created_count += 1
                        else: updated_count += 1

                    elif model_name == 'talleres':
                        nombre = row.get('Nombre')
                        if not nombre: continue
                        
                        fecha = row.get('Fecha') # YYYY-MM-DD
                        hora = row.get('Hora', '10:00')
                        precio = row.get('Precio', 0)
                        cupos = row.get('Cupos', 10)
                        
                        taller, created = Taller.objects.update_or_create(
                            nombre=nombre,
                            defaults={
                                'fecha_taller': fecha,
                                'hora_taller': hora,
                                'precio': precio,
                                'cupos_totales': cupos,
                                'cupos_disponibles': cupos,
                                'modalidad': row.get('Modalidad', 'PRESENCIAL'),
                                'tipo_cliente': row.get('Tipo Cliente', 'AMBOS')
                            }
                        )
                        if created: created_count += 1
                        else: updated_count += 1

                    elif model_name == 'cursos':
                        titulo = row.get('Titulo')
                        if not titulo: continue
                        
                        curso, created = Curso.objects.update_or_create(
                            titulo=titulo,
                            defaults={
                                'precio': row.get('Precio', 0),
                                'duracion': row.get('Duracion', '0 horas'),
                                'descripcion': row.get('Descripcion', ''),
                                'tipo_cliente': row.get('Tipo Cliente', 'AMBOS'),
                                'esta_activo': str(row.get('Activo', 'Si')).lower() in ['si', 'yes', 'true', '1']
                            }
                        )
                        if created: created_count += 1
                        else: updated_count += 1

                    elif model_name == 'productos':
                        nombre = row.get('Nombre')
                        if not nombre: continue
                        
                        producto, created = Producto.objects.update_or_create(
                            nombre=nombre,
                            defaults={
                                'precio_venta': row.get('Precio', 0),
                                'stock_actual': row.get('Stock', 0),
                                'descripcion': row.get('Descripcion', ''),
                                'esta_disponible': str(row.get('Disponible', 'Si')).lower() in ['si', 'yes', 'true', '1'],
                                'es_fisico': str(row.get('Fisico', 'Si')).lower() in ['si', 'yes', 'true', '1']
                            }
                        )
                        if created: created_count += 1
                        else: updated_count += 1
                        
                except Exception as e:
                    errors.append(f"Fila {index + 1}: {str(e)}")

            return Response({
                "message": "Importación completada",
                "created": created_count,
                "updated": updated_count,
                "errors": errors
            })

        except Exception as e:
            return Response({"error": f"Error procesando archivo: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
            if cliente.estado_ciclo == 'LEAD':
                cliente.estado_ciclo = 'PROSPECTO'
                cliente.save()
            # Return generic message to prevent enumeration
            return Response({'message': 'Suscripción exitosa.'}, status=status.HTTP_200_OK)
        
        try:
            nombre = email.split('@')[0]
            cliente = Cliente.objects.create(
                nombre_completo=nombre,
                email=email,
                tipo_cliente='B2C',
                estado_ciclo='LEAD',
                origen='GOOGLE'
            )
            return Response({'message': 'Suscripción exitosa.'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# --- B2B Views ---

class GenerateQuoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from django.http import HttpResponse
        from xhtml2pdf import pisa
        from io import BytesIO
        
        user = request.user
        try:
            cliente = user.cliente_perfil
        except Cliente.DoesNotExist:
            return Response({"error": "Perfil de cliente no encontrado"}, status=status.HTTP_404_NOT_FOUND)
            
        items = request.data.get('items', [])
        if not items:
            return Response({"error": "No hay items para cotizar"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Create Cotizacion object
        total = 0
        processed_items = []
        
        for item in items:
            item_type = item.get('type')
            item_id = item.get('id')
            quantity = item.get('quantity', 1)
            
            name = "Item Desconocido"
            price = 0
            
            if item_type == 'product':
                prod = Producto.objects.get(id=item_id)
                name = prod.nombre
                price = prod.precio_venta
            elif item_type == 'taller':
                taller = Taller.objects.get(id=item_id)
                name = taller.nombre
                price = taller.precio
            elif item_type == 'course':
                curso = Curso.objects.get(id=item_id)
                name = curso.titulo
                price = curso.precio
                
            subtotal = price * quantity
            total += subtotal
            
            processed_items.append({
                'name': name,
                'quantity': quantity,
                'price': float(price),
                'subtotal': float(subtotal)
            })
            
        cotizacion = Cotizacion.objects.create(
            cliente=cliente,
            monto_total=total,
            items_json=processed_items,
            razon_social=request.data.get('razon_social'),
            rut_empresa=request.data.get('rut_empresa')
        )
        
        # Generate PDF HTML
        html_string = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Helvetica, sans-serif; }}
                .header {{ text-align: center; margin-bottom: 20px; }}
                .title {{ font-size: 24px; font-weight: bold; color: #E91E63; }}
                table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; }}
                .total {{ margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">TMM - Cotización #COT-{cotizacion.id}</div>
                <p>Fecha: {cotizacion.fecha_emision.strftime('%d/%m/%Y')}</p>
                <p>Cliente: {cliente.nombre_completo}</p>
                {f"<p>Empresa: {cotizacion.razon_social}</p>" if cotizacion.razon_social else ""}
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Precio Unitario</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {"".join([f"<tr><td>{item['name']}</td><td>${item['price']}</td><td>{item['quantity']}</td><td>${item['subtotal']}</td></tr>" for item in processed_items])}
                </tbody>
            </table>
            
            <div class="total">
                Total: ${total}
            </div>
            
            <p style="margin-top: 50px; font-size: 12px; color: #777;">
                Esta cotización es válida por {cotizacion.validez_dias} días.
            </p>
        </body>
        </html>
        """
        
        result = BytesIO()
        pdf = pisa.pisaDocument(BytesIO(html_string.encode("UTF-8")), result)
        
        if not pdf.err:
            response = HttpResponse(result.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="cotizacion_{cotizacion.id}.pdf"'
            return response
        return Response({"error": "Error generando PDF"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BulkEnrollView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request):
        import csv
        from io import TextIOWrapper
        from .services import EnrollmentService
        
        file = request.FILES.get('file')
        taller_id = request.data.get('taller_id')
        curso_id = request.data.get('curso_id')
        
        if not file:
            return Response({"error": "Archivo CSV requerido"}, status=status.HTTP_400_BAD_REQUEST)
            
        if not taller_id and not curso_id:
            return Response({"error": "Debe especificar ID de Taller o Curso"}, status=status.HTTP_400_BAD_REQUEST)
            
        item_type = 'taller' if taller_id else 'curso'
        item_id = taller_id if taller_id else curso_id
        
        try:
            csv_file = TextIOWrapper(file.file, encoding='utf-8')
            reader = csv.DictReader(csv_file)
            
            results = []
            
            for row in reader:
                email = row.get('email')
                nombre = row.get('nombre', 'Sin Nombre')
                
                if not email:
                    continue
                    
                # Get or create user
                user, created = User.objects.get_or_create(username=email, defaults={'email': email, 'first_name': nombre})
                if created:
                    user.set_password('tmm12345') # Default password
                    user.save()
                    # Create client profile
                    Cliente.objects.create(
                        user=user,
                        nombre_completo=nombre,
                        email=email,
                        tipo_cliente='B2B', # Assume B2B for bulk
                        estado_ciclo='CLIENTE',
                        origen='EMPRESA'
                    )
                
                # Enroll
                enrollment, msg = EnrollmentService.create_enrollment(user, item_type, item_id)
                results.append({'email': email, 'status': 'Enrolled' if enrollment else 'Failed', 'message': msg})
                
            return Response({"results": results, "total": len(results)})
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CalendarView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        events = []
        talleres = Taller.objects.filter(esta_activo=True)
        for taller in talleres:
            events.append({
                "id": f"taller-{taller.id}",
                "title": taller.nombre,
                "start": taller.fecha_taller,
                "end": taller.fecha_taller,
                "type": "taller",
                "price": taller.precio
            })
        return Response(events)

class CertificateView(APIView):
    permission_classes = [permissions.AllowAny] # Publicly verifiable

    def get(self, request, uuid):
        from django.shortcuts import get_object_or_404
        from django.http import HttpResponse
        
        certificado = get_object_or_404(Certificado, uuid=uuid)
        inscripcion = certificado.inscripcion
        cliente = inscripcion.cliente
        
        # Determine course/workshop name
        nombre_curso = "Curso/Taller"
        if inscripcion.content_type.model == 'curso':
            nombre_curso = inscripcion.content_object.titulo
        elif inscripcion.content_type.model == 'taller':
            nombre_curso = inscripcion.content_object.nombre
            
        fecha = certificado.fecha_emision.strftime("%d de %B de %Y")
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Certificado de Finalización</title>
            <style>
                body {{
                    font-family: 'Georgia', serif;
                    background-color: #f9f9f9;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                }}
                .certificate-container {{
                    width: 800px;
                    padding: 50px;
                    background-color: #fff;
                    border: 20px solid #efe5e6; /* Cloud Pink */
                    text-align: center;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                    position: relative;
                }}
                .header {{
                    font-size: 48px;
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 20px;
                    text-transform: uppercase;
                }}
                .sub-header {{
                    font-size: 24px;
                    color: #666;
                    margin-bottom: 40px;
                }}
                .recipient-name {{
                    font-size: 40px;
                    font-weight: bold;
                    color: #000;
                    border-bottom: 2px solid #333;
                    display: inline-block;
                    padding-bottom: 10px;
                    margin-bottom: 30px;
                }}
                .course-name {{
                    font-size: 32px;
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 20px;
                }}
                .date {{
                    font-size: 18px;
                    color: #666;
                    margin-top: 40px;
                }}
                .signature {{
                    margin-top: 60px;
                    display: flex;
                    justify-content: center;
                    gap: 100px;
                }}
                .sig-line {{
                    border-top: 1px solid #333;
                    width: 200px;
                    padding-top: 10px;
                    font-size: 16px;
                    color: #333;
                }}
                .logo {{
                    margin-bottom: 30px;
                    font-size: 24px;
                    font-weight: bold;
                    color: #efe5e6; /* Cloud Pink text or logo placeholder */
                }}
            </style>
        </head>
        <body>
            <div class="certificate-container">
                <div class="logo">TMM Bienestar y Conexión</div>
                <div class="header">Certificado de Finalización</div>
                <div class="sub-header">Este certificado se otorga a</div>
                
                <div class="recipient-name">{cliente.nombre_completo}</div>
                
                <div class="sub-header">Por haber completado satisfactoriamente el</div>
                <div class="course-name">{nombre_curso}</div>
                
                <div class="date">Otorgado el {fecha}</div>
                
                <div class="signature">
                    <div class="sig-line">Firma del Instructor</div>
                    <div class="sig-line">Director Académico</div>
                </div>
                
                <div style="margin-top: 30px; font-size: 12px; color: #999;">
                    ID del Certificado: {uuid}
                </div>
            </div>
        </body>
        </html>
        """
        return HttpResponse(html_content)

class GenerateCertificateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        enrollment_id = request.data.get('enrollment_id')
        if not enrollment_id:
             return Response({"error": "Enrollment ID required"}, status=status.HTTP_400_BAD_REQUEST)
             
        try:
            enrollment = Enrollment.objects.get(id=enrollment_id, cliente__user=request.user)
        except Enrollment.DoesNotExist:
            return Response({"error": "Inscripción no encontrada"}, status=status.HTTP_404_NOT_FOUND)
            
        if enrollment.progreso < 100 and not enrollment.completado:
             return Response({"error": "El curso no está completado"}, status=status.HTTP_400_BAD_REQUEST)
             
        certificado, created = Certificado.objects.get_or_create(inscripcion=enrollment)
        
        return Response({"uuid": certificado.uuid, "url": f"/api/certificates/{certificado.uuid}"})

class AdminProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminTransactionListView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        import csv
        from django.http import HttpResponse

        transaction_type = request.query_params.get('type')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        category_id = request.query_params.get('category')
        status_filter = request.query_params.get('status')
        is_export = request.query_params.get('export') == 'true'

        data = []

        if transaction_type == 'services' or transaction_type == 'pending':
            # Enrollments (Workshops/Courses)
            # If type is 'pending', force status PENDIENTE (backward compatibility/shortcut)
            # Otherwise respect status_filter or default to PAGADO if type is services (legacy behavior)
            
            queryset = Enrollment.objects.select_related('cliente', 'content_type')
            
            if transaction_type == 'pending':
                queryset = queryset.filter(estado_pago='PENDIENTE')
            elif status_filter:
                queryset = queryset.filter(estado_pago=status_filter)
            else:
                # Default for 'services' view if no status specified is PAGADO
                queryset = queryset.filter(estado_pago='PAGADO')

            if start_date:
                queryset = queryset.filter(fecha_inscripcion__date__gte=start_date)
            if end_date:
                queryset = queryset.filter(fecha_inscripcion__date__lte=end_date)
            
            for insc in queryset:
                item = insc.content_object
                cat_name = "Sin Categoría"
                if item and hasattr(item, 'categoria') and item.categoria:
                    cat_name = item.categoria.nombre
                
                # Filter by category if requested
                if category_id and str(item.categoria.id if item and hasattr(item, 'categoria') and item.categoria else '') != category_id:
                    continue

                item_name = "Desconocido"
                if item:
                    item_name = getattr(item, 'nombre', getattr(item, 'titulo', 'Item'))

                data.append({
                    'id': insc.id,
                    'date': insc.fecha_inscripcion,
                    'client': insc.cliente.nombre_completo,
                    'client_id': insc.cliente.id,
                    'email': insc.cliente.email,
                    'item': item_name,
                    'category': cat_name,
                    'amount': insc.monto_pagado,
                    'status': insc.estado_pago,
                    'type': 'Inscripción'
                })

        elif transaction_type == 'products':
            # All Orders
            queryset = Orden.objects.all().select_related('cliente').prefetch_related('detalles')
            
            if status_filter:
                queryset = queryset.filter(estado_pago=status_filter)
            # Note: products view usually shows all, but if no filter, maybe show all? 
            # Previous implementation showed ALL. Let's keep showing ALL if no status filter.

            if start_date:
                queryset = queryset.filter(fecha__date__gte=start_date)
            if end_date:
                queryset = queryset.filter(fecha__date__lte=end_date)

            for orden in queryset:
                detalles = orden.detalles.all()
                items_desc = ", ".join([f"{d.cantidad}x {d.producto.nombre}" for d in detalles])
                
                data.append({
                    'id': orden.id,
                    'date': orden.fecha,
                    'client': orden.cliente.nombre_completo,
                    'client_id': orden.cliente.id,
                    'email': orden.cliente.email,
                    'item': items_desc,
                    'amount': orden.monto_total,
                    'status': orden.estado_pago,
                    'type': 'Orden'
                })
        
        # Sort by date desc
        # Handle timezone aware/naive for sorting
        def get_sort_date(x):
            d = x['date']
            if timezone.is_naive(d):
                return timezone.make_aware(d)
            return d
            
        data.sort(key=get_sort_date, reverse=True)

        if is_export:
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="transacciones_{transaction_type}.csv"'

            writer = csv.writer(response)
            writer.writerow(['ID', 'Fecha', 'Cliente', 'Email', 'Item/Concepto', 'Monto', 'Estado', 'Tipo'])

            for row in data:
                writer.writerow([
                    row['id'],
                    row['date'].strftime('%Y-%m-%d %H:%M'),
                    row['client'],
                    row['email'],
                    row['item'],
                    row['amount'],
                    row['status'],
                    row['type']
                ])

            return response
        
        return Response(data)
