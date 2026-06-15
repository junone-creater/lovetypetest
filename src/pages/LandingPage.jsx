import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import './LandingPage.css'

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyjqcPPG9Xh5eIYNng0W29NscxfKR1JzcBsB0mIM9F9vGsH6It3YIHmu0lIGJMS/exec'

// ── 마감 카운트다운 ──────────────────────────────────
const DEADLINE_LABEL = '6월 13일'        // 화면 표기용 마감일
const DEADLINE_DATE  = [2026, 5, 13]     // 실제 마감일 [년, 월(0-base), 일]
function getDDay() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dl = new Date(DEADLINE_DATE[0], DEADLINE_DATE[1], DEADLINE_DATE[2])
  return Math.max(0, Math.round((dl - today) / 86400000))
}

// ── 신청자 수 카운터 설정 ──────────────────────────
const COUNT_FROM_SHEET = true     // Apps Script에서 실제 누적 신청수 받아오기 (doGet에 action===count 분기 추가 필요)
const APPLICANT_BASE   = 893      // 실제 누적 수에 더해 보여줄 값 (표출 = 실제 + 893)
const COUNT_CACHE_KEY  = 'lp_applicant_count'  // 마지막으로 받아온 실제 count 캐시 (재방문 시 즉시 표시)
// 빌드(배포) 시점에 시트에서 미리 받아와 vite가 주입한 값 → 접속 첫 화면부터 숫자 보유 (없으면 0)
// eslint-disable-next-line no-undef
const BUILD_COUNT = typeof __BUILD_APPLICANT_COUNT__ === 'number' ? __BUILD_APPLICANT_COUNT__ : 0

function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect() } }, { threshold: .15 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return [ref, visible]
}

function Reveal({ children, delay = 0 }) {
  const [ref, visible] = useReveal()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(28px)',
      transition: `opacity .7s ${delay}s, transform .7s ${delay}s` }}>
      {children}
    </div>
  )
}

