import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyjqcPPG9Xh5eIYNng0W29NscxfKR1JzcBsB0mIM9F9vGsH6It3YIHmu0lIGJMS/exec'
const FONT = "'Pretendard', -apple-system, sans-serif"
const TOTAL = 5
const BG = '#0E0816'
const PURPLE = '#9B5DE5'
const LILAC = '#C084FC'

function fmtPhone(v) {
  const n = v.replace(/[^0-9]/g, '').slice(0, 11)
  if (n.length < 4) return n
  if (n.length < 8) return `${n.slice(0,3)}-${n.slice(3)}`
  return `${n.slice(0,3)}-${n.slice(3,7)}-${n.slice(7)}`
}

export default function ApplyPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const urlName   = decodeURIComponent(params.get('name')   || '')
  const urlGender = decodeURIComponent(params.get('gender') || '')
  const urlType   = decodeURIComponent(params.get('type')   || '')

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

  const goStep = (n) => { setStep(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const submit = () => {
    const data = { name: urlName, gender: urlGender, type: urlType, ...fd }
    try { fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(data) }).catch(() => {}) } catch {}
    try {
      const s = document.createElement('script')
      s.src = SHEET_URL + '?' + new URLSearchParams(data).toString()
      document.head.appendChild(s)
      setTimeout(() => { try { s.parentNode?.removeChild(s) } catch {} }, 8000)
    } catch {}
    setDone(true)
  }

  const inputSt = {
    width: '100%', padding: '17px 18px', fontSize: 16, fontFamily: FONT,
    background: 'rgba(255,255,255,.07)', border: '1.5px solid rgba(255,255,255,.12)',
    borderRadius: 14, color: '#F3E8FF', outline: 'none', WebkitAppearance: 'none',
    appearance: 'none',
  }
  const btnSt = (on) => ({
    width: '100%', marginTop: 28, padding: 18, borderRadius: 14, border: 'none', fontFamily: FONT,
    background: on ? `linear-gradient(135deg,${PURPLE},${LILAC})` : 'rgba(255,255,255,.1)',
    color: on ? '#fff' : 'rgba(255,255,255,.3)',
    fontSize: 17, fontWeight: 800, cursor: on ? 'pointer' : 'not-allowed',
    boxShadow: on ? '0 8px 24px rgba(155,93,229,.38)' : 'none',
  })
  const labelSt = {
    display: 'block', fontSize: 12.5, color: '#A99BC4', fontWeight: 700,
    letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 9,
  }

  if (done) return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
      <div style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg,${PURPLE},${LILAC})`,
          margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, boxShadow: '0 12px 28px rgba(155,93,229,.4)' }}>✓</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 14 }}>신청 완료!</h2>
        <p style={{ fontSize: 15, color: '#A99BC4', lineHeight: 1.8, marginBottom: 32 }}>
          입력하신 <b style={{ color: '#EAE3D8' }}>연락처로 담당자가 직접 연락</b>드려요.<br/>
          보통 <b style={{ color: '#EAE3D8' }}>1영업일 이내</b>에 연락드려요.
        </p>
        <button onClick={() => navigate('/')}
          style={{ padding: '14px 32px', borderRadius: 14, border: 'none', background: 'rgba(255,255,255,.1)',
            color: 'rgba(255,255,255,.6)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
          처음으로 돌아가기
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: FONT }}>
      {/* 헤더 */}
      <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: 7 }}>
        <button onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: 20, cursor: 'pointer', padding: '4px 8px 4px 0' }}>
          ←
        </button>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.5)', letterSpacing: '.5px' }}>무료 신청</span>
      </div>

      <div style={{ padding: '28px 24px 60px', maxWidth: 480, margin: '0 auto' }}>
        {/* 진행 표시 */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 36, alignItems: 'center' }}>
          {Array.from({ length: TOTAL }, (_, i) => (
            <div key={i} style={{ height: 5, borderRadius: 3, transition: 'all .3s',
              background: i + 1 < step ? PURPLE : i + 1 === step ? LILAC : 'rgba(255,255,255,.15)',
              width: i + 1 === step ? 22 : 6 }}/>
          ))}
          <span style={{ marginLeft: 8, fontSize: 13, color: 'rgba(255,255,255,.35)', fontWeight: 600 }}>{step} / {TOTAL}</span>
        </div>

        {/* Step 1: 연락처 */}
        {step === 1 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.4, marginBottom: 8 }}>연락처를<br/>알려주세요</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', marginBottom: 32, lineHeight: 1.7 }}>결과와 맞춤 연애 조언을 문자로 바로 보내드려요</p>
            <label style={labelSt}>연락처</label>
            <input style={{ ...inputSt, fontSize: 18, letterSpacing: '1.5px' }} type="tel" inputMode="numeric" maxLength={13} placeholder="010-0000-0000"
              value={fd.phone} onChange={e => setFd({ ...fd, phone: fmtPhone(e.target.value) })}/>
            <button style={btnSt(canNext[1])} disabled={!canNext[1]} onClick={() => canNext[1] && goStep(2)}>다음</button>
          </div>
        )}

        {/* Step 2: 나이 + 직업 */}
        {step === 2 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.4, marginBottom: 8 }}>나이와 직업을<br/>알려주세요</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', marginBottom: 32, lineHeight: 1.7 }}>맞춤 안내를 위해 필요해요</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelSt}>나이</label>
                <input style={inputSt} type="number" inputMode="numeric" placeholder="예) 24" min={15} max={50}
                  value={fd.age} onChange={e => setFd({ ...fd, age: e.target.value })}/>
              </div>
              <div>
                <label style={labelSt}>직업</label>
                <input style={inputSt} type="text" placeholder="예) 대학생, 직장인, 취준생"
                  value={fd.job} onChange={e => setFd({ ...fd, job: e.target.value })}/>
              </div>
            </div>
            <button style={btnSt(canNext[2])} disabled={!canNext[2]} onClick={() => canNext[2] && goStep(3)}>다음</button>
          </div>
        )}

        {/* Step 3: 거주지 */}
        {step === 3 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.4, marginBottom: 8 }}>거주 지역을<br/>알려주세요</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', marginBottom: 6, lineHeight: 1.7 }}>지점별 정확한 안내를 도와드리기 위해 받고 있습니다</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', marginBottom: 28 }}>예) 서울 마포구 합정동 · 경기 성남시 분당구</p>
            <label style={labelSt}>거주지</label>
            <input style={inputSt} type="text" placeholder="예) 서울 마포구 합정동"
              value={fd.location} onChange={e => setFd({ ...fd, location: e.target.value })}/>
            <p style={{ fontSize: 12, color: 'rgba(192,132,252,.65)', marginTop: 8 }}>📍 지점별 정확한 안내를 도와드려요</p>
            <button style={btnSt(canNext[3])} disabled={!canNext[3]} onClick={() => canNext[3] && goStep(4)}>다음</button>
          </div>
        )}

        {/* Step 4: 희망시간 */}
        {step === 4 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.4, marginBottom: 8 }}>안내 전화<br/>희망시간을 골라주세요</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', marginBottom: 28, lineHeight: 1.7 }}>선택하신 시간대에 연락드려요</p>
            {['평일 오전 (10:00~12:00)', '평일 오후 (13:00~18:00)', '평일 저녁 (18:00~19:00)', '주말 (예약제)'].map(v => {
              const sel = fd.calltime === v
              return (
                <div key={v} onClick={() => setFd({ ...fd, calltime: v })}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', marginBottom: 10,
                    background: sel ? 'rgba(155,93,229,.18)' : 'rgba(255,255,255,.06)',
                    border: `1.5px solid ${sel ? LILAC : 'rgba(255,255,255,.1)'}`,
                    borderRadius: 14, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${sel ? LILAC : 'rgba(255,255,255,.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {sel && <div style={{ width: 10, height: 10, borderRadius: '50%', background: LILAC }}/>}
                  </div>
                  <span style={{ fontSize: 15.5, color: sel ? '#fff' : '#EAE3D8', fontWeight: sel ? 600 : 500 }}>{v}</span>
                </div>
              )
            })}
            <button style={btnSt(canNext[4])} disabled={!canNext[4]} onClick={() => canNext[4] && goStep(5)}>다음</button>
          </div>
        )}

        {/* Step 5: 상담 내용 */}
        {step === 5 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.4, marginBottom: 8 }}>상담하고 싶은<br/>내용을 적어주세요</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', marginBottom: 10, lineHeight: 1.7 }}>편하게 적어주시면 돼요</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', marginBottom: 28 }}>예) 좋아하는 사람이 생겼는데 어떻게 시작해야 할지 모르겠어요</p>
            <textarea style={{ ...inputSt, minHeight: 150, resize: 'none', lineHeight: 1.75 }}
              placeholder="상담하시고 싶은 내용을 입력하세요"
              value={fd.concern} onChange={e => setFd({ ...fd, concern: e.target.value })}/>
            <button style={btnSt(canNext[5])} disabled={!canNext[5]} onClick={() => canNext[5] && submit()}>신청 완료</button>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,.2)', marginTop: 14 }}>
              입력하신 정보는 결과 안내 외 사용되지 않아요
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
