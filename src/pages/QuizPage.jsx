import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUESTIONS } from '../constants/questions'
import { TYPES } from '../constants/types'
import { T, FONT } from '../constants/tokens'
import { store, INIT_SCORES } from '../store'

const TOTAL = QUESTIONS.length

const ANALYZE_MSGS = [
  '답변을 꼼꼼히 살펴보는 중',
  '9가지 연애 유형과 비교하는 중',
  '당신의 1순위 유형을 찾는 중',
  '결과를 정리하고 있어요',
]

// answers(선택한 보기 인덱스 배열) → 점수 합산 → 1·2·3위
function computeResult(answers) {
  const scores = { ...INIT_SCORES }
  answers.forEach((optIdx, qi) => {
    if (optIdx == null) return
    const key = QUESTIONS[qi].options[optIdx].score
    scores[key] += 1
  })
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([k]) => k)
  return { scores, result: { first: sorted[0], second: sorted[1], third: sorted[2] } }
}

export default function QuizPage() {
  const navigate = useNavigate()
  const user = store.getUser()

  const [qIndex, setQIndex] = useState(store.getQIndex())
  const [answers, setAnswers] = useState(store.getAnswers())
  const [selected, setSelected] = useState(null)   // 탭 직후 강조용
  const [locked, setLocked] = useState(false)       // 전환 중 중복 입력 방지
  const [analyzing, setAnalyzing] = useState(false) // 마지막 답변 후 "분석 중" 연출
  const [phase, setPhase] = useState(0)             // 분석 메시지 단계

  useEffect(() => { if (!user) navigate('/') }, [])

  // 질문이 바뀌면 이전에 고른 답을 표시(뒤로 왔을 때)
  useEffect(() => { setSelected(answers[qIndex] ?? null); setLocked(false) }, [qIndex])

  // 분석 중 연출: 메시지 순환 후 결과로 이동
  useEffect(() => {
    if (!analyzing) return
    const timers = ANALYZE_MSGS.map((_, i) => setTimeout(() => setPhase(i), i * 850))
    timers.push(setTimeout(() => navigate('/result'), ANALYZE_MSGS.length * 850 + 650))
    return () => timers.forEach(clearTimeout)
  }, [analyzing])

  const handleAnswer = (optIdx) => {
    if (locked) return
    setLocked(true)
    setSelected(optIdx)
    const nextAnswers = [...answers]
    nextAnswers[qIndex] = optIdx
    setAnswers(nextAnswers)
    store.setAnswers(nextAnswers)

    setTimeout(() => {
      if (qIndex + 1 < TOTAL) {
        const ni = qIndex + 1
        setQIndex(ni)
        store.setQIndex(ni)
      } else {
        const { scores, result } = computeResult(nextAnswers)
        store.setScores(scores)
        store.setResult(result)
        setAnalyzing(true)   // 바로 이동하지 않고 분석 중 화면 표시
      }
    }, 280)
  }

  const goBack = () => {
    if (qIndex === 0) { navigate('/'); return }
    const pi = qIndex - 1
    setQIndex(pi)
    store.setQIndex(pi)
  }

  const q = QUESTIONS[qIndex]
  const pct = Math.round(((qIndex + 1) / TOTAL) * 100)

  // ── 분석 중 화면 ──
  if (analyzing) {
    const totalMs = ANALYZE_MSGS.length * 850 + 650
    return (
      <div style={{ background:'#0E0816', minHeight:'100vh', fontFamily:FONT, position:'relative', overflow:'hidden',
        display:'flex', alignItems:'center', justifyContent:'center', padding:'0 36px' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'140%', height:'45%',
          background:'radial-gradient(50% 50% at 50% 50%, rgba(155,93,229,.28), transparent 70%)', pointerEvents:'none' }}/>

        <div style={{ position:'relative', zIndex:1, textAlign:'center', width:'100%', maxWidth:340 }}>
          {/* 회전 링 + 중앙 하트 */}
          <div style={{ position:'relative', width:100, height:100, margin:'0 auto 34px' }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'50%',
              background:'radial-gradient(circle, rgba(155,93,229,.35), transparent 70%)', animation:'azPulse 1.6s ease-in-out infinite' }}/>
            <div style={{ position:'absolute', inset:6, borderRadius:'50%', border:'3px solid rgba(192,132,252,.18)',
              borderTopColor:'#C084FC', animation:'azSpin .9s linear infinite' }}/>
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36 }}>💜</div>
          </div>

          <h2 style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:12 }}>결과를 분석하고 있어요</h2>
          <p key={phase} className="fade-in" style={{ fontSize:14.5, color:'#C084FC', fontWeight:600, minHeight:22, marginBottom:30 }}>
            {ANALYZE_MSGS[phase]}
          </p>

          <div style={{ width:'100%', height:6, background:'rgba(255,255,255,.1)', borderRadius:6, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:6, background:'linear-gradient(90deg,#9B5DE5,#C084FC)',
              animation:`azFill ${totalMs}ms ease-out forwards` }}/>
          </div>
          <p style={{ fontSize:12, color:'rgba(255,255,255,.3)', marginTop:14 }}>
            {user?.name ? `${user.name}님의 ` : ''}연애 유형을 찾는 중...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background:'#0E0816', minHeight:'100vh', fontFamily:FONT, position:'relative', overflow:'hidden',
      display:'flex', flexDirection:'column' }}>
      {/* 은은한 보라 배경광 — 인트로와 톤 통일 */}
      <div style={{ position:'absolute', top:'-12%', left:'50%', transform:'translateX(-50%)', width:'120%', height:'45%',
        background:'radial-gradient(60% 60% at 50% 40%, rgba(155,93,229,.20), transparent 70%)', pointerEvents:'none' }}/>

      {/* 상단 바: 뒤로 + 진행 바 (고정) */}
      <div style={{ position:'relative', zIndex:1, padding:'22px 22px 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={goBack} aria-label="이전"
            style={{ width:34, height:34, borderRadius:'50%', flexShrink:0, border:'1px solid rgba(255,255,255,.12)',
              background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.7)', fontSize:18, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', fontFamily:FONT }}>←</button>
          <div style={{ flex:1, height:6, background:'rgba(255,255,255,.1)', borderRadius:6, overflow:'hidden' }}>
            <div style={{ height:'100%', background:'linear-gradient(90deg,#9B5DE5,#C084FC)',
              borderRadius:6, transition:'width .4s ease', width:`${pct}%` }}/>
          </div>
          <span style={{ fontSize:13, fontWeight:700, color:'#C084FC', whiteSpace:'nowrap' }}>
            {qIndex + 1}<span style={{ color:'rgba(255,255,255,.4)' }}> / {TOTAL}</span>
          </span>
        </div>
      </div>

      {/* 질문 + 보기 (헤더 아래 공간 중앙 정렬, 질문마다 페이드인) */}
      <div key={qIndex} className="fade-in"
        style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 22px 48px' }}>
        <h2 style={{ fontSize:21, fontWeight:700, color:'#F3E8FF', lineHeight:1.55, margin:'0 0 24px' }}>{q.q}</h2>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {q.options.map((op, i) => {
              const on = selected === i
              return (
                <button key={i} onClick={() => handleAnswer(i)} className="option-btn" disabled={locked}
                  style={{ display:'flex', alignItems:'center', gap:13, width:'100%', textAlign:'left',
                    padding:'16px 16px', fontSize:14.5,
                    color: on ? '#fff' : 'rgba(255,255,255,.85)',
                    background: on ? 'rgba(155,93,229,.22)' : 'rgba(255,255,255,.06)',
                    border:`1.5px solid ${on ? '#C084FC' : 'rgba(255,255,255,.1)'}`,
                    borderRadius:14, cursor: locked ? 'default' : 'pointer', fontFamily:FONT, fontWeight:500,
                    boxShadow: on ? '0 6px 20px rgba(155,93,229,.3)' : 'none',
                    transition:'background .2s, border-color .2s, box-shadow .2s' }}>
                  <span style={{ width:26, height:26, borderRadius:8, flexShrink:0,
                    background: on ? 'linear-gradient(135deg,#9B5DE5,#C084FC)' : 'rgba(192,132,252,.15)',
                    border:`1px solid ${on ? 'transparent' : 'rgba(192,132,252,.3)'}`,
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700,
                    color: on ? '#fff' : '#C084FC', transition:'all .2s' }}>
                    {on ? '✓' : String.fromCharCode(65 + i)}
                  </span>
                  <span>{op.label}</span>
                </button>
              )
            })}
        </div>
      </div>
    </div>
  )
}
