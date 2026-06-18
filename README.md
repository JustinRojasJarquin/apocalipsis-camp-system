# Apocalipsis Camp System

Sistema de gestión para campamentos en entornos post-apocalípticos. Permite administrar campamentos, personas, inventario, exploraciones, evaluaciones de ingreso con IA, roles, usuarios y más.

---

## Requisitos

| Herramienta | Versión Mínima |
|-------------|----------------|
| Node.js | 18.x |
| npm | 9.x |
| MySQL | 8.x |
| Git | Cualquier versión moderna |

---

## Estructura del Proyecto

```
apocalipsis-camp-system/
├── backend/                   # API REST (Node.js + Express + TypeScript)
│   ├── prisma/
│   │   └── schema.prisma      # Modelo de datos (Prisma ORM)
│   └── src/
│       ├── server.ts          # Punto de entrada
│       ├── app.ts             # Configuración Express (rutas, middleware)
│       ├── config/
│       │   └── prisma.ts      # Cliente Prisma
│       ├── middlewares/
│       │   ├── auth.middleware.ts    # Verificación JWT
│       │   └── error.middleware.ts   # Manejo global de errores
│       └── modules/
│           ├── auth/                  # Autenticación (login, JWT)
│           ├── personas/              # CRUD personas + asignación IA cargo
│           ├── campamentos/           # CRUD campamentos
│           ├── evaluacion_ingreso/    # Evaluaciones de ingreso con IA
│           ├── exploraciones/         # Exploraciones (misiones)
│           ├── inventario/            # Inventario de recursos por campamento
│           ├── recursos/              # Catálogo de recursos
│           ├── usuarios/              # Usuarios del sistema
│           ├── roles/                 # Roles del sistema
│           ├── envios/                # Envíos entre campamentos
│           ├── solicitudes/           # Solicitudes de recursos
│           ├── cargos/                # Cargos de personas
│           ├── estados-persona/       # Estados físicos
│           ├── estado_persona/        # OpenRouter (IA) + estados físicos
│           └── bitacora/              # Bitácora de acciones
│
└── frontend/                  # SPA (React + TypeScript + Vite)
    └── src/
        ├── app/
        │   ├── App.tsx                # Layout raíz
        │   ├── router.tsx             # Definición de rutas con guards
        │   └── guards/
        │       ├── ProtectedRoute.tsx  # Requiere autenticación
        │       ├── PublicRoute.tsx     # Solo usuarios no autenticados
        │       └── RoleRoute.tsx       # Requiere rol específico
        ├── pages/
        │   ├── DashboardPage.tsx       # Panel principal
        │   └── AccesoSistemaPage.tsx   # Gestión unificada del sistema
        ├── shared/
        │   ├── components/
        │   │   ├── Navbar.tsx          # Barra de navegación superior
        │   │   ├── Sidebar.tsx         # Barra lateral
        │   │   ├── PageModal.tsx       # Modal reutilizable
        │   │   └── CrudActions.tsx     # Acciones CRUD reutilizables
        │   ├── hooks/
        │   │   ├── useAuth.ts          # Autenticación (contexto)
        │   │   └── useInactivityTimer.ts  # Contador de sesión
        │   └── utils/
        │       └── storage.ts          # localStorage wrapper
        ├── features/                   # Módulos funcionales
        │   ├── auth/                   # Login
        │   ├── personas/               # CRUD + IA cargo
        │   ├── campamentos/            # Campamentos
        │   ├── evaluaciones/           # Evaluaciones de ingreso
        │   ├── exploraciones/          # Exploraciones
        │   ├── inventario/             # Inventario
        │   ├── recursos/               # Catálogo de recursos
        │   ├── roles/                  # Roles del sistema
        │   ├── usuarios/               # Usuarios del sistema
        │   ├── solicitudes/            # Solicitudes
        │   └── envios/                 # Envíos
        └── styles/
            ├── global.css              # Estilos globales
            ├── professional.css        # Estilos profesionales
            └── modules.css             # Estilos de módulos
```

---

## Configuración Inicial

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd apocalipsis-camp-system
```

### 2. Backend

```bash
cd backend
cp .env.example .env      # Crear archivo de variables de entorno
npm install               # Instalar dependencias
npx prisma generate       # Generar cliente Prisma
```

**Variables de entorno (`.env`):**

```env
# Base de datos
DATABASE_URL="mysql://usuario:password@localhost:3306/apocalipsis_camp"

# Puerto del servidor
PORT=4000

# JWT (para autenticación)
JWT_SECRET="tu-secreto-jwt-aqui"
JWT_EXPIRATION_SECONDS=1200

