from django.contrib import admin
from .models import (
    Empresa, Interes, Cliente, Interaccion, Taller, Enrollment, 
    Producto, VentaProducto, DetalleVenta, EmailLog, Curso, 
    Post, Contacto, Resena, Transaccion, Seccion, Leccion
)

@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ('razon_social', 'rut', 'telefono_empresa')
    search_fields = ('razon_social', 'rut')

@admin.register(Interes)
class InteresAdmin(admin.ModelAdmin):
    list_display = ('nombre',)

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nombre_completo', 'email', 'tipo_cliente', 'estado_ciclo', 'origen')
    list_filter = ('tipo_cliente', 'estado_ciclo', 'origen')
    search_fields = ('nombre_completo', 'email')

@admin.register(Interaccion)
class InteraccionAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'tipo', 'fecha', 'usuario')
    list_filter = ('tipo', 'fecha')

@admin.register(Taller)
class TallerAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'fecha_taller', 'cupos_disponibles', 'estado_taller')
    list_filter = ('fecha_taller', 'modalidad')

@admin.register(Curso)
class CursoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'precio', 'estudiantes', 'esta_activo')
    list_filter = ('esta_activo',)

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'content_object', 'estado_pago', 'fecha_inscripcion')
    list_filter = ('estado_pago', 'content_type')
    search_fields = ('cliente__nombre_completo', 'cliente__email')

@admin.register(Transaccion)
class TransaccionAdmin(admin.ModelAdmin):
    list_display = ('id', 'inscripcion', 'monto', 'estado', 'fecha')
    list_filter = ('estado', 'fecha')
    search_fields = ('inscripcion__cliente__nombre_completo',)

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio_venta', 'stock_actual', 'esta_disponible')

class DetalleVentaInline(admin.TabularInline):
    model = DetalleVenta
    extra = 1

@admin.register(VentaProducto)
class VentaProductoAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente', 'fecha_venta', 'monto_total', 'estado_pago')
    inlines = [DetalleVentaInline]

@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'subject', 'status', 'created_at')
    list_filter = ('status',)

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'autor', 'fecha_publicacion', 'esta_publicado')
    list_filter = ('esta_publicado', 'fecha_publicacion')

@admin.register(Contacto)
class ContactoAdmin(admin.ModelAdmin):
    list_display = ('asunto', 'email', 'fecha_envio', 'leido')
    list_filter = ('leido', 'fecha_envio')

@admin.register(Resena)
class ResenaAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'calificacion', 'fecha')
    list_filter = ('calificacion', 'fecha')

@admin.register(Seccion)
class SeccionAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'curso', 'orden')
    list_filter = ('curso',)

@admin.register(Leccion)
class LeccionAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'seccion', 'tipo', 'orden')
    list_filter = ('seccion__curso', 'tipo')
