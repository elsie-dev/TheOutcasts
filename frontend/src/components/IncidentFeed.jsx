const EVENT_META = {
  INJECTED:         { icon: '⚡', color: '#f85149', label: 'Injected' },
  STOPPED:          { icon: '✅', color: '#3fb950', label: 'Stopped' },
  INCIDENT_CREATED: { icon: '🚨', color: '#d29922', label: 'Incident' },
}

const STATUS_COLOR = {
  PENDING:     '#d29922',
  IN_PROGRESS: '#58a6ff',
  COMPLETED:   '#3fb950',
  CANCELLED:   '#8b949e',
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return '—'
  }
}

function EventRow({ event }) {
  const meta = EVENT_META[event.event_type] ?? { icon: '•', color: '#8b949e', label: event.event_type }

  return (
    <div style={styles.row}>
      <span style={{ ...styles.eventBadge, color: meta.color }}>{meta.icon}</span>
      <div style={styles.rowBody}>
        <div style={styles.rowTop}>
          <span style={{ color: meta.color, fontWeight: 600, fontSize: 12 }}>
            {meta.label}
          </span>
          <span style={styles.scenario}>{event.scenario}</span>
          {event.task_status && (
            <span
              style={{
                ...styles.statusPill,
                color: STATUS_COLOR[event.task_status] ?? '#8b949e',
                borderColor: STATUS_COLOR[event.task_status] ?? '#8b949e',
              }}
            >
              {event.task_status}
            </span>
          )}
        </div>
        <p style={styles.message}>{event.message}</p>
        {event.task_title && (
          <p style={styles.taskRef}>
            Task #{event.task_id}: {event.task_title}
          </p>
        )}
      </div>
      <span style={styles.time}>{formatTime(event.timestamp)}</span>
    </div>
  )
}

export default function IncidentFeed({ events }) {
  if (!events.length) {
    return (
      <section style={styles.panel}>
        <h2 style={styles.heading}>Incident Feed</h2>
        <div style={styles.empty}>
          <span style={{ fontSize: 32 }}>🟢</span>
          <p style={{ color: '#8b949e', marginTop: 8 }}>No incidents — system healthy</p>
        </div>
      </section>
    )
  }

  return (
    <section style={styles.panel}>
      <h2 style={styles.heading}>
        Incident Feed
        <span style={styles.count}>{events.length}</span>
      </h2>
      <div style={styles.feed}>
        {events.map((e) => (
          <EventRow key={e.id} event={e} />
        ))}
      </div>
    </section>
  )
}

const styles = {
  panel: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 8,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    minWidth: 0,
  },
  heading: {
    fontSize: 15,
    fontWeight: 700,
    color: '#e6edf3',
    borderBottom: '1px solid #30363d',
    paddingBottom: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  count: {
    background: '#21262d',
    color: '#8b949e',
    fontSize: 11,
    fontWeight: 700,
    padding: '1px 7px',
    borderRadius: 10,
  },
  feed: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    maxHeight: 420,
    overflowY: 'auto',
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '8px 0',
    borderBottom: '1px solid #21262d',
  },
  eventBadge: {
    fontSize: 16,
    flexShrink: 0,
    marginTop: 1,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  scenario: {
    background: '#21262d',
    color: '#8b949e',
    fontSize: 10,
    fontWeight: 600,
    padding: '1px 6px',
    borderRadius: 4,
    letterSpacing: '0.05em',
  },
  statusPill: {
    border: '1px solid',
    fontSize: 10,
    fontWeight: 600,
    padding: '1px 6px',
    borderRadius: 4,
  },
  message: {
    color: '#e6edf3',
    fontSize: 13,
  },
  taskRef: {
    color: '#58a6ff',
    fontSize: 11,
    marginTop: 2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  time: {
    color: '#8b949e',
    fontSize: 11,
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  empty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
  },
}
