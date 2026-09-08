# MineGov AI — Frontend

**AI-Enabled Smart Governance and Compliance Monitoring Platform for Indian Coal Mining Operations** — a frontend prototype built for Smart India Hackathon (SIH).

All 8 build phases are complete, plus a final architecture refinement pass (department-based login, a common Notice Board, and document-upload-driven Contractor Reports with OCR). This is a full multi-role governance platform: field reporting → flag/ticket workflow → regulatory response → corrective action → compliance/risk impact → management alerting → AI-assisted explanation, across departments/roles and a full Contractor Portal, with an offline-first field capture flow and a documented backend API contract.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

## Try it

The login screen has three tabs: **Department**, **Contractor**, **Regulator**.

- **Department** — pick any of the 15 departments (or **System Department**) from the dropdown, enter any username/password, and sign in. Role and baseline permissions are derived from the department you pick (`department → role → permissions`). Try **System Department** to see organization-wide, admin-level access applied regardless of which department you'd otherwise map to; try **Production** or **Safety & Rescue** to see their existing specialized dashboards; any other department gets a generic Department Officer view.
- **Contractor** — the separate self-service Contractor Portal at `/contractor/*`.
- **Regulator** — the external regulator view, preserved from earlier phases.
- Mock credentials aren't required; any username/password combination works.

## What's built

### 1 — Foundation
Project structure, routing (every route in the brief is real — no placeholders remain), mock `AuthContext`/`authService`, `DashboardLayout` with role-aware `Sidebar` + `Topbar`, the core reusable component set, the `USE_MOCKS`-backed API service layer, and the Governance Dashboard.

### 2 — Governance
`/flags` (filters, pagination), `/flags/new` (mobile-friendly field form), `/flags/:id` (reporter-identity gating, inline response submission, linked corrective actions, risk impact, audit timeline), `/responses` + `/responses/:id`, `/audit-logs`.

### 3 — Mines, Compliance, Inspections, Corrective Actions
`/mines` + `/mines/:id` (tabbed), `/compliance` + `/compliance/:id`, `/inspections` + `/inspections/new` + `/inspections/:id` (observation capture with an AI-analysis panel that only ever displays a backend-provided result), `/corrective-actions` + `/corrective-actions/:id` (role/department-gated workflow: Assign → Start → Submit for Verification → Approve/Reject → Close).

### 4 — Risk Intelligence, Recurring Issues, Risk Map, Notifications
`/risk` (trend chart, per-mine contributor breakdown, recurring-issue detection), `/risk/map` (Leaflet, risk-colored markers), `/notifications` (read/unread, mark-all-read, live unread count in the topbar).

### 5 — Contractor Portal
A completely separate self-service shell for the Contractor role: `/contractor/dashboard`, `/projects`, `/reports`, `/attendance`, `/safety`, `/actions`, `/documents`, `/risk`, `/performance` — plus an admin-facing `/contractors` + `/contractors/:id` for governance roles to monitor every contractor org.

### 6 — Document Intelligence, AI Copilot, Reports
`/documents` (upload → processing → AI-extracted data → one-click corrective-action creation from findings), `/copilot` (full chat UI: history, search, rename/delete, suggested questions, source references — backed by a clearly-labeled mock responder that will be swapped for the real RAG service), `/reports` (filtered report generation + browser-print PDF export).

### 7 — Offline Field Reporting
`/field` — genuinely offline-first: an IndexedDB-backed sync queue (`src/utils/offlineStore.js`), auto-sync on reconnect, and a Sync Queue panel showing Local ID / device-captured time / Sync Status / Retry. Also where department-based authorization was introduced (see below).

### 8 — Polish
Settings page (account, role/department, admin-access indicator, notification preferences), accessibility pass (dialog roles, icon-button labels, no nested interactive elements, mobile-responsive chat sidebar), and this document plus `BACKEND_API_CONTRACT.md`.

## Authentication & authorization (department-based, API-ready)

One common Department Login screen — no separate login page/app per department. `department` is the primary access boundary for internal staff; `role` is derived from it (`department → role → permissions`, see `src/utils/departmentConfig.js`) and still shapes which UI a user sees within that access level. `department === "system"` grants organization-wide, admin-level access regardless of role — see `src/utils/departments.js` and `hasAdminAccess()` in `src/utils/roles.js`. Contractor and Regulator are separate, non-department login paths (external parties).

The login contract is `POST /auth/login { username, password, loginType, department? }`; wiring the real endpoint is a one-line change in `authService.js`, no component changes needed. Full permission matrix and endpoint contract in `BACKEND_API_CONTRACT.md`.

