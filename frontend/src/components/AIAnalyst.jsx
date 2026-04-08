import { useState, useRef, useEffect } from 'react'

// ── Scenario alert sounds via Web Audio API ───────────────────────────────────
function playAlertSound(type, audioCtx) {
  if (!audioCtx) return
  const now = audioCtx.currentTime

  if (['MEMORY_LEAK', 'NETWORK_LATENCY', 'ERROR_RAIN'].includes(type)) {
    // Same sharp alarm for all chaos scenarios — square wave, 880/660 Hz alternating
    const freqs = [880, 660, 880, 660]
    freqs.forEach((freq, i) => {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.connect(gain); gain.connect(audioCtx.destination)
      osc.type = 'square'; osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now + i * 0.15)
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.15 + 0.02)
      gain.gain.linearRampToValueAtTime(0, now + i * 0.15 + 0.13)
      osc.start(now + i * 0.15); osc.stop(now + i * 0.15 + 0.13)
    })
  } else if (type === 'STOP') {
    // Clean resolution tone
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain); gain.connect(audioCtx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.linearRampToValueAtTime(660, now + 0.3)
    gain.gain.setValueAtTime(0.2, now)
    gain.gain.linearRampToValueAtTime(0, now + 0.4)
    osc.start(now); osc.stop(now + 0.4)
  }
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AIAnalyst({ activeScenarios, muted, onMuteToggle }) {
  const [diagnosis, setDiagnosis]   = useState(null)
  const [loading, setLoading]       = useState(false)
  const [speaking, setSpeaking]     = useState(false)
  const [error, setError]           = useState(null)
  const audioCtxRef  = useRef(null)
  const prevScenRef  = useRef([])
  const audioElemRef = useRef(null)

  // Initialise AudioContext on first interaction
  function ensureAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  // Play alert when scenarios change
  useEffect(() => {
    const prev = prevScenRef.current
    const added   = activeScenarios.filter(s => !prev.includes(s))
    const removed = prev.filter(s => !activeScenarios.includes(s))

    if (!muted) {
      const ctx = ensureAudioCtx()
      added.forEach(s => playAlertSound(s, ctx))
      if (removed.length > 0 && added.length === 0) playAlertSound('STOP', ctx)
    }

    // Clear diagnosis when all scenarios stop
    if (activeScenarios.length === 0 && prev.length > 0) {
      setDiagnosis(null)
      setError(null)
    }

    prevScenRef.current = activeScenarios
  }, [activeScenarios, muted])

  async function handleAnalyse() {
    setLoading(true); setError(null); setDiagnosis(null)
    ensureAudioCtx()
    try {
      // 1 — get diagnosis from Claude
      const res = await fetch('/api/chaos/analyze/', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || data.error) { setError(data.error ?? 'Analysis failed'); return }
      setDiagnosis(data.diagnosis)

      // 2 — send to ElevenLabs and play
      if (!muted) {
        setSpeaking(true)
        try {
          const nr = await fetch('/api/chaos/narrate/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: data.diagnosis }),
          })
          const nd = await nr.json()
          if (nd.error) {
            setError(`Voice error: ${nd.error}`)
            setSpeaking(false)
          } else if (nd.audio_b64) {
            const bytes = Uint8Array.from(atob(nd.audio_b64), c => c.charCodeAt(0))
            const blob = new Blob([bytes], { type: 'audio/mpeg' })
            const url = URL.createObjectURL(blob)
            const audio = audioElemRef.current
            audio.src = url
            audio.load()
            audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url) }
            audio.onerror = (e) => {
              setError('Audio playback failed — check browser permissions')
              setSpeaking(false)
              URL.revokeObjectURL(url)
            }
            try {
              await audio.play()
            } catch (playErr) {
              setError(`Playback blocked: ${playErr.message}`)
              setSpeaking(false)
            }
          } else {
            setError('No audio returned from ElevenLabs')
            setSpeaking(false)
          }
        } catch (e) {
          setError(`Voice failed: ${e.message}`)
          setSpeaking(false)
        }
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleStopAudio() {
    if (audioElemRef.current) { audioElemRef.current.pause(); audioElemRef.current.currentTime = 0 }
    setSpeaking(false)
  }

  const hasActive = activeScenarios.length > 0

  return (
    <div className="card" style={{ minWidth: 0 }}>
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-bdr flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#a78bfa' }} />
          <span className="panel-title">AI Incident Analyst</span>
          {speaking && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: '#a78bfa' }} />
              SPEAKING
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Mute toggle */}
          <button
            onClick={onMuteToggle}
            title={muted ? 'Unmute audio' : 'Mute audio'}
            className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md transition-all"
            style={muted
              ? { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }
              : { background: '#162036', border: '1px solid #1c2d4a', color: '#3a5880' }
            }
          >
            {muted ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4H4L7 1.5V10.5L4 8H2V4Z" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="9" y1="4" x2="11" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="11" y1="4" x2="9" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4H4L7 1.5V10.5L4 8H2V4Z" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M9 3.5C9.8 4.3 10.3 5.4 10.3 6C10.3 6.6 9.8 7.7 9 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            )}
            {muted ? 'Muted' : 'Sound on'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3">
        {!hasActive && !diagnosis && (
          <p className="text-[12px]" style={{ color: '#3a5880' }}>
            Inject a chaos scenario then click <strong style={{ color: '#a78bfa' }}>Analyse</strong> to get an AI diagnosis.
          </p>
        )}

        {/* Analyse button */}
        {hasActive && (
          <button
            onClick={handleAnalyse}
            disabled={loading || speaking}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-bold tracking-wide transition-all disabled:opacity-50"
            style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa' }}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="5" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="8 8"/>
                </svg>
                Analysing…
              </>
            ) : speaking ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: '#a78bfa' }} />
                AI Speaking…
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="5.5" stroke="#a78bfa" strokeWidth="1.2"/>
                  <path d="M4.5 6.5L6 8L8.5 5" stroke="#a78bfa" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Analyse Incident
              </>
            )}
          </button>
        )}

        {/* Error */}
        {error && (
          <p className="text-[11px] px-3 py-2 rounded-lg" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
            {error}
          </p>
        )}

        {/* Diagnosis card */}
        {diagnosis && (
          <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: '#a78bfa' }}>
                AI Diagnosis
              </span>
              {speaking && (
                <button
                  onClick={handleStopAudio}
                  className="text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  Stop
                </button>
              )}
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: '#dde6f3' }}>
              {diagnosis}
            </p>
          </div>
        )}
      </div>

      {/* Hidden audio element for ElevenLabs playback */}
      <audio ref={audioElemRef} style={{ display: 'none' }} />
    </div>
  )
}
