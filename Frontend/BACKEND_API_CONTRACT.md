# MineGov AI — Backend API Contract

This is the contract the frontend was built against. Every network call in `src/services/*.js` goes through `src/services/api.js` (`VITE_API_BASE_URL`), and each service function has a `// METHOD /path` comment next to its real-mode branch — that comment is authoritative; this document organizes and expands on those comments.

The backend team may rename or restructure endpoints; because every page talks to a service function and never to a URL directly, updating this contract and the corresponding service file is the only change needed on the frontend.

## Conventions

- **Base URL**: `VITE_API_BASE_URL` (e.g. `http://localhost:8000/api`).
- **Auth**: `Authorization: Bearer <token>` on every request except `POST /auth/login`. The token is issued by login and stored client-side; the frontend never inspects it.
- **Content type**: `application/json` for all request/response bodies except file uploads.
- **Errors**: non-2xx responses should return `{ "message": string, "code"?: string, "details"?: object }`. The frontend surfaces `message` directly in error/empty states.
- **Timestamps**: ISO 8601 with timezone offset (the mock data uses IST, `+05:30`). Client-captured timestamps (offline field reports) are device time only — the server's `createdAt`/`syncedAt` on write is the authoritative timestamp for audit purposes.
- **IDs**: opaque strings. The frontend never parses or assumes structure in an ID (mock IDs like `F-1021`, `CA-1042` are illustrative, not a contract).

## Authentication & Authorization

