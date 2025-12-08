from django.db import models
from django.db.models import F, Sum
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

# --- MODELO NUEVO: Empresa ---
class Empresa(models.Model):
    """Representa a una empresa o institución cliente (B2B)."""
    razon_social = models.CharField(max_length=200, unique=True, verbose_name="Razón Social")
    rut = models.CharField(max_length=12, blank=True, null=True, unique=True, verbose_name="RUT")
    direccion = models.CharField(max_length=255, blank=True, null=True, verbose_name="Dirección")
    telefono_empresa = models.CharField(max_length=20, blank=True, null=True, verbose_name="Teléfono Empresa")
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Empresa (B2B)"
        verbose_name_plural = "Empresas (B2B)"

    def __str__(self):
        return self.razon_social

# --- MODELO 1: Interes ---
class Interes(models.Model):
    """Categorías de interés (Marketing)."""
    nombre = models.CharField(max_length=100, unique=True, verbose_name="Nombre del Interés")
    descripcion = models.TextField(blank=True, verbose_name="Descripción")

    class Meta:
        verbose_name_plural = "Intereses"

    def __str__(self):
        return self.nombre

# --- MODELO 2: Cliente (OPTIMIZADO PARA CRM Y LEADS) ---
class Cliente(models.Model):
    """
    Gestión central de contactos.
    OPTIMIZACIÓN: Se añaden campos para 'Ciclo de Vida' y 'Origen' para gestión de Leads.
    """
    TIPO_CLIENTE_CHOICES = [
        ('B2C', 'Persona Natural'),
        ('B2B', 'Contacto Empresa'),
    ]
    
    # CRM: Ciclo de vida del cliente
    ESTADO_LIFECYCLE_CHOICES = [
        ('LEAD', 'Lead (Potencial)'),       # Se registró pero no ha comprado
        ('PROSPECTO', 'Prospecto Calificado'), # Mostró interés real (ej: preguntó precio)
        ('CLIENTE', 'Cliente Activo'),      # Ya compró
        ('INACTIVO', 'Cliente Inactivo'),   # Hace tiempo no compra
    ]

    # CRM: Atribución de marketing
    ORIGEN_CHOICES = [
        ('INSTAGRAM', 'Instagram'),
        ('GOOGLE', 'Google/Web'),
        ('REFERIDO', 'Referido por amigo'),
        ('EVENTO', 'Evento Presencial'),
        ('OTRO', 'Otro'),
    ]

    nombre_completo = models.CharField(max_length=150, verbose_name="Nombre Completo")
    email = models.EmailField(unique=True, verbose_name="Correo Electrónico")
    telefono = models.CharField(max_length=20, blank=True, null=True, verbose_name="Teléfono")
    fecha_nacimiento = models.DateField(blank=True, null=True, verbose_name="Fecha de Nacimiento")

    # Relación B2B
    empresa = models.ForeignKey(Empresa, on_delete=models.SET_NULL, blank=True, null=True, related_name='contactos', verbose_name="Empresa (si aplica)")
    
    # Vinculación con Usuario de Django (Para Login)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='cliente_perfil')

    # Segmentación
    comuna_vive = models.CharField(max_length=100, blank=True, null=True, verbose_name="Comuna")
    tipo_cliente = models.CharField(max_length=3, choices=TIPO_CLIENTE_CHOICES, default='B2C', verbose_name="Tipo")
    
    # NUEVOS CAMPOS CRM
    estado_ciclo = models.CharField(max_length=20, choices=ESTADO_LIFECYCLE_CHOICES, default='LEAD', verbose_name="Estado del Lead")
    origen = models.CharField(max_length=20, choices=ORIGEN_CHOICES, default='OTRO', verbose_name="Origen del Contacto")
    
    intereses_cliente = models.ManyToManyField(Interes, blank=True, related_name='clientes', verbose_name="Intereses")
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        etiqueta = f" [{self.get_estado_ciclo_display()}]"
        if self.tipo_cliente == 'B2B' and self.empresa:
            return f"{self.nombre_completo} ({self.empresa.razon_social}){etiqueta}"
        return f"{self.nombre_completo}{etiqueta}"

