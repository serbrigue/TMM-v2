from rest_framework import generics, permissions, viewsets, status
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
    InteraccionSerializer, TransaccionSerializer
)
from .models import Taller, Cliente, Curso, Post, Contacto, Interes, Enrollment, Resena, Interaccion, Transaccion

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
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

# --- Admin Views ---

from .services import RevenueService

class AdminDashboardView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        client_type = request.query_params.get('type')
        if client_type not in ['B2C', 'B2B']:
            client_type = None

        stats = {
            "total_revenue": RevenueService.get_total_revenue(client_type, period='month'),
            "active_students": RevenueService.get_active_students_count(client_type),
            "upcoming_workshops": RevenueService.get_upcoming_workshops_count(client_type=client_type),
            "new_leads": RevenueService.get_new_leads_count(client_type, period='month'),
            "revenue_chart": RevenueService.get_daily_revenue_chart(client_type=client_type),
            "popular_categories": RevenueService.get_popular_categories(client_type),
            "top_rated_workshops": RevenueService.get_top_rated_workshops(client_type)
        }
        return Response(stats)

class AdminRevenueView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        pending_payments, pending_count = RevenueService.get_pending_payments_stats()
        
        return Response({
            'total_revenue_year': RevenueService.get_year_revenue(),
            'pending_payments': pending_payments,
            'pending_count': pending_count,
            'average_ticket': RevenueService.get_average_ticket(),
            'recent_transactions': RevenueService.get_recent_transactions(),
            'revenue_chart': RevenueService.get_revenue_chart_data(months=12)
        })


class AdminTallerViewSet(viewsets.ModelViewSet):
    queryset = Taller.objects.all()
    serializer_class = TallerSerializer
    permission_classes = (permissions.IsAdminUser,)

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
        return queryset

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
                queryset = queryset.filter(inscripcion__cliente=cliente)
            except Cliente.DoesNotExist:
                return Transaccion.objects.none()
        
        if estado is not None:
            queryset = queryset.filter(estado=estado)
            
        if client_type:
            queryset = queryset.filter(inscripcion__cliente__tipo_cliente=client_type)
            
        return queryset

    def create(self, request, *args, **kwargs):
        try:
            cliente = request.user.cliente_perfil
        except Cliente.DoesNotExist:
             return Response({"error": "Perfil de cliente no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        inscripcion_id = request.data.get('inscripcion_id')
        monto = request.data.get('monto')
        comprobante = request.data.get('comprobante')

        if not inscripcion_id or not monto or not comprobante:
            return Response({"error": "Faltan datos requeridos"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            inscripcion = Enrollment.objects.get(id=inscripcion_id, cliente=cliente)
        except Enrollment.DoesNotExist:
            return Response({"error": "Inscripción no encontrada"}, status=status.HTTP_404_NOT_FOUND)

        # Check for duplicate pending transaction
        if Transaccion.objects.filter(inscripcion=inscripcion, estado='PENDIENTE').exists():
            return Response({"error": "Ya existe una transacción pendiente para esta inscripción"}, status=status.HTTP_400_BAD_REQUEST)

        transaccion = Transaccion.objects.create(
            inscripcion=inscripcion,
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
        
        # Check for remaining balance and generate pending transaction if needed
        if transaccion.inscripcion:
            transaccion.inscripcion.refresh_from_db()
            saldo_restante = transaccion.inscripcion.saldo_pendiente
            
            if saldo_restante > 0:
                # Check if a pending transaction already exists to avoid duplicates
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
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
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
        try:
            cliente = user.cliente_perfil
            enrollments = Enrollment.objects.filter(cliente=cliente).select_related('content_type').prefetch_related('content_object')
            
            # Separate by type
            cursos_enrollments = [e for e in enrollments if e.content_type.model == 'curso']
            talleres_enrollments = [e for e in enrollments if e.content_type.model == 'taller']
            
            return Response({
                "cursos": EnrollmentSerializer(cursos_enrollments, many=True).data,
                "talleres": EnrollmentSerializer(talleres_enrollments, many=True).data
            })
        except Cliente.DoesNotExist:
            return Response({"cursos": [], "talleres": []})



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
        
        if cliente:
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
