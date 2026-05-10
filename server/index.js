// Load environment variables from a .env file (for local development).
// This is where you place ANTHROPIC_API_KEY so it is not committed to source control.
require('dotenv').config()

const express = require('express')

// Modern Node has global.fetch. If it's not available, fall back to node-fetch.
const fetch = global.fetch || require('node-fetch')

const app = express()

// Parse JSON request bodies
app.use(express.json())

// ANTHROPIC_API_KEY should be set in your .env file. The server will use
// this key when forwarding scoring requests to the Anthropic API.
// Keep the key secret - do NOT commit it to the repo.
const API_KEY = process.env.ANTHROPIC_API_KEY
if (!API_KEY) console.warn('Warning: ANTHROPIC_API_KEY not set in environment; scoring will fail until you set it in .env')

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || ''
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''
const STRIPE_PRICE_PREMIUM = process.env.STRIPE_PRICE_PREMIUM || ''
const APP_URL = process.env.APP_URL || 'http://localhost:5173'

// A small example proxy route scrapes a public website and returns structured rows.
const INVITATION_ROUNDS_URL = 'https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/invitation-rounds'

// Simple in-memory cache for metadata to avoid repeated fetches
const metaCache = {} // { key: { data, ts } }
const META_TTL = 1000 * 60 * 60 * 12 // 12 hours

const VISA_PAGES = {
  '189': 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189',
  '190': 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-nominated-190',
  '491': 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-work-regional-provisional-491',
}

// GET /api/visa-meta?id=189
// Returns best-effort metadata for a visa page: { lastUpdated, summary, url }
app.get('/api/visa-meta', async (req, res) => {
  try {
    const id = String(req.query.id || '');
    const url = VISA_PAGES[id];
    if (!url) return res.status(400).json({ error: 'unknown id' });

    const cacheKey = id;
    const cached = metaCache[cacheKey];
    if (cached && (Date.now() - cached.ts) < META_TTL) {
      return res.json({ id, url, ...cached.data, cached: true });
    }

    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ error: 'fetch failed' });
    const last = r.headers.get('last-modified') || r.headers.get('date') || null;
    const text = await r.text();
    const decodeHtml = (value) => value
      .replace(/&quot;/g, '"')
      .replace(/&#58;/g, ':')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
    const docMatch = text.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    const metaDesc = docMatch ? decodeHtml(docMatch[1]) : null;
    // fallback: first paragraph
    const pMatch = text.match(/<p[^>]*>([^<]{30,}?)<\/p>/i);
    const firstPara = pMatch ? decodeHtml(pMatch[1].replace(/<[^>]*>/g, '').trim()) : null;
    const summary = (metaDesc || firstPara || '').slice(0, 400);

    const data = { lastUpdated: last, summary };
    metaCache[cacheKey] = { data, ts: Date.now() };
    res.json({ id, url, ...data, cached: false });
  } catch (err) {
    console.error('visa-meta error', err);
    res.status(500).json({ error: 'visa-meta error', details: String(err) });
  }
});

// POST /api/score
// This route acts as a safe server-side proxy for the Anthropic API.
// The frontend sends the scoring request body to this endpoint and the server
// forwards it with the API key. This prevents exposing the secret key in the browser.
app.post('/api/score', async (req, res) => {
  try {
    const body = req.body

    // Forward the exact request body to Anthropic's messages endpoint.
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(body)
    })

    // Return whatever the API returns directly to the frontend.
    const data = await response.json()
    res.json(data)
  } catch (err) {
    // Log and return a 500 so the frontend can show an error message.
    console.error('proxy error', err)
    res.status(500).json({ error: 'proxy error', details: String(err) })
  }
})

async function callOpenAI(messages, responseFormat) {
  if (!OPENAI_API_KEY) {
    const error = new Error('OPENAI_API_KEY is not configured')
    error.status = 503
    throw error
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      temperature: 0.3,
      response_format: responseFormat,
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    const error = new Error(data?.error?.message || 'OpenAI request failed')
    error.status = response.status
    throw error
  }
  return data
}

