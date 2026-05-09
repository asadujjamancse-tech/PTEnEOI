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

// A small example proxy route scrapes a public website and returns structured rows.
const INVITATION_ROUNDS_URL = 'https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/invitation-rounds'

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
