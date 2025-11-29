from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Taller, Cliente, Curso, Post, Contacto, Interes, Enrollment, Resena, Interaccion, Transaccion

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['is_superuser'] = user.is_superuser
        
        return token

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'is_superuser')
        read_only_fields = ('id', 'is_superuser')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class InteresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interes
        fields = '__all__'

class TallerSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    estado = serializers.CharField(source='estado_taller', read_only=True)
    rating = serializers.SerializerMethodField()

    pending_payments_count = serializers.SerializerMethodField()

    class Meta:
        model = Taller
        fields = '__all__'

    def get_rating(self, obj):
        from django.db.models import Avg
        if obj.categoria:
            promedio = obj.categoria.resenas.aggregate(Avg('calificacion'))['calificacion__avg']
            return round(promedio, 1) if promedio else 5.0 
        return 5.0

    def get_pending_payments_count(self, obj):
        # We need to count enrollments for this workshop that have pending payments
        # Since Enrollment uses GenericForeignKey, we filter by content_type and object_id
        from django.contrib.contenttypes.models import ContentType
        ct = ContentType.objects.get_for_model(Taller)
        return Enrollment.objects.filter(
            content_type=ct, 
            object_id=obj.id, 
            estado_pago__in=['PENDIENTE', 'ABONADO']
        ).count()

class ClienteSerializer(serializers.ModelSerializer):
    pending_payments_count = serializers.SerializerMethodField()

    class Meta:
        model = Cliente
        fields = '__all__'

    def get_pending_payments_count(self, obj):
        return obj.enrollments.filter(estado_pago__in=['PENDIENTE', 'ABONADO']).count()

class CursoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)

    class Meta:
        model = Curso
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    autor_nombre = serializers.CharField(source='autor.first_name', read_only=True)

    class Meta:
        model = Post
        fields = '__all__'

class ContactoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contacto
        fields = '__all__'

class TransaccionSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='inscripcion.cliente.nombre_completo', read_only=True)
    cliente_id = serializers.IntegerField(source='inscripcion.cliente.id', read_only=True)
    item_nombre = serializers.SerializerMethodField()
    item_type = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaccion
        fields = '__all__'
        read_only_fields = ['fecha', 'estado']

    def get_item_nombre(self, obj):
        if obj.inscripcion and obj.inscripcion.content_object:
            return str(obj.inscripcion.content_object)
        return "Item Desconocido"

    def get_item_type(self, obj):
        if obj.inscripcion:
            return obj.inscripcion.content_type.model
        return None

class EnrollmentSerializer(serializers.ModelSerializer):
    item_details = serializers.SerializerMethodField()
    transacciones = TransaccionSerializer(many=True, read_only=True)
    saldo_pendiente = serializers.DecimalField(max_digits=10, decimal_places=0, read_only=True)
    
    # Compatibility fields for Frontend
    curso_titulo = serializers.SerializerMethodField()
    curso_imagen = serializers.SerializerMethodField()
    curso_duracion = serializers.SerializerMethodField()
    curso = serializers.SerializerMethodField() # For ID access like enrollment.curso.id
    
    taller_nombre = serializers.SerializerMethodField()
    taller_fecha = serializers.SerializerMethodField()
    taller_hora = serializers.SerializerMethodField()
    taller = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = '__all__'

    def get_item_details(self, obj):
        if obj.content_type.model == 'taller':
            return TallerSerializer(obj.content_object).data
        elif obj.content_type.model == 'curso':
            return CursoSerializer(obj.content_object).data
        return None

    def get_curso_titulo(self, obj):
        if obj.content_type.model == 'curso' and obj.content_object:
            return obj.content_object.titulo
        return None

    def get_curso_imagen(self, obj):
        if obj.content_type.model == 'curso' and obj.content_object and obj.content_object.imagen:
            return obj.content_object.imagen.url
        return None

    def get_curso_duracion(self, obj):
        if obj.content_type.model == 'curso' and obj.content_object:
            return obj.content_object.duracion
        return None

    def get_curso(self, obj):
        if obj.content_type.model == 'curso' and obj.content_object:
            return {'id': obj.content_object.id}
        return None

    def get_taller_nombre(self, obj):
        if obj.content_type.model == 'taller' and obj.content_object:
            return obj.content_object.nombre
        return None

    def get_taller_fecha(self, obj):
        if obj.content_type.model == 'taller' and obj.content_object:
            return obj.content_object.fecha_taller
        return None

    def get_taller_hora(self, obj):
        if obj.content_type.model == 'taller' and obj.content_object:
            return obj.content_object.hora_taller
        return None

    def get_taller(self, obj):
        if obj.content_type.model == 'taller' and obj.content_object:
            return {'id': obj.content_object.id}
        return None

class ResenaSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.nombre_completo', read_only=True)

    class Meta:
        model = Resena
        fields = '__all__'
        read_only_fields = ['cliente', 'interes', 'fecha']

class InteraccionSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.first_name', read_only=True)

    class Meta:
        model = Interaccion
        fields = '__all__'