# OpenRouter (para funciones de IA)
OPENROUTER_API_KEY="sk-or-v1-..."
OPENROUTER_MODEL="gpt-4o-mini"
```

**Base de datos:**

```bash
npx prisma db push        # Crear tablas en MySQL
```

**Ejecutar backend:**

```bash
npm run dev               # Modo desarrollo (ts-node-dev, hot-reload en localhost:4000)
```

### 3. Frontend

```bash
cd frontend
npm install               # Instalar dependencias
```

**Ejecutar frontend:**

```bash
npm run dev               # Modo desarrollo (Vite, hot-reload en localhost:5173)
```

---

## Flujo de Inicio de Sesión

```
LoginPage.tsx
    ↓
POST /api/auth/login  →  Backend valida credenciales contra BD
    ↓
Devuelve { token, usuario: { id, rol, persona } }
    ↓
storage.ts guarda token + usuario en localStorage
    ↓
ProtectedRoute verifica token antes de renderizar
    ↓
Navbar muestra datos del usuario + contador de sesión
```

- **Duración de sesión:** 20 minutos (configurable via `JWT_EXPIRATION_SECONDS`)
- **Cierre automático:** El `useInactivityTimer` hook decrementa un contador cada segundo y se resetea con actividad del usuario (mouse, teclado, scroll). Al llegar a 0, cierra sesión automáticamente.
- **Roles:** Cada ruta define roles permitidos. `RoleRoute` bloquea acceso si el usuario no tiene el rol adecuado.

---

## Gestión de Usuarios y Roles

| Entidad | Archivo Backend | Archivo Frontend |
|---------|-----------------|------------------|
| Roles | `modules/roles/` | `features/roles/roles.api.ts` |
| Usuarios | `modules/usuarios/` | `features/usuarios/usuarios.api.ts` |

**Roles predefinidos:**
- `ADMIN` / `ADMINISTRADOR` — Acceso total
- `VIAJES` / `ENCARGADO_VIAJES` — Personas, evaluaciones, exploraciones
- `GESTOR_RECURSOS` — Inventario, recursos
- `TRABAJADOR` — Inventario, recursos

---

## Asignación de Cargo por IA

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/personas/recomendar-cargo-ia` | Recomienda cargo (sin persona creada) |
| `POST` | `/api/personas/:id/asignar-cargo-ia` | Recomienda y asigna cargo (persona existente) |

### Flujo (persona nueva)

1. Usuario llena el formulario en `PersonaForm.tsx`
2. Presiona **"Asignar cargo con IA"**
3. Frontend envía: `{ persona: "Juan Pérez", campamento: "Campamento Norte" }`
4. Backend llama a **OpenRouter** con prompt estructurado pidiendo JSON:
   ```json
   { "recommendedCargoId": 3, "recommendedCargoName": "Explorador", "reason": "..." }
   ```
5. Frontend auto-completa el campo "Cargo" con la recomendación
6. Usuario presiona **"Crear"** → `createPersona()` (solo base de datos, sin IA)

### Archivos clave

- **Backend:**
  - `backend/src/modules/personas/personas.service.ts` → `recomendarCargoIA()`, `assignCargoByIA()`
  - `backend/src/modules/estado_persona/openrouter.service.ts` → Cliente OpenAI/OpenRouter
  - `backend/src/modules/personas/personas.routes.ts` → Rutas
- **Frontend:**
  - `frontend/src/features/personas/personas.api.ts` → Llamadas API
  - `frontend/src/features/personas/components/PersonaForm.tsx` → Formulario con botón IA
  - `frontend/src/features/personas/types.ts` → Tipos

---

