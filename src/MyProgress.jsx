// OneLove exam-prep — shared "My Progress" screen (presentational only).
// Each app normalizes its own state into these props (domain scores as an
// array of {name, pct|null}), so this one component serves BCBA + RBT.
// Reads no app internals; light/dark via the `theme` prop, brand via `accent`.

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n || 0)))
const band = (p) => p == null ? 'na' : p >= 70 ? 'good' : p >= 50 ? 'mid' : 'low'
// Heat-map bands per the error-analysis spec: green >=80, amber 60–79, red <60.
const heatBand = (p) => p == null ? 'na' : p >= 80 ? 'good' : p >= 60 ? 'mid' : 'low'

export default function MyProgressScreen({
  name = '', accent = '#a64558', theme = 'light',
  overall = null, pre = null, post = null, growth = null,
  domains = [], modulesPassed = 0, modulesTotal = 0,
  safmeds = { tokens: 0, sessions: 0, bestRate: 0 },
  examTaken = false, onHome,
  // Pass-rate + error-analysis additions (all optional; screen degrades gracefully)
  projection = null,          // { projected, bar, verdict, attempts:[{scaled,type,ts}] } | null
  scaleMax = 500,
  heatDomains = [],           // [{ name, pct|null, correct, total, trend }]
  weakest = [],               // ranked weakest assessed domains (subset of heatDomains)
  missBank = null,            // { active, retired }
  onStudyDomain, onReviewMisses,
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

  // Solid light-base tints (Engagement.jsx pattern) — readable in BOTH themes;
  // every cell also carries its % number so color is never the only signal.
  const heat = dark ? {
    good: { bg: '#24382a', fg: '#a6d3b0' }, mid: { bg: '#3c3418', fg: '#e2c377' },
    low: { bg: '#3d2422', fg: '#e5a59d' }, na: { bg: '#2b2620', fg: 'rgba(244,237,224,0.55)' },
  } : {
    good: { bg: '#e4efe1', fg: '#2c5837' }, mid: { bg: '#f6ead0', fg: '#7a5a16' },
    low: { bg: '#f4dcd8', fg: '#8c3229' }, na: { bg: '#efe9dd', fg: '#7a6b58' },
  }
  const trendGlyph = (t) => t === 'up' ? '▲' : t === 'down' ? '▼' : t === 'flat' ? '–' : ''
  const trendLabel = (t) => t === 'up' ? 'improving' : t === 'down' ? 'declining' : t === 'flat' ? 'holding steady' : ''
  const hasHeat = heatDomains.some(d => d.pct != null)

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

      {/* ── Readiness projection (weighted-recent scaled score vs the pass bar) ── */}
      <div style={sect}>
        <h2 style={h2}>Readiness projection</h2>
        {!projection ? (
          <p style={{ color: sub, fontSize: 13.5, margin: 0, lineHeight: 1.55 }}>
            Complete more scored practice to unlock your readiness projection. Two scored attempts (pretest or mock exam) are needed.
          </p>
        ) : (() => {
          const v = projection.verdict
          const vb = v === 'Ready' ? heat.good : v === 'Borderline' ? heat.mid : heat.low
          const pts = projection.attempts || []
          const W = 300, H = 84, PAD = 6
          const y = (s) => H - PAD - ((Math.max(0, Math.min(scaleMax, s)) / scaleMax) * (H - 2 * PAD))
          const bw = Math.min(34, (W - 20) / Math.max(pts.length, 1) - 8)
          return (
            <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ minWidth: 170 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, fontFamily: 'Fraunces, Georgia, serif', color: ink }}>{projection.projected}</span>
                  <span style={{ fontSize: 13, color: sub, fontWeight: 600 }}>/ {scaleMax} · pass {projection.bar}</span>
                </div>
                <span role="status" style={{ display: 'inline-block', marginTop: 8, background: vb.bg, color: vb.fg, borderRadius: 999, padding: '4px 12px', fontSize: 12.5, fontWeight: 800 }}>{v}</span>
                <p style={{ color: sub, fontSize: 11.5, margin: '10px 0 0', lineHeight: 1.5, maxWidth: 260 }}>
                  Projection based on your practice, not a guarantee. Weighted toward your most recent scored attempts.
                </p>
              </div>
              <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
                aria-label={`Score trajectory: ${pts.map(p => p.scaled).join(', ')}. Pass bar at ${projection.bar}.`}
                style={{ flex: '1 1 220px', maxWidth: 360, overflow: 'visible' }}>
                {pts.map((p, i) => {
                  const x = 10 + i * ((W - 20) / pts.length)
                  const passed = p.scaled >= projection.bar
                  return (
                    <g key={i}>
                      <rect x={x} y={y(p.scaled)} width={bw} height={H - PAD - y(p.scaled)} rx={4}
                        fill={passed ? '#3d7a4e' : accent} opacity={0.55 + 0.45 * ((i + 1) / pts.length)} />
                      <text x={x + bw / 2} y={y(p.scaled) - 4} textAnchor="middle" fontSize={10} fontWeight={700} fill={sub}>{p.scaled}</text>
                    </g>
                  )
                })}
                <line x1={0} x2={W} y1={y(projection.bar)} y2={y(projection.bar)} stroke={dark ? '#e2c377' : '#7a5a16'} strokeWidth={1.5} strokeDasharray="5 4" />
                <text x={W - 2} y={y(projection.bar) - 4} textAnchor="end" fontSize={9.5} fontWeight={700} fill={dark ? '#e2c377' : '#7a5a16'}>PASS {projection.bar}</text>
              </svg>
            </div>
          )
        })()}
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
              <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={d.pct == null ? undefined : clamp(d.pct)}
                aria-label={`${d.name}: ${d.pct == null ? 'not assessed' : `${d.pct}%`}`}
                style={{ height: 8, background: trk, borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${clamp(d.pct)}%`, height: '100%', background: bandColor(b), borderRadius: 999, transition: 'width .4s' }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Error analysis: domain heat map across ALL recorded practice ── */}
      {hasHeat && (
        <div style={sect}>
          <h2 style={h2}>Error analysis — every question you've answered</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
            {heatDomains.map((d, i) => {
              const hb = heat[heatBand(d.pct)]
              return (
                <li key={i} aria-label={`${d.name}: ${d.pct == null ? 'no data' : `${d.pct}% across ${d.total} questions${d.trend ? `, ${trendLabel(d.trend)}` : ''}`}`}
                  style={{ background: hb.bg, color: hb.fg, borderRadius: 10, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3 }}>{d.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap' }}>
                    {d.pct == null ? '—' : `${d.pct}%`}
                    {d.trend && <span aria-hidden="true" style={{ fontSize: 10, marginLeft: 5 }}>{trendGlyph(d.trend)}</span>}
                  </span>
                </li>
              )
            })}
          </ul>
          {weakest.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: sub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Focus next</div>
              {weakest.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '7px 0', borderTop: i ? `1px solid ${line}` : 'none' }}>
                  <span style={{ fontSize: 13, color: ink, fontWeight: 600 }}>{i + 1}. {d.name} <span style={{ color: bandColor(heatBand(d.pct)), fontWeight: 700 }}>({d.pct}%)</span></span>
                  {onStudyDomain && (
                    <button onClick={() => onStudyDomain(d.name)} aria-label={`Open the study module for ${d.name}`}
                      style={{ background: 'transparent', color: accent, border: `1.5px solid ${accent}`, borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                      Study →
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── My Misses review bank ── */}
      {missBank && (missBank.active > 0 || missBank.retired > 0) && (
        <div style={sect}>
          <h2 style={h2}>My Misses</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ color: ink, fontSize: 14, fontWeight: 700, margin: '0 0 4px' }}>
                You've cleared {missBank.retired} of {missBank.retired + missBank.active} misses.
              </p>
              <p style={{ color: sub, fontSize: 12.5, margin: 0, lineHeight: 1.5 }}>
                {missBank.active > 0
                  ? `${missBank.active} question${missBank.active === 1 ? '' : 's'} in your bank — answer each correctly twice in a row to retire it.`
                  : 'Bank clear. New misses land here automatically.'}
              </p>
            </div>
            {missBank.active > 0 && onReviewMisses && (
              <button onClick={onReviewMisses} aria-label={`Review your ${missBank.active} missed questions`}
                style={{ background: accent, color: '#fff', border: 'none', borderRadius: 999, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Review Misses ({missBank.active})
              </button>
            )}
          </div>
        </div>
      )}

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
