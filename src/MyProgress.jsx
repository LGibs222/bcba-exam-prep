// OneLove exam-prep — shared "My Progress" screen (presentational only).
// Each app normalizes its own state into these props (domain scores as an
// array of {name, pct|null}), so this one component serves BCBA + RBT.
// Reads no app internals; light/dark via the `theme` prop, brand via `accent`.

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n || 0)))
const band = (p) => p == null ? 'na' : p >= 70 ? 'good' : p >= 50 ? 'mid' : 'low'

export default function MyProgressScreen({
  name = '', accent = '#a64558', theme = 'light',
  overall = null, pre = null, post = null, growth = null,
  domains = [], modulesPassed = 0, modulesTotal = 0,
  safmeds = { tokens: 0, sessions: 0, bestRate: 0 },
  examTaken = false, onHome,
}) {
  const dark = theme === 'dark'
  const ink = dark ? '#f4ede0' : '#1f160d'
  const sub = dark ? 'rgba(244,237,224,0.62)' : '#7a6b58'
  const card = dark ? '#241f1a' : '#fffdf6'
  const line = dark ? 'rgba(244,237,224,0.13)' : 'rgba(31,22,13,0.10)'
  const trk = dark ? 'rgba(244,237,224,0.10)' : 'rgba(31,22,13,0.07)'
  const good = '#3d7a4e', mid = '#b6852a', low = '#b1493f'
  const na = dark ? 'rgba(244,237,224,0.32)' : '#c9bda8'
  const bandColor = (b) => b === 'good' ? good : b === 'mid' ? mid : b === 'low' ? low : na

  const ready = domains.filter(d => d.pct != null && d.pct >= 70).length
  const assessed = domains.filter(d => d.pct != null).length
  const R = 56, CIRC = 2 * Math.PI * R

  const wrap = { maxWidth: 860, margin: '0 auto', padding: '8px 16px 56px', fontFamily: 'Inter, system-ui, sans-serif', color: ink }
  const sect = { background: card, border: `1px solid ${line}`, borderRadius: 16, padding: '22px 24px', marginTop: 18 }
  const h2 = { fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 700, margin: '0 0 14px', color: ink }
  const stat = (v, l, c) => (
    <div style={{ flex: 1, textAlign: 'center', padding: '8px 6px' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: c || accent, fontFamily: 'Fraunces, Georgia, serif', lineHeight: 1 }}>{v}</div>
      <div style={{ fontSize: 11.5, color: sub, marginTop: 6, fontWeight: 600 }}>{l}</div>
    </div>
  )

  return (
    <div style={wrap}>
      <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 26, fontWeight: 800, margin: '6px 0 2px' }}>My Progress</h1>
      <p style={{ color: sub, margin: '0 0 6px', fontSize: 14 }}>{name ? `${name}, here’s` : 'Here’s'} where you stand today.</p>

      <div style={{ ...sect, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: 128, height: 128, flexShrink: 0 }}>
          <svg width={128} height={128} viewBox="0 0 128 128">
            <circle cx={64} cy={64} r={R} fill="none" stroke={trk} strokeWidth={12} />
            <circle cx={64} cy={64} r={R} fill="none" stroke={accent} strokeWidth={12} strokeLinecap="round"
              strokeDasharray={`${CIRC}`} strokeDashoffset={`${CIRC * (1 - clamp(overall) / 100)}`} transform="rotate(-90 64 64)" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 30, fontWeight: 800, fontFamily: 'Fraunces, Georgia, serif', color: ink }}>{overall == null ? '—' : `${clamp(overall)}%`}</div>
            <div style={{ fontSize: 10, color: sub, fontWeight: 700, letterSpacing: '0.08em' }}>READY</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: ink, marginBottom: 4 }}>Exam readiness</div>
          <p style={{ color: sub, fontSize: 13.5, margin: '0 0 10px', lineHeight: 1.5 }}>
            {overall == null ? 'Take the pretest to see your starting point.'
              : examTaken ? 'Based on your most recent mock exam.'
                : 'Based on your pretest — take a mock exam to update it.'}
          </p>
          <span style={{ display: 'inline-block', background: accent, color: '#fff', borderRadius: 999, padding: '4px 12px', fontSize: 12.5, fontWeight: 700 }}>
            {ready} of {domains.length} domains at 70%+
          </span>
        </div>
      </div>

      {growth != null && (
        <div style={sect}>
          <h2 style={h2}>Growth</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {stat(`${clamp(pre)}%`, 'Pretest', sub)}
            <div style={{ fontSize: 22, color: sub }}>{'→'}</div>
            {stat(`${clamp(post)}%`, 'Mock exam', ink)}
            {stat(`${growth >= 0 ? '+' : ''}${growth}`, 'Points gained', growth >= 0 ? good : low)}
          </div>
        </div>
      )}

      <div style={sect}>
        <h2 style={h2}>Domain mastery</h2>
        {domains.length === 0 && <p style={{ color: sub, fontSize: 13.5, margin: 0 }}>Take the pretest to map your domains.</p>}
        {domains.map((d, i) => {
          const b = band(d.pct)
          return (
            <div key={i} style={{ marginBottom: i === domains.length - 1 ? 0 : 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                <span style={{ color: ink, fontWeight: 600 }}>{d.name}</span>
                <span style={{ color: bandColor(b), fontWeight: 700 }}>{d.pct == null ? 'Not assessed' : `${d.pct}%`}</span>
              </div>
              <div style={{ height: 8, background: trk, borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${clamp(d.pct)}%`, height: '100%', background: bandColor(b), borderRadius: 999, transition: 'width .4s' }} />
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <div style={{ ...sect, flex: 1, minWidth: 230 }}>
          <h2 style={h2}>Study modules</h2>
          <div style={{ display: 'flex' }}>
            {stat(`${modulesPassed}/${modulesTotal}`, 'Modules passed', accent)}
            {stat(assessed ? `${ready}` : '—', 'Domains mastered', good)}
          </div>
        </div>
        <div style={{ ...sect, flex: 1, minWidth: 230 }}>
          <h2 style={h2}>SAFMEDS fluency</h2>
          <div style={{ display: 'flex' }}>
            {stat(safmeds.tokens || 0, 'Tokens', accent)}
            {stat(safmeds.sessions || 0, 'Sessions', ink)}
            {stat(safmeds.bestRate ? `${safmeds.bestRate}` : '—', 'Best /min', good)}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 26 }}>
        <button onClick={onHome} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 999, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          Back to Home
        </button>
      </div>
    </div>
  )
}
