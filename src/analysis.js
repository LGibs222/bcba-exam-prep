// OneLove exam-prep — pass-rate projection + domain error-analysis helpers.
// Pure functions only; App.jsx owns state shape and persistence.
import { rawToScaled } from './scoring.js'

// Percent-correct -> scaled score via the app's exam form. For non-exam
// attempts (the 30-item pretest) we equate by percent: raw = pct% of the
// form's scoredCount, then run it through the same piecewise-linear
// raw->scaled transform, so a 76% pretest lands at the 400 cut exactly like
// a 76% mock. This is a practice estimate, not a prediction.
export function pctToScaled(p, form) {
  return rawToScaled(Math.round((p / 100) * form.scoredCount), form)
}

// Readiness projection — exponentially-decayed weighted mean of the scaled
// scores of the last 5 scored attempts (pretest + mock exams). Weight for an
// attempt k steps before the most recent is 0.6^k, so the newest attempt
// carries the most weight but one spike/slump can't swing the projection.
// Returns null with fewer than 2 scored attempts (minimum-data guard).
export function projectReadiness(attempts, form) {
  const scored = (attempts || []).filter(a => a && Number.isFinite(a.scaled))
  if (scored.length < 2) return null
  const recent = scored.slice(-5)
  let ws = 0, tw = 0
  recent.forEach((a, i) => {
    const w = Math.pow(0.6, recent.length - 1 - i)
    ws += a.scaled * w; tw += w
  })
  const projected = Math.round(ws / tw)
  const bar = form.scaleCut
  // Verdict margin = 5% of the reported scale span (25 pts on 0–500).
  const margin = 0.05 * (form.scaleMax - form.scaleMin)
  const verdict = projected >= bar + margin ? 'Ready'
    : projected >= bar - margin ? 'Borderline' : 'Keep building'
  return { projected, bar, verdict, margin, attempts: recent }
}

// Append one scored answer event to the domain-event log.
// map = { domain: {correct,total} } (the shape calcScores/tallyByDomain emit).
// Stored compactly as { src, ts, d: { domain: [correct,total] } }, capped.
export function recordDomainEvent(events, src, map) {
  const d = {}
  Object.entries(map || {}).forEach(([k, v]) => {
    if (v && v.total) d[k] = [v.correct, v.total]
  })
  if (!Object.keys(d).length) return events || []
  return [...(events || []), { src, ts: Date.now(), d }].slice(-400)
}

// Aggregate accuracy per domain across ALL recorded answer events, with an
// early-half vs recent-half trend per domain ('up' | 'down' | 'flat' | null).
export function aggregateDomains(events, domains) {
  const evs = events || []
  return (domains || []).map(name => {
    const series = []
    evs.forEach(e => { const x = e && e.d && e.d[name]; if (x) series.push(x) })
    let c = 0, t = 0
    series.forEach(([cc, tt]) => { c += cc; t += tt })
    const pct = t ? Math.round((c / t) * 100) : null
    let trend = null
    if (series.length >= 2) {
      const mid = Math.ceil(series.length / 2)
      const sum = arr => arr.reduce((a, [cc, tt]) => [a[0] + cc, a[1] + tt], [0, 0])
      const [ec, et] = sum(series.slice(0, mid))
      const [rc, rt] = sum(series.slice(mid))
      if (et && rt) {
        const diff = (rc / rt) * 100 - (ec / et) * 100
        trend = diff >= 5 ? 'up' : diff <= -5 ? 'down' : 'flat'
      }
    }
    return { name, pct, correct: c, total: t, trend }
  })
}

// Rank the weakest assessed domains (lowest aggregate accuracy first).
export function weakestDomains(rows, n = 3) {
  return rows.filter(r => r.pct != null).sort((a, b) => a.pct - b.pct).slice(0, n)
}

// Heat-map band per spec: green >=80, amber 60–79, red <60, gray = no data.
export function heatBand(pct) {
  return pct == null ? 'na' : pct >= 80 ? 'good' : pct >= 60 ? 'mid' : 'low'
}
