import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUESTIONS } from '../constants/questions'
import { TYPES } from '../constants/types'
import { T, FONT } from '../constants/tokens'
import { store, INIT_SCORES } from '../store'

const TOTAL = QUESTIONS.length

function computeResult(scores) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([k]) => k)
  return { first: sorted[0], second: sorted[1], third: sorted[2] }
}

export default function QuizPage() {
  const navigate = useNavigate()
  const user = store.getUser()

  const [qIndex, setQIndex] = useState(store.getQIndex())
  const [scores, setScores] = useState(store.getScores())

  useEffect(() => { if (!user) navigate('/') }, [])

  const handleAnswer = (scoreKey) => {
    const next = { ...scores, [scoreKey]: scores[scoreKey] + 1 }
    setScores(next)
    store.setScores(next)
    if (qIndex + 1 < TOTAL) {
      const ni = qIndex + 1
      setQIndex(ni)
      store.setQIndex(ni)
    } else {
      store.setResult(computeResult(next))
      navigate('/result')
    }
  }

  const q = QUESTIONS[qIndex]
  const pct = Math.round((qIndex / TOTAL) * 100)

  return (
    <div key={qIndex} className="fade-in"
      style={{ padding:'26px 22px 30px', background:'#0E0816', minHeight:'100vh', fontFamily:FONT }}>
      {/* 진행 바 */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:14, fontWeight:700, color:'#C084FC', whiteSpace:'nowrap' }}>
          Q{qIndex + 1} <span style={{ color:'#EAE3D8' }}>/ {TOTAL}</span>
        </span>
        <div style={{ flex:1, height:5, background:'rgba(255,255,255,.1)', borderRadius:6, overflow:'hidden' }}>
          <div style={{ height:'100%', background:'linear-gradient(90deg,#9B5DE5,#C084FC)',
            borderRadius:6, transition:'width .4s ease', width:`${pct + 100/TOTAL}%` }}/>
        </div>
      </div>

      <div style={{ height:28 }}/>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#F3E8FF', lineHeight:1.5, margin:0 }}>{q.q}</h2>
      <div style={{ height:20 }}/>

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {q.options.map((op, i) => (
          <button key={i} onClick={() => handleAnswer(op.score)} className="option-btn"
            style={{ display:'flex', alignItems:'center', gap:12, width:'100%', textAlign:'left',
              padding:'15px 16px', fontSize:14.5, color:'rgba(255,255,255,.85)',
              background:'rgba(255,255,255,.06)', border:'1.5px solid rgba(255,255,255,.1)',
              borderRadius:14, cursor:'pointer', fontFamily:FONT, fontWeight:500 }}>
            <span style={{ width:26, height:26, borderRadius:8, background:'rgba(192,132,252,.15)',
              border:'1px solid rgba(192,132,252,.3)', display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:12, fontWeight:700, color:'#C084FC', flexShrink:0 }}>
              {String.fromCharCode(65 + i)}
            </span>
            <span>{op.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
