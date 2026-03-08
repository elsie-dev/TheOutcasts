import { useState, useCallback } from 'react'
import MetricsPanel from './components/MetricsPanel'
import ChaosControls from './components/ChaosControls'
import IncidentFeed from './components/IncidentFeed'
import { usePolling } from './hooks/usePolling'

const MAX_HISTORY = 30  // 60 seconds of data at 2 s poll rate

const EMPTY_METRICS = {
  cpu_percent: 0,
  memory_mb: 0,
  memory_percent: 0,
  avg_latency_ms: 0,
  error_rate_pct: 0,
  active_scenarios: [],
}

export default function App() {
  const [history, setHistory] = useState([])
  const [activeScenarios, setActiveScenarios] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ── Poll /api/metrics/ every 2 s ─────────────────────────────────────────
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/metrics/')
      if (!res.ok) return
      const data = await res.json()
      const point = {
        time: new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        }),
        cpu_percent: data.cpu_percent,
        memory_mb: data.memory_mb,
        avg_latency_ms: data.avg_latency_ms,
        error_rate_pct: data.error_rate_pct,
      }
      setHistory((prev) => [...prev.slice(-(MAX_HISTORY - 1)), point])
      setActiveScenarios(data.active_scenarios ?? [])
    } catch {
      // silently ignore — server may be restarting during chaos
    }
  }, [])

  // ── Poll /api/chaos/status/ every 2 s ────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/chaos/status/')
      if (!res.ok) return
      const data = await res.json()
      setEvents(data.recent_events ?? [])
    } catch {
      // silently ignore
    }
  }, [])

  usePolling(fetchMetrics, 2000)
  usePolling(fetchStatus, 2000)

  // ── Inject chaos ──────────────────────────────────────────────────────────
  async function handleInject(scenario) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/chaos/inject/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Injection failed')
      }
      await Promise.all([fetchMetrics(), fetchStatus()])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Stop chaos ────────────────────────────────────────────────────────────
  async function handleStop(scenario) {
    setLoading(true)
    setError(null)
    try {
      await fetch('/api/chaos/stop/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      })
      await Promise.all([fetchMetrics(), fetchStatus()])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const systemHealthy = activeScenarios.length === 0

  return (
    <div style={styles.app}>
      {/* ── Header ── */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <span style={styles.logo}></span>
          <span style={styles.title}>FixMe · Chaos Lab</span>
        </div>
        <div style={styles.headerRight}>
          {error && <span style={styles.errorBanner}>{error}</span>}
          <div
            style={{
              ...styles.statusBadge,
              background: systemHealthy ? '#1a2f1a' : '#2f1a1a',
              border: `1px solid ${systemHealthy ? '#3fb950' : '#f85149'}`,
              color: systemHealthy ? '#3fb950' : '#f85149',
            }}
          >
            <span
              style={{
                ...styles.pulse,
                background: systemHealthy ? '#3fb950' : '#f85149',
              }}
            />
            {systemHealthy ? 'SYSTEM HEALTHY' : `CHAOS ACTIVE — ${activeScenarios.join(', ')}`}
          </div>
        </div>
      </header>

      {/* ── Live metrics row ── */}
      <MetricsPanel history={history} />

      {/* ── Controls + Feed row ── */}
      <div style={styles.bottomGrid}>
        <ChaosControls
          activeScenarios={activeScenarios}
          onInject={handleInject}
          onStop={handleStop}
          loading={loading}
        />
        <IncidentFeed events={events} />
      </div>
    </div>
  )
}

const styles = {
  app: {
    minHeight: '100vh',
    padding: '20px 24px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    maxWidth: 1400,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottom: '1px solid #30363d',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logo: { fontSize: 22 },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#e6edf3',
    letterSpacing: '-0.01em',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontSize: 12,
    fontWeight: 700,
    padding: '6px 14px',
    borderRadius: 20,
    letterSpacing: '0.04em',
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  errorBanner: {
    background: '#2f1a1a',
    border: '1px solid #f85149',
    color: '#f85149',
    fontSize: 12,
    padding: '5px 12px',
    borderRadius: 6,
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: 16,
    flex: 1,
  },
}
