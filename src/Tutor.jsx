import { useEffect, useRef, useState } from 'react'

/**
 * Ask Dr. Gibson — voice tutor drawer.
 *
 * Floating button + slide-up chat drawer scoped to the question currently on
 * screen. Voice-first (tap-to-talk → backend STT → Claude → reply spoken in
 * Dr. Gibson's cloned voice) with typed input always available. The backend
 * enforces per-user daily quota and the global monthly budget; this component
 * only renders what it's told.
 *
 * Wiring:
 *   - Question screens call useTutorQuestion(question, answered, userAnswer, source)
 *   - Review cards render <AskTutorButton question={q} userAnswer={i}/>
 *   - App root mounts <TutorFab blocked={phase === 'fullexam'}/> once.
 */
const TUTOR_ENDPOINT = 'https://onelove-tutor-backend.vercel.app/api/tutor'
const APP_ID = 'BCBA'
// Theme — OneLove cream (matches the BCBA app's warm sunrise palette).
const T = {
  accent: '#a64558', ink: '#1f160d', surface: '#fffdf6',
  soft: '#f6efe0', border: 'rgba(22,18,16,0.15)', muted: '#7a6b58',
  bubbleUser: '#1f160d', bubbleUserText: '#faf6ec',
}

// ── module-level store (same pattern as TTS.jsx) ─────────────────────
let store = { ctx: null, open: false }
const subs = new Set()
const emit = () => subs.forEach(fn => fn())

const pickQuestion = q => ({
  id: q.id ?? null, stem: q.stem, options: q.options,
  correct: q.correct, rationale: q.rationale, domain_name: q.domain_name,
})

/** Register the question currently on screen. Call from question components. */
export function useTutorQuestion(q, answered, userAnswer, source) {
  useEffect(() => {
    if (!q || !q.stem) return
    store = { ...store, ctx: { question: pickQuestion(q), answered: !!answered, userAnswer: answered ? userAnswer : null, source: source || '' } }
    emit()
    return () => { store = { ...store, ctx: null }; emit() }
  }, [q && q.stem, answered, userAnswer])
}

/** Render-anywhere variant of useTutorQuestion — safe inside conditional JSX. */
export function TutorContext({ q, answered, userAnswer, source }) {
  useTutorQuestion(q, answered, userAnswer, source)
  return null
}

/** Open the drawer for a specific (already-answered) question — review lists. */
export function openTutorFor(q, userAnswer, source) {
  store = { ctx: { question: pickQuestion(q), answered: true, userAnswer: userAnswer ?? null, source: source || 'review' }, open: true }
  emit()
}

function useStore() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const fn = () => setTick(t => t + 1)
    subs.add(fn)
    return () => subs.delete(fn)
  }, [])
  return store
}

const getIdentity = () => {
  let name = '', code = ''
  try { name = localStorage.getItem('ol-user') || ''; code = localStorage.getItem('ol-code') || '' } catch {}
  return { name, code }
}

const getMuted = () => { try { return localStorage.getItem('ol-tutor-muted') === '1' } catch { return false } }
const setMutedLS = m => { try { localStorage.setItem('ol-tutor-muted', m ? '1' : '0') } catch {} }

// single shared reply-audio element
let replyAudio = null
function playReply(b64) {
  try {
    if (!replyAudio) replyAudio = new Audio()
    replyAudio.pause()
    replyAudio.src = 'data:audio/mpeg;base64,' + b64
    replyAudio.play().catch(() => {})
  } catch {}
}
function stopReply() { try { replyAudio && replyAudio.pause() } catch {} }

const LIMIT_MESSAGES = {
  limit_daily: 'You’ve used all 20 tutor questions for today — that’s solid studying. The counter resets tomorrow.',
  limit_budget: 'The tutor has reached this month’s usage budget and is taking a break. It’ll be back — email Dr. Gibson if you need it sooner.',
  bad_code: 'Your session couldn’t be verified. Refresh the page and sign in again.',
  quota_backend_unreachable: 'The tutor couldn’t reach its home base. Try again in a minute.',
  audio_too_long: 'That recording was a bit long — try asking in a shorter clip.',
  no_input: 'I didn’t catch that — try again, a little closer to the mic.',
  server: 'Something hiccuped on the tutor’s end. Try that again.',
}

