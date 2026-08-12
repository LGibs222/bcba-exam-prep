import { useEffect, useRef, useState } from 'react'

/**
 * One Love access gate — client-side soft password protection.
 *
 * SECURITY NOTE: this is a soft gate. The hash + bundle are public, so a
 * determined visitor with DevTools can still see the questions. It stops
 * casual access — for paying-client protection later, swap this for
 * Cloudflare Access in front of the site (see notes in repo README).
 *
 * To CHANGE THE PASSWORD:
 *   1. Pick a new password.
 *   2. In your terminal:
 *        node -e "const c=require('crypto');console.log(c.createHash('sha256').update('onelove-bcba:NEW_PASSWORD_HERE').digest('hex'))"
 *   3. Paste the resulting 64-char hex string into ACCESS_HASH below.
 *   4. Commit + push.
 *
 * To ENABLE LOGIN TRACKING (Google Sheet):
 *   1. Follow setup in repo README — deploy the Apps Script web app.
 *   2. Paste the deployment URL into LOG_ENDPOINT below.
 *   3. Commit + push. Each successful login will append a row.
 *   If LOG_ENDPOINT stays as the placeholder, logging is silently disabled.
 *
 * Access code is required on every page load — no "remember me", no
 * persisted session. Refreshing the tab returns the user to this gate.
 */
const ACCESS_SALT = 'onelove-bcba'
const ACCESS_HASH = '808db059f54ff2c19407024f7029b20519afff487be32f5639f53f2b0ddd0648' // sha256("onelove-bcba:onelove2026")
const APP_NAME = 'BCBA'
const LOG_ENDPOINT = 'https://script.google.com/macros/s/AKfycby5bv49s8z-oA525hit-LnvfgHDam4hUrSmsN79huqC-rnxMFJpB7QbI0isnjdjxQ/exec'

async function sha256Hex(s) {
  const bytes = new TextEncoder().encode(s)
  const buf = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// Fire-and-forget login log. Uses no-cors so a failing endpoint never
// blocks the user, and does NOT await — the gate proceeds regardless.
function logLogin(name, code) {
  if (!LOG_ENDPOINT || LOG_ENDPOINT.startsWith('PASTE_')) return
  try {
    const payload = {
      app: APP_NAME,
      name: name.trim(),
      code: code || '',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent || '',
      timezone: (Intl.DateTimeFormat().resolvedOptions().timeZone) || '',
      referrer: document.referrer || '',
      language: navigator.language || '',
    }
    // sendBeacon is best-effort and non-blocking on unload; fall back to fetch.
    const body = new Blob([JSON.stringify(payload)], { type: 'text/plain' })
    if (!navigator.sendBeacon || !navigator.sendBeacon(LOG_ENDPOINT, body)) {
      fetch(LOG_ENDPOINT, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload), keepalive: true }).catch(() => {})
    }
  } catch { /* never block login on a logging failure */ }
}

// JSONP call to the backend (Apps Script web apps aren't CORS-readable, but a
// <script> tag is). Resolves to the parsed object, or null on error/timeout.
function jsonp(url, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const cb = '__olcb_' + Math.random().toString(36).slice(2)
    let done = false
    const s = document.createElement('script')
    const cleanup = () => { try { delete window[cb] } catch {} if (s.parentNode) s.parentNode.removeChild(s); clearTimeout(timer) }
    const finish = (v) => { if (done) return; done = true; cleanup(); resolve(v) }
    const timer = setTimeout(() => finish(null), timeoutMs)
    window[cb] = (data) => finish(data)
    s.onerror = () => finish(null)
    s.src = url + (url.indexOf('?') < 0 ? '?' : '&') + 'callback=' + cb
    document.head.appendChild(s)
  })
}
// Validate a code against the backend. Returns {valid, name} or null if the
// backend isn't configured/reachable (caller then falls back to the master code).
async function validateCode(code) {
  if (!LOG_ENDPOINT || LOG_ENDPOINT.startsWith('PASTE_')) return null
  const url = LOG_ENDPOINT + (LOG_ENDPOINT.indexOf('?') < 0 ? '?' : '&') +
    'action=validate&app=' + encodeURIComponent(APP_NAME) + '&code=' + encodeURIComponent(code)
  return jsonp(url)
}

// The gate renders BEFORE the app (and its GlobalStyles) mounts, so it
// carries its own copy of the Blue Hour tokens it uses. index.html sets
// data-theme pre-paint, so the gate loads in the right mode.
function GateStyles() {
  return (
    <style>{`
      :root {
        --bg-base: #f5f1e4; --sky0: #dfe4d2; --surface-solid: #fdfbf2;
        --text: #171408; --muted: #5c5340; --border: rgba(23,20,8,0.15);
        --gray: #7c7358; --gold: #a87f10; --gold-ink: #fff8e8;
        --red: #b03a26; --red-brand: #b03a26;
        --shadow: 0 4px 24px rgba(23,20,8,0.08);
      }
      :root[data-theme="dark"] {
        --bg-base: #121108; --sky0: #0b0a06; --surface-solid: #1b1a10;
        --text: #f0ead8; --muted: #97927b; --border: rgba(240,234,216,0.12);
        --gray: #97927b; --gold: #e0a92e; --gold-ink: #241a04;
        --red: #d05a40; --red-brand: #d05a40;
        --shadow: 0 4px 24px rgba(0,0,0,0.5);
      }
      body { margin: 0; background: var(--bg-base); }
    `}</style>
  )
}

