# Architecture & Best Practices Guide

> **Why this file exists?**
> This document is the **Single Source of Truth** for technical decision-making in this project. It is intended for both new developers onboarding to the codebase and existing team members to ensure consistency.

## 1. Tech Stack Overview

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State/Caching**: TanStack Query (React Query)
- **Forms**: React Hook Form (Recommended)

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

### A. Data Fetching (TanStack Query)

We generally avoid `useEffect` for data fetching. Instead, we use **TanStack Query** for:

- Automatic Caching & Background Refetching
- Deduplication
- Loading/Error states

**Example**:

```tsx
// ✅ Correct
const { data, isLoading } = useQuery({
  queryKey: ['sales'],
  queryFn: fetchSales,
});
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
