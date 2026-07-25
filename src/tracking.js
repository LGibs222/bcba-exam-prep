// OneLove performance telemetry — sends per-user study milestones to the
// tracking backend (Google Apps Script web app; see cst-rebuild/tracking-backend.gs).
// Fire-and-forget via sendBeacon; never blocks or breaks the UI; no-ops until
// TRACK_ENDPOINT is set.
const TRACK_ENDPOINT = 'https://script.google.com/macros/s/AKfycby5bv49s8z-oA525hit-LnvfgHDam4hUrSmsN79huqC-rnxMFJpB7QbI0isnjdjxQ/exec'
const APP_ID = 'BCBA'

// The name entered at the access gate — stored by Gate.jsx on sign-in.
export function getUser() {
  try { return localStorage.getItem('ol-user') || '' } catch { return '' }
}

export function track(event, payload = {}) {
  if (!TRACK_ENDPOINT || TRACK_ENDPOINT.startsWith('PASTE_')) return
  try {
    const body = JSON.stringify({
      kind: 'event', app: APP_ID, name: getUser(), event, payload,
      timestamp: new Date().toISOString(),
      timezone: (Intl.DateTimeFormat().resolvedOptions().timeZone) || '',
      userAgent: navigator.userAgent || '',
    })
    const blob = new Blob([body], { type: 'text/plain' })
    if (!navigator.sendBeacon || !navigator.sendBeacon(TRACK_ENDPOINT, blob)) {
      fetch(TRACK_ENDPOINT, { method: 'POST', mode: 'no-cors', body, keepalive: true }).catch(() => {})
    }
  } catch { /* telemetry must never break the app */ }
}
