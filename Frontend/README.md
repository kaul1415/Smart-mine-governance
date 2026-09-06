# MineGov AI — Frontend (Phase 1)

AI-Based Smart Governance and Compliance Monitoring System for Coal Mines — frontend prototype for Smart India Hackathon.

This is **Phase 1 only**: project foundation, routing, mock auth, the dashboard shell (sidebar + topbar), the mock-data/service-layer architecture, and the main Governance Dashboard. Every other module (Flags, Mines, Compliance, Inspections, Risk, Contractors, Documents, Copilot, etc.) is wired into routing and navigation as a placeholder page labeled with the phase it belongs to, so the app is fully runnable and clickable end-to-end without 404s.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

## Try it

On the login screen, enter any email/password and pick a role from the dropdown, then sign in. Navigation in the sidebar adapts to the role you pick (e.g. a Contractor sees a much shorter menu today — the full Contractor Portal shell arrives in Phase 5).

## What's in Phase 1

- **Folder structure** — `components/`, `pages/`, `layouts/`, `services/`, `context/`, `hooks/`, `data/`, `utils/`, matching the agreed architecture.
- **Routing** — every route from the project brief is registered in `App.jsx`. Built routes render real pages; everything else renders `PlaceholderPage` labeled with its future phase.
- **Mock authentication** — `AuthContext` + `authService`, backed by `localStorage`. Swap `authService.login` for a real `POST /auth/login` call later without touching any component.
- **Dashboard shell** — `DashboardLayout`, role-aware `Sidebar` (`utils/navigation.js`), `Topbar` with notifications/user menu, collapsible on mobile.
- **Reusable components** — `Card`, `Button`, `PageHeader`, `StatCard`, `StatusBadge`, `RiskBadge`, `LoadingState`, `EmptyState`, `ErrorState`, `ProtectedRoute`.
- **API service layer** — `services/api.js` is the only module that knows about `VITE_API_BASE_URL`. Feature services (`mineService`, `flagService`, `riskService`, `correctiveActionService`, `notificationService`, `authService`) all resolve from `data/mockData.js` today (`USE_MOCKS = true` in `api.js`) and switch to real HTTP calls the moment that flag flips — no component changes needed.
- **Mock data** — synthetic mines, flags, responses, corrective actions, risk scores, compliance trend, and alerts in `src/data/mockData.js`. Clearly synthetic; not real government or mine data.
- **Dashboard page** — stat cards, compliance trend + flags-by-category charts (Recharts), high-risk mines, recent flags, recent responses, overdue corrective actions, recent alerts, and a risk-map teaser card (the full Leaflet map is Phase 4).

## Design language

Deep governance-navy palette (`brand-800 #0B2545`) with steel-blue and safety-signage risk colors (not the generic warm-cream/terracotta AI-website look). Public Sans for UI text, IBM Plex Mono only for ticket/action IDs. Flat cards with hairline borders, minimal shadow, no gradients or glassmorphism — see `tailwind.config.js` for the full token set.

## Environment variables

Copy `.env.example` to `.env` and adjust if needed:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

Not required for Phase 1 since `USE_MOCKS` is `true` — this only matters once the backend is live.

## Next phases

See `App.jsx`'s `PLACEHOLDER_ROUTES` for exactly which routes belong to which phase (2 = Governance/Flags/Responses/Audit, 3 = Mines/Compliance/Inspections/Corrective Actions, 4 = Risk/Notifications, 5 = Contractor Portal, 6 = Documents/Copilot/Reports, 7 = Offline field reporting, 8 = polish).
