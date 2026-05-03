import { useEffect, useMemo, useRef, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Quick Check — active recall prompt with tap-to-reveal answer + self-rating.
// Renders inline at the bottom of a concept card. Self-rating feeds mastery.
// Data shape (in MODULE_ENHANCEMENTS):
//   quickCheck: { prompt, answer, hint? }
// onRate(rating) is called with 'got-it' | 'almost' | 'review'.
// ─────────────────────────────────────────────────────────────────────────────
export function QuickCheck({ quickCheck, onRate, color = '#5b21b6' }) {
  const [revealed, setRevealed] = useState(false)
  const [hintOpen, setHintOpen] = useState(false)
  const [rated, setRated] = useState(null)

  // Reset on prompt change
  useEffect(() => { setRevealed(false); setHintOpen(false); setRated(null) }, [quickCheck?.prompt])

  if (!quickCheck) return null

  return (
    <div style={{
      marginTop: 18,
      background: `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
      border: `1.5px solid ${color}40`,
      borderRadius: 12,
      padding: '14px 16px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
        fontSize: 11, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        <span>🧠</span><span>Quick Check · Active Recall</span>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: '#1f2937', margin: '0 0 12px', fontWeight: 500 }}>
        {quickCheck.prompt}
      </p>

      {!revealed ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setRevealed(true)}
            style={{
              padding: '8px 16px', borderRadius: 99, border: 'none',
              background: color, color: '#fff', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            }}>
            ✓ Reveal answer
          </button>
          {quickCheck.hint && (
            <button onClick={() => setHintOpen(o => !o)}
              style={{
                padding: '8px 14px', borderRadius: 99, border: `1px solid ${color}50`,
                background: 'transparent', color, cursor: 'pointer',
                fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
              }}>
              💡 {hintOpen ? 'Hide hint' : 'Hint'}
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{
            background: '#fff', border: `1px solid ${color}30`, borderRadius: 10,
            padding: '12px 14px', fontSize: 13.5, lineHeight: 1.6, color: '#111827',
            marginBottom: 10,
          }}>
            <strong style={{ color }}>Answer:</strong> {quickCheck.answer}
          </div>
          {!rated ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Honest self-check:
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { id: 'got-it', label: '✅ Got it', bg: '#dcfce7', fg: '#15803d', br: '#86efac' },
                  { id: 'almost',  label: '🤔 Almost', bg: '#fef3c7', fg: '#92400e', br: '#fcd34d' },
                  { id: 'review',  label: '🔁 Review', bg: '#fee2e2', fg: '#991b1b', br: '#fca5a5' },
                ].map(r => (
                  <button key={r.id} onClick={() => { setRated(r.id); onRate?.(r.id) }}
                    style={{
                      flex: '1 1 100px', padding: '8px 10px', borderRadius: 10,
                      border: `1.5px solid ${r.br}`, background: r.bg, color: r.fg,
                      cursor: 'pointer', fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit',
                    }}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>
              ✓ Marked. {rated === 'got-it' ? 'Mastery updated.' : rated === 'almost' ? "We'll resurface this." : "Flagged for re-review."}
            </div>
          )}
        </>
      )}

      {hintOpen && quickCheck.hint && (
        <div style={{
          marginTop: 10, padding: '10px 12px', borderRadius: 8,
          background: '#fffbeb', border: '1px solid #fcd34d',
          fontSize: 12.5, lineHeight: 1.5, color: '#92400e', fontStyle: 'italic',
        }}>
          💡 {quickCheck.hint}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Categorize — drag-free tap-to-sort exercise.
// Each item starts in "unsorted". Tap an item → tap a category → snap.
// On submit, items show ✓/✗ with explanation.
// Data shape:
//   categorize: { title, categories: [{id, label, color}], items: [{text, correct, explanation}] }
// ─────────────────────────────────────────────────────────────────────────────
export function CategorizeGame({ categorize, onComplete, color = '#5b21b6' }) {
  const [picked, setPicked] = useState(null)        // index of currently picked item
  const [assignments, setAssignments] = useState({}) // { itemIdx: categoryId }
  const [submitted, setSubmitted] = useState(false)
  const [showFeedback, setShowFeedback] = useState({}) // { itemIdx: true } when expanded

  useEffect(() => { setPicked(null); setAssignments({}); setSubmitted(false); setShowFeedback({}) }, [categorize?.title])

  if (!categorize) return null
  const { title, categories, items } = categorize
  const allAssigned = items.every((_, i) => assignments[i] !== undefined)

  const assignToCategory = catId => {
    if (picked === null) return
    setAssignments(a => ({ ...a, [picked]: catId }))
    setPicked(null)
  }
  const togglePick = idx => {
    if (submitted) return
    setPicked(p => (p === idx ? null : idx))
  }
  const reset = () => { setAssignments({}); setSubmitted(false); setPicked(null); setShowFeedback({}) }
  const submit = () => {
    if (!allAssigned) return
    setSubmitted(true)
    const correctCount = items.filter((it, i) => assignments[i] === it.correct).length
    onComplete?.({ correct: correctCount, total: items.length })
  }

  const correctCount = submitted
    ? items.filter((it, i) => assignments[i] === it.correct).length
    : 0

  return (
    <div style={{
      marginTop: 18, background: '#fafaf9',
      border: `1.5px solid ${color}40`, borderRadius: 12, padding: '16px 18px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
        fontSize: 11, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        <span>🎯</span><span>Sort & Apply</span>
      </div>
      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', margin: '0 0 14px' }}>{title}</h4>

      {/* Items pool */}
      <div style={{
        display: 'grid', gap: 6, marginBottom: 14,
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}>
        {items.map((item, i) => {
          const cat = categories.find(c => c.id === assignments[i])
          const isPicked = picked === i
          const isCorrect = submitted && assignments[i] === item.correct
          const isWrong = submitted && assignments[i] !== item.correct
          const border = submitted ? (isCorrect ? '#86efac' : '#fca5a5') : isPicked ? color : (cat?.color || '#cbd5e1')
          const bg = submitted ? (isCorrect ? '#f0fdf4' : '#fef2f2') : isPicked ? `${color}15` : (cat ? `${cat.color}15` : '#fff')
          return (
            <div key={i}>
              <button onClick={() => togglePick(i)} disabled={submitted}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px',
                  border: `2px solid ${border}`, borderRadius: 10, background: bg,
                  cursor: submitted ? 'default' : 'pointer', fontFamily: 'inherit',
                  fontSize: 12.5, lineHeight: 1.5, color: '#1f2937',
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                }}>
                <span style={{ flex: 1 }}>{item.text}</span>
                {submitted && (
                  <span style={{ fontSize: 14, fontWeight: 800, color: isCorrect ? '#15803d' : '#991b1b' }}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                )}
                {!submitted && cat && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: cat.color, whiteSpace: 'nowrap' }}>
                    {cat.label.split(' ')[0]}
                  </span>
                )}
              </button>
              {submitted && (
                <button onClick={() => setShowFeedback(f => ({ ...f, [i]: !f[i] }))}
                  style={{
                    width: '100%', marginTop: 4, padding: '4px 8px', border: 'none',
                    background: 'transparent', color: '#6b7280', cursor: 'pointer',
                    fontSize: 11, fontWeight: 600, textAlign: 'left', fontFamily: 'inherit',
                  }}>
                  {showFeedback[i] ? '▾' : '▸'} {showFeedback[i] ? 'Hide' : 'Why?'}
                </button>
              )}
              {submitted && showFeedback[i] && (
                <div style={{
                  fontSize: 12, lineHeight: 1.5, color: '#374151',
                  padding: '8px 10px', background: '#f3f4f6', borderRadius: 8, marginTop: 2,
                }}>
                  <strong>Correct: {categories.find(c => c.id === item.correct)?.label}.</strong> {item.explanation}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Categories */}
      {!submitted && (
        <>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {picked !== null ? 'Tap a category to assign:' : 'Tap an item, then tap a category:'}
          </div>
          <div style={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', marginBottom: 12 }}>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => assignToCategory(cat.id)} disabled={picked === null}
                style={{
                  padding: '10px 12px', border: `1.5px solid ${cat.color}`, borderRadius: 10,
                  background: picked !== null ? `${cat.color}15` : '#fff',
                  color: cat.color, cursor: picked !== null ? 'pointer' : 'default',
                  opacity: picked !== null ? 1 : 0.6,
                  fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                  transition: 'all .15s ease',
                }}>
                {cat.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Submit / score */}
      {!submitted ? (
        <button onClick={submit} disabled={!allAssigned}
          style={{
            width: '100%', padding: '11px', borderRadius: 10, border: 'none',
            background: allAssigned ? color : '#cbd5e1', color: '#fff',
            cursor: allAssigned ? 'pointer' : 'default',
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
          }}>
          Submit ({Object.keys(assignments).length}/{items.length})
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: correctCount === items.length ? '#15803d' : '#92400e' }}>
            {correctCount === items.length ? '🎉 Perfect — ' : '🎯 '}
            {correctCount} / {items.length} correct
          </div>
          <button onClick={reset}
            style={{
              padding: '7px 14px', borderRadius: 8, border: `1px solid ${color}`,
              background: '#fff', color, cursor: 'pointer',
              fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            }}>
            ↺ Try again
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated concept visuals — CSS-keyframe driven SVG illustrations.
// Pass `kind` to pick the animation. Currently supports: 'schedule_compare',
// 'shaping_graph', 'extinction_burst'.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedVisual({ kind, color = '#5b21b6' }) {
  if (kind === 'schedule_compare') return <ScheduleCompareAnim color={color}/>
  if (kind === 'shaping_graph')    return <ShapingAnim color={color}/>
  if (kind === 'extinction_burst') return <ExtinctionBurstAnim color={color}/>
  return null
}

function ScheduleCompareAnim({ color }) {
  // Visualizes typical cumulative response patterns under FR vs VR vs FI vs VI.
  // Each line is an SVG path with stroke-dasharray + animation.
  const W = 560, H = 240, padL = 38, padB = 28, padT = 16, padR = 16
  const innerW = W - padL - padR, innerH = H - padT - padB
  const lines = [
    { id: 'FR', label: 'FR (high, with PRP)',  color: '#dc2626', d: `M${padL},${H-padB} L${padL+50},${padT+20} L${padL+90},${padT+20} L${padL+140},${padT+50} L${padL+180},${padT+50} L${padL+230},${padT+80} L${padL+270},${padT+80} L${padL+320},${padT+110} L${padL+370},${padT+110} L${padL+420},${padT+140} L${padL+innerW},${padT+140}` },
    { id: 'VR', label: 'VR (high, steady)',     color: '#16a34a', d: `M${padL},${H-padB} L${padL+innerW},${padT+10}` },
    { id: 'FI', label: 'FI (scallop)',          color: '#2563eb', d: `M${padL},${H-padB} Q${padL+80},${H-padB} ${padL+120},${padT+150} L${padL+160},${padT+150} Q${padL+220},${padT+150} ${padL+260},${padT+90} L${padL+300},${padT+90} Q${padL+360},${padT+90} ${padL+innerW},${padT+30}` },
    { id: 'VI', label: 'VI (low, steady)',      color: '#7c3aed', d: `M${padL},${H-padB} L${padL+innerW},${padT+innerH/2}` },
  ]
  return (
    <div>
      <style>{`
        @keyframes ol-trace { from { stroke-dashoffset: 1200; } to { stroke-dashoffset: 0; } }
        .ol-sched { stroke-dasharray: 1200; stroke-dashoffset: 1200; animation: ol-trace 2.4s ease-out forwards; }
      `}</style>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 580, display: 'block' }}>
        <line x1={padL} y1={padT} x2={padL} y2={H-padB} stroke="#cbd5e1"/>
        <line x1={padL} y1={H-padB} x2={W-padR} y2={H-padB} stroke="#cbd5e1"/>
        <text x={padL-6} y={padT+8} fontSize={9} textAnchor="end" fill="#64748b">cum. responses</text>
        <text x={W-padR} y={H-6} fontSize={9} textAnchor="end" fill="#64748b">time →</text>
        {lines.map((l, i) => (
          <g key={l.id}>
            <path className="ol-sched" d={l.d} fill="none" stroke={l.color} strokeWidth={2.5}
              style={{ animationDelay: `${i*0.3}s` }}/>
            <text x={W-padR-2} y={padT+24+i*16} fontSize={10} fill={l.color} textAnchor="end" fontWeight={700}>{l.label}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function ShapingAnim({ color }) {
  // Animated successive approximations: each "step" appears with delay,
  // moving closer to the terminal behavior on the right.
  const steps = ['Looks at switch', 'Reaches', 'Touches', 'Pushes lightly', 'Flips fully']
  return (
    <div>
      <style>{`
        @keyframes ol-shape-pop { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .ol-step { opacity: 0; animation: ol-shape-pop 0.4s ease-out forwards; }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '20px 12px 12px', justifyContent: 'space-between' }}>
        {steps.map((s, i) => (
          <div key={i} className="ol-step" style={{ flex: 1, textAlign: 'center', animationDelay: `${i*0.4}s` }}>
            <div style={{
              height: 24 + i*8, marginBottom: 6,
              background: `linear-gradient(180deg, ${color} 0%, ${color}40 100%)`,
              borderRadius: 4, transition: 'all 0.3s',
            }}/>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#374151' }}>{s}</div>
            {i < steps.length - 1 && <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>SR+</div>}
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: 11, color: '#6b7280', fontStyle: 'italic', marginTop: 6 }}>
        Successive approximations · each step reinforced, prior steps fade
      </div>
    </div>
  )
}

function ExtinctionBurstAnim({ color }) {
  // A bar chart that animates across baseline → extinction phase, showing the
  // characteristic burst (initial spike) before reduction.
  const data = [
    { phase: 'Baseline', bars: [4, 5, 4, 5, 4] },
    { phase: 'Extinction', bars: [9, 8, 7, 4, 2, 1] },
  ]
  const max = 10
  return (
    <div>
      <style>{`
        @keyframes ol-rise { from { height: 0; } to { height: var(--ol-h); } }
        .ol-bar { animation: ol-rise 0.5s ease-out forwards; }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, padding: '20px 12px 8px', height: 160, position: 'relative' }}>
        {data.flatMap((phase, pi) => phase.bars.map((b, bi) => (
          <div key={`${pi}-${bi}`} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <div className="ol-bar"
              style={{
                width: '100%',
                ['--ol-h']: `${(b/max)*100}%`,
                background: pi === 0 ? '#94a3b8' : (bi === 0 ? '#dc2626' : color),
                borderRadius: '4px 4px 0 0',
                animationDelay: `${(pi*5 + bi)*0.15}s`,
                opacity: 0.95,
              }}/>
          </div>
        )))}
        {/* Phase change line at boundary */}
        <div style={{ position: 'absolute', left: 'calc(40% + 6px)', top: 14, bottom: 8, borderLeft: '1.5px dashed #6b7280' }}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 12px', fontSize: 10, color: '#6b7280', fontWeight: 600 }}>
        <span style={{ flex: 5, textAlign: 'center' }}>Baseline</span>
        <span style={{ flex: 6, textAlign: 'center' }}>Extinction (note burst)</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MasteryMap — visual grid of all concepts in a domain with progress states.
// state: { conceptProgress: { [domain]: { [conceptIdx]: { viewed, rating } } } }
// ─────────────────────────────────────────────────────────────────────────────
export function MasteryMap({ domain, concepts, progress, onJumpTo, color = '#5b21b6' }) {
  const stats = useMemo(() => {
    let mastered = 0, viewed = 0
    concepts.forEach((_, i) => {
      const p = progress?.[i]
      if (p?.rating === 'got-it') mastered++
      else if (p?.viewed) viewed++
    })
    return { mastered, viewed, total: concepts.length, untouched: concepts.length - mastered - viewed }
  }, [concepts, progress])

  const getNodeStyle = (i) => {
    const p = progress?.[i]
    if (p?.rating === 'got-it') return { bg: '#16a34a', fg: '#fff', border: '#15803d', label: '✓' }
    if (p?.rating === 'almost')  return { bg: '#eab308', fg: '#fff', border: '#ca8a04', label: '~' }
    if (p?.rating === 'review')  return { bg: '#dc2626', fg: '#fff', border: '#b91c1c', label: '↻' }
    if (p?.viewed)               return { bg: '#fff',    fg: color,  border: color,    label: '•' }
    return                       { bg: '#f3f4f6', fg: '#9ca3af', border: '#d1d5db', label: '' }
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 10, gap: 8, flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          🗺️ Mastery Map
        </div>
        <div style={{ fontSize: 11, color: '#6b7280' }}>
          <span style={{ color: '#15803d', fontWeight: 700 }}>{stats.mastered} mastered</span>
          {' · '}<span>{stats.viewed} in progress</span>
          {' · '}<span style={{ color: '#9ca3af' }}>{stats.untouched} new</span>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))', gap: 8,
        background: '#fff', border: `1px solid ${color}30`, borderRadius: 12, padding: 14,
      }}>
        {concepts.map((c, i) => {
          const s = getNodeStyle(i)
          return (
            <button key={i} onClick={() => onJumpTo?.(i)} title={c.title}
              style={{
                aspectRatio: '1', borderRadius: 10, border: `2px solid ${s.border}`,
                background: s.bg, color: s.fg, cursor: 'pointer',
                fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                transition: 'transform .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.7 }}>{i+1}</div>
              <div style={{ fontSize: 12 }}>{s.label}</div>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 10, fontSize: 10, color: '#6b7280', flexWrap: 'wrap' }}>
        <span><span style={{ color: '#15803d' }}>✓</span> Mastered</span>
        <span><span style={{ color: '#ca8a04' }}>~</span> Almost</span>
        <span><span style={{ color: '#b91c1c' }}>↻</span> Review needed</span>
        <span><span style={{ color }}>•</span> Viewed</span>
        <span><span style={{ color: '#9ca3af' }}>○</span> New</span>
      </div>
    </div>
  )
}
