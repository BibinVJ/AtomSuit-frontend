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
