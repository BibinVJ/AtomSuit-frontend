# Architecture & Best Practices Guide

> **Why this file exists?**
> This document is the **Single Source of Truth** for technical decision-making in this project. It is intended for both new developers onboarding to the codebase and existing team members to ensure consistency.

## 1. Tech Stack Overview

- **Framework**: Next.js 15 (App Router), React 19
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **State/Caching**: TanStack Query (React Query) for list/table views; React Context for
  global auth/tenant/settings/UI state
- **Forms**: no form library — forms use controlled React state + local validation, with the
  backend as the authoritative validator (errors surfaced per field)

## 2. Project Structure (Co-location First)

We follow a **Feature-based Co-location** strategy. Everything related to a feature stays with that feature until it needs to be shared.

```
src/
├── app/
│   ├── [feature]/                 # Feature Route (e.g., /sales, /audits)
│   │   ├── _components/           # ✅ CO-LOCATED COMPONENTS (Private to this feature)
│   │   │   ├── SalesTable.tsx
│   │   │   └── CreateOrderModal.tsx
│   │   ├── page.tsx               # Entry point
│   │   └── layout.tsx             # Layout
├── components/                    # shared components ONLY
│   ├── common/                    # Global atoms (Button, Input, Modal)
│   ├── layout/                    # Global layout (Sidebar, Header)
│   └── features/                  # Components shared across MULTIPLE features
├── hooks/                         # Global hooks
└── services/                      # API services
```

## 3. Key Architectural Patterns

### A. Data Fetching

Two patterns coexist — match the sibling module you're extending:

- **List / table views** use **TanStack Query** through the shared `useDataTable` hook (caching,
  background refetch, server-side pagination/sort/search). Don't call `useQuery` directly in a
  list page — go through `useDataTable`.
- **Create / view / edit** screens fetch with `useEffect` + the axios services
  (`createBaseService` / `BaseService.ts`). This is the established convention across every
  document module (purchase + sales chains); keep to it rather than introducing ad-hoc `useQuery`.

**Example (list view, via the shared hook)**:

```tsx
const { data, loading, ...tableProps } = useDataTable(SalesOrderService.list, { ... });
```

### B. Imports (Absolute Paths)

Always use absolute imports (`@/`) to avoid brittle `../../` chains.

```typescript
// ✅ Good
import Button from '@/components/ui/Button';
// ❌ Bad
import Button from '../../../../components/ui/Button';
```

### C. Component Sharing Strategy

1.  **Start Private**: Put components in `src/app/[feature]/_components`.
2.  **Promote Later**: If a component is needed by a _second_ feature, move it to `src/components/features/[domain]`.
3.  **Never Duplicate**: Don't copy-paste code. Refactor to share.

## 4. Multi-Tenancy & Performance

- **Tenancy**: Handled via `X-Tenant` header in `api.ts`.
- **Performance**:
  - Use `next/dynamic` for heavy visual components (Charts, Maps).
  - Use `useDebounce` for search inputs.
  - Server-side pagination is mandatory for list views.

## 5. Coding Standards

- **Naming**: PascalCase for components, camelCase for functions/vars.
- **Types**: Strict TypeScript (no `any`). Define interfaces.
- **Exports**: Named exports for utils, Default for Components/Pages.

## 6. Origin & current reality (be accurate)

- **Template origin:** this app is built on the **TailAdmin** free Next.js template (package
  still named `free-nextjs-admin-dashboard`). Leftover template dirs under
  `src/components/{ecommerce,calendar,charts,videos,example,home,tables}` are **not** part of the
  ERP — don't wire features to them. The ERP lives under `src/app/(dashboard)`.
- **Auth is client-side.** `middleware.ts` handles tenant-domain routing (redirecting restricted
  routes on tenant subdomains) but is **not** the auth gate; `AuthProvider` is the real gate
  (verifies via `GET /profile`, exposes `hasPermission`). Tokens live in
  `localStorage`/`sessionStorage` (not httpOnly cookies) — an XSS trade-off flagged for hardening.
- **Data fetching** is a mix: axios `BaseService` + TanStack Query in list views (via
  `useDataTable`), and axios + `useEffect` in create/view/edit screens (see §3A).
- **Not built yet — don't assume they exist:** AI assistant / report summarizer, a Reports
  module, Journal Entry UI. Test coverage is minimal (3 small suites, 21 tests) despite the Jest
  setup — add tests for new features.
- **Built (not gaps):** the full purchase chain (PO → GRN → PI → Debit Note + Vendor Payment) and
  sales chain (SO → Delivery Note → Sales Invoice → Credit Note + Customer Payment).
