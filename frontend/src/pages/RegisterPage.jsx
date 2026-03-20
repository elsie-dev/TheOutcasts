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

export default function RegisterPage({ onSwitchToLogin }) {
  const { register } = useAuth()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
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
          <div className="absolute inset-0 bg-grid-pattern opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-br from-surface2 via-surface2/90 to-bg" />
          <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full bg-cpurple/5 blur-3xl" />
          <div className="absolute bottom-[-60px] right-[-60px] w-[240px] h-[240px] rounded-full bg-cblue/5 blur-3xl" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-12">
              <HexLogo />
              <div>
                <p className="text-base font-bold text-tx tracking-tight">FixMe</p>
                <p className="text-xs text-txm">Chaos Lab</p>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-tx leading-tight mb-4 tracking-tight">
              Start engineering<br />
              <span className="text-cpurple">with confidence.</span>
            </h1>
            <p className="text-sm text-tx2 leading-relaxed mb-10">
              Join the platform that lets you deliberately break things in a controlled environment — so production stays strong.
            </p>

            <div className="bg-surface/60 border border-bdr rounded-xl p-5 mb-auto">
              <p className="text-xs font-semibold text-tx2 uppercase tracking-widest mb-3">What you get</p>
              <ul className="space-y-2.5">
                {['Real-time system metrics', 'Three chaos scenarios', 'Auto incident tracking', 'Grafana dashboard'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-tx2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cpurple flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-bdr">
              <p className="text-xs text-txm">Already have an account?{' '}
                <button onClick={onSwitchToLogin} className="text-cblue hover:underline font-medium">Sign in</button>
              </p>
            </div>
          </div>
        </div>

        {/* ── Right panel (form) ── */}
        <div className="flex-1 bg-surface flex flex-col justify-center px-10 py-12">
          <div className="w-full max-w-sm mx-auto">
            <div className="flex md:hidden items-center gap-2 mb-8">
              <HexLogo />
              <span className="font-bold text-tx">FixMe Chaos Lab</span>
            </div>

            <h2 className="text-xl font-bold text-tx mb-1 tracking-tight">Create account</h2>
            <p className="text-sm text-txm mb-7">
              Already have one?{' '}
              <button type="button" onClick={onSwitchToLogin} className="text-cblue hover:underline font-medium">
                Sign in
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-tx2 mb-1.5">First name</label>
                  <input type="text" required className="input-field" placeholder="Jane"
                    value={form.firstName} onChange={set('firstName')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-tx2 mb-1.5">Last name</label>
                  <input type="text" required className="input-field" placeholder="Smith"
                    value={form.lastName} onChange={set('lastName')} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-tx2 mb-1.5">Email address</label>
                <input type="email" required autoComplete="email" className="input-field"
                  placeholder="you@example.com" value={form.email} onChange={set('email')} />
              </div>

              <div>
                <label className="block text-xs font-medium text-tx2 mb-1.5">Password</label>
                <input type="password" required autoComplete="new-password" className="input-field"
                  placeholder="Min 8 characters" value={form.password} onChange={set('password')} />
              </div>

              <button type="submit" disabled={loading} className="btn-primary mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Creating account…
                  </span>
                ) : 'Create account'}
              </button>

              <p className="text-xs text-txm text-center pt-1">
                By creating an account you agree to our terms of service.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
