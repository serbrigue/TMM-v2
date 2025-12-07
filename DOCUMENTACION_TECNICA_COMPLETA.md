# Documentación Técnica Completa - TMM v2

Este documento consolida toda la información técnica del proyecto **TMM v2**, abarcando infraestructura, backend, frontend, integraciones y flujos críticos. Esta documentación ha sido generada agregando los detalles de todos los componentes del sistema.

---

# 1. Infraestructura

Este apartado detalla la configuración de infraestructura del proyecto TMM v2, incluyendo la configuración de Docker, variables de entorno y especificaciones de despliegue.

## 1.1 Visión General

El proyecto utiliza una arquitectura contenerizada gestionada por Docker Compose. Consta de cuatro servicios principales:
- **Backend**: Aplicación Django REST Framework.
- **Frontend**: Aplicación de Página Única (SPA) en React (Vite).
- **Base de Datos**: PostgreSQL.
- **Automatización**: Herramienta de automatización de flujos n8n.

## 1.2 Configuración de Docker

### Docker Compose (`docker-compose.yml`)
El archivo `docker-compose.yml` orquesta los servicios.

| Servicio | Imagen/Build | Puerto Interno | Puerto Externo | Volúmenes | Dependencias |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **backend** | `./backend` | 8000 | 8000 | `./backend:/app` | `db` |
| **frontend** | `./frontend` | 5173 | 5173 | `./frontend:/app`, `/app/node_modules` | `backend` |
| **db** | `postgres:15-alpine` | 5432 | - | `postgres_data:/var/lib/postgresql/data` | - |
| **n8n** | `n8nio/n8n:latest` | 5678 | 5678 | `n8n_data:/home/node/.n8n` | - |

### Contenedor Backend (`backend/Dockerfile`)
- **Imagen Base**: `python:3.10-slim`
- **Dependencias del Sistema**: `gcc`, `libpq-dev` (para el adaptador de PostgreSQL).
- **Dependencias de Python**: Instaladas desde `requirements.txt`.
- **Comando**: `python manage.py runserver 0.0.0.0:8000` (Servidor de desarrollo).

### Contenedor Frontend (`frontend/Dockerfile`)
- **Imagen Base**: `node:20-alpine`
- **Comando**: `npm run dev -- --host` (Servidor de desarrollo Vite).
- **Nota**: Los `node_modules` están montados como volumen para evitar discrepancias entre el host y el contenedor, pero también persisten en la imagen.

## 1.3 Variables de Entorno

El sistema depende de un archivo `.env` en el directorio raíz.

### Variables Requeridas (Inferidas)
Basado en los archivos de configuración:

**Base de Datos**
- `POSTGRES_DB`: Nombre de la base de datos.
- `POSTGRES_USER`: Usuario de la base de datos.
- `POSTGRES_PASSWORD`: Contraseña de la base de datos.
- `DB_HOST`: Hostname para la base de datos (usualmente `db` en Docker).
- `DB_PORT`: Puerto (por defecto `5432`).

**Django**
- `SECRET_KEY`: Clave secreta de Django.
- `DEBUG`: Booleano (True/False).
- `ALLOWED_HOSTS`: Lista separada por comas de hosts permitidos.

**n8n**
- `N8N_CORS_ORIGIN`: Orígenes CORS permitidos (ej., `*`).
- `WEBHOOK_URL`: URL para los webhooks de n8n.
- `N8N_HOST`: Hostname para n8n.

## 1.4 Redes y Volúmenes

### Redes
Todos los servicios comparten una red bridge por defecto creada por Docker Compose, permitiéndoles comunicarse mediante nombres de servicio (ej., `backend` puede alcanzar a `db` en `db:5432`).

### Volúmenes
- `postgres_data`: Persiste los datos de la base de datos PostgreSQL.
- `n8n_data`: Persiste los flujos de trabajo y configuraciones de n8n.

---

# 2. Modelos de Datos del Backend

Este apartado detalla el esquema de base de datos y los modelos de Django definidos en `backend/api/models.py`.

## 2.1 CRM y Usuarios

