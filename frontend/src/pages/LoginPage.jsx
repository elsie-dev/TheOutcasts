import { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'

const WELCOME_TEXT =
  "Welcome to Elsie's live demonstration on chaos engineering. " +
  "Today, you will witness how production systems break — memory leaks, network failures, error storms — " +
  "and how engineers detect, diagnose, and recover in real time. Let the chaos begin."

function WelcomeOverlay({ onDone }) {
  const [playing,  setPlaying]  = useState(false)
  const [done,     setDone]     = useState(false)
  const [error,    setError]    = useState(null)
  const audioRef = useRef(null)

  async function handleBegin() {
    setPlaying(true)
    try {
      const res = await fetch('/api/chaos/narrate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: WELCOME_TEXT }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const bytes = Uint8Array.from(atob(data.audio_b64), c => c.charCodeAt(0))
      const blob  = new Blob([bytes], { type: 'audio/mpeg' })
      const url   = URL.createObjectURL(blob)
      const audio = audioRef.current
      audio.src = url
      audio.load()
      audio.onended = () => { URL.revokeObjectURL(url); setDone(true); setTimeout(onDone, 600) }
      audio.onerror = () => { setPlaying(false); setError('Audio failed — click Skip') }
      await audio.play()
    } catch (e) {
      setPlaying(false)
      setError(e.message)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: '#050913' }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full blur-3xl animate-pulse"
          style={{ background: 'rgba(79,142,245,0.04)' }} />
        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full blur-3xl animate-pulse"
          style={{ background: 'rgba(167,139,250,0.04)', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl"
          style={{ background: 'rgba(239,68,68,0.02)' }} />
      </div>

      {/* Grid lines */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'linear-gradient(rgba(79,142,245,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,245,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-2xl">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(79,142,245,0.1)', border: '1px solid rgba(79,142,245,0.25)' }}>
            <svg width="26" height="26" viewBox="0 0 36 36" fill="none">
              <path d="M18 3L33 11.25V28.75L18 37L3 28.75V11.25L18 3Z" stroke="#4f8ef5" strokeWidth="2" fill="rgba(79,142,245,0.1)"/>
              <path d="M18 10L26 14.5V23.5L18 28L10 23.5V14.5L18 10Z" fill="rgba(79,142,245,0.25)" stroke="#4f8ef5" strokeWidth="1.5"/>
              <circle cx="18" cy="19" r="3.5" fill="#4f8ef5"/>
            </svg>
          </div>
          <div className="text-left">
            <p className="text-base font-bold text-tx tracking-tight">FixMe</p>
            <p className="text-xs" style={{ color: '#4f8ef5' }}>Chaos Lab</p>
          </div>
        </div>

        {/* Headline */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: '#4f8ef5' }}>
            Live Demo Presentation
          </p>
          <h1 className="text-4xl font-bold text-tx leading-tight tracking-tight">
            Chaos Engineering<br />
            <span style={{ color: '#4f8ef5' }}>in Production</span>
          </h1>
          <p className="text-sm" style={{ color: '#3a5880' }}>
            by <span className="font-semibold" style={{ color: '#dde6f3' }}>Elsie</span> · TheOutcasts
          </p>
        </div>

        {/* Begin button or playing state */}
        {!playing ? (
          <button
            onClick={handleBegin}
            className="mt-2 flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold tracking-wide transition-all hover:scale-105"
            style={{ background: 'rgba(79,142,245,0.12)', border: '1px solid rgba(79,142,245,0.35)', color: '#4f8ef5' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#4f8ef5" strokeWidth="1.3"/>
              <path d="M6.5 5.5L11 8L6.5 10.5V5.5Z" fill="#4f8ef5"/>
            </svg>
            Begin Presentation
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 px-6 py-3 rounded-xl"
              style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
              <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: '#a78bfa' }} />
              <span className="text-sm font-semibold" style={{ color: '#a78bfa' }}>Speaking…</span>
            </div>
            {/* Audio bars visualiser */}
            <div className="flex items-end gap-1 h-8">
              {[4,7,5,9,6,8,4,7,5,9,6,4].map((h, i) => (
                <div key={i} className="w-1 rounded-full animate-pulse"
                  style={{ height: `${h * 3}px`, background: '#a78bfa', opacity: 0.6, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Skip link */}
        <button
          onClick={onDone}
          className="text-xs transition-colors"
          style={{ color: '#2a4060' }}
          onMouseEnter={e => e.target.style.color = '#3a5880'}
          onMouseLeave={e => e.target.style.color = '#2a4060'}
        >
          {error ? `⚠ ${error} — ` : ''}Skip intro →
        </button>
      </div>

      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  )
}

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
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(false)
  const [showIntro,   setShowIntro]   = useState(true)

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
    <>
      {showIntro && <WelcomeOverlay onDone={() => setShowIntro(false)} />}
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
    </>
  )
}
