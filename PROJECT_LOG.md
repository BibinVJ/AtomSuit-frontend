# Frontend Project Log

What was implemented in the **Atom Suit web frontend**, most recent first. Read the top of this
file to catch up before starting work; append an entry when you finish anything non-trivial.

## How to use

- **Newest on top.** One entry per significant change (feature, pattern change, decision, gnarly
  fix). Skip trivia `git log` already covers well.
- Keep it short; one line of _why_ beats ten of _what_.
- Record significant or hard-to-reverse **decisions here too** (`Type: decision`, with rationale +
  any revisit trigger). No separate decision/ADR files — the log is the record.
- Entry format:
  ```
  ## YYYY-MM-DD — <title>
  - **Type:** feat | fix | refactor | decision | chore | docs
  - **What / Why:** ...
  - **Impact:** breaking changes, follow-ups, new shared components/services
  - **Ref:** commit / PR / branch
  ```

---

# Log

## 2026-09-20 — Fix: sidebar highlighted a parent menu item alongside the current page

- **Type:** fix
- **What / Why:** Opening any report also lit up **All Reports**. `isActive` matched with a bare
  `pathname.startsWith(path)`, so `/reports/trial-balance` matched `/reports` too.
  A sweep of the real menu data found **16 collisions**, not one — the same bug also lit **Quick
  Sale** (`/sales`) whenever you were on **Sales Invoices** or **Sales Orders**, because
  `'/sales-invoices'.startsWith('/sales')` is true.
  Two rules now decide the active item, extracted to `src/layout/navActive.ts`:
  1. **Segment boundary, not bare prefix** — `/sales-invoices` is not inside `/sales`, but
     `/tenants/5` is inside `/tenants`.
  2. **Most specific wins** — a parent entry must not light up when the page has a menu item of its
     own. This is what keeps `/tenants` highlighted on the tenant detail page (nothing more specific
     exists) while `/reports` goes dark on `/reports/trial-balance` (which does have its own item).
     Boundary matching alone would not have fixed the reported bug, since `/reports/trial-balance` _is_
     on a segment boundary under `/reports`; the specificity rule is the part that does it.
- **Also fixed by the same change:** the submenu auto-open effect uses `isActive`, so on a report
  page both the report's own category _and_ the group holding All Reports previously matched, and
  whichever ran last won — the wrong group could expand.
- **Impact:** verified against all **52** real sidebar paths — every one now highlights exactly one
  item, and `/tenants/acme` still highlights Tenants. The rule lives in its own module so the
  component and its test share one implementation rather than a copy. 8 new tests
  (**75 total**, was 67). `tsc --noEmit` and lint clean. Build not run (per user preference).
- **Ref:** develop

## 2026-09-06 — Reports sidebar grouped by category; 3 new reports; test expansion

- **Type:** feat/test
- **Sidebar:** Reports moved out of one long submenu into its own **Reports section with a
  collapsible submenu per category** — Financial, Sales, Purchase, Inventory, plus All Reports.
  Uses the existing section pattern (a new `reports` menuType) rather than adding nested-submenu
  support to the sidebar, which would have touched navigation for every other menu.
- **New report pages:** Customer Balances, Vendor Balances, Outstanding GRNs (see the backend log
  for which of the requested reports already existed under another name). Outstanding GRNs renders
  each GRN with its pending lines nested beneath it.
- **Removed a dead link:** the sidebar briefly pointed at `/reports/ledger-summary`, which does not
  exist — Trial Balance already is the ledger summary, so the link was removed rather than a
  duplicate report built.
- **Fixed:** `stock-valuation` and `low-stock` were missed by the earlier permission-gating pass
  (their `useReport` calls were single-line and the edit script's pattern didn't match), so they
  still fetched before the access check. Caught by a test asserting the service is never called
  without permission.
- **Tests:** `ReportPages` (8) covers P&L profit vs loss labelling, aging columns driven by the
  API's bucket map, customer balances net-of-on-account, outstanding GRNs incl. the empty state, and
  low-stock out-of-stock vs low; `ReportService` (17) pins every endpoint path, envelope unwrapping,
  param passing and error propagation. **67 total** (was 42), 9 suites.
- **Impact:** `tsc --noEmit` clean; lint clean apart from the 3 pre-existing warnings. Build not run
  (per user preference).
- **Still thin:** purchase/sales document screens, master-data screens and the settings module have
  no component tests.
- **Ref:** develop

## 2026-09-05 — Reports module UI (13 reports)