/** Small "Ask Dr. Gibson" chip for review lists (missed-question cards). */
export function AskTutorButton({ question, userAnswer, source, style = {} }) {
  return (
    <button type="button" onClick={() => openTutorFor(question, userAnswer, source)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px',
        borderRadius: 99, border: `1px solid ${T.accent}`, background: 'transparent',
        color: T.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        whiteSpace: 'nowrap', ...style,
      }}>
      🎙️ Ask Dr. Gibson
    </button>
  )
}

export function TutorFab({ blocked }) {
  const s = useStore()
  const ctx = s.ctx
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [recording, setRecording] = useState(false)
  const [muted, setMuted] = useState(getMuted)
  const [remaining, setRemaining] = useState(null)
  const [notice, setNotice] = useState('')
  const recRef = useRef(null)
  const chunksRef = useRef([])
  const stemRef = useRef('')
  const scrollRef = useRef(null)

  // new question on screen → fresh conversation
  const stem = ctx?.question?.stem || ''
  useEffect(() => {
    if (stem && stem !== stemRef.current) {
      stemRef.current = stem
      setMessages([]); setNotice(''); stopReply()
    }
  }, [stem])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, busy])

  if (!ctx || blocked) { if (s.open) { store = { ...store, open: false } } return null }
  const open = s.open
  const setOpen = v => { store = { ...store, open: v }; emit(); if (!v) { stopReply(); stopRecording(true) } }

  async function send({ text, audio }) {
    if (busy) return
    const { name, code } = getIdentity()
    setBusy(true); setNotice('')
    if (text) setMessages(m => [...m, { role: 'user', content: text }])
    else setMessages(m => [...m, { role: 'user', content: '🎤 …', pendingVoice: true }])
    try {
      const history = messages.filter(m => !m.pendingVoice).map(m => ({ role: m.role, content: m.content }))
      const r = await fetch(TUTOR_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app: APP_ID, name, code,
          question: ctx.question, answered: ctx.answered, userAnswer: ctx.userAnswer,
          history, text: text || undefined, audio: audio || undefined,
          voiceReply: !muted,
        }),
      })
      const j = await r.json()
      if (!j.ok) {
        setMessages(m => m.filter(x => !x.pendingVoice))
        setNotice(LIMIT_MESSAGES[j.error] || LIMIT_MESSAGES.server)
        return
      }
      setMessages(m => [
        ...m.filter(x => !x.pendingVoice),
        ...(text ? [] : [{ role: 'user', content: j.transcript }]),
        { role: 'assistant', content: j.reply },
      ])
      if (j.remainingToday !== null && j.remainingToday !== undefined) setRemaining(j.remainingToday)
      if (j.audioBase64 && !muted) playReply(j.audioBase64)
    } catch {
      setMessages(m => m.filter(x => !x.pendingVoice))
      setNotice(LIMIT_MESSAGES.server)
    } finally { setBusy(false) }
  }

  function onSubmitText(e) {
    e.preventDefault()
    const t = input.trim()
    if (!t || busy) return
    setInput('')
    send({ text: t })
  }

  async function startRecording() {
    if (recording || busy) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(t => MediaRecorder.isTypeSupported(t)) || ''
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      chunksRef.current = []
      rec.ondataavailable = ev => { if (ev.data && ev.data.size) chunksRef.current.push(ev.data) }
      rec.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' })
        if (blob.size < 1200) return // accidental tap
        const fr = new FileReader()
        fr.onload = () => {
          const b64 = String(fr.result).split(',')[1] || ''
          if (b64) send({ audio: { base64: b64, mime: blob.type } })
        }
        fr.readAsDataURL(blob)
      }
      rec.start()
      recRef.current = rec
      setRecording(true)
      stopReply()
    } catch {
      setNotice('Mic access was blocked. You can still type your question below.')
    }
  }
  function stopRecording(cancel) {
    const rec = recRef.current
    recRef.current = null
    setRecording(false)
    if (!rec) return
    if (cancel) { try { rec.ondataavailable = null; rec.onstop = () => rec.stream?.getTracks?.().forEach(t => t.stop()) } catch {} }
    try { rec.state !== 'inactive' && rec.stop() } catch {}
  }

  const fab = (
    <button type="button" onClick={() => setOpen(true)} aria-label="Ask Dr. Gibson about this question"
      style={{
        position: 'fixed', right: 16, bottom: 16, zIndex: 9000,
        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px',
        borderRadius: 99, border: 'none', background: T.accent, color: '#fff',
        fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
        boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
      }}>
      🎙️ Ask Dr. Gibson
    </button>
  )

  if (!open) return fab

  const suggestion = ctx.answered ? 'Why is my answer wrong?' : 'Can you give me a hint?'
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.35)' }}
      onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
      <div style={{
        background: T.surface, borderRadius: '18px 18px 0 0', maxHeight: '78vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.3)', width: '100%', maxWidth: 700, margin: '0 auto',
        fontFamily: 'Inter, system-ui, sans-serif', color: T.ink,
      }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 10px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, flexShrink: 0 }}>DG</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14.5 }}>Dr. Gibson</div>
            <div style={{ fontSize: 11, color: T.muted }}>
              {ctx.answered ? 'Reviewing this question with you' : 'Coaching — no spoilers before you answer'}
              {remaining !== null ? ` · ${remaining} left today` : ''}
            </div>
          </div>
          <button type="button" onClick={() => { const m = !muted; setMuted(m); setMutedLS(m); if (m) stopReply() }}
            title={muted ? 'Voice replies off' : 'Voice replies on'}
            style={{ border: `1px solid ${T.border}`, background: 'transparent', borderRadius: 99, padding: '6px 10px', cursor: 'pointer', fontSize: 14 }}>
            {muted ? '🔇' : '🔊'}
          </button>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close"
            style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: T.muted, padding: 4 }}>✕</button>
        </div>

        {/* messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 140 }}>
          {messages.length === 0 && (
            <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>
              Ask me anything about this question — tap the mic and talk, or type below.{' '}
              {ctx.answered ? 'You’ve answered, so I can walk through the whole item with you.' : 'You haven’t answered yet, so I’ll coach without giving it away.'}
              <div style={{ marginTop: 10 }}>
                <button type="button" onClick={() => send({ text: suggestion })} disabled={busy}
                  style={{ padding: '7px 12px', borderRadius: 99, border: `1px solid ${T.border}`, background: T.soft, color: T.ink, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  “{suggestion}”
                </button>
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%',
              background: m.role === 'user' ? T.bubbleUser : T.soft,
              color: m.role === 'user' ? T.bubbleUserText : T.ink,
              padding: '10px 13px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              fontSize: 13.5, lineHeight: 1.55, whiteSpace: 'pre-wrap',
            }}>{m.content}</div>
          ))}
          {busy && <div style={{ alignSelf: 'flex-start', color: T.muted, fontSize: 13 }}>Dr. Gibson is thinking…</div>}
          {notice && <div style={{ alignSelf: 'stretch', background: '#fdf1e3', border: '1px solid #eacB9a', color: '#7a4a12', borderRadius: 10, padding: '9px 12px', fontSize: 12.5, lineHeight: 1.5 }}>{notice}</div>}
        </div>

        {/* input row */}
        <form onSubmit={onSubmitText} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 12px', borderTop: `1px solid ${T.border}` }}>
          <button type="button"
            onClick={() => recording ? stopRecording(false) : startRecording()}
            disabled={busy}
            aria-label={recording ? 'Stop recording and send' : 'Ask by voice'}
            style={{
              width: 46, height: 46, borderRadius: '50%', border: 'none', flexShrink: 0,
              background: recording ? '#c0392b' : T.accent, color: '#fff', fontSize: 19, cursor: busy ? 'default' : 'pointer',
              animation: recording ? 'olTutorPulse 1.2s infinite' : 'none',
            }}>
            {recording ? '■' : '🎤'}
          </button>
          <input value={input} onChange={e => setInput(e.target.value)} disabled={busy || recording}
            placeholder={recording ? 'Listening… tap ■ to send' : 'Or type your question…'}
            style={{ flex: 1, padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${T.border}`, background: '#fff', color: T.ink, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
          <button type="submit" disabled={busy || recording || !input.trim()}
            style={{ padding: '11px 16px', borderRadius: 12, border: 'none', background: (busy || !input.trim()) ? T.border : T.ink, color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit' }}>
            Send
          </button>
        </form>
        <div style={{ padding: '0 16px 12px', fontSize: 10.5, color: T.muted, textAlign: 'center' }}>
          AI tutor — verify with your course materials. Conversations are recorded to improve the app.
        </div>
        <style>{`@keyframes olTutorPulse { 0%{box-shadow:0 0 0 0 rgba(192,57,43,0.5)} 70%{box-shadow:0 0 0 14px rgba(192,57,43,0)} 100%{box-shadow:0 0 0 0 rgba(192,57,43,0)} }`}</style>
      </div>
    </div>
  )
}