### `Cliente` (Customer)
Extiende el modelo User de Django para añadir capacidades de CRM.
- **Campos Clave**:
    - `user`: Enlace OneToOne al User de Django (para autenticación).
    - `tipo_cliente`: 'B2C' (Persona) o 'B2B' (Empresa).
    - `estado_ciclo`: Etapa del ciclo de vida ('LEAD', 'PROSPECTO', 'CLIENTE', 'INACTIVO').
    - `origen`: Fuente de atribución de marketing.
    - `empresa`: ForeignKey a `Empresa` (si es B2B).
- **Lógica**:
    - Actualiza automáticamente `estado_ciclo` de LEAD a CLIENTE tras la primera compra.

### `Empresa` (Company)
Representa clientes B2B.
- **Campos**: `razon_social`, `rut`, `direccion`, `telefono_empresa`.

### `Interaccion` (Interaction)
Registra interacciones de CRM con clientes.
- **Campos**: `cliente`, `tipo` (Llamada, Email, etc.), `resumen`, `detalle`, `usuario` (Staff).

### `Interes` (Interest)
Etiquetas para categorizar usuarios y contenido (Marketing).
- **Campos**: `nombre`, `descripcion`.

## 2.2 Productos y Catálogo

### `Taller` (Workshop)
Eventos sincrónicos (Online o Presencial).
- **Campos**: `nombre`, `fecha_taller`, `modalidad`, `precio`, `cupos_totales`, `cupos_disponibles`.
- **Lógica**:
    - Propiedad `estado_taller`: Retorna 'FINALIZADO', 'AGOTADO' o 'DISPONIBLE'.
    - `cupos_disponibles`: Gestionado mediante transacciones atómicas para prevenir sobreventa.

### `Curso` (Course)
Contenido grabado asincrónico.
- **Campos**: `titulo`, `precio`, `duracion`, `rating`, `estudiantes` (conteo).
- **Estructura**: Contiene `Seccion`es -> `Leccion`es.

### `Producto` (Physical Product)
Artículos físicos o kits.
- **Campos**: `nombre`, `precio_venta`, `stock_actual`, `stock_critico`, `controlar_stock`.
- **Lógica**: Verificación `tiene_stock(cantidad)`.

### `Post` (Blog)
Artículos de marketing de contenidos.
- **Campos**: `titulo`, `contenido`, `autor`, `categoria`, `fecha_publicacion`.

## 2.3 Ventas y Transacciones

### `Enrollment` (Inscripción Unificada)
Modelo central que vincula un `Cliente` a un `Taller` o `Curso`.
- **Polimorfismo**: Usa `GenericForeignKey` (`content_type`, `object_id`) para apuntar a Taller o Curso.
- **Campos**: `estado_pago` ('PENDIENTE', 'PAGADO', 'ANULADO', etc.), `monto_pagado`.
- **Lógica Crítica**:
    - **Creación**: Usa `transaction.atomic` y `select_for_update` para bloquear filas de Taller y decrementar `cupos_disponibles`.
    - **Eliminación/Anulación**: Restaura automáticamente cupos/plazas.

### `Orden` (Order/Cart)
Agrupa múltiples ítems para un solo proceso de pago.
- **Campos**: `cliente`, `monto_total`, `estado_pago`.
- **Relaciones**: ManyToMany a `Enrollment`, OneToMany a `DetalleOrden`.
- **Lógica**: `actualizar_estado_pago()` verifica transacciones relacionadas.

### `DetalleOrden`
Ítems de línea para productos físicos dentro de una Orden.
- **Campos**: `producto`, `cantidad`, `precio_unitario`.

### `Transaccion` (Payment)
Registra intentos de pago y comprobantes.
- **Campos**: `monto`, `comprobante` (Imagen), `estado` ('PENDIENTE', 'APROBADO', 'RECHAZADO').
- **Lógica**: Al aprobarse, dispara `actualizar_estado_pago()` en la Inscripción u Orden relacionada.

### `Cotizacion` (Quote)
Cotizaciones formales B2B.
- **Campos**: `validez_dias`, `items_json` (Snapshot de ítems).

## 2.4 Sistema de Gestión de Aprendizaje (LMS)

### `Seccion` y `Leccion`
Estructura jerárquica del contenido del curso.
- Tipos de `Leccion`: VIDEO, LECTURA, ACTIVIDAD, QUIZ.

