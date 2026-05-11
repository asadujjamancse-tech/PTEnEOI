# Deployment Guide — PTE 90 Master

## Render (Recommended — Web Service)

This is the primary production deployment method. One Render service runs both the Express server and serves the React build.

### Steps

1. **Push to GitHub** — all changes must be on the `main` branch (or whichever branch Render tracks)

2. **Create Web Service on Render**
   - Go to dashboard.render.com → New → Web Service
   - Connect your GitHub repo: `asadujjamancse-tech/PTEnEOI`

3. **Configure the service**

   | Field | Value |
   |---|---|
   | Root Directory | `pte-app` |
   | Build Command | `npm install; npm run build` |
   | Start Command | `node server/index.js` |
   | Instance Type | Free |

4. **Set Environment Variables** (in Render dashboard → Environment tab)

   | Variable | Description |
   |---|---|
   | `APP_USERNAME` | Login username |
   | `APP_PASSWORD` | Login password |
   | `ANTHROPIC_API_KEY` | For AI essay scoring |
   | `OPENAI_API_KEY` | For AI tutor chat |
   | `OPENAI_MODEL` | e.g. `gpt-4o-mini` |
   | `VITE_SUPABASE_URL` | Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

   > **Important:** `VITE_` variables are baked into the frontend at build time. They must be set BEFORE the build runs. Add them in the Environment tab before the first deploy.

5. Click **Deploy** — Render will install, build, and start automatically.

### How it works on Render

```
Render starts: node server/index.js
  │
  ├── Express listens on process.env.PORT (Render sets this automatically)
  ├── Serves dist/ as static files (the built React app)
  ├── /api/* routes are handled by Express
  └── All other routes return dist/index.html (SPA fallback)
```

### Re-deploying

Any push to the tracked branch triggers an automatic redeploy. You can also click **Manual Deploy** in the Render dashboard.

---

## GitHub Pages (Frontend Only — Limited)

The repo has a `.github/workflows/deploy-pages.yml` workflow that deploys just the React build to GitHub Pages. This is useful for sharing the UI, but:

- **No backend** — AI scoring, login, and server-side features won't work
- **No Supabase** — Notes and Video Library won't save (VITE_ vars not set in workflow)

To make GitHub Pages work fully, add secrets in GitHub repo Settings → Secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

And update the workflow to pass them as env vars during build.

---

## Local Development

```bash
# Terminal 1 — Express backend
npm run server
# Runs on http://localhost:3000

# Terminal 2 — Vite dev server
npm run dev
# Runs on http://localhost:5173
# Proxies /api/* to localhost:3000
```

Vite's proxy config (in `vite.config.js`) forwards all `/api` requests to Express, so the frontend always uses the same URL regardless of environment.

---

## Environment Variable Reference

| Variable | Required | Where used | Notes |
|---|---|---|---|
| `APP_USERNAME` | Yes (if auth enabled) | Server | Leave blank to disable login |
| `APP_PASSWORD` | Yes (if auth enabled) | Server | Leave blank to disable login |
| `ANTHROPIC_API_KEY` | No | Server | AI scoring won't work without it |
| `OPENAI_API_KEY` | No | Server | AI tutor won't work without it |
| `OPENAI_MODEL` | No | Server | Defaults to `gpt-4o-mini` |
| `VITE_SUPABASE_URL` | No | Frontend (build time) | Notes/videos won't save without it |
| `VITE_SUPABASE_ANON_KEY` | No | Frontend (build time) | Notes/videos won't save without it |
| `PORT` | Set by Render | Server | Defaults to 3000 locally |
