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
  { key: 'name', target: 'user', type: 'text', ask: ['그럼 다시 알려줘. 이름이 어떻게 돼?'], placeholder: '이름' },
  { key: 'age', target: 'user', type: 'tel', ask: ['나이는 몇 살이야?'], placeholder: '예) 24' },
  { key: 'gender', target: 'user', type: 'chips', ask: ['성별도 알려줄 수 있어?'], options: ['여자', '남자'] },
]

// 대화로 받는 신청 단계
const APPLY_STEPS = [
  { key: 'phone', type: 'tel',
    ask: ['연락받을 번호 하나만 남겨줄 수 있어?'],
    placeholder: '010-0000-0000' },
  { key: 'job', type: 'chips',
    ask: ['고마워 :) 지금 어떻게 지내고 있어?'],
    options: ['대학생', '직장인', '취준생', '프리랜서', '기타'] },
  { key: 'location', type: 'text',
    ask: ['어디 살아? 지점 안내할 때 필요하거든.'],
    placeholder: '예) 서울 마포구' },
  { key: 'calltime', type: 'chips',
    ask: ['연락받기 편한 시간대가 언제야?'],
    options: ['평일 오전 (10~12시)', '평일 오후 (13~18시)', '평일 저녁 (18~19시)', '주말 (예약제)'] },
  { key: 'concern', type: 'text',
    ask: ['마지막으로 하나만 더.', '연애에서 요즘 제일 고민인 게 뭐야? 편하게 적어줘.'],
    placeholder: '편하게 적어줘' },
  { key: 'source', type: 'chips',
    ask: ['참, 나 어떻게 알고 왔어?'],
    options: ['인스타', '카카오톡', '친구·지인', '블로그'] },
]

