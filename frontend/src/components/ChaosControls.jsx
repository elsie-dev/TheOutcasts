function MemoryIcon({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1" y="4.5" width="13" height="3" rx="0.7" stroke={color} strokeWidth="1.3"/>
      <rect x="1" y="8.5" width="13" height="3" rx="0.7" stroke={color} strokeWidth="1.3"/>
      {[3, 5.5, 8, 10.5].map(x => (
        <g key={x}>
          <line x1={x} y1="4.5" x2={x} y2="3" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
          <line x1={x} y1="11.5" x2={x} y2="13" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
        </g>
      ))}
    </svg>
  )
}

function LatencyIcon({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="6" stroke={color} strokeWidth="1.3"/>
      <path d="M7.5 4.5V7.8L9.5 9.2" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ErrorIcon({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 1.5L13.5 13.5H1.5L7.5 1.5Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <line x1="7.5" y1="6" x2="7.5" y2="9.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="7.5" cy="11.2" r="0.75" fill={color}/>
    </svg>
  )
}

const SCENARIOS = [
  {
    id: 'MEMORY_LEAK',
    label: 'Memory Leak',
    desc: '~1 MB allocated every 500 ms',
    risk: 'MEDIUM',
    color: '#a78bfa',
    riskColor: '#a78bfa',
    Icon: MemoryIcon,
  },
  {
    id: 'NETWORK_LATENCY',
    label: 'Network Latency',
    desc: '1–3 s delay injected per request',
    risk: 'HIGH',
    color: '#f59e0b',
    riskColor: '#f59e0b',
    Icon: LatencyIcon,
  },
  {
    id: 'ERROR_RAIN',
    label: 'Error Rain',
    desc: 'HTTP 500 on 40% of requests',
    risk: 'CRITICAL',
    color: '#ef4444',
    riskColor: '#ef4444',
    Icon: ErrorIcon,
  },
]

export default function ChaosControls({ activeScenarios, onInject, onStop, loading }) {
  const anyActive = activeScenarios.length > 0

  return (
    <aside className="card flex flex-col" style={{ minWidth: 0 }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-4 py-3.5 border-b border-bdr flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cblue" />
          <span className="panel-title">Attack Scenarios</span>
        </div>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: '#162036', border: '1px solid #1c2d4a', color: '#3a5880' }}
        >
          {SCENARIOS.length}
        </span>
      </div>

      {/* ── Scenario list ──────────────────────────────────── */}
      <div className="flex-1 py-1.5">
        {SCENARIOS.map((sc) => {
          const isActive = activeScenarios.includes(sc.id)
          return (
            <div
              key={sc.id}
              className="group relative flex items-center gap-3 px-4 py-3 transition-colors"
              style={isActive
                ? { background: `${sc.color}09`, borderLeft: `2px solid ${sc.color}`, paddingLeft: 14 }
                : { borderLeft: '2px solid transparent' }
              }
            >
              {/* Icon */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: isActive ? `${sc.color}1a` : `${sc.color}0d`,
                  border: `1px solid ${sc.color}${isActive ? '40' : '20'}`,
                }}
              >
                <sc.Icon color={sc.color} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-[13px] font-semibold leading-none"
                    style={{ color: isActive ? sc.color : '#dde6f3' }}
                  >
                    {sc.label}
                  </span>

                  {isActive ? (
                    <span
                      className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider"
                      style={{ background: `${sc.color}15`, color: sc.color, border: `1px solid ${sc.color}30` }}
                    >
                      <span className="w-1 h-1 rounded-full animate-pulse-dot" style={{ background: sc.color }} />
                      LIVE
                    </span>
                  ) : (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider border"
                      style={{ color: sc.riskColor, background: `${sc.riskColor}0d`, borderColor: `${sc.riskColor}25` }}
                    >
                      {sc.risk}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-txm leading-none truncate">{sc.desc}</p>
              </div>

              {/* Action button */}
              <button
                disabled={loading}
                onClick={() => isActive ? onStop(sc.id) : onInject(sc.id)}
                className="flex-shrink-0 text-[11px] font-bold px-3.5 py-1.5 rounded-md transition-all disabled:opacity-40"
                style={isActive
                  ? { color: sc.color, background: 'transparent', border: `1px solid ${sc.color}50` }
                  : { color: '#fff', background: sc.color, border: 'none' }
                }
              >
                {isActive ? 'Halt' : 'Inject'}
              </button>
            </div>
          )
        })}
      </div>

      {/* ── Status summary ─────────────────────────────────── */}
      {anyActive && (
        <div className="mx-4 mb-3 px-3 py-2 rounded-lg" style={{ background: '#162036', border: '1px solid #1c2d4a' }}>
          <p className="text-[10px] text-txm mb-1 font-semibold tracking-wider uppercase">Active</p>
          <div className="flex flex-wrap gap-1.5">
            {activeScenarios.map(id => {
              const sc = SCENARIOS.find(s => s.id === id)
              if (!sc) return null
              return (
                <span key={id} className="text-[10px] font-semibold px-2 py-0.5 rounded-sm"
                  style={{ color: sc.color, background: `${sc.color}15`, border: `1px solid ${sc.color}30` }}>
                  {sc.label}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Halt All ───────────────────────────────────────── */}
      <div className="px-4 pb-4 flex-shrink-0">
        <button
          disabled={!anyActive || loading}
          onClick={() => onStop('ALL')}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] font-bold tracking-wide transition-all"
          style={anyActive
            ? { background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }
            : { background: 'transparent', border: '1px solid #1c2d4a', color: '#3a5880', opacity: 0.5, cursor: 'not-allowed' }
          }
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="1.5" y="1.5" width="8" height="8" rx="1.5"
              stroke={anyActive ? '#ef4444' : '#3a5880'} strokeWidth="1.4"/>
            <rect x="3.5" y="3.5" width="4" height="4" rx="0.5"
              fill={anyActive ? '#ef4444' : '#3a5880'}/>
          </svg>
          Halt All Attacks{anyActive ? ` (${activeScenarios.length})` : ''}
        </button>
      </div>
    </aside>
  )
}