### `ContenidoLeccion`
Contenido detallado para una lección.
- **Campos**: `contenido_texto` (HTML), `url_video`, `archivo_adjunto`.

### `ProgresoLeccion`
Rastrea el progreso del estudiante.
- **Campos**: `enrollment`, `leccion`, `completado`, `tiempo_dedicado`.

### `Certificado`
Emitido al completar el curso.
- **Campos**: `uuid`, `inscripcion`, `fecha_emision`.

## 2.5 Feedback y Utilidades

### `Resena` (Review)
Reseñas de usuarios para cursos/talleres.
- **Lógica**: Actualiza el promedio `Curso.rating` al guardar/eliminar.

### `ListaEspera` (Waitlist)
Usuarios esperando cupos en Talleres.
- **Campos**: `taller`, `usuario`, `notificado`.

### `EmailLog`
Registro de auditoría de correos enviados.
- **Campos**: `recipient`, `status`, `error_message`.

---

# 3. Referencia de API Backend

Este apartado detalla los endpoints de API proporcionados por el backend Django (`backend/api`).

## 3.1 Autenticación y Usuarios

| Método | Endpoint | Descripción | Permisos |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/register/` | Registra un nuevo usuario. Crea automáticamente un perfil `Cliente` (B2C/LEAD). Envía correo de bienvenida. | Público |
| **POST** | `/api/token/` | Obtiene tokens JWT de Acceso y Refresco. | Público |
| **GET/PUT** | `/api/profile/` | Obtiene o actualiza el perfil del usuario actual y detalles de `Cliente`. | Autenticado |

## 3.2 Catálogo Público

| Método | Endpoint | Descripción | Permisos |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/public/cursos/` | Lista cursos activos. | Público |
| **GET** | `/api/public/cursos/{id}/` | Obtiene detalles del curso. | Público |
| **GET** | `/api/public/talleres/` | Lista talleres activos. | Público |
| **GET** | `/api/public/talleres/{id}/` | Obtiene detalles del taller. | Público |
| **GET** | `/api/public/productos/` | Lista productos físicos disponibles. | Público |
| **GET** | `/api/public/posts/` | Lista artículos del blog. | Público |

## 3.3 Ventas e Inscripción (Lado Usuario)

### Checkout (`/api/checkout/`)
**POST** - Autenticado
- **Cuerpo**: `{ "items": [ { "type": "workshop|course|product", "id": 1, "quantity": 1 } ] }`
- **Lógica**:
    1. Crea una `Orden` (Carrito).
    2. Valida stock para productos (bloquea filas).
    3. Crea `Enrollment`s para cursos/talleres (verifica cupos).
    4. Vincula todo a la Orden.
    5. Retorna `orden_id` y `monto_total`.

### Inscripción Individual (`/api/enroll/`)
**POST** - Autenticado
- **Cuerpo**: `{ "tipo": "curso|taller", "id": 1 }`
- **Lógica**: Lógica de inscripción directa (Legacy/Compra rápida). Llama a `EnrollmentService`.

### Transacciones (`/api/admin/transacciones/`)
**POST** - Autenticado
- **Cuerpo**: `{ "orden_id": 1, "monto": 10000, "comprobante": (archivo) }`
- **Lógica**: Sube comprobante de pago. Establece transacción como `PENDIENTE`. Envía correo "Comprobante Recibido".

## 3.4 Administración (Solo Staff)

### Dashboard y Analíticas
- **GET** `/api/admin/dashboard/`: Métricas clave (Ingresos, Estudiantes Activos, Leads).
- **GET** `/api/admin/revenue/`: Desglose financiero detallado.

### Gestión (CRUD)
`ModelViewSet`s estándar para gestionar recursos.
- `/api/admin/talleres/`: Gestionar talleres. **Crear** dispara notificaciones por correo a clientes interesados. **Eliminar** dispara correos de cancelación a inscritos.
- `/api/admin/clientes/`: Gestionar perfiles CRM.
- `/api/admin/cursos/`: Gestionar cursos.
- `/api/admin/productos/`: Gestionar inventario.

