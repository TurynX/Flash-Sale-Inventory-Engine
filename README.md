# ⚡ Flash Sale Inventory Engine

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

*A high-concurrency NestJS backend featuring PostgreSQL, BullMQ queues, and isolated E2E testing for Stripe Checkout & Webhooks.*

---

## 🚀 Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | **NestJS** | Modular architecture with `ParseUUIDPipe` & JWT authentication |
| **Database** | **PostgreSQL** | Direct `pg` queries with error mapping & `CASCADE` resets |
| **Queues** | **Redis / BullMQ** | Background inventory reservation & worker delay processing |
| **Payments** | **Stripe** | Checkout URL generation & cryptographically verified webhooks |
| **Testing** | **Jest & Supertest** | Full E2E test suite with isolated `jest.mock('stripe')` |

---

## 🛣️ API Routes

### 🔐 Auth (`/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/auth` | Register a new user |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/auth/login` | Authenticate user & return JWT |

### 📦 Products (`/product`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/product` | Create a new flash-sale product |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/product` | List all available products |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/product/:id` | Get product details by UUID |

### 🛒 Orders & Payments (`/orders`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/orders` | Reserve inventory & initiate order |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/orders/generate-stripe-url` | Generate Stripe Checkout payment URL |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/orders/webhook/checkout` | Handle `checkout.session.completed` webhook |

---

## ⚙️ Environment Setup

Create a `.env` or `.env.test` file in your root directory (ensure `.env*` is in `.gitignore`):

```env
NODE_ENV=test
PORT=3001
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=flash_sale_test
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@example.com
REDIS_HOST=localhost
REDIS_PORT=6380
WORKER_DELAY=10000
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

---

## 🧪 Running E2E Tests

Ensure your PostgreSQL and Redis test containers are running, then execute:

```bash
npm run test:e2e
```