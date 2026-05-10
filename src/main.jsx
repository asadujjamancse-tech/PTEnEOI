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

function AppSwitcher({ onLogout }) {
  const [view, setView] = useState('master')
  const tabBtn = (id) => ({
    padding: '10px 14px',
    borderRadius: 10,
    border: view === id ? '1px solid #38BDF8' : '1px solid #334155',
    background: view === id ? 'linear-gradient(135deg,#0EA5E9,#2563EB)' : '#0F1929',
    color: view === id ? '#FFFFFF' : '#CBD5E1',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all .2s ease',
    boxShadow: view === id ? '0 8px 20px rgba(14,165,233,.28)' : 'none'
  })

  return (
    <div>
      <div style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center', background: 'linear-gradient(180deg,#06132B,#051026)', borderBottom: '1px solid #1E293B' }}>
        <button onClick={() => setView('master')} style={tabBtn('master')}>PTE Master</button>
        <button onClick={() => setView('weights')} style={tabBtn('weights')}>Score Weights</button>
        <button onClick={() => setView('dashboard')} style={tabBtn('dashboard')}>PR + PTE Dashboard</button>
        <button onClick={() => setView('eoi')} style={tabBtn('eoi')}>EOI Pulse</button>
        {onLogout && (
          <button
            onClick={onLogout}
            style={{ marginLeft: 'auto', padding: '8px 14px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#64748B', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            Sign Out
          </button>
        )}
      </div>
      <div style={{ minHeight: '100vh' }}>
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
