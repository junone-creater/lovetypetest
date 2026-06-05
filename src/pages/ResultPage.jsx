import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { TYPES } from '../constants/types'
import { FONT } from '../constants/tokens'
import { RESULT_STORY, UNAIT } from '../constants/character'
import { store } from '../store'

const PURPLE = '#9B5DE5'
const LILAC = '#C084FC'
const HERO = `${import.meta.env.BASE_URL}images/intro-hero.png`

// 신청 접수 시트 (ApplyPage와 동일) — 폼 대신 채팅으로 받아 여기로 전송
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyjqcPPG9Xh5eIYNng0W29NscxfKR1JzcBsB0mIM9F9vGsH6It3YIHmu0lIGJMS/exec'

function fmtPhone(v) {
  const n = v.replace(/[^0-9]/g, '').slice(0, 11)
  if (n.length < 4) return n
  if (n.length < 8) return `${n.slice(0, 3)}-${n.slice(3)}`
  return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`
}

// 재확인 시 정보를 다시 받는 단계 (이름·나이·성별)
const EDIT_STEPS = [
  { key: 'name', target: 'user', type: 'text', ask: ['그래, 다시 정확히 받을게. 이름이 어떻게 돼?'], placeholder: '이름' },
  { key: 'age', target: 'user', type: 'tel', ask: ['나이는 몇 살이야?'], placeholder: '예) 24' },
  { key: 'gender', target: 'user', type: 'chips', ask: ['성별도 알려줘.'], options: ['여자', '남자'] },
]

// 대화로 받는 신청 단계 (기존 신청 폼을 채팅으로 옮긴 것)
const APPLY_STEPS = [
  { key: 'phone', type: 'tel',
    ask: ['먼저 연락받을 번호 하나만 남겨줘.'],
    placeholder: '010-0000-0000' },
  { key: 'job', type: 'chips',
    ask: ['고마워. 너 지금은 뭐 하고 지내?'],
    options: ['대학생', '직장인', '취준생', '프리랜서', '기타'] },
  { key: 'location', type: 'text',
    ask: ['어디 사는지도 알려줄래? 지점 안내 때문에 필요하거든.'],
    placeholder: '예) 서울 마포구' },
  { key: 'calltime', type: 'chips',
    ask: ['언제 연락하면 편해?'],
    options: ['평일 오전 (10~12시)', '평일 오후 (13~18시)', '평일 저녁 (18~19시)', '주말 (예약제)'] },
  { key: 'concern', type: 'text',
    ask: ['마지막으로, 연애에서 제일 고민인 게 뭐야?', '편하게 적어줘. 그것까지 봐야 제대로 도와줄 수 있어.'],
    placeholder: '고민을 편하게 적어줘' },
  { key: 'source', type: 'chips',
    ask: ['아 맞다. 나 어떻게 알고 왔어?'],
    options: ['인스타', '카카오톡', '친구·지인', '블로그'] },
]

/* ── 재마운트/깜박임 방지를 위해 컴포넌트는 모듈 최상위에 고정 정의 ── */

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

function FitCard({ label, value, danger }) {
  return (
    <div style={{ flex: 1, minWidth: 0, padding: '14px 13px', borderRadius: 13,
      background: danger ? 'rgba(240,123,184,.09)' : 'rgba(192,132,252,.10)',
      border: `1px solid ${danger ? 'rgba(240,123,184,.28)' : 'rgba(192,132,252,.24)'}` }}>
      <div style={{ fontSize: 10.5, color: danger ? '#F07BB8' : LILAC, fontWeight: 900, letterSpacing: '1.2px', marginBottom: 7 }}>
        {label}
      </div>
      <div style={{ fontSize: 14.5, color: '#fff', fontWeight: 800, lineHeight: 1.45 }}>{value}</div>
    </div>
  )
}

function RankCard({ rank, type, c, imgSrc }) {
  return (
    <div className="fade-in" style={{ alignSelf: 'stretch', borderRadius: 18, overflow: 'hidden',
      background: 'rgba(255,255,255,.065)', border: '1px solid rgba(255,255,255,.10)', boxShadow: '0 14px 34px rgba(0,0,0,.18)' }}>
      {/* 이미지 (분석 내용과 분리된 별도 영역) */}
      <div style={{ position: 'relative', background: '#160C24', lineHeight: 0 }}>
        <img src={imgSrc(type.key)} alt={type.name} style={{ width: '100%', height: 'auto', display: 'block' }}
          onError={e => { const w = e.target.parentElement; if (w) w.style.display = 'none' }} />
        <div style={{ position: 'absolute', top: 12, left: 12, padding: '7px 13px', borderRadius: 999,
          background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', border: `1px solid ${c.accent}66`,
          color: '#fff', fontSize: 12, fontWeight: 900, letterSpacing: '1px' }}>
          {rank} 프로파일
        </div>
      </div>

      {/* 분석 내용 */}
      <div style={{ padding: '18px 17px 17px' }}>
        <h2 style={{ fontSize: 21, color: '#fff', fontWeight: 900, lineHeight: 1.3, margin: '0 0 5px' }}>{type.name}</h2>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.56)', lineHeight: 1.5, margin: '0 0 16px', fontWeight: 700 }}>{type.tagline}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div>
            <div style={{ fontSize: 11, color: c.accent, fontWeight: 900, letterSpacing: '1.4px', marginBottom: 7 }}>핵심 성향</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.74)', lineHeight: 1.78, margin: 0 }}>{type.core}</p>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,.08)' }} />
          <div>
            <div style={{ fontSize: 11, color: '#F07BB8', fontWeight: 900, letterSpacing: '1.4px', marginBottom: 7 }}>치명적인 약점</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.72)', lineHeight: 1.78, margin: 0 }}>{type.weakness}</p>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,.08)' }} />
          <div>
            <div style={{ fontSize: 11, color: c.accent, fontWeight: 900, letterSpacing: '1.4px', marginBottom: 7 }}>연애 조언</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.74)', lineHeight: 1.78, margin: 0 }}>{type.advice}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <FitCard label="잘 맞는 유형" value={type.match} />
            <FitCard label="위험한 유형" value={type.danger} danger />
          </div>
        </div>
      </div>
    </div>
  )
}

function LockedSection({ eyebrow, title, c }) {
  return (
    <div style={{ position: 'relative', padding: '16px 16px 15px', borderRadius: 14,
      background: 'rgba(255,255,255,.055)', border: `1px solid ${c.accent}33`, overflow: 'hidden' }}>
      <div style={{ filter: 'blur(5px)', userSelect: 'none', opacity: .54 }}>
        <div style={{ fontSize: 11, color: c.accent, fontWeight: 900, letterSpacing: '1.6px', marginBottom: 8 }}>{eyebrow}</div>
        <h2 style={{ fontSize: 16, color: '#fff', lineHeight: 1.45, margin: '0 0 10px', fontWeight: 850 }}>{title}</h2>
        <div style={{ height: 10, width: '93%', borderRadius: 8, background: 'rgba(255,255,255,.50)', marginBottom: 9 }} />
        <div style={{ height: 10, width: '86%', borderRadius: 8, background: 'rgba(255,255,255,.38)', marginBottom: 9 }} />
        <div style={{ height: 10, width: '64%', borderRadius: 8, background: 'rgba(255,255,255,.28)' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(14,8,22,.46)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px 15px', borderRadius: 999,
          color: '#fff', background: 'rgba(0,0,0,.62)', border: `1px solid ${c.accent}77`, fontSize: 12.5, fontWeight: 900 }}>
          🔒 더 알아보기 후 공개
        </div>
      </div>
    </div>
  )
}

function LockedFirst({ first, user, c, imgSrc }) {
  return (
    <div className="fade-in" style={{ alignSelf: 'stretch', borderRadius: 20, overflow: 'hidden',
      background: 'linear-gradient(180deg, rgba(255,255,255,.09), rgba(255,255,255,.045))',
      border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 20px 55px rgba(0,0,0,.28)' }}>
      {/* 흐릿한 1위 이미지 (별도 영역) */}
      <div style={{ position: 'relative', background: '#160C24', lineHeight: 0 }}>
        <img src={imgSrc(first.key)} alt="" style={{ width: '100%', height: 'auto', display: 'block',
          filter: 'blur(11px)', transform: 'scale(1.06)', opacity: .82 }}
          onError={e => { const w = e.target.parentElement; if (w) w.style.minHeight = '150px' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 8, background: 'rgba(14,8,22,.30)' }}>
          <span style={{ fontSize: 13, color: '#fff', fontWeight: 900, padding: '9px 16px', borderRadius: 999,
            background: 'rgba(0,0,0,.6)', border: `1px solid ${c.accent}88` }}>🔒 1위 이미지 잠금</span>
        </div>
      </div>

      {/* 분석 내용 (잠금) */}
      <div style={{ padding: '18px 17px 17px' }}>
        <div style={{ fontSize: 11, color: c.accent, fontWeight: 900, letterSpacing: '1.6px', marginBottom: 7 }}>{user.name}의 1위 프로파일</div>
        <h1 style={{ fontSize: 28, color: '#fff', lineHeight: 1.2, fontWeight: 950, margin: '0 0 7px' }}>{first.name}</h1>
        <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.68)', lineHeight: 1.5, margin: '0 0 14px', fontWeight: 700 }}>{first.tagline}</p>

        <div style={{ padding: '13px 14px', borderRadius: 14, background: 'rgba(0,0,0,.22)', border: '1px solid rgba(255,255,255,.09)', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: c.accent, fontWeight: 900, letterSpacing: '1.5px', marginBottom: 7 }}>{UNAIT.name}의 한 줄 판독</div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.78)', lineHeight: 1.75, margin: 0 }}>
            "{UNAIT.quote} 1위는 네가 반복해서 선택한 가장 강한 패턴이야."
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <LockedSection eyebrow="CORE PATTERN" title="1위 핵심 성향 설명" c={c} />
          <LockedSection eyebrow="WEAK POINT" title="1위 치명적인 약점" c={c} />
          <LockedSection eyebrow="ADVICE" title="1위 연애 조언과 궁합" c={c} />
        </div>
      </div>
    </div>
  )
}

export default function ResultPage() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const resultKeys = store.getResult()
  const user = store.getUser()

  // 인트로~퀴즈에서 이어진 대화를 그대로 이어받아 결과를 덧붙인다
  const [items, setItems] = useState(() => store.getChat())   // { from, text, soft } | { kind:'card3'|'card2'|'lock' }
  const [typing, setTyping] = useState(false)
  const [phase, setPhase] = useState(null)  // 'continue' | 'cta' | 'declined' | 'applying' | 'done' | null
  const [step, setStep] = useState(0)
  const [applyStep, setApplyStep] = useState(0)
  const [draft, setDraft] = useState('')
  const [etcMode, setEtcMode] = useState(false)   // 직업 '기타' → 직접 입력 모드

  const scrollRef = useRef(null)
  const timers = useRef([])
  const started = useRef(false)
  const initialCount = useRef(store.getChat().length)  // 불러온 과거 대화 (재진입 시 애니메이션 안 함)
  const didFirstScroll = useRef(false)
  const stepsRef = useRef(APPLY_STEPS)   // 현재 진행 중인 신청 단계 목록 (수정 선택 시 EDIT_STEPS가 앞에 붙음)
  const dataRef = useRef({              // 시트로 보낼 누적 답변 (이름·나이·성별은 테스트값으로 시작)
    name: user?.name || '', age: user?.age ? String(user.age) : '', gender: user?.gender || '',
    phone: '', job: '', location: '', calltime: '', concern: '', source: '',
  })
  const after = (ms, fn) => { const id = setTimeout(fn, ms); timers.current.push(id); return id }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => { if (!resultKeys || !user) navigate('/') }, [])

  const first = resultKeys ? TYPES[resultKeys.first] : null
  const second = resultKeys ? TYPES[resultKeys.second] : null
  const third = resultKeys ? TYPES[resultKeys.third] : null
  const c = first ? first.color : { accent: LILAC, chip: PURPLE }
  const imgSrc = useCallback(
    (key) => `${import.meta.env.BASE_URL}images/result-${key}-${(dataRef.current.gender || user?.gender) === '남자' ? 'male' : 'female'}.png`,
    [user?.gender],
  )

  // 유라가 단계별로 결과를 풀어주는 대본
  // cont = 내가 탭하면 '내 답장'으로 표시되는 말 (버튼엔 뒤에 ▸가 붙는다)
  const BEATS = first ? [
    { msgs: [`${user.name}, 분석 끝났어.`, RESULT_STORY.yura], cards: [], end: 'continue', cont: '오 결과 보여줘' },
    { msgs: ['3위부터 천천히 보여줄게. 약한 것부터 봐야 1위가 더 선명해지거든.'], cards: ['card3'], end: 'continue', cont: '오 2위도 보여줘' },
    { msgs: ['다음은 2위. 이것도 너한테 은근 자주 나오는 패턴이야.'], cards: ['card2'], end: 'continue', cont: '헐 그럼 1위는?!' },
    { msgs: ['이제 1위인데… 이건 네가 제일 많이 반복하는 핵심이라, 여기서 잠깐 잠가둘게.'], cards: ['lock'], end: 'continue', cont: '엥, 왜 1위는 잠가둔 거야?' },
    // ── 여기서부터 랜딩(무료 프로그램) 내용을 채팅으로 풀어서 안내 ──
    { msgs: ['그 반응 나올 줄 알았어.', '근데 지금 바로 알려주면 너, 분명 대충 보고 넘길걸?', '1위는 네가 연애에서 제일 자주 반복하는 패턴이거든. 그렇게 흘려보낼 게 아니야.'], cards: [], end: 'continue', cont: '안 넘긴다니까ㅠ 빨리 알려줘' },
    { msgs: ['거봐, 벌써 안달났잖아.', '이렇게 궁금해할 때 봐야 1위가 제대로 박히거든.', '그래서 잠가둔 거야. 다 너 생각해서.'], cards: [], end: 'continue', cont: '치… 그럼 나 못 보는 거야?' },
    { msgs: ['아니, 못 보게 하려는 게 아니야.', '오히려 제대로 보여주고 싶어서 그래.', '대신 이건 따로 확인하는 방법이 있어.'], cards: [], end: 'continue', cont: '오 뭔데?' },
    { msgs: ['우리 이음나루에서 하는 무료 프로그램이 있어.', '20·30대만 신청할 수 있는 건데, 거기서 네 1위까지 깊게 분석해줘.'], cards: [], end: 'continue', cont: '더 들어볼게' },
    { msgs: ['내용도 알차. 크게 3단계야.', '① 토크쇼 — 네 연애가 왜 자꾸 같은 데서 막히는지 그 뿌리부터 짚어줘', '② 1:1 연애코치 — 너한테 맞는 관계 방향 같이 설계해줘', '③ IDT 검사지 — 네 마음이 연애에서 어떻게 작동하는지 데이터로 확인'], cards: [], end: 'continue', cont: '오 괜찮다' },
    { msgs: ['그리고 신청하면 이런 것도 같이 줘.', '애착 유형 심화 분석 · 연애 회피 패턴 체크 · 이상형 vs 실제 끌리는 유형 · 연애 준비도 점수', '꽤 많지?'], cards: [], end: 'continue', cont: '오 근데 나도 신청돼?' },
    { msgs: ['이게 아무나 받는 건 아니야.', '20·30대만, 그것도 이번 기수는 선착순 30명까지만 받고 있어.', '자리 마감되면 다음 기수까지 기다려야 해.'], cards: [], end: 'cta' },
  ] : []

  const playBeat = useCallback((i) => {
    const beat = BEATS[i]
    if (!beat) return
    setPhase(null)
    let idx = 0
    const pushCards = () => {
      if (!beat.cards.length) { after(260, () => setPhase(beat.end)); return }
      // 채팅 메시지를 읽을 시간(약 1초) 텀 → 짧게 타이핑(사진 보내는 느낌) → 결과 카드
      after(1000, () => {
        setTyping(true)
        after(650, () => {
          setTyping(false)
          beat.cards.forEach(k => setItems(m => [...m, { kind: k }]))
          after(220, () => setPhase(beat.end))
        })
      })
    }
    const step = () => {
      if (idx >= beat.msgs.length) { pushCards(); return }
      setTyping(true)
      const text = beat.msgs[idx]
      after(Math.min(1500, 520 + text.length * 20), () => {
        setTyping(false)
        setItems(m => [...m, { from: 'yura', text }])
        idx += 1
        after(340, step)
      })
    }
    step()
  }, [first]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (started.current || !first) return
    started.current = true
    after(450, () => playBeat(0))
  }, [first]) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: didFirstScroll.current ? 'smooth' : 'auto' })
    didFirstScroll.current = true
  }, [items, typing, phase])

  const onContinue = () => {
    if (phase !== 'continue') return
    const reply = BEATS[step]?.cont
    if (reply) setItems(m => [...m, { from: 'me', text: reply }])  // 내가 누른 말 → 내 답장으로 표시
    const ns = step + 1
    setStep(ns)
    setPhase(null)
    after(420, () => playBeat(ns))
  }

  const handleShare = async () => {
    const url = 'https://love-type-test.ieumnaru.co.kr/'
    const text = `나의 디엠 연애 프로파일은 '${first.name}'. 당신도 ${UNAIT.name}에게 분석받아보세요.`
    if (navigator.share) {
      try { await navigator.share({ title: '이음나루 디엠 프로파일러', text, url }) } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch {}
    }
  }

  // 유라가 대본(BEATS) 밖에서 자유 메시지를 차례로 보내는 헬퍼 (신청 분기 대화용)
  const streamYura = useCallback((lines, done) => {
    let idx = 0
    const run = () => {
      if (idx >= lines.length) { done && done(); return }
      setTyping(true)
      const text = lines[idx]
      after(Math.min(1500, 520 + text.length * 20), () => {
        setTyping(false)
        setItems(m => [...m, { from: 'yura', text }])
        idx += 1
        after(320, run)
      })
    }
    run()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 신청 질문 한 단계를 유라가 물어본 뒤 입력창/칩을 연다
  const askApplyStep = useCallback((i) => {
    const s = stepsRef.current[i]
    if (!s) return
    setEtcMode(false)
    setDraft('')
    setApplyStep(i)
    setPhase(null)
    streamYura(s.ask, () => setPhase('applying'))
  }, [streamYura]) // eslint-disable-line react-hooks/exhaustive-deps

  // 모든 단계 완료 → 시트로 접수 → 잠가뒀던 1위 공개
  const submitApply = () => {
    const d = dataRef.current
    const payload = {
      type: first.name, name: d.name, gender: d.gender, age: d.age || '',
      phone: d.phone, job: d.job, location: d.location, calltime: d.calltime, concern: d.concern, source: d.source,
    }
    try { fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(payload) }).catch(() => {}) } catch {}
    setPhase(null)
    after(700, () => {
      setTyping(true)
      after(1100, () => {
        setTyping(false)
        setItems(m => [...m, { from: 'yura', text: `${d.name}, 신청 접수됐어. 1영업일 안에 담당 코치가 연락 줄 거야.` }])
        after(500, () => streamYura(['약속대로, 잠가뒀던 네 1위 지금 풀어줄게 🔓'], () => {
          after(500, () => {
            setTyping(true)
            after(750, () => {
              setTyping(false)
              setItems(m => [...m, { kind: 'card1' }])
              after(420, () => {
                setItems(m => [...m, { from: 'yura', text: '이게 네가 연애에서 제일 자주 반복하는 핵심이야. 더 깊은 건 코치랑 직접 풀어보자.' }])
                after(300, () => setPhase('done'))
              })
            })
          })
        }))
      })
    })
  }

  // 신청 답변 저장 → 다음 질문 또는 제출
  const saveApply = (value) => {
    const list = stepsRef.current
    const s = list[applyStep]
    dataRef.current[s.key] = value
    if (s.target === 'user') store.setUser({ ...store.getUser(), [s.key]: value })
    setItems(m => [...m, { from: 'me', text: value }])
    setDraft('')
    setEtcMode(false)
    setPhase(null)
    const ni = applyStep + 1
    if (ni >= list.length) after(450, () => submitApply())
    else after(450, () => askApplyStep(ni))
  }

  // 칩 선택 ('기타'는 직접 입력으로 전환)
  const onApplyChip = (value) => {
    if (value === '기타') { setEtcMode(true); return }
    saveApply(value)
  }

  // 텍스트/전화/직접입력 전송
  const submitApplyText = () => {
    const s = stepsRef.current[applyStep]
    const v = draft.trim()
    if (!v) return
    if (s.key === 'phone' && v.replace(/[^0-9]/g, '').length < 10) return
    saveApply(v)
  }

  // 신청 분기 ─ "응, 신청할래": 먼저 이름·나이·성별을 재확인한다
  const onApplyYes = () => {
    if (phase !== 'cta') return
    setItems(m => [...m, { from: 'me', text: '응, 나 신청할래' }])
    setPhase(null)
    after(420, () => streamYura([
      '좋아. 신청 전에 네 정보부터 한 번만 확인할게.',
      `이름은 ${user.name}, ${user.age}살, ${user.gender} — 이거 맞아?`,
    ], () => setPhase('confirm')))
  }

  // 정보 확인 ─ "응, 맞아": 바로 신청 단계로
  const onConfirmYes = () => {
    if (phase !== 'confirm') return
    setItems(m => [...m, { from: 'me', text: '응, 맞아' }])
    stepsRef.current = APPLY_STEPS
    setPhase(null)
    after(420, () => streamYura(['확인했어. 그럼 바로 신청 받을게.'], () => askApplyStep(0)))
  }

  // 정보 확인 ─ "아니, 수정할게": 이름·나이·성별부터 다시 받고 이어서 신청
  const onConfirmNo = () => {
    if (phase !== 'confirm') return
    setItems(m => [...m, { from: 'me', text: '아니, 수정할게' }])
    stepsRef.current = [...EDIT_STEPS, ...APPLY_STEPS]
    setPhase(null)
    after(420, () => askApplyStep(0))
  }

  // 신청 분기 ─ "아니, 다음에": 유라가 아쉬워하며 마무리, 공유/재신청만 남긴다
  const onApplyNo = () => {
    if (phase !== 'cta') return
    setItems(m => [...m, { from: 'me', text: '아니, 다음에 할게' }])
    setPhase(null)
    after(420, () => streamYura([
      '음… 알겠어. 억지로 권하진 않을게.',
      '근데 선착순 30명이라, 마감되면 다음 기수까진 한참 기다려야 해.',
      '마음 바뀌면 언제든 다시 와. 네 1위는 내가 잠가두고 있을게.',
    ], () => setPhase('declined')))
  }

  if (!resultKeys || !user) return null

  const renderNode = (kind) => {
    if (kind === 'card3') return <RankCard rank="3위" type={third} c={c} imgSrc={imgSrc} />
    if (kind === 'card2') return <RankCard rank="2위" type={second} c={c} imgSrc={imgSrc} />
    if (kind === 'card1') return <RankCard rank="1위" type={first} c={c} imgSrc={imgSrc} />
    if (kind === 'lock') return <LockedFirst first={first} user={user} c={c} imgSrc={imgSrc} />
    return null
  }

  return (
    <div style={{ background: '#0E0816', height: '100dvh', fontFamily: FONT, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* 채팅 헤더 */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 11, padding: '14px 16px',
        borderBottom: '1px solid rgba(192,132,252,.14)', background: 'rgba(14,8,22,.92)', backdropFilter: 'blur(8px)' }}>
        <button onClick={() => navigate('/')} aria-label="처음으로"
          style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, border: '1px solid rgba(255,255,255,.12)',
            background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.7)', fontSize: 17, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>←</button>
        <Avatar size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, color: '#fff', fontWeight: 800 }}>{UNAIT.name}</div>
          <div style={{ fontSize: 11, color: c.accent, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80' }} />
            {UNAIT.title} · 분석 완료
          </div>
        </div>
      </div>

      {/* 메시지 + 결과 카드 영역 */}
      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        padding: '18px 16px 12px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        {items.map((it, i) => (
          it.kind ? (
            <div key={i}>{renderNode(it.kind)}</div>
          ) : it.from === 'me' ? (
            <div key={i} className={i >= initialCount.current ? 'fade-in' : undefined} style={{ alignSelf: 'flex-end', maxWidth: '82%' }}>
              <div style={{ padding: '12px 16px', borderRadius: '16px 4px 16px 16px',
                background: `linear-gradient(135deg, ${PURPLE}, ${LILAC})`, color: '#fff',
                fontSize: 15, lineHeight: 1.6, fontWeight: 600, boxShadow: '0 6px 18px rgba(155,93,229,.3)' }}>
                {it.text}
              </div>
            </div>
          ) : (
            <div key={i} className={i >= initialCount.current ? 'fade-in' : undefined} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '88%' }}>
              <Avatar />
              <div style={{ padding: it.soft ? '10px 14px' : '12px 15px', borderRadius: '4px 16px 16px 16px',
                background: it.soft ? 'rgba(192,132,252,.1)' : 'rgba(255,255,255,.08)',
                border: '1px solid rgba(192,132,252,.22)',
                color: it.soft ? 'rgba(255,255,255,.72)' : '#F3E8FF',
                fontSize: it.soft ? 13.5 : 15, lineHeight: 1.6, fontWeight: 600 }}>
                {it.soft ? `"${it.text}"` : it.text}
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

      {/* 하단: 다음 ▸ / 공유·신청 CTA */}
      <div style={{ flexShrink: 0, padding: '12px 16px 20px', borderTop: '1px solid rgba(255,255,255,.07)', background: '#0E0816' }}>
        {phase === 'continue' && (
          <button onClick={onContinue} style={{
            width: '100%', border: `1.5px solid ${c.accent}88`, background: 'rgba(192,132,252,.12)', color: '#fff',
            borderRadius: 16, padding: '15px', fontSize: 15.5, fontWeight: 800, cursor: 'pointer', fontFamily: FONT,
          }}>
            {(BEATS[step]?.cont || '다음') + ' ▸'}
          </button>
        )}

        {phase === 'cta' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(255,255,255,.5)', margin: '0 0 2px', lineHeight: 1.6 }}>
              <b style={{ color: c.accent }}>선착순 30명</b> · 신청하면 네 <b style={{ color: c.accent }}>1위</b>까지 다 풀어줄게 💜
            </p>
            <button onClick={onApplyYes} style={{
              width: '100%', border: 'none', background: `linear-gradient(135deg, ${c.chip}, ${LILAC})`, color: '#fff',
              borderRadius: 16, padding: '16px', fontSize: 16.5, fontWeight: 900, cursor: 'pointer', fontFamily: FONT,
              boxShadow: `0 14px 34px ${c.chip}55`,
            }}>
              응, 나 신청할래
            </button>
            <button onClick={onApplyNo} style={{
              width: '100%', border: `1.5px solid ${c.accent}66`, background: 'rgba(192,132,252,.08)', color: 'rgba(255,255,255,.7)',
              borderRadius: 16, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: FONT,
            }}>
              아니, 다음에 할게
            </button>
          </div>
        )}

        {phase === 'declined' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => setPhase('cta')} style={{
              width: '100%', border: 'none', background: `linear-gradient(135deg, ${c.chip}, ${LILAC})`, color: '#fff',
              borderRadius: 16, padding: '16px', fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: FONT,
              boxShadow: `0 14px 34px ${c.chip}55`,
            }}>
              역시 신청할래
            </button>
            <button onClick={handleShare} style={{
              width: '100%', border: `1.5px solid ${c.accent}66`, background: 'rgba(192,132,252,.08)', color: '#fff',
              borderRadius: 16, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: FONT,
            }}>
              {copied ? '링크 복사 완료' : '결과 공유하기'}
            </button>
          </div>
        )}

        {phase === 'confirm' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={onConfirmYes} style={{
              width: '100%', border: 'none', background: `linear-gradient(135deg, ${c.chip}, ${LILAC})`, color: '#fff',
              borderRadius: 16, padding: '16px', fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: FONT,
              boxShadow: `0 14px 34px ${c.chip}55`,
            }}>
              응, 맞아
            </button>
            <button onClick={onConfirmNo} style={{
              width: '100%', border: `1.5px solid ${c.accent}66`, background: 'rgba(192,132,252,.08)', color: 'rgba(255,255,255,.7)',
              borderRadius: 16, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: FONT,
            }}>
              아니, 수정할게
            </button>
          </div>
        )}

        {phase === 'applying' && (() => {
          const s = stepsRef.current[applyStep]
          if (s.type === 'chips' && !etcMode) {
            return (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                {s.options.map(op => (
                  <button key={op} onClick={() => onApplyChip(op)} style={{
                    flex: s.options.length > 3 ? '1 1 28%' : 1, minWidth: 0,
                    padding: '13px 12px', borderRadius: 14, cursor: 'pointer', fontFamily: FONT,
                    border: `1.5px solid ${c.accent}55`, background: 'rgba(192,132,252,.1)',
                    color: '#fff', fontSize: 14, fontWeight: 700,
                  }}>{op}</button>
                ))}
              </div>
            )
          }
          const isPhone = s.key === 'phone'
          const ok = isPhone ? draft.replace(/[^0-9]/g, '').length >= 10 : draft.trim().length > 0
          return (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input autoFocus value={draft} inputMode={s.type === 'tel' ? 'numeric' : 'text'}
                maxLength={isPhone ? 13 : undefined}
                placeholder={etcMode ? '직접 입력해줘' : s.placeholder}
                onChange={e => setDraft(isPhone ? fmtPhone(e.target.value) : e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitApplyText() }}
                style={{ flex: 1, padding: '14px 16px', fontSize: 16, fontFamily: FONT,
                  border: `1.5px solid ${c.accent}55`, borderRadius: 22,
                  background: 'rgba(255,255,255,.07)', color: '#fff', outline: 'none' }} />
              <button onClick={submitApplyText} aria-label="보내기" style={{
                width: 46, height: 46, flexShrink: 0, borderRadius: '50%', border: 'none',
                cursor: ok ? 'pointer' : 'default',
                background: ok ? `linear-gradient(135deg, ${c.chip}, ${LILAC})` : 'rgba(255,255,255,.1)',
                color: ok ? '#fff' : 'rgba(255,255,255,.3)', fontSize: 19, fontWeight: 800 }}>↑</button>
            </div>
          )
        })()}

        {phase === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={handleShare} style={{
              width: '100%', border: 'none', background: `linear-gradient(135deg, ${c.chip}, ${LILAC})`, color: '#fff',
              borderRadius: 16, padding: '15px', fontSize: 15.5, fontWeight: 900, cursor: 'pointer', fontFamily: FONT,
              boxShadow: `0 14px 34px ${c.chip}55`,
            }}>
              {copied ? '링크 복사 완료' : '결과 공유하기'}
            </button>
            <button onClick={() => navigate('/')} style={{
              width: '100%', border: `1.5px solid ${c.accent}66`, background: 'rgba(192,132,252,.08)', color: 'rgba(255,255,255,.7)',
              borderRadius: 16, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: FONT,
            }}>
              처음으로
            </button>
          </div>
        )}

        {phase === null && (
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
