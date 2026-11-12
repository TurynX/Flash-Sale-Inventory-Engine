<div align="center">

# <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/NestJS-Dark.svg" width="32" align="center" /> NestJS E2E Testing & Stripe Integration

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

*A NestJS backend featuring PostgreSQL, BullMQ queues, and isolated E2E testing for Stripe Checkout & Webhooks.*

</div>

---

## 🚀 Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | ![NestJS](https://img.shields.io/badge/-NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white) | Modular architecture with `ParseUUIDPipe` validation |
| **Database** | ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white) | Direct `pg` queries with `22P02` error mapping & `CASCADE` resets |
| **Queues** | ![Redis](https://img.shields.io/badge/-Redis_/_BullMQ-DC382D?style=flat-square&logo=redis&logoColor=white) | Background job processing with numeric `WORKER_DELAY` parsing |
| **Payments** | ![Stripe](https://img.shields.io/badge/-Stripe-626CD9?style=flat-square&logo=stripe&logoColor=white) | Checkout URL generation & `checkout.session.completed` webhooks |
| **Testing** | ![Jest](https://img.shields.io/badge/-Jest_&_Supertest-C21325?style=flat-square&logo=jest&logoColor=white) | Full E2E test suite with isolated `jest.mock('stripe')` |

---

## ⚙️ Environment Setup

Create a `.env` or `.env.test` file in your root directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mydb_test
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
WORKER_DELAY=60000
```

---

## 🧪 Running E2E Tests

Ensure your PostgreSQL and Redis test containers are running, then execute:

```bash
npm run test:e2e
```