- **Type:** feat
- **What / Why:** New `/reports` module consuming the backend reporting endpoints — an index page
  grouped by audience plus 11 report pages (Trial Balance, P&L, Balance Sheet, Tax Summary, Sales &
  Purchase Registers, Receivables & Payables Aging, Stock Valuation, Expiry, Low Stock), and a
  Reports group in the sidebar. New `src/types/Report.ts` and `src/services/ReportService.ts`
  (read-only, so no `createBaseService` CRUD contract to extend).
  - Shared `ReportShell` gives every report the same frame and the same loading / error / empty
    states; `PeriodFilter` / `AsAtFilter` and a `reportTable` class set keep 13 pages looking like
    one product instead of 13 variations.
  - **The client renders the backend's numbers and never recomputes a total** — no summing, no
    re-deriving, per the money-math rule.
  - Reports that can indict the data say so loudly: an unbalanced trial balance and an unbalanced
    balance sheet render a red banner explaining the _ledger_ is wrong (not the report), the tax
    summary warns not to file when the per-rate split doesn't reconcile, and the expiry report warns
    when "allow selling expired items" is on.
  - Aging bucket columns are driven by the API's `buckets` map, so the UI can't drift from how the
    server actually bucketed.
- **Two bugs found by the tests, both fixed:**
  1. **`currentMonthRange()` returned the wrong period.** It used `toISOString()`, which converts to
     UTC first — anywhere behind UTC the 1st of the month came back as the last day of the previous
     month (observed: 2026-08-31 → 2026-09-29 instead of Sept 1–30). Now formats in local time.
  2. **Reports fetched before the permission check.** The hook fired, then the component returned
     Access Denied — so an unauthorised viewer still triggered a request that could only 403.
     `useReport` gained an `enabled` flag, wired through all 11 pages.
- **Impact:** 9 new tests (**42 total**, was 33). `tsc --noEmit` clean; lint clean apart from the 3
  pre-existing warnings. Build not run (per user preference).
- **Ref:** develop

## 2026-09-05 — Tenant detail page with module toggles; plan module configuration

- **Type:** feat
- **What / Why:** Modules had no UI at all — the API existed but nothing consumed it.
  - **New `/tenants/[id]` detail page.** Clicking a tenant (new view action on `TenantTable`) opens
    a summary card plus every module and integration with a toggle. Each row shows where the
    tenant's access came from (From plan / Granted / Purchased) and warns that turning off a
    plan-granted module is temporary — the next plan sync restores it. Toggling is optimistic with
    rollback on failure, re-reads afterwards so `source` reflects what the server recorded, and is
    disabled without the `manage-module` permission.
  - **Plan modules.** New shared `PlanModulesField` used by both the add and edit plan modals
    (they're modals, not pages), grouping modules and integrations as checkboxes; the edit modal
    seeds from `plan.modules`. Flags globally-inactive modules so an admin doesn't bundle something
    tenants can't actually use.
  - New `src/types/Module.ts` (+ barrel) and `src/services/ModuleService.ts`. The service is
    deliberately _not_ built on `createBaseService` — modules aren't tenant CRUD, they're a fixed
    catalogue plus per-tenant enable/disable, so the endpoints don't fit the base contract.
- **Shared `Switch` made accessible.** It rendered a bare `div`: no role, no ARIA, no keyboard
  access — invisible to screen readers and unreachable by Tab. Now carries `role="switch"`,
  `aria-checked`, `aria-disabled`, `tabIndex`, Space/Enter handling and an optional `ariaLabel`.
  Additive and backwards compatible (visuals unchanged), and it's what makes the toggles testable.
- **Impact:** 5 new tests (**33 total**, was 28). `tsc --noEmit` and lint clean; build not run (per
  user preference).
- **Note:** tenant-side feature hiding is not built — `ModuleService.getMyModules()` wraps the
  existing `/my-modules` endpoint ready for it, but nothing consumes it yet because no vertical UI
  exists to hide. That lands with the first vertical module.
- **Correction logged for honesty:** during this change a `git checkout` on `src/types/index.ts`
  discarded 6 uncommitted barrel exports from earlier work; they were identified via `tsc` and
  restored (`./Error`, `./SalesOrder`, `./DeliveryNote`, `./SalesInvoice`, `./CreditNote`,
  `./CustomerPayment`). Both repos still have large uncommitted trees — worth committing.
- **Ref:** develop

## 2026-09-05 — Credit/Debit note lists: show the source invoice

- **Type:** feat
- **What / Why:** Neither list showed which invoice a note was raised against, so you had to open
  each one to find out. Added an **Invoice #** column to `CreditNoteTable` (the linked sales
  invoice) and `DebitNoteTable` (the purchase invoice), placed right after the note number where the
  linkage reads naturally.
  **Frontend-only change** — both APIs already eager-load the relation (`salesInvoice` /
  `purchaseInvoice`), both resources already expose it, and both TS types already declared it. The
  data was being fetched and thrown away.
  Direct notes (no parent invoice) are a supported flow, so they render a muted em-dash with a
  title tooltip rather than an empty cell. The `?.`/`??` chain covers every shape the API can return
  for an unset relation (absent, `null`, `[]`, or an object with a null `invoice_number`) — a
  backend test (`CreditNoteResourceNullInvoiceTest`) pins that a direct note serialises safely.
  Skeleton/empty-state `colSpan` and `SkeletonTable columns` bumped 7 → 8 to match.
