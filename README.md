# RapiPedido 🛵

> Plataforma integral de pedidos y domicilios construida bajo una arquitectura de **Monolito Modular + Tiempo Real basado en eventos**, diseñada para conectar Restaurantes, Repartidores y Clientes con telemetría GPS y sincronización instantánea.

---

## 🚀 Actualizaciones Recientes del Producto

- **🎨 Nueva Colorimetría Food Delivery SaaS**: Rediseño visual enfocado en legibilidad profesional y alto contraste (paleta en grises pizarra `#0f172a`, `#1e293b`, tipografía en blanco puro `#ffffff`, naranja delivery vibrante `#f97316` y azul corporativo `#0284c7`).
- **🍔 Módulo de Pedidos en Línea para Clientes**: Flujo completo de exploración de restaurantes, catálogo interactivo con fotos, selector de categorías, carrito dinámico con cálculo de envíos y creación de órdenes reales en base de datos.
- **🏪 Pestaña de Personalización Multi-Restaurante**: Sección dedicada en el panel para que cada empresa administre sus datos comerciales (nombre, logo/banner, dirección física, horarios y coordenadas GPS).
- **🛰️ Telemetría GPS en Tiempo Real**: Panel de repartidor con simulación de coordenadas transmitidas mediante WebSockets (Socket.IO) con ingesta respaldada en memoria con Redis.
- **⚡ Cuentas de Acceso Rápido y Datos de Prueba (Seed)**: Base de datos pre-cargada con restaurante ("Burguer Bros 🍔"), categorías, productos reales y órdenes en todos los estados del ciclo de vida.

---

## 👥 Experiencia y Funcionamiento por Roles

El sistema detecta automáticamente el rol del usuario autenticado (`JWT`) y adapta tanto la barra de navegación como las vistas y capacidades del panel:

### 1. 🍽️ Rol Restaurante
- **Dashboard Operativo**: Resumen en tiempo real de pedidos entrantes, órdenes en preparación en cocina, pedidos despachados y total de ingresos facturados en COP.
- **Gestión de Menú (`/dashboard/menu`)**: Creación y organización de categorías (Hamburguesas, Bebidas, Acompañamientos), administración de platos con precios, fotos, descripciones y activación/desactivación de disponibilidad instantánea.
- **Personalización de Empresa (`/dashboard/restaurant`)**: Edición de la identidad del restaurante, horarios de apertura y cierre, dirección de despacho y coordenadas para cálculo de rutas.
- **Control de Pedidos (`/dashboard/orders`)**: Avance paso a paso del estado de cada orden según la máquina de estados (`PENDIENTE` ➔ `PREPARANDO` ➔ `EN_CAMINO`).

### 2. 🛵 Rol Repartidor
- **Panel de Reparto**: Visualización de pedidos activos asignados para entrega y métricas de entregas completadas con cálculo de ganancias acumuladas por tarifas de domicilio ($5.000 COP por entrega).
- **Telemetría GPS en Vivo (`ws://localhost:3000/tracking`)**: Transmisión periódica de latitud y longitud hacia el Gateway WebSocket, permitiendo que el cliente y el restaurante conozcan la ubicación del repartidor en ruta.
- **Despacho y Entrega**: Información de la dirección física del restaurante para recogida y dirección exacta del cliente para entrega.

### 3. 👤 Rol Cliente
- **Portal de Pedidos en Línea (`/dashboard/order`)**:
  - Exploración de todos los restaurantes disponibles en la plataforma.
  - Navegación por menú y categorías con fotografías y precios.
  - Carrito de compras con control de cantidades, notas para el restaurante (*ej: "Sin cebolla"*), selección de método de pago (Efectivo, Tarjeta, Nequi) y costo de entrega.
  - Confirmación inmediata con llamada al endpoint `POST /api/v1/orders`.
- **Rastreo en Vivo (`/dashboard`)**:
  - Stepper visual del estado del pedido en tiempo real:
    $$\text{1. Recibido} \longrightarrow \text{2. En Cocina} \longrightarrow \text{3. En Camino} \longrightarrow \text{4. Entregado}$$
  - Historial completo de compras pasadas y detalle de cada pedido.

---

## 🏪 Arquitectura Multi-Restaurante: ¿Cómo funciona?

El sistema está diseñado de forma relacional como **Multi-Tenant**:
1. **Vinculación 1 a 1**: Cada usuario registrado con el rol `RESTAURANTE` es propietario (`ownerId`) de su registro en la tabla `restaurants`.
2. **Alta y Edición**: Al ingresar a la pestaña **"Mi Restaurante"**, cualquier empresa puede dar de alta su local o actualizar su información.
3. **Disponibilidad para Clientes**: El endpoint de catálogo `GET /api/v1/restaurants` filtra todos los locales con `isActive: true`. Tan pronto una nueva empresa se registra, aparece automáticamente en el catálogo de restaurantes para que los clientes puedan pedir de su menú.
4. **Disponibilidad para Repartidores**: Cuando una orden se crea en cualquier restaurante, queda asociada a su ID. El repartidor recibe la dirección física del local correspondiente para retirar el pedido y la dirección del cliente para entregarlo.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
|---|---|---|
| **Backend** | NestJS 10 + TypeScript | Arquitectura modular monolítica, inyección de dependencias y controladores REST |
| **ORM** | Prisma 5 | Modelado de datos, migraciones y tipado estricto con PostgreSQL |
| **Base de Datos** | PostgreSQL 16 (Docker) | Persistencia relacional de usuarios, restaurantes, menús y pedidos |
| **Cache & Eventos** | Redis 7 (Docker) | Almacenamiento volátil de coordenadas GPS y pub/sub para WebSockets |
| **Tiempo Real** | Socket.IO (WebSockets) | Gateway de tracking de domiciliarios y telemetría |
| **Frontend** | Next.js 14 + React 18 | App Router, Server/Client Components y llamadas a API |
| **Estilos** | CSS / TailwindCSS v4 | Sistema de diseño de alto contraste, tokens nativos en `:root` |
| **Autenticación** | Passport JWT + bcryptjs | Tokens Bearer con control de acceso basado en roles (`RolesGuard`) |
| **Documentación** | Swagger / OpenAPI 3 | Interfaz interactiva de pruebas de la API |