# --- MODELO NUEVO: Interaccion (CRM PURO) ---
class Interaccion(models.Model):
    """
    Historial de contacto con el cliente. Reemplaza el campo de texto simple 'observaciones'.
    Permite saber qué vendedor habló con quién y cuándo.
    """
    TIPO_INTERACCION = [
        ('LLAMADA', 'Llamada Telefónica'),
        ('WHATSAPP', 'WhatsApp'),
        ('EMAIL', 'Correo Electrónico'),
        ('REUNION', 'Reunión Presencial/Zoom'),
    ]
    
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='interacciones')
    tipo = models.CharField(max_length=20, choices=TIPO_INTERACCION, default='EMAIL')
    resumen = models.CharField(max_length=200, verbose_name="Resumen breve")
    detalle = models.TextField(blank=True, verbose_name="Detalle de la conversación")
    fecha = models.DateTimeField(default=timezone.now)
    # Vinculación con el usuario del sistema (vendedor/staff)
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Vendedor/Staff")

    class Meta:
        ordering = ['-fecha']
        verbose_name = "Interacción CRM"
        verbose_name_plural = "Bitácora de Interacciones"

    def __str__(self):
        return f"{self.get_tipo_display()} con {self.cliente} el {self.fecha.strftime('%d/%m/%Y')}"

# --- MODELO 3: Taller (OPTIMIZADO) ---
class Taller(models.Model):
    MODALIDAD_CHOICES = [('PRESENCIAL', 'Presencial'), ('ONLINE', 'Online')]
    TIPO_CLIENTE_CHOICES = [
        ('B2C', 'B2C (Personas)'),
        ('B2B', 'B2B (Empresas)'),
        ('AMBOS', 'Ambos'),
    ]

    nombre = models.CharField(max_length=200, unique=True, verbose_name="Nombre del Taller")
    descripcion = models.TextField(verbose_name="Descripción Detallada")
    imagen = models.ImageField(upload_to='talleres/', blank=True, null=True)
    categoria = models.ForeignKey(Interes, on_delete=models.SET_NULL, null=True, blank=True, related_name='talleres')
    
    fecha_taller = models.DateField(verbose_name="Fecha del Taller")
    hora_taller = models.TimeField(blank=True, null=True)
    modalidad = models.CharField(max_length=15, choices=MODALIDAD_CHOICES, default='PRESENCIAL')
    
    precio = models.DecimalField(max_digits=10, decimal_places=0)
    cupos_totales = models.IntegerField(default=10)
    cupos_disponibles = models.IntegerField(default=0, verbose_name="Cupos Disponibles")
    esta_activo = models.BooleanField(default=True)
    tipo_cliente = models.CharField(max_length=10, choices=TIPO_CLIENTE_CHOICES, default='AMBOS', verbose_name="Tipo de Cliente")

    def save(self, *args, **kwargs):
        # Si es nuevo, inicializamos los cupos disponibles igual a los totales
        if not self.id:
            self.cupos_disponibles = self.cupos_totales
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombre} ({self.fecha_taller})"
    
    @property
    def estado_taller(self):
        """Lógica visual para saber si el taller está lleno o finalizado."""
        if self.fecha_taller < timezone.now().date():
            return "FINALIZADO"
        if self.cupos_disponibles <= 0:
            return "AGOTADO"
        return "DISPONIBLE"

# --- MODELO NUEVO: Lista de Espera ---
class ListaEspera(models.Model):
    taller = models.ForeignKey(Taller, on_delete=models.CASCADE, related_name='lista_espera')
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    notificado = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['fecha_registro'] # FIFO
        unique_together = ['taller', 'usuario']
        verbose_name = "Lista de Espera"
        verbose_name_plural = "Listas de Espera"

    def __str__(self):
        return f"{self.usuario.email} esperando {self.taller.nombre}"

# --- MODELO 9: Curso (Cursos Grabados) ---
# Moved up because Enrollment needs to reference it (or use string reference)
class Curso(models.Model):
    titulo = models.CharField(max_length=200, verbose_name="Título del Curso")
    categoria = models.ForeignKey(Interes, on_delete=models.SET_NULL, null=True, blank=True, related_name='cursos')
    imagen = models.ImageField(upload_to='cursos/', blank=True, null=True)
    descripcion = models.TextField(verbose_name="Descripción")
    precio = models.DecimalField(max_digits=10, decimal_places=0)
    duracion = models.CharField(max_length=100, verbose_name="Duración (ej: 5 horas)")
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=5.0)
    estudiantes = models.IntegerField(default=0)
    estudiantes = models.IntegerField(default=0)
    esta_activo = models.BooleanField(default=True)
    tipo_cliente = models.CharField(max_length=10, choices=Taller.TIPO_CLIENTE_CHOICES, default='AMBOS', verbose_name="Tipo de Cliente")
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Curso Grabado"
        verbose_name_plural = "Cursos Grabados"

    def __str__(self):
        return self.titulo