- **Impact:** no API change. `tsc --noEmit` and lint clean, tests 28/28. Build not run (per user
  preference). Column is not sortable: the only sortable backing column is `sales_invoice_id` /
  `purchase_invoice_id`, which would order by an opaque id rather than the invoice number.
- **Ref:** develop

## 2026-09-05 — Credit note: don't send warehouse_id as 0

- **Type:** fix
- **What / Why:** The backend now requires `warehouse_id` on a credit note once any line returns
  stock (see the backend log — credit notes were never restocking at all). The create page sent
  `Number(warehouseId)`, which is `0` when nothing is picked, so the API answered _"the selected
  warehouse is invalid"_ instead of _"the warehouse field is required"_. It now omits the key when
  unset. `CreditNotePayload.warehouse_id` widened to optional to match.
  No other change was needed: the page already renders a per-line "return stock" checkbox and sends
  `items[].is_stock_returned` (the backend was dropping it), and the Warehouse field was already
  marked required and already surfaces `errors.warehouse_id` inline.
- **Impact:** `tsc --noEmit` clean, tests 28/28. Build not run (per user preference).
- **Ref:** develop

## 2026-09-05 — Conversion screens: pick which lines carry over

- **Type:** feat/fix
- **What / Why:** Converting an order to its child document forced **every** parent line into the
  new document. If one line couldn't be fulfilled — the reported case: an SO line for a product
  with no stock on hand — there was no way to leave it out. Setting its quantity to 0 was rejected
  with _"The dispatched quantity field must be at least 0.0001"_, so a single unfulfillable line
  blocked delivering everything else on the order.
  Each conversion screen now has a **checkbox per line** (plus a select-all in the header):
  SO → Delivery Note, SO/DN → Sales Invoice, PO → GRN, and PO/GRN → Purchase Invoice.
  Unticked lines are **omitted from the payload entirely** rather than sent with quantity 0 — the
  API already accepts a subset of the parent's lines, and leaves the order `PARTIALLY_DELIVERED` /
  `PARTIALLY_RECEIVED` so the rest can be converted later. Checkboxes appear in conversion mode
  only; direct-entry mode already has add/remove row buttons.
  - Totals and the tax breakdown now sum the **selected** lines only, so the figures on screen match
    what will be saved.
  - Submitting with nothing ticked is blocked client-side with a clear toast, instead of a bare
    `items` 422.
  - **Validation errors are re-keyed to the right row.** Laravel indexes item errors by position in
    the submitted array; once a line is unticked that no longer matches the row on screen, so
    `items.0.quantity` could red-border the wrong line. New `src/utils/conversionSelection.ts`
    (`selectedRowIndices`, `remapItemErrorIndices`) maps payload positions back to row indices.
  - Shared `Checkbox` gained an optional `ariaLabel` prop (backwards compatible) so the unlabelled
    cells have accessible names.
- **Impact:** no API change — backend already supported subset conversion (tests pinning it added in
  the backend repo). New shared util + 7 tests (**28 total**, was 21). `tsc --noEmit` and `lint`
  clean; `npm run build` not run at the user's request.
- **Ref:** develop

## 2026-07-26 — Order create: send chosen status (draft flow) — SO & PO

- **Type:** fix
- **What / Why:** Both order-create pages had a Status dropdown (Draft/Sent/Confirmed) but never
  sent `status` in the payload, so it was cosmetic. PO harmlessly defaulted to DRAFT server-side;
  SO was forced to CONFIRMED (see backend log), so a sales order jumped straight past draft and the
  view page's Send/Confirm buttons never appeared. Now both create payloads include `status`, so the
  dropdown drives the initial state and the existing draft→send→confirm flow works. (Backend now
  defaults SO to DRAFT + accepts the status.) The DN/SI conversion screens are also fixed by the
  backend adding delivered/invoiced quantities to the SO/DN item resources — the "all items already
  delivered" toast with empty items is resolved.
