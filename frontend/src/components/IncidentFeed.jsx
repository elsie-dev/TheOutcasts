const EVENT_META = {
  INJECTED:         { color: '#ef4444', label: 'INJECT',   bg: '#ef444412', border: '#ef444425' },
  STOPPED:          { color: '#22c55e', label: 'STOP',     bg: '#22c55e12', border: '#22c55e25' },
  INCIDENT_CREATED: { color: '#f59e0b', label: 'INCIDENT', bg: '#f59e0b12', border: '#f59e0b25' },
}

const SCENARIO_COLORS = {
  MEMORY_LEAK:     '#a78bfa',
  NETWORK_LATENCY: '#f59e0b',
  ERROR_RAIN:      '#ef4444',
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  } catch { return '—' }
}

function TimelineEvent({ event, isLast }) {
  const meta   = EVENT_META[event.event_type] ?? { color: '#3a5880', label: event.event_type, bg: '#3a588012', border: '#3a588025' }
  const scColor = SCENARIO_COLORS[event.scenario] ?? '#3a5880'

  return (
    <div className="flex gap-0 animate-slide-up">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0 w-10 pt-3.5">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-surface"
          style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}60`, '--tw-ring-color': `${meta.color}30` }}
        />
        {!isLast && <div className="w-px flex-1 min-h-[16px] mt-1.5" style={{ background: 'linear-gradient(to bottom, #1c2d4a, transparent)' }} />}
      </div>

      {/* Content */}
      <div className={`flex-1 py-3 pr-4 ${!isLast ? 'border-b border-bdr/30' : ''}`}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type badge */}
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-widest"
              style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}
            >
              {meta.label}
            </span>

            {/* Scenario badge */}
            {event.scenario && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider uppercase"
                style={{ color: scColor, background: `${scColor}0d`, border: `1px solid ${scColor}20` }}
              >
                {event.scenario.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <span className="text-[10px] text-txm tabular-nums flex-shrink-0 mt-0.5">
            {formatTime(event.timestamp)}
          </span>
        </div>

        <p className="text-[12px] text-tx2 leading-relaxed">{event.message}</p>

        {event.task_title && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <rect x="0.75" y="0.75" width="7.5" height="7.5" rx="1.25" stroke="#4f8ef5" strokeWidth="1.25"/>
              <line x1="2.5" y1="3" x2="6.5" y2="3" stroke="#4f8ef5" strokeWidth="1" strokeLinecap="round"/>
              <line x1="2.5" y1="4.75" x2="5.5" y2="4.75" stroke="#4f8ef5" strokeWidth="1" strokeLinecap="round"/>
            </svg>
            <span className="text-[10px] text-cblue truncate">
              #{event.task_id}: {event.task_title}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function IncidentFeed({ events }) {
  return (
    <aside className="card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-bdr flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cblue" />
          <span className="panel-title">Incident Log</span>
          {events.length > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: '#162036', border: '1px solid #1c2d4a', color: '#3a5880' }}
            >
              {events.length}
            </span>
          )}
        </div>

        {events.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-txm tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-cgreen animate-pulse-dot" />
            Live
          </div>
        )}
      </div>

      {/* Events timeline or empty state */}
      {events.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)' }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke="#22c55e" strokeWidth="1.5"/>
              <path d="M9 14L12.5 17.5L19 11" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-tx tracking-tight">All systems operational</p>
            <p className="text-[12px] text-txm mt-1">No incidents yet — inject an attack to begin</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pl-0">
          {events.map((e, i) => (
            <TimelineEvent key={e.id} event={e} isLast={i === events.length - 1} />
          ))}
        </div>
      )}
    </aside>
  )
}