## Evaluación de Ingreso con IA

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/evaluaciones-ingreso` | Crear evaluación (dispara recomendación IA) |
| `PUT` | `/api/evaluaciones-ingreso/:id/decision` | Aceptar o rechazar |

### Flujo

1. En el detalle del campamento, pestaña **"Evaluaciones"**, presionar **"+ Nueva"**
2. Seleccionar una persona y crear la evaluación
3. El backend llama a OpenRouter para generar recomendación (`ACEPTAR` / `RECHAZAR` + motivo)
4. La evaluación queda con estado `Pendiente` y la recomendación IA visible
5. El administrador revisa y decide: **"Aceptar"** o **"Rechazar"**
6. Opcionalmente puede agregar comentarios antes de decidir

### Archivos clave

- **Backend:**
  - `backend/src/modules/evaluacion_ingreso/` → CRUD evaluaciones
  - `backend/src/modules/estado_persona/openrouter.service.ts` → `generarEvaluacionIA()`
- **Frontend:**
  - `frontend/src/features/evaluaciones/` → Módulo completo
  - `frontend/src/pages/AccesoSistemaPage.tsx` → Panel de evaluaciones (tab)

---

## Arquitectura de la Base de Datos

La base de datos se define en `backend/prisma/schema.prisma` usando MySQL con Prisma ORM. Modelos principales:

- `campamento` — Campamentos
- `persona` — Personas registradas
- `cargo` — Cargos disponibles
- `estado_persona` — Estados físicos
- `asignacion_cargo` — Historial de asignaciones de cargo
- `asignacion_cargo_ia` — Registro de asignaciones hechas por IA
- `exploracion` — Misiones de exploración
- `exploracion_persona` — Personas asignadas a exploraciones
- `exploracion_recurso_llevado` — Recursos llevados a exploraciones
- `exploracion_recurso_encontrado` — Recursos encontrados en exploraciones
- `evaluacion_ingreso` — Evaluaciones de ingreso
- `inventario` — Inventario por campamento
- `recurso` — Catálogo de recursos
- `usuario` — Usuarios del sistema
- `rol` — Roles del sistema
- `bitacora` — Bitácora de acciones
- `envio` — Envíos entre campamentos
- `solicitud_recurso` — Solicitudes de recursos

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19 + TypeScript + Vite 8 |
| | React Router v7 |
| | Tailwind CSS 4 |
| | Lucide React (iconos) |
| **Backend** | Node.js + Express 5 + TypeScript |
| | Prisma ORM 7 |
| | MySQL 2 |
| **Autenticación** | JWT (jsonwebtoken) + bcrypt |
| **IA** | OpenRouter API (OpenAI GPT-4o-mini) |
| **Base de datos** | MySQL 8 |

---

## Scripts Disponibles

### Backend (`cd backend`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor en modo desarrollo (hot-reload, puerto 4000) |
| `npm run build` | Compila TypeScript a JavaScript (`dist/`) |
| `npm start` | Ejecuta versión compilada (`node dist/server.js`) |
| `npx prisma generate` | Genera cliente Prisma después de cambios en schema |
| `npx prisma db push` | Sincroniza schema con la base de datos |
| `npx prisma studio` | Abre interfaz gráfica de base de datos |

### Frontend (`cd frontend`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo Vite (puerto 5173) |
| `npm run build` | Compila para producción |
| `npm run preview` | Previsualiza build de producción |
| `npm run lint` | Ejecuta ESLint |

---

## API Endpoints

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Iniciar sesión |

### Campamentos
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/campamentos` | Listar campamentos |
| `GET` | `/api/campamentos/:id` | Obtener campamento |
| `POST` | `/api/campamentos` | Crear campamento |
| `PUT` | `/api/campamentos/:id` | Actualizar campamento |
| `DELETE` | `/api/campamentos/:id` | Desactivar campamento |

### Personas
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/personas` | Listar personas |
| `GET` | `/api/personas/:id` | Obtener persona |
| `POST` | `/api/personas` | Crear persona |
| `PUT` | `/api/personas/:id` | Actualizar persona |
| `DELETE` | `/api/personas/:id` | Desactivar persona |
| `POST` | `/api/personas/recomendar-cargo-ia` | Recomendar cargo por IA |
| `POST` | `/api/personas/:id/asignar-cargo-ia` | Asignar cargo por IA |

### Exploraciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/exploraciones` | Listar exploraciones |
| `POST` | `/api/exploraciones` | Crear exploración |
| `PUT` | `/api/exploraciones/:id/estado` | Cambiar estado |
| `DELETE` | `/api/exploraciones/:id` | Eliminar exploración |

### Evaluaciones de Ingreso
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/evaluaciones-ingreso` | Listar evaluaciones |
| `POST` | `/api/evaluaciones-ingreso` | Crear evaluación (con IA) |
| `PUT` | `/api/evaluaciones-ingreso/:id/decision` | Decidir (aceptar/rechazar) |

### Usuarios y Roles
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/usuarios` | Listar usuarios |
| `POST` | `/api/usuarios` | Crear usuario |
| `PUT` | `/api/usuarios/:id/estado` | Activar/desactivar usuario |
| `PUT` | `/api/usuarios/:id/password` | Resetear contraseña |
| `GET` | `/api/roles` | Listar roles |

---

## Funcionalidades Principales

### 🔐 Autenticación con JWT
- Login seguro con bcrypt + JWT
- Sesión con expiración de 20 minutos
- Cierre automático por inactividad
- Roles y permisos por ruta

### 🤖 Asignación de Cargo por IA
- Recomendación inteligente basada en nombre, estado, cargo actual y campamento
- Sin bloqueo de transacciones (la IA se ejecuta fuera de transacciones de base de datos)
- Botón dedicado en el formulario de personas

### 📋 Evaluaciones de Ingreso con IA
- Generación automática de recomendaciones (ACEPTAR/RECHAZAR + motivo)
- Panel de revisión con comentarios del administrador
- Decisión final registrada

### 🏕️ Gestión de Campamentos
- CRUD completo con estado activo/inactivo
- Vista de detalle con personas, inventario, exploraciones
- Envíos y solicitudes entre campamentos

### 🔍 Exploraciones (Misiones)
- Creación de misiones con planificación
- Asignación de personas con roles (Explorador/Líder)
- Recursos a llevar y recursos encontrados
- Ciclo de vida: Planificada → En Progreso → Completada/Fallida/Cancelada

### 📦 Inventario
- Gestión de recursos por campamento
- Umbral mínimo con alerta de estado crítico
- Histórico de cantidades