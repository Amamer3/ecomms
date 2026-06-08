# GoMarket (insight-hub)

Customer storefront and role dashboards for the GoMarket grocery marketplace API.

## Stack

- [TanStack Start](https://tanstack.com/start) + React 19
- [TanStack Router](https://tanstack.com/router) (file-based routes)
- [TanStack Query](https://tanstack.com/query)
- Tailwind CSS 4 + Radix UI
- Deployed via Nitro → Vercel preset

## Requirements

- Node.js 20+ (22 recommended)
- npm 10+

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

Set `VITE_API_URL` to your API origin (no path suffix), e.g. `https://grocery-marketplace-bk.onrender.com`. The app calls `{VITE_API_URL}/api/v1`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |

## Docker

Build and run the SSR app with Nitro's `node-server` preset:

```bash
# Copy env and set your API URL (inlined at build time)
cp .env.example .env

# Build and start
docker compose up --build

# Or build manually
docker build --build-arg VITE_API_URL=https://your-api.example.com -t gomarket .
docker run -p 3000:3000 gomarket
```

The app listens on port **3000**. Vercel deploys are unchanged — leave `NITRO_PRESET` unset (defaults to `vercel`).

## Production deployment (Vercel)

1. Connect the repository to Vercel.
2. Set **Environment variable** `VITE_API_URL` for **Production** and **Preview** builds.
3. Build command: `npm run build`
4. Output is handled by the Nitro Vercel preset (`.vercel/output`).

> **Important:** `VITE_*` variables are inlined at **build time**. Changing the API URL requires a redeploy.

## Project structure

```
src/
  routes/          # File-based pages (customer, catalog, dashboards)
  components/      # UI and role-specific shells
  context/         # Auth and cart providers
  lib/api/         # Typed API client
  lib/             # Shared utilities
```

## Roles & workspaces

| Role | Entry |
|------|-------|
| Customer | `/shop`, `/account`, `/cart`, `/checkout` |
| Vendor | `/dashboard/vendor` |
| Courier | `/dashboard/delivery` |
| Admin | `/dashboard/admin` |

Business users sign in at `/dashboard/login`.

## Security notes

- Do not commit `.env` — use `.env.example` as a template.
- Auth tokens are stored in `localStorage` under `randys_tokens`.
- `.vercel/` build output is gitignored; Vercel generates it per deploy.
