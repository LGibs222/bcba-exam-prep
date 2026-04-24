import { useState, useEffect, useRef } from 'react'
import { PRETEST_QUESTIONS } from './data/pretest.js'
import { MODULES } from './data/modules.js'
import { QUESTION_BANK } from './data/questions.js'
import { MODULE_ENHANCEMENTS } from './data/moduleEnhancements.js'

// ── LOCAL STORAGE PERSISTENCE ────────────────────────────
const STORAGE_KEY = 'bcba-exam-prep-v1'
const loadPersisted = () => {
  try {
    const r = localStorage.getItem(STORAGE_KEY)
    if (!r) return null
    const p = JSON.parse(r)
    if (p?.st) p.st.confirmReset = false  // never restore mid-reset confirm
    return p
  } catch { return null }
}
const savePersisted = d => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) } catch {} }
const clearPersisted = () => { try { localStorage.removeItem(STORAGE_KEY) } catch {} }

const C = {
  primary:'#1a3a5c', primaryLight:'#e8f0fb', primaryMid:'#2e5fa3',
  accent:'#c47d0e', accentBg:'#fef9ec', accentBorder:'#f5c842',
  green:'#166534', greenBg:'#dcfce7', greenBorder:'#86efac',
  red:'#991b1b', redBg:'#fee2e2', redBorder:'#fca5a5',
  gray:'#475569', grayLight:'#f1f5f9', border:'#e2e8f0',
  text:'#1e293b', muted:'#64748b', white:'#ffffff',
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

function sampleExamQuestions(pretestQs, count=150) {
  const pretestStems = new Set(pretestQs.map(q=>q.stem.substring(0,60)))
  const pool = QUESTION_BANK.filter(q => !pretestStems.has(q.stem.substring(0,60)))
  const byDomain = {}
  DOMAINS.forEach(d => { byDomain[d] = pool.filter(q=>q.domain_name===d) })
  const perDomain = Math.floor(count/DOMAINS.length)
  const sampled = []
  DOMAINS.forEach(d => {
    const qs = [...byDomain[d]].sort(()=>Math.random()-0.5).slice(0,perDomain)
    sampled.push(...qs)
  })
  while (sampled.length < count && pool.length > sampled.length) {
    const extra = pool.filter(q=>!sampled.includes(q))
    if (extra.length===0) break
    sampled.push(extra[Math.floor(Math.random()*extra.length)])
  }
  return sampled.slice(0,count).sort(()=>Math.random()-0.5)
}

const INITIAL = {
  phase:'welcome', qIndex:0,
  pretestQuestions:[],
  pretestAnswers:{}, pretestScores:null, weakDomains:[], skippedPretest:false,
  moduleStatuses:{}, activeModule:null, modulePhase:'content',
  moduleQIndex:0, moduleAnswers:{},
  examAnswers:{}, examQuestions:[], examScores:null,
  confirmReset:false, timerSeconds:14400, timerActive:false,
}

// ── UI PRIMITIVES ─────────────────────────────────────────
const Card = ({children,style={}}) => (
  <div style={{background:C.white,borderRadius:16,padding:28,boxShadow:'0 2px 16px rgba(0,0,0,0.07)',border:`1px solid ${C.border}`,...style}}>{children}</div>
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

// ── GLOBAL STYLES (keyframes for flip cards + concept animation) ─────────────
const GlobalStyles = () => (
  <style>{`
    @keyframes conceptIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    .concept-in{animation:conceptIn .32s ease forwards}
    .kt-card:hover{filter:brightness(.96)}
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
  {id:'exam_intro',label:'Exam',emoji:'🏁',needs:'examReady'},
  {id:'final_results',label:'Report',emoji:'📈',needs:'examScores'},
]

function NavBar({st,onNav,onReset,onConfirmReset,onCancelReset}) {
  const active = ['module'].includes(st.phase)?'modules':st.phase
  const studyStarted = st.pretestScores || st.skippedPretest
  const examReady = studyStarted && (st.weakDomains.length===0 || st.weakDomains.every(d=>st.moduleStatuses[d]==='passed'))
  return (
    <div style={{background:C.primary,position:'sticky',top:0,zIndex:200,boxShadow:'0 2px 8px rgba(0,0,0,0.25)'}}>
      <div style={{maxWidth:760,margin:'0 auto',padding:'0 12px',display:'flex',alignItems:'center',justifyContent:'space-between',height:50}}>
        <div style={{display:'flex',gap:2,overflowX:'auto',scrollbarWidth:'none'}}>
          {NAV.map(item=>{
            const avail = item.always || (item.needs==='pretestScores'&&st.pretestScores) || (item.needs==='studyStarted'&&studyStarted) || (item.needs==='examReady'&&examReady) || (item.needs==='examScores'&&st.examScores)
            const isActive = active===item.id
            return (
              <button key={item.id} onClick={()=>avail&&onNav(item.id)} disabled={!avail}
                style={{padding:'5px 10px',borderRadius:7,border:'none',whiteSpace:'nowrap',
                  background:isActive?C.white:'transparent',
                  color:isActive?C.primary:avail?'#93c5fd':'#2d4a63',
                  cursor:avail?'pointer':'default',fontSize:11,fontWeight:700,fontFamily:'system-ui',outline:'none'}}>
                {item.emoji} {item.label}
              </button>
            )
          })}
        </div>
        <div style={{flexShrink:0,marginLeft:8}}>
          {!st.confirmReset
            ?<button onClick={onReset} style={{padding:'4px 10px',borderRadius:7,border:'1px solid #2d4a63',background:'transparent',color:'#f87171',cursor:'pointer',fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>Reset</button>
            :<div style={{display:'flex',gap:4,alignItems:'center'}}>
               <span style={{fontSize:10,color:'#fca5a5',whiteSpace:'nowrap'}}>Start over?</span>
               <button onClick={onConfirmReset} style={{padding:'3px 8px',borderRadius:6,border:'none',background:'#dc2626',color:C.white,cursor:'pointer',fontSize:10,fontWeight:700}}>Yes</button>
               <button onClick={onCancelReset} style={{padding:'3px 8px',borderRadius:6,border:'1px solid #2d4a63',background:'transparent',color:'#94a3b8',cursor:'pointer',fontSize:10,fontWeight:700}}>No</button>
             </div>}
        </div>
      </div>
    </div>
  )
}

// ── WELCOME ──────────────────────────────────────────────
function Welcome({onStart,onSkipPretest}) {
  return (
    <div style={{maxWidth:660,margin:'0 auto',padding:'40px 20px',fontFamily:'Georgia,serif'}}>
      <div style={{textAlign:'center',marginBottom:36}}>
        <div style={{fontSize:52,marginBottom:12}}>🎓</div>
        <h1 style={{fontSize:28,fontWeight:700,color:C.primary,margin:'0 0 8px',letterSpacing:'-0.5px'}}>BCBA Exam Prep</h1>
        <p style={{fontSize:15,color:C.muted,margin:0,fontFamily:'system-ui'}}>6th Edition Task Content Outline · BACB Aligned · 522-Question Bank</p>
      </div>
      <Card style={{marginBottom:20}}>
        <h2 style={{fontSize:17,fontWeight:700,color:C.primary,margin:'0 0 16px',fontFamily:'system-ui'}}>Your Study Path</h2>
        {[
          ['1','Diagnostic Pretest','30 scenario-based questions across all 9 domains'],
          ['2','Personalized Results','See exactly which domains fall below 70%'],
          ['3','Targeted Modules','Deep-dive study with concept review — must pass 80% quiz to unlock exam'],
          ['4','Full Mock Exam','150 questions, 4-hour timer, mirrors the real BCBA exam'],
        ].map(([n,title,desc])=>(
          <div key={n} style={{display:'flex',gap:14,marginBottom:14,alignItems:'flex-start'}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:C.primary,color:C.white,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,flexShrink:0,fontFamily:'system-ui'}}>{n}</div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:2,fontFamily:'system-ui'}}>{title}</div>
              <div style={{fontSize:13,color:C.muted,fontFamily:'system-ui'}}>{desc}</div>
            </div>
          </div>
        ))}
      </Card>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:28}}>
        {DOMAINS.map(d=>(
          <Card key={d} style={{textAlign:'center',padding:14}}>
            <div style={{fontSize:24,marginBottom:4}}>{MODULES[d].icon}</div>
            <div style={{fontSize:11,fontWeight:700,color:C.primary,fontFamily:'system-ui',lineHeight:1.3}}>{d}</div>
          </Card>
        ))}
      </div>
      <button onClick={onStart} style={{width:'100%',padding:'16px',background:C.primary,color:C.white,border:'none',borderRadius:12,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'Georgia,serif',letterSpacing:'0.02em'}}>
        Begin Diagnostic Pretest →
      </button>
      <button onClick={onSkipPretest} style={{width:'100%',marginTop:10,padding:'13px',background:'transparent',color:C.primary,border:`2px solid ${C.primary}`,borderRadius:12,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'system-ui'}}>
        Skip pretest — study all 9 modules →
      </button>
      <p style={{fontSize:12,color:C.muted,textAlign:'center',margin:'10px 0 0',fontFamily:'system-ui'}}>
        Skipping the pretest gives you access to every module. You'll still need to pass each 80% quiz to unlock the full exam.
      </p>
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
          <p style={{fontSize:13,color:C.text,margin:0,lineHeight:1.6}}><strong>Explanation:</strong> {q.rationale}</p>
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
function ModuleHub({weakDomains,moduleStatuses,onSelect,onExam}) {
  const allPassed = weakDomains.every(d=>moduleStatuses[d]==='passed')
  const passedCount = weakDomains.filter(d=>moduleStatuses[d]==='passed').length
  return (
    <div style={{maxWidth:680,margin:'0 auto',padding:'32px 20px',fontFamily:'system-ui'}}>
      <div style={{textAlign:'center',marginBottom:28}}>
        <h2 style={{fontSize:22,fontWeight:700,color:C.primary,margin:'0 0 6px',fontFamily:'Georgia,serif'}}>Study Plan</h2>
        <p style={{fontSize:14,color:C.muted,margin:0}}>Complete each module and pass the 5-question quiz (≥80%) to unlock the full exam</p>
      </div>
      {weakDomains.map(d=>{
        const status=moduleStatuses[d]||'not_started'
        const statusColors={not_started:{bg:C.primaryLight,color:C.primary,label:'Not Started'},passed:{bg:C.greenBg,color:C.green,label:'✓ Passed'},failed:{bg:C.redBg,color:C.red,label:'✗ Retry'}}
        const sc=statusColors[status]
        return (
          <Card key={d} style={{marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{fontSize:28}}>{MODULES[d]?.icon}</div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:C.primary}}>{d}</div>
                  <div style={{fontSize:12,color:C.muted}}>{MODULES[d]?.concepts?.length||0} concepts · 5-question quiz</div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <Pill text={sc.label} color={sc.color} bg={sc.bg}/>
                <button onClick={()=>onSelect(d)}
                  style={{padding:'8px 16px',borderRadius:10,border:'none',background:status==='passed'?C.greenBg:C.primary,color:status==='passed'?C.green:C.white,cursor:'pointer',fontSize:13,fontWeight:700}}>
                  {status==='passed'?'Review':'Study →'}
                </button>
              </div>
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
function LearningModule({domain,phase,qIndex,answers,onAnswer,onBack,onStartQuiz,onFinish}) {
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
            <h3 style={{fontSize:17,fontWeight:800,color:ctype.color,margin:'0 0 14px',lineHeight:1.35}}>{concept.title}</h3>
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
              <div style={{marginTop:20,background:C.grayLight,borderRadius:12,padding:'16px 10px'}}>
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

  if(allAnswered) return (
    <div style={{maxWidth:580,margin:'0 auto',padding:'48px 20px',textAlign:'center',fontFamily:'system-ui'}}>
      <div style={{fontSize:52,marginBottom:12}}>{passed?'🎉':'📖'}</div>
      <h2 style={{fontSize:22,fontWeight:700,color:passed?C.green:C.red,fontFamily:'Georgia,serif',marginBottom:8}}>
        {passed?'Module Passed!':'Not Quite Yet'}
      </h2>
      <p style={{fontSize:16,color:C.muted,marginBottom:28}}>
        Score: <strong style={{color:passed?C.green:C.red}}>{score}/5 ({pct(score,5)}%)</strong>
        {passed?' — 80% threshold met':' — 80% required to pass'}
      </p>
      {passed
        ?<button onClick={()=>onFinish('passed')} style={{padding:'14px 32px',background:C.green,color:C.white,border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer'}}>✓ Complete Module</button>
        :<div style={{display:'flex',gap:12,justifyContent:'center'}}>
           <button onClick={()=>onFinish('failed')} style={{padding:'14px 24px',background:C.white,color:C.primary,border:`2px solid ${C.primary}`,borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer'}}>← Back to Concepts</button>
           <button onClick={()=>onAnswer('reset')} style={{padding:'14px 24px',background:C.red,color:C.white,border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer'}}>Retry Quiz</button>
         </div>}
    </div>
  )

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
            <p style={{fontSize:13,color:C.text,margin:0,lineHeight:1.6}}><strong>Explanation:</strong> {pq.rationale}</p>
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
        150 questions · 4-hour timer · All 9 domains<br/>
        Mirrors the format and difficulty of the real BCBA exam.<br/>
        Passing score: <strong>70%</strong>
      </p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:32}}>
        {[['150','Questions'],['4 hrs','Time Limit'],['70%','Passing Score']].map(([v,l])=>(
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
            <div style={{fontSize:11,fontWeight:800,color:C.primary,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:6}}>📘 Rationale</div>
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
  const overall = Math.round(domains.reduce((a,d)=>{
    const s=examScores[d]||{correct:0,total:1}
    return a+pct(s.correct,s.total)
  },0)/domains.length)
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

  useEffect(()=>{
    if(st.phase==='fullexam'&&st.timerActive&&st.timerSeconds>0) {
      timerRef.current = setInterval(()=>{
        setSt(p=>{
          if(p.timerSeconds<=1) {
            clearInterval(timerRef.current)
            const scores = calcScores(p.examQuestions, p.examAnswers)
            return {...p, timerSeconds:0, timerActive:false, phase:'final_results', examScores:scores}
          }
          return {...p, timerSeconds:p.timerSeconds-1}
        })
      },1000)
    }
    return ()=>clearInterval(timerRef.current)
  },[st.phase,st.timerActive])

  const [flagged,setFlagged] = useState(() => {
    const p = loadPersisted()
    return new Set(p?.flagged || [])
  })
  const toggleFlag = i => setFlagged(f=>{const n=new Set(f);n.has(i)?n.delete(i):n.add(i);return n})

  useEffect(() => {
    savePersisted({ st, flagged: [...flagged] })
  }, [st, flagged])

  const handleNav = id => {
    const map = {
      welcome:()=>up({phase:'welcome',confirmReset:false}),
      pretest:()=>up({phase:'pretest',confirmReset:false}),
      pretest_results:()=>st.pretestScores&&up({phase:'pretest_results',confirmReset:false}),
      modules:()=>(st.pretestScores||st.skippedPretest)&&up({phase:'modules',confirmReset:false}),
      exam_intro:()=>up({phase:'exam_intro',confirmReset:false}),
      final_results:()=>st.examScores&&up({phase:'final_results',confirmReset:false}),
    }
    map[id]?.()
  }

  const nav = (
    <>
      <GlobalStyles/>
      <NavBar st={st} onNav={handleNav}
        onReset={()=>up({confirmReset:true})}
        onConfirmReset={()=>{clearInterval(timerRef.current);clearPersisted();setFlagged(new Set());setSt({...INITIAL})}}
        onCancelReset={()=>up({confirmReset:false})}/>
    </>
  )

  if(st.phase==='welcome') return <div>{nav}<Welcome
    onStart={()=>up({phase:'pretest',qIndex:0,pretestAnswers:{},pretestQuestions:shuffleQuestions(PRETEST_QUESTIONS)})}
    onSkipPretest={()=>up({phase:'modules',skippedPretest:true,weakDomains:DOMAINS,moduleStatuses:{}})}/></div>

  if(st.phase==='pretest') {
    const pqs = st.pretestQuestions.length ? st.pretestQuestions : PRETEST_QUESTIONS
    return <div>{nav}<QuestionScreen
      questions={pqs} answers={st.pretestAnswers} qIndex={st.qIndex}
      onAnswer={(i,a)=>up({pretestAnswers:{...st.pretestAnswers,[i]:a}})}
      onNav={d=>up({qIndex:Math.max(0,Math.min(pqs.length-1,st.qIndex+d))})}
      onSubmit={()=>{
        const scores=calcScores(pqs,st.pretestAnswers)
        const weak=DOMAINS.filter(d=>scores[d]&&pct(scores[d].correct,scores[d].total)<70)
        up({phase:'pretest_results',pretestScores:scores,weakDomains:weak})
      }}
      label="Pretest"/></div>
  }

  if(st.phase==='pretest_results') return <div>{nav}<PretestResults
    scores={st.pretestScores} weakDomains={st.weakDomains}
    onStudy={()=>up({phase:'modules'})}
    onSkip={()=>up({phase:'exam_intro'})}/></div>

  if(st.phase==='modules') return <div>{nav}<ModuleHub
    weakDomains={st.weakDomains} moduleStatuses={st.moduleStatuses}
    onSelect={d=>up({phase:'module',activeModule:d,modulePhase:'content',moduleQIndex:0,moduleAnswers:{}})}
    onExam={()=>up({phase:'exam_intro'})}/></div>

  if(st.phase==='module') return <div>{nav}<LearningModule
    domain={st.activeModule} phase={st.modulePhase}
    qIndex={st.moduleQIndex} answers={st.moduleAnswers}
    onAnswer={(i,a)=>{
      if(i==='reset'){up({moduleAnswers:{},moduleQIndex:0});return}
      if(i==='next'){up({moduleQIndex:st.moduleQIndex+1});return}
      const newAns={...st.moduleAnswers,[i]:a}
      up({moduleAnswers:newAns})
      if(i<MODULES[st.activeModule].practice.length-1) setTimeout(()=>up({moduleQIndex:i+1}),800)
    }}
    onBack={()=>up({phase:'modules'})}
    onStartQuiz={()=>up({modulePhase:'quiz',moduleQIndex:0,moduleAnswers:{}})}
    onFinish={status=>up({phase:'modules',moduleStatuses:{...st.moduleStatuses,[st.activeModule]:status},modulePhase:'content'})}/></div>

  if(st.phase==='exam_intro') return <div>{nav}<ExamIntro onStart={()=>{
    const qs=sampleExamQuestions(PRETEST_QUESTIONS,150).map(shuffleQuestion)
    up({phase:'fullexam',examQuestions:qs,examAnswers:{},qIndex:0,timerSeconds:14400,timerActive:true})
    setFlagged(new Set())
  }}/></div>

  if(st.phase==='fullexam') return <div>{nav}<ExamScreen
    questions={st.examQuestions} answers={st.examAnswers} qIndex={st.qIndex}
    timerSeconds={st.timerSeconds} flagged={flagged}
    onAnswer={(i,a)=>up({examAnswers:{...st.examAnswers,[i]:a}})}
    onNav={d=>up({qIndex:Math.max(0,Math.min(st.examQuestions.length-1,st.qIndex+d))})}
    onFlag={toggleFlag}
    onSubmit={()=>{
      clearInterval(timerRef.current)
      const scores=calcScores(st.examQuestions,st.examAnswers)
      up({phase:'final_results',examScores:scores,timerActive:false})
    }}/></div>

  if(st.phase==='final_results') return <div>{nav}<FinalResults
    examScores={st.examScores} pretestScores={st.pretestScores}
    onReview={()=>up({phase:'exam_review'})}
    onReset={()=>{clearInterval(timerRef.current);clearPersisted();setFlagged(new Set());setSt({...INITIAL})}}/></div>

  if(st.phase==='exam_review') return <div>{nav}<ExamReview
    questions={st.examQuestions} answers={st.examAnswers}
    onBack={()=>up({phase:'final_results'})}/></div>

  return null
}
