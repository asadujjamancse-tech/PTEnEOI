require('dotenv').config()
const express = require('express')
const fetch = global.fetch || require('node-fetch')
const app = express()
app.use(express.json())

const API_KEY = process.env.ANTHROPIC_API_KEY
if (!API_KEY) console.warn('Warning: ANTHROPIC_API_KEY not set in environment; scoring will fail until you set it in .env')

const INVITATION_ROUNDS_URL = 'https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/invitation-rounds'

app.post('/api/score', async (req, res) => {
  try {
    const body = req.body
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(body)
    })
    const data = await response.json()
    res.json(data)
  } catch (err) {
    console.error('proxy error', err)
    res.status(500).json({ error: 'proxy error', details: String(err) })
  }
})

app.get('/api/invitation-rounds', async (_req, res) => {
  try {
    const response = await fetch(INVITATION_ROUNDS_URL)
    const html = await response.text()
    const rows = []

    const decodeHtml = (value) => value
      .replace(/&quot;/g, '"')
      .replace(/&#58;/g, ':')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')

    const tableMatches = [...html.matchAll(/<tr[\s\S]*?<\/tr>/g)]
    tableMatches.forEach((match) => {
      const cells = [...match[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((cell) =>
        decodeHtml(cell[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim())
      )

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