# --- MODELO UNIFICADO: Enrollment (Inscripción) ---
class Enrollment(models.Model):
    """
    Modelo unificado para inscripciones a Talleres y Cursos.
    Reemplaza a Inscripcion e InscripcionCurso.
    """
    ESTADO_PAGO_CHOICES = [
        ('PENDIENTE', 'Pago Pendiente'),
        ('PAGADO', 'Pagado Completo'),
        ('ABONADO', 'Abonado'),
        ('ANULADO', 'Anulado'),
        ('RECHAZADO', 'Rechazado'),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='enrollments')
    
    # Generic Foreign Key to link to either Taller or Curso
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    monto_pagado = models.DecimalField(max_digits=10, decimal_places=0, default=0)
    estado_pago = models.CharField(max_length=10, choices=ESTADO_PAGO_CHOICES, default='PENDIENTE')
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)
    
    # Campos específicos para Cursos
    progreso = models.IntegerField(default=0, verbose_name="Progreso %")
    completado = models.BooleanField(default=False)
    ultima_leccion_vista = models.ForeignKey('Leccion', on_delete=models.SET_NULL, null=True, blank=True, related_name='enrollments_vistos')

    class Meta:
        indexes = [
            models.Index(fields=["content_type", "object_id"]),
        ]
        verbose_name = "Inscripción"
        verbose_name_plural = "Inscripciones"

    def clean(self):
        """
        Validación previa al guardado.
        """
        if not self.id and self.content_type.model == 'taller':
            taller = self.content_object
            if taller and taller.cupos_disponibles <= 0:
                raise ValidationError(f"El taller {taller.nombre} no tiene cupos disponibles.")

    def save(self, *args, **kwargs):
        from django.db import transaction
        
        es_nuevo = not self.id
        
        if es_nuevo:
            with transaction.atomic():
                # Lógica para Talleres: Descontar cupo con bloqueo
                if self.content_type.model == 'taller':
                    # Lock the taller row
                    taller = Taller.objects.select_for_update().get(id=self.object_id)
                    if taller.cupos_disponibles <= 0:
                        raise ValidationError(f"El taller {taller.nombre} no tiene cupos disponibles.")
                    
                    taller.cupos_disponibles = F('cupos_disponibles') - 1
                    taller.save()
                
                # Lógica para Cursos: Incrementar estudiantes
                elif self.content_type.model == 'curso':
                    Curso.objects.filter(id=self.object_id).update(estudiantes=F('estudiantes') + 1)
                
                super().save(*args, **kwargs)
                
                # Actualizar estado del cliente a 'CLIENTE' si era 'LEAD'
                if self.cliente.estado_ciclo in ['LEAD', 'PROSPECTO']:
                    self.cliente.estado_ciclo = 'CLIENTE'
                    self.cliente.save()
        else:
            # Logic for status change
            with transaction.atomic():
                old_instance = Enrollment.objects.get(pk=self.pk)
                old_status = old_instance.estado_pago
                new_status = self.estado_pago
                
                # Case 1: Changing TO ANULADO (Release spot)
                if old_status != 'ANULADO' and new_status == 'ANULADO':
                    if self.content_type.model == 'taller':
                        Taller.objects.filter(id=self.object_id).update(cupos_disponibles=F('cupos_disponibles') + 1)
                    elif self.content_type.model == 'curso':
                        Curso.objects.filter(id=self.object_id).update(estudiantes=F('estudiantes') - 1)
                
                # Case 2: Changing FROM ANULADO (Reclaim spot)
                elif old_status == 'ANULADO' and new_status != 'ANULADO':
                    if self.content_type.model == 'taller':
                        taller = Taller.objects.select_for_update().get(id=self.object_id)
                        if taller.cupos_disponibles <= 0:
                             raise ValidationError(f"El taller {taller.nombre} no tiene cupos disponibles para reactivar la inscripción.")
                        taller.cupos_disponibles = F('cupos_disponibles') - 1
                        taller.save()
                    elif self.content_type.model == 'curso':
                        Curso.objects.filter(id=self.object_id).update(estudiantes=F('estudiantes') + 1)

                super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Lógica para Talleres: Devolver cupo
        if self.content_type.model == 'taller':
            Taller.objects.filter(id=self.object_id).update(cupos_disponibles=F('cupos_disponibles') + 1)
        
        # Lógica para Cursos: Decrementar estudiantes (opcional, pero consistente)
        elif self.content_type.model == 'curso':
            Curso.objects.filter(id=self.object_id).update(estudiantes=F('estudiantes') - 1)

        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.cliente} - {self.content_object}"

    @property
    def saldo_pendiente(self):
        if hasattr(self.content_object, 'precio'):
            return max(0, self.content_object.precio - self.monto_pagado)
        return 0

    def actualizar_estado_pago(self):
        """Actualiza el monto pagado y el estado basado en transacciones aprobadas."""
        total_aprobado = self.transacciones.filter(estado='APROBADO').aggregate(Sum('monto'))['monto__sum'] or 0
        self.monto_pagado = total_aprobado
        
        if self.saldo_pendiente <= 0:
            self.estado_pago = 'PAGADO'
        elif total_aprobado > 0:
            self.estado_pago = 'ABONADO'
        else:
            self.estado_pago = 'PENDIENTE'
        self.save()

