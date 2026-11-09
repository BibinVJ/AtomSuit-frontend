# Atom Suit Frontend

The modern, high-performance frontend for **Atom Suit**, built with **Next.js 15**, **TypeScript**, **TailwindCSS**, and **TanStack Query**.

## 📖 Documentation

- **[Architecture Guide](ARCHITECTURE.md)**: Deep dive into the project structure, design patterns, and technical decisions. **Start here if you are a developer.**
- **[Contributing Guidelines](CONTRIBUTING.md)**: Setup guide, git workflow, and coding standards.
- **[Agent Guide](AGENTS.md)**: Rules (and a short AI startup prompt) for AI-assisted development.
- **[Project Log](PROJECT_LOG.md)**: What was last implemented in this repo.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Locally

```bash
npm run dev
```

### 3. Build for Production

```bash
npm run build
```

## ✨ Key Features

- **Modular Architecture**: Feature-based co-location for scalability.
- **High Performance**:
  - `Next.js` App Router.
  - `TanStack Query` for list-view caching/pagination (via the shared `useDataTable` hook).
  - Dynamic imports for heavy visualizations.
- **Multi-Tenant Ready**: Built-in tenant context and API isolation.
- **Type-Safe**: 100% TypeScript coverage with strict mode.

---

## 🗂️ Module Overview

| Module          | Description                            |
| :-------------- | :------------------------------------- |
| **Inventory**   | Items, Warehouses, Adjustments         |
| **Procurement** | POs, GRNs, Vendor Management           |
| **Sales**       | Orders, Invoices, Customer Management  |
| **Accounting**  | Ledger, Taxes, Journal Entries         |
| **Settings**    | User Roles, Permissions, System Config |

---

## 📄 License

[MIT](LICENSE)
