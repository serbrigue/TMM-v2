from django.contrib import admin
from .models import Empresa, Interes, Cliente, Interaccion, Taller, Inscripcion, Producto, VentaProducto, DetalleVenta, EmailLog

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

@admin.register(Inscripcion)
class InscripcionAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'taller', 'estado_pago')
    list_filter = ('estado_pago',)

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
