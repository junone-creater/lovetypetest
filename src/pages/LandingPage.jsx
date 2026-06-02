import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import './LandingPage.css'

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyjqcPPG9Xh5eIYNng0W29NscxfKR1JzcBsB0mIM9F9vGsH6It3YIHmu0lIGJMS/exec'
const FONT = "'Pretendard', -apple-system, sans-serif"
const TOTAL = 5

function fmtPhone(v) {
  const n = v.replace(/[^0-9]/g, '').slice(0, 11)
  if (n.length < 4) return n
  if (n.length < 8) return `${n.slice(0,3)}-${n.slice(3)}`
  return `${n.slice(0,3)}-${n.slice(3,7)}-${n.slice(7)}`
}

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

// ── 신청 폼 ──────────────────────────────────────────
function ApplyForm({ urlName, urlGender, urlType }) {
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [fd, setFd] = useState({ phone:'', age:'', job:'', location:'', calltime:'', concern:'' })

  const canNext = {
    1: fd.phone.replace(/[^0-9]/g, '').length >= 10,
    2: fd.age.trim() && fd.job.trim(),
    3: fd.location.trim().length >= 2,
    4: fd.calltime !== '',
    5: fd.concern.trim().length >= 5,
  }

  const goStep = (n) => { setStep(n); setTimeout(() => document.getElementById('form-top')?.scrollIntoView({ behavior:'smooth', block:'nearest' }), 50) }

  const submit = () => {
    const data = { name:urlName, gender:urlGender, type:urlType, ...fd }
    try {
      fetch(SHEET_URL, { method:'POST', mode:'no-cors', body: new URLSearchParams(data) }).catch(() => {})
    } catch {}
    // GET 폴백 (JSONP)
    try {
      const s = document.createElement('script')
      s.src = SHEET_URL + '?' + new URLSearchParams(data).toString()
      document.head.appendChild(s)
      setTimeout(() => { try { s.parentNode?.removeChild(s) } catch {} }, 8000)
    } catch {}
    setDone(true)
  }

  const dots = Array.from({ length: TOTAL }, (_, i) => (
    <div key={i} style={{ height:5, borderRadius:3, transition:'all .3s',
      background: i + 1 < step ? '#6B3FA0' : i + 1 === step ? '#C084FC' : 'rgba(255,255,255,.15)',
      width: i + 1 === step ? 22 : 6 }}/>
  ))

  const inputStyle = { width:'100%', padding:'17px 18px', fontSize:16, fontFamily:FONT,
    background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(255,255,255,.12)',
    borderRadius:14, color:'#F3E8FF', outline:'none', WebkitAppearance:'none' }

  const btnStyle = (active) => ({
    width:'100%', marginTop:28, padding:18, borderRadius:14, border:'none',
    background: active ? 'linear-gradient(135deg,#9B5DE5,#C084FC)' : 'rgba(255,255,255,.1)',
    color: active ? '#fff' : 'rgba(255,255,255,.3)',
    fontSize:17, fontWeight:800, cursor: active ? 'pointer' : 'not-allowed',
    fontFamily:FONT, boxShadow: active ? '0 8px 24px rgba(155,93,229,.38)' : 'none',
  })

  if (done) return (
    <div style={{ textAlign:'center', padding:'40px 0 20px' }}>
      <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#9B5DE5,#C084FC)',
        margin:'0 auto 24px', display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:32, boxShadow:'0 12px 28px rgba(155,93,229,.4)' }}>✓</div>
      <h3 style={{ fontSize:24, fontWeight:800, color:'#fff', marginBottom:14 }}>신청 완료!</h3>
      <p style={{ fontSize:15, color:'#A99BC4', lineHeight:1.8 }}>
        입력하신 <b style={{ color:'#EAE3D8' }}>연락처로 담당자가 직접 연락</b>드려요.<br/>
        보통 <b style={{ color:'#EAE3D8' }}>1영업일 이내</b>에 연락드려요.
      </p>
    </div>
  )

  return (
    <div id="form-top">
      <div style={{ display:'flex', gap:6, marginBottom:32, alignItems:'center' }}>{dots}</div>

      {step === 1 && (
        <div>
          <label style={{ display:'block', fontSize:12.5, color:'#A99BC4', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:9 }}>연락처</label>
          <input style={inputStyle} type="tel" inputMode="numeric" maxLength={13} placeholder="010-0000-0000"
            value={fd.phone} onChange={e => setFd({ ...fd, phone: fmtPhone(e.target.value) })}/>
          <button style={btnStyle(canNext[1])} disabled={!canNext[1]} onClick={() => canNext[1] && goStep(2)}>다음</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div>
              <label style={{ display:'block', fontSize:12.5, color:'#A99BC4', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:9 }}>나이</label>
              <input style={inputStyle} type="number" inputMode="numeric" placeholder="예) 24" min={15} max={50}
                value={fd.age} onChange={e => setFd({ ...fd, age: e.target.value })}/>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12.5, color:'#A99BC4', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:9 }}>직업</label>
              <input style={inputStyle} type="text" placeholder="예) 대학생, 직장인, 취준생"
                value={fd.job} onChange={e => setFd({ ...fd, job: e.target.value })}/>
            </div>
          </div>
          <button style={btnStyle(canNext[2])} disabled={!canNext[2]} onClick={() => canNext[2] && goStep(3)}>다음</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <label style={{ display:'block', fontSize:12.5, color:'#A99BC4', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:9 }}>거주지</label>
          <input style={inputStyle} type="text" placeholder="예) 서울 마포구 합정동"
            value={fd.location} onChange={e => setFd({ ...fd, location: e.target.value })}/>
          <div style={{ fontSize:12, color:'rgba(192,132,252,.65)', marginTop:8 }}>📍 지점별 정확한 안내를 도와드려요</div>
          <button style={btnStyle(canNext[3])} disabled={!canNext[3]} onClick={() => canNext[3] && goStep(4)}>다음</button>
        </div>
      )}

      {step === 4 && (
        <div>
          <label style={{ display:'block', fontSize:12.5, color:'#A99BC4', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:9 }}>안내 전화 희망시간</label>
          {['평일 오전 (10:00~12:00)', '평일 오후 (13:00~18:00)', '평일 저녁 (18:00~19:00)', '주말 (예약제)'].map(v => {
            const sel = fd.calltime === v
            return (
              <div key={v} onClick={() => setFd({ ...fd, calltime: v })}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', marginBottom:10,
                  background: sel ? 'rgba(155,93,229,.18)' : 'rgba(255,255,255,.06)',
                  border: `1.5px solid ${sel ? '#C084FC' : 'rgba(255,255,255,.1)'}`,
                  borderRadius:14, cursor:'pointer', WebkitTapHighlightColor:'transparent' }}>
                <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${sel ? '#C084FC' : 'rgba(255,255,255,.3)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {sel && <div style={{ width:10, height:10, borderRadius:'50%', background:'#C084FC' }}/>}
                </div>
                <span style={{ fontSize:15.5, color: sel ? '#fff' : '#EAE3D8', fontWeight: sel ? 600 : 500 }}>{v}</span>
              </div>
            )
          })}
          <button style={btnStyle(canNext[4])} disabled={!canNext[4]} onClick={() => canNext[4] && goStep(5)}>다음</button>
        </div>
      )}

      {step === 5 && (
        <div>
          <label style={{ display:'block', fontSize:12.5, color:'#A99BC4', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:9 }}>상담하고 싶은 내용</label>
          <textarea style={{ ...inputStyle, minHeight:150, resize:'none', lineHeight:1.75 }}
            placeholder="상담하시고 싶은 내용을 입력하세요"
            value={fd.concern} onChange={e => setFd({ ...fd, concern: e.target.value })}/>
          <button style={btnStyle(canNext[5])} disabled={!canNext[5]} onClick={() => canNext[5] && submit()}>신청 완료</button>
        </div>
      )}
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

  const goApply = (e) => {
    e.preventDefault()
    navigate(`/apply?type=${encodeURIComponent(urlType)}&name=${encodeURIComponent(urlName)}&gender=${encodeURIComponent(urlGender)}`)
  }

  return (
    <div className="lp-root">
      <div className="lp-grain"/>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-wrap">
          <span className="lp-badge"><span className="lp-dot"/>이음나루 인지심리연구소 · 20대 무료 프로그램</span>
          <h1 className="lp-h1">
            <span className="lp-line lp-l1">연애만 하면 작아지던 내가,</span><br/>
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
          <Reveal delay={.08}><h2 className="lp-h2">문제는 당신의 성격이 아니라,<br/><span className="lp-accent">아직 모르고 있던 '마음의 패턴'</span>이에요.</h2></Reveal>
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
              <p>같은 연애여도 누구는 편하고 누구는 힘든 이유.<br/>그건 의지가 아니라 <span className="lp-hl">내 안의 심리 구조</span> 때문이에요. 구조를 알면, 관계는 <span className="lp-hl">노력 없이도</span> 편해져요.</p>
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
          <Reveal><h2 className="lp-offer-h2">나의 연애 패턴을 <span className="lp-accent">3단계</span>로<br/>풀어내는 시간</h2></Reveal>
          <Reveal delay={.08}><p className="lp-offer-lead">이음나루 <b>3코어 매직</b> · 20대만을 위한 프로그램</p></Reveal>
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
              <div className="lp-pnote"><b>취업창업지원금</b>으로 전액 지원돼요</div>
            </div>
          </Reveal>
          <Reveal>
            <div style={{ position:'sticky', bottom:0 }}>
              <a href="/apply" onClick={goApply} className="lp-cta">무료 신청하기 →</a>
              <p className="lp-cta-sub">이번 기수 <b>30명 한정</b> · 신청 후 1영업일 내 연락드려요</p>
            </div>
          </Reveal>
        </div>
      </section>

<footer className="lp-footer">
        이음나루 인지심리연구소<br/><b>사람과 사람을 잇는 마음의 나루터</b>
      </footer>
    </div>
  )
}
