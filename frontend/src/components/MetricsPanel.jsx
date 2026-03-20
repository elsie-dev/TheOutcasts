import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from 'recharts'

const CHARTS = [
  { key: 'memory_mb',      label: 'Memory Usage',  unit: 'MB',  color: '#a78bfa', domain: [0, 'auto'] },
  { key: 'cpu_percent',    label: 'CPU',            unit: '%',   color: '#22c55e', domain: [0, 100]    },
  { key: 'avg_latency_ms', label: 'Avg Latency',    unit: 'ms',  color: '#f59e0b', domain: [0, 'auto'] },
  { key: 'error_rate_pct', label: 'Error Rate',     unit: '%',   color: '#ef4444', domain: [0, 100]    },
]

function getTrend(history, key) {
  if (history.length < 4) return null
  const vals = history.slice(-4).map(h => h[key] ?? 0)
  const slope = vals[3] - vals[0]
  if (slope > 2)  return 'up'
  if (slope < -2) return 'down'
  return null
}

function Sparkline({ data, dataKey, color, domain }) {
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`g-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <YAxis domain={domain} hide />
        <Tooltip
          contentStyle={{ background: '#0e1221', border: '1px solid #1c2d4a', borderRadius: 6, fontSize: 11, color: '#dde6f3' }}
          labelFormatter={() => ''}
          formatter={v => [`${v}`, '']}
          cursor={{ stroke: '#253d62', strokeWidth: 1 }}
        />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5}
          fill={`url(#g-${dataKey})`} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function MetricCard({ label, unit, color, dataKey, domain, history, current }) {
  const trend = getTrend(history, dataKey)
  const val = current != null
    ? (typeof current === 'number' ? current.toFixed(current < 10 ? 1 : 0) : current)
    : '—'

  return (
    <div className="card flex flex-col" style={{ borderTop: `2px solid ${color}20`, borderImage: 'none' }}>
      {/* Top accent line */}
      <div className="h-[2px] w-full rounded-t-xl" style={{ background: color }} />

      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <span className="panel-title">{label}</span>
          {trend && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d={trend === 'up' ? 'M5 9V1M1.5 4.5L5 1L8.5 4.5' : 'M5 1V9M8.5 5.5L5 9L1.5 5.5'}
                stroke={trend === 'up' ? color : '#3a5880'}
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-[32px] font-bold leading-none tabular-nums tracking-tight" style={{ color }}>
            {val}
          </span>
          <span className="text-xs font-semibold" style={{ color: `${color}80` }}>{unit}</span>
        </div>
      </div>

      <Sparkline data={history} dataKey={dataKey} color={color} domain={domain} />
    </div>
  )
}

export default function MetricsPanel({ history }) {
  const latest = history[history.length - 1] ?? {}

  return (
    <section className="grid grid-cols-4 gap-3">
      {CHARTS.map(c => (
        <MetricCard key={c.key} {...c} history={history} current={latest[c.key]} />
      ))}
    </section>
  )
}
