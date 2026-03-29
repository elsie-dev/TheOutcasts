import { useState } from 'react'

const SCENARIO_COLORS = {
  MEMORY_LEAK:     '#a78bfa',
  NETWORK_LATENCY: '#f59e0b',
  ERROR_RAIN:      '#ef4444',
}

const STATUS_META = {
  HEALTHY:  { color: '#22c55e', label: 'Healthy',  dot: 'bg-cgreen' },
  DEGRADED: { color: '#f59e0b', label: 'Degraded', dot: 'bg-camber' },
  DOWN:     { color: '#ef4444', label: 'Down',     dot: 'bg-cred'   },
}

function AppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="3" width="15" height="11" rx="1.5" stroke="#4f8ef5" strokeWidth="1.3"/>
      <path d="M6 14.5V16.5M12 14.5V16.5M4.5 16.5H13.5" stroke="#4f8ef5" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="9" cy="8.5" r="2" stroke="#4f8ef5" strokeWidth="1.2"/>
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <line x1="5.5" y1="1" x2="5.5" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="1" y1="5.5" x2="10" y2="5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

export default function AppPanel({ apps, selectedAppId, onSelectApp, onRefreshApps }) {
  const [showForm, setShowForm]   = useState(false)
  const [formData, setFormData]   = useState({ name: '', description: '', base_url: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError]   = useState(null)

  async function handleRegister(e) {
    e.preventDefault()
    if (!formData.name.trim()) { setFormError('App name is required'); return }
    setSubmitting(true); setFormError(null)
    try {
      const res = await fetch('/api/chaos/apps/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const b = await res.json()
        setFormError(b.name?.[0] ?? b.detail ?? 'Registration failed')
        return
      }
      setFormData({ name: '', description: '', base_url: '' })
      setShowForm(false)
      onRefreshApps?.()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card" style={{ minWidth: 0 }}>
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-bdr flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cblue" />
          <span className="panel-title">Registered Applications</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: '#162036', border: '1px solid #1c2d4a', color: '#3a5880' }}
          >
            {apps.length}
          </span>
          <button
            onClick={() => { setShowForm(v => !v); setFormError(null) }}
            className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md transition-all"
            style={showForm
              ? { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }
              : { background: 'rgba(79,142,245,0.1)', border: '1px solid rgba(79,142,245,0.25)', color: '#4f8ef5' }
            }
          >
            {showForm ? (
              <>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <line x1="1.5" y1="1.5" x2="8.5" y2="8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                Cancel
              </>
            ) : (
              <>
                <PlusIcon />
                Register App
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inline registration form */}
      {showForm && (
        <form
          onSubmit={handleRegister}
          className="px-4 pt-4 pb-3 border-b border-bdr animate-fade-in"
          style={{ background: 'rgba(79,142,245,0.03)' }}
        >
          <p className="text-[11px] font-semibold text-tx2 mb-3 flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="2" width="10" height="8" rx="1" stroke="#4f8ef5" strokeWidth="1.2"/>
              <path d="M4 5.5H8M4 7.5H6.5" stroke="#4f8ef5" strokeWidth="1.1" strokeLinecap="round"/>
            </svg>
            Onboard a new application
          </p>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex flex-col gap-1" style={{ minWidth: 160 }}>
              <label className="text-[10px] text-txm font-semibold uppercase tracking-wider">
                App Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. App B"
                value={formData.name}
                onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                className="px-2.5 py-1.5 rounded-md text-[12px] text-tx outline-none"
                style={{ background: '#0d1525', border: '1px solid #1c2d4a', width: '100%' }}
              />
            </div>
            <div className="flex flex-col gap-1" style={{ minWidth: 180 }}>
              <label className="text-[10px] text-txm font-semibold uppercase tracking-wider">Description</label>
              <input
                type="text"
                placeholder="e.g. Payment service"
                value={formData.description}
                onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
                className="px-2.5 py-1.5 rounded-md text-[12px] text-tx outline-none"
                style={{ background: '#0d1525', border: '1px solid #1c2d4a', width: '100%' }}
              />
            </div>
            <div className="flex flex-col gap-1" style={{ minWidth: 180 }}>
              <label className="text-[10px] text-txm font-semibold uppercase tracking-wider">Base URL</label>
              <input
                type="text"
                placeholder="http://localhost:3000"
                value={formData.base_url}
                onChange={e => setFormData(d => ({ ...d, base_url: e.target.value }))}
                className="px-2.5 py-1.5 rounded-md text-[12px] text-tx outline-none"
                style={{ background: '#0d1525', border: '1px solid #1c2d4a', width: '100%' }}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-md text-[12px] font-bold transition-all disabled:opacity-50"
              style={{ background: '#4f8ef5', color: '#fff', border: 'none', whiteSpace: 'nowrap' }}
            >
              {submitting ? 'Onboarding…' : 'Onboard App'}
            </button>
          </div>
          {formError && (
            <p className="mt-2 text-[11px]" style={{ color: '#ef4444' }}>{formError}</p>
          )}
        </form>
      )}

      {/* App cards */}
      <div className="flex flex-wrap gap-3 p-4">
        {apps.length === 0 && (
          <p className="text-[12px] text-txm">No applications registered yet. Register one above.</p>
        )}
        {apps.map((app) => {
          const isSelected = selectedAppId === app.id
          const meta = STATUS_META[app.status] ?? STATUS_META.HEALTHY
          const hasActive = app.active_scenarios.length > 0

          return (
            <div
              key={app.id}
              onClick={() => onSelectApp(isSelected ? null : app.id)}
              className="relative flex flex-col gap-2 p-3.5 rounded-xl cursor-pointer transition-all"
              style={{
                minWidth: 220,
                maxWidth: 280,
                flex: '1 1 220px',
                background: isSelected ? 'rgba(79,142,245,0.07)' : '#0d1525',
                border: isSelected
                  ? '1px solid rgba(79,142,245,0.35)'
                  : hasActive
                    ? `1px solid ${meta.color}30`
                    : '1px solid #1c2d4a',
              }}
            >
              {/* Onboarded indicator */}
              {isSelected && (
                <div
                  className="absolute top-2.5 right-2.5 text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider flex items-center gap-1"
                  style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3.2 5.7L6.5 2.3" stroke="#22c55e" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  ONBOARDED
                </div>
              )}

              {/* App icon + name */}
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(79,142,245,0.08)', border: '1px solid rgba(79,142,245,0.2)' }}
                >
                  <AppIcon />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-tx leading-tight">{app.name}</p>
                  <p className="text-[10px] text-txm leading-tight truncate" style={{ maxWidth: 160 }}>
                    {app.description || app.base_url || '—'}
                  </p>
                </div>
              </div>

              {/* Status row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${hasActive ? 'animate-pulse-dot' : ''}`}
                    style={{ background: meta.color }}
                  />
                  <span className="text-[11px] font-semibold" style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                </div>

                {/* Active scenario badges */}
                {app.active_scenarios.length > 0 && (
                  <div className="flex gap-1 flex-wrap justify-end">
                    {app.active_scenarios.map(sc => {
                      const c = SCENARIO_COLORS[sc] ?? '#3a5880'
                      return (
                        <span
                          key={sc}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider"
                          style={{ color: c, background: `${c}15`, border: `1px solid ${c}30` }}
                        >
                          {sc.replace(/_/g, ' ')}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Onboard / chaos-ready hint */}
              {!isSelected ? (
                <button
                  className="mt-1 w-full py-1.5 rounded-md text-[11px] font-bold tracking-wide transition-all"
                  style={{ background: 'rgba(79,142,245,0.1)', border: '1px solid rgba(79,142,245,0.25)', color: '#4f8ef5' }}
                >
                  Onboard &amp; Target
                </button>
              ) : (
                <p className="text-[10px] font-medium mt-1" style={{ color: '#22c55e' }}>
                  Ready for chaos tests
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