const REVIEWS = [
  { name: '박지윤 (25)', text: '진짜 소름 돋았어요…ㅠㅠ 저 원래 이런 거 잘 안 믿는데 결과 딱 보는 순간 "이거 나잖아" 했거든요. 친구한테 바로 보냈더니 친구도 "너 완전 이거다"라고 ㅋㅋㅋ 신기해서 주변에 다 돌렸어요.' },
  { name: '최준혁 (27)', text: '남자라서 연애 테스트 같은 거 별로 안 좋아하는데 심심해서 해봤거든요. 근데 생각보다 진지하게 읽게 됐어요. 제가 왜 연락을 먼저 안 하게 되는지 딱 나와있는데 살짝 찔렸습니다 ㅋㅋ' },
  { name: '한소희 (23)', text: '결과 읽다가 중간에 멈췄어요. 너무 맞아서 좀 무서웠거든요ㅋㅋㅋ 특히 약점 부분이 제 전 연애 얘기 같아서… 친구랑 같이 하면서 서로 결과 보여줬는데 얘기가 엄청 길어졌어요.' },
  { name: '정도현 (28)', text: '처음엔 가볍게 했는데 결과 보고 나서 혼자 꽤 오래 생각했어요. 제 연애 패턴이 이렇게 딱 정리되는 게 신기했고, 읽으면서 "아 맞아 나 이랬지" 하는 순간이 계속 나왔어요.' },
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

function RankCard({ type, c, imgSrc }) {
  return (
    <div className="fade-in" style={{ alignSelf: 'stretch', borderRadius: 18, overflow: 'hidden',
      background: 'rgba(255,255,255,.065)', border: '1px solid rgba(255,255,255,.10)', boxShadow: '0 14px 34px rgba(0,0,0,.18)' }}>
      {/* 이미지 */}
      <div style={{ position: 'relative', background: '#160C24', lineHeight: 0 }}>
        <img src={imgSrc(type.key)} alt={type.name} style={{ width: '100%', height: 'auto', display: 'block' }}
          onError={e => { const w = e.target.parentElement; if (w) w.style.display = 'none' }} />
        <div style={{ position: 'absolute', top: 12, left: 12, padding: '7px 13px', borderRadius: 999,
          background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', border: `1px solid ${c.accent}66`,
          color: '#fff', fontSize: 12, fontWeight: 900, letterSpacing: '1px' }}>
          나의 연애 프로파일
        </div>
      </div>

      {/* 분석 내용 */}
      <div style={{ padding: '20px 18px 20px' }}>
        <h2 style={{ fontSize: 24, color: '#fff', fontWeight: 900, lineHeight: 1.3, margin: '0 0 5px' }}>{type.name}</h2>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.56)', lineHeight: 1.5, margin: '0 0 18px', fontWeight: 700 }}>{type.tagline}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 핵심 성향 */}
          <div>
            <div style={{ fontSize: 11, color: c.accent, fontWeight: 900, letterSpacing: '1.4px', marginBottom: 8 }}>핵심 성향</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.74)', lineHeight: 1.85, margin: 0 }}>{type.core}</p>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,.08)' }} />

          {/* 치명적인 약점 */}
          <div>
            <div style={{ fontSize: 11, color: '#F07BB8', fontWeight: 900, letterSpacing: '1.4px', marginBottom: 8 }}>치명적인 약점</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.72)', lineHeight: 1.85, margin: 0 }}>{type.weakness}</p>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,.08)' }} />

          {/* 연애 조언 */}
          <div>
            <div style={{ fontSize: 11, color: c.accent, fontWeight: 900, letterSpacing: '1.4px', marginBottom: 8 }}>연애 조언</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.74)', lineHeight: 1.85, margin: 0 }}>{type.advice}</p>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,.08)' }} />

          {/* 연애 패턴 체크 */}
          {type.traits && type.traits.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: c.accent, fontWeight: 900, letterSpacing: '1.4px', marginBottom: 10 }}>이런 적 있지 않아?</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {type.traits.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                      background: `${c.accent}22`, border: `1px solid ${c.accent}55`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: c.accent, fontWeight: 900 }}>✓</span>
                    <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,.72)', lineHeight: 1.6 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ height: 1, background: 'rgba(255,255,255,.08)' }} />

          {/* 잘 맞는 / 위험한 유형 */}
          <div style={{ display: 'flex', gap: 10 }}>
            <FitCard label="잘 맞는 유형" value={type.match} />
            <FitCard label="위험한 유형" value={type.danger} danger />
          </div>

          {/* 유라의 한 줄 경고 */}
          {type.trap && (
            <div style={{ padding: '13px 15px', borderRadius: 13,
              background: 'rgba(0,0,0,.25)', border: `1px solid ${c.accent}33` }}>
              <div style={{ fontSize: 10.5, color: c.accent, fontWeight: 900, letterSpacing: '1.3px', marginBottom: 7 }}>유라의 한 줄</div>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.68)', lineHeight: 1.75, margin: 0, fontStyle: 'italic' }}>
                "{type.trap}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReviewCard({ c }) {
  return (
    <div className="fade-in" style={{ alignSelf: 'stretch', borderRadius: 16, overflow: 'hidden',
      background: 'rgba(255,255,255,.055)', border: '1px solid rgba(255,255,255,.10)' }}>
      <div style={{ padding: '16px 16px 14px' }}>
        <div style={{ fontSize: 11, color: c.accent, fontWeight: 900, letterSpacing: '1.3px', marginBottom: 13 }}>
          실제 후기
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {REVIEWS.map((r, i) => (
            <div key={i} style={{ padding: '12px 13px', borderRadius: 12,
              background: 'rgba(0,0,0,.2)', border: '1px solid rgba(255,255,255,.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.9)', fontWeight: 800 }}>{r.name}</span>
                <span style={{ fontSize: 12, color: '#FBBF24', letterSpacing: 1 }}>★★★★★</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1.65, margin: 0 }}>{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PromoCard({ c }) {
  return (
    <div className="fade-in" style={{ alignSelf: 'stretch', borderRadius: 18, overflow: 'hidden',
      background: `linear-gradient(160deg, rgba(155,93,229,.18), rgba(192,132,252,.08))`,
      border: `1px solid ${c.accent}44`, boxShadow: '0 14px 34px rgba(0,0,0,.2)' }}>
      <div style={{ padding: '22px 18px 20px' }}>
        {/* 배지 */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999,
          background: `${c.accent}22`, border: `1px solid ${c.accent}55`, marginBottom: 14 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px #4ADE80' }} />
          <span style={{ fontSize: 11, color: c.accent, fontWeight: 900, letterSpacing: '1.2px' }}>이음나루 무료 프로그램</span>
        </div>

        <h2 style={{ fontSize: 20, color: '#fff', fontWeight: 900, lineHeight: 1.4, margin: '0 0 10px' }}>
          연애 패턴, 이제 진짜로 바꿔볼 준비 됐어?
        </h2>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.65)', lineHeight: 1.75, margin: '0 0 18px' }}>
          테스트 결과는 시작일 뿐이야. 이음나루에서는 네 패턴이 왜 반복되는지 뿌리부터 짚어주고, 실제 관계에서 어떻게 달라질 수 있는지 함께 설계해줘.
        </p>

        {/* 프로그램 3단계 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          {[
            { step: '01', title: '토크쇼', desc: '같은 패턴이 반복되는 이유, 뿌리부터 짚어줘' },
            { step: '02', title: '1:1 연애코치', desc: '너한테 맞는 관계 방향을 코치와 직접 설계' },
            { step: '03', title: 'IDT 검사지', desc: '내 마음이 연애에서 어떻게 작동하는지 데이터로 확인' },
          ].map(({ step, title, desc }) => (
            <div key={step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start',
              padding: '12px 13px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: c.accent, letterSpacing: '1px',
                padding: '3px 7px', borderRadius: 6, background: `${c.accent}22`, flexShrink: 0, marginTop: 1 }}>{step}</span>
              <div>
                <div style={{ fontSize: 13.5, color: '#fff', fontWeight: 800, marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.55)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 추가 혜택 */}
        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(0,0,0,.2)', marginBottom: 18,
          border: '1px solid rgba(255,255,255,.07)' }}>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.45)', fontWeight: 900, letterSpacing: '1.2px', marginBottom: 8 }}>신청하면 같이 줘</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['애착 유형 심화 분석', '연애 회피 패턴 체크', '이상형 vs 실제 끌리는 유형', '연애 준비도 점수'].map(item => (
              <span key={item} style={{ fontSize: 11.5, color: 'rgba(255,255,255,.65)', padding: '4px 9px',
                borderRadius: 99, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)' }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* 선착순 안내 */}
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', textAlign: 'center', margin: '0 0 14px', lineHeight: 1.6 }}>
          20·30대 한정 · <span style={{ color: c.accent, fontWeight: 900 }}>선착순 30명</span> · 무료
        </p>

        {/* CTA 버튼 */}
        <a href="https://ieumnaru.co.kr/ieumnaru-detail" target="_blank" rel="noopener noreferrer"
          style={{ display: 'block', width: '100%', padding: '16px 0', borderRadius: 14, textAlign: 'center',
            background: `linear-gradient(135deg, ${PURPLE}, ${LILAC})`, color: '#fff',
            fontSize: 16, fontWeight: 900, textDecoration: 'none', boxShadow: `0 10px 28px rgba(155,93,229,.4)`,
            fontFamily: 'inherit' }}>
          이음나루 무료 프로그램 자세히 보기 →
        </a>
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

  // 결과는 신청 후에만 공개하는 대본
  const BEATS = first ? [
    { msgs: [`${user.name}, 분석 다 됐어 :)`, RESULT_STORY.yura], cards: [], end: 'continue', cont: '오, 결과 보여줘!' },
    { msgs: ['연애테스트 하러 왔지만,', '사실 연애하기 전에 요즘 필수로 하는 것이 있어.'], cards: [], end: 'continue', cont: '오 뭔데?' },
    { msgs: ['요즘 내가 직접 개발한 테스트지가 있는데,'], cards: ['review'], end: 'continue', cont: 'ㅋㅋ 진짜 핫하다' },
    { msgs: ['크게 세 가지인데,', '① 토크쇼 — 왜 같은 패턴이 반복되는지 뿌리부터 같이 봐줘', '② 1:1 연애코치 — 나한테 맞는 연애 방향을 코치가 직접 설계해줘', '③ IDT 검사지 — 내 마음이 연애에서 어떻게 움직이는지 데이터로 확인할 수 있어'], cards: [], end: 'continue', cont: '나도 신청할 수 있어?' },
    { msgs: ['이번 기수는 자리가 많지 않아서 선착순 30명만 받고 있거든.', '신청하면 지금 바로 결과 다 볼 수 있어.'], cards: [], end: 'cta' },
  ] : []

  const playBeat = useCallback((i) => {
    const beat = BEATS[i]
    if (!beat) return
    setPhase(null)
    let idx = 0
    const pushCards = () => {
      if (!beat.cards || !beat.cards.length) { after(150, () => setPhase(beat.end)); return }
      after(400, () => {
        setTyping(true)
        after(500, () => {
          setTyping(false)
          beat.cards.forEach(k => setItems(m => [...m, { kind: k }]))
          after(300, () => setPhase(beat.end))
        })
      })
    }
    const step = () => {
      if (idx >= beat.msgs.length) { pushCards(); return }
      setTyping(true)
      const text = beat.msgs[idx]
      after(Math.min(800, 300 + text.length * 10), () => {
        setTyping(false)
        setItems(m => [...m, { from: 'yura', text }])
        idx += 1
        after(170, step)
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
    if (reply) setItems(m => [...m, { from: 'me', text: reply }])
    const ns = step + 1
    setStep(ns)
    setPhase(null)
    after(220, () => playBeat(ns))
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
      after(Math.min(800, 300 + text.length * 10), () => {
        setTyping(false)
        setItems(m => [...m, { from: 'yura', text }])
        idx += 1
        after(160, run)
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

  // 모든 단계 완료 → 시트로 접수 → 결과 전체 공개 (1위·2위·3위)
  const submitApply = () => {
    const d = dataRef.current
    const payload = {
      type: first.name, name: d.name, gender: d.gender, age: d.age || '',
      phone: d.phone, job: d.job, location: d.location, calltime: d.calltime, concern: d.concern, source: d.source,
    }
    try { fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(payload) }).catch(() => {}) } catch {}
    setPhase(null)
    after(400, () => {
      setTyping(true)
      after(700, () => {
        setTyping(false)
        setItems(m => [...m, { from: 'yura', text: `${d.name}, 신청 잘 받았어 :) 1영업일 안에 담당 코치가 연락드릴 거야.` }])
        after(300, () => streamYura(['약속대로 결과 바로 보여줄게 🔓'], () => {
          after(300, () => {
            setTyping(true)
            after(600, () => {
              setTyping(false)
              setItems(m => [...m, { kind: 'card1' }])
              after(400, () => {
                setItems(m => [...m, { from: 'yura', text: '지금 가장 강하게 나온 연애 패턴이야. 더 깊은 분석은 아래 프로그램에서 확인해봐.' }])
                after(300, () => {
                  setItems(m => [...m, { kind: 'promo' }])
                  after(250, () => setPhase('done'))
                })
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
    after(220, () => streamYura([
      '좋아 :) 신청 전에 정보 한 번만 확인할게.',
      `이름은 ${user.name}, ${user.age}살, ${user.gender} — 맞지?`,
    ], () => setPhase('confirm')))
  }

  // 정보 확인 ─ "응, 맞아": 바로 신청 단계로
  const onConfirmYes = () => {
    if (phase !== 'confirm') return
    setItems(m => [...m, { from: 'me', text: '응, 맞아' }])
    stepsRef.current = APPLY_STEPS
    setPhase(null)
    after(220, () => streamYura(['확인했어, 그럼 바로 시작할게!'], () => askApplyStep(0)))
  }

  // 정보 확인 ─ "아니, 수정할게": 이름·나이·성별부터 다시 받고 이어서 신청
  const onConfirmNo = () => {
    if (phase !== 'confirm') return
    setItems(m => [...m, { from: 'me', text: '아니, 수정할게' }])
    stepsRef.current = [...EDIT_STEPS, ...APPLY_STEPS]
    setPhase(null)
    after(220, () => askApplyStep(0))
  }

  // 신청 분기 ─ "아니, 다음에": 유라가 아쉬워하며 마무리, 공유/재신청만 남긴다
  const onApplyNo = () => {
    if (phase !== 'cta') return
    setItems(m => [...m, { from: 'me', text: '아니, 다음에 할게' }])
    setPhase(null)
    after(420, () => streamYura([
      '알겠어, 억지로 권하진 않을게.',
      '근데 선착순 30명이라 자리 없어지면 다음 기수까지 기다려야 할 수 있어.',
      '마음 바뀌면 언제든 다시 와. 결과는 여기 남아 있을게.',
    ], () => setPhase('declined')))
  }

  if (!resultKeys || !user) return null

  const renderNode = (kind) => {
    if (kind === 'card1') return <RankCard type={first} c={c} imgSrc={imgSrc} />
    if (kind === 'promo') return <PromoCard c={c} />
    if (kind === 'review') return <ReviewCard c={c} />
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