app.post('/api/openai/essay-feedback', async (req, res) => {
  try {
    const essay = String(req.body?.essay || '').slice(0, 8000)
    if (!essay.trim()) return res.status(400).json({ error: 'essay is required' })

    const data = await callOpenAI([
      { role: 'system', content: 'You are a concise PTE Academic essay tutor. Return actionable feedback, weak sentences, and a predicted score. Keep it short.' },
      { role: 'user', content: essay },
    ])
    const feedback = data.choices?.[0]?.message?.content || ''
    res.json({ feedback, model: OPENAI_MODEL })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'essay feedback failed' })
  }
})

app.post('/api/openai/tutor-chat', async (req, res) => {
  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages.slice(-12) : []
    const data = await callOpenAI([
      { role: 'system', content: 'You are a PTE Academic tutor. Give direct strategy, feedback, and study recommendations. Keep replies under 120 words.' },
      ...messages.map((message) => ({
        role: message.role === 'user' ? 'user' : 'assistant',
        content: String(message.content || '').slice(0, 2000),
      })),
    ])
    res.json({ reply: data.choices?.[0]?.message?.content || '', model: OPENAI_MODEL })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'tutor chat failed' })
  }
})

app.get('/api/supabase/config', (_req, res) => {
  res.json({
    enabled: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    rlsRequired: true,
    tables: ['profiles', 'practice_attempts', 'mock_results', 'study_plans', 'favorites'],
  })
})

app.post('/api/billing/create-checkout-session', async (req, res) => {
  if (!STRIPE_SECRET_KEY || !STRIPE_PRICE_PREMIUM) {
    return res.status(503).json({ error: 'Stripe is not configured' })
  }

  try {
    const params = new URLSearchParams({
      mode: 'subscription',
      success_url: `${APP_URL}?billing=success`,
      cancel_url: `${APP_URL}?billing=cancelled`,
      'line_items[0][price]': STRIPE_PRICE_PREMIUM,
      'line_items[0][quantity]': '1',
    })
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })
    const data = await response.json()
    if (!response.ok) return res.status(response.status).json(data)
    res.json({ url: data.url, id: data.id })
  } catch (err) {
    res.status(500).json({ error: 'checkout failed', details: String(err) })
  }
})

app.post('/api/billing/portal', (_req, res) => {
  res.status(501).json({ error: 'Billing portal requires a persisted Stripe customer id after auth is enabled.' })
})

// GET /api/invitation-rounds
// This example route fetches a public HTML page and extracts a table of data.
// It demonstrates how the proxy can be used for other backend tasks too.
app.get('/api/invitation-rounds', async (_req, res) => {
  try {
    const response = await fetch(INVITATION_ROUNDS_URL)
    const html = await response.text()
    const rows = []

    // Small helper to unescape a few common HTML entities.
    const decodeHtml = (value) => value
      .replace(/&quot;/g, '"')
      .replace(/&#58;/g, ':')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')

    // Find table rows (<tr>...</tr>) and then extract individual cells.
    const tableMatches = [...html.matchAll(/<tr[\s\S]*?<\/tr>/g)]
    tableMatches.forEach((match) => {
      const cells = [...match[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((cell) =>
        decodeHtml(cell[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim())
      )

      // Basic validation so we only include rows that look like the target table.
      if (cells.length >= 4 && /\d/.test(cells[2])) {
        rows.push({
          date: cells[0],
          visa: cells[1],
          invitations: Number((cells[2] || '').replace(/[^0-9]/g, '')) || 0,
          minPoints: Number((cells[3] || '').replace(/[^0-9]/g, '')) || 0,
        })
      }
    })

    res.json({ rows })
  } catch (err) {
    console.error('invitation rounds proxy error', err)
    res.status(500).json({ error: 'invitation rounds proxy error', details: String(err) })
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Proxy server listening on http://localhost:${port}`))
