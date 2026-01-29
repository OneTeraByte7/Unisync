# 🚀 ERP · HR · CRM Suite

![Release](https://img.shields.io/github/v/release/OneTeraByte7/ERP-HR-CRM-Suite)
![License](https://img.shields.io/github/license/OneTeraByte7/ERP-HR-CRM-Suite)
![Issues](https://img.shields.io/github/issues/OneTeraByte7/ERP-HR-CRM-Suite)
![Last Commit](https://img.shields.io/github/last-commit/OneTeraByte7/ERP-HR-CRM-Suite)
![Top Language](https://img.shields.io/github/languages/top/OneTeraByte7/ERP-HR-CRM-Suite)

An integrated ERP suite with HR and CRM modules — built with a Vite + React frontend and a Node.js/Express backend. Includes ready-made pages for accounting, inventory, HR, CRM, suppliers and dashboards.

✨ Highlights
- Modular frontend in `client/` (Vite + React)
- Express-based API server in `server/`
- Supabase schema SQL files in `server/supabase/` for quick DB setup
- Component-driven UI with prebuilt pages and routes

Table of Contents
- **Get Started**
- **Project Structure**
- **Local Development**
- **Database / Supabase**
- **API Reference & Routes**
- **Contributing**
- **License**

**Get Started**

Prerequisites
- Node.js (16+ recommended)
- npm or yarn
- Git

Clone the repo

```bash
git clone https://github.com/OneTeraByte7/ERP-HR-CRM-Suite.git
cd ERP-HR-CRM-Suite
```

Install dependencies and run the frontend

```bash
cd client
npm install
npm run dev
# open http://localhost:5173 (default Vite port)
```

Install dependencies and run the backend

```bash
cd server
npm install
# start server (if package.json has scripts, prefer `npm run dev` or `npm start`)
node server.js
# default: http://localhost:3000
```

Environment variables
- Create a `.env` in `server/` (and in `client/` if needed) with keys used by the app. Typical variables:

- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_KEY` — service role or anon key (use appropriate key for server vs client)
- `PORT` — server port (default 3000)

See `server/utils/supabaseClient.js` for exactly which env vars are consumed.

Project Structure (high level)
- `client/` — Frontend app (Vite + React)
  - `src/` — app source
  - `src/components/` — UI components such as `Header.jsx`, `Sidebar.jsx`, `AgentPanel.jsx`
  - `src/pages/` — feature pages (`Dashboard.jsx`, `Inventory.jsx`, `SupplierList.jsx`, `hr/`, `crm/`)
- `server/` — Backend API
  - `routes/` — Express routes (`accounting.js`, `crm.js`, `hr.js`, `supplier.js`, ...)
  - `controllers/` — Controller logic
  - `supabase/` — SQL schema files: [crm_schema.sql](server/supabase/crm_schema.sql), [hr_schema.sql](server/supabase/hr_schema.sql)
  - `utils/` — helpers like `supabaseClient.js` and `controllerUtils.js`

Key files
- Frontend entry: [client/src/main.jsx](client/src/main.jsx)
- App shell: [client/src/App.jsx](client/src/App.jsx)
- Server entry: [server/server.js](server/server.js)
- Supabase schemas: [server/supabase/](server/supabase/)

Database / Supabase
- Use the SQL files under [server/supabase/](server/supabase/) to provision tables and initial schema in your Supabase project.
- Import the `.sql` files via the Supabase SQL editor or using the CLI.

API Reference & Routes
- The `server/routes/` folder declares the HTTP endpoints. Open the files to see available endpoints and expected payloads.

Deployment
- Frontend: Build with `npm run build` from `client/` and deploy the `dist/` output to any static host (Netlify, Vercel, Cloudflare Pages, S3).
- Backend: Deploy `server/` to any Node host (Heroku, Render, DigitalOcean App Platform) and set env vars.

Development tips
- Use separate Supabase projects for development and production.
- Keep server secrets out of the frontend. Use a server-side proxy for privileged Supabase operations.
- Run frontend and backend concurrently (or use `concurrently` / `npm-workspaces` if desired).

# ERP Operations Center (React + Vite)

This client powers the ERP Operations Center UI. It’s a React 19 + Vite application styled with Tailwind, featuring:

- **Dashboard** with live summaries for suppliers, buyers, inventory, quality and accounting.
- **Suppliers & Buyers** management with CRUD forms and search filters.
- **Inventory** tracking, buy/sell adjustments, analytics and transaction history (with graceful fallbacks when history logging is not enabled).
- **Quality** control module for inspections with status tracking and scoring.
- **Accounting** workspace for receivable/payable entries, cashflow snapshots and payment tracking.
- **Reports** page with Recharts-based visualisations.

## Getting started

```powershell
# install dependencies
npm install

# start the development server
npm run dev

# run lint checks
npm run lint
```

> ℹ️ Vite automatically picks a free port if `3000` is already in use. Check the terminal output to see the active URL.

## Required Supabase tables

Backend APIs expect the following tables (all lower-case) in Supabase. Each table should include `id uuid DEFAULT gen_random_uuid() PRIMARY KEY`, timestamp columns (`created_at` default `now()` and optional `updated_at`) and the listed fields:

| Table | Purpose | Key fields |
|-------|---------|------------|
| `supplier` | Supplier directory | `supplier_name`, `contact_name`, `email`, `phone`, address fields |
| `buyer` | Buyer / customer records | `buyer_name`, `company_name`, `contact_name`, contact info, `credit_limit`, `payment_terms`, `notes` |
| `inventory` | Stock catalogue | `item_name`, `sku`, `quantity`, `unit_cost`, `reorder_level`, `location`, `description` |
| `inventory_transactions` *(optional but recommended)* | History for buy/sell adjustments | `inventory_id` (FK), `type` (`BUY`/`SELL`), quantity and cost snapshots, `note` |
| `quality_checks` | Quality inspections | `title`, `status`, `owner`, `location`, `score`, `score_max`, `due_date`, `completed_at`, `notes` |
| `accounting_entries` | Receivables & payables | `entry_type` (`RECEIVABLE`/`PAYABLE`), `entity_name`, `reference`, `amount`, `currency`, `status`, `due_date`, `paid_at`, `notes` |

If a table is missing, the backend responds gracefully with helpful messages so the UI remains usable while you finish the setup.

### CRM suite additions

The CRM module introduces five new tables. Run `server/supabase/crm_schema.sql` in the Supabase SQL editor (or wire it into your migrations) to provision them with sensible defaults, indexes, row-level security, and timestamp triggers:

| Table | Purpose | Key fields |
|-------|---------|------------|
| `crm_leads` | Prospect pipeline | `name`, `company`, contact fields, `status`, `source`, `owner`, `value`, `notes` |
| `crm_deals` | Sales opportunities | `title`, `stage`, `value`, `probability`, `close_date`, `lead_id`, `organization_id`, `owner`, `notes` |
| `crm_contacts` | People at organizations | `full_name`, `email`, `phone`, `role`, `organization_id`, `owner`, `notes` |
| `crm_organizations` | Accounts / companies | `name`, `industry`, `size`, `website`, `phone`, `status`, `owner`, `notes` |
| `crm_notes` | Activity timeline | `subject`, `note`, `owner`, `related_type`, `related_id` |

> ✅ The script enables RLS with permissive policies for the `authenticated` role—tighten them to match your production rules.

## Tech stack highlights

- React 19 with the React Compiler enabled.
- Vite (rolldown flavour) for the dev server and bundling.
- Axios for API calls, lucide-react for icons, Recharts for data visualisations.
- Tailwind utility classes for layout and theming.

Happy shipping! ✨

Contributing
- Fork the repo and open a PR against `main`.
- Keep changes focused and add short, descriptive commits.
- Follow existing code style (JSX/React conventions) and lint rules if present.

Support / Issues
- Open an issue on the repository for bugs, feature requests, or help.

License
- Check the `LICENSE` file in the repo. If none exists, add one (MIT recommended for open source).

Thanks for using this project! ❤️

If you'd like, I can also:
- Add a `Dockerfile` + `docker-compose.yml` for local dev
- Add GitHub Actions CI for linting/testing
- Generate a more detailed API doc from the `server/routes/` files