def transaction_file_path(instance, filename):
    import uuid
    import os
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('comprobantes/', filename)

# --- MODELO NUEVO: Orden (Carrito Unificado) ---
class Orden(models.Model):
    ESTADO_PAGO_CHOICES = [
        ('PENDIENTE', 'Pago Pendiente'),
        ('PAGADO', 'Pagado Completo'),
        ('RECHAZADO', 'Rechazado'),
    ]
    
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='ordenes')
    fecha = models.DateTimeField(auto_now_add=True)
    monto_total = models.DecimalField(max_digits=10, decimal_places=0)
    estado_pago = models.CharField(max_length=10, choices=ESTADO_PAGO_CHOICES, default='PENDIENTE')
    
    ESTADO_ENTREGA_CHOICES = [
        ('PENDIENTE', 'Pendiente de envío'),
        ('EN_PREPARACION', 'En preparación'),
        ('ENVIADO', 'Enviado'),
        ('ENTREGADO', 'Entregado'),
        ('CANCELADO', 'Cancelado'),
    ]
    estado_entrega = models.CharField(max_length=20, choices=ESTADO_ENTREGA_CHOICES, default='PENDIENTE')
    
    # Enrollments generated by this order
    enrollments = models.ManyToManyField(Enrollment, blank=True, related_name='orden_origen')

    class Meta:
        verbose_name = "Orden de Compra"
        verbose_name_plural = "Ordenes de Compra"
        ordering = ['-fecha']

    def __str__(self):
        return f"Orden #{self.id} - {self.cliente} (${self.monto_total})"

    def actualizar_estado_pago(self):
        """Actualiza el estado basado en transacciones aprobadas."""
        total_aprobado = self.transacciones.filter(estado='APROBADO').aggregate(Sum('monto'))['monto__sum'] or 0
        
        if total_aprobado >= self.monto_total:
            self.estado_pago = 'PAGADO'
            # Update related enrollments
            self.enrollments.update(estado_pago='PAGADO')
        else:
            self.estado_pago = 'PENDIENTE'
        self.save()

# --- MODELO NUEVO: Cotizacion (B2B) ---
class Cotizacion(models.Model):
    """
    Modelo para generar cotizaciones formales para empresas (B2B).
    No afecta inventario ni contabilidad hasta que se convierte en Orden.
    """
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='cotizaciones')
    fecha_emision = models.DateTimeField(auto_now_add=True)
    validez_dias = models.IntegerField(default=15, verbose_name="Días de Validez")
    monto_total = models.DecimalField(max_digits=10, decimal_places=0)
    items_json = models.JSONField(verbose_name="Detalle de Items (Snapshot)")
    
    # Metadata empresa
    razon_social = models.CharField(max_length=200, blank=True, null=True)
    rut_empresa = models.CharField(max_length=20, blank=True, null=True)
    
    class Meta:
        verbose_name = "Cotización"
        verbose_name_plural = "Cotizaciones"
        ordering = ['-fecha_emision']

    def __str__(self):
        return f"Cotización #{self.id} - {self.cliente}"

