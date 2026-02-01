# Architecture & Best Practices Guide

## 1. Project Structure

We follow a **Feature-based** or **Domain-driven** structure where possible, combined with Next.js App Router conventions.

```
src/
├── app/                 # Next.js App Router Pages (Routing & Layouts only)
│   ├── [feature]/       # Feature routes (e.g., /sales, /audits)
│   │   ├── page.tsx     # Page Logic & Data Fetching (Client or Server)
│   │   └── layout.tsx   # Feature-specific layout
├── components/          # Reusable UI & Feature Components
│   ├── common/          # Global reusable atoms (Button, Input, Modal)
│   ├── layout/          # Layout specific components (Sidebar, Header)
│   ├── [feature]/       # Feature-specific components (e.g., AuditTable)
├── hooks/               # Custom React Hooks
├── services/            # API Service Layer (Axios)
├── context/             # Global State (Auth, Theme, Tenant)
└── types/               # TypeScript Definitions
```

## 2. Data Fetching Strategy (High Load Ready)

For a high-load multi-tenant application, we recommend moving from **useEffect** to **Stale-While-Revalidate (SWR)** or **TanStack Query**.

**Current (useEffect + useState)**:

- Pros: Simple, no extra deps.
- Cons: No caching, race conditions, waterfalls, manual revalidation.

**Recommended (TanStack Query/SWR)**:

- Pros: Automatic caching, deduplication, background revalidation, optimistic updates.
- **Action**: Migrate `useDataTable` to wrap `useQuery`.

## 3. Best Practices Rules

### A. Imports

Always use absolute imports (`@/`) instead of relative (`../../`).

```typescript
// ✅ Good
import Button from '@/components/ui/Button';

// ❌ Bad
import Button from '../../../../components/ui/Button';
```

### B. Component Design

- **Single Responsibility**: Components should do one thing.
- **Props Interface**: Always define `interface Props` or `[ComponentName]Props`.
- **"Client" vs "Server"**: Mark `'use client'` at the top only when necessary (interactivity/hooks). Leaf components should be client, parent pages can be server (if fetching data server-side).

### C. Multi-Tenancy

- **Tenant Context**: Always access tenant info via `useTenant()` or `getTenantFromBrowser()`.
- **API Isolation**: Ensure `X-Tenant` header is present (handled by `api.ts` interceptor).

### D. Performance

- **Lazy Loading**: Use `next/dynamic` for heavy charts/maps.
- **Debouncing**: Use `useDebounce` for search inputs.
- **Pagination**: Always server-side paginate lists (already implemented in `useDataTable`).

## 4. Coding Standards

- **Naming**: PascalCase for components (`UserProfile.tsx`), camelCase for hooks/functions (`useAuth.ts`, `fetchData`).
- **Types**: No `any`. Use strict interfaces.
- **Exports**: Named exports preferred for utilities, Default exports for Pages/Components.