### Verificación de Pagos
**TransaccionViewSet** (`/api/admin/transacciones/`)
- **POST** `{id}/aprobar/`:
    - Establece estado a `APROBADO`.
    - Actualiza estado de pago de `Orden` o `Enrollment`.
    - Envía correo "Pago Aceptado".
- **POST** `{id}/rechazar/`:
    - Establece estado a `RECHAZADO`.
    - Envía correo "Pago Rechazado" con observación.

## 3.5 Características B2B

- **POST** `/api/b2b/quote/`: Genera una cotización formal en PDF/JSON.
- **POST** `/api/b2b/bulk-enroll/`: Inscribe múltiples usuarios a la vez (Capacitación corporativa).

## 3.6 Servicios y Lógica

### `EnrollmentService`
Maneja la lógica compleja de:
- Verificar prerrequisitos.
- Gestionar cupos (Transacciones atómicas).
- Actualizar ciclo de vida del Cliente (Lead -> Cliente).

### `RevenueService`
Agrega datos financieros de modelos `Transaccion` y `Orden` para el dashboard.

---

# 4. Estructura y Configuración del Frontend

Este apartado detalla la estructura de la aplicación frontend, construida con React, Vite y Tailwind CSS.

## 4.1 Configuración del Proyecto

### Sistema de Construcción (Vite)
- **Config**: `vite.config.ts`
- **Puerto**: 5173 (Dev)
- **Plugins**: `@vitejs/plugin-react`

### Dependencias (`package.json`)
- **Core**: `react`, `react-dom`, `react-router-dom` (Enrutamiento).
- **Estilos**: `tailwindcss`, `clsx`, `tailwind-merge`, `framer-motion` (Animaciones), `@phosphor-icons/react`, `lucide-react` (Iconos).
- **Estado/Datos**: `axios` (HTTP), `react-hook-form` (Formularios), `jwt-decode` (Auth).
- **Componentes UI**: `@radix-ui/*` (Primitivas UI Headless).
- **Utilidades**: `date-fns` (Formato de fechas).
- **Integración**: `@n8n/chat` (Chatbot).

### Sistema de Diseño (`tailwind.config.js`)
El proyecto usa un sistema de diseño personalizado definido en Tailwind.