# --- MODELO NUEVO: DetalleOrden (Productos en la Orden) ---
class DetalleOrden(models.Model):
    orden = models.ForeignKey(Orden, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey('Producto', on_delete=models.PROTECT)
    cantidad = models.IntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=0)

    class Meta:
        verbose_name = "Detalle de Orden"
        verbose_name_plural = "Detalles de Orden"

    def __str__(self):
        return f"{self.cantidad}x {self.producto.nombre} en Orden #{self.orden.id}"

    def subtotal(self):
        return self.cantidad * self.precio_unitario

# --- MODELO NUEVO: Transaccion (Pagos) ---
class Transaccion(models.Model):
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente de Revisión'),
        ('APROBADO', 'Aprobado'),
        ('RECHAZADO', 'Rechazado'),
    ]

    # Vinculado a Enrollment (legacy/single item) OR Orden (cart)
    inscripcion = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='transacciones', null=True, blank=True)
    orden = models.ForeignKey(Orden, on_delete=models.CASCADE, related_name='transacciones', null=True, blank=True)
    
    monto = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="Monto Transacción")
    comprobante = models.ImageField(upload_to=transaction_file_path, blank=True, null=True, verbose_name="Comprobante de Pago")
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='PENDIENTE')
    observacion = models.TextField(blank=True, verbose_name="Observación (ej: motivo rechazo)")

    class Meta:
        verbose_name = "Transacción"
        verbose_name_plural = "Transacciones"
        ordering = ['-fecha']

    def __str__(self):
        if self.orden:
            return f"Pago Orden #{self.orden.id} - ${self.monto} ({self.estado})"
        cliente = self.inscripcion.cliente if self.inscripcion else "Sin Cliente"
        return f"Pago Inscripción - ${self.monto} - {cliente} ({self.estado})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Al guardar una transacción, actualizamos el estado
        if self.estado == 'APROBADO':
            if self.inscripcion:
                self.inscripcion.actualizar_estado_pago()
            if self.orden:
                self.orden.actualizar_estado_pago()

# --- MODELO 5: Producto ---
class Producto(models.Model):
    nombre = models.CharField(max_length=200, unique=True)
    descripcion = models.TextField(blank=True)
    precio_venta = models.DecimalField(max_digits=10, decimal_places=0)
    esta_disponible = models.BooleanField(default=True)
    imagen = models.ImageField(upload_to='productos/', blank=True, null=True)
    
    # Inventory Management
    es_fisico = models.BooleanField(default=False, help_text="¿Requiere envío/despacho?")
    controlar_stock = models.BooleanField(default=True)
    stock_actual = models.PositiveIntegerField(default=0)
    stock_critico = models.PositiveIntegerField(default=5, help_text="Alerta de stock bajo")

    class Meta:
        verbose_name_plural = "Productos (Kits)"

    def __str__(self):
        return f"{self.nombre} (Stock: {self.stock_actual})"

    def tiene_stock(self, cantidad=1):
        if not self.controlar_stock:
            return True
        return self.stock_actual >= cantidad

# --- MODELO 6: VentaProducto ---
class VentaProducto(models.Model):
    ESTADO_PAGO_CHOICES = [
        ('PENDIENTE', 'Pago Pendiente'),
        ('PAGADO', 'Pagado Completo'),
        ('ANULADO', 'Anulado'),
    ]
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='compras_kits')
    fecha_venta = models.DateTimeField(auto_now_add=True)
    monto_total = models.DecimalField(max_digits=10, decimal_places=0, default=0)
    estado_pago = models.CharField(max_length=10, choices=ESTADO_PAGO_CHOICES, default='PAGADO')

    class Meta:
        verbose_name_plural = "Ventas de Productos"

    def __str__(self):
        return f"Venta #{self.id} - {self.cliente}"

