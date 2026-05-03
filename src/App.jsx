import { useState, useEffect, useRef } from 'react'
import { PRETEST_QUESTIONS } from './data/pretest.js'
import { MODULES } from './data/modules.js'
import { QUESTION_BANK } from './data/questions.js'
import { MODULE_ENHANCEMENTS } from './data/moduleEnhancements.js'
import { SAFMEDS_DECKS } from './data/safmedsDecks.js'
import { TTSButton } from './TTS.jsx'

// ── LOCAL STORAGE PERSISTENCE ────────────────────────────
const STORAGE_KEY = 'bcba-exam-prep-v1'
const loadPersisted = () => {
  try {
    const r = localStorage.getItem(STORAGE_KEY)
    if (!r) return null
    const p = JSON.parse(r)
    if (!p || typeof p !== 'object') return null
    // Defensive: coerce shapes so corrupt/older localStorage can't crash the app.
    if (p.st && typeof p.st === 'object') {
      p.st.confirmReset = false  // never restore mid-reset confirm
      // Ensure expected nested objects are present
      if (!p.st.safmeds || typeof p.st.safmeds !== 'object') p.st.safmeds = undefined
      else if (!p.st.safmeds.decks || typeof p.st.safmeds.decks !== 'object') p.st.safmeds.decks = {}
      if (!p.st.stats || typeof p.st.stats !== 'object') p.st.stats = undefined
    } else {
      p.st = undefined
    }
    // flagged must be an iterable array of indexes
    if (!Array.isArray(p.flagged)) p.flagged = []
    return p
  } catch { return null }
}
const savePersisted = d => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) } catch {} }
const clearPersisted = () => { try { localStorage.removeItem(STORAGE_KEY) } catch {} }

// ── STUDY STATS HELPERS ──────────────────────────────────
const todayISO = () => new Date().toISOString().slice(0, 10)
function calculateStreak(daysStudied) {
  if (!daysStudied?.length) return 0
  const daySet = new Set(daysStudied)
  const today = new Date()
  const todayStr = todayISO()
  const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().slice(0, 10)
  if (!daySet.has(todayStr) && !daySet.has(yesterdayStr)) return 0
  let streak = 0
  let checkDate = new Date(daySet.has(todayStr) ? todayStr : yesterdayStr)
  while (daySet.has(checkDate.toISOString().slice(0, 10))) {
    streak++
    checkDate = new Date(checkDate.getTime() - 86400000)
  }
  return streak
}
function formatDuration(minutes) {
  if (!minutes) return '0 min'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60), m = minutes % 60
  return m ? `${h}h ${m}m` : `${h}h`
}
const bumpStat = (stats, key, by=1) => ({ ...(stats||{}), [key]: (stats?.[key]||0) + by })

// Time-of-day greeting for the Welcome screen.
function getGreeting() {
  const h = new Date().getHours()
  if (h < 5)  return { greeting: 'Studying late?',     accent: 'Quiet hours.' }
  if (h < 12) return { greeting: 'Good morning.',      accent: 'Steady focus.' }
  if (h < 17) return { greeting: 'Good afternoon.',    accent: 'Keep going.' }
  if (h < 21) return { greeting: 'Good evening.',      accent: 'One more rep.' }
  return        { greeting: 'Late-night session.',  accent: 'Be kind to yourself.' }
}

// Compute earned achievements from user state. Each badge:
// { id, label, icon, earned (bool), description }
function computeAchievements(stats, safmeds, moduleStatuses, examScores) {
  const days = stats?.daysStudied?.length || 0
  const streak = calculateStreak(stats?.daysStudied)
  const modulesPassed = stats?.modulesPassed || 0
  const examAttempts = stats?.examAttempts || 0
  const safmedsTokens = safmeds?.totalTokens || 0
  const totalMinutes = stats?.totalMinutes || 0

  const all = [
    { id:'first_step',   label:'First Step',     icon:'🌱', earned: days >= 1,             description:'Studied for the first time' },
    { id:'streak_3',     label:'On a Roll',      icon:'🔥', earned: streak >= 3,           description:'3-day study streak' },
    { id:'streak_7',     label:'Week Strong',    icon:'⭐', earned: streak >= 7,           description:'7-day study streak' },
    { id:'streak_14',    label:'Two Weeks',      icon:'💎', earned: streak >= 14,          description:'14-day study streak' },
    { id:'first_module', label:'Module Master',  icon:'📚', earned: modulesPassed >= 1,    description:'Passed your first module quiz' },
    { id:'half_modules', label:'Halfway',        icon:'🌗', earned: modulesPassed >= 5,    description:'Passed 5 module quizzes' },
    { id:'all_modules',  label:'All Domains',    icon:'🎯', earned: modulesPassed >= 9,    description:'Passed every domain quiz' },
    { id:'first_exam',   label:'Test-Ready',     icon:'🏁', earned: examAttempts >= 1,     description:'Took your first mock exam' },
    { id:'fluency_50',   label:'Fluency',        icon:'🎴', earned: safmedsTokens >= 50,   description:'Earned 50 SAFMEDS tokens' },
    { id:'time_60',      label:'Hour One',       icon:'⏱',  earned: totalMinutes >= 60,    description:'Studied for 60 minutes total' },
    { id:'time_300',     label:'Five Hours',     icon:'🕐', earned: totalMinutes >= 300,   description:'Studied for 5 hours total' },
  ]
  return all
}

// Smart "Today's focus" suggestion based on user's furthest-along state.
function suggestNextFocus(st) {
  if (!st.pretestScores && !st.skippedPretest) {
    return { title:'Start with the diagnostic', desc:'Take the 30-question pretest to find your weak domains.', cta:'Start Pretest', go:'pretest' }
  }
  const passedAll = DOMAINS.every(d => st.moduleStatuses[d] === 'passed')
  if (!passedAll) {
    // Find first domain not yet passed
    const next = (st.weakDomains.length ? st.weakDomains : DOMAINS).find(d => st.moduleStatuses[d] !== 'passed')
    if (next) return { title:`Study Domain ${next.split('.')[0]}`, desc:`Continue with "${next}". Pass the 80% quiz to unlock the mock.`, cta:'Open Module', go:'modules' }
  }
  if (passedAll && !st.examScores) {
    return { title:'Take the full mock', desc:'All domains unlocked. The 185-question mock exam is ready.', cta:'Begin Mock', go:'exam' }
  }
  return { title:'Maintain fluency', desc:'Run a SAFMEDS drill to stay sharp on the terminology.', cta:'Open SAFMEDS', go:'safmeds' }
}

// ── SAFMEDS (Say All Fast Minute Each Day Shuffled) ────────
const SAFMEDS_LEVELS = [
  { id:'beginner',     label:'Beginner',     icon:'🌱', unlock:0,   color:'#16a34a' },
  { id:'intermediate', label:'Intermediate', icon:'⭐', unlock:50,  color:'#2563eb' },
  { id:'advanced',     label:'Advanced',     icon:'🔥', unlock:200, color:'#dc2626' },
  { id:'master',       label:'Master',       icon:'🏆', unlock:500, color:'#7c3aed' },
]
const SAFMEDS_TIMERS = [30, 60, 90, 120]

function getSafmedsCards(deckId) {
  if (deckId === 'all') {
    return [...(SAFMEDS_DECKS.beginner||[]), ...(SAFMEDS_DECKS.intermediate||[]), ...(SAFMEDS_DECKS.advanced||[]), ...(SAFMEDS_DECKS.master||[])]
  }
  // Mega deck — every term across base levels AND every domain deck, deduped by term.
  if (deckId === 'mega') {
    const base = [...(SAFMEDS_DECKS.beginner||[]), ...(SAFMEDS_DECKS.intermediate||[]), ...(SAFMEDS_DECKS.advanced||[]), ...(SAFMEDS_DECKS.master||[])]
    const domain = Object.keys(MODULE_ENHANCEMENTS).flatMap(d => {
      const enh = MODULE_ENHANCEMENTS[d] || []
      return enh.flatMap(c => (c?.keyTerms || []).map(kt => ({term: kt.term, def: kt.def})))
    })
    const seen = new Set()
    const out = []
    for (const c of [...base, ...domain]) {
      const key = (c.term||'').trim().toLowerCase()
      if (!key || seen.has(key)) continue
      seen.add(key); out.push(c)
    }
    return out
  }
  if (SAFMEDS_DECKS[deckId]) return SAFMEDS_DECKS[deckId]
  // domain deck — sourced from MODULE_ENHANCEMENTS keyTerms
  if (deckId.startsWith('domain:')) {
    const domain = deckId.slice(7)
    const enh = MODULE_ENHANCEMENTS[domain] || []
    return enh.flatMap(c => (c?.keyTerms || []).map(kt => ({term: kt.term, def: kt.def})))
  }
  return []
}

// Resolve a deck id to a human label for charts/CSVs/UI.
function safmedsDeckLabel(deckId) {
  if (!deckId) return ''
  if (deckId === 'all') return 'All Terms'
  if (deckId === 'mega') return 'Mega Deck'
  const lvl = SAFMEDS_LEVELS.find(l => l.id === deckId)
  if (lvl) return lvl.label
  if (deckId.startsWith('domain:')) return deckId.slice(7)
  return deckId
}

function shuffleCards(arr) { return [...arr].sort(()=>Math.random()-0.5) }

function safmedsRate(correct, secondsElapsed) {
  if (!secondsElapsed) return 0
  return Math.round((correct / secondsElapsed) * 60 * 10) / 10  // per minute, 1 decimal
}

function safmedsStars(correct, timer) {
  // stars based on correct-per-minute rate
  const rate = (correct / timer) * 60
  if (rate >= 25) return 3
  if (rate >= 15) return 2
  if (rate >= 8) return 1
  return 0
}

function isLevelUnlocked(levelId, totalTokens) {
  const lvl = SAFMEDS_LEVELS.find(l => l.id === levelId)
  return lvl && totalTokens >= lvl.unlock
}

// ── WEAK SPOTS (spaced-mastery review queue) ──────────────
const weakSpotId = q => q.id || `stem:${(q.stem||'').substring(0,80)}`
function updateWeakSpots(weakSpots, questions, answers) {
  const updated = {...(weakSpots||{})}
  const now = Date.now()
  questions.forEach((q, i) => {
    const id = weakSpotId(q)
    const userAns = answers[i]
    if (userAns === undefined) return  // unanswered, skip
    const isCorrect = userAns === q.correct
    const existing = updated[id]
    if (!isCorrect) {
      updated[id] = {
        question: { stem:q.stem, options:q.options, correct:q.correct, rationale:q.rationale, domain_name:q.domain_name },
        consecutiveCorrect: 0,
        lastSeen: now,
        timesAttempted: (existing?.timesAttempted || 0) + 1,
        timesCorrect: existing?.timesCorrect || 0,
      }
    } else if (existing) {
      const newStreak = (existing.consecutiveCorrect || 0) + 1
      if (newStreak >= 2) {
        delete updated[id]  // graduated
      } else {
        updated[id] = {
          ...existing,
          consecutiveCorrect: newStreak,
          lastSeen: now,
          timesAttempted: existing.timesAttempted + 1,
          timesCorrect: existing.timesCorrect + 1,
        }
      }
    }
  })
  return updated
}

// Color palette — surface/text/border colors come from CSS vars so they
// switch between light and dark themes via [data-theme="dark"] on <html>.
// Brand colors (primary, accent) stay literal for consistent identity.
// Sunrise palette: deep brown-black ink as primary, dusty rose as accent,
// terracotta + sand + wine as additional warm colors. CSS-var refs stay
// so the dark-mode overrides in GlobalStyles continue to apply.
const C = {
  primary:'#1f160d', primaryLight:'var(--primary-light)', primaryMid:'#564434',
  accent:'#a64558', accentBg:'var(--accent-bg)', accentBorder:'var(--accent-border)',
  green:'var(--green)', greenBg:'var(--green-bg)', greenBorder:'var(--green-border)',
  red:'var(--red)', redBg:'var(--red-bg)', redBorder:'var(--red-border)',
  gray:'var(--gray)', grayLight:'var(--surface-alt)', border:'var(--border)',
  text:'var(--text)', muted:'var(--muted)', white:'var(--surface)',
  // Sunrise-specific accents
  peach:'#b96a3d', coral:'#a64558', gold:'#b18432', berry:'#6f3047', sage:'#5a7a52',
}

const CONCEPT_TYPES = [
  { label:'Core Concept',       icon:'📖', color:'#1a3a5c', bg:'#e8f0fb', border:'#93c5fd' },
  { label:'Key Principles',     icon:'⚙️',  color:'#166534', bg:'#f0fdf4', border:'#86efac' },
  { label:'Critical Distinction',icon:'⚠️', color:'#92400e', bg:'#fffbeb', border:'#fcd34d' },
  { label:'Exam Strategy',      icon:'💡', color:'#5b21b6', bg:'#f5f3ff', border:'#c4b5fd' },
]

const DOMAINS = Object.keys(MODULES)
const pct = (c,t) => t===0?0:Math.round((c/t)*100)

function calcScores(questions, answers) {
  const byDomain = {}
  questions.forEach((q,i) => {
    const d = q.domain_name
    if (!byDomain[d]) byDomain[d] = {correct:0,total:0}
    byDomain[d].total++
    if (answers[i] === q.correct) byDomain[d].correct++
  })
  return byDomain
}

function shuffleQuestion(q) {
  const idx = [0,1,2,3]
  for(let i=3; i>0; i--) { const j=Math.floor(Math.random()*(i+1));[idx[i],idx[j]]=[idx[j],idx[i]] }
  return {...q, options: idx.map(i=>q.options[i]), correct: idx.indexOf(q.correct)}
}

function shuffleQuestions(qs) {
  return [...qs].sort(()=>Math.random()-0.5).map(shuffleQuestion)
}

function sampleDomainQuestions(domain, count=20, excludeStems=[]) {
  const exclude = new Set(excludeStems.map(s => (s||'').substring(0,60)))
  const pool = QUESTION_BANK.filter(q => q.domain_name === domain && !exclude.has(q.stem.substring(0,60)))
  return [...pool].sort(()=>Math.random()-0.5).slice(0, Math.min(count, pool.length)).map(shuffleQuestion)
}

// Official BCBA 6th Edition Test Content Outline (2025+)
// 175 scored questions distributed across 9 domains, plus 10 unscored pilot questions = 185 total
const BCBA_OFFICIAL_DOMAIN_COUNTS = {
  "Behaviorism and Philosophical Foundations": 8,
  "Concepts and Principles": 24,
  "Measurement, Data Display, and Interpretation": 21,
  "Experimental Design": 13,
  "Ethical and Professional Issues": 22,
  "Behavior Assessment": 23,
  "Behavior-Change Procedures": 25,
  "Selecting and Implementing Interventions": 20,
  "Personnel Supervision and Management": 19,
}
const BCBA_TOTAL_QUESTIONS = 185
const BCBA_SCORED_QUESTIONS = 175
const BCBA_PILOT_QUESTIONS = 10  // unscored

function sampleExamQuestions(pretestQs, count=BCBA_TOTAL_QUESTIONS) {
  const pretestStems = new Set(pretestQs.map(q=>q.stem.substring(0,60)))
  const pool = QUESTION_BANK.filter(q => !pretestStems.has(q.stem.substring(0,60)))
  const used = new Set()
  const sampled = []
  // Sample by official scored proportions first
  Object.entries(BCBA_OFFICIAL_DOMAIN_COUNTS).forEach(([domain, n]) => {
    const dPool = pool.filter(q => q.domain_name === domain && !used.has(q))
    const shuffled = [...dPool].sort(()=>Math.random()-0.5).slice(0, n)
    shuffled.forEach(q => used.add(q))
    sampled.push(...shuffled)
  })
  // Fill remaining slots (pilot questions) with random items from any domain
  const remaining = pool.filter(q => !used.has(q))
  const shuffledRemaining = [...remaining].sort(()=>Math.random()-0.5)
  sampled.push(...shuffledRemaining.slice(0, Math.max(0, count - sampled.length)))
  // Final shuffle so domain blocks are interleaved
  return sampled.slice(0, count).sort(()=>Math.random()-0.5)
}

const INITIAL = {
  phase:'welcome', qIndex:0,
  pretestQuestions:[],
  pretestAnswers:{}, pretestScores:null, weakDomains:[], skippedPretest:false,
  moduleStatuses:{}, activeModule:null, modulePhase:'content',
  moduleQIndex:0, moduleAnswers:{},
  examAnswers:{}, examQuestions:[], examScores:null,
  domainQuizDomain:null, domainQuizQuestions:[], domainQuizAnswers:{}, domainQuizQIndex:0,
  weakSpots:{}, weakReviewQueue:[], weakReviewIdx:0, weakReviewAnswers:{}, weakReviewStartCount:0,
  // SAFMEDS persistent state
  safmeds: { totalTokens:0, decks:{}, history:[], dailyStreak:0, lastSafmedsDate:'', lastDeckId:'beginner', lastTimer:60, lastMode:'timed' },
  // SAFMEDS transient session
  sfxDeckId:null, sfxMode:'timed', sfxTimer:60, sfxCards:[], sfxCardIdx:0, sfxRevealed:false, sfxCorrect:0, sfxMissed:0, sfxRemaining:60, sfxResults:null,
  // theme: 'light' | 'dark'
  theme: 'light',
  confirmReset:false, timerSeconds:14400, timerActive:false,
  stats: {daysStudied:[], todayDate:'', todayMinutes:0, totalMinutes:0, modulesPassed:0, pretestsCompleted:0, examAttempts:0},
}

// ── UI PRIMITIVES ─────────────────────────────────────────
// Glassmorphic surface — uses --surface (rgba) + backdrop-filter for the
// frosted look; falls back to a translucent panel where backdrop-filter
// isn't supported.
const Card = ({children,style={},className=''}) => (
  <div className={className} style={{
    background:C.white,
    backdropFilter:'blur(14px)',
    WebkitBackdropFilter:'blur(14px)',
    borderRadius:20,
    padding:28,
    boxShadow:'var(--shadow)',
    border:`1px solid ${C.border}`,
    ...style
  }}>{children}</div>
)
const Pill = ({text,color,bg}) => (
  <span style={{fontSize:11,fontWeight:700,color,background:bg,padding:'2px 10px',borderRadius:99,textTransform:'uppercase',letterSpacing:'0.06em'}}>{text}</span>
)
const ProgressBar = ({value,color=C.primary,label}) => (
  <div style={{marginBottom:4}}>
    <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
      <span style={{fontSize:13,color:C.muted}}>{label}</span>
      <span style={{fontSize:13,fontWeight:700,color}}>{value}%</span>
    </div>
    <div style={{background:C.border,borderRadius:99,height:8,overflow:'hidden'}}>
      <div style={{width:`${value}%`,height:'100%',background:color,borderRadius:99,transition:'width 0.6s ease'}}/>
    </div>
  </div>
)