## Common Notice Board

One organization-wide board (`/notices`), visible to every department, Contractor, and Regulator alike — not a separate board per department. A dashboard widget (`NoticeBoardPreviewCard`) surfaces the latest active notices; `noticeService.js` already supports a future `visibility: [department, ...]` shape for department-scoped notices, though the current seed data is all organization-wide.

## Contractor Reports (document upload + OCR)

Contractor → My Reports is upload-driven, not a text editor: pick a report type and project, set the date, upload a PDF/JPG/JPEG/PNG, and the (mock) OCR pipeline extracts the report content for review before final submission — mirroring the same upload → processing → extracted-data pattern already used by Document Intelligence (`documentService.js`). This is a distinct concept from Contractor → Documents (general storage), kept as a separate module per the finalized requirements. See `contractorService.js` (`uploadReport` / `processReport` / `finalizeReport`) and the reusable `DocumentUploader` component.

## Folder structure

```
src/
├── components/
│   ├── common/       # Card, Button, DataTable, FilterBar, Tabs, ConfirmDialog, Timeline, FileUploader, DocumentUploader, ...
│   ├── layout/        # Sidebar, Topbar
│   ├── dashboard/      field/     documents/     copilot/
│   ├── flags/          risk/      inspections/    contractor-facing bits live under pages/contractor
│   └── responses/       notifications/
├── pages/
│   ├── auth/  dashboard/  flags/  responses/  mines/  compliance/
│   ├── inspections/  correctiveActions/  risk/  notifications/
│   ├── contractors/ (admin)  contractor/ (self-service portal)
│   ├── documents/  copilot/  reports/  field/  audit/  settings/
├── layouts/            DashboardLayout, AuthLayout
├── services/           api.js + one service per resource (see below)
├── context/            AuthContext
├── hooks/               useAuth, useOnlineStatus
├── data/                mockData.js (all synthetic seed data)
└── utils/               roles.js, departments.js, navigation.js, format.js, constants.js,
                         correctiveActionWorkflow.js, offlineStore.js
```

## Reusable components

`Card`, `Button`, `PageHeader`, `StatCard`, `StatusBadge`, `RiskBadge`, `ProgressBar`, `DataTable`, `FilterBar`, `SearchInput`, `Pagination`, `Tabs`, `Timeline`, `FileUploader`, `Modal`-equivalent `ConfirmDialog`, `LoadingState`, `EmptyState`, `ErrorState`, `ProtectedRoute` — plus feature-specific ones (`ReporterIdentity`, `AIAnalysisPanel`, `DocumentExtractedDataPanel`, `ChatSidebar`, `ChatMessage`, `MineRiskCard`, `RecurringIssueCard`, `RiskTrendChart`, `OfflineBanner`, `SyncQueuePanel`, and the compact `Field*Form` components).

## API service structure

`services/api.js` is the **only** module that knows about `VITE_API_BASE_URL`; every other service (`flagService`, `mineService`, `responseService`, `correctiveActionService`, `complianceService`, `inspectionService`, `riskService`, `contractorService`, `documentService`, `chatService`, `reportsService`, `notificationService`, `auditService`, `authService`, `syncService`) is built on top of it. Pages only ever call a service function — never `fetch`/`apiClient` directly.

## Mock data → real API

Every service checks `USE_MOCKS` (in `api.js`) and branches: `true` resolves from `src/data/mockData.js` (with in-memory mutation for create/update calls, so the demo feels stateful within a session); `false` calls the endpoint documented in the adjacent comment via `apiClient`. **To connect the real backend: set `USE_MOCKS = false` and set `VITE_API_BASE_URL`.** No page or component needs to change — see `BACKEND_API_CONTRACT.md` for the exact contract every endpoint must satisfy.

## Design language

Deep governance-navy palette (`brand-800 #0B2545`) with steel-blue secondary and safety-signage risk colors (not the generic warm-cream/terracotta AI-website look). Public Sans for UI text, IBM Plex Mono only for ticket/action IDs. Flat cards with hairline borders, minimal shadow, no gradients or glassmorphism — see `tailwind.config.js` for the full token set.

## Environment variables

Copy `.env.example` to `.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

Not required while `USE_MOCKS` is `true` in `src/services/api.js`.

## Backend API contract

See **`BACKEND_API_CONTRACT.md`** — every endpoint (method, path, request/response shape, auth, role/department permission), the corrective-action workflow transition table, and the full role/department permission matrix.