- **Impact:** tsc + eslint clean.
- **Ref:** develop

## 2026-07-26 — Frontend validation pass: unbreak the build, close gating gaps, align docs

- **Type:** fix/chore/docs
- **What / Why:** Full frontend analysis mirroring the backend validation pass. Findings and fixes:
  1. **Production build was broken.** `VoidSaleModal` (sales/[id]) and `CancelSubscriptionModal`
     (subscriptions) were imported but never existed → `next build` failed. Created both as
     confirmation modals (shared `Modal` + `Button`, service call, toast, `isApiError`).
  2. **Second build blocker:** dead `taxBreakdown` `useMemo` in `debit-notes/[id]` (unused
     `taxBreakdown`/`taxMap`/`item`) failed the lint stage of `next build`. Removed it (and the
     now-unused `useMemo` import). `npm run build` now passes end-to-end.
  3. **Broken Jest suites fixed.** `jest.mock('@/hooks/useTenant')` failed because route-group
     parens (`(dashboard)`) break next/jest's `@/` resolution — added an explicit
     `moduleNameMapper` (`^@/(.*)$` → `<rootDir>/src/$1`). Updated 2 stale TenantLoading assertions
     to the redesigned copy. **21/21 tests pass** (was 12 passing, 2 suites failing to run).
  4. **Missing page-level permission guards.** `purchase-orders/create`, `sales-orders/create`,
     and legacy `sales/create` were URL-reachable without a guard (only conditional UI). Added the
     `if (!hasPermission('create-…')) return <Access Denied>` guard used by the other create pages.
  5. **Sidebar:** relabelled the legacy `/sales` item from "Sales" → "Quick Sale" (it sat inside
     the "Sales" group next to the new Sales Invoices flow — confusing overlap).
  6. **Types barrel:** exported `./Error` (was defined but not re-exported from `@/types`).
- **Docs aligned with reality** (AGENTS.md, ARCHITECTURE.md, README.md): data fetching is a _mix_
  — TanStack Query in list views via `useDataTable`, `useEffect`+axios in create/view/edit (docs
  claimed "TanStack Query, not useEffect"); `middleware.ts` does tenant-domain routing, not a
  "no-op"; removed the "no form library / React Hook Form (Recommended)" contradiction (no form
  lib — controlled state); Credit Note UI is built (docs listed it as absent); test count updated.
- **Impact:** `npm run build`, `npx tsc --noEmit`, `npm run lint`, `npm run test` all green.
- **Ref:** develop

## 2026-07-20 — Sales flow frontend built (mirrors the purchase flow)

- **Type:** feat
- **What / Why:** All five sales ledger modules were missing on the frontend. Built them as mirrors
  of the purchase modules: Sales Order (list/create/view/edit + table), Delivery Note, Sales
  Invoice, Credit Note, Customer Payment (list/create/view + table each) — 21 pages + 5 services +
  5 types (+ types barrel) + 5 sidebar links.
- **Conversion chain** wired: SO → DN (`?sales_order_id=`) → SI (`?sales_order_id=` / `?delivery_note_id=`)
  → Credit Note (`?sales_invoice_id=`); Customer Payment (`?customer_id=`, loads open SIs). SI table
  has Record Payment + Create Credit Note actions.
- **Type-driven differences from purchase** (correct, not omissions): Sales Invoice has no
  warehouse/reference_number and uses `invoice_date`; Delivery Note collapses GRN's received/accepted
  into one `dispatched_quantity`; Credit Note uses `returned_quantity` + `credit_note_date`; credit
  note keeps the improved debit-note UX (invoice picker, read-only tax, row-level validation errors,
  price cap); customer payment keeps the vendor-payment fixes (param via useEffect, hide paid SIs).
- **Impact:** all new files eslint-clean (0 errors) and tsc-clean; full `tsc --noEmit` shows only the
  two pre-existing unrelated errors (sales VoidSaleModal, subscriptions CancelSubscriptionModal).
  Built via 5 parallel sub-agents mirroring each purchase module; backend parity done in the backend repo.
- **Ref:** develop

## 2026-07-20 — Debit note: show price-ceiling validation error on the price input

