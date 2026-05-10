import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import PTEMaster from './PTEMaster'
import PTEWeights from './PTEWeights'
import PRDashboard from './pte-pr-dashboard_4'
import EOIPulse from './EOIPulse'
import AITutorChat from './components/AITutorChat'
import LoginScreen from './components/LoginScreen'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

const NAV_ITEMS = [
  { id: 'master',    label: 'PTE Master',       icon: '🎓' },
  { id: 'weights',   label: 'Score Weights',    icon: '⚖️' },
  { id: 'dashboard', label: 'PR Dashboard',     icon: '🇦🇺' },
  { id: 'eoi',       label: 'EOI Pulse',        icon: '📡' },
]

function AppSwitcher({ onLogout }) {
  const [view, setView] = useState('master')

  return (
    <div style={{ minHeight: '100vh', background: '#030B1A', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .app-nav-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 16px; border-radius: 10px; border: 1px solid transparent;
          background: transparent; color: rgba(255,255,255,0.45);
          font-size: 13px; font-weight: 600; font-family: inherit;
          cursor: pointer; transition: all .2s; white-space: nowrap;
        }
        .app-nav-btn:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.05); }
        .app-nav-btn.active {
          background: rgba(14,165,233,0.15);
          border-color: rgba(14,165,233,0.35);
          color: #38BDF8;
          box-shadow: 0 2px 16px rgba(14,165,233,0.15);
        }
        .app-nav-signout {
          padding: 7px 14px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08); background: transparent;
          color: rgba(255,255,255,0.3); font-size: 12px; font-weight: 600;
          font-family: inherit; cursor: pointer; transition: all .2s;
        }
        .app-nav-signout:hover { border-color: rgba(248,113,113,0.4); color: #FCA5A5; }
      `}</style>

      {/* Top nav bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(3,11,26,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 20px',
        display: 'flex', alignItems: 'center', height: 54,
        gap: 4,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 16 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg,#0EA5E9,#2563EB)',
            fontSize: 13, fontWeight: 900, color: '#fff',
            boxShadow: '0 4px 12px rgba(14,165,233,0.35)',
          }}>90</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.3px' }}>
            PTE <span style={{ color: '#38BDF8' }}>Master</span>
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', marginRight: 12 }} />

        {/* Nav items */}
        {NAV_ITEMS.map(item => (
          <button key={item.id} className={`app-nav-btn${view === item.id ? ' active' : ''}`} onClick={() => setView(item.id)}>
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Sign out */}
        {onLogout && (
          <button className="app-nav-signout" onClick={onLogout}>
            Sign Out ↗
          </button>
        )}
      </div>

      {/* Page content */}
      <div>
        {view === 'master' ? <PTEMaster /> : view === 'weights' ? <PTEWeights /> : view === 'dashboard' ? <PRDashboard /> : <EOIPulse />}
      </div>
      <AITutorChat />
    </div>
  )
}

function App() {
  const [authState, setAuthState] = useState('checking') // 'checking' | 'authed' | 'login'
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    async function check() {
      try {
        const infoRes = await fetch('/api/auth/app')
        const info = await infoRes.json()
        if (!info.required) {
          setAuthState('authed')
          setShowLogout(false)
          return
        }
        const token = localStorage.getItem('app_token')
        if (!token) { setAuthState('login'); return }
        const valRes = await fetch('/api/auth/app/validate', {
          method: 'POST',
          headers: { 'x-app-token': token },
        })
        const val = await valRes.json()
        if (val.valid) {
          setAuthState('authed')
          setShowLogout(true)
        } else {
          localStorage.removeItem('app_token')
          setAuthState('login')
        }
      } catch {
        setAuthState('authed') // server unreachable — let through
      }
    }
    check()
  }, [])

  const handleLogin = (token) => {
    if (token !== 'no-auth') setShowLogout(true)
    setAuthState('authed')
  }

  const handleLogout = () => {
    localStorage.removeItem('app_token')
    setAuthState('login')
    setShowLogout(false)
  }

  if (authState === 'checking') {
    return (
      <div style={{ minHeight: '100vh', background: '#030B1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 14 }}>
        Loading…
      </div>
    )
  }

  if (authState === 'login') {
    return <LoginScreen onLogin={handleLogin} />
  }

  return <AppSwitcher onLogout={showLogout ? handleLogout : null} />
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