# --- MODELO 7: DetalleVenta (CON VALIDACIÓN DE STOCK) ---
class DetalleVenta(models.Model):
    venta = models.ForeignKey(VentaProducto, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.IntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=0)

    class Meta:
        verbose_name_plural = "Detalles de Venta"

    def clean(self):
        if not self.id:
            if self.producto.stock_actual < self.cantidad:
                raise ValidationError(f"No hay suficiente stock de {self.producto.nombre}. Disponible: {self.producto.stock_actual}")

    def save(self, *args, **kwargs):
        es_nuevo = not self.id
        super().save(*args, **kwargs)
        
        if es_nuevo:
            # Descontar stock
            Producto.objects.filter(id=self.producto.id).update(stock_actual=F('stock_actual') - self.cantidad)
            # Actualizar ciclo del cliente
            if self.venta.cliente.estado_ciclo in ['LEAD', 'PROSPECTO']:
                self.venta.cliente.estado_ciclo = 'CLIENTE'
                self.venta.cliente.save()
    
    def subtotal(self):
        return self.cantidad * self.precio_unitario

# --- MODELO 8: EmailLog ---
class EmailLog(models.Model):
    STATUS_CHOICES = [('SUCCESS', 'Enviado'), ('FAIL', 'Fallido')]
    recipient = models.EmailField(blank=True, null=True)
    subject = models.CharField(max_length=255)
    body_text = models.TextField(blank=True, null=True)
    body_html = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='SUCCESS')
    error_message = models.TextField(blank=True, null=True)
    # Updated to point to Enrollment
    inscripcion = models.ForeignKey(Enrollment, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Email to {self.recipient} [{self.status}]"

# --- MODELO 10: Post (Blog) ---
class Post(models.Model):
    titulo = models.CharField(max_length=200)
    extracto = models.TextField(verbose_name="Extracto (para tarjetas)")
    contenido = models.TextField(verbose_name="Contenido del Post")
    imagen = models.ImageField(upload_to='blog/', blank=True, null=True)
    autor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    categoria = models.ForeignKey(Interes, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    fecha_publicacion = models.DateTimeField(default=timezone.now)
    esta_publicado = models.BooleanField(default=True)

    class Meta:
        ordering = ['-fecha_publicacion']
        verbose_name = "Artículo de Blog"
        verbose_name_plural = "Blog"

    def __str__(self):
        return self.titulo

# --- MODELO 11: Contacto (Formulario Web) ---
class Contacto(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField()
    asunto = models.CharField(max_length=200)
    mensaje = models.TextField()
    fecha_envio = models.DateTimeField(auto_now_add=True)
    leido = models.BooleanField(default=False)

    class Meta:
        ordering = ['-fecha_envio']
        verbose_name = "Mensaje de Contacto"
        verbose_name_plural = "Mensajes de Contacto"

    def __str__(self):
        return f"{self.asunto} - {self.email}"

# --- COURSE CONTENT MODELS ---

class Seccion(models.Model):
    """Sección de un curso (módulo o capítulo)."""
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='secciones')
    titulo = models.CharField(max_length=200, verbose_name="Título de la Sección")
    descripcion = models.TextField(blank=True, verbose_name="Descripción")
    orden = models.IntegerField(default=0, verbose_name="Orden")
    esta_activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['orden']
        verbose_name = "Sección de Curso"
        verbose_name_plural = "Secciones de Curso"

    def __str__(self):
        return f"{self.curso.titulo} - {self.titulo}"

class Leccion(models.Model):
    """Lección individual dentro de una sección."""
    TIPO_CHOICES = [
        ('VIDEO', 'Video'),
        ('LECTURA', 'Lectura'),
        ('ACTIVIDAD', 'Actividad'),
        ('QUIZ', 'Quiz'),
    ]
    
    seccion = models.ForeignKey(Seccion, on_delete=models.CASCADE, related_name='lecciones')
    titulo = models.CharField(max_length=200, verbose_name="Título de la Lección")
    descripcion = models.TextField(blank=True, verbose_name="Descripción")
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='LECTURA')
    orden = models.IntegerField(default=0, verbose_name="Orden")
    duracion_estimada = models.IntegerField(default=0, verbose_name="Duración Estimada (minutos)")
    esta_activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['orden']
        verbose_name = "Lección"
        verbose_name_plural = "Lecciones"

    def __str__(self):
        return f"{self.seccion.titulo} - {self.titulo}"

class ContenidoLeccion(models.Model):
    """Contenido específico de una lección."""
    leccion = models.OneToOneField(Leccion, on_delete=models.CASCADE, related_name='contenido')
    contenido_texto = models.TextField(blank=True, verbose_name="Contenido de Texto (HTML)")
    url_video = models.URLField(blank=True, null=True, verbose_name="URL del Video")
    archivo_adjunto = models.FileField(upload_to='lecciones/', blank=True, null=True, verbose_name="Archivo Adjunto")
    recursos_adicionales = models.TextField(blank=True, verbose_name="Recursos Adicionales (JSON o texto)")

    class Meta:
        verbose_name = "Contenido de Lección"
        verbose_name_plural = "Contenidos de Lecciones"

    def __str__(self):
        return f"Contenido: {self.leccion.titulo}"

class Actividad(models.Model):
    """Actividad o tarea asociada a una lección."""
    TIPO_CHOICES = [
        ('TAREA', 'Tarea'),
        ('EJERCICIO', 'Ejercicio Práctico'),
        ('PROYECTO', 'Proyecto'),
        ('REFLEXION', 'Reflexión Personal'),
    ]
    
    leccion = models.ForeignKey(Leccion, on_delete=models.CASCADE, related_name='actividades')
    titulo = models.CharField(max_length=200, verbose_name="Título de la Actividad")
    descripcion = models.TextField(verbose_name="Descripción")
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='TAREA')
    instrucciones = models.TextField(verbose_name="Instrucciones Detalladas")
    archivo_plantilla = models.FileField(upload_to='actividades/', blank=True, null=True, verbose_name="Plantilla o Archivo de Apoyo")
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Actividad"
        verbose_name_plural = "Actividades"

    def __str__(self):
        return f"{self.leccion.titulo} - {self.titulo}"