- **Type:** fix
- **What / Why:** Backend now rejects a debit-note unit price above the invoiced price
  (`items.{i}.unit_price`). Wired that error to the per-row price input (red border + inline
  message), same pattern as the quantity field.
- **Ref:** develop

## 2026-07-20 — Debit note: tax shown read-only (derived), matching the PI screen

- **Type:** fix
- **What / Why:** Per-item tax was an editable tax-group `Select` on the debit-note screen —
  inconsistent with the PI create screen (where tax is auto-derived from the item and shown
  read-only) and wrong for a return (tax should mirror the item / invoice snapshot, not be
  re-chosen). Replaced the Select with a read-only rate breakdown; `tax_group_id` is still
  auto-populated from the selected item / invoice line, so nothing is lost.
- **Ref:** develop

## 2026-07-19 — Fix: vendor pre-select (SSR param) + inline debit-note validation errors

- **Type:** fix
- **What / Why:**
  1. The vendor-payment page read `?vendor_id=` in a `useState` initializer, which runs during
     server rendering where `useSearchParams()` is empty — so the vendor never pre-selected. Moved
     it to a client `useEffect` that sets `vendorId` from the param on mount.
  2. Debit-note quantity errors were only shown as a generic block. Backend now returns
     row-indexed keys (`items.{i}.quantity`), and the quantity input renders `error`/`hint` — so the
     offending row gets a red border with the message inline.
  - Also cleaned pre-existing lint in the vendor-payment page (unused `getSetting`, `any` casts).
- **Impact:** both pages eslint-clean (0 errors) and typecheck clean.
- **Ref:** develop

## 2026-07-19 — Debit note create: vendor → invoice picker, locked warehouse/cost-center

- **Type:** feat/fix
- **What / Why:** You could create a debit note for any item/vendor unrelated to any purchase. Added
  an in-page "Against Invoice" dropdown (populated from the chosen vendor's non-voided invoices).
  Selecting an invoice populates only that invoice's items and auto-fills + locks the warehouse and
  cost center (non-editable). Changing the vendor resets the invoice/items. The existing
  `?purchase_invoice_id=` param flow (from the PI "Create Debit Note" action) reuses the same
  `applyInvoice` path. Selects switched from `defaultValue` to controlled `value`. Backend now also
  rejects returning more stock than is available (see backend log).
- **Impact:** file typechecks clean; eslint 0 errors (1 pre-existing useMemo-deps warning shared by
  sibling create pages).
- **Ref:** develop

## 2026-07-19 — Fix: vendor payment create page (pre-select vendor, hide paid invoices)

- **Type:** fix
- **What / Why:** `vendor-payments/create` didn't read the `?vendor_id=` param from the PI
  "Record Payment" action, so the vendor wasn't pre-selected. Now initialised from
  `useSearchParams()` (matches the pattern in purchase-invoices/create). Also defensively filters
  the allocation list to invoices with a positive outstanding balance, so fully-paid invoices no
  longer appear (backed by the backend `exclude_status` + `paid_amount` fixes).
- **Impact:** vendor auto-selects; paid invoices hidden; per-row allocation already caps at
  outstanding, which is now correct. Verified the file typechecks clean (pre-existing unrelated tsc
  errors in sales/subscriptions remain).
- **Ref:** develop

## 2026-07-17 — Repo documentation baseline

- **Type:** docs
- **What / Why:** Rewrote `AGENTS.md` (self-contained + short AI startup prompt, fixed a stale
  absolute path), added an origin/reality section to `ARCHITECTURE.md` (TailAdmin template
  origin; missing Reports/Journal/Credit-Note UIs; ~zero tests), and started this log.
- **Impact:** No code change. Don't wire features to leftover template components.
- **Ref:** develop

## 2026-07-17 — Purchase flow fix

- **Type:** fix
- **What / Why:** Fixed issues in the purchase flow UI.
- **Ref:** commit `fix: purchase flow fix.`

---

## Recent history (seeded from git, for context)

| Date       | Change                                                  |
| ---------- | ------------------------------------------------------- |
| 2026-07-17 | fix: purchase flow fix                                  |
| 2026-05-04 | fix: bugs and flow in PO, GRN and PI                    |
| 2026-04-08 | feat: purchase modules                                  |
| 2026-03-27 | feat: added PI and GRN                                  |
| 2026-03-18 | feat: added purchase order                              |
| 2026-03-20 | fix: added port support for URL                         |
| 2026-02-01 | feat: implemented password reset; pagination scroll fix |

<!-- Add new entries above the "Recent history" section. -->