// ── GLOBAL STYLES (theme variables + keyframes) ──────────────────────────────
const GlobalStyles = () => (
  <style>{`
    /* "Sunrise" theme — warm ivory base, terracotta + dusty rose +
       warm sand + deep wine, sage for success. Boutique-magazine warmth. */
    :root {
      --bg-base: #faf6ef;
      --paper-2: #f3ece0;

      /* Sunrise palette anchors */
      --peach:     #b96a3d;
      --peach-2:   #d18555;
      --peach-bg:  #f4e2d2;
      --coral:     #a64558;
      --coral-bg:  #f3dde2;
      --gold:      #b18432;
      --gold-bg:   #f3e8c8;
      --berry:     #6f3047;
      --berry-bg:  #ecd9df;
      --sage:      #5a7a52;
      --sage-bg:   #e2eadb;

      /* Aliases consumed by C palette + components */
      --bg: var(--bg-base);
      --surface: rgba(255, 255, 255, 0.78);
      --surface-solid: #ffffff;
      --surface-alt: rgba(255, 255, 255, 0.55);
      --text: #1f160d;
      --muted: #564434;
      --border: #e6dcc9;
      --gray: #8a7864;

      --primary-light: var(--peach-bg);
      --accent-bg: var(--coral-bg);
      --accent-border: rgba(166, 69, 88, 0.45);
      --green: var(--sage);
      --green-bg: var(--sage-bg);
      --green-border: rgba(90, 122, 82, 0.45);
      --red: var(--coral);
      --red-bg: var(--coral-bg);
      --red-border: rgba(166, 69, 88, 0.45);
      --shadow: 0 4px 24px rgba(31, 22, 13, 0.08);
    }
    :root[data-theme="dark"] {
      /* Warm "twilight" Sunrise variant — deep wine-brown with cream text */
      --bg-base: #1a120c;
      --paper-2: rgba(255, 246, 232, 0.06);
      --peach:     #d18555;
      --peach-2:   #e2a071;
      --peach-bg:  rgba(209, 133, 85, 0.14);
      --coral:     #d27086;
      --coral-bg:  rgba(210, 112, 134, 0.14);
      --gold:      #d8a754;
      --gold-bg:   rgba(216, 167, 84, 0.14);
      --berry:     #b07088;
      --berry-bg:  rgba(176, 112, 136, 0.14);
      --sage:      #a8c8a0;
      --sage-bg:   rgba(168, 200, 160, 0.14);

      --bg: var(--bg-base);
      --surface: rgba(255, 246, 232, 0.06);
      --surface-solid: #2a1c14;
      --surface-alt: rgba(255, 246, 232, 0.04);
      --text: #f3ece0;
      --muted: #c9b89a;
      --border: rgba(255, 246, 232, 0.1);
      --gray: #c9b89a;

      --primary-light: var(--peach-bg);
      --accent-bg: var(--coral-bg);
      --accent-border: rgba(210, 112, 134, 0.4);
      --green: var(--sage);
      --green-bg: var(--sage-bg);
      --green-border: rgba(168, 200, 160, 0.4);
      --red: var(--coral);
      --red-bg: var(--coral-bg);
      --red-border: rgba(210, 112, 134, 0.4);
      --shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
    }

    html, body {
      background:
        radial-gradient(ellipse 80% 50% at 50% 0%,    rgba(177,132,50,0.14), transparent 70%),
        radial-gradient(ellipse 60% 50% at 100% 30%,  rgba(185,106,61,0.14), transparent 70%),
        radial-gradient(ellipse 60% 50% at 0% 100%,   rgba(166,69,88,0.10),  transparent 70%),
        var(--bg-base);
      background-attachment: fixed;
      color: var(--text);
    }
    :root[data-theme="dark"] html, :root[data-theme="dark"] body {
      background:
        radial-gradient(ellipse 80% 50% at 50% 0%,    rgba(216,167,84,0.10), transparent 70%),
        radial-gradient(ellipse 60% 50% at 100% 30%,  rgba(209,133,85,0.10), transparent 70%),
        radial-gradient(ellipse 60% 50% at 0% 100%,   rgba(210,112,134,0.08), transparent 70%),
        var(--bg-base);
    }
    body {
      transition: background .3s ease, color .3s ease;
      margin: 0;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    @keyframes conceptIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    .concept-in{animation:conceptIn .32s ease forwards}
    .kt-card:hover{filter:brightness(.96)}
    /* SVG visuals: keep on a near-white card in both themes for legibility */
    :root[data-theme="dark"] .visual-card { background: #f1f5f9 !important; }

    /* ── Welcome-screen entrance + micro-interactions ──────────── */
    @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    .fade-up { animation: fadeUp .5s cubic-bezier(.2,.7,.2,1) both; }
    .fade-up-1 { animation-delay: .05s; }
    .fade-up-2 { animation-delay: .15s; }
    .fade-up-3 { animation-delay: .25s; }
    .fade-up-4 { animation-delay: .35s; }
    .fade-up-5 { animation-delay: .45s; }
    .fade-up-6 { animation-delay: .55s; }
    .fade-up-7 { animation-delay: .65s; }

    @keyframes softPulse { 0%,100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(212,165,116,0)); } 50% { transform: scale(1.08); filter: drop-shadow(0 0 8px rgba(212,165,116,.55)); } }
    .pulse-soft { display:inline-block; animation: softPulse 2.4s ease-in-out infinite; }

    @keyframes orbDrift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(8px,-12px); } }
    .welcome-orb {
      position: absolute; border-radius: 50%; filter: blur(60px);
      pointer-events: none; z-index: 0;
      animation: orbDrift 14s ease-in-out infinite;
    }
    .welcome-orb-1 { top: -80px; right: -60px; width: 280px; height: 280px;
      background: radial-gradient(circle, rgba(185,106,61,.18) 0%, transparent 70%); }
    .welcome-orb-2 { top: 40%; left: -100px; width: 320px; height: 320px;
      background: radial-gradient(circle, rgba(177,132,50,.16) 0%, transparent 70%);
      animation-delay: -4s; animation-duration: 18s; }
    .welcome-orb-3 { bottom: -60px; right: 10%; width: 220px; height: 220px;
      background: radial-gradient(circle, rgba(166,69,88,.14) 0%, transparent 70%);
      animation-delay: -8s; animation-duration: 16s; }

    /* Hover lift for interactive cards / domain tiles */
    .lift { transition: transform .25s cubic-bezier(.2,.7,.2,1), box-shadow .25s, border-color .25s; }
    .lift:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(31,41,52,.12); }

    /* Domain tile sage hover ring */
    .domain-tile { transition: all .25s cubic-bezier(.2,.7,.2,1); }
    .domain-tile:hover { transform: translateY(-3px); border-color: rgba(107,142,127,.55) !important; box-shadow: 0 6px 20px rgba(31,41,52,.10); }

    /* CTA arrow nudge */
    .cta-arrow { display:inline-block; transition: transform .25s cubic-bezier(.2,.7,.2,1); }
    .btn-cta:hover .cta-arrow { transform: translateX(4px); }
    .btn-cta { transition: transform .2s, box-shadow .2s, filter .2s; }
    .btn-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(31,41,52,.22); }

    /* Greeting subtle shimmer on the accent word */
    @keyframes shimmer { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    .greeting-accent {
      background: linear-gradient(90deg, var(--peach) 0%, var(--coral) 50%, var(--berry) 100%);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 8s ease-in-out infinite;
    }

    /* Journey timeline connector */
    .journey-line { position: absolute; left: 13px; top: 0; bottom: 0; width: 2px;
      background: linear-gradient(to bottom, var(--green) 0%, var(--green) var(--journey-progress, 0%), var(--border) var(--journey-progress, 0%), var(--border) 100%);
      border-radius: 99px; }

    /* === Sunrise hero orb (conic gradient ring with question count) === */
    @keyframes orbDrift2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(8px,-12px); } }
    .hero-orb {
      position: relative;
      width: 100%; aspect-ratio: 1;
      max-width: 240px;
      animation: orbDrift2 16s ease-in-out infinite;
    }
    .hero-orb .orb-bg {
      position: absolute; inset: 0;
      border-radius: 50%;
      background: conic-gradient(from 0deg, var(--gold), var(--peach), var(--coral), var(--berry), var(--gold));
      filter: blur(2px);
      box-shadow: 0 12px 60px rgba(185,106,61,0.22);
    }
    .hero-orb .orb-inner {
      position: absolute; inset: 18px;
      border-radius: 50%;
      background: var(--bg-base);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .hero-orb .orb-num {
      font-size: clamp(2.4rem, 6vw, 3.5rem); font-weight: 800;
      letter-spacing: -0.04em; line-height: 1;
      background: linear-gradient(135deg, var(--peach), var(--coral));
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    .hero-orb .orb-lbl {
      font-size: 0.7rem; font-weight: 700;
      letter-spacing: 0.18em; text-transform: uppercase;
      color: var(--muted);
      margin-top: 6px;
    }

    /* === Today's Focus card === */
    .focus-card {
      background: linear-gradient(135deg, var(--gold-bg) 0%, var(--peach-bg) 100%);
      border: 1px solid var(--border);
      border-radius: 22px;
      padding: 22px 28px;
      display: flex; align-items: center; gap: 20px;
      flex-wrap: wrap;
      transition: transform .2s;
      cursor: pointer;
    }
    .focus-card:hover { transform: translateY(-2px); }
    .focus-icon {
      width: 56px; height: 56px;
      background: linear-gradient(135deg, var(--peach), var(--coral));
      color: white;
      border-radius: 16px;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
      box-shadow: 0 4px 14px rgba(185,106,61,0.25);
    }
    .focus-text { flex: 1; min-width: 200px; }
    .focus-eyebrow {
      font-size: 0.74rem; font-weight: 700;
      letter-spacing: 0.16em; text-transform: uppercase;
      color: var(--peach);
      margin-bottom: 4px;
      display: flex; align-items: center; gap: 8px;
    }
    .focus-title {
      font-size: 1.18rem; font-weight: 800;
      letter-spacing: -0.015em;
      color: var(--text);
      margin-bottom: 4px;
    }
    .focus-desc { font-size: 0.9rem; color: var(--muted); line-height: 1.55; }

    /* === Achievement strip === */
    .ach-card {
      background: var(--surface-solid);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 18px 24px;
      display: flex; align-items: center; justify-content: space-between;
      gap: 18px; flex-wrap: wrap;
    }
    .ach-icons { display: flex; }
    .ach-icons .badge {
      width: 36px; height: 36px;
      border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 0.95rem;
      border: 2px solid var(--surface-solid);
      margin-left: -10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .ach-icons .badge:first-child { margin-left: 0; }
    .ach-streak {
      display: flex; align-items: center; gap: 8px;
      background: var(--coral-bg);
      border: 1px solid var(--coral);
      padding: 7px 14px; border-radius: 99px;
      color: var(--coral);
      font-weight: 700;
    }
    .ach-streak .num { font-size: 1.1rem; letter-spacing: -0.02em; }
    .ach-streak .lbl { font-size: 0.74rem; letter-spacing: 0.06em; }

    /* === Pretest snapshot bars === */
    .pretest-card {
      background: var(--surface-solid);
      border: 1px solid var(--border);
      border-radius: 22px;
      padding: 26px 30px;
    }
    .pretest-bar-row {
      display: grid;
      grid-template-columns: 30px 1fr 56px;
      align-items: center;
      gap: 12px;
      margin-bottom: 9px;
      font-size: 0.84rem;
    }
    .pretest-bar-row .ltr {
      width: 26px; height: 26px;
      background: var(--paper-2); color: var(--text);
      border-radius: 8px;
      display: inline-flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.76rem;
    }
    .pretest-bar-track {
      position: relative;
      height: 22px;
      background: var(--paper-2);
      border: 1px solid var(--border);
      border-radius: 6px;
      overflow: hidden;
    }
    .pretest-bar-track::after {
      content: '';
      position: absolute; top: -2px; bottom: -2px;
      left: 70%;
      width: 0;
      border-right: 1.5px dashed rgba(31,22,13,0.28);
    }
    .pretest-bar-fill {
      height: 100%;
      border-radius: 5px;
      display: flex; align-items: center; padding-left: 10px;
      font-size: 0.72rem; font-weight: 700;
      color: white;
      transition: width .6s cubic-bezier(.2,.7,.2,1);
    }
    .pretest-bar-fill.weak  { background: var(--coral); }
    .pretest-bar-fill.mid   { background: var(--gold); color: var(--text); }
    .pretest-bar-fill.strong{ background: var(--sage); }
    .pretest-bar-row .score {
      text-align: right;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--muted);
    }
    .pretest-bar-row .score.weak { color: var(--coral); }
    .pretest-bar-row .score.strong { color: var(--sage); }

    /* === Weekly calendar === */
    .week-card {
      background: var(--surface-solid);
      border: 1px solid var(--border);
      border-radius: 22px;
      padding: 22px 26px;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 24px;
      align-items: center;
    }
    .week-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
    }
    .day {
      display: flex; flex-direction: column; align-items: center;
      gap: 6px;
    }
    .day-bar {
      width: 100%; height: 56px;
      border-radius: 8px;
      background: var(--paper-2);
      position: relative;
      display: flex; align-items: flex-end;
      overflow: hidden;
      transition: transform .2s;
      border: 1px solid var(--border);
    }
    .day-bar:hover { transform: translateY(-2px); }
    .day-fill {
      width: 100%;
      border-radius: 0 0 7px 7px;
      background: linear-gradient(180deg, var(--peach-2), var(--peach));
    }
    .day-fill.today { background: linear-gradient(180deg, var(--coral), var(--berry)); }
    .day-label {
      font-size: 0.7rem; font-weight: 700;
      color: var(--muted);
      letter-spacing: 0.08em;
    }
    .day.is-today .day-label { color: var(--coral); }
    .day-mins {
      font-size: 0.64rem;
      color: var(--muted);
      font-variant-numeric: tabular-nums;
      font-weight: 500;
    }
    .week-totals {
      text-align: right;
      border-left: 1px solid var(--border);
      padding-left: 22px;
    }
    .week-totals .num {
      font-size: 2.1rem; font-weight: 800;
      letter-spacing: -0.025em; line-height: 1;
      background: linear-gradient(135deg, var(--peach), var(--coral));
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    .week-totals .lbl {
      font-size: 0.7rem; font-weight: 700;
      letter-spacing: 0.14em; text-transform: uppercase;
      color: var(--muted);
      margin-top: 4px;
    }
    @media (max-width: 720px) {
      .week-card { grid-template-columns: 1fr; }
      .week-totals { border-left: none; border-top: 1px solid var(--border); padding-left: 0; padding-top: 14px; text-align: left; }
    }

    /* === Mode cards === */
    .mode-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }
    @media (max-width: 920px) { .mode-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 600px) { .mode-grid { grid-template-columns: 1fr; } }
    .mode {
      position: relative;
      background: var(--surface-solid);
      border: 1px solid var(--border);
      border-radius: 22px;
      padding: 24px 22px;
      display: flex; flex-direction: column;
      cursor: pointer;
      transition: transform .25s, box-shadow .25s, border-color .25s;
      overflow: hidden;
      min-height: 220px;
    }
    .mode::before {
      content: ''; position: absolute; top: -40px; right: -40px;
      width: 140px; height: 140px;
      border-radius: 50%; filter: blur(28px);
      opacity: 0.7; pointer-events: none;
    }
    .mode:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(31,22,13,0.08); }
    .mode-status {
      position: absolute; top: 14px; right: 14px;
      font-size: 0.66rem; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase;
      padding: 3px 9px; border-radius: 99px;
      background: var(--paper-2); color: var(--muted);
    }
    .mode-status.now { background: var(--peach); color: white; }
    .mode-status.done { background: var(--sage); color: white; }
    .mode-status.locked { background: transparent; border: 1px dashed rgba(31,22,13,0.18); color: var(--muted); }
    .mode-icon {
      width: 44px; height: 44px;
      border-radius: 13px;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 1.2rem;
      margin-bottom: 16px;
      position: relative; z-index: 1;
    }
    .mode.pretest::before { background: var(--gold); }
    .mode.pretest .mode-icon { background: var(--gold-bg); color: var(--gold); }
    .mode.modules::before { background: var(--peach); }
    .mode.modules .mode-icon { background: var(--peach-bg); color: var(--peach); }
    .mode.mock::before { background: var(--berry); }
    .mode.mock .mode-icon { background: var(--berry-bg); color: var(--berry); }
    .mode.safmeds::before { background: var(--sage); }
    .mode.safmeds .mode-icon { background: var(--sage-bg); color: var(--sage); }
    .mode-name {
      font-size: 1.08rem; font-weight: 800;
      letter-spacing: -0.01em;
      margin-bottom: 4px;
      position: relative; z-index: 1;
    }
    .mode-meta {
      font-size: 0.78rem; color: var(--muted);
      font-weight: 500;
      letter-spacing: 0.04em;
      margin-bottom: 10px;
      position: relative; z-index: 1;
    }
    .mode-desc {
      font-size: 0.85rem; line-height: 1.55;
      color: var(--muted);
      margin-bottom: 18px;
      position: relative; z-index: 1;
      flex: 1;
    }
    .mode-cta {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.85rem; font-weight: 700;
      color: var(--text);
      position: relative; z-index: 1;
      transition: gap .2s;
    }
    .mode:hover .mode-cta { gap: 10px; }
    .mode-cta .arrow {
      display: inline-flex; align-items: center; justify-content: center;
      width: 22px; height: 22px;
      border-radius: 50%;
      background: var(--text); color: var(--bg-base);
      font-size: 0.7rem; font-weight: 800;
    }

    /* === Weak Spots callout === */
    .weak-card {
      background: var(--surface-solid);
      border: 1px solid var(--border);
      border-left: 4px solid var(--coral);
      border-radius: 0 18px 18px 0;
      padding: 18px 24px;
      display: flex; align-items: center; gap: 20px;
      flex-wrap: wrap;
    }
    .weak-icon {
      width: 44px; height: 44px;
      background: var(--coral-bg);
      color: var(--coral);
      border-radius: 12px;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 1.15rem;
      flex-shrink: 0;
    }

    /* === Domain spot-check rows === */
    .dom-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }
    .dom-row {
      background: var(--surface-solid);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 12px 14px;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 12px;
      transition: all .2s;
    }
    .dom-row:hover { transform: translateY(-1px); border-color: var(--peach); box-shadow: 0 4px 14px rgba(185,106,61,0.08); }
    .dom-row .letter {
      width: 30px; height: 30px;
      background: linear-gradient(135deg, var(--peach), var(--coral));
      color: white;
      border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.84rem;
      flex-shrink: 0;
    }
    .dom-row .body { min-width: 0; }
    .dom-row .name { font-weight: 600; font-size: 0.92rem; line-height: 1.2; color: var(--text); }
    .dom-row .count { font-size: 0.72rem; color: var(--muted); font-weight: 500; margin-top: 2px; }
    .dom-row .spot-btn {
      font-family: inherit;
      display: inline-flex; align-items: center; gap: 5px;
      padding: 7px 12px;
      background: var(--paper-2);
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 99px;
      font-size: 0.74rem; font-weight: 700;
      letter-spacing: 0.04em;
      cursor: pointer; transition: all .15s;
      white-space: nowrap;
    }
    .dom-row .spot-btn:hover { background: var(--peach); border-color: var(--peach); color: white; }

    /* === Section heading === */
    .section-head {
      display: flex; justify-content: space-between; align-items: baseline;
      margin-bottom: 14px; padding: 0 4px;
      flex-wrap: wrap; gap: 12px;
    }
    .section-head h2 {
      font-size: 1.18rem; font-weight: 800;
      letter-spacing: -0.015em;
      color: var(--text);
    }
    .section-head .sub { font-size: 0.82rem; color: var(--muted); font-weight: 500; }

    /* Respect reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .fade-up, .pulse-soft, .welcome-orb, .greeting-accent, .hero-orb, .day-bar { animation: none !important; }
      .lift, .domain-tile, .btn-cta, .cta-arrow, .mode, .focus-card, .dom-row { transition: none !important; }
      .fade-up { opacity: 1 !important; transform: none !important; }
    }
  `}</style>
)

// ── KEY TERM FLIP CARD ────────────────────────────────────
function KeyTermCard({term,def,color,bg,border}) {
  const [flipped,setFlipped] = useState(false)
  return (
    <div className="kt-card" onClick={()=>setFlipped(f=>!f)}
      style={{cursor:'pointer',minHeight:72,perspective:800,userSelect:'none'}}>
      <div style={{position:'relative',width:'100%',minHeight:72,transformStyle:'preserve-3d',
        transition:'transform .45s cubic-bezier(.4,0,.2,1)',
        transform:flipped?'rotateY(180deg)':'rotateY(0deg)'}}>
        <div style={{position:'absolute',inset:0,backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',
          background:bg,border:`1.5px solid ${border}`,borderRadius:10,
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'8px 12px',minHeight:72}}>
          <span style={{fontSize:10,color,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4,opacity:.7}}>tap to define</span>
          <span style={{fontSize:13,fontWeight:800,color,textAlign:'center',lineHeight:1.3}}>{term}</span>
        </div>
        <div style={{position:'absolute',inset:0,backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',
          transform:'rotateY(180deg)',background:C.white,border:`1.5px solid ${border}`,borderRadius:10,
          display:'flex',alignItems:'center',justifyContent:'center',padding:'8px 12px',minHeight:72}}>
          <span style={{fontSize:12,color:C.text,textAlign:'center',lineHeight:1.5}}>{def}</span>
        </div>
      </div>
    </div>
  )
}

// ── SVG VISUALS ───────────────────────────────────────────
function FAChart() {
  const bars=[{l:'Alone',v:9,c:'#dc2626'},{l:'Attention',v:1,c:'#93c5fd'},{l:'Demand',v:1,c:'#93c5fd'},{l:'Play',v:1,c:'#93c5fd'}]
  const W=280,H=100,pL=28,bW=42,gap=14
  return (
    <svg viewBox={`0 0 ${W} ${H+50}`} style={{width:'100%',maxWidth:280,display:'block',margin:'0 auto'}}>
      <text x={W/2} y={13} textAnchor="middle" fontSize={10} fontWeight="700" fill="#64748b">FA Pattern — Automatic Reinforcement</text>
      <line x1={pL-2} y1={18} x2={pL-2} y2={H+18} stroke="#e2e8f0" strokeWidth={1}/>
      <text x={pL-4} y={22} textAnchor="end" fontSize={8} fill="#94a3b8">High</text>
      <text x={pL-4} y={H+18} textAnchor="end" fontSize={8} fill="#94a3b8">Low</text>
      {bars.map((b,i)=>{const x=pL+(bW+gap)*i,bh=(b.v/10)*H;return(
        <g key={i}><rect x={x} y={H-bh+18} width={bW} height={bh} fill={b.c} rx={4} opacity={.9}/>
          <text x={x+bW/2} y={H+32} textAnchor="middle" fontSize={9} fill="#64748b">{b.l}</text></g>
      )})}
      <text x={W/2} y={H+48} textAnchor="middle" fontSize={9} fill="#dc2626" fontStyle="italic">↑ Alone = high rate → automatic (sensory) reinforcement</text>
    </svg>
  )
}

function ScheduleChart() {
  const rows=[
    {n:'VR',rate:95,note:'Highest & steadiest · Greatest extinction resistance',c:'#1a3a5c'},
    {n:'FR',rate:78,note:'High rate · Post-reinforcement pause after each ratio',c:'#2e5fa3'},
    {n:'VI',rate:52,note:'Moderate steady rate · Moderate extinction resistance',c:'#166534'},
    {n:'FI',rate:35,note:'Scallop: slow→fast then pause after reinforcement',c:'#92400e'},
  ]
  const W=290,rH=30,pL=32,bMax=130
  return (
    <svg viewBox={`0 0 ${W} ${rows.length*rH+44}`} style={{width:'100%',maxWidth:290,display:'block',margin:'0 auto'}}>
      <text x={W/2} y={13} textAnchor="middle" fontSize={10} fontWeight="700" fill="#64748b">Reinforcement Schedule Comparison</text>
      {rows.map((r,i)=>{const y=18+i*rH,bW=(r.rate/100)*bMax;return(
        <g key={i}>
          <text x={pL-4} y={y+rH/2+4} textAnchor="end" fontSize={11} fontWeight="800" fill={r.c}>{r.n}</text>
          <rect x={pL} y={y+4} width={bW} height={rH-8} fill={r.c} rx={4} opacity={.85}/>
          <text x={pL+bW+6} y={y+rH/2+4} fontSize={8} fill="#64748b">{r.note}</text>
        </g>
      )})}
      <text x={pL} y={rows.length*rH+38} fontSize={8} fill="#94a3b8">← Response Rate Comparison →</text>
    </svg>
  )
}

function ABABGraph() {
  const segs=[{ph:'A₁',c:'#dc2626',d:[8,9,7,8]},{ph:'B₁',c:'#1a3a5c',d:[3,2,1,2]},{ph:'A₂',c:'#dc2626',d:[7,8,7,8]},{ph:'B₂',c:'#1a3a5c',d:[2,1,1,2]}]
  const W=290,H=100,pL=24,pB=44,n=4,total=segs.length*n
  const allPts=segs.flatMap((s,si)=>s.d.map((v,pi)=>{const i=si*n+pi;return[pL+(i/(total-1))*(W-pL-6),H-(v/10)*H+16]}))
  const phX=segs.map((_,si)=>pL+(si*n/(total-1))*(W-pL-6))
  return (
    <svg viewBox={`0 0 ${W} ${H+pB}`} style={{width:'100%',maxWidth:290,display:'block',margin:'0 auto'}}>
      <text x={W/2} y={13} textAnchor="middle" fontSize={10} fontWeight="700" fill="#64748b">ABAB Reversal Design</text>
      <line x1={pL-2} y1={16} x2={pL-2} y2={H+16} stroke="#e2e8f0" strokeWidth={1}/>
      {[1,2,3].map(i=><line key={i} x1={phX[i]} y1={16} x2={phX[i]} y2={H+16} stroke="#cbd5e1" strokeDasharray="4,3" strokeWidth={1.5}/>)}
      {segs.map((s,si)=><text key={si} x={(phX[si]+(phX[si+1]||W-6))/2} y={H+28} textAnchor="middle" fontSize={9} fontWeight="700" fill={s.c}>{s.ph}</text>)}
      <polyline points={allPts.map(p=>p.join(',')).join(' ')} fill="none" stroke="#475569" strokeWidth={2}/>
      {allPts.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={3} fill={segs[Math.floor(i/n)]?.c||'#475569'}/>)}
      <text x={pL-4} y={20} textAnchor="end" fontSize={8} fill="#94a3b8">Hi</text>
      <text x={pL-4} y={H+16} textAnchor="end" fontSize={8} fill="#94a3b8">Lo</text>
      <text x={W/2} y={H+42} textAnchor="middle" fontSize={8.5} fill="#64748b" fontStyle="italic">Return in A₂ → intervention caused the change</text>
    </svg>
  )
}

function MultipleBaselineGraph() {
  const tiers=[{l:'Behavior 1',d:[8,9,7,2,1,2,1,2,1,2],b:3},{l:'Behavior 2',d:[8,7,9,8,7,2,1,2,1,2],b:5},{l:'Behavior 3',d:[9,8,7,8,9,8,7,2,1,2],b:7}]
  const W=290,tH=58,pB=18,pL=24,tot=10
  return (
    <svg viewBox={`0 0 ${W} ${tiers.length*tH+pB+16}`} style={{width:'100%',maxWidth:290,display:'block',margin:'0 auto'}}>
      <text x={W/2} y={13} textAnchor="middle" fontSize={10} fontWeight="700" fill="#64748b">Multiple Baseline Design</text>
      {tiers.map((t,ti)=>{
        const yB=16+ti*tH
        const pts=t.d.map((v,i)=>[pL+(i/(tot-1))*(W-pL-6),yB+(tH-pB)-(v/10)*(tH-pB-4)])
        const bx=pL+(t.b/(tot-1))*(W-pL-6)
        return (
          <g key={ti}>
            <rect x={pL} y={yB} width={W-pL-6} height={tH-pB} fill="#f8fafc" rx={4} stroke="#e2e8f0" strokeWidth={1}/>
            <text x={pL+4} y={yB+11} fontSize={8} fontWeight="700" fill="#475569">{t.l}</text>
            <line x1={bx} y1={yB} x2={bx} y2={yB+tH-pB} stroke="#2e5fa3" strokeDasharray="3,2" strokeWidth={1.5}/>
            <text x={bx+2} y={yB+11} fontSize={7} fill="#2e5fa3">B→</text>
            <polyline points={pts.map(p=>p.join(',')).join(' ')} fill="none" stroke="#1a3a5c" strokeWidth={1.5}/>
            {pts.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={2.5} fill={i<t.b?'#dc2626':'#1a3a5c'}/>)}
          </g>
        )
      })}
      <text x={W/2} y={tiers.length*tH+pB+12} textAnchor="middle" fontSize={8.5} fill="#64748b" fontStyle="italic">Staggered B introductions demonstrate experimental control</text>
    </svg>
  )
}