function OneLoveGateLogo() {
  return (
    <svg height={40} viewBox="0 0 380 80" xmlns="http://www.w3.org/2000/svg" aria-label="One Love" style={{ display: 'block' }}>
      <text x="170" y="60" textAnchor="end" fontFamily="Fraunces, Georgia, serif" fontWeight="900" fontSize="54" letterSpacing="-1.2" fill="var(--text)">One</text>
      <g transform="translate(190, 35)">
        <path d="M 10 4 C 10 -2, 4 -6, 0 -2 C -4 -6, -10 -2, -10 4 C -10 11, 0 17, 0 17 C 0 17, 10 11, 10 4 Z" fill="var(--red-brand)"/>
      </g>
      <text x="208" y="60" fontFamily="Fraunces, Georgia, serif" fontWeight="900" fontStyle="italic" fontSize="54" letterSpacing="-1.2" fill="var(--text)">Love</text>
    </svg>
  )
}

export default function Gate({ children }) {
  const [authed, setAuthed] = useState(false)
  const [name, setName] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const nameRef = useRef(null)

  useEffect(() => { if (!authed) nameRef.current?.focus() }, [authed])

  function admit(displayName, code) {
    const nm = (displayName || name).trim()
    logLogin(nm, code)
    try {
      localStorage.setItem('ol-user', nm)
      // Kept for the tutor + read-aloud backends, which re-validate it
      // server-side on every request (per-user quota + budget enforcement).
      localStorage.setItem('ol-code', code || '')
    } catch {}
    setAuthed(true)
  }
  async function onSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !pw || busy) return
    setBusy(true); setError('')
    const code = pw.trim()
    try {
      const res = await validateCode(code)
      if (res && res.valid) { admit(res.name || name, code); return }
      if (res && res.valid === false) { setError('That access code isn’t recognized. Request one below.'); return }
      const candidate = await sha256Hex(`${ACCESS_SALT}:${code}`)
      if (candidate === ACCESS_HASH) {
        admit(name, code)
      } else {
        setError('That access code didn’t match. Check with your provider.')
      }
    } catch {
      setError('Browser couldn’t verify. Try a different browser.')
    } finally {
      setBusy(false); setPw('')
    }
  }

  if (authed) return children

  const fieldLabel = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }
  const fieldInput = (errored) => ({
    width: '100%', padding: '12px 14px', fontSize: 15,
    border: `1.5px solid ${errored ? 'var(--red)' : 'var(--border)'}`,
    borderRadius: 10, background: 'var(--surface-solid)', color: 'var(--text)',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  })

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: 'linear-gradient(180deg, var(--sky0) 0%, var(--bg-base) 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <GateStyles/>
      <div style={{
        width: '100%', maxWidth: 440, background: 'var(--surface-solid)', border: '1px solid var(--border)',
        borderRadius: 18, padding: '36px 32px 28px', boxShadow: 'var(--shadow)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <OneLoveGateLogo/>
        </div>
        <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 22 }}>
          Licensed Behavior Analysts PLLC
        </div>
        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, fontSize: 22, color: 'var(--text)', margin: '0 0 6px', textAlign: 'center' }}>
          BCBA Exam Prep
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 22px', textAlign: 'center', lineHeight: 1.5 }}>
          Sign in to continue.
        </p>
        <form onSubmit={onSubmit}>
          <label htmlFor="ol-name" style={fieldLabel}>Your name</label>
          <input
            id="ol-name" ref={nameRef} type="text" autoComplete="name" spellCheck={false}
            value={name} onChange={e => setName(e.target.value)} disabled={busy}
            placeholder="First and last name"
            style={fieldInput(false)}
          />
          <label htmlFor="ol-pw" style={{ ...fieldLabel, marginTop: 14 }}>Access code</label>
          <input
            id="ol-pw" type="password" autoComplete="off" spellCheck={false}
            value={pw} onChange={e => setPw(e.target.value)} disabled={busy}
            style={fieldInput(!!error)}
          />
          {error && <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--red)' }}>{error}</div>}
          <button type="submit" disabled={busy || !pw || !name.trim()}
            style={{
              width: '100%', marginTop: 16, padding: '13px', borderRadius: 10, border: 'none',
              background: (busy || !pw || !name.trim()) ? 'var(--gray)' : 'var(--gold)',
              color: (busy || !pw || !name.trim()) ? '#fff' : 'var(--gold-ink)',
              fontSize: 14.5, fontWeight: 700, letterSpacing: '0.02em',
              cursor: (busy || !pw || !name.trim()) ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}>
            {busy ? 'Verifying…' : 'Enter'}
          </button>
        </form>
        <a href="https://lgibs222.github.io/onelove-exam-prep/#request" target="_blank" rel="noopener"
          style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 16, padding: '12px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: 13.5, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>
          Don’t have a code? Request access →
        </a>
        <p style={{ fontSize: 11, color: 'var(--muted)', margin: '12px 0 0', textAlign: 'center', lineHeight: 1.5 }}>
          Or email <a href="mailto:lenwoodjr@gmail.com" style={{ color: 'var(--text)', fontWeight: 600 }}>lenwoodjr@gmail.com</a>
        </p>
      </div>
    </div>
  )
}