// ── 메인 ──────────────────────────────────────────
export default function LandingPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const urlName   = decodeURIComponent(params.get('name')   || '')
  const urlGender = decodeURIComponent(params.get('gender') || '')
  const urlType   = decodeURIComponent(params.get('type')   || '')

  // 누적 신청수 초기값: 1) 직전 방문 캐시 → 2) 빌드 시점 박제값 → 둘 다 없으면 null(숨김).
  // 빌드 박제값 덕분에 첫 방문이라도 접속 즉시 숫자가 자리에 있음 (늦게 등장/레이아웃 점프 없음).
  // 이후 아래 useEffect가 런타임 실시간 값으로 갱신.
  const [applicants, setApplicants] = useState(() => {
    try {
      const c = Number(localStorage.getItem(COUNT_CACHE_KEY))
      if (Number.isFinite(c) && c > 0) return c + APPLICANT_BASE
    } catch {}
    return BUILD_COUNT > 0 ? BUILD_COUNT + APPLICANT_BASE : null
  })
  useEffect(() => {
    if (!COUNT_FROM_SHEET) return
    const cb = '__lpCount_' + Math.floor(Math.random() * 1e6)
    let s
    const cleanup = () => { try { delete window[cb] } catch {} ; try { s && s.remove() } catch {} }
    window[cb] = (data) => {
      if (data && typeof data.count === 'number') {
        try { localStorage.setItem(COUNT_CACHE_KEY, String(data.count)) } catch {}
        setApplicants(data.count + APPLICANT_BASE)
      }
      cleanup()
    }
    s = document.createElement('script')
    s.src = `${SHEET_URL}?action=count&callback=${cb}`
    s.onerror = cleanup
    document.head.appendChild(s)
    const t = setTimeout(cleanup, 8000)
    return () => { clearTimeout(t); cleanup() }
  }, [])

  // 값이 정해지면 숫자가 부드럽게 올라가는 카운트업 (실시간 집계 느낌)
  const [display, setDisplay] = useState(applicants)
  useEffect(() => {
    if (applicants == null) { setDisplay(null); return }
    const from = display == null ? Math.max(APPLICANT_BASE, applicants - 60) : display
    if (from === applicants) { setDisplay(applicants); return }
    let raf, t0
    const tick = (now) => {
      if (t0 == null) t0 = now
      const p = Math.min(1, (now - t0) / 900)
      const eased = 1 - Math.pow(1 - p, 3)  // easeOutCubic
      setDisplay(Math.round(from + (applicants - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [applicants])  // eslint-disable-line react-hooks/exhaustive-deps

  const goApply = (e) => {
    e.preventDefault()
    navigate(`/apply?type=${encodeURIComponent(urlType)}&name=${encodeURIComponent(urlName)}&gender=${encodeURIComponent(urlGender)}`)
  }

  const dday = getDDay()

  return (
    <div className="lp-root">
      <div className="lp-grain"/>

      {/* 마감 압박 고정 바 */}
      <div className="lp-topbar">
        <span className="lp-topbar-fire">🔥</span>
        <span><b>{DEADLINE_LABEL} 마감</b> <span className="lp-topbar-dday">{dday === 0 ? '오늘 마감' : `D-${dday}`}</span></span>
        <span className="lp-topbar-div">·</span>
        <span className="lp-topbar-soft">30명 한정, 조기 마감될 수 있어요</span>
      </div>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-wrap">
          <span className="lp-badge"><span className="lp-dot"/>이음나루 인지심리연구소 · 20·30대 무료 프로그램</span>
          {display != null && (
            <div className="lp-live"><span className="lp-live-dot"/>지금까지 <b>{display.toLocaleString()}명</b>이 무료 프로그램을 신청했어요</div>
          )}
          <h1 className="lp-h1">
            <span className="lp-line lp-l1">연애만 하면 작아지던 내가,</span>{' '}
            <span className="lp-line lp-l2"><span className="lp-em">편해진</span> 이유</span>
          </h1>
          <p className="lp-sub">
            연락 한 번에 마음이 흔들리고, 늘 같은 이유로 끝나던 연애<br/>
            <b>편해진 건 성격을 바꿔서가 아니었어요.</b>
          </p>
          <div className="lp-scroll">
            <span>그 이유 보기</span>
            <span className="lp-arrow"/>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="lp-story">
        <div className="lp-wrap">
          <Reveal><p className="lp-eyebrow">혹시, 이런 적 있나요?</p></Reveal>
          <Reveal delay={.08}><h2 className="lp-h2">문제는 당신의 성격이 아니라,{' '}<span className="lp-accent">아직 모르고 있던 '마음의 패턴'</span>이에요.</h2></Reveal>
          <div className="lp-pains">
            {[
              '좋아하는 사람 앞에서는 이상하게 <b>말도 행동도 부자연스러워져요.</b>',
              '연락이 조금만 늦어도 <b>\'내가 뭘 잘못했나\' 하고 곱씹어요.</b>',
              '사람은 매번 다른데, <b>헤어지는 이유는 늘 비슷하게 반복돼요.</b>',
            ].map((txt, i) => (
              <Reveal key={i} delay={i * .08}>
                <div className="lp-pain"><span className="lp-q">"</span><span dangerouslySetInnerHTML={{ __html: txt }}/></div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="lp-pivot">
              <p className="lp-ptag">◆ 우리가 발견한 것</p>
              <p>같은 연애여도 누구는 편하고 누구는 힘든 이유. 그건 의지가 아니라 <span className="lp-hl">내 안의 심리 구조</span> 때문이에요. 구조를 알면, 관계는 <span className="lp-hl">노력 없이도</span> 편해져요.</p>
            </div>
          </Reveal>
          <Reveal><p className="lp-eyebrow" style={{ marginTop:8 }}>먼저 경험한 사람들</p></Reveal>
          {[
            { txt:'내가 왜 연애만 하면 불안해지는지 처음 알았어요. 이유를 아니까 신기하게 덜 흔들려요.', who:'대학교 3학년 · 지윤님', av:'지' },
            { txt:'"내가 예민한 게 아니었구나" 하고 나니까, 관계에서 오던 피로가 확 줄었어요.', who:'대학교 4학년 · 현우님', av:'현' },
          ].map((v, i) => (
            <Reveal key={i} delay={i * .1}>
              <div className="lp-voice">
                <div className="lp-quote">"</div>
                <p>{v.txt}</p>
                <div className="lp-who"><div className="lp-av">{v.av}</div>{v.who}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* OFFER */}
      <section className="lp-offer">
        <div className="lp-wrap">
          <Reveal><h2 className="lp-offer-h2">나의 연애 패턴을 <span className="lp-accent">3단계</span>로 풀어내는 시간</h2></Reveal>
          <Reveal delay={.08}><p className="lp-offer-lead">이음나루 <b>3코어 매직</b> · 20·30대를 위한 프로그램</p></Reveal>
          {[
            { n:'1', title:'강연', sub:'90분', desc:'내 연애와 관계의 패턴, 그 심리 구조를 이해하는 시간. 왜 늘 같은 지점에서 힘들었는지 그 뿌리를 짚어요.' },
            { n:'2', title:'1:1 심리코칭', sub:'맞춤', desc:'나에게 맞는 관계 방향을 함께 설계해요. 혼자 끙끙대지 않고, 전문가와 같이 길을 찾아요.' },
            { n:'3', title:'IDT 검사 체험', sub:'10분', desc:'이음나루가 직접 개발한 인지구조 패턴 검사. 내 마음이 관계에서 어떻게 작동하는지 데이터로 확인해요.' },
          ].map((c, i) => (
            <Reveal key={i} delay={i * .1}>
              <div className="lp-core">
                <div className="lp-cnum">{c.n}</div>
                <div><h4>{c.title} <span>{c.sub}</span></h4><p>{c.desc}</p></div>
              </div>
            </Reveal>
          ))}
          <Reveal>
            <div className="lp-give">
              <p className="lp-give-tag">✦ 신청하시면 이걸 드려요</p>
              <ul className="lp-give-list">
                {[
                  '애착 유형 심화 분석',
                  '연애 회피 패턴 체크',
                  '이상형 vs 실제 끌리는 유형 비교',
                  '연애 준비도 점수',
                ].map((t, i) => (
                  <li key={i}><span className="lp-give-check">✓</span>{t}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal>
            <div className="lp-trust">
              {[['9유형','정밀 심리 분석'],['1:1','맞춤 코칭'],['100%','무료 참여']].map(([big,lbl]) => (
                <div key={big} className="lp-trust-item"><div className="lp-big">{big}</div><div className="lp-lbl">{lbl}</div></div>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <div className="lp-price">
              <div className="lp-old">정가 380,000원</div>
              <div className="lp-free">0원</div>
              <div className="lp-pnote"><b>20·30대 대상 취업창업지원금</b>으로 전액 지원돼요</div>
            </div>
          </Reveal>
          <Reveal>
            <div style={{ position:'sticky', bottom:0 }}>
              <a href="/apply" onClick={goApply} className="lp-cta">무료 신청하고 연애 유형 1순위 확인하기</a>
              <p className="lp-cta-sub">이번 기수 <b>30명 한정</b> · <b>{DEADLINE_LABEL} 마감(조기 마감 가능)</b> · 신청 후 1영업일 내 안심번호로 연락</p>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="lp-footer">
        이음나루 인지심리연구소{' '}<b>사람과 사람을 잇는 마음의 나루터</b>
      </footer>
    </div>
  )
}
