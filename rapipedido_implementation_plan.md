# RapiPedido — Implementation Plan

## Goal Description

Build the foundational architecture for **RapiPedido**, a food delivery platform, using a **Modular Monolith + Real-Time Event-Driven** architecture. This phase delivers:

1. **Core Backend** — NestJS modular monolith with PostgreSQL (Prisma ORM) and Redis
2. **Real-Time Tracking** — WebSocket service for GPS coordinate ingestion every 5s
3. **Restaurant Panel** — Next.js scaffold with TailwindCSS v4
4. **Tests + API Docs** — Unit tests for the order state machine + OpenAPI/Swagger spec
5. **Git push** to `https://github.com/JSMT04/App_domicilios.git`

---

## User Review Required

> [!IMPORTANT]
> **Database**: This plan assumes a local PostgreSQL instance is accessible at `localhost:5432`. If you use a different host/port or a cloud-hosted DB, update the `.env` file before running migrations.

> [!IMPORTANT]
> **Redis**: Required for real-time tracking pub/sub. Plan assumes `localhost:6379`. Docker commands are provided if you need to spin them up.

> [!WARNING]
> **Git Force Push**: The final step uses `git push --force` to `main`. This will overwrite any existing remote history. Confirm this is acceptable.

> [!CAUTION]
> **Payment Gateway**: This phase implements a **mock payment service** only. No real payment processor (Stripe/PayU/MercadoPago) is integrated — the mock simulates success/failure responses.

---

## Open Questions

All major questions were resolved in the clarification step:

| Decision | Choice |
|---|---|
| Backend Framework | **NestJS** |
| ORM | **Prisma** |
| TailwindCSS Version | **v4** |
| Phase Scope | **Backend + Restaurant Panel scaffold** |

---

## Architecture Overview

```mermaid
graph TB
    subgraph "Monorepo Root"
        direction TB
        subgraph "backend/ (NestJS)"
            direction LR
            AUTH[auth module]
            CAT[catalog module]
            ORD[orders module]
            TRACK[tracking module]
            RAT[ratings module]
            COMMON[common/shared]
        end
        subgraph "frontend/ (Next.js)"
            direction LR
            PAGES[pages/app router]
            COMP[components]
            HOOKS[hooks]
        end
    end
    
    AUTH --> COMMON
    CAT --> COMMON
    ORD --> COMMON
    TRACK --> COMMON
    RAT --> COMMON
```

---

## Proposed Changes

### Phase 1: Project Scaffolding & Root Configuration

#### [NEW] Root project structure

```
App_domicilios/
├── backend/                    # NestJS monolith
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # JWT + roles
│   │   │   ├── catalog/        # Restaurants, menus
│   │   │   ├── orders/         # Cart, orders, state machine, payments
│   │   │   ├── tracking/       # WebSocket GPS tracking
│   │   │   └── ratings/        # Review system
│   │   ├── common/             # Guards, decorators, filters, DTOs
│   │   ├── prisma/             # Prisma schema & migrations
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/                   # Unit & integration tests
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── .env.example
├── frontend/                   # Next.js restaurant panel
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   ├── components/         # Reusable UI components
│   │   └── lib/                # API client, utilities
│   ├── package.json
│   └── tailwind.config.ts
├── docker-compose.yml          # PostgreSQL + Redis for local dev
├── .gitignore
└── README.md
```

---

### Phase 2: Database Schema (Prisma)

#### [NEW] `backend/prisma/schema.prisma`

The complete relational schema covering all domain entities:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  CLIENTE
  RESTAURANTE
  REPARTIDOR
  ADMIN
}

