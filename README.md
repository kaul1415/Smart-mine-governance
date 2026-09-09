# CoalGov Backend

Governance and compliance platform for Indian coal mining operations. Built with **Node.js**, **Express**, **JavaScript**, and **Prisma ORM** with **PostgreSQL**.

---

## 🏗️ Tech Stack

- **Runtime:** Node.js (JavaScript / CommonJS)
- **Framework:** Express.js
- **Database & ORM:** PostgreSQL + Prisma ORM
- **Authentication:** JWT (Access Token + Refresh Token) & bcryptjs
- **Validation:** Zod
- **Security:** CORS, RBAC (Role-Based Access Control)
- **Development Tool:** Nodemon

---

## 📁 Folder Structure

```
├── .env                      # Environment configuration
├── package.json              # Dependencies and scripts
├── prisma/
│   └── schema.prisma         # Prisma schema (PostgreSQL datasource + models)
└── src/
    ├── config/
    │   ├── db.js             # Prisma client singleton
    │   └── env.js            # Zod-validated environment config
    ├── controllers/
    │   └── auth.controller.js# Register, Login, Refresh, Logout, Me
    ├── middlewares/
    │   └── auth.middleware.js# verifyToken, requireRole RBAC
    ├── routes/
    │   └── auth.routes.js    # Express routes mapped to /api/auth
    ├── utils/
    │   ├── jwt.js            # JWT token generation & verification
    │   └── password.js       # Password hashing with bcryptjs
    ├── validators/
    │   └── auth.validator.js # Zod validation schemas
    └── index.js              # Server entry point & global middleware
```

---

## 👥 User Roles

The platform enforces Role-Based Access Control (RBAC) with 5 distinct roles:
1. `ADMIN` — System administrator with complete system access
2. `MINE_OFFICIAL` — Field official managing mining operations
3. `INSPECTOR` — Compliance officer conducting mine audits and inspections
4. `MANAGER` — Mine site manager overseeing operations and compliance
5. `REGULATOR` — Government / regulatory agency oversight authority

---

## ⚙️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database & Environment
Edit `.env` with your PostgreSQL database credentials and JWT secret keys:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coalgov_db?schema=public"

JWT_ACCESS_SECRET="your_access_token_secret_here"
JWT_REFRESH_SECRET="your_refresh_token_secret_here"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

### 3. Run Prisma Migrations
Generate Prisma client and run migrations against PostgreSQL:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run DB Migrations
npm run prisma:migrate
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Start Production Server
```bash
npm start
```

---

## 📡 API Endpoints

### Health & Info
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | API metadata and info |
| `GET` | `/health` | Public | Server & database health status |

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Request Body | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | `{ email, password, name, role?, phone?, mineName?, designation? }` | Register a new user |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | Authenticate & obtain tokens |
| `POST` | `/api/auth/refresh` | Public | `{ refreshToken }` | Generate new access & refresh tokens |
| `POST` | `/api/auth/logout` | Private (`Bearer <token>`) | — | Invalidate user refresh token |
| `GET` | `/api/auth/me` | Private (`Bearer <token>`) | — | Get current user profile |

---

## 🛡️ Role-Based Access Control Usage

To protect custom routes with specific roles:

```javascript
const express = require('express');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// Only REGULATOR and INSPECTOR can access
router.get(
  '/inspections',
  verifyToken,
  requireRole('REGULATOR', 'INSPECTOR'),
  getInspectionReports
);

module.exports = router;
```
