import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUESTIONS } from '../constants/questions'
import { FONT } from '../constants/tokens'
import { UNAIT } from '../constants/character'
import { store, INIT_SCORES } from '../store'

const TOTAL = QUESTIONS.length
const PURPLE = '#9B5DE5'
const LILAC = '#C084FC'
const HERO = `${import.meta.env.BASE_URL}images/intro-hero.png`

// 리액션 뒤 다음 질문으로 자연스럽게 이어주는 연결 멘트(진짜 톡하는 느낌)
const BRIDGES = [
  '그럼 이건 어때?',
  '이것도 궁금해.',
  '다음 거 볼게.',
  '그럼 이런 상황은?',
  '이것도 물어볼게.',
  '계속 가볼게.',
  '그럼 이런 적은 없어?',
  '그럼 이건?',
  '이번엔 이거.',
  '하나만 더 물어볼게.',
  '이것도 골라봐.',
]

// 재마운트/깜박임 방지를 위해 모듈 최상위에 고정 정의
function Avatar({ size = 30 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
      background: `linear-gradient(135deg, ${PURPLE}, ${LILAC})`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: '#fff', fontSize: size * 0.4, fontWeight: 900,
      boxShadow: '0 0 14px rgba(192,132,252,.4)' }}>
      <img src={HERO} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }}
        onError={e => { e.target.style.display = 'none' }} />
    </div>
  )
}

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
  const [messages, setMessages] = useState(() => store.getChat())  // 인트로부터 이어진 대화
  const [typing, setTyping] = useState(false)
  const [phase, setPhase] = useState(null)          // 'answering' | null(전환/대기 중)
  const [selected, setSelected] = useState(null)    // 탭 직후 강조용

  const scrollRef = useRef(null)
  const timers = useRef([])
  const started = useRef(false)
  const initialCount = useRef(store.getChat().length)  // 불러온 과거 메시지 수 (얘들은 재진입 시 애니메이션 안 함)
  const didFirstScroll = useRef(false)
  const after = (ms, fn) => { const id = setTimeout(fn, ms); timers.current.push(id); return id }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // 대화 로그를 세션에 계속 저장 → 결과 페이지에서 같은 채팅으로 이어짐
  useEffect(() => { store.setChat(messages) }, [messages])

  // 유라 메시지 여러 줄을 타이핑 연출과 함께 차례로 보낸 뒤 done 콜백
  const streamYura = (lines, done) => {
    let idx = 0
    const step = () => {
      if (idx >= lines.length) { done && done(); return }
      setTyping(true)
      const text = lines[idx]
      after(Math.min(1300, 360 + text.length * 18), () => {
        setTyping(false)
        setMessages(m => [...m, { from: 'yura', text }])
        idx += 1
        after(300, step)
      })
    }
    step()
  }

  // 연결 멘트(있으면) + 질문을 타이핑 연출과 함께 차례로 보낸 뒤 보기를 연다
  const askQuestion = useCallback((i, animate, bridge) => {
    const q = QUESTIONS[i]
    if (!q) return
    const lines = bridge ? [bridge, q.q] : [q.q]
    if (!animate) {
      setMessages(m => [...m, ...lines.map(text => ({ from: 'yura', text }))])
      setPhase('answering')
      return
    }
    setPhase(null)
    let idx = 0
    const step = () => {
      if (idx >= lines.length) { setPhase('answering'); return }
      setTyping(true)
      const text = lines[idx]
      after(Math.min(1200, 340 + text.length * 18), () => {
        setTyping(false)
        setMessages(m => [...m, { from: 'yura', text }])
        idx += 1
        after(260, step)
      })
    }
    step()
  }, [])

  // 최초 진입: 사용자 확인 후, 현재 질문이 아직 안 떴으면 던지기 (새로고침 시 중복 방지)
  useEffect(() => {
    if (started.current) return
    started.current = true
    if (!user) { navigate('/'); return }
    const loaded = store.getChat()
    const qi = store.getQIndex()
    const asked = loaded.filter(m => m.from === 'yura' && QUESTIONS.some(q => q.q === m.text)).length
    if (asked > qi) setPhase('answering')           // 이미 화면에 질문이 떠 있음
    else after(450, () => askQuestion(qi, true))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 새 메시지/타이핑 시 맨 아래로 스크롤 (첫 진입은 그리기 전에 즉시 맞춰 깜박임 방지)
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: didFirstScroll.current ? 'smooth' : 'auto' })
    didFirstScroll.current = true
  }, [messages, typing, phase])

  /* ─────────────────────────────────────────────────────────────
   * (주석 처리) 기존 "분석 중" 로딩 화면.
   * 이제는 채팅 안에서 유라가 "잠깐만 기다려봐" 메시지를 보내고
   * 잠시(약 3초) 입력 중 상태로 대기한 뒤 결과로 이동한다.
   *
   * import { ANALYSIS_MESSAGES } from '../constants/character'
   * const MSG_TIMES = [0, 550, 1100, 1650, 2200]
   * const FILL_MS = 2900
   * const HOLD_MS = 450
   * const [analyzing, setAnalyzing] = useState(false)
   * const [aPhase, setAPhase] = useState(0)
   * const [ready, setReady] = useState(false)
   * useEffect(() => {
   *   if (!analyzing) return
   *   const ts = ANALYSIS_MESSAGES.map((_, i) => setTimeout(() => setAPhase(i), MSG_TIMES[i]))
   *   ts.push(setTimeout(() => setReady(true), FILL_MS))
   *   ts.push(setTimeout(() => navigate('/result'), FILL_MS + HOLD_MS))
   *   return () => ts.forEach(clearTimeout)
   * }, [analyzing])
   *
   * if (analyzing) {
   *   return ( ...게이지 + 스피너 로딩 UI... )
   * }
   * ───────────────────────────────────────────────────────────── */

  const handleAnswer = (optIdx) => {
    if (phase !== 'answering') return
    setPhase(null)
    setSelected(optIdx)
    const opt = QUESTIONS[qIndex].options[optIdx]
    after(260, () => {
      setSelected(null)
      setMessages(m => [...m, { from: 'me', text: opt.label }])
      const nextAnswers = [...answers]
      nextAnswers[qIndex] = optIdx
      setAnswers(nextAnswers)
      store.setAnswers(nextAnswers)

      const isLast = qIndex + 1 >= TOTAL
      const reactions = opt.reactions || []
      // 유라의 리액션(티키타카, 여러 줄) → 다음 질문 또는 분석 대기
      after(420, () => {
        streamYura(reactions, () => {
          if (!isLast) {
            const ni = qIndex + 1
            setQIndex(ni)
            store.setQIndex(ni)
            // 리액션 읽을 짧은 텀 → 연결 멘트("그럼 이건?") → 다음 질문으로 톡처럼 이어짐
            const bridge = BRIDGES[qIndex % BRIDGES.length]
            after(600, () => askQuestion(ni, true, bridge))
          } else {
            // 마지막 답변 → 결과 계산 후 "기다려봐" 안내 + 약 3초 대기 → 결과 페이지
            const { scores, result } = computeResult(nextAnswers)
            store.setScores(scores)
            store.setResult(result)
            after(560, () => {
              setTyping(true)
              after(1000, () => {
                setTyping(false)
                setMessages(m => [...m, { from: 'yura', text: '잠깐만. 지금까지 네 답을 쭉 따라가 볼게 🔍' }])
                after(500, () => {
                  setTyping(true)            // 분석하는 동안 '입력 중' 표시
                  after(3000, () => { setTyping(false); navigate('/result') })
                })
              })
            })
          }
        })
      })
    })
  }

  const goBack = () => {
    if (qIndex === 0) { navigate('/'); return }
    timers.current.forEach(clearTimeout); timers.current = []
    setTyping(false)
    const arr = [...messages]
    // 현재 질문 + 연결 멘트 + 직전 리액션 (모두 끝에 연속된 유라 말풍선) 제거
    while (arr.length && arr[arr.length - 1].from === 'yura') arr.pop()
    // 직전 내 답장 제거
    if (arr.length && arr[arr.length - 1].from === 'me') arr.pop()
    const pi = qIndex - 1
    const newAnswers = answers.slice(0, pi)
    setAnswers(newAnswers); store.setAnswers(newAnswers)
    setQIndex(pi); store.setQIndex(pi)
    setMessages(arr)
    setSelected(null)
    setPhase('answering')   // 직전 질문은 이미 thread에 있으니 보기만 다시 연다
  }

  const q = QUESTIONS[qIndex]
  const pct = Math.round(((qIndex + 1) / TOTAL) * 100)

  return (
    <div style={{ background: '#0E0816', height: '100dvh', fontFamily: FONT, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* 채팅 헤더 + 진행바 */}
      <div style={{ flexShrink: 0, padding: '14px 16px 12px', borderBottom: '1px solid rgba(192,132,252,.14)',
        background: 'rgba(14,8,22,.92)', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <button onClick={goBack} aria-label="이전"
            style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, border: '1px solid rgba(255,255,255,.12)',
              background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.7)', fontSize: 17, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>←</button>
          <Avatar size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, color: '#fff', fontWeight: 800 }}>{UNAIT.name}</div>
            <div style={{ fontSize: 11, color: LILAC, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80' }} />
              {UNAIT.title} · 분석 중
            </div>
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: LILAC, whiteSpace: 'nowrap' }}>
            {qIndex + 1}<span style={{ color: 'rgba(255,255,255,.4)' }}> / {TOTAL}</span>
          </span>
        </div>
        <div style={{ marginTop: 10, height: 4, background: 'rgba(255,255,255,.1)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: `linear-gradient(90deg,${PURPLE},${LILAC})`, borderRadius: 4,
            transition: 'width .4s ease', width: `${pct}%` }} />
        </div>
      </div>

      {/* 메시지 영역 */}
      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        padding: '18px 16px 12px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {messages.map((m, i) => (
          m.from === 'yura' ? (
            <div key={i} className={i >= initialCount.current ? 'fade-in' : undefined} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '88%' }}>
              <Avatar />
              <div style={{ padding: m.soft ? '10px 14px' : '12px 15px', borderRadius: '4px 16px 16px 16px',
                background: m.soft ? 'rgba(192,132,252,.1)' : 'rgba(255,255,255,.08)',
                border: '1px solid rgba(192,132,252,.22)',
                color: m.soft ? 'rgba(255,255,255,.72)' : '#F3E8FF',
                fontSize: m.soft ? 13.5 : 15.5, lineHeight: 1.6, fontWeight: 600 }}>
                {m.soft ? `"${m.text}"` : m.text}
              </div>
            </div>
          ) : (
            <div key={i} className={i >= initialCount.current ? 'fade-in' : undefined} style={{ alignSelf: 'flex-end', maxWidth: '82%' }}>
              <div style={{ padding: '12px 16px', borderRadius: '16px 4px 16px 16px',
                background: `linear-gradient(135deg, ${PURPLE}, ${LILAC})`, color: '#fff',
                fontSize: 15, lineHeight: 1.6, fontWeight: 600, boxShadow: '0 6px 18px rgba(155,93,229,.3)' }}>
                {m.text}
              </div>
            </div>
          )
        ))}

        {typing && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <Avatar />
            <div style={{ padding: '14px 16px', borderRadius: '4px 16px 16px 16px',
              background: 'rgba(255,255,255,.08)', border: '1px solid rgba(192,132,252,.22)', display: 'flex', gap: 5 }}>
              {[0, 1, 2].map(d => (
                <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: LILAC,
                  animation: 'azPulse 1.2s ease-in-out infinite', animationDelay: `${d * 0.18}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 답장(보기) 선택 영역 */}
      <div style={{ flexShrink: 0, padding: '12px 16px 20px', borderTop: '1px solid rgba(255,255,255,.07)', background: '#0E0816' }}>
        {phase === 'answering' ? (
          <div key={qIndex} className="fade-in">
            <div style={{ fontSize: 11, color: LILAC, fontWeight: 900, letterSpacing: '1.3px', margin: '0 2px 9px' }}>
              내 답장 선택
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {q.options.map((op, i) => {
                const on = selected === i
                return (
                  <button key={i} onClick={() => handleAnswer(i)} className="option-btn"
                    style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left',
                      padding: '14px 15px', fontSize: 14.5,
                      color: on ? '#fff' : 'rgba(255,255,255,.88)',
                      background: on ? 'rgba(155,93,229,.25)' : 'rgba(255,255,255,.06)',
                      border: `1.5px solid ${on ? LILAC : 'rgba(255,255,255,.1)'}`,
                      borderRadius: 14, cursor: 'pointer', fontFamily: FONT, fontWeight: 500,
                      boxShadow: on ? '0 6px 20px rgba(155,93,229,.3)' : 'none',
                      transition: 'background .15s, border-color .15s' }}>
                    <span style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                      background: on ? `linear-gradient(135deg,${PURPLE},${LILAC})` : 'rgba(192,132,252,.15)',
                      border: `1px solid ${on ? 'transparent' : 'rgba(192,132,252,.3)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700,
                      color: on ? '#fff' : LILAC }}>
                      {on ? '✓' : String.fromCharCode(65 + i)}
                    </span>
                    <span>{op.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: .5,
            padding: '14px 16px', borderRadius: 22, border: '1.5px solid rgba(192,132,252,.2)',
            background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.35)', fontSize: 14 }}>
            유라가 입력 중…
          </div>
        )}
      </div>
    </div>
  )
}