function ExtinctionGraph() {
  const pts=[5,5,5,5,9,8,7,5,4,3,2,1,1,3,1,1]
  const W=290,H=88,pL=24
  const pp=pts.map((v,i)=>[pL+(i/(pts.length-1))*(W-pL-6),H-(v/10)*H+16])
  const burstX=pL+(4/(pts.length-1))*(W-pL-6)
  const recX=pL+(11/(pts.length-1))*(W-pL-6)
  return (
    <svg viewBox={`0 0 ${W} ${H+50}`} style={{width:'100%',maxWidth:290,display:'block',margin:'0 auto'}}>
      <text x={W/2} y={13} textAnchor="middle" fontSize={10} fontWeight="700" fill="#64748b">Extinction Pattern</text>
      <line x1={pL-2} y1={16} x2={pL-2} y2={H+16} stroke="#e2e8f0" strokeWidth={1}/>
      <line x1={burstX} y1={16} x2={burstX} y2={H+16} stroke="#f59e0b" strokeDasharray="4,3" strokeWidth={1.5}/>
      <text x={burstX+2} y={26} fontSize={8} fill="#92400e">Extinction begins</text>
      <line x1={recX} y1={16} x2={recX} y2={H+16} stroke="#94a3b8" strokeDasharray="3,2" strokeWidth={1}/>
      <polyline points={pp.map(p=>p.join(',')).join(' ')} fill="none" stroke="#dc2626" strokeWidth={2}/>
      {pp.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={2.5} fill="#dc2626"/>)}
      <text x={pL-4} y={20} textAnchor="end" fontSize={8} fill="#94a3b8">Hi</text>
      <text x={pL-4} y={H+16} textAnchor="end" fontSize={8} fill="#94a3b8">Lo</text>
      <text x={(burstX+recX)/2} y={H+28} textAnchor="middle" fontSize={8.5} fill="#dc2626">Burst ↑</text>
      <text x={(recX+W-6)/2} y={H+28} textAnchor="middle" fontSize={8} fill="#64748b">Spont. Recovery</text>
      <text x={W/2} y={H+44} textAnchor="middle" fontSize={8.5} fill="#475569" fontStyle="italic">Extinction burst = temporary — not treatment failure</text>
    </svg>
  )
}

function PromptHierarchyChart() {
  const levels=[
    {l:'Full Physical Prompt',c:'#dc2626',w:230},
    {l:'Partial Physical Prompt',c:'#ea580c',w:200},
    {l:'Model Prompt',c:'#d97706',w:170},
    {l:'Gestural Prompt',c:'#65a30d',w:140},
    {l:'Vocal / Textual Prompt',c:'#0ea5e9',w:110},
    {l:'Independent (Goal)',c:'#6366f1',w:80},
  ]
  const W=290,rH=26,top=18
  return (
    <svg viewBox={`0 0 ${W} ${levels.length*rH+top+24}`} style={{width:'100%',maxWidth:290,display:'block',margin:'0 auto'}}>
      <text x={W/2} y={13} textAnchor="middle" fontSize={10} fontWeight="700" fill="#64748b">Prompting Hierarchy (Most → Least Restrictive)</text>
      {levels.map((l,i)=>{const y=top+i*rH,x=(W-l.w)/2;return(
        <g key={i}>
          <rect x={x} y={y} width={l.w} height={rH-3} fill={l.c} rx={4} opacity={.88}/>
          <text x={W/2} y={y+rH-9} textAnchor="middle" fontSize={9} fontWeight="700" fill="#fff">{l.l}</text>
        </g>
      )})}
      <text x={W/2} y={levels.length*rH+top+18} textAnchor="middle" fontSize={9} fill="#64748b">Use the least restrictive prompt that produces the correct response</text>
    </svg>
  )
}

function ConceptVisual({type}) {
  const map = {fa_chart:<FAChart/>,schedule_graph:<ScheduleChart/>,abab_design:<ABABGraph/>,multiple_baseline:<MultipleBaselineGraph/>,extinction_graph:<ExtinctionGraph/>,prompt_hierarchy:<PromptHierarchyChart/>}
  return map[type]||null
}

// ── NAVBAR ───────────────────────────────────────────────
const NAV = [
  {id:'welcome',label:'Home',emoji:'🏠',always:true},
  {id:'pretest',label:'Pretest',emoji:'📝',always:true},
  {id:'pretest_results',label:'Results',emoji:'📊',needs:'pretestScores'},
  {id:'modules',label:'Study',emoji:'📚',needs:'studyStarted'},
  {id:'safmeds',label:'SAFMEDS',emoji:'🎴',always:true},
  {id:'exam_intro',label:'Exam',emoji:'🏁',needs:'examReady'},
  {id:'final_results',label:'Report',emoji:'📈',needs:'examScores'},
]

// ── ONE LOVE BRAND MARK ──────────────────────────────────
function OneLoveLogo({ height = 26, dark = true }) {
  const inkColor = dark ? '#fbf7ea' : '#161210'
  const heartColor = dark ? '#c4493a' : '#a8302a'
  return (
    <svg height={height} viewBox="0 0 380 80" xmlns="http://www.w3.org/2000/svg" aria-label="One Love" style={{ display: 'block' }}>
      <text x="170" y="60" textAnchor="end" fontFamily="Fraunces, Georgia, serif" fontWeight="900" fontSize="54" letterSpacing="-1.2" fill={inkColor}>One</text>
      <g transform="translate(190, 35)">
        <path d="M 10 4 C 10 -2, 4 -6, 0 -2 C -4 -6, -10 -2, -10 4 C -10 11, 0 17, 0 17 C 0 17, 10 11, 10 4 Z" fill={heartColor}/>
      </g>
      <text x="208" y="60" fontFamily="Fraunces, Georgia, serif" fontWeight="900" fontStyle="italic" fontSize="54" letterSpacing="-1.2" fill={inkColor}>Love</text>
    </svg>
  )
}

function OneLoveFooter() {
  return (
    <footer style={{
      borderTop: `1px solid ${C.border}`,
      background: 'var(--surface-alt)',
      padding: '20px 18px 28px',
      marginTop: 32,
    }}>
      <div style={{maxWidth: 760, margin: '0 auto', display:'flex', flexDirection:'column', alignItems:'center', gap:10, textAlign:'center'}}>
        <OneLoveLogo height={22} dark={false}/>
        <div style={{fontSize:9, fontWeight:700, color:C.muted, letterSpacing:'0.18em', textTransform:'uppercase'}}>
          Licensed Behavior Analysts PLLC
        </div>
        <p style={{fontSize:11, lineHeight:1.55, color:C.muted, margin:0, maxWidth:620}}>
          One Love (Love Over Licensed Behavior Analysts, PLLC) is not affiliated with, endorsed by, or sponsored by the Behavior Analyst Certification Board (BACB®). BCBA® and RBT® are registered trademarks of the BACB. This practice tool is provided for educational purposes only and does not guarantee passage of the BACB examination.
        </p>
      </div>
    </footer>
  )
}

