# Documentación de Funcionalidades CRM

Este documento detalla las funcionalidades de Gestión de Relaciones con Clientes (CRM) identificadas en el código fuente del proyecto "TMM v2". El sistema integra capacidades de CRM directamente en el backend de Django, permitiendo una gestión unificada de clientes, ventas y marketing.

## 1. Gestión de Clientes y Contactos

El núcleo del CRM es el modelo `Cliente`, que centraliza la información de todos los usuarios que interactúan con la plataforma.

### 1.1 Perfiles de Cliente
- **Tipos de Cliente**: El sistema distingue entre dos tipos principales de clientes:
    - **B2C (Persona Natural)**: Estudiantes individuales.
    - **B2B (Empresa)**: Contactos corporativos vinculados a una entidad `Empresa`.
- **Datos Personales**: Almacena información clave como nombre completo, email, teléfono, fecha de nacimiento y comuna.
- **Vinculación de Usuario**: Se integra con el sistema de autenticación de Django (`User`), permitiendo que los clientes tengan cuentas de acceso para ver sus cursos.

### 1.2 Gestión de Ciclo de Vida (Lifecycle)
El sistema rastrea automáticamente la etapa en la que se encuentra cada contacto:
- **LEAD**: Usuario registrado (ej. vía newsletter) que aún no ha comprado.
- **PROSPECTO**: Usuario que ha mostrado interés real o cualificado.
- **CLIENTE**: Usuario que ha realizado al menos una compra (taller o curso).
- **INACTIVO**: Clientes que no han tenido actividad reciente.

*Nota: El sistema actualiza automáticamente el estado de 'LEAD' a 'CLIENTE' cuando se registra una inscripción exitosa.*

### 1.3 Segmentación
- **Intereses**: Los clientes pueden ser etiquetados con múltiples `Intereses` (categorías), lo que permite segmentar para campañas de marketing futuras.
- **Origen**: Se registra la fuente de adquisición del cliente (Instagram, Google, Referido, Evento, etc.) para análisis de atribución.

## 2. Gestión de Ventas e Inscripciones

El CRM monitorea todas las transacciones y el acceso a productos.

### 2.1 Inscripciones
- **Talleres y Cursos**: Se registran por separado (`Inscripcion` para talleres, `InscripcionCurso` para cursos grabados).
- **Estado de Pago**: Control de estados como 'PENDIENTE', 'PAGADO', 'ABONADO', 'ANULADO'.
- **Control de Stock**: Para talleres presenciales, el sistema gestiona automáticamente los cupos disponibles, impidiendo sobreventas.

### 2.2 Ventas de Productos Físicos
- **Kits/Productos**: Gestión de ventas de productos físicos con control de inventario (`stock_actual`).
- **Validación**: El sistema valida el stock antes de confirmar una venta y lo descuenta automáticamente.

## 3. Comunicación y Marketing

Herramientas integradas para la comunicación con la base de clientes.

### 3.1 Email Marketing
- **Envíos Masivos**: Funcionalidad para enviar correos a una lista de clientes seleccionados (`BulkEmailView`).
- **Plantillas**: Soporte para diferentes tipos de comunicaciones:
    - **Ofertas**: Promociones comerciales.
    - **Recordatorios**: Avisos sobre talleres o cursos.
    - **Personalizados**: Mensajes libres.
- **Logs**: Registro de todos los correos enviados (`EmailLog`) para auditoría y seguimiento de entregabilidad.

### 3.2 Captación de Leads
- **Newsletter**: Endpoint dedicado (`NewsletterViewSet`) para capturar correos de visitantes interesados. Si el correo ya existe, actualiza su estatus; si es nuevo, crea un registro de `LEAD`.

## 4. Seguimiento y Actividad (Bitácora)

El modelo `Interaccion` permite al equipo de ventas o soporte mantener un historial de la relación con el cliente.

- **Registro de Interacciones**: Permite registrar llamadas, correos, reuniones o mensajes de WhatsApp.
- **Detalle**: Almacena un resumen y el detalle completo de la conversación.
- **Responsable**: Vincula la interacción con el usuario del staff que la realizó.

## 5. Reportes y Analítica

El `AdminDashboardView` proporciona una visión general del rendimiento del negocio basada en datos del CRM.

- **Métricas Clave**:
    - Ingresos totales.
    - Estudiantes activos.
    - Nuevos leads captados.
- **Gráficos**: Datos para visualizar la evolución de ingresos mensuales.
- **Insights**: Identificación de categorías más populares y talleres mejor calificados.

## Resumen Técnico de Componentes

| Funcionalidad | Modelos Principales (Backend) | Vistas/Controladores Clave |
|--------------|-------------------------------|----------------------------|
| **Clientes** | `Cliente`, `Empresa` | `AdminClienteViewSet` |
| **Ventas** | `Inscripcion`, `InscripcionCurso`, `VentaProducto` | `EnrollmentView`, `AdminRevenueView` |
| **Marketing** | `EmailLog`, `Interes` | `BulkEmailView`, `NewsletterViewSet` |
| **Actividad** | `Interaccion` | `AdminClienteDetailView` |
| **Feedback** | `Resena` | `ResenaViewSet` |
