# Mock-exam scoring methodology (BCBA)

The full mock exam is **not** scored as a raw percentage. It is scored the way
the BACB scores the real exam, **in approximation**:

1. **Scored items only.** The mock builds 185 items: 175 scored + 10 unscored
   "pilot/field-test" fillers. Pilots are tagged `scored: false` at build time
   and are ignored entirely — they never touch the raw score or the denominator.
2. **Criterion-referenced.** Pass/fail is a fixed competence cut, not a curve.
3. **Raw → scaled.** The raw score (correct of 175) is converted to a scaled
   score on a **0–500** scale by a monotonic, piecewise-linear transform anchored
   so the form's raw cut always maps to the scaled **pass mark of 400**. This is
   the equating step in approximation: every form's cut maps to the same scaled
   pass mark, so harder/easier forms still place a minimally-competent candidate
   at 400.
4. **Pass = scaled ≥ 400.** Percent correct is shown only as a secondary
   diagnostic and never drives pass/fail.

**Per-form config** (in `src/App.jsx`, `BCBA_FORM`; engine in `src/scoring.js`):

| field | value | meaning |
|---|---|---|
| `rawCut` | 133 | summed modified-Angoff cut (≈ 0.76 × 175); **tunable per form** |
| `scoredCount` | 175 | scored items |
| `scaleMin`–`scaleMax` | 0–500 | reported scale |
| `scaleCut` | 400 | scaled pass mark |

To make a harder form require fewer correct answers (or an easier form more),
adjust that form's `rawCut`; the curve re-anchors automatically.

> **Honesty note.** This scaling *approximates* BACB methodology (Angoff cut →
> raw→scaled → equating). The BACB does **not** publish its conversion tables or
> cut scores, so scaled values are practice estimates, **not predictions** of
> real exam outcomes.

The scoring engine `src/scoring.js` is generated — it is copied verbatim from
`cst-rebuild/scoring.js` by `cst-rebuild/port-scoring.cjs`. Edit the canonical
file, then re-run the port; do not edit the copy.
