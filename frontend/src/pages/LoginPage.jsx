import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

function HexLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M18 3L33 11.25V28.75L18 37L3 28.75V11.25L18 3Z"
        stroke="#3b82f6" strokeWidth="1.5" fill="rgba(59,130,246,0.08)"/>
      <path d="M18 10L26 14.5V23.5L18 28L10 23.5V14.5L18 10Z"
        fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="1"/>
      <circle cx="18" cy="19" r="3.5" fill="#3b82f6"/>
    </svg>
  )
}

const FEATURES = [
  { label: 'Memory pressure testing',   sub: 'Watch RAM spike in real-time' },
  { label: 'Network latency injection', sub: 'Simulate degraded connectivity' },
  { label: 'Error rain simulation',     sub: '40% HTTP 500 failure rate'     },
]

export default function LoginPage({ onSwitchToRegister }) {
  const { login } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl border border-bdr">

        {/* ── Left panel ── */}
        <div className="hidden md:flex flex-col w-[420px] flex-shrink-0 bg-surface2 p-10 relative overflow-hidden">
          {/* Grid pattern background */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40" />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-surface2 via-surface2/90 to-bg" />

          {/* Glow orb */}
          <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full bg-cblue/5 blur-3xl" />
          <div className="absolute bottom-[-60px] right-[-60px] w-[240px] h-[240px] rounded-full bg-cpurple/5 blur-3xl" />

          <div className="relative z-10 flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <HexLogo />
              <div>
                <p className="text-base font-bold text-tx tracking-tight">FixMe</p>
                <p className="text-xs text-txm">Chaos Lab</p>
              </div>
            </div>

            {/* Headline */}
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-tx leading-tight mb-3 tracking-tight">
                Inject chaos.<br />
                <span className="text-cblue">Prove resilience.</span>
              </h1>
              <p className="text-sm text-tx2 leading-relaxed">
                A real-time chaos engineering platform. Test your system's limits and monitor impact as it happens.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-4 mb-auto">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-cblue/15 border border-cblue/25 flex items-center justify-center flex-shrink-0">
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-tx">{f.label}</p>
                    <p className="text-xs text-txm">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom tag */}
            <div className="mt-8 pt-6 border-t border-bdr">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cgreen animate-pulse-dot" />
                <span className="text-xs text-txm">Live monitoring · Real-time metrics</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel (form) ── */}
        <div className="flex-1 bg-surface flex flex-col justify-center px-10 py-12">
          <div className="w-full max-w-sm mx-auto">
            {/* Mobile logo */}
            <div className="flex md:hidden items-center gap-2 mb-8">
              <HexLogo />
              <span className="font-bold text-tx">FixMe Chaos Lab</span>
            </div>

            <h2 className="text-xl font-bold text-tx mb-1 tracking-tight">Sign in</h2>
            <p className="text-sm text-txm mb-7">
              Welcome back.{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-cblue hover:underline font-medium"
              >
                Create an account
              </button>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-cred/8 border border-cred/25 rounded-lg px-3.5 py-2.5 text-sm text-cred animate-fade-in">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="flex-shrink-0">
                    <circle cx="6.5" cy="6.5" r="5.5" stroke="#ef4444" strokeWidth="1.4"/>
                    <path d="M6.5 3.5V7" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round"/>
                    <circle cx="6.5" cy="9" r="0.75" fill="#ef4444"/>
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-tx2 mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-tx2 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