Authorization has **two independent dimensions**: `role` (what UI a user sees) and `department` (the backend's actual access-control boundary — see [`ROLE_AND_DEPARTMENT_MATRIX`](#role--department-permission-matrix) below). **System Department carries admin-level access regardless of role.** Both are returned on login and should be included on every authenticated user object the backend returns elsewhere (e.g. `assignedAuthority`, `actor` fields), since the frontend uses `department` — not just `role` — to decide what's shown.

| Method | Endpoint | Request Body | Response | Auth |
|---|---|---|---|---|
| POST | `/auth/login` | `{ email, password, role, department }` | `{ user: { id, name, email, role, department, contractorId? }, token }` | None |
| POST | `/auth/logout` | — | `204` | Bearer |

**Roles**: `corporate_admin`, `mine_manager`, `safety_officer`, `field_inspector`, `contractor`, `regulator`.
**Departments**: `system`, `safety`, `environment`, `operations`, `hr_labour`, `contractor_management`, `regulatory_affairs`.

All permission gating below is UI/UX only on the frontend — **the backend is the authority** and must independently enforce every rule, not trust client-sent role/department claims.

## Dashboard

| Method | Endpoint | Response |
|---|---|---|
| GET | `/dashboard` | Aggregate stats: `{ totalMines, activeFlags, highCriticalRiskMines, complianceRate, openCorrectiveActions, overdueActions }` |

The frontend currently composes this from `GET /mines`, `GET /flags`, and `GET /corrective-actions` client-side (see `mockDashboardStats` in `src/data/mockData.js`); a dedicated `/dashboard` endpoint is preferred once available so the aggregation isn't duplicated client-side.

## Mines

| Method | Endpoint | Request Body | Response | Role/Permission |
|---|---|---|---|---|
| GET | `/mines` | — | `Mine[]` | All authenticated |
| GET | `/mines/:id` | — | `Mine` | All authenticated |
| GET | `/mines?riskLevel=HIGH,CRITICAL` | — | `Mine[]` | All authenticated |

`Mine`: `{ id, name, location, status, complianceRate, riskScore, riskLevel, openFlags, openCorrectiveActions, coordinates: [lat, lng] }`

## Flags (primary governance ticket)

| Method | Endpoint | Request Body | Response | Role/Permission |
|---|---|---|---|---|
| GET | `/flags` | — | `Flag[]` | All authenticated |
| GET | `/flags?mineId=:id` | — | `Flag[]` | All authenticated |
| GET | `/flags?sort=-createdAt&limit=N` | — | `Flag[]` | All authenticated |
| GET | `/flags/stats/by-category` | — | `{ category, count }[]` | All authenticated |
| GET | `/flags/:id` | — | `Flag` | All authenticated; `reporterName` must be omitted/redacted server-side for confidential flags unless the caller's department is in `ROLES_THAT_SEE_REPORTER_IDENTITY` or `department === system` |
| POST | `/flags` | `{ category, mineId, description, location, severity, reporterType, isConfidential, reporterName?, evidenceCount? }` | `Flag` (201) | All authenticated (field reporting) |
| PATCH | `/flags/:id` | Partial `Flag` | `Flag` | Corporate Admin, Mine Manager, Safety Officer, or `department === system` |

`Flag`: `{ id, category, mineId, mineName, location, description, severity, status, createdAt, assignedAuthority, reporterType, isConfidential, reporterName, evidenceCount }`.
**Categories**: Safety, Environment, Labour, Equipment, Administrative, Compliance, Other. **Severities**: LOW, MEDIUM, HIGH, CRITICAL. **Statuses**: New, Under Review, Assigned, Investigation, Action Required, Action Taken, Resolved, Dismissed, Closed.

**Reporter privacy**: the backend may retain true reporter identity for authorized internal verification, but `GET`/`POST` responses to unauthorized callers must return `reporterName` as redacted (e.g. `"Confidential Reporter #NNNN"` or `null`) — never send the real identity to a client that shouldn't see it. The frontend's `ReporterIdentity` component is a display convenience, not the enforcement point.

## Responses (regulatory responses to flags)

| Method | Endpoint | Request Body | Response | Role/Permission |
|---|---|---|---|---|
| GET | `/responses` | — | `Response[]` | All authenticated |
| GET | `/responses?flagId=:id` | — | `Response[]` | All authenticated |
| GET | `/responses/:id` | — | `Response` | All authenticated |
| POST | `/responses` | `{ flagId, authority, responseType, officialResponse, reason?, supportingDocuments? }` | `Response` (201) | Corporate Admin, Mine Manager, Safety Officer, Regulator, or `department === system` |

`Response`: `{ id, flagId, authority, responseType, status, date, officialResponse, actionTaken?, reason?, supportingDocuments: string[] }`.
**Response types**: Issue Approved, Action Initiated, Action Taken, Resolved, Dismissed.

## Corrective Actions

| Method | Endpoint | Request Body | Response | Role/Permission |
|---|---|---|---|---|
| GET | `/corrective-actions` | — | `CorrectiveAction[]` | All authenticated |
| GET | `/corrective-actions?overdue=true` | — | `CorrectiveAction[]` | All authenticated |
| GET | `/corrective-actions?flagId=:id` \| `?mineId=:id` | — | `CorrectiveAction[]` | All authenticated |
| GET | `/corrective-actions/:id` | — | `CorrectiveAction` | All authenticated |
| POST | `/corrective-actions` | `{ issue, recommendation, mineId, assignedTo, priority, dueDate, flagId? }` | `CorrectiveAction` (201) | Corporate Admin, Mine Manager, Safety Officer, or `department === system` (also created by the Document Intelligence "Create Corrective Actions" flow) |
| PATCH | `/corrective-actions/:id` | `{ status, ... }` | `CorrectiveAction` | Gated by workflow transition — see table below |
| POST | `/corrective-actions/:id/comments` | `{ author, text }` | `Comment` (201) | All authenticated with visibility on the action |

`CorrectiveAction`: `{ id, flagId, issue, recommendation, mineId, mineName, assignedTo, priority, dueDate, status, isOverdue, evidence: string[], comments: Comment[] }`.
**Priorities**: LOW, MEDIUM, HIGH. **Statuses**: Open, Assigned, In Progress, Submitted for Verification, Verified, Closed, Rejected.

**Workflow transitions** (`src/utils/correctiveActionWorkflow.js` — UI-only mirror of what the backend must enforce):

| From | Action | To | Permitted role/department |
|---|---|---|---|
| Open | Assign | Assigned | Corporate Admin, Mine Manager, Safety Officer, `system` |
| Assigned | Start | In Progress | Contractor, Field Inspector, Mine Manager, `system` |
| In Progress | Submit for Verification | Submitted for Verification | Contractor, Field Inspector, `system` |
| Submitted for Verification | Approve | Verified | Corporate Admin, Mine Manager, Safety Officer, Regulator, `system` |
| Submitted for Verification | Reject | Rejected | Corporate Admin, Mine Manager, Safety Officer, Regulator, `system` |
| Verified | Close | Closed | Corporate Admin, Mine Manager, `system` |
| Rejected | Reassign | Assigned | Corporate Admin, Mine Manager, Safety Officer, `system` |

## Compliance

| Method | Endpoint | Response | Role/Permission |
|---|---|---|---|
| GET | `/compliance` | `ComplianceRequirement[]` | All authenticated |
| GET | `/compliance?mineId=:id` | `ComplianceRequirement[]` | All authenticated |
| GET | `/compliance/:id` | `ComplianceRequirement` | All authenticated |

`ComplianceRequirement`: `{ id, requirement, mineId, mineName, category, regulationRef, description, frequency, responsiblePerson, dueDate, status, evidence: string[], history: { date, action, by }[] }`.
**Categories**: Safety, Environment, Labour, Equipment, Training, Emergency, Statutory Reporting. **Statuses**: Compliant, Due Soon, Overdue, Non-Compliant.

## Inspections

| Method | Endpoint | Request Body | Response | Role/Permission |
|---|---|---|---|---|
| GET | `/inspections` | — | `Inspection[]` | Corporate Admin, Mine Manager, Safety Officer, Field Inspector, Regulator, `system` |
| GET | `/inspections?mineId=:id` | — | `Inspection[]` | same |
| GET | `/inspections/:id` | — | `Inspection` | same |
| POST | `/inspections` | `{ mineId, inspectionType, inspector, date, checklist: string[] }` | `Inspection` (201) | same |
| POST | `/inspections/:id/observations` | `{ description, category, severity, location, photoCount, timestamp, comments }` | `Observation` with `aiAnalysis` populated by the backend's AI/classification service | same |

`Inspection`: `{ id, mineId, mineName, inspector, inspectionType, date, status, riskLevel, checklist: string[], observations: Observation[] }`.
`Observation`: `{ id, description, category, severity, photoCount, location, timestamp, comments, aiAnalysis: { category, severity, riskScore, recommendation } }`. **`aiAnalysis` is always server-computed** — the frontend only ever renders whatever this field contains.
**Inspection types**: Safety Audit, Statutory Inspection, Environmental Audit, Equipment Check, Routine Walkthrough. **Statuses**: Scheduled, In Progress, Completed.

## Risk Intelligence

| Method | Endpoint | Response |
|---|---|---|
| GET | `/risk` | `RiskScore[]` |
| GET | `/risk/mines/:id` | `RiskScore` |
| GET | `/risk/recurring-issues` | `RecurringIssue[]` |

`RiskScore`: `{ mineId, mineName, score, previousScore, level, trend, contributors: { label, weight }[], history: { month, score }[] }`. **Always server/AI-computed** — never derived client-side.
`RecurringIssue`: `{ id, issueType, category, occurrencesTotal, occurrencesLast3Months, mineId, mineName, contractorInvolved, riskLevel, recommendation }`.

## Contractors

Two audiences share this resource: admin/governance roles browsing all contractors, and a logged-in Contractor viewing their own org (`user.contractorId`).

| Method | Endpoint | Response | Role/Permission |
|---|---|---|---|
| GET | `/contractors` | `Contractor[]` | Corporate Admin, Mine Manager, Safety Officer, Regulator, `system` |
| GET | `/contractors/:id` | `Contractor` | same, or the Contractor themself for their own `contractorId` |
| GET | `/contractors/:id/projects` | `Project[]` | same |
| GET | `/contractors/:id/reports` | `ContractorReport[]` | same |
| POST | `/contractors/:id/reports` | `{ type, mineName, summary }` | Contractor (own org), `system` |
| GET | `/contractors/:id/attendance` | `Attendance[]` | same as projects |
| POST | `/contractors/:id/attendance` | `{ date, workers, present, absent }` | Contractor (own org), `system` |
| GET | `/contractors/:id/safety-requirements` | `SafetyRequirement[]` | same as projects |
| GET | `/contractors/:id/documents` | `ContractorDocument[]` | same as projects |
| POST | `/contractors/:id/documents` | multipart file + `{ type }` | Contractor (own org), `system` |
| GET | `/contractors/:id/risk-notifications` | `RiskNotification[]` | same as projects |
| GET | `/contractors/:id/performance` | `{ safetyCompliance, taskCompletion, inspectionScore, documentation, overall }` | same as projects |

`Contractor`: `{ id, name, primaryMineId, primaryMineName, workers, complianceRate, riskLevel, riskScore, openActions }`.

## Documents (Document Intelligence / OCR)

| Method | Endpoint | Request Body | Response |
|---|---|---|---|
| GET | `/documents` | — | `Document[]` |
| GET | `/documents/:id` | — | `Document` |
| POST | `/documents` | multipart file + `{ mineId }` | `Document` with `status: "Processing"` (202) |

`Document`: `{ id, name, fileType, mineId, mineName, status, uploadedDate, extractedData }`. `status` transitions `Processing` → `Processed` once the backend's OCR/AI pipeline finishes; the frontend polls or expects a push (webhook/SSE — TBD with backend team) to refresh. `extractedData`: `{ documentType, mine, inspectionDate, inspector, observations: string[], highSeverityFindings, suggestedCorrectiveActions: { issue, priority, recommendation }[] }` — **always server-generated**, never fabricated client-side. Suggested corrective actions become real `POST /corrective-actions` calls when a user clicks "Create Corrective Actions".

## Notifications

| Method | Endpoint | Request Body | Response |
|---|---|---|---|
| GET | `/notifications` | — | `Notification[]` |
| GET | `/notifications?sort=-timestamp&limit=N` | — | `Notification[]` |
| GET | `/notifications?read=false` | — | `Notification[]` (for unread count) |
| PATCH | `/notifications/:id` | `{ read: true }` | `Notification` |
| PATCH | `/notifications/mark-all-read` | `{}` | `204` |

`Notification`: `{ id, type, message, timestamp, read, priority }`. **Types**: HIGH RISK, OVERDUE, COMPLIANCE, FLAG, AI ALERT. **Priorities**: LOW, MEDIUM, HIGH.

## Audit Trail

| Method | Endpoint | Response |
|---|---|---|
| GET | `/audit-logs` | `AuditLogEntry[]` |
| GET | `/audit-logs?entity=:id` | `AuditLogEntry[]` scoped to one flag/response/corrective action |

`AuditLogEntry`: `{ id, timestamp, actor, actorType: "user" \| "system", action, entity }`. Read-only, system-recorded — never client-writable.

## AI Copilot (Chats)

| Method | Endpoint | Request Body | Response |
|---|---|---|---|
| GET | `/chats` | — | `Conversation[]` |
| POST | `/chats` | `{}` | `Conversation` (201, empty `messages`) |
| GET | `/chats/:id/messages` | — | `Conversation` with full `messages[]` |
| POST | `/chats/:id/messages` | `{ content }` | Updated `Conversation` — the backend appends the user message, runs it through the real RAG/AI service, and appends the assistant reply (with `sources`) in the same response |
| PATCH | `/chats/:id` | `{ title }` | `Conversation` |
| DELETE | `/chats/:id` | — | `204` |

`Conversation`: `{ id, title, createdAt, messages: Message[] }`. `Message`: `{ id, role: "user" \| "assistant", content, timestamp, sources?: string[] }`. **The frontend's `generateMockReply()` in `chatService.js` is a placeholder only** — the real reply generation (RAG over flags/mines/compliance/risk/contractor data) must happen server-side; `sources` should reference real entity IDs the answer was grounded in.

## Reports

| Method | Endpoint | Request Body | Response |
|---|---|---|---|
| POST | `/reports` | `{ reportType, mineId?, fromDate?, toDate? }` | `{ id, reportType, scope, generatedAt, sections: { label, value }[] }`, or a signed URL / binary for a formatted PDF once the backend owns report rendering |

**Report types**: Mine Compliance Report, Safety Report, Inspection Report, Contractor Performance, Corrective Action Report, Risk Report, Monthly Governance Report. The current frontend renders the JSON summary and offers a browser-print "Download PDF" — once this endpoint returns a real rendered file, swap that button to a direct download link.

## Offline Sync Queue (Field Reporting)

| Method | Endpoint | Request Body | Response |
|---|---|---|---|
| POST | `/sync` | `{ localId, type: "flag" \| "observation" \| "attendance", payload, capturedAt }` | `{ localId, status: "Synced", serverId, syncedAt }` — `syncedAt` is the authoritative server timestamp; `capturedAt` (device time) is preserved only as metadata, never treated as authoritative |

The frontend queues items in IndexedDB (`src/utils/offlineStore.js`) and drains them via `src/services/syncService.js` once connectivity returns; today `type: "flag"` syncs through `POST /flags` directly and the other two mock-resolve. A dedicated `POST /sync` (or per-type endpoints) lets the backend assign authoritative IDs/timestamps and return sync results in bulk.

## Role & Department Permission Matrix

This mirrors the UI-only gates in `src/utils/roles.js`, `src/utils/navigation.js`, and `src/utils/correctiveActionWorkflow.js` — the backend must enforce the real version of each row independently.

| Capability | Permitted |
|---|---|
| See true reporter identity on a confidential flag | Corporate Admin, Safety Officer, Regulator, or `department === system` |
| Submit an official response to a flag | Corporate Admin, Mine Manager, Safety Officer, Regulator, or `department === system` |
| Corrective action workflow transitions | Per the workflow table above |
| View Mines / Compliance (mine-scoped) / Contractors / Risk Intelligence / Reports | Corporate Admin, Mine Manager, Safety Officer, Regulator, or `department === system` |
| View/Create Inspections | Corporate Admin, Mine Manager, Safety Officer, Field Inspector, Regulator, or `department === system` |
| Field Reporting (`/field`) | Corporate Admin, Mine Manager, Safety Officer, Field Inspector, or `department === system` |
| Contractor Portal (`/contractor/*`) | Contractor role only (own `contractorId`), or `department === system` for support/impersonation |
| Everything else (Flags, Responses, Corrective Actions, Documents, AI Copilot, Notifications, Audit Trail, Settings) | All authenticated users |

**System Department members get admin-level access on every row above, regardless of their `role` value.** This is the one override the backend must apply globally.
