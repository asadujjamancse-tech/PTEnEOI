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
