import { useState, useCallback, useRef } from 'react'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MetricsPanel from './components/MetricsPanel'
import ChaosControls from './components/ChaosControls'
import IncidentFeed from './components/IncidentFeed'
import AppPanel from './components/AppPanel'
import { usePolling } from './hooks/usePolling'

const MAX_HISTORY = 30

// ── Auth gate ─────────────────────────────────────────────────────────────────
function AuthGate() {
  const [page, setPage] = useState('login')
  return page === 'login'
    ? <LoginPage    onSwitchToRegister={() => setPage('register')} />
    : <RegisterPage onSwitchToLogin={()    => setPage('login')}    />
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard() {
  const { user, logout } = useAuth()
  const [history,         setHistory]         = useState([])
  const [activeScenarios, setActiveScenarios] = useState([])
  const [events,          setEvents]          = useState([])
  const [apps,            setApps]            = useState([])
  const [selectedAppId,   setSelectedAppId]   = useState(null)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState(null)
  const autoOnboarded = useRef(false)

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/metrics/')
      if (!res.ok) return
      const data = await res.json()
      setHistory(prev => [...prev.slice(-(MAX_HISTORY - 1)), {
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cpu_percent:    data.cpu_percent,
        memory_mb:      data.memory_mb,
        avg_latency_ms: data.avg_latency_ms,
        error_rate_pct: data.error_rate_pct,
      }])
      setActiveScenarios(data.active_scenarios ?? [])
    } catch { /* ignore during server chaos */ }
  }, [])

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/chaos/status/')
      if (!res.ok) return
      const data = await res.json()
      setEvents(data.recent_events ?? [])
    } catch { /* ignore */ }
  }, [])

  const fetchApps = useCallback(async () => {
    try {
      const res = await fetch('/api/chaos/apps/')
      if (!res.ok) return
      const data = await res.json()
      setApps(data)
      // Auto-onboard the first app (App A) on first load
      if (!autoOnboarded.current && data.length > 0) {
        autoOnboarded.current = true
        setSelectedAppId(data[0].id)
      }
    } catch { /* ignore */ }
  }, [])

  usePolling(fetchMetrics, 2000)
  usePolling(fetchStatus,  2000)
  usePolling(fetchApps,    3000)

  async function handleInject(scenario) {
    setLoading(true); setError(null)
    try {
      const body = { scenario }
      if (selectedAppId) body.app_id = selectedAppId
      const res = await fetch('/api/chaos/inject/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const b = await res.json(); setError(b.error ?? 'Injection failed') }
      await Promise.all([fetchMetrics(), fetchStatus(), fetchApps()])
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  async function handleStop(scenario) {
    setLoading(true); setError(null)
    try {
      await fetch('/api/chaos/stop/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      })
      await Promise.all([fetchMetrics(), fetchStatus(), fetchApps()])
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const healthy = activeScenarios.length === 0
  const selectedApp = apps.find(a => a.id === selectedAppId) ?? null

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* ── Header ── */}
      <header className="border-b border-bdr" style={{ background: '#0a0e1c' }}>
        <div className="max-w-[1440px] mx-auto h-13 px-6 flex items-center justify-between gap-4" style={{ height: 52 }}>

          {/* Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(79,142,245,0.12)', border: '1px solid rgba(79,142,245,0.25)' }}>
              <svg width="18" height="18" viewBox="0 0 36 36" fill="none">
                <path d="M18 3L33 11.25V28.75L18 37L3 28.75V11.25L18 3Z" stroke="#4f8ef5" strokeWidth="2" fill="rgba(79,142,245,0.1)"/>
                <path d="M18 10L26 14.5V23.5L18 28L10 23.5V14.5L18 10Z" fill="rgba(79,142,245,0.25)" stroke="#4f8ef5" strokeWidth="1.5"/>
                <circle cx="18" cy="19" r="3.5" fill="#4f8ef5"/>
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[14px] text-tx tracking-tight">FixMe</span>
              <span className="text-txm text-[13px]">/</span>
              <span className="text-[12px] font-medium" style={{ color: '#4f8ef5' }}>Chaos Lab</span>
            </div>
          </div>

          {/* Nav tabs */}
          <nav className="hidden md:flex items-center gap-1 flex-shrink-0">
            <span
              className="px-3 py-1.5 rounded-md text-[12px] font-medium cursor-default"
              style={{ background: 'rgba(79,142,245,0.12)', color: '#4f8ef5', border: '1px solid rgba(79,142,245,0.2)' }}
            >
              Dashboard
            </span>
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-1.5 text-[11px] text-cred px-2.5 py-1 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4.25" stroke="#ef4444" strokeWidth="1.3"/><path d="M5 2.5V5.5" stroke="#ef4444" strokeWidth="1.3" strokeLinecap="round"/></svg>
                {error}
              </div>
            )}

            {/* System status pill */}
            <div
              className="flex items-center gap-2 text-[11px] font-semibold px-3 py-1.5 rounded-full"
              style={healthy
                ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }
                : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }
              }
            >
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse-dot ${healthy ? 'bg-cgreen' : 'bg-cred'}`} />
              {healthy ? 'Operational' : `${activeScenarios.length} Attack${activeScenarios.length > 1 ? 's' : ''} Active`}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-bdr flex-shrink-0" />

            {/* User */}
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold uppercase"
                style={{ background: 'rgba(79,142,245,0.15)', border: '1px solid rgba(79,142,245,0.25)', color: '#4f8ef5' }}
              >
                {user?.name?.[0] ?? 'U'}
              </div>
              <span className="text-[12px] text-tx2 hidden lg:block">{user?.name}</span>
              <button
                onClick={logout}
                className="text-[11px] text-txm hover:text-tx2 transition-colors px-2 py-1 rounded hover:bg-surface2"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Chaos alert bar ── */}
      {!healthy && (
        <div className="animate-fade-in border-b" style={{ background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.15)' }}>
          <div className="max-w-[1440px] mx-auto px-6 h-9 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-camber animate-pulse-dot" />
              <span className="text-[10px] font-bold text-camber tracking-[0.12em] uppercase">Chaos Active</span>
            </div>
            <div className="w-px h-3 bg-bdr" />
            <div className="flex items-center gap-2">
              {activeScenarios.map(id => (
                <span key={id} className="text-[10px] font-semibold px-2 py-0.5 rounded-sm"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                  {id.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Page content ── */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-5 flex flex-col gap-4">
        <MetricsPanel history={history} />
        <AppPanel
          apps={apps}
          selectedAppId={selectedAppId}
          onSelectApp={setSelectedAppId}
          onRefreshApps={fetchApps}
        />
        <div className="grid gap-4 flex-1" style={{ gridTemplateColumns: '300px 1fr' }}>
          <ChaosControls
            activeScenarios={activeScenarios}
            onInject={handleInject}
            onStop={handleStop}
            loading={loading}
            selectedApp={selectedApp}
          />
          <IncidentFeed events={events} />
        </div>
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Dashboard /> : <AuthGate />
}
