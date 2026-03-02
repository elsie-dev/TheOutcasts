import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from 'recharts'

const CHARTS = [
  {
    key: 'memory_mb',
    label: 'Memory',
    unit: 'MB',
    color: '#bc8cff',
    domain: [0, 'auto'],
  },
  {
    key: 'cpu_percent',
    label: 'CPU',
    unit: '%',
    color: '#3fb950',
    domain: [0, 100],
  },
  {
    key: 'avg_latency_ms',
    label: 'Latency',
    unit: 'ms',
    color: '#d29922',
    domain: [0, 'auto'],
  },
  {
    key: 'error_rate_pct',
    label: 'Error Rate',
    unit: '%',
    color: '#f85149',
    domain: [0, 100],
  },
]

function Sparkline({ data, dataKey, color, domain }) {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={domain} hide />
        <Tooltip
          contentStyle={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 6,
            fontSize: 12,
          }}
          labelFormatter={() => ''}
          formatter={(v) => [v, dataKey]}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${dataKey})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function MetricCard({ label, unit, color, dataKey, domain, history, current }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={{ ...styles.dot, background: color }} />
        <span style={styles.label}>{label}</span>
      </div>
      <div style={{ ...styles.value, color }}>
        {current ?? '—'}
        <span style={styles.unit}> {unit}</span>
      </div>
      <Sparkline data={history} dataKey={dataKey} color={color} domain={domain} />
    </div>
  )
}

export default function MetricsPanel({ history }) {
  const latest = history[history.length - 1] ?? {}

  return (
    <section style={styles.grid}>
      {CHARTS.map((c) => (
        <MetricCard
          key={c.key}
          {...c}
          history={history}
          current={latest[c.key]}
        />
      ))}
    </section>
  )
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
  },
  card: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 8,
    padding: '14px 16px 10px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  label: {
    color: '#8b949e',
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  value: {
    fontSize: 26,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    marginBottom: 6,
  },
  unit: {
    fontSize: 13,
    fontWeight: 400,
    color: '#8b949e',
  },
}
