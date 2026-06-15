import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FONT } from '../constants/tokens'
import { MAIN_COPY, INTRO_CHAT, UNAIT } from '../constants/character'
import { store, INIT_SCORES } from '../store'

const PURPLE = '#9B5DE5'
const LILAC = '#C084FC'
const HERO = `${import.meta.env.BASE_URL}images/intro-hero.png`

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

export default function IntroPage() {
  const navigate = useNavigate()
  const heroSrc = `${import.meta.env.BASE_URL}images/intro-hero.png`
  const heroVideo = `${import.meta.env.BASE_URL}video/main.mp4`

  const [screen, setScreen] = useState('hero')   // 'hero' | 'chat'
  const [messages, setMessages] = useState([])   // { from:'yura'|'me', text }
  const [typing, setTyping] = useState(false)
  const [phase, setPhase] = useState(null)       // 'name'|'age'|'gender'|'agree'|'start'|null
  const [turn, setTurn] = useState(0)
  const [draft, setDraft] = useState('')

  const userRef = useRef({ name: '', age: '', gender: '', agreed: false })
  const scrollRef = useRef(null)
  const timers = useRef([])
  const after = (ms, fn) => { const id = setTimeout(fn, ms); timers.current.push(id); return id }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // 대화 로그를 세션에 누적 저장 → 퀴즈/결과 페이지에서 같은 채팅으로 이어짐
  useEffect(() => { store.setChat(messages) }, [messages])

  // 새 메시지 / 타이핑 표시될 때마다 맨 아래로 스크롤
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, phase])

  const fill = (s) => s.replace(/\{name\}/g, userRef.current.name || '너')

  // 한 턴의 유라 메시지를 타이핑 연출과 함께 차례로 보낸 뒤 입력창을 연다
  const playTurn = useCallback((idx) => {
    const t = INTRO_CHAT[idx]
    if (!t) return
    setPhase(null)
    let i = 0
    const step = () => {
      if (i >= t.yura.length) { setPhase(t.input); return }
      setTyping(true)
      const text = fill(t.yura[i])
      after(Math.min(1500, 520 + text.length * 22), () => {
        setTyping(false)
        setMessages(m => [...m, { from: 'yura', text }])
        i += 1
        after(360, step)
      })
    }
    step()
  }, [])

  const startChat = () => {
    store.setChat([])      // 새 테스트 시작 → 채팅 로그 초기화
    setMessages([])
    setScreen('chat')
    after(450, () => playTurn(0))
  }

  const advance = (myText) => {
    if (myText != null) setMessages(m => [...m, { from: 'me', text: myText }])
    const nextTurn = turn + 1
    setTurn(nextTurn)
    setPhase(null)
    setDraft('')
    after(480, () => playTurn(nextTurn))
  }

  const sendName = () => {
    const v = draft.trim()
    if (!v) return
    userRef.current.name = v
    advance(v)
  }
  const sendAge = () => {
    const v = draft.trim()
    if (!v) return
    userRef.current.age = v
    advance(`${v}살`)
  }
  const pickGender = (g) => { userRef.current.gender = g; advance(g) }
  const agree = () => { userRef.current.agreed = true; advance('응, 동의할게') }

  const onStart = () => {
    store.setUser({ ...userRef.current })
    store.setScores({ ...INIT_SCORES })
    store.setAnswers([])
    store.setQIndex(0)
    navigate('/quiz')
  }

  // ── 0. 히어로(시작) 화면 ──────────────────────────
  if (screen === 'hero') {
    return (
      <div className="fade-in" style={{ background: '#0E0816', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 0, containerType: 'inline-size', overflow: 'hidden' }}>
          <video src={heroVideo} autoPlay muted loop playsInline poster={heroSrc}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(14,8,22,.15) 0%, rgba(14,8,22,0) 45%, rgba(14,8,22,.85) 82%, #0E0816 100%)' }} />

          <div style={{ position: 'absolute', top: 18, right: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${PURPLE}, ${LILAC})`, boxShadow: '0 0 10px rgba(192,132,252,.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', fontFamily: FONT }}>이</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#EAD9FF', letterSpacing: '.5px',
              textShadow: '0 1px 6px rgba(0,0,0,.5)', fontFamily: FONT }}>이음나루</span>
          </div>

          <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: LILAC, letterSpacing: '2px', fontFamily: FONT, marginBottom: 6 }}>
              DM 프로파일링 : 연애해독
            </div>
            <h1 style={{ fontSize: 27, fontWeight: 900, color: '#fff', lineHeight: 1.28, fontFamily: FONT, margin: 0 }}>
              {MAIN_COPY.headline}
            </h1>
          </div>
        </div>

        <div style={{ flexShrink: 0, padding: '18px 22px 28px' }}>
          <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.82)', lineHeight: 1.7, marginBottom: 20, fontFamily: FONT }}>
            {MAIN_COPY.body.map((line, i) => (
              <React.Fragment key={line}>
                {line}{i < MAIN_COPY.body.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
          {/* DM 입력바 스타일 시작 버튼 */}
          <button onClick={startChat} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            border: '1.5px solid rgba(192,132,252,.4)', borderRadius: 26, padding: '8px 8px 8px 18px',
            cursor: 'pointer', fontFamily: FONT, textAlign: 'left',
            background: 'rgba(255,255,255,.07)', boxShadow: '0 8px 24px rgba(155,93,229,.18)',
          }}>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,.55)' }}>
              {MAIN_COPY.cta}
            </span>
            <span style={{
              width: 44, height: 44, flexShrink: 0, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, ${PURPLE}, ${LILAC})`, boxShadow: '0 6px 18px rgba(155,93,229,.5)',
              color: '#fff', fontSize: 20, fontWeight: 800,
            }}>↑</span>
          </button>
          <p style={{ textAlign: 'center', fontSize: 11.5, color: 'rgba(255,255,255,.4)', marginTop: 14, fontFamily: FONT }}>
            입력하신 정보는 결과 안내 목적으로만 사용돼요
          </p>
        </div>
      </div>
    )
  }

  // ── 1. 채팅 화면 ─────────────────────────────────
  const inputBar = {
    display: 'flex', gap: 8, alignItems: 'center', width: '100%',
  }
  const textInput = {
    flex: 1, padding: '14px 16px', fontSize: 16, fontFamily: FONT,
    border: '1.5px solid rgba(192,132,252,.35)', borderRadius: 22,
    background: 'rgba(255,255,255,.07)', color: '#fff', outline: 'none',
  }
  const sendBtn = (active) => ({
    width: 46, height: 46, flexShrink: 0, borderRadius: '50%', border: 'none', cursor: active ? 'pointer' : 'default',
    background: active ? `linear-gradient(135deg, ${PURPLE}, ${LILAC})` : 'rgba(255,255,255,.1)',
    color: active ? '#fff' : 'rgba(255,255,255,.3)', fontSize: 19, fontFamily: FONT,
    boxShadow: active ? '0 6px 18px rgba(155,93,229,.4)' : 'none',
  })
  const chipBtn = (active) => ({
    flex: 1, padding: '15px 0', borderRadius: 16, border: `1.5px solid ${active ? LILAC : 'rgba(255,255,255,.14)'}`,
    background: active ? 'rgba(192,132,252,.2)' : 'rgba(255,255,255,.06)',
    color: active ? LILAC : 'rgba(255,255,255,.7)', fontFamily: FONT, fontSize: 16, fontWeight: 700, cursor: 'pointer',
  })

  return (
    <div style={{ background: '#0E0816', height: '100dvh', fontFamily: FONT, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* 채팅 헤더 */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 11, padding: '16px 18px',
        borderBottom: '1px solid rgba(192,132,252,.14)', background: 'rgba(14,8,22,.9)', backdropFilter: 'blur(8px)' }}>
        <Avatar size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, color: '#fff', fontWeight: 800 }}>{UNAIT.name}</div>
          <div style={{ fontSize: 11.5, color: LILAC, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80' }} />
            {UNAIT.title} · 대화 중
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        padding: '20px 16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,.28)', margin: '0 0 6px' }}>
          {UNAIT.name}와의 디엠이 시작됐어요
        </div>

        {messages.map((m, i) => (
          m.from === 'yura' ? (
            <div key={i} className="fade-in" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '86%' }}>
              <Avatar />
              <div style={{ padding: '12px 15px', borderRadius: '4px 16px 16px 16px',
                background: 'rgba(255,255,255,.08)', border: '1px solid rgba(192,132,252,.22)',
                color: '#F3E8FF', fontSize: 15, lineHeight: 1.6, fontWeight: 500 }}>
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="fade-in" style={{ alignSelf: 'flex-end', maxWidth: '82%' }}>
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

      {/* 입력 영역 (phase에 따라 변함) */}
      <div style={{ flexShrink: 0, padding: '12px 16px 22px', borderTop: '1px solid rgba(255,255,255,.07)',
        background: '#0E0816' }}>
        {phase === 'name' && (
          <div style={inputBar}>
            <input style={textInput} autoFocus placeholder="이름을 입력해서 답장하기" value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendName() }} />
            <button onClick={sendName} style={sendBtn(draft.trim().length > 0)} aria-label="보내기">↑</button>
          </div>
        )}

        {phase === 'age' && (
          <div style={inputBar}>
            <input style={textInput} autoFocus inputMode="numeric" maxLength={3} placeholder="나이를 숫자로 답장하기"
              value={draft} onChange={e => setDraft(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyDown={e => { if (e.key === 'Enter') sendAge() }} />
            <button onClick={sendAge} style={sendBtn(draft.trim().length > 0)} aria-label="보내기">↑</button>
          </div>
        )}

        {phase === 'gender' && (
          <div style={{ display: 'flex', gap: 10 }}>
            {[{ val: '여자', emoji: '👩' }, { val: '남자', emoji: '👨' }].map(({ val, emoji }) => (
              <button key={val} onClick={() => pickGender(val)} style={chipBtn(false)}>{emoji} {val}</button>
            ))}
          </div>
        )}

        {phase === 'agree' && (
          <div>
            <button onClick={agree} style={{
              width: '100%', border: 'none', borderRadius: 16, padding: '16px', fontSize: 16, fontWeight: 800,
              cursor: 'pointer', fontFamily: FONT, color: '#fff',
              background: `linear-gradient(135deg, ${PURPLE}, ${LILAC})`, boxShadow: '0 8px 22px rgba(155,93,229,.4)',
            }}>
              응, 동의할게 ✓
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 10 }}>
              개인정보 수집·이용 동의 (필수) · 제3자에게 제공되지 않아요
            </p>
          </div>
        )}

        {phase === 'start' && (
          <button onClick={onStart} style={{
            width: '100%', border: 'none', borderRadius: 16, padding: '16px', fontSize: 16.5, fontWeight: 900,
            cursor: 'pointer', fontFamily: FONT, color: '#fff',
            background: `linear-gradient(135deg, ${PURPLE}, ${LILAC})`, boxShadow: '0 10px 26px rgba(155,93,229,.45)',
          }}>
            유라의 분석 시작하기
          </button>
        )}

        {phase === null && (
          <div style={{ ...inputBar, opacity: .5 }}>
            <div style={{ ...textInput, color: 'rgba(255,255,255,.35)' }}>유라가 입력 중…</div>
            <div style={sendBtn(false)} />
          </div>
        )}
      </div>
    </div>
  )
}
