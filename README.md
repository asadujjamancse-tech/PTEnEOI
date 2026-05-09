# PTE App — Developer Guide

This repository contains a small React + Vite application designed to help students practise for PTE Academic. It includes:

- A Vite-powered frontend in `src/` (React components)
- A tiny Express proxy in `server/index.js` used to forward scoring requests to an AI API (Anthropic) so API keys are kept on the server side

Quick start (development):

1. Install dependencies

   npm install

2. Create a `.env` file from the included example and set your Anthropic API key if you want scoring to work:

   cp .env.example .env
   # Edit .env and set ANTHROPIC_API_KEY=your_key_here

3. Start the backend proxy (optional if you don't need AI scoring):

   npm run server

4. Start the Vite dev server:

   npm run dev

Open the app at http://localhost:5173

Project structure (important files):

- `src/main.jsx` — application entry. Renders the main app and shows an AppSwitcher.
- `src/PTEMaster.jsx` — the main UI component with tabs: Priority Map, AI Scorer, Score Tracker, and Question Bank. This file is heavily commented to help beginners.
- `server/index.js` — Express proxy that forwards `/api/score` requests to Anthropic; set `ANTHROPIC_API_KEY` in `.env` to enable.

Notes for contributors:
- Do not commit secrets to the repo. Use `.env` and `.gitignore` (already configured).
- Keep UI-only changes in `src/`. Long-term, consider splitting `PTEMaster.jsx` into smaller components for easier maintenance.
# PTE 90 Master (local dev)

This is a minimal Vite + React scaffold that hosts the `PTEMaster` UI. It also includes a tiny Express proxy server to forward scoring requests to Anthropic (so your API key stays on the server).

Quick start (macOS / zsh):

1. Install dependencies

```bash
cd ~/Downloads/pte-app
npm install
```

2. Create an `.env` in the project root with your Anthropic API key (optional for UI testing)

```bash
cp .env.example .env
# edit .env and replace the key
```

3. Run the proxy server (in one terminal)

```bash
npm run server
```

4. Run the Vite dev server (in another terminal)

```bash
npm run dev
```

Open http://localhost:5173 in your browser. The UI will call `/api/score` which is proxied to the Express server on port 3000.

Notes
- Do NOT put your Anthropic key in client-side code. Keep it in `.env` and only on the server.
- If you don't have an Anthropic key, you can still test the UI; scoring will return an error but the rest of the app works.