class ProgresoLeccion(models.Model):
    """Seguimiento del progreso del estudiante en cada lección."""
    # Updated to point to Enrollment
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='progreso_lecciones', null=True, blank=True)
    leccion = models.ForeignKey(Leccion, on_delete=models.CASCADE, related_name='progresos')
    completado = models.BooleanField(default=False)
    fecha_inicio = models.DateTimeField(null=True, blank=True)
    fecha_completado = models.DateTimeField(null=True, blank=True)
    tiempo_dedicado = models.IntegerField(default=0, verbose_name="Tiempo Dedicado (minutos)")
    notas_estudiante = models.TextField(blank=True, verbose_name="Notas del Estudiante")

    class Meta:
        unique_together = ['enrollment', 'leccion']
        verbose_name = "Progreso de Lección"
        verbose_name_plural = "Progresos de Lecciones"

    def __str__(self):
        return f"{self.enrollment.cliente.nombre_completo} - {self.leccion.titulo}"

    def marcar_completado(self):
        """Marca la lección como completada y actualiza la fecha."""
        if not self.completado:
            self.completado = True
            self.fecha_completado = timezone.now()
            self.save()

# --- MODELO 12: Resena (Reviews) ---
class Resena(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='resenas')
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='resenas', null=True, blank=True)
    taller = models.ForeignKey(Taller, on_delete=models.CASCADE, related_name='resenas', null=True, blank=True)
    interes = models.ForeignKey(Interes, on_delete=models.SET_NULL, related_name='resenas', null=True, blank=True)
    calificacion = models.IntegerField(choices=[(i, i) for i in range(1, 6)], verbose_name="Calificación (1-5)")
    comentario = models.TextField(verbose_name="Comentario")
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Reseña"
        verbose_name_plural = "Reseñas"
        ordering = ['-fecha']

    def save(self, *args, **kwargs):
        # Auto-populate interes based on taller or curso
        if self.taller and self.taller.categoria:
            self.interes = self.taller.categoria
        elif self.curso and self.curso.categoria:
            self.interes = self.curso.categoria
            
        super().save(*args, **kwargs)
        self.actualizar_promedio()

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        self.actualizar_promedio()

    def actualizar_promedio(self):
        from django.db.models import Avg
        if self.curso:
            promedio = self.curso.resenas.aggregate(Avg('calificacion'))['calificacion__avg'] or 0
            self.curso.rating = round(promedio, 1)
            self.curso.save()

    def __str__(self):
        return f"Reseña de {self.cliente} ({self.calificacion}★)"

# --- MODELO 13: Certificado ---
class Certificado(models.Model):
    import uuid
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    inscripcion = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='certificado')
    fecha_emision = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Certificado"
        verbose_name_plural = "Certificados"

    def __str__(self):
        return f"Certificado {self.uuid}"
