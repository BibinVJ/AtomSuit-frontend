# Frontend Agent Guide

This repository is the **Next.js web frontend for Atom Suit** — the web ERP UI (admin + tenant
dashboards) that consumes the Laravel API. Read this file, then [`ARCHITECTURE.md`](ARCHITECTURE.md)
and [`CONTRIBUTING.md`](CONTRIBUTING.md).

> **Origin note:** this app is built on the **TailAdmin** free Next.js template (the package is
> still named `free-nextjs-admin-dashboard`). Much of `src/components/{ecommerce,calendar,charts,
videos,example,home,tables}` is leftover template code — the ERP app lives under
> `src/app/(dashboard)`. Prefer the ERP patterns over template leftovers, and don't wire new
> features to demo components.

## AI startup prompt (paste at the start of an AI session)

```
You are working on the Atom Suit FRONTEND — a Next.js 15 (App Router) + React 19 + TypeScript +
Tailwind v4 + TanStack Query web UI for a multi-tenant ERP. It's built on the TailAdmin
template; the ERP lives under src/app/(dashboard). Read AGENTS.md, ARCHITECTURE.md, and the
recent PROJECT_LOG.md entries first (so you don't undo or duplicate recent work). Rules:
1. The BACKEND owns all business logic and math — never compute totals/tax/stock here; send
   inputs and render the backend's numbers.
2. Feature structure: route under src/app/(dashboard)/<feature> with colocated _components; a
   service in src/services extending createBaseService (BaseService.ts); types in src/types
   (+ barrel index). Reuse src/services/api.ts — never write one-off axios/fetch calls.
3. Data fetching via TanStack Query (not useEffect). Use `@/` absolute imports. Respect dark
   mode and the shared components in src/components/{common,ui,form}.
4. Multi-tenancy: api.ts sends `Authorization: Bearer` + `X-Tenant` (from src/utils/tenant.ts).
   Don't duplicate tenant parsing. Auth is client-side (token in localStorage/sessionStorage);
   the real gate is AuthProvider + hasPermission(), not middleware.ts (a no-op).
5. Authorize UI with permissions: hasPermission('name'), not roles.
NOT built yet — don't assume: AI assistant, a Reports module, Journal Entry UI, Credit Note UI
(only Debit Note exists), meaningful test coverage.
Before finishing: npm run lint · npx tsc --noEmit · npm run test · npm run build. Add tests, and
append an entry to PROJECT_LOG.md (newest on top: date, type, what/why, impact, ref).
```

## Stack

- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS v4
- TanStack Query (server state) + React Context (global UI/auth/tenant/settings state)
- Axios service layer (`src/services/api.ts`) — no form library; `react-select`, `flatpickr`,
  `apexcharts`, `lucide-react`, `sonner` (toasts)

## Core frontend rules

- Follow the feature-based route structure under `src/app/(dashboard)` and `(public)`.
- Prefer feature-local `_components` before promoting UI into shared folders.
- Reuse the shared API/service patterns instead of one-off fetch utilities.
- Keep types in `src/types` (with the barrel `index.ts`) and service logic in `src/services`.
- Data fetching uses **TanStack Query**, not `useEffect`.
- Server-side pagination is mandatory for list views; use `useDebounce` for search and
  `next/dynamic` for heavy visual components (charts/maps).

## Multi-tenant rules

- Tenant context is derived from the hostname/subdomain via `src/utils/tenant.ts`
  (`extractTenant`, `getTenantFromBrowser`). Reserved subdomains (www, api, admin, …) are
  central.
- Tenant requests carry the **`X-Tenant`** header — added centrally in `src/services/api.ts`.
- Do not hardcode tenant routing or duplicate tenant parsing in components. Use `TenantProvider`
  / `useTenant`.

## Auth

- Client-side. `middleware.ts` is a deliberate no-op. The gate is `AuthProvider` (verifies via
  `GET /profile`, redirects, listens for the axios 401 `logout` event) exposing `hasPermission`.
- Token stored in `localStorage`/`sessionStorage`. Password reset is OTP-based.
- Route guards are components (`PrivateRoute`, `PublicRoute`), not middleware.

## File placement (typical new feature)

- route files under `src/app/(dashboard)/<feature>` (`page.tsx`, `[id]/page.tsx`,
  `create/page.tsx`, `[id]/edit/page.tsx`)
- feature-local UI in that route's `_components`
- a service in `src/services` (extend `createBaseService` from `BaseService.ts`)
- related types in `src/types` (+ export from `index.ts`)
- shared components in `src/components` **only** if reused across multiple features
- tests colocated (e.g. `__tests__` beside the feature)

## Working conventions

- Absolute imports with `@/`.
- Reuse the `BaseService` CRUD contract (list/get/create/update/delete/restore/export/import/
  downloadSample) and the shared `QueryParams`. Wrap it and add feature-specific methods (see
  `SaleService.ts`).
- Match the existing type + service pairing used across modules.
- Prefer existing UI/layout patterns (`components/common`, `components/ui`, `components/form`)
  before adding a new one. Respect dark mode (`ThemeContext`).

## Known gaps (don't assume these exist)

- **AI assistant / report summarizer:** none.
- **Reports module:** absent (no route, no service).
- **Journal Entry UI:** absent (backend has GL; no web screen).
- **Credit Note UI:** absent (only Debit Note exists on the web).
- **Tests:** only 3 trivial test files — coverage is ~zero. Add tests for what you build.

## Validation (run before finishing)

- `npm run lint`
- `npx tsc --noEmit`
- `npm run test`
- `npm run build`
