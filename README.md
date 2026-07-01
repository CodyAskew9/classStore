# ClassCrest

Classroom token economy, store, jobs, and avatar builder.

## Development

From the **repo root**:

```bash
npm install
npm run db:seed   # first time only
npm run dev       # Next.js app at http://localhost:3000
```

The Next.js app includes API routes and serves assets — you do **not** need the legacy Express server for normal development.

**Routing:** UI navigation uses **React Router** (`createBrowserRouter`) with browser history. Route definitions live in `src/router/router.tsx`. View components live in `src/views/`. Next.js only hosts the SPA shell (`src/app/[[...slug]]/page.tsx`) plus `/api/*` and `/assets/*`.

### Legacy stack (optional)

The old Vite + Express setup is still in `client/` and `server/`:

```bash
npm run dev:legacy-server   # Express API on :3001
npm run dev:legacy-client   # Vite client on :5173
```

If you run `npm run dev` from inside `server/` or `client/`, it forwards to the root Next.js dev server.
