/*
 * Shared mock-exam scoring engine for the OneLove BCBA + RBT prep apps.
 *
 * SINGLE SOURCE OF TRUTH. Authored here in cst-rebuild/scoring.js and copied
 * VERBATIM into each app's src/scoring.js by cst-rebuild/port-scoring.cjs.
 * Do NOT edit the copies — edit this file and re-run `node port-scoring.cjs`.
 *
 * Mirrors BACB scoring methodology in APPROXIMATION (not a prediction):
 *   - criterion-referenced: pass/fail is a fixed competence cut, not a curve.
 *   - scored items only: unscored/pilot items (scored === false) are ignored
 *     entirely — they never touch the raw score or the denominator.
 *   - raw -> scaled via a monotonic, piecewise-linear transform anchored so the
 *     form's raw cut ALWAYS maps to the scaled pass mark. This is the equating
 *     step in approximation: every form's cut maps to the same scaled pass mark,
 *     so a harder form (lower rawCut) and an easier form (higher rawCut) both
 *     land a minimally-competent candidate exactly at scaleCut.
 *   - passed = scaledScore >= scaleCut. percentCorrect is DIAGNOSTIC ONLY and
 *     must never drive pass/fail.
 *
 * rawCut represents the summed modified-Angoff probabilities (the
 * minimally-competent-candidate cut) for a given form, and is tunable per form.
 *
 * The BACB does not publish conversion tables or cut scores, so scaled values
 * are practice estimates, not predictions of real exam outcomes.
 *
 * A "form" config is: { rawCut, scoredCount, scaleMin, scaleMax, scaleCut }.
 */

// Raw correct (scored items only) -> scaled score. Monotonic; raw === rawCut
// always maps to scaleCut regardless of form difficulty.
export function rawToScaled(raw, form) {
  const { rawCut, scoredCount, scaleMin, scaleMax, scaleCut } = form;
  if (rawCut <= 0) return scaleCut;                 // degenerate guard
  let scaled;
  if (raw <= rawCut) {
    scaled = scaleMin + (raw / rawCut) * (scaleCut - scaleMin);
  } else {
    const span = scoredCount - rawCut;
    if (span <= 0) return scaleMax;                 // degenerate guard
    scaled = scaleCut + ((raw - rawCut) / span) * (scaleMax - scaleCut);
  }
  // Clamp to the reported scale so a legacy/untagged attempt can never render a
  // scaled score outside [scaleMin, scaleMax].
  return Math.round(Math.max(scaleMin, Math.min(scaleMax, scaled)));
}

// Score a completed mock exam. `answers` is keyed by question index in
// `questions` (answers[i] === q.correct means item i was answered correctly).
// Items with scored === false (pilots) are excluded from BOTH the count of
// correct answers and the denominator. Returns the canonical result object used
// for the headline, pass/fail, persistence, and (additively) telemetry.
export function scoreExam(questions, answers, form) {
  let rawCorrect = 0, scoredSeen = 0, taggedPilot = false;
  questions.forEach((q, i) => {
    if (q && q.scored === false) { taggedPilot = true; return; } // pilot — ignored entirely
    scoredSeen++;
    if (answers[i] === q.correct) rawCorrect++;
  });
  // Tagged (current) exams carry pilots, so trust the form's declared scoredCount.
  // Legacy/untagged saved attempts have no scored flags — fall back to the scored
  // items actually seen so the denominator (and percentCorrect) stay honest.
  const scoredCount = (taggedPilot && form.scoredCount) ? form.scoredCount : (scoredSeen || form.scoredCount || 0);
  // Never let raw exceed the denominator (guards a flag-less legacy attempt).
  const rawScore = Math.min(rawCorrect, scoredCount);
  const scaledScore = rawToScaled(rawScore, { ...form, scoredCount });
  return {
    rawScore,
    scoredCount,
    scaledScore,
    passed: scaledScore >= form.scaleCut,
    percentCorrect: scoredCount ? Math.round((rawScore / scoredCount) * 100) : 0,
  };
}

// Shape-agnostic per-domain tally -> { [domain]: { correct, total } }.
// scoredOnly (default true) excludes pilots so domain totals sum to scoredCount.
// getDomain(q) lets each app choose its domain field (both use q.domain_name).
// This is the one place the per-domain arithmetic lives; each app keeps only a
// thin adapter that shapes this map into its existing state shape.
export function tallyByDomain(questions, answers, getDomain, scoredOnly = true) {
  const by = {};
  questions.forEach((q, i) => {
    if (scoredOnly && q && q.scored === false) return;
    const d = getDomain(q);
    if (d === undefined || d === null) return;
    if (!by[d]) by[d] = { correct: 0, total: 0 };
    by[d].total++;
    if (answers[i] === q.correct) by[d].correct++;
  });
  return by;
}

// Overall percent correct from a { domain: {correct,total} } map (diagnostic).
export function overallPctFromMap(map) {
  if (!map) return null;
  let c = 0, t = 0;
  Object.values(map).forEach(x => { c += x.correct; t += x.total; });
  return t ? Math.round((c / t) * 100) : null;
}