function NavBar({st,onNav,onReset,onConfirmReset,onCancelReset,onToggleTheme}) {
  const active = ['module'].includes(st.phase)?'modules':['safmeds_session','safmeds_results'].includes(st.phase)?'safmeds':st.phase
  const studyStarted = st.pretestScores || st.skippedPretest
  const examReady = studyStarted && (st.weakDomains.length===0 || st.weakDomains.every(d=>st.moduleStatuses[d]==='passed'))
  return (
    <div style={{background:C.primary,position:'sticky',top:0,zIndex:200,boxShadow:'0 2px 12px rgba(31,41,52,0.18)'}}>
      <div style={{maxWidth:760,margin:'0 auto',padding:'10px 14px 8px',borderBottom:'1px solid rgba(251,247,234,0.10)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <OneLoveLogo height={26} dark={true}/>
      </div>
      <div style={{maxWidth:760,margin:'0 auto',padding:'0 12px',display:'flex',alignItems:'center',justifyContent:'space-between',height:50}}>
        <div style={{display:'flex',gap:2,overflowX:'auto',scrollbarWidth:'none'}}>
          {NAV.map(item=>{
            const avail = item.always || (item.needs==='pretestScores'&&st.pretestScores) || (item.needs==='studyStarted'&&studyStarted) || (item.needs==='examReady'&&examReady) || (item.needs==='examScores'&&st.examScores)
            const isActive = active===item.id
            return (
              <button key={item.id} onClick={()=>avail&&onNav(item.id)} disabled={!avail}
                style={{padding:'5px 10px',borderRadius:99,border:'none',whiteSpace:'nowrap',
                  background:isActive?'#fff':'transparent',
                  color:isActive?C.primary:avail?'#ece6dc':'rgba(236,230,220,0.35)',
                  cursor:avail?'pointer':'default',fontSize:11,fontWeight:700,outline:'none',transition:'all .2s'}}>
                {item.emoji} {item.label}
              </button>
            )
          })}
        </div>
        <div style={{flexShrink:0,marginLeft:8,display:'flex',gap:6,alignItems:'center'}}>
          {!st.confirmReset && (
            <button onClick={onToggleTheme} title={st.theme==='dark'?'Switch to light mode':'Switch to dark mode'}
              style={{padding:'4px 9px',borderRadius:99,border:'1px solid rgba(255,255,255,0.18)',background:'transparent',color:'#ece6dc',cursor:'pointer',fontSize:13,fontWeight:700,whiteSpace:'nowrap',lineHeight:1}}>
              {st.theme==='dark'?'☀️':'🌙'}
            </button>
          )}
          {!st.confirmReset
            ?<button onClick={onReset} style={{padding:'4px 10px',borderRadius:99,border:'1px solid rgba(255,255,255,0.18)',background:'transparent',color:'#e8a597',cursor:'pointer',fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>Reset</button>
            :<div style={{display:'flex',gap:4,alignItems:'center'}}>
               <span style={{fontSize:10,color:'#e8a597',whiteSpace:'nowrap'}}>Start over?</span>
               <button onClick={onConfirmReset} style={{padding:'3px 8px',borderRadius:99,border:'none',background:'#c47a6a',color:'#fff',cursor:'pointer',fontSize:10,fontWeight:700}}>Yes</button>
               <button onClick={onCancelReset} style={{padding:'3px 8px',borderRadius:99,border:'1px solid rgba(255,255,255,0.18)',background:'transparent',color:'rgba(236,230,220,0.7)',cursor:'pointer',fontSize:10,fontWeight:700}}>No</button>
             </div>}
        </div>
      </div>
    </div>
  )
}

// ── STATS CARD ───────────────────────────────────────────
function StatsCard({stats}) {
  const days = stats?.daysStudied?.length || 0
  if (days === 0 && !stats?.pretestsCompleted && !stats?.modulesPassed && !stats?.examAttempts) return null
  const streak = calculateStreak(stats?.daysStudied)
  const showStreak = streak > 0
  return (
    <div style={{marginBottom:20,background:C.white,backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',border:`1px solid ${C.border}`,borderRadius:20,padding:'20px 22px',boxShadow:'var(--shadow)'}}>
      {/* Header row with optional pulsing-flame streak hero */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,gap:10,flexWrap:'wrap'}}>
        <h3 style={{fontSize:11,fontWeight:700,color:C.muted,margin:0,textTransform:'uppercase',letterSpacing:'0.18em'}}>Your progress</h3>
        {showStreak && (
          <div style={{display:'flex',alignItems:'baseline',gap:8,padding:'6px 14px',borderRadius:99,background:'var(--accent-bg)',border:`1px solid ${C.accentBorder}`}}>
            <span className="pulse-soft" style={{fontSize:18,lineHeight:1}}>🔥</span>
            <span style={{fontSize:18,fontWeight:800,color:C.accent,letterSpacing:'-0.02em'}}>{streak}</span>
            <span style={{fontSize:11,fontWeight:600,color:C.accent,textTransform:'uppercase',letterSpacing:'0.08em'}}>day streak</span>
          </div>
        )}
      </div>
      {/* Stat grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'14px'}}>
        {[
          { icon:'📅', label:'Days studied', value: days },
          { icon:'⏱️', label:'Today',         value: formatDuration(stats?.todayMinutes||0) },
          { icon:'✓',  label:'Quizzes passed', value: stats?.modulesPassed||0 },
          { icon:'🕐', label:'Total time',     value: formatDuration(stats?.totalMinutes||0) },
        ].map((s,i)=>(
          <div key={i} style={{padding:'10px 12px',borderRadius:12,background:'var(--surface-alt)',border:`1px solid ${C.border}`}}>
            <div style={{fontSize:11,color:C.muted,fontWeight:600,letterSpacing:'0.04em',display:'flex',alignItems:'center',gap:6}}>
              <span>{s.icon}</span><span>{s.label}</span>
            </div>
            <div style={{fontSize:20,fontWeight:800,color:C.text,letterSpacing:'-0.02em',marginTop:2}}>{s.value}</div>
          </div>
        ))}
      </div>
      {((stats?.pretestsCompleted||0) > 0 || (stats?.examAttempts||0) > 0) && (
        <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${C.border}`,fontSize:12,color:C.muted,display:'flex',gap:14,flexWrap:'wrap'}}>
          {(stats?.pretestsCompleted||0) > 0 && <span>📝 {stats.pretestsCompleted} pretest{stats.pretestsCompleted===1?'':'s'}</span>}
          {(stats?.examAttempts||0) > 0 && <span>🏁 {stats.examAttempts} mock exam{stats.examAttempts===1?'':'s'}</span>}
        </div>
      )}
    </div>
  )
}

// Earned + locked badges — earned ones bright, locked ones desaturated.
function AchievementsRow({stats, safmeds, moduleStatuses, examScores}) {
  const all = computeAchievements(stats, safmeds, moduleStatuses, examScores)
  const earnedCount = all.filter(b => b.earned).length
  if (earnedCount === 0) return null
  // Sort earned first, then by id
  const sorted = [...all].sort((a,b) => (a.earned===b.earned ? 0 : a.earned ? -1 : 1))
  return (
    <div style={{marginBottom:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:10,padding:'0 4px'}}>
        <h3 style={{fontSize:11,fontWeight:700,color:C.muted,margin:0,textTransform:'uppercase',letterSpacing:'0.18em'}}>Achievements</h3>
        <span style={{fontSize:12,color:C.muted,fontWeight:600}}>{earnedCount} of {all.length}</span>
      </div>
      <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:6,scrollbarWidth:'thin'}}>
        {sorted.map(b => (
          <div key={b.id} title={b.description} className="lift"
            style={{
              flexShrink:0, minWidth:84, padding:'12px 8px',
              background: b.earned ? C.white : 'transparent',
              border: `1px solid ${b.earned ? C.border : 'var(--border)'}`,
              borderRadius:14,
              textAlign:'center',
              opacity: b.earned ? 1 : 0.45,
              filter: b.earned ? 'none' : 'grayscale(0.8)',
              backdropFilter: b.earned ? 'blur(14px)' : 'none',
              WebkitBackdropFilter: b.earned ? 'blur(14px)' : 'none',
              cursor: 'help',
            }}>
            <div style={{fontSize:24,lineHeight:1,marginBottom:4}}>{b.icon}</div>
            <div style={{fontSize:10,fontWeight:700,color:C.text,letterSpacing:'0.02em'}}>{b.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Vertical journey timeline — each step has state: done | current | locked.
function JourneyTimeline({steps}) {
  // progress = % of dots that are 'done' OR 'current' (so the connecting line fills proportionally)
  const reachedIdx = steps.findIndex(s => s.state === 'current')
  const allDone = steps.every(s => s.state === 'done')
  const progressPct = allDone ? 100
    : reachedIdx === -1 ? (steps.filter(s => s.state === 'done').length / Math.max(1,steps.length-1)) * 100
    : (reachedIdx / Math.max(1, steps.length - 1)) * 100
  return (
    <div style={{position:'relative',paddingLeft:8}}>
      {/* Connecting line */}
      <div className="journey-line" style={{'--journey-progress': `${progressPct}%`}}/>
      {steps.map((s, i) => {
        const dotBg  = s.state==='done' ? 'var(--green)' : s.state==='current' ? C.accent : 'transparent'
        const dotBd  = s.state==='done' ? 'var(--green)' : s.state==='current' ? C.accent : C.border
        const dotCol = s.state==='locked' ? C.muted : '#fff'
        const dotIcn = s.state==='done' ? '✓' : s.state==='current' ? `${i+1}` : `${i+1}`
        return (
          <div key={i} style={{display:'flex',gap:14,marginBottom: i===steps.length-1?0:18,alignItems:'flex-start',position:'relative',zIndex:1}}>
            <div style={{
              width:28,height:28,borderRadius:'50%',
              background:dotBg, border:`2px solid ${dotBd}`,
              color:dotCol, display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:12,fontWeight:800,flexShrink:0,
              boxShadow: s.state==='current' ? `0 0 0 4px var(--accent-bg)` : 'none',
              transition:'all .25s'
            }}>{dotIcn}</div>
            <div style={{flex:1,paddingTop:2}}>
              <div style={{fontSize:14,fontWeight:700,color: s.state==='locked'?C.muted:C.text,marginBottom:2,display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                {s.title}
                {s.state==='current' && <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:99,background:'var(--accent-bg)',color:C.accent,textTransform:'uppercase',letterSpacing:'0.08em'}}>Now</span>}
                {s.state==='done' && <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:99,background:'var(--green-bg)',color:'var(--green)',textTransform:'uppercase',letterSpacing:'0.08em'}}>Done</span>}
              </div>
              <div style={{fontSize:13,color:C.muted,lineHeight:1.55}}>{s.desc}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── WELCOME ──────────────────────────────────────────────
// ── Pretest snapshot bars (per-domain pretest scores) ────────────────────────
function PretestSnapshot({pretestScores}) {
  if (!pretestScores) return null
  const rows = DOMAINS.map(d => {
    const s = pretestScores[d]
    if (!s || !s.total) return null
    const pct = Math.round((s.correct / s.total) * 100)
    const tier = pct >= 80 ? 'strong' : pct >= 70 ? 'mid' : 'weak'
    const letter = (d.match(/^([A-Z])\.?/) || [,d[0]])[1]
    const shortName = d.replace(/^[A-Z]\.?\s*/, '')
    return { letter, name: shortName, pct, tier, total: s.total }
  }).filter(Boolean)
  if (!rows.length) return null
  const overall = Math.round(rows.reduce((a,r)=>a+r.pct,0) / rows.length)
  return (
    <div className="pretest-card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',alignItems:'baseline',gap:14,flexWrap:'wrap'}}>
          <h2 style={{fontSize:'1.18rem',fontWeight:800,letterSpacing:'-0.015em',color:C.text}}>Your pretest snapshot</h2>
          <span style={{fontSize:'0.82rem',color:C.muted,fontWeight:500}}>{rows.length} domains tested</span>
        </div>
        <div style={{display:'inline-flex',alignItems:'baseline',gap:6,padding:'5px 12px',background:'var(--peach-bg)',border:'1px solid var(--peach)',borderRadius:99,color:'var(--peach)',fontSize:'0.82rem',fontWeight:700}}>
          Overall <span style={{fontSize:'1rem'}}>{overall}%</span>
        </div>
      </div>
      <div>
        {rows.map(r => (
          <div key={r.letter} className="pretest-bar-row">
            <span className="ltr">{r.letter}</span>
            <div className="pretest-bar-track">
              <div className={`pretest-bar-fill ${r.tier}`} style={{width:`${r.pct}%`}}>{r.name}</div>
            </div>
            <span className={`score ${r.tier === 'strong' ? 'strong' : r.tier === 'weak' ? 'weak' : ''}`}>{r.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Weekly study calendar (last 7 days) ──────────────────────────────────────
function WeeklyCalendar({stats}) {
  const days = []
  const today = new Date()
  const studied = new Set(stats?.daysStudied || [])
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000)
    const iso = d.toISOString().slice(0, 10)
    const lbl = ['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()]
    const isToday = i === 0
    const wasStudied = studied.has(iso)
    let mins = 0
    if (isToday) mins = stats?.todayMinutes || 0
    else if (wasStudied) mins = 30
    days.push({ iso, lbl, isToday, wasStudied, mins })
  }
  const maxMins = Math.max(30, ...days.map(d => d.mins))
  const totalMins = days.reduce((a,d)=>a+d.mins, 0)
  const fmtMins = (m) => m === 0 ? '—' : m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m`
  return (
    <div className="week-card">
      <div style={{minWidth:0}}>
        <div style={{fontSize:'0.74rem',fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:C.muted,marginBottom:14}}>
          This week's study time
        </div>
        <div className="week-grid">
          {days.map(d => {
            const heightPct = d.mins === 0 ? 0 : Math.max(20, Math.round((d.mins / maxMins) * 100))
            return (
              <div key={d.iso} className={`day ${d.isToday ? 'is-today' : ''}`}>
                <div className="day-bar">
                  <div className={`day-fill ${d.isToday ? 'today' : ''}`} style={{height:`${heightPct}%`}}/>
                </div>
                <div className="day-label">{d.lbl}</div>
                <div className="day-mins">{fmtMins(d.mins)}</div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="week-totals">
        <div className="num">{fmtMins(totalMins)}</div>
        <div className="lbl">This week</div>
      </div>
    </div>
  )
}

// ── Mode card grid (Pretest / Modules / Mock / SAFMEDS) ──────────────────────
function ModeCardGrid({st, stats, onStart, onNav}) {
  const passedAll = DOMAINS.every(d => st.moduleStatuses?.[d] === 'passed')
  const modulesPassed = stats?.modulesPassed || 0
  const pretestDone = !!st.pretestScores
  const examTaken = !!st.examScores
  const modes = [
    {
      cls: 'pretest', icon: '📝', name: 'Pretest', meta: '30 questions, 9 domains',
      desc: pretestDone ? 'Diagnostic complete. Review your weak domains.' : 'Diagnostic snapshot of your weak domains. Take it once before studying.',
      cta: pretestDone ? 'Review results' : 'Begin pretest',
      status: pretestDone ? { label: 'Done', cls: 'done' } : { label: 'Start here', cls: 'now' },
      onClick: () => pretestDone ? onNav?.('pretest_results') : onStart?.(),
    },
    {
      cls: 'modules', icon: '📚', name: 'Modules', meta: `9 domains, 5-Q quizzes`,
      desc: `Concept content + key-term flip cards. ${modulesPassed} of ${DOMAINS.length} passed.`,
      cta: modulesPassed > 0 ? 'Continue studying' : 'Open modules',
      status: passedAll ? { label: 'Done', cls: 'done' } : (pretestDone || st.skippedPretest) ? { label: 'Now', cls: 'now' } : { label: 'After pretest', cls: 'locked' },
      onClick: () => onNav?.('modules'),
    },
    {
      cls: 'mock', icon: '🏁', name: 'Mock Exam', meta: '185 Q, 4 hours, 175 scored',
      desc: 'Full 185-question simulation with 10 hidden field-test items. Pass all modules first.',
      cta: examTaken ? 'View results' : passedAll ? 'Begin mock' : 'Unlocks soon',
      status: examTaken ? { label: 'Done', cls: 'done' } : passedAll ? { label: 'Ready', cls: 'now' } : { label: 'Locked', cls: 'locked' },
      onClick: () => examTaken ? onNav?.('final_results') : passedAll ? onNav?.('exam_intro') : null,
    },
    {
      cls: 'safmeds', icon: '🎴', name: 'SAFMEDS', meta: '280 terms, 4 levels',
      desc: 'Gamified fluency drill. Beat your per-minute rate. Earn tokens.',
      cta: 'Start drill',
      status: { label: 'Anytime', cls: '' },
      onClick: () => onNav?.('safmeds'),
    },
  ]
  return (
    <div className="mode-grid">
      {modes.map(m => (
        <div key={m.cls} className={`mode ${m.cls}`} onClick={m.onClick}>
          <span className={`mode-status ${m.status.cls}`}>{m.status.label}</span>
          <div className="mode-icon">{m.icon}</div>
          <div className="mode-name">{m.name}</div>
          <div className="mode-meta">{m.meta}</div>
          <div className="mode-desc">{m.desc}</div>
          <span className="mode-cta">{m.cta} <span className="arrow">→</span></span>
        </div>
      ))}
    </div>
  )
}

function Welcome({st,onStart,onSkipPretest,stats,weakSpotsCount,onReviewWeakSpots,safmeds,onOpenSafmeds,onNav,onSpotCheck}) {
  const { greeting, accent: greetingAccent } = getGreeting()
  const focus = suggestNextFocus(st)
  const hasStarted = !!(stats?.daysStudied?.length) || stats?.pretestsCompleted || stats?.modulesPassed
  const earned = computeAchievements(stats, safmeds, st.moduleStatuses, st.examScores).filter(b => b.earned)
  const earnedCount = earned.length
  const allCount = computeAchievements(stats, safmeds, st.moduleStatuses, st.examScores).length
  const streak = calculateStreak(stats?.daysStudied)

  // Count questions per domain from QUESTION_BANK for spot-check section
  const domainCounts = {}
  DOMAINS.forEach(d => { domainCounts[d] = QUESTION_BANK.filter(q => q.domain_name === d).length })
  const bankTotal = QUESTION_BANK.length

  const focusGo = (key) => key === 'exam' ? onNav?.('exam_intro') : onNav?.(key)

  return (
    <div style={{position:'relative',overflow:'hidden'}}>
      {/* Decorative atmospheric orbs */}
      <div className="welcome-orb welcome-orb-1"/>
      <div className="welcome-orb welcome-orb-2"/>
      <div className="welcome-orb welcome-orb-3"/>

      <div style={{maxWidth:1080,margin:'0 auto',padding:'40px 24px 56px',position:'relative',zIndex:1}}>

        {/* HERO */}
        <div className="fade-up fade-up-1 hero-grid" style={{display:'grid',gridTemplateColumns:'1fr 240px',gap:36,alignItems:'center',marginBottom:32}}>
          <div>
            <div style={{fontSize:11,letterSpacing:'0.22em',textTransform:'uppercase',color:C.muted,fontWeight:600,marginBottom:10}}>
              BCBA Exam Prep
            </div>
            <h1 style={{fontSize:'clamp(2.2rem,5vw,3.4rem)',fontWeight:800,color:C.text,margin:'0 0 12px',letterSpacing:'-0.035em',lineHeight:1.05,maxWidth:'14ch'}}>
              {greeting} <span className="greeting-accent">{greetingAccent}</span>
            </h1>
            <p style={{fontSize:'1.02rem',color:C.muted,margin:0,lineHeight:1.6,maxWidth:'52ch'}}>
              {hasStarted
                ? <>Welcome back. <b style={{color:C.text}}>Diagnostic pretest</b>, <b style={{color:C.text}}>targeted modules</b>, <b style={{color:C.text}}>full 185-question mock</b>, and <b style={{color:C.text}}>SAFMEDS fluency</b>. Built around the BACB structure.</>
                : <>A complete BCBA prep system. <b style={{color:C.text}}>Diagnostic pretest</b>, <b style={{color:C.text}}>targeted study modules</b>, <b style={{color:C.text}}>full 185-question mock</b>, and <b style={{color:C.text}}>SAFMEDS fluency</b>.</>}
            </p>
          </div>
          <div className="hero-orb" style={{justifySelf:'center'}}>
            <div className="orb-bg"/>
            <div className="orb-inner">
              <div className="orb-num">{bankTotal}</div>
              <div className="orb-lbl">Question Bank</div>
            </div>
          </div>
        </div>

        {/* TODAY'S FOCUS */}
        <div className="fade-up fade-up-2 focus-card" onClick={()=>focusGo(focus.go)} style={{marginBottom:18}}>
          <div className="focus-icon">{'✨'}</div>
          <div className="focus-text">
            <div className="focus-eyebrow">Today's focus</div>
            <div className="focus-title">{focus.title}</div>
            <div className="focus-desc">{focus.desc}</div>
          </div>
          <button className="btn-cta" onClick={(e)=>{e.stopPropagation(); focusGo(focus.go)}}
            style={{padding:'12px 22px',background:C.primary,color:'#fff',border:'none',borderRadius:99,fontSize:14,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',display:'inline-flex',alignItems:'center',gap:8}}>
            {focus.cta} <span className="cta-arrow">{'→'}</span>
          </button>
        </div>

        {/* ACHIEVEMENTS + STREAK */}
        {(earnedCount > 0 || streak > 0) && (
          <div className="fade-up fade-up-3 ach-card" style={{marginBottom:18}}>
            <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
              {earnedCount > 0 && (
                <div className="ach-icons">
                  {earned.slice(0, 4).map((b,i) => (
                    <span key={b.id} className="badge" title={b.description}
                      style={{background: ['var(--gold-bg)','var(--peach-bg)','var(--coral-bg)','var(--berry-bg)'][i % 4],
                              color: ['var(--gold)','var(--peach)','var(--coral)','var(--berry)'][i % 4]}}>
                      {b.icon}
                    </span>
                  ))}
                </div>
              )}
              <div style={{fontSize:'0.92rem'}}>
                <b>{earnedCount} of {allCount} badges earned.</b>
                <div style={{color:C.muted,fontSize:'0.84rem'}}>
                  {(stats?.modulesPassed||0)} modules passed, {(stats?.examAttempts||0)} mock attempts, {safmeds?.totalTokens || 0} SAFMEDS tokens
                </div>
              </div>
            </div>
            {streak > 0 && (
              <div className="ach-streak">
                <span className="pulse-soft">{'🔥'}</span>
                <span className="num">{streak}</span>
                <span className="lbl">DAY STREAK</span>
              </div>
            )}
          </div>
        )}

        {/* PRETEST SNAPSHOT */}
        {st.pretestScores && (
          <div className="fade-up fade-up-3" style={{marginBottom:18}}>
            <PretestSnapshot pretestScores={st.pretestScores}/>
          </div>
        )}

        {/* WEEKLY CALENDAR */}
        {(stats?.daysStudied?.length > 0 || stats?.todayMinutes > 0) && (
          <div className="fade-up fade-up-4" style={{marginBottom:18}}>
            <WeeklyCalendar stats={stats}/>
          </div>
        )}

        {/* MODE CARDS */}
        <div className="fade-up fade-up-4" style={{marginTop:36,marginBottom:24}}>
          <div className="section-head">
            <h2>Pick your study mode</h2>
            <span className="sub">4 modes, mapped to where you are in your prep</span>
          </div>
          <ModeCardGrid st={st} stats={stats} onStart={onStart} onNav={onNav}/>
        </div>

        {/* WEAK SPOTS */}
        {weakSpotsCount > 0 && (
          <div className="fade-up fade-up-5 weak-card" style={{marginBottom:18}}>
            <div className="weak-icon">{'🔍'}</div>
            <div style={{flex:1,minWidth:200,fontSize:'0.92rem'}}>
              <b style={{color:'var(--coral)'}}>{weakSpotsCount} weak spot{weakSpotsCount===1?'':'s'} in your review queue.</b>
              <div style={{color:C.muted,fontSize:'0.84rem'}}>Items you missed before. Get them right twice in a row to clear them.</div>
            </div>
            <button onClick={onReviewWeakSpots}
              style={{padding:'9px 18px',background:'var(--coral)',color:'white',border:'none',borderRadius:99,fontFamily:'inherit',fontSize:'0.85rem',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}>
              Start Review {'→'}
            </button>
          </div>
        )}

        {/* DOMAIN SPOT-CHECK */}
        <div className="fade-up fade-up-6" style={{marginTop:36,marginBottom:24}}>
          <div className="section-head">
            <h2>Bank coverage, 9 domains</h2>
            <span className="sub">{bankTotal} questions, click <b>Spot-check 20Q</b> to run a quick targeted quiz</span>
          </div>
          <div className="dom-list">
            {DOMAINS.map(d => {
              // Only strip a leading "X. " prefix (e.g., RBT-style "A. Measurement").
              // BCBA domain names like "Behaviorism and Philosophical Foundations"
              // have no such prefix, so the badge falls back to the first letter
              // and the full name is preserved.
              const prefixMatch = d.match(/^([A-Z])\.\s+/)
              const letter = prefixMatch ? prefixMatch[1] : d[0]
              const shortName = prefixMatch ? d.slice(prefixMatch[0].length) : d
              return (
                <div key={d} className="dom-row">
                  <span className="letter">{letter}</span>
                  <div className="body">
                    <div className="name">{shortName}</div>
                    <div className="count">{domainCounts[d]} in bank</div>
                  </div>
                  <button className="spot-btn" onClick={()=>onSpotCheck?.(d)}>{'▸'} Spot-check 20Q</button>
                </div>
              )
            })}
          </div>
        </div>

        {/* FIRST-TIME CTAs */}
        {!st.pretestScores && !st.skippedPretest && (
          <div className="fade-up fade-up-7" style={{marginTop:36}}>
            <button onClick={onStart} className="btn-cta"
              style={{width:'100%',padding:'16px',background:C.primary,color:'#fff',border:'none',borderRadius:14,fontSize:16,fontWeight:700,cursor:'pointer',letterSpacing:'0.02em',boxShadow:'0 4px 20px rgba(31,22,13,0.15)',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:10}}>
              Begin Diagnostic Pretest <span className="cta-arrow">{'→'}</span>
            </button>
            <button onClick={onSkipPretest} className="btn-cta"
              style={{width:'100%',marginTop:10,padding:'13px',background:'transparent',color:C.text,border:`1.5px solid ${C.border}`,borderRadius:14,fontSize:14,fontWeight:600,cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8}}>
              Skip pretest, study all 9 modules <span className="cta-arrow">{'→'}</span>
            </button>
            <p style={{fontSize:12,color:C.muted,textAlign:'center',margin:'12px 0 0'}}>
              Skipping the pretest unlocks every module. You will still need to pass each 80% quiz before the mock exam.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 720px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-orb { max-width: 200px !important; }
        }
      `}</style>
    </div>
  )
}

// ── QUESTION SCREEN ──────────────────────────────────────
function QuestionScreen({questions,answers,qIndex,onAnswer,onNav,onSubmit,label,showFeedback=false}) {
  const q = questions[qIndex]
  const selected = answers[qIndex]
  const total = questions.length
  const answered = Object.keys(answers).length
  return (
    <div style={{maxWidth:700,margin:'0 auto',padding:'28px 20px',fontFamily:'system-ui'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div>
          <Pill text={q.domain_name} color={C.primary} bg={C.primaryLight}/>
          {q.task&&<span style={{marginLeft:8,fontSize:11,color:C.muted}}>{q.task}</span>}
        </div>
        <span style={{fontSize:13,color:C.muted}}>Q {qIndex+1} / {total}</span>
      </div>
      <div style={{height:4,background:C.border,borderRadius:99,marginBottom:24,overflow:'hidden'}}>
        <div style={{width:`${((qIndex+1)/total)*100}%`,height:'100%',background:C.primary,borderRadius:99,transition:'width 0.3s'}}/>
      </div>
      <Card style={{marginBottom:18}}>
        <p style={{fontSize:16,lineHeight:1.65,color:C.text,margin:0,fontFamily:'Georgia,serif',fontWeight:500}}>{q.stem}</p>
      </Card>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
        {q.options.map((opt,i)=>{
          const isSel = selected===i
          const showFb = showFeedback && selected!==undefined
          const isCorrect = i===q.correct
          let bg=C.white, border=C.border
          if(showFb&&isCorrect){bg=C.greenBg;border=C.greenBorder}
          else if(showFb&&isSel&&!isCorrect){bg=C.redBg;border=C.redBorder}
          else if(isSel){bg=C.primaryLight;border=C.primary}
          return (
            <button key={i} onClick={()=>(!showFb||!selected)&&onAnswer(qIndex,i)}
              style={{textAlign:'left',padding:'13px 16px',borderRadius:12,border:`2px solid ${border}`,background:bg,cursor:'pointer',fontSize:14,color:C.text,display:'flex',alignItems:'center',gap:12}}>
              <span style={{width:26,height:26,borderRadius:'50%',border:`2px solid ${isSel&&!showFb?C.primary:border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:isSel?C.primary:C.muted,flexShrink:0,background:isSel&&!showFb?C.white:'transparent'}}>
                {['A','B','C','D'][i]}
              </span>
              <span style={{flex:1}}>{opt}</span>
              {showFb&&isCorrect&&<span style={{color:C.green,fontWeight:700}}>✓</span>}
              {showFb&&isSel&&!isCorrect&&<span style={{color:C.red,fontWeight:700}}>✗</span>}
            </button>
          )
        })}
      </div>
      {showFeedback&&selected!==undefined&&(
        <Card style={{background:C.grayLight,marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
            <p style={{fontSize:13,color:C.text,margin:0,lineHeight:1.6,flex:1}}><strong>Explanation:</strong> {q.rationale}</p>
            <TTSButton token={`rat:pretest:${qIndex}`} text={q.rationale} label="" size="xs"/>
          </div>
        </Card>
      )}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <button onClick={()=>onNav(-1)} disabled={qIndex===0}
          style={{padding:'10px 20px',borderRadius:10,border:`1px solid ${C.border}`,background:C.white,color:qIndex===0?C.muted:C.primary,cursor:qIndex===0?'default':'pointer',fontSize:14,fontWeight:600}}>← Back</button>
        <span style={{fontSize:13,color:C.muted}}>{answered}/{total} answered</span>
        {qIndex<total-1
          ?<button onClick={()=>onNav(1)} style={{padding:'10px 20px',borderRadius:10,border:'none',background:C.primary,color:C.white,cursor:'pointer',fontSize:14,fontWeight:600}}>Next →</button>
          :<button onClick={onSubmit} disabled={answered<total}
              style={{padding:'10px 20px',borderRadius:10,border:'none',background:answered<total?C.muted:C.accent,color:C.white,cursor:answered<total?'default':'pointer',fontSize:14,fontWeight:600}}>
              {answered<total?`${total-answered} left`:`Submit ${label} ✓`}
            </button>}
      </div>
    </div>
  )
}

// ── PRETEST RESULTS ──────────────────────────────────────
function PretestResults({scores,weakDomains,onStudy,onSkip}) {
  const allPcts = DOMAINS.map(d=>scores[d]?pct(scores[d].correct,scores[d].total):0)
  const overall = Math.round(allPcts.reduce((a,b)=>a+b,0)/allPcts.length)
  return (
    <div style={{maxWidth:680,margin:'0 auto',padding:'32px 20px',fontFamily:'system-ui'}}>
      <div style={{textAlign:'center',marginBottom:28}}>
        <div style={{fontSize:48,marginBottom:8}}>{overall>=70?'📊':'📉'}</div>
        <h2 style={{fontSize:24,fontWeight:700,color:C.primary,margin:'0 0 4px',fontFamily:'Georgia,serif'}}>Diagnostic Results</h2>
        <p style={{fontSize:15,color:C.muted,margin:0}}>Average across domains: <strong style={{color:C.primary}}>{overall}%</strong></p>
      </div>
      <Card style={{marginBottom:20}}>
        <h3 style={{fontSize:15,fontWeight:700,color:C.primary,margin:'0 0 16px'}}>Results by Domain</h3>
        {DOMAINS.map(d=>{
          const s=scores[d]||{correct:0,total:0}
          const p=pct(s.correct,s.total)
          const weak=p<70
          return (
            <div key={d} style={{marginBottom:12,padding:'10px 14px',borderRadius:10,background:weak?C.redBg:'transparent',border:`1px solid ${weak?C.redBorder:C.border}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <span style={{fontSize:13,fontWeight:600,color:C.text}}>{MODULES[d]?.icon} {d}</span>
                {weak&&<Pill text="Needs Review" color={C.red} bg={C.redBg}/>}
              </div>
              <ProgressBar value={p} label={`${s.correct}/${s.total} correct`} color={weak?C.red:C.green}/>
            </div>
          )
        })}
      </Card>
      {weakDomains.length>0&&(
        <div style={{background:C.accentBg,border:`1px solid ${C.accentBorder}`,borderRadius:14,padding:20,marginBottom:20}}>
          <p style={{fontSize:14,color:C.accent,fontWeight:700,margin:'0 0 8px'}}>📚 {weakDomains.length} domain{weakDomains.length>1?'s':''} require module completion before the full exam</p>
          {weakDomains.map(d=><div key={d} style={{fontSize:13,color:C.text,padding:'2px 0'}}>→ {d}</div>)}
        </div>
      )}
      <div style={{display:'flex',gap:12}}>
        {weakDomains.length>0&&(
          <button onClick={onStudy} style={{flex:1,padding:'15px',background:C.primary,color:C.white,border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'Georgia,serif'}}>
            Start Study Plan ({weakDomains.length} modules) →
          </button>
        )}
        <button onClick={onSkip} style={{flex:weakDomains.length>0?0:1,padding:'15px 24px',background:weakDomains.length>0?C.white:C.primary,color:weakDomains.length>0?C.primary:C.white,border:`2px solid ${C.primary}`,borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'Georgia,serif'}}>
          {weakDomains.length===0?'Proceed to Full Exam →':'Skip to Exam'}
        </button>
      </div>
    </div>
  )
}

// ── MODULE HUB ───────────────────────────────────────────
function ModuleHub({weakDomains,moduleStatuses,onSelect,onExam,onSpotCheck}) {
  const allPassed = weakDomains.every(d=>moduleStatuses[d]==='passed')
  const passedCount = weakDomains.filter(d=>moduleStatuses[d]==='passed').length
  return (
    <div style={{maxWidth:680,margin:'0 auto',padding:'32px 20px',fontFamily:'system-ui'}}>
      <div style={{textAlign:'center',marginBottom:28}}>
        <h2 style={{fontSize:22,fontWeight:700,color:C.primary,margin:'0 0 6px',fontFamily:'Georgia,serif'}}>Study Plan</h2>
        <p style={{fontSize:14,color:C.muted,margin:0}}>Pass each 5-question module quiz to unlock the full exam — or run a 20-question spot-check anytime</p>
      </div>
      {weakDomains.map(d=>{
        const status=moduleStatuses[d]||'not_started'
        const statusColors={not_started:{bg:C.primaryLight,color:C.primary,label:'Not Started'},passed:{bg:C.greenBg,color:C.green,label:'✓ Passed'},failed:{bg:C.redBg,color:C.red,label:'✗ Retry'}}
        const sc=statusColors[status]
        return (
          <Card key={d} style={{marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,gap:8,flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,flex:1,minWidth:0}}>
                <div style={{fontSize:28,flexShrink:0}}>{MODULES[d]?.icon}</div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:15,fontWeight:700,color:C.primary}}>{d}</div>
                  <div style={{fontSize:12,color:C.muted}}>{MODULES[d]?.concepts?.length||0} concepts · 5-Q checkpoint</div>
                </div>
              </div>
              <Pill text={sc.label} color={sc.color} bg={sc.bg}/>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>onSelect(d)}
                style={{flex:1,padding:'10px 14px',borderRadius:10,border:`1.5px solid ${C.primary}`,background:status==='passed'?C.white:C.primary,color:status==='passed'?C.primary:C.white,cursor:'pointer',fontSize:13,fontWeight:700}}>
                {status==='passed'?'📖 Review':'Study →'}
              </button>
              <button onClick={()=>onSpotCheck(d)}
                style={{flex:1,padding:'10px 14px',borderRadius:10,border:'none',background:C.accent,color:C.white,cursor:'pointer',fontSize:13,fontWeight:700}}>
                🎯 Spot-Check 20Q
              </button>
            </div>
          </Card>
        )
      })}
      <div style={{marginTop:24,textAlign:'center'}}>
        <p style={{fontSize:13,color:C.muted,marginBottom:12}}>{passedCount}/{weakDomains.length} modules passed</p>
        <button onClick={onExam} disabled={!allPassed}
          style={{padding:'14px 32px',background:allPassed?C.primary:C.muted,color:C.white,border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:allPassed?'pointer':'default',fontFamily:'Georgia,serif'}}>
          {allPassed?'Begin Full Exam →':'Complete all modules to unlock exam'}
        </button>
      </div>
    </div>
  )
}

// ── LEARNING MODULE ──────────────────────────────────────
// ── MISSED QUESTION CARD (quiz remediation) ─────────────
function MissedQuestionCard({q}) {
  const [expanded,setExpanded] = useState(true)
  return (
    <div style={{border:`1px solid ${C.redBorder}`,borderRadius:10,marginBottom:10,overflow:'hidden',background:C.white}}>
      <button onClick={()=>setExpanded(e=>!e)}
        style={{width:'100%',padding:'10px 14px',background:expanded?C.redBg:C.white,
          border:'none',textAlign:'left',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,fontFamily:'inherit'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:13,fontWeight:800,color:C.red}}>✗</span>
          <span style={{fontSize:13,fontWeight:600,color:C.text}}>Question {q._i + 1}</span>
        </div>
        <span style={{fontSize:14,color:C.muted,fontWeight:700}}>{expanded?'−':'+'}</span>
      </button>
      {expanded && (
        <div style={{padding:'14px 16px 16px',borderTop:`1px solid ${C.redBorder}`,background:'#fefcfc'}}>
          <p style={{fontSize:13.5,color:C.text,margin:'0 0 12px',lineHeight:1.65,fontFamily:'Georgia,serif',fontWeight:500}}>{q.stem}</p>
          {q._userAns !== undefined && q._userAns !== q.correct && (
            <div style={{fontSize:12.5,padding:'9px 11px',borderRadius:8,background:C.redBg,color:C.red,border:`1px solid ${C.redBorder}`,marginBottom:6,lineHeight:1.5}}>
              <strong>✗ Your answer:</strong> {['A','B','C','D'][q._userAns]}. {q.options[q._userAns]}
            </div>
          )}
          <div style={{fontSize:12.5,padding:'9px 11px',borderRadius:8,background:C.greenBg,color:C.green,border:`1px solid ${C.greenBorder}`,marginBottom:10,lineHeight:1.5}}>
            <strong>✓ Correct:</strong> {['A','B','C','D'][q.correct]}. {q.options[q.correct]}
          </div>
          {q.rationale && (
            <div style={{padding:'10px 12px',background:C.grayLight,borderRadius:8,fontSize:12.5,color:C.text,lineHeight:1.65,display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
              <span style={{flex:1}}><strong style={{color:C.primary}}>📘 Why:</strong> {q.rationale}</span>
              <TTSButton token={`rat:review:${q.id||q.stem?.slice(0,30)}`} text={q.rationale} label="" size="xs"/>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LearningModule({domain,phase,qIndex,answers,onAnswer,onBack,onStartQuiz,onFinish,onReviewConcepts}) {
  const mod = MODULES[domain]
  const [conceptIdx, setConceptIdx] = useState(0)
  useEffect(()=>{ setConceptIdx(0) }, [domain])

  const pq = mod.practice[qIndex]
  const selected = answers[qIndex]
  const allAnswered = Object.keys(answers).length===mod.practice.length
  const score = allAnswered?mod.practice.filter((_,i)=>answers[i]===mod.practice[i].correct).length:0
  const passed = score>=4

  if(phase==='content') {
    const enh = MODULE_ENHANCEMENTS[domain]?.[conceptIdx] || {}
    const concept = {...mod.concepts[conceptIdx], ...enh}
    const ctype = CONCEPT_TYPES[conceptIdx % CONCEPT_TYPES.length]
    const isLast = conceptIdx === mod.concepts.length - 1
    const nav = d => setConceptIdx(i => Math.max(0, Math.min(mod.concepts.length-1, i+d)))

    return (
      <div style={{maxWidth:680,margin:'0 auto',padding:'24px 20px',fontFamily:'system-ui'}}>
        <button onClick={onBack} style={{background:'none',border:'none',color:C.muted,cursor:'pointer',fontSize:14,marginBottom:14,padding:0}}>← Back to modules</button>

        {/* Module header */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
          <span style={{fontSize:30}}>{mod.icon}</span>
          <h2 style={{fontSize:20,fontWeight:700,color:C.primary,margin:0,fontFamily:'Georgia,serif'}}>{domain}</h2>
        </div>

        {/* Progress dots */}
        <div style={{display:'flex',gap:6,marginBottom:18,alignItems:'center'}}>
          {mod.concepts.map((_,i)=>(
            <div key={i} onClick={()=>setConceptIdx(i)} style={{height:8,borderRadius:99,cursor:'pointer',flexShrink:0,
              width:i===conceptIdx?28:8,
              background:i<=conceptIdx?ctype.color:C.border,
              transition:'all .3s ease'}}/>
          ))}
          <span style={{fontSize:12,color:C.muted,marginLeft:6}}>{conceptIdx+1} / {mod.concepts.length}</span>
        </div>

        {/* Animated concept card */}
        <div key={`${domain}-${conceptIdx}`} className="concept-in"
          style={{borderRadius:16,overflow:'hidden',border:`1px solid ${ctype.border}`,boxShadow:'0 4px 20px rgba(0,0,0,0.08)',marginBottom:20}}>

          {/* Type header */}
          <div style={{background:ctype.bg,padding:'11px 20px',borderBottom:`1px solid ${ctype.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:16}}>{ctype.icon}</span>
              <span style={{fontSize:11,fontWeight:800,color:ctype.color,textTransform:'uppercase',letterSpacing:'0.08em'}}>{ctype.label}</span>
            </div>
            <Pill text={domain.split(' ')[0]} color={C.primary} bg={C.primaryLight}/>
          </div>

          <div style={{background:C.white,padding:'22px 22px 20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,marginBottom:14}}>
              <h3 style={{fontSize:17,fontWeight:800,color:ctype.color,margin:0,lineHeight:1.35,flex:1}}>{concept.title}</h3>
              <TTSButton
                token={`mod:${domain}:${conceptIdx}`}
                text={`${concept.title}. ${concept.body}${concept.example ? '. Example: ' + concept.example : ''}`}
                label="Read"
                size="xs"
              />
            </div>
            <p style={{fontSize:14,lineHeight:1.82,color:C.text,margin:0}}>{concept.body}</p>

            {/* Applied example */}
            {concept.example && (
              <div style={{marginTop:20,background:'#fffbeb',borderLeft:'4px solid #f59e0b',borderRadius:'0 12px 12px 0',padding:'14px 16px'}}>
                <div style={{fontSize:11,fontWeight:800,color:'#92400e',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:8,display:'flex',alignItems:'center',gap:5}}>
                  <span>📋</span> Applied Example
                </div>
                <p style={{fontSize:14,lineHeight:1.72,color:'#374151',margin:0,fontStyle:'italic'}}>{concept.example}</p>
              </div>
            )}

            {/* SVG visual */}
            {concept.visual && (
              <div className="visual-card" style={{marginTop:20,background:C.grayLight,borderRadius:12,padding:'16px 10px'}}>
                <ConceptVisual type={concept.visual}/>
              </div>
            )}

            {/* Key term flip cards */}
            {concept.keyTerms && concept.keyTerms.length > 0 && (
              <div style={{marginTop:20}}>
                <div style={{fontSize:11,fontWeight:800,color:C.muted,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:10,display:'flex',alignItems:'center',gap:5}}>
                  <span>🔑</span> Key Terms · tap cards to reveal definitions
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(138px,1fr))',gap:8}}>
                  {concept.keyTerms.map((kt,ki)=>(
                    <KeyTermCard key={ki} term={kt.term} def={kt.def} color={ctype.color} bg={ctype.bg} border={ctype.border}/>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10}}>
          <button onClick={()=>nav(-1)} disabled={conceptIdx===0}
            style={{padding:'11px 22px',borderRadius:10,border:`1px solid ${C.border}`,background:C.white,
              color:conceptIdx===0?C.muted:C.primary,cursor:conceptIdx===0?'default':'pointer',fontSize:14,fontWeight:600}}>
            ← Previous
          </button>
          {isLast
            ? <button onClick={onStartQuiz}
                style={{padding:'11px 28px',borderRadius:10,border:'none',background:C.accent,color:C.white,cursor:'pointer',fontSize:14,fontWeight:700}}>
                Take Quiz →
              </button>
            : <button onClick={()=>nav(1)}
                style={{padding:'11px 22px',borderRadius:10,border:'none',background:C.primary,color:C.white,cursor:'pointer',fontSize:14,fontWeight:600}}>
                Next Concept →
              </button>
          }
        </div>
      </div>
    )
  }

  if(allAnswered) {
    const missed = mod.practice
      .map((pq, i) => ({...pq, _i: i, _userAns: answers[i]}))
      .filter(pq => pq._userAns !== pq.correct)

    return (
      <div style={{maxWidth:660,margin:'0 auto',padding:passed?'48px 20px':'32px 20px',fontFamily:'system-ui'}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:52,marginBottom:10}}>{passed?'🎉':'📖'}</div>
          <h2 style={{fontSize:22,fontWeight:700,color:passed?C.green:C.red,fontFamily:'Georgia,serif',margin:'0 0 6px'}}>
            {passed?'Module Passed!':'Not Quite Yet'}
          </h2>
          <p style={{fontSize:16,color:C.muted,margin:0}}>
            Score: <strong style={{color:passed?C.green:C.red}}>{score}/5 ({pct(score,5)}%)</strong>
            {passed?' — 80% threshold met':' — 80% required to pass'}
          </p>
        </div>

        {!passed && missed.length > 0 && (
          <>
            <div style={{fontSize:11,fontWeight:800,color:C.muted,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
              <span>🔍</span> Review your {missed.length} missed question{missed.length>1?'s':''} before retrying
            </div>
            {missed.map(mq => <MissedQuestionCard key={mq._i} q={mq}/>)}
          </>
        )}

        <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',marginTop:24}}>
          {passed ? (
            <button onClick={()=>onFinish('passed')} style={{padding:'14px 32px',background:C.green,color:C.white,border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer'}}>✓ Complete Module</button>
          ) : (
            <>
              <button onClick={onReviewConcepts} style={{padding:'13px 22px',background:C.white,color:C.primary,border:`2px solid ${C.primary}`,borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer'}}>📖 Re-read Concepts</button>
              <button onClick={()=>onAnswer('reset')} style={{padding:'13px 26px',background:C.primary,color:C.white,border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer'}}>↻ Retry Quiz</button>
              <button onClick={()=>onFinish('failed')} style={{padding:'13px 18px',background:'transparent',color:C.muted,border:'none',cursor:'pointer',fontSize:13,fontWeight:600}}>Back to Modules</button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{maxWidth:680,margin:'0 auto',padding:'28px 20px',fontFamily:'system-ui'}}>
      <div style={{marginBottom:16}}>
        <Pill text={domain} color={C.primary} bg={C.primaryLight}/>
        <span style={{marginLeft:8,fontSize:12,color:C.muted}}>Quiz Q {qIndex+1} of {mod.practice.length}</span>
      </div>
      <div style={{height:4,background:C.border,borderRadius:99,marginBottom:20,overflow:'hidden'}}>
        <div style={{width:`${((qIndex+1)/mod.practice.length)*100}%`,height:'100%',background:C.accent,borderRadius:99}}/>
      </div>
      <Card style={{marginBottom:16}}>
        <p style={{fontSize:16,lineHeight:1.65,color:C.text,margin:0,fontFamily:'Georgia,serif',fontWeight:500}}>{pq.stem}</p>
      </Card>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
        {pq.options.map((opt,i)=>{
          const isSel=selected===i
          const showFb=selected!==undefined
          const isCorrect=i===pq.correct
          let bg=C.white,border=C.border
          if(showFb&&isCorrect){bg=C.greenBg;border=C.greenBorder}
          else if(showFb&&isSel&&!isCorrect){bg=C.redBg;border=C.redBorder}
          else if(isSel){bg=C.primaryLight;border=C.primary}
          return (
            <button key={i} onClick={()=>!showFb&&onAnswer(qIndex,i)}
              style={{textAlign:'left',padding:'13px 16px',borderRadius:12,border:`2px solid ${border}`,background:bg,cursor:showFb?'default':'pointer',fontSize:14,color:C.text,display:'flex',gap:12,alignItems:'flex-start'}}>
              <span style={{fontWeight:700,flexShrink:0,color:C.muted}}>{['A','B','C','D'][i]}.</span>
              <span style={{flex:1}}>{opt}</span>
              {showFb&&isCorrect&&<span style={{color:C.green,fontWeight:700}}>✓</span>}
              {showFb&&isSel&&!isCorrect&&<span style={{color:C.red,fontWeight:700}}>✗</span>}
            </button>
          )
        })}
      </div>
      {selected!==undefined&&(
        <>
          <Card style={{background:C.grayLight,marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
              <p style={{fontSize:13,color:C.text,margin:0,lineHeight:1.6,flex:1}}><strong>Explanation:</strong> {pq.rationale}</p>
              <TTSButton token={`rat:mod:${qIndex}`} text={pq.rationale} label="" size="xs"/>
            </div>
          </Card>
          {qIndex<mod.practice.length-1&&(
            <button onClick={()=>onAnswer('next')} style={{width:'100%',padding:'13px',background:C.primary,color:C.white,border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer'}}>Next Question →</button>
          )}
        </>
      )}
    </div>
  )
}

// ── EXAM INTRO ───────────────────────────────────────────
function ExamIntro({onStart}) {
  return (
    <div style={{maxWidth:580,margin:'0 auto',padding:'56px 20px',textAlign:'center',fontFamily:'system-ui'}}>
      <div style={{fontSize:52,marginBottom:12}}>🏁</div>
      <h2 style={{fontSize:24,fontWeight:700,color:C.primary,fontFamily:'Georgia,serif',marginBottom:8}}>Full BCBA Mock Exam</h2>
      <p style={{fontSize:15,color:C.muted,marginBottom:28,lineHeight:1.6}}>
        185 questions (175 scored + 10 pilot) · 4-hour timer · All 9 domains<br/>
        Mirrors the BCBA® 6th Edition Test Content Outline (2025+).<br/>
        Passing score: <strong>~70%</strong>
      </p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:32}}>
        {[['185','Questions'],['4 hrs','Time Limit'],['~70%','Passing Score']].map(([v,l])=>(
          <Card key={l} style={{padding:16,textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:800,color:C.primary}}>{v}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>{l}</div>
          </Card>
        ))}
      </div>
      <button onClick={onStart} style={{padding:'15px 40px',background:C.primary,color:C.white,border:'none',borderRadius:12,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'Georgia,serif'}}>
        Begin Full Exam →
      </button>
    </div>
  )
}

// ── EXAM SCREEN ──────────────────────────────────────────
function ExamScreen({questions,answers,qIndex,timerSeconds,onAnswer,onNav,onSubmit,flagged,onFlag}) {
  const total = questions.length
  const answered = Object.keys(answers).length
  const q = questions[qIndex]
  const selected = answers[qIndex]
  const hrs = Math.floor(timerSeconds/3600)
  const mins = Math.floor((timerSeconds%3600)/60)
  const secs = timerSeconds%60
  const timerColor = timerSeconds<1800?C.red:timerSeconds<3600?C.accent:C.white
  const [showMap,setShowMap] = useState(false)

  return (
    <div style={{maxWidth:700,margin:'0 auto',padding:'20px 20px',fontFamily:'system-ui'}}>
      <div style={{background:C.primary,borderRadius:12,padding:'10px 16px',marginBottom:20,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
        <div>
          <Pill text={q.domain_name} color={C.primary} bg={C.white}/>
          <span style={{marginLeft:8,fontSize:12,color:'#93c5fd'}}>Q {qIndex+1}/{total}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <span style={{fontSize:13,color:'rgba(255,255,255,0.75)'}}>{answered}/{total} answered</span>
          <span style={{fontSize:20,fontWeight:800,color:timerColor,fontVariantNumeric:'tabular-nums'}}>
            {String(hrs).padStart(2,'0')}:{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
          </span>
        </div>
      </div>
      <div style={{height:3,background:C.border,borderRadius:99,marginBottom:20,overflow:'hidden'}}>
        <div style={{width:`${(answered/total)*100}%`,height:'100%',background:C.primaryMid,borderRadius:99}}/>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <Card style={{flex:1,padding:'16px 20px'}}>
          <p style={{fontSize:16,lineHeight:1.65,color:C.text,margin:0,fontFamily:'Georgia,serif',fontWeight:500}}>{q.stem}</p>
        </Card>
      </div>
      <button onClick={()=>onFlag(qIndex)}
        style={{marginBottom:12,padding:'5px 12px',borderRadius:8,border:`1px solid ${flagged.has(qIndex)?C.accent:C.border}`,background:flagged.has(qIndex)?C.accentBg:C.white,color:flagged.has(qIndex)?C.accent:C.muted,cursor:'pointer',fontSize:12,fontWeight:600}}>
        {flagged.has(qIndex)?'🚩 Flagged':'🏳 Flag for Review'}
      </button>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
        {q.options.map((opt,i)=>{
          const isSel=selected===i
          return (
            <button key={i} onClick={()=>onAnswer(qIndex,i)}
              style={{textAlign:'left',padding:'13px 16px',borderRadius:12,border:`2px solid ${isSel?C.primary:C.border}`,background:isSel?C.primaryLight:C.white,cursor:'pointer',fontSize:14,color:C.text,display:'flex',alignItems:'center',gap:12}}>
              <span style={{width:26,height:26,borderRadius:'50%',border:`2px solid ${isSel?C.primary:C.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:isSel?C.primary:C.muted,flexShrink:0,background:isSel?C.white:'transparent'}}>
                {['A','B','C','D'][i]}
              </span>
              {opt}
            </button>
          )
        })}
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <button onClick={()=>onNav(-1)} disabled={qIndex===0}
          style={{padding:'10px 20px',borderRadius:10,border:`1px solid ${C.border}`,background:C.white,color:qIndex===0?C.muted:C.primary,cursor:qIndex===0?'default':'pointer',fontSize:14,fontWeight:600}}>← Back</button>
        <button onClick={()=>setShowMap(!showMap)}
          style={{padding:'8px 14px',borderRadius:10,border:`1px solid ${C.border}`,background:C.white,color:C.primary,cursor:'pointer',fontSize:13,fontWeight:600}}>📋 Navigator</button>
        {qIndex<total-1
          ?<button onClick={()=>onNav(1)} style={{padding:'10px 20px',borderRadius:10,border:'none',background:C.primary,color:C.white,cursor:'pointer',fontSize:14,fontWeight:600}}>Next →</button>
          :<button onClick={onSubmit} disabled={answered<total}
              style={{padding:'10px 20px',borderRadius:10,border:'none',background:answered<total?C.muted:C.accent,color:C.white,cursor:answered<total?'default':'pointer',fontSize:14,fontWeight:600}}>
              {answered<total?`${total-answered} left`:'Submit Exam ✓'}
            </button>}
      </div>
      {showMap&&(
        <Card style={{marginTop:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <h3 style={{fontSize:14,fontWeight:700,color:C.primary,margin:0}}>Question Navigator</h3>
            <button onClick={()=>setShowMap(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:C.muted}}>×</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',gap:4}}>
            {questions.map((_,i)=>{
              const isAns=answers[i]!==undefined
              const isFlag=flagged.has(i)
              const isCur=i===qIndex
              return (
                <button key={i} onClick={()=>{onNav(i-qIndex);setShowMap(false)}}
                  style={{aspectRatio:'1',borderRadius:6,border:isCur?`2px solid ${C.primary}`:'none',background:isFlag?C.accentBg:isAns?C.primaryLight:C.grayLight,color:isFlag?C.accent:isAns?C.primary:C.muted,fontSize:11,fontWeight:700,cursor:'pointer'}}>
                  {i+1}
                </button>
              )
            })}
          </div>
          <div style={{display:'flex',gap:16,marginTop:10,flexWrap:'wrap'}}>
            {[['Answered',C.primaryLight,C.primary],['Flagged',C.accentBg,C.accent],['Unanswered',C.grayLight,C.muted]].map(([l,bg,c])=>(
              <span key={l} style={{fontSize:11,color:c,display:'flex',alignItems:'center',gap:4}}>
                <span style={{width:12,height:12,background:bg,borderRadius:3,display:'inline-block'}}/>
                {l}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ── FINAL RESULTS ────────────────────────────────────────
// ── SELF-GRAPH (line chart of recent SAFMEDS sessions) ────
function SelfGraph({history}) {
  const recent = (history||[]).slice(-15)
  if (recent.length < 2) {
    return <div style={{textAlign:'center',padding:'18px 12px',fontSize:12,color:C.muted,fontStyle:'italic'}}>📊 Run at least 2 timed sessions to see your fluency curve.</div>
  }
  const W=300, H=110, padL=22, padB=18, padT=10
  const rates = recent.map(r => r.rate || 0)
  const maxRate = Math.max(...rates, 10)
  const pts = rates.map((r, i) => {
    const x = padL + (i / (rates.length-1)) * (W - padL - 8)
    const y = padT + (1 - r/maxRate) * (H - padT - padB)
    return [x, y]
  })
  const polyLine = pts.map(p => p.join(',')).join(' ')
  return (
    <div>
      <div style={{fontSize:11,fontWeight:800,color:C.muted,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:6}}>📊 Your Fluency (last {recent.length} sessions)</div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',display:'block'}}>
        <line x1={padL} y1={padT} x2={padL} y2={H-padB} stroke="#e2e8f0" strokeWidth={1}/>
        <line x1={padL} y1={H-padB} x2={W-4} y2={H-padB} stroke="#e2e8f0" strokeWidth={1}/>
        <text x={padL-3} y={padT+4} textAnchor="end" fontSize={8} fill="#94a3b8">{Math.ceil(maxRate)}/min</text>
        <text x={padL-3} y={H-padB+2} textAnchor="end" fontSize={8} fill="#94a3b8">0</text>
        <polyline points={polyLine} fill="none" stroke={C.primary} strokeWidth={2}/>
        {pts.map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={3} fill={C.primary}/>
        ))}
        <text x={W/2} y={H-3} textAnchor="middle" fontSize={8} fill="#94a3b8">→ correct/min over time</text>
      </svg>
    </div>
  )
}

// ── SAFMEDS WELCOME CARD ─────────────────────────────────
function SafmedsCard({safmeds, onOpen}) {
  const tokens = safmeds?.totalTokens || 0
  const bestBeginner = safmeds?.decks?.beginner?.high60s || 0
  return (
    <div style={{marginBottom:20,background:'linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)',border:'1px solid #a78bfa',borderRadius:14,padding:'16px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
      <div>
        <h3 style={{fontSize:14,fontWeight:800,color:'#5b21b6',margin:'0 0 4px',textTransform:'uppercase',letterSpacing:'0.06em'}}>🎴 SAFMEDS Fluency Drill</h3>
        <p style={{fontSize:13,color:'#5b21b6',margin:0,opacity:0.85}}>
          🪙 <strong>{tokens}</strong> tokens · Best (Beginner 60s): <strong>{bestBeginner}</strong>
        </p>
      </div>
      <button onClick={onOpen} style={{padding:'10px 18px',background:'#5b21b6',color:C.white,border:'none',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}>
        Drill →
      </button>
    </div>
  )
}

// ── SAFMEDS HUB (deck + mode picker) ──────────────────────
// ── SAFMEDS PROGRESS (data + chart + CSV) ───────────────
// Filterable line chart of correct counts per session over time, with a 7-day
// rolling average overlay. Mirrors how a behavior analyst would visualize
// SAFMEDS frequency data (this is the simple/linear view; SCC view is Phase 2).
function SafmedsProgress({safmeds, onBack}) {
  const history = safmeds?.history || []
  const [filter, setFilter] = useState('mega-or-all')   // 'mega-or-all' | deckId
  const [metric, setMetric] = useState('correct')       // 'correct' | 'rate'
  const [chartType, setChartType] = useState('linear')  // 'linear' | 'scc'

  // Build the filter dropdown options. Group by category.
  const baseLevelOptions = SAFMEDS_LEVELS.map(l => ({ id: l.id, label: l.label, group: 'Levels' }))
  const domainOptions = Object.keys(MODULE_ENHANCEMENTS).map(d => ({ id: `domain:${d}`, label: d, group: 'Per-Domain' }))
  const allOptions = [
    { id: 'mega-or-all', label: '◆ All sessions (every deck)', group: 'Combined' },
    { id: 'mega', label: '🧠 Mega Deck only', group: 'Combined' },
    { id: 'all', label: '🎯 All Terms only', group: 'Combined' },
    ...baseLevelOptions,
    ...domainOptions,
  ]
  const grouped = allOptions.reduce((acc, o) => { (acc[o.group] = acc[o.group] || []).push(o); return acc }, {})

  // Apply filter
  const filtered = filter === 'mega-or-all'
    ? history
    : history.filter(h => h.deck === filter)

  // Group sessions by date and compute per-day series. Multiple sessions on the
  // same day get summed (correct) or averaged (rate).
  const byDate = new Map()
  filtered.forEach(h => {
    if (!h?.date) return
    const cur = byDate.get(h.date) || { date: h.date, correctSum: 0, rateSum: 0, rateCount: 0, sessions: 0 }
    cur.correctSum += (h.correct || 0)
    if (h.rate) { cur.rateSum += h.rate; cur.rateCount++ }
    cur.sessions++
    byDate.set(h.date, cur)
  })
  const dailySeries = [...byDate.values()].sort((a, b) => a.date < b.date ? -1 : 1)
    .map(d => ({
      date: d.date,
      correct: d.correctSum,
      rate: d.rateCount ? Math.round((d.rateSum / d.rateCount) * 10) / 10 : 0,
      sessions: d.sessions,
    }))

  // 7-day rolling average — for each point, average the prior 7 days' values
  // including the current day (windowed back).
  const withRoll = dailySeries.map((d, i) => {
    const window = dailySeries.slice(Math.max(0, i - 6), i + 1)
    const avg = window.reduce((s, w) => s + (w[metric] || 0), 0) / window.length
    return { ...d, roll: Math.round(avg * 10) / 10 }
  })

  // Stats summary
  const totalSessions = filtered.length
  const totalCorrect = filtered.reduce((s, h) => s + (h.correct || 0), 0)
  const avgRate = filtered.length
    ? Math.round((filtered.reduce((s, h) => s + (h.rate || 0), 0) / filtered.length) * 10) / 10
    : 0
  const bestSession = filtered.reduce((best, h) => (h.correct > (best?.correct || 0) ? h : best), null)

  function exportCSV() {
    const rows = [['date', 'deck', 'deck_label', 'mode', 'timer', 'correct', 'missed', 'rate_per_min']]
    history.forEach(h => {
      rows.push([h.date, h.deck, safmedsDeckLabel(h.deck), h.mode, h.timer, h.correct, h.missed, h.rate])
    })
    const csv = rows.map(r => r.map(v => {
      const s = String(v ?? '')
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `safmeds-history-${todayISO()}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // SVG chart geometry
  const W = 720, H = 280, padL = 44, padR = 16, padT = 18, padB = 38
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const yMax = Math.max(...withRoll.map(d => Math.max(d[metric] || 0, d.roll || 0)), metric === 'correct' ? 10 : 5)
  const yTicks = 5
  const xFor = i => withRoll.length <= 1 ? padL + innerW / 2 : padL + (i / (withRoll.length - 1)) * innerW
  const yFor = v => padT + (1 - (v / yMax)) * innerH

  const lineColor = '#5b21b6'
  const rollColor = '#a16207'
  const dotColor = '#5b21b6'
  const fmtDate = s => { const [y, m, d] = (s || '').split('-'); return `${m}/${d}` }

  return (
    <div style={{maxWidth:920,margin:'0 auto',padding:'24px 20px',fontFamily:'system-ui'}}>
      <button onClick={onBack} style={{background:'none',border:'none',color:C.muted,cursor:'pointer',fontSize:14,marginBottom:14,padding:0}}>← Back to SAFMEDS</button>
      <h2 style={{fontSize:22,fontWeight:700,color:'#5b21b6',margin:'0 0 6px',fontFamily:'Georgia,serif'}}>📈 SAFMEDS Progress</h2>
      <p style={{fontSize:14,color:C.muted,margin:'0 0 18px'}}>Frequency correct over time, by deck, with 7-day rolling average.</p>

      {/* Filters */}
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:18,display:'flex',gap:14,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{display:'flex',flexDirection:'column',gap:4,flex:'1 1 240px'}}>
          <label style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.07em'}} htmlFor="sfx-filter">Deck</label>
          <select id="sfx-filter" value={filter} onChange={e=>setFilter(e.target.value)}
            style={{padding:'8px 10px',borderRadius:8,border:`1px solid ${C.border}`,background:C.white,fontSize:13,fontFamily:'inherit'}}>
            {Object.entries(grouped).map(([group, opts]) => (
              <optgroup key={group} label={group}>
                {opts.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          <label style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.07em'}}>Chart</label>
          <div style={{display:'flex',gap:6}}>
            {[{id:'linear',label:'Linear'},{id:'scc',label:'Standard Celeration'}].map(c=>(
              <button key={c.id} onClick={()=>setChartType(c.id)}
                style={{padding:'7px 12px',borderRadius:8,border:`1.5px solid ${chartType===c.id?'#5b21b6':C.border}`,background:chartType===c.id?'#5b21b6':C.white,color:chartType===c.id?C.white:'#5b21b6',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'inherit'}}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        {chartType === 'linear' && (
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            <label style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.07em'}}>Metric</label>
            <div style={{display:'flex',gap:6}}>
              {[{id:'correct',label:'Correct (count)'},{id:'rate',label:'Correct/min'}].map(m=>(
                <button key={m.id} onClick={()=>setMetric(m.id)}
                  style={{padding:'7px 12px',borderRadius:8,border:`1.5px solid ${metric===m.id?'#5b21b6':C.border}`,background:metric===m.id?'#5b21b6':C.white,color:metric===m.id?C.white:'#5b21b6',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'inherit'}}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{flex:'1 0 auto',display:'flex',justifyContent:'flex-end'}}>
          <button onClick={exportCSV} disabled={history.length===0}
            style={{padding:'8px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.white,color:history.length===0?C.muted:C.primary,cursor:history.length===0?'default':'pointer',fontSize:12,fontWeight:700,fontFamily:'inherit'}}>
            ⬇ Export CSV
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))',gap:10,marginBottom:18}}>
        {[
          {label:'Sessions', value: totalSessions},
          {label:'Total correct', value: totalCorrect},
          {label:'Avg correct/min', value: avgRate || '—'},
          {label:'Best session', value: bestSession ? `${bestSession.correct} (${bestSession.timer}s)` : '—'},
        ].map((s,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:'10px 12px'}}>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:'0.07em',textTransform:'uppercase'}}>{s.label}</div>
            <div style={{fontSize:18,fontWeight:800,color:C.text}}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:'18px 18px 12px'}}>
        {filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'48px 12px',fontSize:13,color:C.muted,fontStyle:'italic'}}>
            📊 No sessions match this filter yet. Run a SAFMEDS drill to start your data.
          </div>
        ) : chartType === 'scc' ? (
          <SCCChart filtered={filtered}/>
        ) : (
          <>
            <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',display:'block'}}>
              {/* Grid + Y-axis ticks */}
              {Array.from({length: yTicks+1}).map((_,i) => {
                const v = (yMax / yTicks) * i
                const y = yFor(v)
                return (
                  <g key={i}>
                    <line x1={padL} y1={y} x2={W-padR} y2={y} stroke="#e2e8f0" strokeWidth={1}/>
                    <text x={padL-6} y={y+3} textAnchor="end" fontSize={9} fill="#64748b">{Math.round(v*10)/10}</text>
                  </g>
                )
              })}
              {/* X-axis date ticks (sample evenly) */}
              {withRoll.map((d, i) => {
                const showLabel = withRoll.length <= 8 || i === 0 || i === withRoll.length - 1 || (i % Math.ceil(withRoll.length/8) === 0)
                if (!showLabel) return null
                return (
                  <text key={d.date} x={xFor(i)} y={H-padB+14} textAnchor="middle" fontSize={9} fill="#64748b">{fmtDate(d.date)}</text>
                )
              })}
              {/* Axis labels */}
              <text x={padL-32} y={padT+innerH/2} fontSize={10} fill="#64748b" transform={`rotate(-90 ${padL-32} ${padT+innerH/2})`} textAnchor="middle">
                {metric==='correct' ? 'Correct (count per day)' : 'Correct per minute'}
              </text>
              <text x={padL+innerW/2} y={H-6} fontSize={10} fill="#64748b" textAnchor="middle">Date</text>
              {/* Daily value line */}
              {withRoll.length > 1 && (
                <polyline
                  fill="none" stroke={lineColor} strokeWidth={2}
                  points={withRoll.map((d,i) => `${xFor(i)},${yFor(d[metric]||0)}`).join(' ')}
                />
              )}
              {/* 7-day rolling average line */}
              {withRoll.length > 1 && (
                <polyline
                  fill="none" stroke={rollColor} strokeWidth={2} strokeDasharray="5 4"
                  points={withRoll.map((d,i) => `${xFor(i)},${yFor(d.roll||0)}`).join(' ')}
                />
              )}
              {/* Daily dots */}
              {withRoll.map((d,i) => (
                <circle key={d.date} cx={xFor(i)} cy={yFor(d[metric]||0)} r={3.5} fill={dotColor}>
                  <title>{`${d.date} • ${d[metric]} ${metric==='correct'?'correct':'cpm'} • ${d.sessions} session${d.sessions===1?'':'s'}`}</title>
                </circle>
              ))}
            </svg>
            {/* Legend */}
            <div style={{display:'flex',gap:18,justifyContent:'center',marginTop:6,fontSize:11,color:C.muted,flexWrap:'wrap'}}>
              <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                <span style={{width:18,height:2,background:lineColor,display:'inline-block'}}/> Daily {metric==='correct'?'correct count':'correct/min'}
              </span>
              <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                <span style={{width:18,height:2,background:rollColor,display:'inline-block',borderTop:`2px dashed ${rollColor}`}}/> 7-day rolling average
              </span>
            </div>
          </>
        )}
      </div>

      <p style={{fontSize:11,color:C.muted,margin:'14px 0 0',textAlign:'center'}}>
        {chartType === 'scc'
          ? 'Standard Celeration Chart · semi-log · 4 decades (0.1–1000/min) · • = correct/min · ✕ = errors/min · — — aim line at 30/min'
          : 'Linear chart · per-day aggregation · solid line = daily, dashed = 7-day rolling average. CSV export includes all session data.'}
      </p>
    </div>
  )
}

// Standard Celeration Chart — canonical ABA chart for fluency data.
// Semi-log y-axis, 4 decades (0.1 to 1000/min). Linear x-axis spanning the
// data range (capped at 140 days from latest entry). Plots one filled dot
// per timed session at correct/min and one × at error/min, with an aim line
// at 30/min (typical SAFMEDS fluency target). Untimed sessions are excluded
// because rate is undefined for them.
function SCCChart({ filtered }) {
  const W = 720, H = 360, padL = 52, padR = 16, padT = 18, padB = 42
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const Y_MIN = 0.1, Y_MAX = 1000   // 4 decades
  const LOG_MIN = Math.log10(Y_MIN)
  const LOG_MAX = Math.log10(Y_MAX)
  const LOG_RANGE = LOG_MAX - LOG_MIN
  const AIM_RATE = 30

  const timed = filtered.filter(h => h.mode === 'timed' && h.timer > 0)
  if (timed.length === 0) {
    return (
      <div style={{textAlign:'center',padding:'48px 12px',fontSize:13,color:'#64748b',fontStyle:'italic'}}>
        📊 No timed sessions yet. The Standard Celeration Chart only displays timed (rate-based) data. Switch to a timed sprint and grade some cards.
      </div>
    )
  }

  // Build session points with computed correct/min and error/min
  const points = timed.map(h => {
    const correctRate = h.timer ? (h.correct / h.timer) * 60 : 0
    const errorRate = h.timer ? ((h.missed || 0) / h.timer) * 60 : 0
    return { date: h.date, deck: h.deck, timer: h.timer, correctRate, errorRate, correct: h.correct, missed: h.missed || 0 }
  })

  // Date range — earliest data to today, capped at 140 days
  const dates = points.map(p => p.date).sort()
  const latestStr = dates[dates.length - 1]
  const earliestStr = dates[0]
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)) }
  const dayMs = 86400000
  const latest = parse(latestStr)
  const earliest = parse(earliestStr)
  const span = Math.max(28, Math.min(140, Math.ceil((latest - earliest) / dayMs) + 1))
  const startDate = new Date(latest.getTime() - (span - 1) * dayMs)
  const totalDays = span

  const dayIdx = dStr => Math.round((parse(dStr) - startDate) / dayMs)
  const xFor = idx => padL + (idx / Math.max(1, totalDays - 1)) * innerW
  const yFor = rate => {
    const r = Math.max(Y_MIN, rate || Y_MIN / 10)
    return padT + (1 - (Math.log10(r) - LOG_MIN) / LOG_RANGE) * innerH
  }
  const fmtDate = d => `${d.getUTCMonth() + 1}/${d.getUTCDate()}`

  // Decade major lines + sub-decade minor lines (logarithmic gridlines)
  const decades = [0.1, 1, 10, 100, 1000]
  const subValues = [2, 3, 4, 5, 6, 7, 8, 9]   // for minor lines within each decade

  // Sunday vertical lines (slightly darker than weekday gridlines)
  const dayLines = Array.from({ length: totalDays }).map((_, i) => {
    const d = new Date(startDate.getTime() + i * dayMs)
    const isSunday = d.getUTCDay() === 0
    return { i, isSunday, isFirstOfMonth: d.getUTCDate() === 1, label: i === 0 || d.getUTCDate() === 1 || i === totalDays - 1, dateLabel: fmtDate(d) }
  })

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
        {/* Day-of-month vertical gridlines */}
        {dayLines.map(({ i, isSunday, isFirstOfMonth }) => (
          <line key={`v${i}`} x1={xFor(i)} y1={padT} x2={xFor(i)} y2={H - padB}
            stroke={isFirstOfMonth ? '#94a3b8' : isSunday ? '#cbd5e1' : '#eef2f6'}
            strokeWidth={isFirstOfMonth ? 1.2 : 0.8} />
        ))}
        {/* Sub-decade horizontal gridlines (light) */}
        {decades.slice(0, -1).flatMap((dec, di) =>
          subValues.map(s => {
            const v = dec * s
            if (v >= Y_MAX) return null
            return <line key={`sub${di}-${s}`} x1={padL} y1={yFor(v)} x2={W - padR} y2={yFor(v)} stroke="#f1f5f9" strokeWidth={0.7} />
          })
        )}
        {/* Decade horizontal gridlines (dark) + labels */}
        {decades.map(d => (
          <g key={`dec${d}`}>
            <line x1={padL} y1={yFor(d)} x2={W - padR} y2={yFor(d)} stroke="#94a3b8" strokeWidth={1} />
            <text x={padL - 8} y={yFor(d) + 3} textAnchor="end" fontSize={10} fill="#475569" fontWeight={700}>{d}</text>
          </g>
        ))}
        {/* Aim line at 30/min */}
        <line x1={padL} y1={yFor(AIM_RATE)} x2={W - padR} y2={yFor(AIM_RATE)} stroke="#16a34a" strokeWidth={1.5} strokeDasharray="6 4" />
        <text x={W - padR - 4} y={yFor(AIM_RATE) - 4} textAnchor="end" fontSize={10} fill="#16a34a" fontWeight={700}>AIM 30/min</text>
        {/* X-axis date labels */}
        {dayLines.filter(d => d.label).map(({ i, dateLabel }) => (
          <text key={`xl${i}`} x={xFor(i)} y={H - padB + 14} textAnchor="middle" fontSize={9} fill="#64748b">{dateLabel}</text>
        ))}
        {/* Axis labels */}
        <text x={padL - 38} y={padT + innerH / 2} fontSize={11} fill="#475569" fontWeight={700}
          transform={`rotate(-90 ${padL - 38} ${padT + innerH / 2})`} textAnchor="middle">
          Count / minute (log scale)
        </text>
        <text x={padL + innerW / 2} y={H - 6} fontSize={10} fill="#64748b" textAnchor="middle">Date · {totalDays} days</text>
        {/* Data: filled dots = correct rate, X marks = error rate */}
        {points.map((p, i) => {
          const idx = dayIdx(p.date)
          if (idx < 0 || idx >= totalDays) return null
          const x = xFor(idx)
          return (
            <g key={`p${i}`}>
              {p.errorRate > 0 && (
                <g stroke="#dc2626" strokeWidth={1.5}>
                  <line x1={x - 4} y1={yFor(p.errorRate) - 4} x2={x + 4} y2={yFor(p.errorRate) + 4} />
                  <line x1={x - 4} y1={yFor(p.errorRate) + 4} x2={x + 4} y2={yFor(p.errorRate) - 4} />
                </g>
              )}
              <circle cx={x} cy={yFor(p.correctRate)} r={3.8} fill="#16a34a" stroke="#fff" strokeWidth={0.8}>
                <title>{`${p.date} · ${safmedsDeckLabel(p.deck)} · ${Math.round(p.correctRate*10)/10}/min correct · ${Math.round(p.errorRate*10)/10}/min errors`}</title>
              </circle>
            </g>
          )
        })}
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 8, fontSize: 11, color: '#64748b', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Correct/min
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#dc2626' }}>
          ✕ Errors/min
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#16a34a' }}>
          <span style={{ width: 18, height: 0, borderTop: '2px dashed #16a34a', display: 'inline-block' }} /> Aim line
        </span>
      </div>
    </>
  )
}

function SafmedsHub({safmeds, onStart, onBack, onProgress}) {
  const tokens = safmeds?.totalTokens || 0
  const [mode, setMode] = useState(safmeds?.lastMode || 'timed')
  const [timer, setTimer] = useState(safmeds?.lastTimer || 60)

  const domainDecks = Object.keys(MODULE_ENHANCEMENTS).map(d => ({
    id: `domain:${d}`,
    label: d,
    icon: MODULES[d]?.icon || '📚',
    count: getSafmedsCards(`domain:${d}`).length,
  }))

  const startDeck = (deckId) => onStart({ deckId, mode, timer })

  return (
    <div style={{maxWidth:760,margin:'0 auto',padding:'24px 20px',fontFamily:'system-ui'}}>
      <button onClick={onBack} style={{background:'none',border:'none',color:C.muted,cursor:'pointer',fontSize:14,marginBottom:14,padding:0}}>← Back</button>
      <h2 style={{fontSize:22,fontWeight:700,color:'#5b21b6',margin:'0 0 6px',fontFamily:'Georgia,serif'}}>🎴 SAFMEDS Fluency Drill</h2>
      <p style={{fontSize:14,color:C.muted,margin:'0 0 18px'}}>Say All Fast Minute Each Day Shuffled · See definition → recall term → self-grade</p>

      {/* Token + level summary */}
      <div style={{background:'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)',border:'1px solid #c4b5fd',borderRadius:14,padding:'14px 18px',marginBottom:20,display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:11,fontWeight:800,color:'#5b21b6',textTransform:'uppercase',letterSpacing:'0.06em'}}>Token Balance</div>
          <div style={{fontSize:24,fontWeight:900,color:'#5b21b6'}}>🪙 {tokens}</div>
        </div>
        <div style={{flex:1,minWidth:200}}>
          <SelfGraph history={safmeds?.history}/>
        </div>
      </div>

      {/* Mode + timer selector */}
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:20}}>
        <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
          {['timed','practice'].map(m=>(
            <button key={m} onClick={()=>setMode(m)}
              style={{padding:'7px 14px',borderRadius:99,border:`1.5px solid ${mode===m?'#5b21b6':C.border}`,background:mode===m?'#5b21b6':C.white,color:mode===m?C.white:'#5b21b6',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'inherit'}}>
              {m==='timed'?'⏱ Timed Sprint':'🐢 Untimed Practice'}
            </button>
          ))}
        </div>
        {mode==='timed' && (
          <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
            <span style={{fontSize:12,color:C.muted,marginRight:4}}>Timer:</span>
            {SAFMEDS_TIMERS.map(t=>(
              <button key={t} onClick={()=>setTimer(t)}
                style={{padding:'5px 12px',borderRadius:8,border:`1px solid ${timer===t?'#5b21b6':C.border}`,background:timer===t?'#ede9fe':C.white,color:timer===t?'#5b21b6':C.text,cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'inherit'}}>
                {t}s
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Difficulty levels */}
      <h3 style={{fontSize:13,fontWeight:800,color:C.muted,textTransform:'uppercase',letterSpacing:'0.07em',margin:'0 0 10px'}}>Difficulty Levels</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))',gap:10,marginBottom:24}}>
        {SAFMEDS_LEVELS.map(lvl=>{
          const unlocked = isLevelUnlocked(lvl.id, tokens)
          const cards = getSafmedsCards(lvl.id)
          const stats = safmeds?.decks?.[lvl.id] || {}
          return (
            <button key={lvl.id} onClick={()=>unlocked && cards.length>0 && startDeck(lvl.id)} disabled={!unlocked || cards.length===0}
              style={{textAlign:'left',padding:'14px',borderRadius:12,border:`2px solid ${unlocked?lvl.color:C.border}`,
                background:unlocked?C.white:C.grayLight,cursor:unlocked && cards.length>0?'pointer':'default',
                opacity:unlocked?1:0.6,fontFamily:'inherit'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <span style={{fontSize:18}}>{unlocked?lvl.icon:'🔒'}</span>
                <span style={{fontSize:14,fontWeight:800,color:unlocked?lvl.color:C.muted}}>{lvl.label}</span>
              </div>
              <div style={{fontSize:11,color:C.muted}}>{cards.length} cards{cards.length===0?' (loading…)':''}</div>
              {!unlocked && <div style={{fontSize:11,color:C.muted,marginTop:4}}>🪙 {lvl.unlock} tokens to unlock</div>}
              {unlocked && stats.high60s > 0 && <div style={{fontSize:11,color:lvl.color,marginTop:4}}>Best 60s: <strong>{stats.high60s}</strong></div>}
            </button>
          )
        })}
      </div>

      {/* Mega deck — every term across base levels + every domain deck */}
      <h3 style={{fontSize:13,fontWeight:800,color:C.muted,textTransform:'uppercase',letterSpacing:'0.07em',margin:'0 0 10px'}}>Mega Deck</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:24}}>
        <button onClick={()=>startDeck('mega')}
          style={{textAlign:'left',padding:'14px 16px',borderRadius:12,border:`2px solid #5b21b6`,background:'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)',cursor:'pointer',fontFamily:'inherit'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
            <span style={{fontSize:18}}>🧠</span>
            <span style={{fontSize:14,fontWeight:800,color:'#5b21b6'}}>Mega Deck</span>
          </div>
          <div style={{fontSize:11,color:'#5b21b6',opacity:0.8}}>{getSafmedsCards('mega').length} cards · everything mixed (levels + domains)</div>
        </button>
        <button onClick={()=>startDeck('all')}
          style={{textAlign:'left',padding:'14px 16px',borderRadius:12,border:`2px solid ${C.accent}`,background:C.accentBg,cursor:'pointer',fontFamily:'inherit'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
            <span style={{fontSize:18}}>🎯</span>
            <span style={{fontSize:14,fontWeight:800,color:C.accent}}>All Terms</span>
          </div>
          <div style={{fontSize:11,color:C.accent,opacity:0.8}}>{getSafmedsCards('all').length} cards · every level mixed</div>
        </button>
      </div>

      {/* View progress button */}
      {(safmeds?.history?.length || 0) > 0 && (
        <button onClick={onProgress}
          style={{width:'100%',padding:'12px 16px',borderRadius:10,border:`1px solid #5b21b6`,background:C.white,color:'#5b21b6',cursor:'pointer',fontSize:13,fontWeight:700,fontFamily:'inherit',marginBottom:24,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          📈 View Progress Chart →
        </button>
      )}

      {/* Per-domain decks */}
      <h3 style={{fontSize:13,fontWeight:800,color:C.muted,textTransform:'uppercase',letterSpacing:'0.07em',margin:'0 0 10px'}}>Per-Domain Decks</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:8}}>
        {domainDecks.filter(d=>d.count>0).map(d=>(
          <button key={d.id} onClick={()=>startDeck(d.id)}
            style={{textAlign:'left',padding:'12px',borderRadius:10,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',fontFamily:'inherit'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
              <span style={{fontSize:14}}>{d.icon}</span>
              <span style={{fontSize:12,fontWeight:700,color:C.primary,lineHeight:1.2}}>{d.label}</span>
            </div>
            <div style={{fontSize:10,color:C.muted}}>{d.count} cards</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── SAFMEDS SESSION (the actual drill) ────────────────────
function SafmedsSession({deckId, mode, timer, cards, cardIdx, revealed, correct, missed, remaining,
                         onReveal, onGrade, onQuit}) {
  const card = cards[cardIdx % cards.length]
  if (!card) return <div style={{padding:40,textAlign:'center'}}>No cards available.</div>

  const isTimed = mode === 'timed'
  const timerColor = remaining <= 10 ? C.red : remaining <= 30 ? C.accent : '#5b21b6'
  const total = correct + missed
  const rate = isTimed && (timer - remaining) > 0 ? safmedsRate(correct, timer - remaining) : 0

  return (
    <div style={{maxWidth:680,margin:'0 auto',padding:'20px',fontFamily:'system-ui'}}>
      {/* Header bar */}
      <div style={{background:'#5b21b6',borderRadius:12,padding:'10px 16px',marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8,color:C.white}}>
        <div>
          <div style={{fontSize:11,opacity:0.8,textTransform:'uppercase',letterSpacing:'0.07em'}}>SAFMEDS · {mode}</div>
          <div style={{fontSize:13,fontWeight:700}}>✓ {correct}  ·  ✗ {missed}{rate>0 && ` · ${rate}/min`}</div>
        </div>
        {isTimed ? (
          <div style={{fontSize:24,fontWeight:900,color:timerColor==='#5b21b6'?C.white:timerColor,fontVariantNumeric:'tabular-nums'}}>
            {Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')}
          </div>
        ) : (
          <div style={{fontSize:13,opacity:0.85}}>Card {total+1}</div>
        )}
        <button onClick={onQuit} style={{background:'rgba(255,255,255,0.18)',border:'none',color:C.white,padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer'}}>End</button>
      </div>

      {/* Card */}
      <div style={{minHeight:280,background:C.white,border:`2px solid ${revealed?C.greenBorder:'#a78bfa'}`,borderRadius:18,padding:'30px 26px',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',marginBottom:10,boxShadow:'0 6px 24px rgba(91,33,182,0.12)'}}>
        <div style={{fontSize:11,fontWeight:800,color:revealed?C.green:'#5b21b6',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:14}}>
          {revealed?'✓ Term':'Definition'}
        </div>
        {!revealed ? (
          <p style={{fontSize:18,lineHeight:1.55,color:C.text,margin:0,textAlign:'center',fontFamily:'Georgia,serif',fontWeight:500}}>{card.def}</p>
        ) : (
          <div style={{textAlign:'center'}}>
            <h3 style={{fontSize:30,fontWeight:900,color:C.green,margin:'0 0 14px',letterSpacing:'-0.02em'}}>{card.term}</h3>
            <p style={{fontSize:13,lineHeight:1.55,color:C.muted,margin:0,fontStyle:'italic'}}>{card.def}</p>
          </div>
        )}
      </div>

      {/* TTS button — reads the visible side of the card */}
      <div style={{display:'flex',justifyContent:'center',marginBottom:18}}>
        <TTSButton
          token={`sfx:${cardIdx}:${revealed?'back':'front'}`}
          text={revealed ? `${card.term}. ${card.def}` : card.def}
          label="Read aloud"
          size="sm"
        />
      </div>

      {/* Action buttons */}
      {!revealed ? (
        <button onClick={onReveal} style={{width:'100%',padding:'16px',background:'#5b21b6',color:C.white,border:'none',borderRadius:12,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
          Reveal Term →
        </button>
      ) : (
        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>onGrade(false)} style={{flex:1,padding:'15px',background:C.redBg,color:C.red,border:`2px solid ${C.redBorder}`,borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
            ✗ Missed
          </button>
          <button onClick={()=>onGrade(true)} style={{flex:1,padding:'15px',background:C.greenBg,color:C.green,border:`2px solid ${C.greenBorder}`,borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
            ✓ Got It
          </button>
        </div>
      )}
    </div>
  )
}

// ── SAFMEDS RESULTS ──────────────────────────────────────
function SafmedsResults({results, safmeds, onAgain, onPickAnother, onDone}) {
  if (!results) return null
  const { correct, missed, mode, timer, deckId, deckLabel, isPB, tokensEarned, prevHigh } = results
  const rate = mode === 'timed' ? Math.round((correct / timer) * 60 * 10) / 10 : 0
  const stars = mode === 'timed' ? safmedsStars(correct, timer) : 0
  return (
    <div style={{maxWidth:580,margin:'0 auto',padding:'40px 20px',textAlign:'center',fontFamily:'system-ui'}}>
      <div style={{fontSize:48,marginBottom:8}}>{isPB ? '🏆' : '🎴'}</div>
      <h2 style={{fontSize:22,fontWeight:700,color:'#5b21b6',fontFamily:'Georgia,serif',margin:'0 0 4px'}}>
        {isPB ? 'New Personal Best!' : 'Session Complete'}
      </h2>
      <p style={{fontSize:13,color:C.muted,margin:'0 0 22px'}}>{deckLabel} · {mode === 'timed' ? `${timer}s sprint` : 'practice'}</p>

      {/* Stars row */}
      {mode === 'timed' && (
        <div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:14,fontSize:32}}>
          {[1,2,3].map(i=>(<span key={i} style={{filter:i<=stars?'none':'grayscale(1) opacity(0.3)'}}>⭐</span>))}
        </div>
      )}

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:10,marginBottom:18}}>
        <div style={{padding:'14px 8px',borderRadius:12,background:C.greenBg,border:`1px solid ${C.greenBorder}`}}>
          <div style={{fontSize:24,fontWeight:900,color:C.green}}>{correct}</div>
          <div style={{fontSize:11,color:C.green,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>Correct</div>
        </div>
        <div style={{padding:'14px 8px',borderRadius:12,background:C.redBg,border:`1px solid ${C.redBorder}`}}>
          <div style={{fontSize:24,fontWeight:900,color:C.red}}>{missed}</div>
          <div style={{fontSize:11,color:C.red,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>Missed</div>
        </div>
        <div style={{padding:'14px 8px',borderRadius:12,background:'#ede9fe',border:'1px solid #a78bfa'}}>
          <div style={{fontSize:24,fontWeight:900,color:'#5b21b6'}}>{mode==='timed'?`${rate}`:correct+missed}</div>
          <div style={{fontSize:11,color:'#5b21b6',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>{mode==='timed'?'Per Minute':'Total'}</div>
        </div>
      </div>

      {/* Token earnings */}
      <div style={{padding:'14px',borderRadius:12,background:'#fef9ec',border:`1px solid ${C.accentBorder}`,marginBottom:20}}>
        <div style={{fontSize:14,color:C.accent,fontWeight:700}}>🪙 +{tokensEarned} tokens earned</div>
        {isPB && prevHigh!==undefined && <div style={{fontSize:12,color:C.accent,marginTop:4}}>Beat previous best of {prevHigh} (+5 PB bonus)</div>}
        <div style={{fontSize:11,color:C.muted,marginTop:6}}>Total balance: 🪙 {safmeds?.totalTokens || 0}</div>
      </div>

      <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
        <button onClick={onAgain} style={{padding:'12px 22px',background:'#5b21b6',color:C.white,border:'none',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer'}}>↻ Run It Back</button>
        <button onClick={onPickAnother} style={{padding:'12px 22px',background:C.white,color:'#5b21b6',border:'2px solid #5b21b6',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer'}}>📚 Pick Different Deck</button>
        <button onClick={onDone} style={{padding:'12px 18px',background:'transparent',color:C.muted,border:'none',cursor:'pointer',fontSize:13,fontWeight:600}}>← Home</button>
      </div>
    </div>
  )
}

// ── WEAK SPOTS CARD (Welcome screen) ─────────────────────
function WeakSpotsCard({count, onReview}) {
  if (!count) return null
  return (
    <div style={{marginBottom:20,background:'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',border:`1px solid ${C.redBorder}`,borderRadius:14,padding:'16px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
      <div>
        <h3 style={{fontSize:14,fontWeight:800,color:C.red,margin:'0 0 4px',textTransform:'uppercase',letterSpacing:'0.06em'}}>🎯 Weak Spots</h3>
        <p style={{fontSize:13,color:C.red,margin:0,opacity:0.85}}>You have <strong>{count}</strong> question{count===1?'':'s'} to review</p>
      </div>
      <button onClick={onReview} style={{padding:'10px 18px',background:C.red,color:C.white,border:'none',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}>
        Review →
      </button>
    </div>
  )
}

// ── WEAK SPOT REVIEW (single-question with feedback) ──────
function WeakSpotReview({queue, idx, answers, onAnswer, onNext, onQuit, startCount}) {
  const item = queue[idx]
  if (!item) return null
  const q = item.question
  const userAns = answers[idx]
  const showFeedback = userAns !== undefined
  const isCorrect = showFeedback && userAns === q.correct
  return (
    <div style={{maxWidth:680,margin:'0 auto',padding:'24px 20px',fontFamily:'system-ui'}}>
      <button onClick={onQuit} style={{background:'none',border:'none',color:C.muted,cursor:'pointer',fontSize:14,marginBottom:14,padding:0}}>← Save & Exit</button>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:8}}>
        <h2 style={{fontSize:20,fontWeight:700,color:C.red,margin:0,fontFamily:'Georgia,serif'}}>🎯 Weak Spots Review</h2>
        <span style={{fontSize:12,color:C.muted}}>Question {idx+1} of {queue.length} · started with {startCount}</span>
      </div>
      <div style={{height:4,background:C.border,borderRadius:99,marginBottom:18,overflow:'hidden'}}>
        <div style={{width:`${((idx+1)/queue.length)*100}%`,height:'100%',background:C.red,borderRadius:99,transition:'width 0.3s'}}/>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
        <Pill text={q.domain_name} color={C.primary} bg={C.primaryLight}/>
        <span style={{fontSize:11,color:C.muted}}>Streak: {item.consecutiveCorrect||0}/2 to graduate · seen {item.timesAttempted||1}×</span>
      </div>
      <Card style={{marginBottom:16}}>
        <p style={{fontSize:15,lineHeight:1.7,color:C.text,margin:0,fontFamily:'Georgia,serif',fontWeight:500}}>{q.stem}</p>
      </Card>
      <div style={{display:'flex',flexDirection:'column',gap:9,marginBottom:16}}>
        {q.options.map((opt,i)=>{
          const isSel=userAns===i
          const isCorrectOpt = i===q.correct
          let bg=C.white, border=C.border, labelColor=C.muted
          if (showFeedback && isCorrectOpt) { bg=C.greenBg; border=C.greenBorder; labelColor=C.green }
          if (showFeedback && isSel && !isCorrectOpt) { bg=C.redBg; border=C.redBorder; labelColor=C.red }
          if (!showFeedback && isSel) { bg=C.primaryLight; border=C.primary; labelColor=C.primary }
          return (
            <button key={i} onClick={()=>!showFeedback && onAnswer(i)}
              disabled={showFeedback}
              style={{textAlign:'left',padding:'12px 15px',borderRadius:10,border:`2px solid ${border}`,background:bg,
                cursor:showFeedback?'default':'pointer',fontSize:14,color:C.text,display:'flex',alignItems:'flex-start',gap:10}}>
              <span style={{fontWeight:700,flexShrink:0,color:labelColor,minWidth:16}}>{['A','B','C','D'][i]}.</span>
              <span style={{flex:1,lineHeight:1.55}}>{opt}</span>
              {showFeedback && isCorrectOpt && <span style={{color:C.green,fontWeight:700,fontSize:12,whiteSpace:'nowrap'}}>✓ Correct</span>}
              {showFeedback && isSel && !isCorrectOpt && <span style={{color:C.red,fontWeight:700,fontSize:12,whiteSpace:'nowrap'}}>✗ Your pick</span>}
            </button>
          )
        })}
      </div>
      {showFeedback && (
        <>
          <div style={{padding:'10px 14px',borderRadius:10,marginBottom:12,fontSize:13,fontWeight:700,
            background:isCorrect?C.greenBg:C.redBg,color:isCorrect?C.green:C.red,
            border:`1px solid ${isCorrect?C.greenBorder:C.redBorder}`,textAlign:'center'}}>
            {isCorrect ? `✓ Right! ${(item.consecutiveCorrect||0)+1 >= 2 ? 'Graduated 🎓' : `One more in a row to graduate`}` : '✗ Stays in queue — try again next time'}
          </div>
          <Card style={{background:C.grayLight,marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <div style={{fontSize:11,fontWeight:800,color:C.primary,textTransform:'uppercase',letterSpacing:'0.07em'}}>📘 Rationale</div>
              <TTSButton token={`rat:weak:${idx}`} text={q.rationale} label="" size="xs"/>
            </div>
            <p style={{fontSize:13.5,color:C.text,margin:0,lineHeight:1.7}}>{q.rationale}</p>
          </Card>
          <button onClick={onNext}
            style={{width:'100%',padding:'13px',background:C.primary,color:C.white,border:'none',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer'}}>
            {idx < queue.length - 1 ? 'Next Question →' : 'See Summary →'}
          </button>
        </>
      )}
    </div>
  )
}

function WeakSpotSummary({queue, answers, startCount, onContinue, onDone, remaining}) {
  const correctCount = queue.filter((_,i) => answers[i] === queue[i].question.correct).length
  const graduatedCount = queue.filter((item,i) => answers[i] === item.question.correct && (item.consecutiveCorrect||0) + 1 >= 2).length
  return (
    <div style={{maxWidth:560,margin:'0 auto',padding:'48px 20px',textAlign:'center',fontFamily:'system-ui'}}>
      <div style={{fontSize:48,marginBottom:8}}>🎯</div>
      <h2 style={{fontSize:22,fontWeight:700,color:C.primary,fontFamily:'Georgia,serif',margin:'0 0 6px'}}>Review Complete</h2>
      <p style={{fontSize:14,color:C.muted,margin:'0 0 24px'}}>You worked through {queue.length} weak-spot question{queue.length===1?'':'s'}</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:10,marginBottom:24}}>
        <div style={{padding:'14px 8px',borderRadius:12,background:C.greenBg,border:`1px solid ${C.greenBorder}`}}>
          <div style={{fontSize:24,fontWeight:900,color:C.green}}>{correctCount}</div>
          <div style={{fontSize:11,color:C.green,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>Correct</div>
        </div>
        <div style={{padding:'14px 8px',borderRadius:12,background:C.accentBg,border:`1px solid ${C.accentBorder}`}}>
          <div style={{fontSize:24,fontWeight:900,color:C.accent}}>🎓 {graduatedCount}</div>
          <div style={{fontSize:11,color:C.accent,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>Graduated</div>
        </div>
        <div style={{padding:'14px 8px',borderRadius:12,background:C.redBg,border:`1px solid ${C.redBorder}`}}>
          <div style={{fontSize:24,fontWeight:900,color:C.red}}>{remaining}</div>
          <div style={{fontSize:11,color:C.red,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>Still Queued</div>
        </div>
      </div>

      <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
        {remaining > 0 && (
          <button onClick={onContinue}
            style={{padding:'13px 24px',background:C.red,color:C.white,border:'none',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer'}}>
            Keep Reviewing ({remaining}) →
          </button>
        )}
        <button onClick={onDone}
          style={{padding:'13px 24px',background:remaining>0?C.white:C.primary,color:remaining>0?C.primary:C.white,border:remaining>0?`2px solid ${C.primary}`:'none',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer'}}>
          🏠 Back to Home
        </button>
      </div>
    </div>
  )
}

// ── DOMAIN SPOT-CHECK RESULTS ────────────────────────────
function DomainQuizResults({domain, questions, answers, onReview, onTryAnother, onBack}) {
  const correct = questions.filter((q,i)=>answers[i]===q.correct).length
  const total = questions.length
  const percent = Math.round((correct/total)*100)
  const passed = percent >= 80
  return (
    <div style={{maxWidth:580,margin:'0 auto',padding:'40px 20px',textAlign:'center',fontFamily:'system-ui'}}>
      <div style={{fontSize:48,marginBottom:8}}>{MODULES[domain]?.icon}</div>
      <h2 style={{fontSize:22,fontWeight:700,color:C.primary,fontFamily:'Georgia,serif',margin:'0 0 6px'}}>Spot-Check Complete</h2>
      <p style={{fontSize:14,color:C.muted,margin:'0 0 22px'}}>{domain}</p>
      <div style={{padding:'24px 20px',borderRadius:14,background:passed?C.greenBg:C.redBg,border:`1px solid ${passed?C.greenBorder:C.redBorder}`,marginBottom:24}}>
        <div style={{fontSize:48,fontWeight:900,color:passed?C.green:C.red,lineHeight:1}}>{percent}%</div>
        <p style={{fontSize:16,fontWeight:700,color:passed?C.green:C.red,margin:'6px 0 0'}}>{correct} / {total} correct</p>
        <p style={{fontSize:12,color:passed?C.green:C.red,margin:'4px 0 0',opacity:0.8}}>
          {passed?'✓ Strong on this domain':'Needs more review'}
        </p>
      </div>
      <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
        <button onClick={onReview} style={{padding:'12px 20px',background:C.primary,color:C.white,border:'none',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer'}}>📖 Review Questions</button>
        <button onClick={onTryAnother} style={{padding:'12px 20px',background:C.white,color:C.accent,border:`2px solid ${C.accent}`,borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer'}}>↻ New 20 Questions</button>
        <button onClick={onBack} style={{padding:'12px 18px',background:'transparent',color:C.muted,border:'none',cursor:'pointer',fontSize:13,fontWeight:600}}>← Back to Study Plan</button>
      </div>
    </div>
  )
}

// ── EXAM REVIEW MODE ─────────────────────────────────────
function ExamReview({questions, answers, onBack}) {
  const [filter, setFilter] = useState('all')  // all | missed | correct
  const [domainFilter, setDomainFilter] = useState('')
  const [idx, setIdx] = useState(0)
  const [showNav, setShowNav] = useState(false)

  const allDomains = [...new Set(questions.map(q=>q.domain_name))].sort()
  const missedCount = questions.filter((q,i)=>answers[i]!==q.correct).length
  const correctCount = questions.length - missedCount

  const filtered = questions
    .map((q,i)=>({...q, _origIdx:i, _userAns:answers[i], _isCorrect:answers[i]===q.correct}))
    .filter(q=>{
      if (filter==='missed' && q._isCorrect) return false
      if (filter==='correct' && !q._isCorrect) return false
      if (domainFilter && q.domain_name !== domainFilter) return false
      return true
    })

  useEffect(()=>{ setIdx(0) }, [filter, domainFilter])

  const q = filtered[Math.min(idx, Math.max(0, filtered.length-1))]

  const filterPill = (val, label, count, color) => (
    <button onClick={()=>setFilter(val)}
      style={{padding:'6px 12px',borderRadius:99,border:`1.5px solid ${filter===val?color:C.border}`,
        background:filter===val?color:C.white,color:filter===val?C.white:color,
        cursor:'pointer',fontSize:12,fontWeight:700,whiteSpace:'nowrap'}}>
      {label} ({count})
    </button>
  )

  return (
    <div style={{maxWidth:720,margin:'0 auto',padding:'24px 20px',fontFamily:'system-ui'}}>
      <button onClick={onBack} style={{background:'none',border:'none',color:C.muted,cursor:'pointer',fontSize:14,marginBottom:14,padding:0}}>← Back to Results</button>
      <h2 style={{fontSize:22,fontWeight:700,color:C.primary,margin:'0 0 14px',fontFamily:'Georgia,serif'}}>📖 Exam Review</h2>

      {/* Filter pills */}
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
        {filterPill('all','All',questions.length,C.primary)}
        {filterPill('missed','Missed',missedCount,C.red)}
        {filterPill('correct','Correct',correctCount,C.green)}
      </div>

      {/* Domain dropdown */}
      <div style={{marginBottom:16}}>
        <select value={domainFilter} onChange={e=>setDomainFilter(e.target.value)}
          style={{padding:'7px 12px',borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,background:C.white,color:C.text,fontFamily:'inherit',width:'100%',maxWidth:360}}>
          <option value="">All domains</option>
          {allDomains.map(d=><option key={d} value={d}>{MODULES[d]?.icon||''} {d}</option>)}
        </select>
      </div>

      {filtered.length===0 ? (
        <Card style={{textAlign:'center'}}>
          <p style={{fontSize:14,color:C.muted,margin:'12px 0'}}>No questions match the current filters.</p>
        </Card>
      ) : (
        <>
          {/* Question meta */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,flexWrap:'wrap',gap:8}}>
            <Pill text={q.domain_name} color={C.primary} bg={C.primaryLight}/>
            <span style={{fontSize:12,color:C.muted}}>Question {idx+1} of {filtered.length} · original #{q._origIdx+1}</span>
          </div>

          {/* Result banner */}
          <div style={{padding:'8px 14px',borderRadius:10,marginBottom:14,fontSize:13,fontWeight:700,
            background:q._userAns===undefined?C.grayLight:q._isCorrect?C.greenBg:C.redBg,
            color:q._userAns===undefined?C.muted:q._isCorrect?C.green:C.red,
            border:`1px solid ${q._userAns===undefined?C.border:q._isCorrect?C.greenBorder:C.redBorder}`}}>
            {q._userAns===undefined?'— Unanswered':q._isCorrect?'✓ Correct':'✗ Incorrect'}
          </div>

          {/* Stem */}
          <Card style={{marginBottom:16}}>
            <p style={{fontSize:15,lineHeight:1.7,color:C.text,margin:0,fontFamily:'Georgia,serif',fontWeight:500}}>{q.stem}</p>
          </Card>

          {/* Options with answer reveal */}
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
            {q.options.map((opt,i)=>{
              const isUser = i===q._userAns
              const isCorrect = i===q.correct
              let bg=C.white, border=C.border, labelColor=C.muted
              if (isCorrect) { bg=C.greenBg; border=C.greenBorder; labelColor=C.green }
              if (isUser && !isCorrect) { bg=C.redBg; border=C.redBorder; labelColor=C.red }
              return (
                <div key={i} style={{textAlign:'left',padding:'11px 14px',borderRadius:10,border:`2px solid ${border}`,background:bg,fontSize:14,color:C.text,display:'flex',alignItems:'flex-start',gap:10}}>
                  <span style={{fontWeight:700,flexShrink:0,color:labelColor,minWidth:16}}>{['A','B','C','D'][i]}.</span>
                  <span style={{flex:1,lineHeight:1.55}}>{opt}</span>
                  <span style={{fontSize:11,fontWeight:700,flexShrink:0,color:labelColor,whiteSpace:'nowrap'}}>
                    {isUser && isCorrect ? '✓ Your answer' : isCorrect ? '✓ Correct' : isUser ? '✗ Your answer' : ''}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Rationale */}
          <Card style={{background:C.grayLight,marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <div style={{fontSize:11,fontWeight:800,color:C.primary,textTransform:'uppercase',letterSpacing:'0.07em'}}>📘 Rationale</div>
              <TTSButton token={`rat:exam:${q.id||q.stem?.slice(0,30)}`} text={q.rationale} label="" size="xs"/>
            </div>
            <p style={{fontSize:13.5,color:C.text,margin:0,lineHeight:1.7}}>{q.rationale}</p>
          </Card>

          {/* Navigation */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,marginBottom:14}}>
            <button onClick={()=>setIdx(i=>Math.max(0,i-1))} disabled={idx===0}
              style={{padding:'10px 18px',borderRadius:10,border:`1px solid ${C.border}`,background:C.white,
                color:idx===0?C.muted:C.primary,cursor:idx===0?'default':'pointer',fontSize:13,fontWeight:600}}>← Previous</button>
            <button onClick={()=>setShowNav(v=>!v)}
              style={{padding:'8px 12px',borderRadius:10,border:`1px solid ${C.border}`,background:C.white,color:C.primary,cursor:'pointer',fontSize:12,fontWeight:600}}>📋 Navigator</button>
            <button onClick={()=>setIdx(i=>Math.min(filtered.length-1,i+1))} disabled={idx===filtered.length-1}
              style={{padding:'10px 18px',borderRadius:10,border:'none',background:idx===filtered.length-1?C.muted:C.primary,color:C.white,cursor:idx===filtered.length-1?'default':'pointer',fontSize:13,fontWeight:600}}>Next →</button>
          </div>

          {showNav && (
            <Card>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(32px,1fr))',gap:4}}>
                {filtered.map((fq,i)=>(
                  <button key={i} onClick={()=>{setIdx(i);setShowNav(false)}}
                    style={{aspectRatio:'1',borderRadius:6,border:i===idx?`2px solid ${C.primary}`:'none',
                      background:fq._isCorrect?C.greenBg:fq._userAns===undefined?C.grayLight:C.redBg,
                      color:fq._isCorrect?C.green:fq._userAns===undefined?C.muted:C.red,
                      fontSize:10,fontWeight:700,cursor:'pointer'}}>
                    {fq._origIdx+1}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function FinalResults({examScores,pretestScores,onReset,onReview}) {
  const domains = Object.keys(examScores)
  // Score by total correct / total questions (NOT by averaging domain percentages —
  // domains have unequal question counts so averaging would misrepresent the score).
  const totals = domains.reduce((acc,d)=>{
    const s = examScores[d] || {correct:0,total:0}
    acc.correct += s.correct
    acc.total += s.total
    return acc
  }, {correct:0,total:0})
  const overall = pct(totals.correct, totals.total)
  const passed = overall>=70
  return (
    <div style={{maxWidth:680,margin:'0 auto',padding:'32px 20px',fontFamily:'system-ui'}}>
      <div style={{textAlign:'center',marginBottom:28}}>
        <div style={{fontSize:52,marginBottom:8}}>{passed?'🏆':'📖'}</div>
        <h2 style={{fontSize:24,fontWeight:700,color:passed?C.green:C.red,margin:'0 0 4px',fontFamily:'Georgia,serif'}}>
          {passed?'Exam Passed!':'Keep Studying'}
        </h2>
        <p style={{fontSize:16,color:C.muted,margin:0}}>
          Overall Score: <strong style={{color:passed?C.green:C.red,fontSize:20}}>{overall}%</strong>
          <span style={{marginLeft:8,fontSize:13}}>{passed?'✓ Above 70% passing threshold':'✗ Below 70% passing threshold'}</span>
        </p>
      </div>
      <Card style={{marginBottom:20}}>
        <h3 style={{fontSize:15,fontWeight:700,color:C.primary,margin:'0 0 16px'}}>Domain Breakdown</h3>
        {domains.map(d=>{
          const s=examScores[d]||{correct:0,total:0}
          const p=pct(s.correct,s.total)
          return (
            <div key={d} style={{marginBottom:12}}>
              <ProgressBar value={p} label={`${MODULES[d]?.icon||''} ${d} (${s.correct}/${s.total})`} color={p>=70?C.green:C.red}/>
            </div>
          )
        })}
      </Card>
      {pretestScores&&(
        <Card style={{marginBottom:20,background:C.accentBg,border:`1px solid ${C.accentBorder}`}}>
          <h3 style={{fontSize:15,fontWeight:700,color:C.accent,margin:'0 0 12px'}}>📈 Growth: Pretest → Exam</h3>
          {domains.map(d=>{
            const pre=pretestScores[d]
            const exam=examScores[d]
            if(!pre||!exam) return null
            const preP=pct(pre.correct,pre.total)
            const examP=pct(exam.correct,exam.total)
            const diff=examP-preP
            return (
              <div key={d} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:`1px solid ${C.accentBorder}`}}>
                <span style={{fontSize:13,color:C.text}}>{MODULES[d]?.icon} {d}</span>
                <span style={{fontSize:13,fontWeight:700,color:diff>0?C.green:diff<0?C.red:C.muted}}>
                  {preP}% → {examP}% ({diff>0?'+':''}{diff}%)
                </span>
              </div>
            )
          })}
        </Card>
      )}
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        <button onClick={onReview} style={{flex:'2 1 220px',padding:'14px',background:C.accent,color:C.white,border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'Georgia,serif'}}>
          📖 Review All Questions →
        </button>
        <button onClick={onReset} style={{flex:'1 1 140px',padding:'14px',background:C.white,color:C.primary,border:`2px solid ${C.primary}`,borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'Georgia,serif'}}>
          Start Over
        </button>
      </div>
    </div>
  )
}

// ── MAIN APP ─────────────────────────────────────────────
export default function App() {
  const [st,setSt] = useState(() => {
    const p = loadPersisted()
    return p?.st ? {...INITIAL, ...p.st} : {...INITIAL}
  })
  const up = patch => setSt(p=>({...p,...patch}))
  const timerRef = useRef(null)
  const sfxTimerRef = useRef(null)

  // SAFMEDS session helper — finalize and compute results
  const finishSafmedsSession = () => {
    clearInterval(sfxTimerRef.current)
    setSt(p => {
      const deckId = p.sfxDeckId
      const cards = getSafmedsCards(deckId)
      const isTimed = p.sfxMode === 'timed'
      const correct = p.sfxCorrect, missed = p.sfxMissed, timer = p.sfxTimer
      const sf = p.safmeds || { totalTokens:0, decks:{}, history:[] }
      const deckStats = sf.decks[deckId] || {}
      const highKey = `high${timer}s`
      const prevHigh = deckStats[highKey] || 0
      const isPB = isTimed && correct > prevHigh
      const tokensEarned = correct + (isPB ? 5 : 0)
      const newSf = {
        ...sf,
        totalTokens: (sf.totalTokens||0) + tokensEarned,
        decks: { ...sf.decks, [deckId]: { ...deckStats, attempts:(deckStats.attempts||0)+1, ...(isTimed && correct > prevHigh ? {[highKey]:correct} : {}) } },
        history: [...(sf.history||[]), {
          date: todayISO(), deck: deckId, mode: p.sfxMode, timer, correct, missed,
          rate: isTimed ? Math.round((correct/timer)*60*10)/10 : 0,
        }].slice(-1000),
        lastDeckId: deckId, lastTimer: timer, lastMode: p.sfxMode,
      }
      const deckLabel = SAFMEDS_LEVELS.find(l=>l.id===deckId)?.label || (deckId==='all'?'All Terms':deckId.startsWith('domain:')?deckId.slice(7):deckId)
      return { ...p, phase:'safmeds_results', safmeds:newSf, sfxResults:{ correct, missed, mode:p.sfxMode, timer, deckId, deckLabel, isPB, tokensEarned, prevHigh } }
    })
  }

  useEffect(()=>{
    if(st.phase==='fullexam'&&st.timerActive&&st.timerSeconds>0) {
      timerRef.current = setInterval(()=>{
        setSt(p=>{
          if(p.timerSeconds<=1) {
            clearInterval(timerRef.current)
            const scores = calcScores(p.examQuestions, p.examAnswers)
            return {...p, timerSeconds:0, timerActive:false, phase:'final_results', examScores:scores,
              weakSpots:updateWeakSpots(p.weakSpots, p.examQuestions, p.examAnswers),
              stats:bumpStat(p.stats,'examAttempts')}
          }
          return {...p, timerSeconds:p.timerSeconds-1}
        })
      },1000)
    }
    return ()=>clearInterval(timerRef.current)
  },[st.phase,st.timerActive])

  // SAFMEDS session timer (timed mode only)
  useEffect(() => {
    if (st.phase === 'safmeds_session' && st.sfxMode === 'timed' && st.sfxRemaining > 0) {
      sfxTimerRef.current = setInterval(() => {
        setSt(p => {
          if (p.sfxRemaining <= 1) {
            clearInterval(sfxTimerRef.current)
            // defer finishing to next tick to avoid setState-in-setState
            setTimeout(() => finishSafmedsSession(), 0)
            return { ...p, sfxRemaining: 0 }
          }
          return { ...p, sfxRemaining: p.sfxRemaining - 1 }
        })
      }, 1000)
    }
    return () => clearInterval(sfxTimerRef.current)
  }, [st.phase, st.sfxMode])

  const [flagged,setFlagged] = useState(() => {
    const p = loadPersisted()
    return new Set(p?.flagged || [])
  })
  const toggleFlag = i => setFlagged(f=>{const n=new Set(f);n.has(i)?n.delete(i):n.add(i);return n})

  useEffect(() => {
    savePersisted({ st, flagged: [...flagged] })
  }, [st, flagged])

  // Reflect theme on <html> so CSS vars switch
  useEffect(() => {
    document.documentElement.dataset.theme = st.theme || 'light'
  }, [st.theme])

  // Daily activity tracking + session heartbeat (counts 1 min per visible-tab minute)
  useEffect(() => {
    const today = todayISO()
    setSt(p => {
      const s = p.stats || {}
      const days = s.daysStudied || []
      const newDays = days.includes(today) ? days : [...days, today]
      const todayMinutes = s.todayDate === today ? (s.todayMinutes || 0) : 0
      return { ...p, stats: { ...s, daysStudied: newDays, todayDate: today, todayMinutes } }
    })
    const heartbeat = setInterval(() => {
      if (document.visibilityState !== 'visible') return
      setSt(p => ({
        ...p,
        stats: {
          ...(p.stats || {}),
          todayMinutes: ((p.stats?.todayMinutes) || 0) + 1,
          totalMinutes: ((p.stats?.totalMinutes) || 0) + 1,
        }
      }))
    }, 60000)
    return () => clearInterval(heartbeat)
  }, [])

  const handleNav = id => {
    const map = {
      welcome:()=>up({phase:'welcome',confirmReset:false}),
      pretest:()=>up({phase:'pretest',confirmReset:false}),
      pretest_results:()=>st.pretestScores&&up({phase:'pretest_results',confirmReset:false}),
      modules:()=>(st.pretestScores||st.skippedPretest)&&up({phase:'modules',confirmReset:false}),
      exam_intro:()=>up({phase:'exam_intro',confirmReset:false}),
      final_results:()=>st.examScores&&up({phase:'final_results',confirmReset:false}),
      safmeds:()=>up({phase:'safmeds',confirmReset:false}),
    }
    map[id]?.()
  }

  const nav = (
    <>
      <GlobalStyles/>
      <NavBar st={st} onNav={handleNav}
        onReset={()=>up({confirmReset:true})}
        onConfirmReset={()=>{clearInterval(timerRef.current);clearPersisted();setFlagged(new Set());setSt({...INITIAL})}}
        onCancelReset={()=>up({confirmReset:false})}
        onToggleTheme={()=>up({theme: st.theme==='dark'?'light':'dark'})}/>
    </>
  )

  if(st.phase==='welcome') return <div>{nav}<Welcome
    st={st}
    stats={st.stats}
    weakSpotsCount={Object.keys(st.weakSpots||{}).length}
    onReviewWeakSpots={()=>{
      const items = Object.values(st.weakSpots||{})
      const queue = [...items].sort(()=>Math.random()-0.5)
      up({phase:'weak_review', weakReviewQueue:queue, weakReviewIdx:0, weakReviewAnswers:{}, weakReviewStartCount:queue.length})
    }}
    safmeds={st.safmeds}
    onOpenSafmeds={()=>up({phase:'safmeds'})}
    onNav={handleNav}
    onStart={()=>up({phase:'pretest',qIndex:0,pretestAnswers:{},pretestQuestions:shuffleQuestions(PRETEST_QUESTIONS)})}
    onSkipPretest={()=>up({phase:'modules',skippedPretest:true,weakDomains:DOMAINS,moduleStatuses:{}})}
    onSpotCheck={d=>{
      const qs = sampleDomainQuestions(d, 20, PRETEST_QUESTIONS.map(q=>q.stem))
      up({phase:'domain_quiz', domainQuizDomain:d, domainQuizQuestions:qs, domainQuizAnswers:{}, domainQuizQIndex:0})
    }}/><OneLoveFooter/></div>

  if(st.phase==='pretest') {
    const pqs = st.pretestQuestions.length ? st.pretestQuestions : PRETEST_QUESTIONS
    return <div>{nav}<QuestionScreen
      questions={pqs} answers={st.pretestAnswers} qIndex={st.qIndex}
      onAnswer={(i,a)=>up({pretestAnswers:{...st.pretestAnswers,[i]:a}})}
      onNav={d=>up({qIndex:Math.max(0,Math.min(pqs.length-1,st.qIndex+d))})}
      onSubmit={()=>{
        const scores=calcScores(pqs,st.pretestAnswers)
        const weak=DOMAINS.filter(d=>scores[d]&&pct(scores[d].correct,scores[d].total)<70)
        setSt(p=>({...p, phase:'pretest_results', pretestScores:scores, weakDomains:weak,
          weakSpots:updateWeakSpots(p.weakSpots, pqs, p.pretestAnswers),
          stats:bumpStat(p.stats,'pretestsCompleted')}))
      }}
      label="Pretest"/><OneLoveFooter/></div>
  }

  if(st.phase==='pretest_results') return <div>{nav}<PretestResults
    scores={st.pretestScores} weakDomains={st.weakDomains}
    onStudy={()=>up({phase:'modules'})}
    onSkip={()=>up({phase: st.weakDomains.length>0 ? 'modules' : 'exam_intro'})}/><OneLoveFooter/></div>

  if(st.phase==='modules') return <div>{nav}<ModuleHub
    weakDomains={st.weakDomains} moduleStatuses={st.moduleStatuses}
    onSelect={d=>up({phase:'module',activeModule:d,modulePhase:'content',moduleQIndex:0,moduleAnswers:{}})}
    onExam={()=>up({phase:'exam_intro'})}
    onSpotCheck={d=>{
      const qs = sampleDomainQuestions(d, 20, PRETEST_QUESTIONS.map(q=>q.stem))
      up({phase:'domain_quiz', domainQuizDomain:d, domainQuizQuestions:qs, domainQuizAnswers:{}, domainQuizQIndex:0})
    }}/><OneLoveFooter/></div>

  if(st.phase==='domain_quiz') {
    const dqs = st.domainQuizQuestions
    return <div>{nav}<QuestionScreen
      questions={dqs} answers={st.domainQuizAnswers} qIndex={st.domainQuizQIndex}
      onAnswer={(i,a)=>up({domainQuizAnswers:{...st.domainQuizAnswers,[i]:a}})}
      onNav={d=>up({domainQuizQIndex:Math.max(0,Math.min(dqs.length-1,st.domainQuizQIndex+d))})}
      onSubmit={()=>setSt(p=>({...p, phase:'domain_quiz_results', weakSpots:updateWeakSpots(p.weakSpots, p.domainQuizQuestions, p.domainQuizAnswers)}))}
      label="Spot-Check"/><OneLoveFooter/></div>
  }

  if(st.phase==='domain_quiz_results') return <div>{nav}<DomainQuizResults
    domain={st.domainQuizDomain} questions={st.domainQuizQuestions} answers={st.domainQuizAnswers}
    onReview={()=>up({phase:'domain_quiz_review'})}
    onTryAnother={()=>{
      const qs = sampleDomainQuestions(st.domainQuizDomain, 20, PRETEST_QUESTIONS.map(q=>q.stem))
      up({phase:'domain_quiz', domainQuizQuestions:qs, domainQuizAnswers:{}, domainQuizQIndex:0})
    }}
    onBack={()=>up({phase:'modules'})}/><OneLoveFooter/></div>

  if(st.phase==='domain_quiz_review') return <div>{nav}<ExamReview
    questions={st.domainQuizQuestions} answers={st.domainQuizAnswers}
    onBack={()=>up({phase:'domain_quiz_results'})}/><OneLoveFooter/></div>

  if(st.phase==='weak_review') return <div>{nav}<WeakSpotReview
    queue={st.weakReviewQueue} idx={st.weakReviewIdx} answers={st.weakReviewAnswers}
    startCount={st.weakReviewStartCount}
    onAnswer={(choice)=>{
      const item = st.weakReviewQueue[st.weakReviewIdx]
      const isCorrect = choice === item.question.correct
      setSt(p=>{
        const newAns = {...p.weakReviewAnswers, [p.weakReviewIdx]:choice}
        const ws = {...(p.weakSpots||{})}
        const id = weakSpotId(item.question)
        if (isCorrect) {
          const newStreak = (ws[id]?.consecutiveCorrect || 0) + 1
          if (newStreak >= 2) { delete ws[id] }
          else if (ws[id]) ws[id] = {...ws[id], consecutiveCorrect:newStreak, lastSeen:Date.now(), timesAttempted:(ws[id].timesAttempted||0)+1, timesCorrect:(ws[id].timesCorrect||0)+1}
        } else if (ws[id]) {
          ws[id] = {...ws[id], consecutiveCorrect:0, lastSeen:Date.now(), timesAttempted:(ws[id].timesAttempted||0)+1}
        }
        return {...p, weakReviewAnswers:newAns, weakSpots:ws}
      })
    }}
    onNext={()=>{
      if (st.weakReviewIdx < st.weakReviewQueue.length - 1) up({weakReviewIdx: st.weakReviewIdx + 1})
      else up({phase:'weak_review_summary'})
    }}
    onQuit={()=>up({phase:'welcome'})}/><OneLoveFooter/></div>

  if(st.phase==='safmeds') return <div>{nav}<SafmedsHub
    safmeds={st.safmeds}
    onBack={()=>up({phase:'welcome'})}
    onProgress={()=>up({phase:'safmeds_progress'})}
    onStart={({deckId, mode, timer})=>{
      const cards = shuffleCards(getSafmedsCards(deckId))
      if (cards.length === 0) return
      up({phase:'safmeds_session', sfxDeckId:deckId, sfxMode:mode, sfxTimer:timer,
        sfxCards:cards, sfxCardIdx:0, sfxRevealed:false, sfxCorrect:0, sfxMissed:0,
        sfxRemaining: mode==='timed' ? timer : 0, sfxResults:null})
    }}/><OneLoveFooter/></div>

  if(st.phase==='safmeds_progress') return <div>{nav}<SafmedsProgress
    safmeds={st.safmeds}
    onBack={()=>up({phase:'safmeds'})}/><OneLoveFooter/></div>

  if(st.phase==='safmeds_session') return <div>{nav}<SafmedsSession
    deckId={st.sfxDeckId} mode={st.sfxMode} timer={st.sfxTimer}
    cards={st.sfxCards} cardIdx={st.sfxCardIdx} revealed={st.sfxRevealed}
    correct={st.sfxCorrect} missed={st.sfxMissed} remaining={st.sfxRemaining}
    onReveal={()=>up({sfxRevealed:true})}
    onGrade={(gotIt)=>{
      setSt(p=>({
        ...p,
        sfxCorrect: p.sfxCorrect + (gotIt?1:0),
        sfxMissed: p.sfxMissed + (gotIt?0:1),
        sfxCardIdx: p.sfxCardIdx + 1,
        sfxRevealed: false,
        // re-shuffle and loop if we run out of cards (practice mode or long sessions)
        sfxCards: (p.sfxCardIdx + 1 >= p.sfxCards.length) ? shuffleCards(p.sfxCards) : p.sfxCards,
      }))
      // practice mode never auto-finishes
    }}
    onQuit={finishSafmedsSession}/><OneLoveFooter/></div>

  if(st.phase==='safmeds_results') return <div>{nav}<SafmedsResults
    results={st.sfxResults} safmeds={st.safmeds}
    onAgain={()=>{
      const cards = shuffleCards(getSafmedsCards(st.sfxDeckId))
      up({phase:'safmeds_session', sfxCards:cards, sfxCardIdx:0, sfxRevealed:false,
        sfxCorrect:0, sfxMissed:0, sfxRemaining:st.sfxMode==='timed'?st.sfxTimer:0, sfxResults:null})
    }}
    onPickAnother={()=>up({phase:'safmeds'})}
    onDone={()=>up({phase:'welcome'})}/><OneLoveFooter/></div>

  if(st.phase==='weak_review_summary') return <div>{nav}<WeakSpotSummary
    queue={st.weakReviewQueue} answers={st.weakReviewAnswers} startCount={st.weakReviewStartCount}
    remaining={Object.keys(st.weakSpots||{}).length}
    onContinue={()=>{
      const items = Object.values(st.weakSpots||{})
      const queue = [...items].sort(()=>Math.random()-0.5)
      up({phase:'weak_review', weakReviewQueue:queue, weakReviewIdx:0, weakReviewAnswers:{}, weakReviewStartCount:queue.length})
    }}
    onDone={()=>up({phase:'welcome'})}/><OneLoveFooter/></div>

  if(st.phase==='module') return <div>{nav}<LearningModule
    domain={st.activeModule} phase={st.modulePhase}
    qIndex={st.moduleQIndex} answers={st.moduleAnswers}
    onAnswer={(i,a)=>{
      if(i==='reset'){up({moduleAnswers:{},moduleQIndex:0});return}
      if(i==='next'){up({moduleQIndex:st.moduleQIndex+1});return}
      const newAns={...st.moduleAnswers,[i]:a}
      const practice = MODULES[st.activeModule].practice
      const nowAllAnswered = Object.keys(newAns).length === practice.length
      if (nowAllAnswered) {
        setSt(p=>({...p, moduleAnswers:newAns, weakSpots:updateWeakSpots(p.weakSpots, practice, newAns)}))
      } else {
        up({moduleAnswers:newAns})
        // Auto-advance ONLY on correct answers (quick reinforcement, ~1.2s).
        // On incorrect, never auto-advance — let the student read the
        // correct answer and rationale, then click "Next Question →" themselves.
        const isCorrect = a === practice[i].correct
        if (isCorrect && i < practice.length - 1) {
          setTimeout(()=>up({moduleQIndex:i+1}), 1200)
        }
      }
    }}
    onBack={()=>up({phase:'modules'})}
    onStartQuiz={()=>up({modulePhase:'quiz',moduleQIndex:0,moduleAnswers:{}})}
    onReviewConcepts={()=>up({modulePhase:'content'})}
    onFinish={status=>setSt(p=>({
      ...p,
      phase:'modules',
      moduleStatuses:{...p.moduleStatuses,[p.activeModule]:status},
      modulePhase:'content',
      ...(status==='passed' ? {stats:bumpStat(p.stats,'modulesPassed')} : {}),
    }))}/><OneLoveFooter/></div>

  if(st.phase==='exam_intro') return <div>{nav}<ExamIntro onStart={()=>{
    const qs=sampleExamQuestions(PRETEST_QUESTIONS,BCBA_TOTAL_QUESTIONS).map(shuffleQuestion)
    up({phase:'fullexam',examQuestions:qs,examAnswers:{},qIndex:0,timerSeconds:14400,timerActive:true})
    setFlagged(new Set())
  }}/><OneLoveFooter/></div>

  if(st.phase==='fullexam') return <div>{nav}<ExamScreen
    questions={st.examQuestions} answers={st.examAnswers} qIndex={st.qIndex}
    timerSeconds={st.timerSeconds} flagged={flagged}
    onAnswer={(i,a)=>up({examAnswers:{...st.examAnswers,[i]:a}})}
    onNav={d=>up({qIndex:Math.max(0,Math.min(st.examQuestions.length-1,st.qIndex+d))})}
    onFlag={toggleFlag}
    onSubmit={()=>{
      clearInterval(timerRef.current)
      const scores=calcScores(st.examQuestions,st.examAnswers)
      setSt(p=>({...p, phase:'final_results', examScores:scores, timerActive:false,
        weakSpots:updateWeakSpots(p.weakSpots, p.examQuestions, p.examAnswers),
        stats:bumpStat(p.stats,'examAttempts')}))
    }}/><OneLoveFooter/></div>

  if(st.phase==='final_results') return <div>{nav}<FinalResults
    examScores={st.examScores} pretestScores={st.pretestScores}
    onReview={()=>up({phase:'exam_review'})}
    onReset={()=>{clearInterval(timerRef.current);clearPersisted();setFlagged(new Set());setSt({...INITIAL})}}/><OneLoveFooter/></div>

  if(st.phase==='exam_review') return <div>{nav}<ExamReview
    questions={st.examQuestions} answers={st.examAnswers}
    onBack={()=>up({phase:'final_results'})}/><OneLoveFooter/></div>

  return null
}
