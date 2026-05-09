Development notes

1) Install dependencies

   npm install

2) Create a .env file from .env.example and add your Anthropic API key to enable scoring via the proxy:

   cp .env.example .env
   # then edit .env and set ANTHROPIC_API_KEY

3) Start the backend proxy (optional if you don't need AI scoring):

   npm run server

4) Start the Vite dev server:

   npm run dev

The frontend will be available at http://localhost:5173 and the proxy at http://localhost:3000.

Troubleshooting:
- If the scorer fails, confirm your ANTHROPIC_API_KEY is set in .env and the server is running.
- If Vite shows proxy errors for /api, ensure the backend is running on port 3000.