**Colores (Identidad de Marca)**
- `tmm-pink` (#F2D0DD) - Primario
- `tmm-green` (#C9F2DF) - Secundario
- `tmm-yellow` (#EEF27E) - Acento
- `tmm-white` (#F2F2F2) - Fondo
- `tmm-black` (#0D0D0D) - Texto

**Tipografía**
- **Serif**: "Cormorant Garamond", "Playfair Display" (Encabezados)
- **Sans**: "Plus Jakarta Sans", "Lato" (Cuerpo)

**Animaciones**
- Animación `blob` personalizada para efectos de fondo.
- `fade-in-up` para transiciones de entrada.

## 4.2 Estructura de Directorios (`src/`)

| Directorio | Propósito |
| :--- | :--- |
| `api/` | Instancia Axios y funciones de servicio API. |
| `assets/` | Activos estáticos (Imágenes, Fuentes). |
| `components/` | Componentes UI reutilizables (Botones, Tarjetas, Modales). |
| `config/` | Configuración global (URLs API, Constantes). |
| `context/` | Proveedores React Context (Auth, Cart). |
| `layouts/` | Layouts de página (MainLayout, AdminLayout). |
| `pages/` | Componentes de ruta (Vistas). |
| `App.tsx` | Componente principal de la aplicación y definición del Router. |
| `main.tsx` | Punto de entrada. |

## 4.3 Archivos de Configuración Clave
- `index.css`: Estilos globales y directivas Tailwind.
- `App.css`: Sobrescrituras específicas de componentes (mínimo).

---

# 5. Componentes y Estado del Frontend

Este apartado detalla los componentes principales y la gestión de estado del frontend.

## 5.1 Gestión de Estado (Context API)

### `AuthContext`
Gestiona la autenticación de usuario y estado de sesión.
- **Estado**: `user`, `isAuthenticated`, `loading`, `enrollments`.
- **Lógica**:
    - **Inicialización**: Verifica `access_token` in localStorage. Decodifica JWT para obtener info de usuario.
    - **Inscripciones**: Obtiene inscripciones activas del usuario (`/my-enrollments/`) para controlar acceso al contenido.
    - **Métodos**: `login(token)`, `logout()`, `isEnrolledInCourse(id)`.

### `CartContext`
Gestiona el estado del carrito de compras.
- **Estado**: `items` (Lista de `CartItem`), `isOpen` (Visibilidad del Drawer).
- **Persistencia**: Guarda carrito en `localStorage` ('tmm_cart').
- **Estructura de Ítem**: `{ type: 'workshop|course|product', id: 1, quantity: 1, ... }`.
- **Métodos**: `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`.

## 5.2 Componentes Principales (`src/components/`)

### Layout y Navegación
- **`Navbar`**: Barra de navegación responsiva. Se adapta basado en estado `isAuthenticated`.
- **`Footer`**: Pie de página del sitio con enlaces y registro a newsletter.
- **`Layout`**: Componente envoltorio para estructura de página estándar.

### Elementos UI
- **`ItemCard`**: Tarjeta reutilizable para mostrar Cursos, Talleres o Productos. Maneja lógica "Añadir al Carrito".
- **`PaymentModal`**: Modal para subir comprobantes de pago durante el checkout.
- **`StarRating`**: Componente visual para mostrar calificaciones (1-5 estrellas).
- **`ChatBot`**: Envoltorio de integración para el asistente de IA n8n.

## 5.3 Páginas Clave (`src/pages/`)

### Vistas Públicas
- **`Home`**: Página de aterrizaje con sección hero e ítems destacados.
- **`Courses` / `Workshops`**: Vistas de catálogo con filtrado.
- **`CourseDetail` / `WorkshopDetail`**: Vista detallada de un ítem específico.

### Vistas de Usuario
- **`Login` / `Register`**: Formularios de autenticación.
- **`Profile`**: Dashboard de usuario (Info personal, Historial de órdenes).
- **`CourseViewer`**: Interfaz LMS.
    - **Características**: Reproductor de video, navegación de lecciones, seguimiento de progreso.
    - **Protección**: Verifica `isEnrolledInCourse` antes de renderizar.

### Vistas de Admin (`src/pages/admin/`)
- **`Dashboard`**: Analíticas y gráficos.
- **`PaymentVerifier`**: Interfaz para aprobar/rechazar comprobantes de transferencia bancaria.
- **`Management`**: Interfaces CRUD para Talleres, Cursos, Clientes.

---

# 6. Integraciones

Este apartado detalla los servicios externos integrados en el sistema.

## 6.1 Chatbot IA (n8n) - "Carito"

El sistema cuenta con un chatbot impulsado por IA llamado "Carito", orquestado por n8n.

### Arquitectura
- **Frontend**: Widget `@n8n/chat` embebido en `ChatBot.tsx`.
- **Backend**: Flujo de trabajo n8n ejecutándose en un contenedor Docker.
- **Comunicación**: Webhooks vía proxy (`/webhook/...`).

### Integración Frontend (`ChatBot.tsx`)
- **Inicialización**: Usa `createChat` de `@n8n/chat`.
- **Inyección de Contexto**: Pasa metadatos de usuario al webhook:
    - `userEmail`
    - `userName`
    - `isAuthenticated`
    - `userToken`
- **Estilos**: Inyecta variables CSS personalizadas para coincidir con la marca TMM (Rosa/Verde/Amarillo).
- **Lanzador Personalizado**: Oculta el lanzador por defecto de n8n y usa un botón React personalizado con el avatar de "Carito".

### Capacidades (Flujo n8n)
El flujo de trabajo n8n (externo al código de este repo, pero consumido aquí) está diseñado para:
1.  Responder Preguntas Frecuentes usando RAG (Generación Aumentada por Recuperación).
2.  Verificar disponibilidad de talleres (Consultas a base de datos).
3.  Asistir con problemas de inscripción.

## 6.2 Servicios de Email (`email_utils.py`)

El backend usa `send_mail` de Django para manejar correos transaccionales.

### Configuración
- **Proveedor**: SMTP (Gmail por defecto en dev).
- **Ajustes**: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`.

### Tipos de Email

| Función | Disparador | Descripción |
| :--- | :--- | :--- |
| `send_welcome_email` | Registro | Mensaje de bienvenida con enlace al perfil. |
| `send_enrollment_confirmation` | Inscripción | Confirma cupo/acceso. Detalles: Fecha, Hora, Enlace. |
| `send_receipt_received_email` | Subida de Pago | Acusa recibo de subida de comprobante. |
| `send_receipt_accepted_email` | Aprobación Admin | Confirma aprobación de pago y concesión de acceso. |
| `send_receipt_rejected_email` | Rechazo Admin | Notifica rechazo con razón. |
| `send_new_workshop_notification` | Nuevo Taller | Notifica a usuarios con intereses coincidentes. |
| `send_workshop_cancellation` | Eliminar Taller | Notifica cancelación a usuarios inscritos. |

### Logging (`EmailLog`)
Todos los correos enviados se registran en la base de datos (modelo `EmailLog`) con su estado (SUCCESS/FAIL) y contenido para propósitos de auditoría.

---

# 7. Flujos Críticos

Este apartado describe la lógica paso a paso de los procesos más críticos del sistema.

## 7.1 Flujo de Inscripción y Checkout

Este proceso maneja cómo un usuario compra un taller o curso.

1.  **Selección**:
    - Usuario añade ítems al carrito (`CartContext`).
    - Usuario hace clic en "Checkout".

2.  **Creación de Orden (`POST /api/checkout/`)**:
    - **Entrada**: Lista de ítems `{ type, id, quantity }`.
    - **Validación**:
        - Verifica stock para productos físicos.
        - Verifica `cupos_disponibles` para talleres.
    - **Ejecución (Transacción Atómica)**:
        - Crea `Orden` en estado `PENDIENTE`.
        - Crea registros `Enrollment`.
        - **Bloquea** filas de taller y decrementa cupos.
        - **Bloquea** filas de producto y decrementa stock.
    - **Salida**: Retorna `orden_id`.

3.  **Subida de Pago**:
    - Usuario transfiere dinero vía banco.
    - Usuario sube captura de pantalla vía `PaymentModal`.
    - **Petición**: `POST /api/admin/transacciones/` con `orden_id` e imagen.
    - **Acción del Sistema**:
        - Guarda `Transaccion` como `PENDIENTE`.
        - Envía correo "Comprobante Recibido".

4.  **Verificación (Admin)**:
    - Admin ve transacción en `PaymentVerifier`.
    - Admin hace clic en "Aprobar".
    - **Acción del Sistema**:
        - Establece Transacción a `APROBADO`.
        - Llama a `orden.actualizar_estado_pago()`.
        - Si está totalmente pagado, establece Orden e Inscripciones a `PAGADO`.
        - Envía correo "Pago Aceptado".

## 7.2 Flujo de Cancelación de Taller

Qué sucede cuando un Admin elimina un taller o cancela un cupo.

### Eliminando un Taller
1.  **Disparador**: Admin elimina `Taller` vía API/Panel Admin.
2.  **Pre-chequeo**:
    - Encuentra todos los `Enrollment`s activos (PAGADO/PENDIENTE).
3.  **Notificación**:
    - Itera a través de clientes inscritos.
    - Envía correo `send_workshop_cancellation` a cada uno.
4.  **Eliminación**:
    - Elimina el registro (Eliminación en cascada de inscripciones).

### Cancelando una Inscripción Individual (Usuario/Admin)
1.  **Disparador**: `DELETE /api/enrollments/{id}/` o cambio de Estado a `ANULADO`.
2.  **Ejecución**:
    - **Restaura Cupo**: Incrementa `cupos_disponibles` en el `Taller`.
    - Envía correo `send_spot_cancellation`.

## 7.3 Flujo de Notificación de Lista de Espera (Planificado)

1.  **Disparador**: Un cupo se libera en un taller lleno (vía cancelación).
2.  **Lógica**:
    - Verifica `ListaEspera` para el taller (ordenado por fecha).
    - Escoge al primer usuario.
    - Envía correo `send_waitlist_notification`.
    - (Opcional) Reserva el cupo temporalmente (Aún no implementado).
