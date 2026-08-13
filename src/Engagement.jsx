import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from './icons.jsx'

// ─────────────────────────────────────────────────────────────────────────────
// Quick Check — active recall prompt with tap-to-reveal answer + self-rating.
// Renders inline at the bottom of a concept card. Self-rating feeds mastery.
// Data shape (in MODULE_ENHANCEMENTS):
//   quickCheck: { prompt, answer, hint? }
// onRate(rating) is called with 'got-it' | 'almost' | 'review'.
// ─────────────────────────────────────────────────────────────────────────────
export function QuickCheck({ quickCheck, onRate, color = 'var(--berry)' }) {
  const [revealed, setRevealed] = useState(false)
  const [hintOpen, setHintOpen] = useState(false)
  const [rated, setRated] = useState(null)

  // Reset on prompt change
  useEffect(() => { setRevealed(false); setHintOpen(false); setRated(null) }, [quickCheck?.prompt])

  if (!quickCheck) return null

  return (
    <div style={{
      marginTop: 18,
      background: `linear-gradient(135deg, color-mix(in srgb, ${color} 6%, transparent) 0%, color-mix(in srgb, ${color} 3%, transparent) 100%)`,
      border: `1.5px solid color-mix(in srgb, ${color} 25%, transparent)`,
      borderRadius: 12,
      padding: '14px 16px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
        fontSize: 11, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        <Icon name="brain" size={14}/><span>Quick Check · Active Recall</span>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--text)', margin: '0 0 12px', fontWeight: 500 }}>
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
                padding: '8px 14px', borderRadius: 99, border: `1px solid color-mix(in srgb, ${color} 31%, transparent)`,
                background: 'transparent', color, cursor: 'pointer',
                fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
              }}>
              <Icon name="bulb" size={12} style={{marginRight:4}}/>{hintOpen ? 'Hide hint' : 'Hint'}
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{
            background: 'var(--surface-solid)', border: `1px solid color-mix(in srgb, ${color} 19%, transparent)`, borderRadius: 10,
            padding: '12px 14px', fontSize: 13.5, lineHeight: 1.6, color: 'var(--text)',
            marginBottom: 10,
          }}>
            <strong style={{ color }}>Answer:</strong> {quickCheck.answer}
          </div>
          {!rated ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Honest self-check:
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { id: 'got-it', label: '✓ Got it', bg: 'var(--green-bg)', fg: 'var(--green-border)', br: 'var(--green-border)' },
                  { id: 'almost',  label: '~ Almost', bg: 'var(--gold-bg)', fg: 'var(--gold)', br: 'var(--gold)' },
                  { id: 'review',  label: '↻ Review', bg: 'var(--red-bg)', fg: 'var(--red)', br: 'var(--red-border)' },
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
            <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
              ✓ Marked. {rated === 'got-it' ? 'Mastery updated.' : rated === 'almost' ? "We'll resurface this." : "Flagged for re-review."}
            </div>
          )}
        </>
      )}

      {hintOpen && quickCheck.hint && (
        <div style={{
          marginTop: 10, padding: '10px 12px', borderRadius: 8,
          background: 'var(--gold-bg)', border: '1px solid var(--gold)',
          fontSize: 12.5, lineHeight: 1.5, color: 'var(--gold)', fontStyle: 'italic',
        }}>
          <Icon name="bulb" size={12} style={{marginRight:4}}/>{quickCheck.hint}
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
export function CategorizeGame({ categorize, onComplete, color = 'var(--berry)' }) {
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
      marginTop: 18, background: 'var(--surface-alt)',
      border: `1.5px solid color-mix(in srgb, ${color} 25%, transparent)`, borderRadius: 12, padding: '16px 18px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
        fontSize: 11, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        <Icon name="target" size={13}/><span>Sort & Apply</span>
      </div>
      <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 14px' }}>{title}</h4>

      {/* aria-live status — announces selection changes for screen readers */}
      <div role="status" aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {!submitted && picked !== null
          ? `Item ${picked + 1} selected. Choose a category.`
          : !submitted && picked === null
            ? 'No item selected. Tap an item to begin.'
            : `Submitted. ${items.filter((it, i) => assignments[i] === it.correct).length} of ${items.length} correct.`}
      </div>

      {/* Items pool */}
      <div style={{
        display: 'grid', gap: 6, marginBottom: 14,
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}>
        {items.map((item, i) => {
          const cat = categories.find(c => c.id === assignments[i])
          const isPicked = picked === i
          const isCorrect = submitted && assignments[i] === item.correct
          const border = submitted ? (isCorrect ? 'var(--green-border)' : 'var(--red-border)') : isPicked ? color : (cat?.color || 'var(--border)')
          const bg = submitted ? (isCorrect ? 'var(--green-bg)' : 'var(--red-bg)') : isPicked ? `color-mix(in srgb, ${color} 9%, transparent)` : (cat ? `color-mix(in srgb, ${cat.color} 9%, transparent)` : 'var(--surface-solid)')
          // Smart short-label for the assignment badge: prefer cat.short, else
          // use word-initials for multi-word labels, else the full label.
          const badge = cat
            ? (cat.short
              || (cat.label.includes(' ')
                ? cat.label.split(/\s+/).filter(Boolean).map(w => w[0].toUpperCase()).join('')
                : cat.label))
            : ''
          return (
            <div key={i}>
              <button onClick={() => togglePick(i)} disabled={submitted}
                aria-pressed={isPicked}
                aria-label={
                  submitted
                    ? `${item.text} — ${isCorrect ? 'correct' : 'incorrect'}, you placed in ${cat?.label || 'no category'}`
                    : cat
                      ? `${item.text} — currently in ${cat.label}. Tap to re-pick.`
                      : `${item.text} — unassigned. Tap to select.`
                }
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px',
                  border: `2px solid ${border}`, borderRadius: 10, background: bg,
                  cursor: submitted ? 'default' : 'pointer', fontFamily: 'inherit',
                  fontSize: 12.5, lineHeight: 1.5, color: 'var(--text)',
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                }}>
                <span style={{ flex: 1 }}>{item.text}</span>
                {submitted && (
                  <span style={{ fontSize: 14, fontWeight: 800, color: isCorrect ? 'var(--green-border)' : 'var(--red)' }} aria-hidden="true">
                    {isCorrect ? '✓' : '✗'}
                  </span>
                )}
                {!submitted && cat && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: cat.color, whiteSpace: 'nowrap' }} aria-hidden="true" title={cat.label}>
                    {badge}
                  </span>
                )}
              </button>
              {submitted && (
                <button onClick={() => setShowFeedback(f => ({ ...f, [i]: !f[i] }))}
                  style={{
                    width: '100%', marginTop: 4, padding: '4px 8px', border: 'none',
                    background: 'transparent', color: 'var(--muted)', cursor: 'pointer',
                    fontSize: 11, fontWeight: 600, textAlign: 'left', fontFamily: 'inherit',
                  }}>
                  {showFeedback[i] ? '▾' : '▸'} {showFeedback[i] ? 'Hide' : 'Why?'}
                </button>
              )}
              {submitted && showFeedback[i] && (
                <div style={{
                  fontSize: 12, lineHeight: 1.5, color: 'var(--text)',
                  padding: '8px 10px', background: 'var(--surface-alt)', borderRadius: 8, marginTop: 2,
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
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {picked !== null ? 'Tap a category to assign:' : 'Tap an item, then tap a category:'}
          </div>
          <div style={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', marginBottom: 12 }}>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => assignToCategory(cat.id)} disabled={picked === null}
                style={{
                  padding: '10px 12px', border: `1.5px solid ${cat.color}`, borderRadius: 10,
                  background: picked !== null ? `color-mix(in srgb, ${cat.color} 9%, transparent)` : 'var(--surface-solid)',
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
            background: allAssigned ? color : 'var(--border)', color: allAssigned ? '#fff' : 'var(--muted)',
            cursor: allAssigned ? 'pointer' : 'default',
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
          }}>
          Submit ({Object.keys(assignments).length}/{items.length})
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: correctCount === items.length ? 'var(--green-border)' : 'var(--gold)' }}>
            {correctCount === items.length ? '🎉 Perfect — ' : ''}
            {correctCount} / {items.length} correct
          </div>
          <button onClick={reset}
            style={{
              padding: '7px 14px', borderRadius: 8, border: `1px solid ${color}`,
              background: 'var(--surface-solid)', color, cursor: 'pointer',
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
export function AnimatedVisual({ kind, color = 'var(--berry)' }) {
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
    { id: 'FR', label: 'FR (high, with PRP)',  color: 'var(--red)', d: `M${padL},${H-padB} L${padL+50},${padT+20} L${padL+90},${padT+20} L${padL+140},${padT+50} L${padL+180},${padT+50} L${padL+230},${padT+80} L${padL+270},${padT+80} L${padL+320},${padT+110} L${padL+370},${padT+110} L${padL+420},${padT+140} L${padL+innerW},${padT+140}` },
    { id: 'VR', label: 'VR (high, steady)',     color: 'var(--green)', d: `M${padL},${H-padB} L${padL+innerW},${padT+10}` },
    { id: 'FI', label: 'FI (scallop)',          color: 'var(--gold)', d: `M${padL},${H-padB} Q${padL+80},${H-padB} ${padL+120},${padT+150} L${padL+160},${padT+150} Q${padL+220},${padT+150} ${padL+260},${padT+90} L${padL+300},${padT+90} Q${padL+360},${padT+90} ${padL+innerW},${padT+30}` },
    { id: 'VI', label: 'VI (low, steady)',      color: 'var(--berry)', d: `M${padL},${H-padB} L${padL+innerW},${padT+innerH/2}` },
  ]
  return (
    <div>
      <style>{`
        @keyframes ol-trace { from { stroke-dashoffset: 1200; } to { stroke-dashoffset: 0; } }
        .ol-sched { stroke-dasharray: 1200; stroke-dashoffset: 1200; animation: ol-trace 2.4s ease-out forwards; }
      `}</style>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 580, display: 'block' }}>
        <line x1={padL} y1={padT} x2={padL} y2={H-padB} stroke="var(--border)"/>
        <line x1={padL} y1={H-padB} x2={W-padR} y2={H-padB} stroke="var(--border)"/>
        <text x={padL-6} y={padT+8} fontSize={9} textAnchor="end" fill="var(--muted)">cum. responses</text>
        <text x={W-padR} y={H-6} fontSize={9} textAnchor="end" fill="var(--muted)">time →</text>
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
              background: `linear-gradient(180deg, ${color} 0%, color-mix(in srgb, ${color} 25%, transparent) 100%)`,
              borderRadius: 4, transition: 'all 0.3s',
            }}/>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text)' }}>{s}</div>
            {i < steps.length - 1 && <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>SR+</div>}
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', marginTop: 6 }}>
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
                background: pi === 0 ? 'var(--muted)' : (bi === 0 ? 'var(--red)' : color),
                borderRadius: '4px 4px 0 0',
                animationDelay: `${(pi*5 + bi)*0.15}s`,
                opacity: 0.95,
              }}/>
          </div>
        )))}
        {/* Phase change line at boundary */}
        <div style={{ position: 'absolute', left: 'calc(40% + 6px)', top: 14, bottom: 8, borderLeft: '1.5px dashed var(--muted)' }}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 12px', fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>
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
export function MasteryMap({ domain, concepts, progress, onJumpTo, color = 'var(--berry)' }) {
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
    if (p?.rating === 'got-it') return { bg: 'var(--green)', fg: '#fff', border: 'var(--green-border)', label: '✓', status: 'mastered' }
    if (p?.rating === 'almost')  return { bg: 'var(--gold)', fg: 'var(--gold-ink)', border: 'var(--gold)', label: '~', status: 'almost' }
    if (p?.rating === 'review')  return { bg: 'var(--red)', fg: '#fff', border: 'var(--red-border)', label: '↻', status: 'review needed' }
    if (p?.viewed)               return { bg: 'var(--surface-solid)',    fg: color,  border: color,    label: '•', status: 'viewed' }
    return                       { bg: 'var(--surface-alt)', fg: 'var(--muted)', border: 'var(--border)', label: '',  status: 'not yet started' }
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 10, gap: 8, flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          <Icon name="map" size={13} style={{marginRight:5}}/>Mastery Map
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
          <span style={{ color: 'var(--green-border)', fontWeight: 700 }}>{stats.mastered} mastered</span>
          {' · '}<span>{stats.viewed} in progress</span>
          {' · '}<span style={{ color: 'var(--muted)' }}>{stats.untouched} new</span>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))', gap: 8,
        background: 'var(--surface-solid)', border: `1px solid color-mix(in srgb, ${color} 19%, transparent)`, borderRadius: 12, padding: 14,
      }}>
        {concepts.map((c, i) => {
          const s = getNodeStyle(i)
          return (
            <button key={i} onClick={() => onJumpTo?.(i)} title={c.title}
              aria-label={`Concept ${i+1}: ${c.title}. Status: ${s.status}.`}
              style={{
                aspectRatio: '1', borderRadius: 10, border: `2px solid ${s.border}`,
                background: s.bg, color: s.fg, cursor: 'pointer',
                fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                transition: 'transform .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.7 }} aria-hidden="true">{i+1}</div>
              <div style={{ fontSize: 12 }} aria-hidden="true">{s.label}</div>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 10, fontSize: 10, color: 'var(--muted)', flexWrap: 'wrap' }}>
        <span><span style={{ color: 'var(--green-border)' }}>✓</span> Mastered</span>
        <span><span style={{ color: 'var(--gold)' }}>~</span> Almost</span>
        <span><span style={{ color: 'var(--red-border)' }}>↻</span> Review needed</span>
        <span><span style={{ color }}>•</span> Viewed</span>
        <span><span style={{ color: 'var(--muted)' }}>○</span> New</span>
      </div>
    </div>
  )
}
