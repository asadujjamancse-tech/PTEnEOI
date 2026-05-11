import React, { useEffect, useMemo, useState } from 'react'
import EOIInsightsPanel from './components/EOIInsightsPanel'
import { useTheme } from './ThemeContext'

const INVITATION_ROUNDS_API = '/api/invitation-rounds'

function parseCsv(text) {
  const rows = text.trim().split(/\r?\n/).filter(Boolean)
  if (!rows.length) return []
  const split = (line) => {
    const out = []
    let current = ''
    let inQuotes = false
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index]
      if (character === '"') {
        if (inQuotes && line[index + 1] === '"') {
          current += '"'
          index += 1
        } else {
          inQuotes = !inQuotes
        }
      } else if (character === ',' && !inQuotes) {
        out.push(current.trim())
        current = ''
      } else {
        current += character
      }
    }
    out.push(current.trim())
    return out
  }
  const headers = split(rows[0]).map((header) => header.toLowerCase())
  return rows.slice(1).map((row) => {
    const cells = split(row)
    const item = {}
    headers.forEach((header, index) => {
      item[header] = cells[index] || ''
    })
    return item
  })
}

export default function EOIPulse() {
  const { darkMode: dm } = useTheme()
  const [rawData, setRawData] = useState('')
  const [importName, setImportName] = useState('')
  const [occupationFilter, setOccupationFilter] = useState('')
  const [csvUrl, setCsvUrl] = useState(localStorage.getItem('eoi_csv_url') || '')
  const [syncStatus, setSyncStatus] = useState('')
  const [publicRounds, setPublicRounds] = useState([])
  const [publicStatus, setPublicStatus] = useState('Loading public invitation rounds...')

  const eoiRows = useMemo(() => parseCsv(rawData), [rawData])

  const normalizedRows = useMemo(() => {
    return eoiRows.map((row) => {
      const statusRaw = (row.status || row.eoi_status || row.state || '').toUpperCase()
      const status = statusRaw.includes('INVITED') ? 'INVITED'
        : statusRaw.includes('LODGED') ? 'LODGED'
        : statusRaw.includes('CLOSED') ? 'CLOSED'
        : statusRaw.includes('HOLD') ? 'HOLD'
        : 'SUBMITTED'
      return {
        occupation: row.occupation || row.anzsco_occupation || row.title || '',
        anzsco: row.anzsco || row.anzsco_code || row.code || '',
        visa: row.visa || row.subclass || '',
        points: Number(row.points || row.score || 0),
        status,
      }
    })
  }, [eoiRows])

  const filteredRows = useMemo(() => {
    const query = occupationFilter.trim().toLowerCase()
    if (!query) return normalizedRows
    return normalizedRows.filter((row) => `${row.anzsco} ${row.occupation}`.toLowerCase().includes(query))
  }, [normalizedRows, occupationFilter])

  const summary = useMemo(() => {
    const counts = { SUBMITTED: 0, INVITED: 0, LODGED: 0, CLOSED: 0, HOLD: 0 }
    filteredRows.forEach((row) => { counts[row.status] = (counts[row.status] || 0) + 1 })
    return counts
  }, [filteredRows])

  const waiting = summary.SUBMITTED + summary.HOLD
  const latestRound = publicRounds[0]
  const predictionPoints = filteredRows.length ? Math.max(...filteredRows.map((row) => row.points || 0), 65) : 65
  const predictionOccupation = filteredRows[0]?.occupation || occupationFilter || 'Selected occupation'
  const predictionState = filteredRows[0]?.visa || ''

  const onUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImportName(file.name)
    const text = await file.text()
    setRawData(text)
  }

  const syncFromUrl = async () => {
    if (!csvUrl.trim()) return
    try {
      setSyncStatus('Syncing...')
      const response = await fetch(csvUrl.trim())
      if (!response.ok) throw new Error('fetch failed')
      const text = await response.text()
      setRawData(text)
      setImportName(`Auto: ${csvUrl.trim()}`)
      localStorage.setItem('eoi_csv_url', csvUrl.trim())
      setSyncStatus(`Synced at ${new Date().toLocaleTimeString()}`)
    } catch (error) {
      setSyncStatus('Sync failed. Check CSV URL and CORS access.')
    }
  }

  useEffect(() => {
    if (!csvUrl.trim()) return undefined
    const timer = setInterval(() => {
      syncFromUrl()
    }, 5 * 60 * 1000)
    return () => clearInterval(timer)
  }, [csvUrl])

  useEffect(() => {
    let cancelled = false

    const fetchPublicRounds = async () => {
      try {
        const response = await fetch(INVITATION_ROUNDS_API)
        const data = await response.json()
        const rows = Array.isArray(data?.rows) ? data.rows : []

        if (!cancelled && rows.length) {
          setPublicRounds(rows.slice(0, 20))
          setPublicStatus(`Live public data loaded (${rows.length} rows).`)
        } else if (!cancelled) {
          setPublicStatus('Could not parse invitation round table from public page.')
        }
      } catch (error) {
        if (!cancelled) setPublicStatus('Public data fetch failed. Check internet access.')
      }
    }

    fetchPublicRounds()
    const timer = setInterval(fetchPublicRounds, 60 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: dm ? '#070D1A' : '#F0F4F8', color: dm ? '#fff' : '#0F172A', fontFamily: "'DM Sans', system-ui, sans-serif", padding: 24 }}>
      <style>{`
        .eoi-card { background: #0A1222; border: 1px solid #1E293B; border-radius: 12px; }
        .eoi-input { background: #0F1929; border: 1px solid #334155; border-radius: 8px; color: #fff; padding: 9px 12px; }
        .eoi-table-header { color: #64748B; }
        .eoi-table-row { border-bottom: 1px solid #0F1929; }
        [data-theme="light"] .eoi-card { background: #FFFFFF !important; border-color: #E2E8F0 !important; }
        [data-theme="light"] .eoi-input { background: #F8FAFC !important; border-color: #CBD5E1 !important; color: #0F172A !important; }
        [data-theme="light"] .eoi-table-header { color: #64748B; }
        [data-theme="light"] .eoi-table-row { border-bottom-color: #E2E8F0 !important; }
        @media (max-width: 720px) {
          .eoi-panels-grid { grid-template-columns: 1fr !important; }
          .eoi-stat-grid { grid-template-columns: repeat(3,1fr) !important; }
        }
        @media (max-width: 480px) {
          .eoi-stat-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>EOI Pulse</div>
          <div style={{ color: dm ? '#64748B' : '#475569', fontSize: 13 }}>Track EOI waiting, invited, lodged and closed using your SkillSelect export.</div>
        </div>

        <div className="eoi-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 14 }}>
          {[
            ['Waiting', waiting, '#FBBF24'],
            ['Invited', summary.INVITED, '#38BDF8'],
            ['Lodged', summary.LODGED, '#34D399'],
            ['Submitted', summary.SUBMITTED, '#A78BFA'],
            ['Closed', summary.CLOSED, '#64748B'],
          ].map(([label, value, color]) => (
            <div key={label} className="eoi-card" style={{ background: '#0A1222', border: `1px solid ${color}66`, borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11, color, textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
              <div style={{ fontSize: 30, fontWeight: 800, marginTop: 4 }}>{value}</div>
            </div>
          ))}
        </div>

        <div className="eoi-panels-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12, marginBottom: 12 }}>
          <div className="eoi-card" style={{ background: '#0A1222', border: '1px solid #1E293B', borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Import SkillSelect EOI data</div>
            <input type="file" accept=".csv,text/csv" onChange={onUpload} />
            <div style={{ color: dm ? '#94A3B8' : '#64748B', fontSize: 12, marginTop: 8 }}>{importName ? `Imported: ${importName}` : 'Upload your monthly EOI dashboard CSV export.'}</div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <input
                value={csvUrl}
                onChange={(event) => setCsvUrl(event.target.value)}
                placeholder="Auto Sync CSV URL (Google Sheet / hosted CSV)"
                className="eoi-input"
                style={{ flex: 1, background: '#0F1929', border: '1px solid #334155', borderRadius: 8, color: '#fff', padding: '9px 12px' }}
              />
              <button onClick={syncFromUrl} style={{ background: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 12px', fontWeight: 700, cursor: 'pointer' }}>Sync</button>
            </div>
            <div style={{ color: dm ? '#64748B' : '#94A3B8', fontSize: 11, marginTop: 6 }}>{syncStatus || 'Auto-sync runs every 5 minutes when URL is set.'}</div>
            <input
              value={occupationFilter}
              onChange={(event) => setOccupationFilter(event.target.value)}
              placeholder="Filter by occupation or ANZSCO"
              className="eoi-input"
              style={{ marginTop: 10, width: '100%', background: '#0F1929', border: '1px solid #334155', borderRadius: 8, color: '#fff', padding: '9px 12px' }}
            />
          </div>
          <div className="eoi-card" style={{ background: '#0A1222', border: '1px solid #1E293B', borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Latest invitation round snapshot</div>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>{publicStatus}</div>
            <div style={{ fontSize: 12, color: dm ? '#94A3B8' : '#64748B', marginBottom: 5 }}>Round date: <strong style={{ color: dm ? '#fff' : '#0F172A' }}>{latestRound?.date || '-'}</strong></div>
            <div style={{ fontSize: 12, color: dm ? '#94A3B8' : '#64748B', marginBottom: 5 }}>Visa: <strong style={{ color: dm ? '#fff' : '#0F172A' }}>{latestRound?.visa || '-'}</strong></div>
            <div style={{ fontSize: 12, color: dm ? '#94A3B8' : '#64748B', marginBottom: 5 }}>Invitations: <strong style={{ color: dm ? '#fff' : '#0F172A' }}>{latestRound?.invitations ?? '-'}</strong></div>
            <div style={{ fontSize: 12, color: dm ? '#94A3B8' : '#64748B' }}>Min points: <strong style={{ color: dm ? '#fff' : '#0F172A' }}>{latestRound?.minPoints ?? '-'}</strong></div>
            <a href="https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/invitation-rounds" target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 10, color: '#38BDF8', fontSize: 12 }}>Open official invitation rounds</a>
          </div>
        </div>

        <EOIInsightsPanel
          points={predictionPoints}
          occupation={predictionOccupation}
          state={predictionState}
          rounds={publicRounds}
        />

        <div className="eoi-card" style={{ background: '#0A1222', border: '1px solid #1E293B', borderRadius: 12, overflowX: 'auto', overflowY: 'hidden' }}>
          <div className="eoi-table-header" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 95px 90px 110px', padding: '10px 14px', borderBottom: `1px solid ${dm ? '#1E293B' : '#E2E8F0'}`, fontWeight: 700, fontSize: 11 }}>
            <div>ANZSCO</div><div>Occupation</div><div>Visa</div><div>Points</div><div>Status</div>
          </div>
          {filteredRows.slice(0, 300).map((row, index) => (
            <div key={`${row.anzsco}-${row.occupation}-${index}`} className="eoi-table-row" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 95px 90px 110px', padding: '10px 14px', fontSize: 12 }}>
              <div style={{ color: dm ? '#CBD5E1' : '#475569' }}>{row.anzsco || '-'}</div>
              <div style={{ color: dm ? '#E2E8F0' : '#0F172A' }}>{row.occupation || '-'}</div>
              <div style={{ color: dm ? '#94A3B8' : '#64748B' }}>{row.visa || '-'}</div>
              <div style={{ color: dm ? '#F8FAFC' : '#0F172A' }}>{row.points || '-'}</div>
              <div style={{ color: row.status === 'INVITED' ? '#38BDF8' : row.status === 'LODGED' ? '#34D399' : row.status === 'SUBMITTED' ? '#FBBF24' : '#94A3B8', fontWeight: 700 }}>{row.status}</div>
            </div>
          ))}
          {!filteredRows.length && (
            <div style={{ padding: 20, color: '#64748B', fontSize: 13 }}>No rows yet. Upload EOI CSV to see waiting / invited / lodged stats.</div>
          )}
        </div>
      </div>
    </div>
  )
}
