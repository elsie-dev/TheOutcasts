const SCENARIOS = [
  {
    id: 'MEMORY_LEAK',
    label: 'Memory Leak',
    description: 'Allocates ~1 MB every 500 ms — watch RAM spike on the chart.',
    color: '#bc8cff',
    icon: '🧠',
  },
  {
    id: 'NETWORK_LATENCY',
    label: 'Network Latency',
    description: 'Injects a 1–3 s random delay on every API request.',
    color: '#d29922',
    icon: '🐢',
  },
  {
    id: 'ERROR_RAIN',
    label: 'Error Rain',
    description: 'Returns HTTP 500 on 40 % of incoming requests.',
    color: '#f85149',
    icon: '💥',
  },
]

export default function ChaosControls({ activeScenarios, onInject, onStop, loading }) {
  const anyActive = activeScenarios.length > 0

  return (
    <section style={styles.panel}>
      <h2 style={styles.heading}>Chaos Control</h2>

      <div style={styles.scenarioList}>
        {SCENARIOS.map((s) => {
          const isActive = activeScenarios.includes(s.id)
          return (
            <div
              key={s.id}
              style={{
                ...styles.scenarioCard,
                borderColor: isActive ? s.color : '#30363d',
                background: isActive ? `${s.color}11` : '#0d1117',
              }}
            >
              <div style={styles.scenarioHeader}>
                <span style={styles.icon}>{s.icon}</span>
                <span style={{ ...styles.name, color: isActive ? s.color : '#e6edf3' }}>
                  {s.label}
                </span>
                {isActive && (
                  <span style={{ ...styles.badge, background: s.color }}>ACTIVE</span>
                )}
              </div>
              <p style={styles.desc}>{s.description}</p>
              <button
                style={{
                  background: isActive ? '#21262d' : s.color,
                  color: isActive ? s.color : '#fff',
                  border: isActive ? `1px solid ${s.color}` : 'none',
                  width: '100%',
                  marginTop: 10,
                }}
                disabled={loading}
                onClick={() => (isActive ? onStop(s.id) : onInject(s.id))}
              >
                {isActive ? 'Stop Scenario' : 'Inject'}
              </button>
            </div>
          )
        })}
      </div>

      <button
        style={styles.stopAll}
        disabled={!anyActive || loading}
        onClick={() => onStop('ALL')}
      >
        ⬛ Stop All Chaos
      </button>
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
  },
  heading: {
    fontSize: 15,
    fontWeight: 700,
    color: '#e6edf3',
    borderBottom: '1px solid #30363d',
    paddingBottom: 10,
  },
  scenarioList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  scenarioCard: {
    border: '1px solid',
    borderRadius: 6,
    padding: '12px 14px',
    transition: 'border-color 0.2s, background 0.2s',
  },
  scenarioHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  icon: { fontSize: 16 },
  name: { fontWeight: 600, flex: 1 },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#fff',
    padding: '2px 6px',
    borderRadius: 4,
    letterSpacing: '0.08em',
  },
  desc: {
    color: '#8b949e',
    fontSize: 12,
    lineHeight: 1.4,
  },
  stopAll: {
    background: '#21262d',
    color: '#f85149',
    border: '1px solid #f85149',
    width: '100%',
    padding: '10px 0',
    marginTop: 4,
  },
}
