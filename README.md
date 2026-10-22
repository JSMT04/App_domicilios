# RapiPedido 🛵

> Plataforma de domicilios con arquitectura de **Monolito Modular + Tiempo Real basado en eventos**.

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Backend | NestJS + TypeScript |
| ORM | Prisma |
| Base de Datos | PostgreSQL 16 |
| Cache / Broker | Redis 7 |
| Tiempo Real | Socket.IO (WebSockets) |
| Frontend Panel | Next.js + TailwindCSS v4 |
| Contenedores | Docker / Docker Compose |

## Estructura de Módulos

```
backend/src/modules/
├── auth/        # JWT, roles (Cliente, Restaurante, Repartidor, Admin)
├── catalog/     # Restaurantes, categorías, menú
├── orders/      # Carrito, pedidos, máquina de estados, pagos
├── tracking/    # WebSockets GPS tiempo real
└── ratings/     # Sistema de calificaciones
```

## Inicio Rápido

### 1. Levantar servicios de infraestructura

```bash
docker-compose up -d
```

### 2. Backend (NestJS)

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run start:dev
```

API disponible en: `http://localhost:3000`  
Swagger UI: `http://localhost:3000/api/docs`

### 3. Frontend (Next.js - Panel Restaurantes)

```bash
cd frontend
npm install
npm run dev
```

Panel disponible en: `http://localhost:3001`

## Variables de Entorno

Copia `backend/.env.example` a `backend/.env` y ajusta los valores:

```env
DATABASE_URL="postgresql://rapipedido:rapipedido_dev@localhost:5432/rapipedido"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="cambia-esta-clave-en-produccion"
JWT_EXPIRATION="24h"
PORT=3000
```

## Arquitectura C4 (Nivel 2 - Contenedores)

```
[Cliente Móvil]  [Repartidor App]  [Panel Web Restaurante]
       ↓                ↓                    ↓
              [API Gateway / Nginx]
               ↓                ↓
    [Core Backend NestJS]  [Real-Time Tracking WS]
           ↓                        ↓
      [PostgreSQL]              [Redis]
```

## Módulo de Pedidos — Máquina de Estados

```
PENDIENTE ──→ PREPARANDO ──→ EN_CAMINO ──→ ENTREGADO
    │               │
    └───────────────┴──→ CANCELADO
```

## Tests

```bash
cd backend
npm run test                        # Todos los tests
npm run test:cov                    # Con cobertura
npm run test -- order-state-machine # Solo state machine
```

## API Documentation

- **Swagger UI**: `http://localhost:3000/api/docs`
- **OpenAPI JSON**: `http://localhost:3000/api/docs-json`

## Historia de Usuario HU-02 — Creación de Pedido

`POST /orders`

```json
{
  "restaurantId": "uuid-del-restaurante",
  "deliveryAddress": "Calle 123 #45-67",
  "deliveryLat": 10.9878,
  "deliveryLng": -74.7889,
  "items": [
    { "menuItemId": "uuid-del-item", "quantity": 2, "notes": "Sin cebolla" }
  ],
  "paymentMethod": "MOCK_CARD"
}
```

## Licencia

MIT
