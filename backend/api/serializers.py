from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Taller, Cliente, Curso, Post, Contacto, Interes, Inscripcion, InscripcionCurso, Resena, Interaccion

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

    class Meta:
        model = Taller
        fields = '__all__'

    def get_rating(self, obj):
        from django.db.models import Avg
        if obj.categoria:
            promedio = obj.categoria.resenas.aggregate(Avg('calificacion'))['calificacion__avg']
            return round(promedio, 1) if promedio else 5.0 # Default to 5.0 if no reviews yet (marketing strategy) or 0
        return 5.0

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

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

class InscripcionSerializer(serializers.ModelSerializer):
    taller_nombre = serializers.CharField(source='taller.nombre', read_only=True)
    taller_fecha = serializers.DateField(source='taller.fecha_taller', read_only=True)
    taller_hora = serializers.TimeField(source='taller.hora_taller', read_only=True)
    taller_imagen = serializers.ImageField(source='taller.imagen', read_only=True)

    class Meta:
        model = Inscripcion
        fields = '__all__'

class InscripcionCursoSerializer(serializers.ModelSerializer):
    curso_titulo = serializers.CharField(source='curso.titulo', read_only=True)
    curso_imagen = serializers.ImageField(source='curso.imagen', read_only=True)
    curso_duracion = serializers.CharField(source='curso.duracion', read_only=True)

    class Meta:
        model = InscripcionCurso
        fields = '__all__'

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
