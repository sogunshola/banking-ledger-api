# 🏦 Banking Transactions API (Ledger System)

A financial ledger API built with **NestJS**, **MongoDB**, and **TypeScript**. It supports **double-entry accounting**, **multi-currency accounts**, **transaction history**, and **ACID-compliant transactions** using MongoDB replica sets.

---

## ✨ Features

- ✅ Account creation and management
- 💰 Deposits, withdrawals, and account-to-account transfers
- 🧾 Transaction history per account
- 💱 Multi-currency support (NGN, USD)
- 🔄 Double-entry accounting (DEBIT/CREDIT)
- 🔐 JWT-based authentication
- 🧪 Unit tested
- 🐳 Fully containerized with Docker
- ⚙️ ACID-compliant MongoDB transactions with replica set

---

## 📦 Tech Stack

- [NestJS](https://nestjs.com/) - with express adapter
- [TypeScript](https://www.typescriptlang.org/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Docker](https://www.docker.com/)
- [Jest](https://jestjs.io/) – Unit testing

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/sogunshola/banking-ledger-api.git
cd banking-ledger-api
```

### 2. Set Up Environment Variables

Create a `.env` file:
##### Copy `.env.example` to `.env` and configure the environment variables.

---

## 🐳 Run with Docker

```bash
docker-compose up --build
```

- API: http://localhost:3000
- MongoDB: port 27017 (replica set enabled)

To reset volumes:
```bash
docker-compose down -v
```

---

## 📚 API Documentation

You can explore the full API using Postman or swagger:

🔗 [Swagger Docs Link](http://localhost:3000/swagger) - http://localhost:3000/swagger

🔗 [Postman Docs Link](https://www.postman.com/your-collection-link)

---

## 🧪 Running Tests

```bash
npm run test
```

All core modules are unit tested.

---

## 🛠️ Developer Notes

- MongoDB must run as a **replica set** to support transactions
- All money movement uses **double-entry accounting**
- Ensure accurate decimal handling when expanding to real currency logic (e.g. use Decimal128)

---

## 📄 License

This project is licensed under the MIT License.