enum OrderStatus {
  PENDIENTE
  PREPARANDO
  EN_CAMINO
  ENTREGADO
  CANCELADO
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

model User {
  id            String       @id @default(uuid())
  email         String       @unique
  passwordHash  String
  name          String
  phone         String?
  role          UserRole
  isActive      Boolean      @default(true)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  // Relations
  restaurant    Restaurant?
  orders        Order[]      @relation("CustomerOrders")
  deliveries    Delivery[]
  ratings       Rating[]

  @@index([role])
  @@index([email])
}

model Restaurant {
  id            String       @id @default(uuid())
  name          String
  description   String?
  address       String
  latitude      Float
  longitude     Float
  phone         String?
  imageUrl      String?
  isActive      Boolean      @default(true)
  openingTime   String?      // "08:00"
  closingTime   String?      // "22:00"
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  // Owner relation
  ownerId       String       @unique
  owner         User         @relation(fields: [ownerId], references: [id])

  // Relations
  categories    Category[]
  orders        Order[]

  @@index([latitude, longitude])
  @@index([isActive])
}

model Category {
  id            String       @id @default(uuid())
  name          String
  description   String?
  sortOrder     Int          @default(0)

  restaurantId  String
  restaurant    Restaurant   @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  menuItems     MenuItem[]

  @@index([restaurantId])
}

model MenuItem {
  id            String       @id @default(uuid())
  name          String
  description   String?
  price         Decimal      @db.Decimal(10, 2)
  imageUrl      String?
  isAvailable   Boolean      @default(true)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  categoryId    String
  category      Category     @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  orderItems    OrderItem[]

  @@index([categoryId])
  @@index([isAvailable])
}

model Order {
  id            String       @id @default(uuid())
  orderNumber   String       @unique @default(cuid())
  status        OrderStatus  @default(PENDIENTE)
  subtotal      Decimal      @db.Decimal(10, 2)
  deliveryFee   Decimal      @db.Decimal(10, 2)  @default(0)
  total         Decimal      @db.Decimal(10, 2)
  deliveryAddress String
  deliveryLat   Float?
  deliveryLng   Float?
  notes         String?
  paymentStatus PaymentStatus @default(PENDING)
  paymentRef    String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  // Relations
  customerId    String
  customer      User         @relation("CustomerOrders", fields: [customerId], references: [id])

  restaurantId  String
  restaurant    Restaurant   @relation(fields: [restaurantId], references: [id])

  items         OrderItem[]
  delivery      Delivery?
  rating        Rating?

  @@index([status])
  @@index([customerId])
  @@index([restaurantId])
  @@index([createdAt])
}

model OrderItem {
  id            String       @id @default(uuid())
  quantity      Int
  unitPrice     Decimal      @db.Decimal(10, 2)
  subtotal      Decimal      @db.Decimal(10, 2)
  notes         String?

  orderId       String
  order         Order        @relation(fields: [orderId], references: [id], onDelete: Cascade)

  menuItemId    String
  menuItem      MenuItem     @relation(fields: [menuItemId], references: [id])

  @@index([orderId])
}

model Delivery {
  id            String       @id @default(uuid())
  currentLat    Float?
  currentLng    Float?
  pickedUpAt    DateTime?
  deliveredAt   DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  orderId       String       @unique
  order         Order        @relation(fields: [orderId], references: [id])

  driverId      String
  driver        User         @relation(fields: [driverId], references: [id])

  @@index([driverId])
  @@index([orderId])
}

model Rating {
  id            String       @id @default(uuid())
  score         Int          // 1-5
  comment       String?
  createdAt     DateTime     @default(now())

  orderId       String       @unique
  order         Order        @relation(fields: [orderId], references: [id])

  userId        String
  user          User         @relation(fields: [userId], references: [id])

  @@index([orderId])
  @@index([userId])
}
```

**Key design decisions:**
- **UUID primary keys** for all entities (no auto-increment leakage)
- **Geographic index** on `(latitude, longitude)` for restaurant proximity queries
- **Composite indexes** on `status`, `customerId`, `restaurantId` for order filtering
- **`@unique` on `ownerId`** enforces one restaurant per owner
- **Decimal(10,2)** for all monetary fields (avoids float rounding)
- **Cascade deletes** on Category→MenuItem and Order→OrderItem

---

### Phase 3: Backend Modules Implementation

#### Auth Module (`src/modules/auth/`)

| File | Purpose |
|---|---|
| `auth.module.ts` | Module declaration, imports JwtModule + PassportModule |
| `auth.controller.ts` | `POST /auth/register`, `POST /auth/login` |
| `auth.service.ts` | Register (hash password), login (validate + sign JWT) |
| `dto/register.dto.ts` | Validation: email, password, name, role |
| `dto/login.dto.ts` | Validation: email, password |
| `strategies/jwt.strategy.ts` | Passport JWT strategy extracting user from Bearer token |
| `guards/jwt-auth.guard.ts` | Global guard using JWT strategy |
| `guards/roles.guard.ts` | Role-based access control guard |
| `decorators/roles.decorator.ts` | `@Roles(UserRole.RESTAURANTE)` decorator |
| `decorators/current-user.decorator.ts` | `@CurrentUser()` param decorator |

**JWT Payload:**
```typescript
interface JwtPayload {
  sub: string;       // user.id
  email: string;
  role: UserRole;
  iat: number;
  exp: number;       // 24h expiration
}
```

---

#### Catalog Module (`src/modules/catalog/`)

| File | Purpose |
|---|---|
| `catalog.module.ts` | Module declaration |
| `restaurants.controller.ts` | CRUD for restaurants (protected by RESTAURANTE role) |
| `restaurants.service.ts` | Business logic + Prisma queries |
| `menu-items.controller.ts` | CRUD for menu items within a restaurant |
| `menu-items.service.ts` | Menu item business logic |
| `categories.controller.ts` | CRUD for categories |
| `categories.service.ts` | Category business logic |
| `dto/*.dto.ts` | Create/Update DTOs with class-validator |

**Key endpoints:**
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/restaurants` | Public | List active restaurants |
| GET | `/restaurants/:id` | Public | Restaurant detail + menu |
| POST | `/restaurants` | RESTAURANTE | Create restaurant |
| PATCH | `/restaurants/:id` | RESTAURANTE (owner) | Update restaurant |
| POST | `/restaurants/:id/categories` | RESTAURANTE | Add category |
| POST | `/categories/:id/menu-items` | RESTAURANTE | Add menu item |
| PATCH | `/menu-items/:id` | RESTAURANTE | Update menu item |
| DELETE | `/menu-items/:id` | RESTAURANTE | Remove menu item |

---

#### Orders Module (`src/modules/orders/`) — HU-02 Focus

| File | Purpose |
|---|---|
| `orders.module.ts` | Module declaration |
| `orders.controller.ts` | Create order, get order, update status |
| `orders.service.ts` | Order creation, state machine transitions, payment |
| `order-state-machine.ts` | **Pure function state machine** with valid transitions |
| `payment.service.ts` | **Mock payment gateway** (simulates success/failure) |
| `dto/create-order.dto.ts` | Cart items + delivery address |
| `dto/update-order-status.dto.ts` | New status + optional notes |

**Order State Machine (pure function):**
```typescript
// Valid transitions map
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDIENTE:   [OrderStatus.PREPARANDO, OrderStatus.CANCELADO],
  PREPARANDO:  [OrderStatus.EN_CAMINO, OrderStatus.CANCELADO],
  EN_CAMINO:   [OrderStatus.ENTREGADO],
  ENTREGADO:   [],
  CANCELADO:   [],
};

function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

function transition(from: OrderStatus, to: OrderStatus): OrderStatus {
  if (!canTransition(from, to)) {
    throw new BadRequestException(
      `Invalid transition: ${from} → ${to}`
    );
  }
  return to;
}
```

**Order creation flow (HU-02):**
```mermaid
sequenceDiagram
    participant C as Cliente
    participant API as OrdersController
    participant SVC as OrdersService
    participant PAY as PaymentService (Mock)
    participant DB as PostgreSQL
    participant REDIS as Redis

    C->>API: POST /orders { items, address, paymentMethod }
    API->>SVC: createOrder(dto, userId)
    SVC->>DB: Validate menu items exist & available
    SVC->>DB: Calculate totals
    SVC->>PAY: processPayment(amount, method)
    PAY-->>SVC: { success: true, ref: "PAY-xxxx" }
    SVC->>DB: Create Order + OrderItems (status: PENDIENTE)
    SVC->>REDIS: PUBLISH order:created { orderId }
    SVC-->>API: Order created
    API-->>C: 201 { order }
```

**Key endpoints:**
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/orders` | CLIENTE | Create new order with payment |
| GET | `/orders` | Authenticated | List user's orders (role-filtered) |
| GET | `/orders/:id` | Authenticated | Order detail |
| PATCH | `/orders/:id/status` | RESTAURANTE/REPARTIDOR | Advance order state |

---

#### Tracking Module (`src/modules/tracking/`)

| File | Purpose |
|---|---|
| `tracking.module.ts` | Module declaration |
| `tracking.gateway.ts` | WebSocket gateway (`@WebSocketGateway`) |
| `tracking.service.ts` | Redis pub/sub, coordinate storage, room management |

**WebSocket events:**

| Event | Direction | Payload | Description |
|---|---|---|---|
| `location:update` | Client → Server | `{ deliveryId, lat, lng }` | Repartidor sends GPS every 5s |
| `location:updated` | Server → Room | `{ deliveryId, lat, lng, timestamp }` | Broadcast to order subscribers |
| `order:subscribe` | Client → Server | `{ orderId }` | Join a tracking room |
| `order:unsubscribe` | Client → Server | `{ orderId }` | Leave a tracking room |
| `order:status-changed` | Server → Room | `{ orderId, status }` | Order state transition notification |

**Room architecture:**
- Each order gets a Socket.IO room named `order:{orderId}`
- Clients (customer tracking screen) join with `order:subscribe`
- Repartidor updates are forwarded to the room
- GPS coordinates are stored in Redis with TTL (key: `tracking:{deliveryId}`)

```typescript
@WebSocketGateway({ cors: true, namespace: '/tracking' })
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  @SubscribeMessage('location:update')
  async handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { deliveryId: string; lat: number; lng: number },
  ) {
    // 1. Store in Redis with TTL
    await this.trackingService.storeLocation(payload);
    
    // 2. Look up orderId for this delivery
    const orderId = await this.trackingService.getOrderIdForDelivery(payload.deliveryId);
    
    // 3. Emit to room subscribers
    this.server.to(`order:${orderId}`).emit('location:updated', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('order:subscribe')
  handleSubscribe(client: Socket, payload: { orderId: string }) {
    client.join(`order:${payload.orderId}`);
  }
}
```

---

#### Ratings Module (`src/modules/ratings/`)

| File | Purpose |
|---|---|
| `ratings.module.ts` | Module declaration |
| `ratings.controller.ts` | Submit + list ratings |
| `ratings.service.ts` | Validation (only delivered orders), aggregation |
| `dto/create-rating.dto.ts` | score (1-5), comment, orderId |

---

### Phase 4: Common / Shared Layer

#### [NEW] `src/common/`

| File | Purpose |
|---|---|
| `filters/http-exception.filter.ts` | Global exception filter with consistent error responses |
| `interceptors/transform.interceptor.ts` | Wrap all responses in `{ success, data, message }` |
| `pipes/validation.pipe.ts` | Global validation pipe with class-validator |
| `decorators/api-paginated.decorator.ts` | Swagger pagination decorator |
| `dto/pagination.dto.ts` | `page`, `limit`, `sortBy`, `sortOrder` |
| `prisma/prisma.service.ts` | Prisma client as NestJS service (lifecycle hooks) |
| `prisma/prisma.module.ts` | Global Prisma module |
| `redis/redis.service.ts` | Redis client wrapper |
| `redis/redis.module.ts` | Global Redis module |

---

### Phase 5: Restaurant Panel Frontend (Next.js + TailwindCSS v4)

#### [NEW] `frontend/` — Next.js App Router scaffold

**Pages to implement:**

| Route | Page | Description |
|---|---|---|
| `/` | Landing / Login | Auth form with role selection |
| `/dashboard` | Dashboard | Order stats, recent orders summary |
| `/menu` | Menu Management | CRUD for categories + menu items |
| `/orders` | Orders List | Real-time order feed with status badges |
| `/orders/[id]` | Order Detail | Order info + live tracking map placeholder |

**Design approach:**
- Dark mode by default with glassmorphism cards
- Inter font from Google Fonts
- Smooth gradient accents (violet → blue → teal)
- Micro-animations on hover and state transitions
- Responsive sidebar navigation

---

### Phase 6: Infrastructure Files

#### [NEW] `docker-compose.yml`

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: rapipedido
      POSTGRES_USER: rapipedido
      POSTGRES_PASSWORD: rapipedido_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

#### [NEW] `.env.example`

```env
DATABASE_URL="postgresql://rapipedido:rapipedido_dev@localhost:5432/rapipedido"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRATION="24h"
PORT=3000
```

---

### Phase 7: Tests

#### [NEW] `backend/test/order-state-machine.spec.ts`

Unit tests for the order state machine covering:

| Test Case | Expected |
|---|---|
| `PENDIENTE → PREPARANDO` | ✅ Valid |
| `PREPARANDO → EN_CAMINO` | ✅ Valid |
| `EN_CAMINO → ENTREGADO` | ✅ Valid |
| `PENDIENTE → CANCELADO` | ✅ Valid |
| `PREPARANDO → CANCELADO` | ✅ Valid |
| `ENTREGADO → PENDIENTE` | ❌ Throws `BadRequestException` |
| `CANCELADO → PREPARANDO` | ❌ Throws `BadRequestException` |
| `EN_CAMINO → CANCELADO` | ❌ Throws `BadRequestException` |
| `ENTREGADO → any` | ❌ Terminal state |
| `CANCELADO → any` | ❌ Terminal state |

---

### Phase 8: API Documentation

#### [NEW] Swagger / OpenAPI

- Integrated via `@nestjs/swagger` with decorators on all controllers
- Auto-generated at `GET /api/docs` (Swagger UI) and `GET /api/docs-json` (OpenAPI spec)
- All DTOs decorated with `@ApiProperty()` for schema generation
- Grouped by module tags: `Auth`, `Catalog`, `Orders`, `Tracking`, `Ratings`

---

### Phase 9: Git Push

Sequential execution of:
```bash
git init
git branch -M main
git remote remove origin 2>$null; git remote add origin https://github.com/JSMT04/App_domicilios.git
git add .
git commit -m "feat(architecture): setup modular monolith structure, database schema, real-time tracking, and API endpoints"
git push -u origin main --force
```

---

## File Inventory (Total: ~55 files)

| Area | Count | Key Files |
|---|---|---|
| Root config | 4 | `docker-compose.yml`, `.gitignore`, `README.md`, `.env.example` |
| Backend config | 5 | `package.json`, `tsconfig.json`, `nest-cli.json`, `.env.example`, `tsconfig.build.json` |
| Prisma | 1 | `schema.prisma` |
| Auth module | 10 | controller, service, DTOs, guards, decorators, strategy |
| Catalog module | 10 | controllers (3), services (3), DTOs |
| Orders module | 8 | controller, service, state machine, payment mock, DTOs |
| Tracking module | 4 | gateway, service, module, DTOs |
| Ratings module | 4 | controller, service, module, DTO |
| Common/Shared | 8 | Prisma service, Redis service, filters, interceptors, pipes |
| Tests | 1 | Order state machine spec |
| Frontend | ~10 | Pages, components, layout, API client |

---

## Verification Plan

### Automated Tests

```bash
cd backend
npm run test -- --testPathPattern=order-state-machine
```

Expected: All 10 test cases pass (valid transitions succeed, invalid transitions throw).

### Build Verification

```bash
# Backend compiles without errors
cd backend && npx tsc --noEmit

# Frontend builds without errors
cd frontend && npm run build
```

### Manual Verification

1. **Docker services**: Run `docker-compose up -d` and verify PostgreSQL + Redis start
2. **Prisma migration**: Run `npx prisma migrate dev` — schema creates all 8 tables
3. **Swagger UI**: Start backend (`npm run start:dev`) and visit `http://localhost:3000/api/docs`
4. **WebSocket**: Use a Socket.IO test client to connect to `/tracking` namespace and emit `location:update`
5. **Frontend**: Start Next.js dev server and verify the login page renders with dark theme
6. **Git**: Verify the commit appears at `https://github.com/JSMT04/App_domicilios.git`
