# Frontend Agent Guide

This repository is the Next.js web frontend for Atom Suit.

Read [README.md](/home/bibin/websites/atomsuit/frontend/README.md) and [ARCHITECTURE.md](/home/bibin/websites/atomsuit/frontend/ARCHITECTURE.md) for deeper project context.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- TanStack Query
- Axios-based service layer

## Core Frontend Rules

- Follow the current feature-based route structure under `src/app`.
- Prefer feature-local `_components` before moving UI into shared folders.
- Reuse the shared API and service patterns instead of creating one-off fetch utilities.
- Keep types in `src/types` and service logic in `src/services`.

## Multi-Tenant Rules

- Tenant context is derived from the hostname/subdomain.
- Tenant requests are sent with the `X-Tenant` header.
- Reuse:
  - `src/services/api.ts`
  - `src/utils/tenant.ts`
- Do not hardcode tenant routing or duplicate tenant parsing logic in random components.

## File Placement

For a new frontend feature, usually add or update:

- route files in `src/app/(dashboard)` or `src/app/(public)`
- feature-local UI in that route's `_components`
- service file in `src/services`
- related types in `src/types`
- shared components in `src/components` only if reused across multiple features
- tests near the feature or in existing frontend test locations

## Working Conventions

- Use absolute imports with `@/`.
- Reuse the CRUD/base service pattern from `src/services/BaseService.ts` when applicable.
- Match the existing type + service pairing used across modules.
- Prefer existing UI/layout patterns before adding a new one.
- If a feature depends on backend pagination, filters, import/export, or restore behavior, follow the existing service contracts.

## Validation

Run relevant checks before finishing frontend work:

- `npm run test`
- `npm run lint`