---

## 📦 Estructura del Proyecto

```
App_domicilios/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Modelos (User, Restaurant, MenuItem, Order, Delivery, Rating)
│   │   ├── migrations/         # Historial de migraciones SQL
│   │   └── seed.ts             # Datos de prueba para todos los roles y estados
│   ├── src/
│   │   ├── common/             # PrismaService, RedisService, filtros CORS e interceptores
│   │   └── modules/
│   │       ├── auth/           # Login, registro y emisión de JWT
│   │       ├── catalog/        # Restaurantes, categorías y productos de menú
│   │       ├── orders/         # Máquina de estados, creación de ordenes (HU-02) y pagos
│   │       ├── tracking/       # WebSocket Gateway para telemetría GPS
│   │       └── ratings/        # Calificaciones de 1 a 5 estrellas
│   └── test/                   # Pruebas unitarias de la máquina de estados
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── menu/       # Gestión de platos y categorías para restaurantes
│   │   │   │   ├── order/      # Carrito y realización de pedidos para clientes
│   │   │   │   ├── orders/     # Gestión de despachos y transiciones de estado
│   │   │   │   ├── restaurant/ # Personalización comercial de la empresa
│   │   │   │   ├── layout.tsx  # Barra lateral dinámica según el rol autenticado
│   │   │   │   └── page.tsx    # Dashboard especializado (Restaurante, Repartidor, Cliente)
│   │   │   ├── globals.css     # Paleta corporativa (Slate, Naranja, Azul, Blanco)
│   │   │   └── page.tsx        # Pantalla de Login con selector de cuentas de prueba
│   │   └── lib/api.ts          # Cliente HTTP unificado con manejo de tokens y errores
└── docker-compose.yml          # PostgreSQL 16 + Redis 7
```

---

## ⚡ Inicio Rápido

### 1. Iniciar Contenedores de Base de Datos y Redis

```bash
docker compose up -d
```

### 2. Configurar y Levantar el Backend (NestJS)

```bash
cd backend
# Asegúrate de tener tu archivo .env (puedes basarte en .env.example)
npm install
npx prisma migrate dev --name init
npx prisma db seed             # Carga los datos de prueba y roles
npm run start:dev
```

- **API REST**: `http://localhost:3000/api/v1`
- **Swagger UI**: `http://localhost:3000/api/docs`
- **WebSocket Gateway**: `ws://localhost:3000/tracking`

### 3. Configurar y Levantar el Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

- **Panel Web**: `http://localhost:3001`

---

## 🔑 Credenciales de Acceso de Prueba

Todas las cuentas vienen pre-configuradas con la contraseña: **`rapipedido123`**:

| Rol | Correo Electrónico | Descripción en la App |
|---|---|---|
| **🍽️ Restaurante** | `restaurante@demo.com` | Dueño de "Burguer Bros 🍔", control de cocina y menú |
| **🛵 Repartidor** | `repartidor@demo.com` | Domiciliario "Andrés Moto" con órdenes en ruta y GPS |
| **👤 Cliente 1** | `cliente@demo.com` | Cliente "Laura Pérez" con pedidos activos para rastreo |
| **👤 Cliente 2** | `cliente2@demo.com` | Cliente "Mario Salinas" con pedidos entregados y calificados |
| **🛡️ Admin** | `admin@rapipedido.com` | Acceso global a todas las órdenes y reportes del sistema |

*(En la pantalla de login puedes hacer clic directamente en cualquiera de los botones de **"Cuentas de prueba"** para ingresar sin digitar datos).*

---

## 🔄 Máquina de Estados del Pedido

```
  [PENDIENTE] ──(Confirmar)──→ [PREPARANDO] ──(Despachar)──→ [EN_CAMINO] ──(Entregar)──→ [ENTREGADO]
       │                            │
       └───(Cancelar Pedido)────────┴───────────────────────→ [CANCELADO]
```

- Solo se permiten transiciones válidas controladas por roles.
- Las transiciones son validadas por `OrdersService` y cubiertas por tests unitarios en `test/order-state-machine.spec.ts`.

---

## 🧪 Ejecución de Pruebas

```bash
cd backend
npm run test                        # Todos los tests unitarios
npm run test:cov                    # Con reporte de cobertura
npm run test -- order-state-machine # Pruebas exclusivas de la máquina de estados
```

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
