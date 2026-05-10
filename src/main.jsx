// Entry point for the React application.
// This file mounts a small AppSwitcher component into the page's #root element.
// AppSwitcher is a simple UI that toggles between a few main screens.
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'

// Import the main pages/components. Each of these exports a React component.
import PTEMaster from './PTEMaster'
import PTEWeights from './PTEWeights'
import PRDashboard from './pte-pr-dashboard_4'
import EOIPulse from './EOIPulse'
import AITutorChat from './components/AITutorChat'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css' // global styles

function AppSwitcher() {
  // view holds which page is currently visible. Beginners: think of it as simple client-side routing.
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
      {/* Top navigation: clicking a button sets the 'view' state above. */}
      <div style={{ padding: 12, display: 'flex', gap: 10, background: 'linear-gradient(180deg,#06132B,#051026)', borderBottom: '1px solid #1E293B' }}>
        <button onClick={() => setView('master')} style={tabBtn('master')}>PTE Master</button>
        <button onClick={() => setView('weights')} style={tabBtn('weights')}>Score Weights</button>
        <button onClick={() => setView('dashboard')} style={tabBtn('dashboard')}>PR + PTE Dashboard</button>
        <button onClick={() => setView('eoi')} style={tabBtn('eoi')}>EOI Pulse</button>
      </div>

      {/* The main area: show the component that matches the selected view. */}
      <div style={{ minHeight: '100vh' }}>
        {view === 'master' ? <PTEMaster /> : view === 'weights' ? <PTEWeights /> : view === 'dashboard' ? <PRDashboard /> : <EOIPulse />}
      </div>
      <AITutorChat />
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppSwitcher />
    </ErrorBoundary>
  </React.StrictMode>
)
