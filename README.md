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

## 🛣️ API Routes & Swagger Specification

### 🔐 Auth (`/auth`)
| Method | Endpoint | Description | Responses |
| :--- | :--- | :--- | :--- |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/auth` | Create a new user | `201`: Created<br>`400`: Invalid data / User exists |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/auth/login` | Authenticate user & return JWT | `200`: Success<br>`401`: Invalid credentials |

### 📦 Products (`/product`)
| Method | Endpoint | Description | Responses |
| :--- | :--- | :--- | :--- |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/product` | Create a product *(Admin only, via `ADMIN_EMAIL`)* | `201`: Created<br>`401`: Unauthorized |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/product` | Get all products | `200`: Success |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/product/{id}` | Get product details by UUID | `200`: Success<br>`404`: Not found |

### 🛒 Orders & Payments (`/orders`)
| Method | Endpoint | Description | Responses |
| :--- | :--- | :--- | :--- |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/orders` | Reserve product inventory | `201`: Reserved<br>`400`: Low stock<br>`401`: Unauthorized |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/orders/generate-stripe-url` | Generate Stripe checkout URL for reservation | `201`: URL generated<br>`404`: Expired |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/orders/webhook/checkout` | Handle Stripe checkout webhook events *(Requires `stripe-signature` header)* | `202`: Accepted<br>`500`: Signature failed |

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