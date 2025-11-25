# Documentación del Proyecto TMM v2

## 1. Visión General
**TMM v2** es una plataforma web integral para la gestión y venta de cursos y talleres, diseñada con una arquitectura moderna y escalable. El sistema permite a los usuarios registrarse, inscribirse en cursos, acceder a contenido educativo y leer un blog. Para los administradores, ofrece un panel de control completo para gestionar usuarios, contenido y ventas.

### Stack Tecnológico
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4.
- **Backend**: Django 5.2.8, Django REST Framework (DRF).
- **Base de Datos**:
  - **PostgreSQL**: Base de datos principal relacional (Usuarios, Cursos, Inscripciones).
  - **MongoDB**: Base de datos NoSQL para datos flexibles (CRM Multimedia).
- **Automatización**: n8n (Chatbot y flujos de trabajo).
- **Infraestructura**: Docker & Docker Compose.

---

## 2. Arquitectura del Sistema

El proyecto utiliza una arquitectura de microservicios contenerizada orquestada por Docker Compose.

### Diagrama de Componentes
```mermaid
graph TD
    Client[Cliente Web (Browser)] -->|HTTP/80| Frontend[Frontend (React/Vite)]
    Frontend -->|API REST / JSON| Backend[Backend (Django)]
    Frontend -->|Chat Widget| n8n[n8n (Automation)]
    Backend -->|SQL| DB[(PostgreSQL)]
    Backend -->|NoSQL| Mongo[(MongoDB)]
    n8n -->|Webhooks| Backend
```

### Servicios (Docker Compose)
| Servicio | Puerto Interno | Puerto Externo | Descripción |
|----------|----------------|----------------|-------------|
| `backend`| 8000 | 8000 | API Server (Django) |
| `frontend`| 5173 | 5173 | Servidor de desarrollo (Vite) |
| `db` | 5432 | - | PostgreSQL Database |
| `mongo` | 27017 | 27017 | MongoDB Database |
| `n8n` | 5678 | 5678 | Workflow Automation |

---

## 3. Guía de Instalación y Despliegue

### Prerrequisitos
- Docker y Docker Compose instalados.
- Git.

### Configuración Inicial
1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repo>
   cd "TMM v2"
   ```

2. **Variables de Entorno**:
   Asegúrate de tener un archivo `.env` en la raíz del proyecto (y en `backend/.env` si es necesario) con las siguientes variables clave:
   ```env
   # DB Config
   POSTGRES_DB=postgres
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   
   # Mongo Config
   MONGO_INITDB_ROOT_USERNAME=root
   MONGO_INITDB_ROOT_PASSWORD=example
   
   # Django Config
   SECRET_KEY=your_secret_key
   DEBUG=True
   ALLOWED_HOSTS=*
   ```

### Ejecución
Para levantar todo el entorno de desarrollo:

```bash
docker-compose up --build
```

- El **Frontend** estará disponible en: `http://localhost:5173`
- El **Backend API** estará disponible en: `http://localhost:8000`
- **n8n** estará disponible en: `http://localhost:5678`

### Comandos Útiles
- **Crear superusuario Django**:
  ```bash
  docker-compose exec backend python manage.py createsuperuser
  ```
- **Aplicar migraciones**:
  ```bash
  docker-compose exec backend python manage.py migrate
  ```
- **Ver logs**:
  ```bash
  docker-compose logs -f
  ```

---

## 4. Documentación del Backend (Django)

El backend está estructurado en varias aplicaciones Django para modularidad.

### Estructura de Directorios (`backend/`)
- `backend_project/`: Configuración principal (`settings.py`, `urls.py`).
- `api/`: Lógica general de la API y endpoints base.
- `blog/`: Gestión de posts y categorías del blog.
- `cursos/`: Gestión de cursos, lecciones y módulos.
- `talleres/`: Gestión de talleres (workshops).
- `media/`: Archivos subidos por usuarios (imágenes, documentos).

### Autenticación
Se utiliza **JWT (JSON Web Tokens)** a través de `djangorestframework-simplejwt`.
- Endpoint Login: `/api/token/`
- Endpoint Refresh: `/api/token/refresh/`

### Base de Datos
- **PostgreSQL**: Configurada como `default` en `settings.py`. Maneja la mayoría de los modelos de Django.
- **MongoDB**: Configurada mediante `pymongo` y `django-environ`. Se utiliza para datos específicos del CRM o logs extensos.

---

## 5. Documentación del Frontend (React)

El frontend es una SPA (Single Page Application) construida con React y Vite.

### Estructura de Directorios (`frontend/src/`)
- `components/`: Componentes reutilizables (Botones, Layouts, ChatBot).
- `pages/`: Vistas principales (Home, Login, Dashboard, Cursos).
- `context/`: Estado global (principalmente `AuthContext` para manejo de sesión).
- `layouts/`: Plantillas de diseño (`AdminLayout`, `Layout` público).

### Routing
Utiliza `react-router-dom` v7.
- **Rutas Públicas**: `/`, `/login`, `/register`, `/blog`.
- **Rutas Protegidas**: `/profile`, `/courses/:id/view`. Requieren estar logueado.
- **Rutas de Admin**: `/admin/*`. Requieren rol de superusuario (`isAdmin`).

### Integraciones Clave
- **ChatBot**: Integrado en `components/ChatBot.tsx`. Se comunica con el webhook de n8n para procesar mensajes.
- **API Client**: Se utiliza `axios` (o fetch) para comunicar con el backend Django. Es importante manejar los tokens JWT en los headers de autorización.

---

## 6. Notas Adicionales
- **Estilos**: Se utiliza Tailwind CSS v4 para el estilizado rápido y responsivo.
- **Linting**: Configurado con ESLint para mantener la calidad del código.
