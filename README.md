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

**Routing:** UI pages use the **Next.js App Router** under `src/app/`. View components live in `src/views/`. API routes are under `src/app/api/`; static assets under `src/app/assets/`.

### Legacy stack (optional)

The old Vite + Express setup is still in `client/` and `server/`:

```bash
npm run dev:legacy-server   # Express API on :3001
npm run dev:legacy-client   # Vite client on :5173
```

If you run `npm run dev` from inside `server/` or `client/`, it forwards to the root Next.js dev server.

### Avatar sprite atlas

Avatar layers are packed into a single WebP sprite sheet (`assets/avatar-atlas/`) so each composed avatar loads **one cached image** instead of ~8 separate PNGs. The atlas rebuilds automatically on `npm run dev` when PNGs change, or manually:

```bash
npm run build:atlas
```
