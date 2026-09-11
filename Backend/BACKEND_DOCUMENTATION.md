# CoalGov — Backend Architecture & Technical Documentation

This document outlines the directory structure, architectural flow, and dependency choices for the **CoalGov Backend API** (Node.js + Express + Prisma + PostgreSQL).

---

## 📁 1. Project Directory Structure

```
Backend/
├── .env                              # Environment configuration (PORT, DB URL, JWT secrets)
├── .gitignore                        # Prevents sensitive files (.env, node_modules) from git
├── package.json                      # Project metadata, dependencies, and npm scripts
├── prisma/
│   └── schema.prisma                 # PostgreSQL database schema & relational domain models
├── src/
│   ├── config/
│   │   ├── db.js                     # Global Prisma client singleton
│   │   └── env.js                    # Zod-validated runtime environment variables
│   ├── controllers/
│   │   ├── auth.controller.js        # Authentication (register, login, refresh, logout, me)
│   │   ├── mine.controller.js        # Mine directory CRUD & statistics
│   │   ├── compliance.controller.js  # Statutory compliance & compliance rates
│   │   ├── inspection.controller.js  # Geo-tagged field inspections & authority report submission
│   │   ├── violation.controller.js   # Violations, show-cause notices & mine dual-response lifecycle
│   │   ├── document.controller.js    # Document classification & OCR metadata extraction
│   │   ├── chat.controller.js        # RAG / AI Copilot session & message routing
│   │   └── upload.controller.js      # PDF & evidence document uploads
│   ├── middlewares/
│   │   ├── auth.middleware.js        # JWT verification (`verifyToken`) & RBAC guards (`requireRole`)
│   │   └── upload.middleware.js      # Multer file-type validation & categorized disk storage
│   ├── routes/
│   │   ├── auth.routes.js            # Routes mapped to `/api/auth`
│   │   ├── mine.routes.js            # Routes mapped to `/api/mines`
│   │   ├── compliance.routes.js      # Routes mapped to `/api/compliances`
│   │   ├── inspection.routes.js      # Routes mapped to `/api/inspections`
│   │   ├── violation.routes.js       # Routes mapped to `/api/violations`
│   │   ├── document.routes.js        # Routes mapped to `/api/documents`
│   │   ├── chat.routes.js            # Routes mapped to `/api/chat`
│   │   └── upload.routes.js          # Routes mapped to `/api/uploads`
│   ├── services/
│   │   └── memoryStore.js            # In-memory thread-safe chat session store
│   ├── utils/
│   │   ├── auditLogger.js            # Immutable audit logging helper (`AuditLog`)
│   │   ├── jwt.js                    # JWT access & refresh token signing / verification
│   │   └── password.js               # Password hashing & comparison (bcryptjs)
│   ├── validators/
│   │   ├── auth.validator.js         # Zod schemas for user authentication
│   │   ├── mine.validator.js         # Zod schemas for mine registration & filtering
│   │   ├── compliance.validator.js   # Zod schemas for statutory compliance
│   │   ├── inspection.validator.js   # Zod schemas for inspections & geo-coordinates
│   │   └── violation.validator.js    # Zod schemas for violations & mine responses
│   └── index.js                      # Express app entry point, static asset hosting, global error handlers
└── uploads/                          # Categorized local storage for PDFs and evidence
    ├── documents/                    # Compliance clearances & general statutory certificates
    ├── reports/                      # Official authority inspection reports
    └── responses/                    # Mine official counter-responses and proof documents
```

---

## 📦 2. Dependencies & Reason of Use

### Production Dependencies (`dependencies`)

| Package | Version | Purpose & Rationale |
|---|---|---|
| **`express`** | `^4.21.1` | **Web Framework:** Provides the HTTP server, routing system, and middleware pipeline for handling all REST API requests. |
| **`@prisma/client`** | `^5.22.0` | **ORM Query Engine:** Type-safe database queries against PostgreSQL, managing relationships, cascades, and data modeling. |
| **`pg`** | `^8.13.1` | **PostgreSQL Client Driver:** Industry-standard connection pool manager and low-level PostgreSQL communication bridge. |
| **`jsonwebtoken`** | `^9.0.2` | **Stateless Authentication:** Generates and cryptographically verifies short-lived Access Tokens (15m) and long-lived Refresh Tokens (7d). |
| **`bcryptjs`** | `^2.4.3` | **Password Security:** Hashes plaintext passwords using salt rounds (10) before saving them to the database to prevent credential leaks. |
| **`zod`** | `^3.23.8` | **Schema Validation:** Strict runtime validation of incoming JSON request bodies, query strings, and environment variables. Returns precise field error messages on invalid input. |
| **`multer`** | `^1.4.5-lts.1` | **Multipart File Uploads:** Handles PDF and media uploads (inspection reports, compliance certificates, mine evidence) with MIME-type filtering and file size limits (25MB). |
| **`cors`** | `^2.8.5` | **Cross-Origin Security:** Allows controlled communication between the frontend client (`http://localhost:5173`) and the backend API (`http://localhost:5000`). |
| **`dotenv`** | `^16.4.5` | **Configuration Management:** Loads environment variables from the local `.env` file into `process.env` at server initialization. |

### Development Dependencies (`devDependencies`)

| Package | Version | Purpose & Rationale |
|---|---|---|
| **`nodemon`** | `^3.1.7` | **Development Hot Reloading:** Monitors source code changes and automatically restarts the Node server without manual intervention. |
| **`prisma`** | `^5.22.0` | **Prisma CLI:** Used for running migrations (`prisma migrate dev`), generating the client (`prisma generate`), and browsing data (`prisma studio`). |

---

## 🏛️ 3. Core Architectural Modules

### A. Authentication & Role-Based Access Control (RBAC)
- **Roles:** `ADMIN`, `MINE_OFFICIAL`, `INSPECTOR`, `MANAGER`, `REGULATOR`.
- **Token Mechanism:** 
  - Access Token (Authorization: `Bearer <token>`) passed in HTTP headers.
  - Refresh Token stored in the database to allow revocation/session invalidation on logout.
- **Middleware:** `verifyToken` checks signature and user active status; `requireRole(...roles)` ensures only authorized departments access restricted endpoints.

### B. Dual Reporting & Response Workflow
- **Authority / Inspector Submission:** Upload official inspection reports in PDF (`reportUrl`) alongside written notes and verified geo-coordinates (`latitude`, `longitude`).
- **Mine Official Dual Response:** Mine officials can submit both a **written explanation / defense (`responseText`)** AND **an official counter-response PDF (`responsePdfUrl`)** with rectification proof (`evidenceUrl`).

### C. Statutory Compliance & Risk Scoring
- Categorizes statutory compliance across 4 pillars: `SAFETY`, `ENVIRONMENT`, `PRODUCTION`, `LABOUR`.
- Aggregates metrics to calculate real-time compliance rate percentages across individual mines and the entire subsidiary directory.

### D. Immutable Audit Logging
- [`src/utils/auditLogger.js`](file:///d:/SIH/Backend/src/utils/auditLogger.js) writes every critical action (creations, status transitions, report uploads, deletions) directly to the `AuditLog` table with user stamps and metadata.

---

## 🚀 4. Quick Run Guide

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client for PostgreSQL
npm run prisma:generate

# 3. Start development server with hot reload
npm run dev

# 4. Start production server
npm start
```
