from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from .serializers import (
    UserSerializer, MyTokenObtainPairSerializer, TallerSerializer, 
    ClienteSerializer, CursoSerializer, PostSerializer, ContactoSerializer,
    InteresSerializer, InscripcionSerializer, InscripcionCursoSerializer, ResenaSerializer,
    InteraccionSerializer
)
from .models import Taller, Cliente, Curso, Post, Contacto, Interes, Inscripcion, InscripcionCurso, Resena, Interaccion

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
        # Validate client_type if necessary, or let it be None
        if client_type not in ['B2C', 'B2B']:
            client_type = None

        stats = {
            "total_revenue": RevenueService.get_total_revenue(client_type),
            "active_students": RevenueService.get_active_students_count(client_type),
            "upcoming_workshops": RevenueService.get_upcoming_workshops_count(client_type=client_type),
            "new_leads": RevenueService.get_new_leads_count(client_type),
            "revenue_chart": RevenueService.get_revenue_chart_data(months=4, client_type=client_type),
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

class AdminClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = (permissions.IsAdminUser,)

class AdminClienteDetailView(APIView):
    permission_classes = (permissions.IsAdminUser,)
    
    def get(self, request, pk):
        try:
            cliente = Cliente.objects.get(pk=pk)
        except Cliente.DoesNotExist:
            return Response({"error": "Cliente no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get enrollments
        talleres = Inscripcion.objects.filter(cliente=cliente).select_related('taller').order_by('-fecha_inscripcion')
        cursos = InscripcionCurso.objects.filter(cliente=cliente).select_related('curso').order_by('-fecha_inscripcion')
        
        # Get interests
        intereses = [interes.nombre for interes in cliente.intereses_cliente.all()]
        
        # Get interactions
        interacciones = Interaccion.objects.filter(cliente=cliente).order_by('-fecha')
        
        return Response({
            'cliente': ClienteSerializer(cliente).data,
            'talleres': InscripcionSerializer(talleres, many=True).data,
            'cursos': InscripcionCursoSerializer(cursos, many=True).data,
            'intereses': intereses,
            'interacciones': InteraccionSerializer(interacciones, many=True).data
        })


class AdminCursoViewSet(viewsets.ModelViewSet):
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer
    permission_classes = (permissions.IsAdminUser,)

class AdminPostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = (permissions.IsAdminUser,)

class AdminContactoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Contacto.objects.all()
    serializer_class = ContactoSerializer
    permission_classes = (permissions.IsAdminUser,)

class AdminInteresViewSet(viewsets.ModelViewSet):
    queryset = Interes.objects.all()
    serializer_class = InteresSerializer
    permission_classes = (permissions.IsAdminUser,)

class InteraccionViewSet(viewsets.ModelViewSet):
    queryset = Interaccion.objects.all()
    serializer_class = InteraccionSerializer
    permission_classes = (permissions.IsAdminUser,)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

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
        from .email_utils import send_enrollment_confirmation
        
        user = request.user
        try:
            cliente = user.cliente_perfil
        except Cliente.DoesNotExist:
            return Response({"error": "Perfil de cliente no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        tipo = request.data.get('tipo') # 'curso' o 'taller'
        id_item = request.data.get('id')

        if tipo == 'curso':
            try:
                curso = Curso.objects.get(id=id_item)
                inscripcion = InscripcionCurso.objects.create(
                    cliente=cliente,
                    curso=curso,
                    monto_pagado=curso.precio,
                    estado_pago='PAGADO' # Simulación
                )
                # Send enrollment confirmation email
                send_enrollment_confirmation(inscripcion, tipo='curso')
                return Response({"message": "Inscripción exitosa"}, status=status.HTTP_201_CREATED)
            except Curso.DoesNotExist:
                return Response({"error": "Curso no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        
        elif tipo == 'taller':
            try:
                taller = Taller.objects.get(id=id_item)
                if taller.cupos_disponibles > 0:
                    inscripcion = Inscripcion.objects.create(
                        cliente=cliente,
                        taller=taller,
                        monto_pagado=taller.precio,
                        estado_pago='PAGADO' # Simulación
                    )
                    # Send enrollment confirmation email
                    send_enrollment_confirmation(inscripcion, tipo='taller')
                    return Response({"message": "Inscripción exitosa"}, status=status.HTTP_201_CREATED)
                else:
                    return Response({"error": "No hay cupos disponibles"}, status=status.HTTP_400_BAD_REQUEST)
            except Taller.DoesNotExist:
                return Response({"error": "Taller no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({"error": "Tipo inválido"}, status=status.HTTP_400_BAD_REQUEST)

class UserEnrollmentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            cliente = user.cliente_perfil
            cursos = InscripcionCurso.objects.filter(cliente=cliente)
            talleres = Inscripcion.objects.filter(cliente=cliente)
            
            return Response({
                "cursos": InscripcionCursoSerializer(cursos, many=True).data,
                "talleres": InscripcionSerializer(talleres, many=True).data
            })
        except Cliente.DoesNotExist:
            return Response({"cursos": [], "talleres": []})

class BulkEmailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        from .email_utils import send_admin_email, get_oferta_template, get_recordatorio_template, get_personalizado_template
        
        client_ids = request.data.get('client_ids', [])
        template_type = request.data.get('template_type', 'PERSONALIZADO')
        custom_subject = request.data.get('subject', '')
        custom_message = request.data.get('message', '')
        
        if not client_ids:
            return Response({"error": "No se seleccionaron clientes"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get clients
        clientes = Cliente.objects.filter(id__in=client_ids)
        recipients = [cliente.email for cliente in clientes]
        
        # Get template
        if template_type == 'OFERTA':
            subject, message = get_oferta_template(custom_message)
        elif template_type == 'RECORDATORIO':
            subject, message = get_recordatorio_template(custom_message)
        else:  # PERSONALIZADO
            subject = custom_subject
            message = custom_message
        
        if not subject or not message:
            return Response({"error": "Asunto y mensaje son requeridos"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Send emails
        success = send_admin_email(recipients, subject, message)
        
        if success:
            return Response({
                "message": f"Emails enviados exitosamente a {len(recipients)} clientes",
                "count": len(recipients)
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Error al enviar emails"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

        # Validation: Check enrollment
        curso_id = self.request.data.get('curso')
        taller_id = self.request.data.get('taller')

        if curso_id:
            if not InscripcionCurso.objects.filter(cliente=cliente, curso_id=curso_id).exists():
                raise serializers.ValidationError("Debes estar inscrito en este curso para dejar una reseña.")
        elif taller_id:
            if not Inscripcion.objects.filter(cliente=cliente, taller_id=taller_id).exists():
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
    """
    Maneja la suscripción al newsletter/lead magnet.
    """
    permission_classes = [permissions.AllowAny]

    def create(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'message': 'El email es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        # Verificar si ya existe como cliente
        cliente = Cliente.objects.filter(email=email).first()
        
        if cliente:
            # Si ya existe, actualizamos su estado si era solo un lead
            if cliente.estado_ciclo == 'LEAD':
                cliente.estado_ciclo = 'PROSPECTO' # Subió de nivel al descargar el ebook
                cliente.save()
            return Response({'message': '¡Ya estabas registrado! Te hemos reenviado la guía.'})
        
        # Si no existe, creamos un nuevo LEAD
        try:
            # Crear usuario dummy si no existe (opcional, o solo guardar en Cliente sin usuario)
            # Para simplificar, creamos un Cliente sin usuario asociado por ahora, 
            # o usamos un nombre genérico.
            nombre = email.split('@')[0]
            cliente = Cliente.objects.create(
                nombre_completo=nombre,
                email=email,
                tipo_cliente='B2C',
                estado_ciclo='LEAD',
                origen='GOOGLE' # O 'EBOOK' si agregamos esa opción
            )
            return Response({'message': 'Suscripción exitosa.'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CalendarView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from datetime import datetime
        
        events = []
        
        # Talleres
        talleres = Taller.objects.filter(esta_activo=True)
        for taller in talleres:
            events.append({
                "id": f"taller-{taller.id}",
                "title": taller.nombre,
                "start": taller.fecha_taller,
                "end": taller.fecha_taller, # Assuming 1 day or add duration
                "type": "taller",
                "price": taller.precio
            })
            
        # Cursos (if they have start dates, otherwise maybe not relevant for calendar unless live)
        # For now, just workshops
        
        return Response(events)
