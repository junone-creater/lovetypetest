import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { store } from '../store'
import { TYPES } from '../constants/types'

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
  // 테스트에서 받은 정보(같은 세션) — URL 파라미터가 없으면 여기서 보충
  const testUser = store.getUser() || {}
  const urlName   = decodeURIComponent(params.get('name')   || '') || testUser.name   || ''
  const urlGender = decodeURIComponent(params.get('gender') || '') || testUser.gender || ''
  const urlType   = decodeURIComponent(params.get('type')   || '')

  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  // 테스트에서 받은 이름·성별·나이를 미리 채워둠 (모두 수정 가능, 그대로 제출됨)
  const [fd, setFd] = useState({
    name: urlName, gender: urlGender, phone:'',
    age: testUser.age ? String(testUser.age) : '', job:'', location:'', calltime:'', concern:'',
  })

  const canNext = {
    1: fd.name.trim() && fd.gender && fd.age.trim() && fd.job.trim(),
    2: fd.phone.replace(/[^0-9]/g, '').length >= 10,
    3: fd.location.trim().length >= 2,
    4: fd.calltime !== '',
    5: fd.concern.trim().length >= 5,
  }

  const goStep = (n) => { setStep(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const submit = () => {
    const data = { type: urlType, ...fd }
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

  if (done) {
    const result = store.getResult()
    const firstType = result ? TYPES[result.first] : null
    const gender = fd.gender || testUser.gender
    const displayName = fd.name || testUser.name || ''
    const imgSrc = firstType
      ? `${import.meta.env.BASE_URL}images/result-${firstType.key}-${gender === '남자' ? 'male' : 'female'}.png`
      : null
    return (
      <div style={{ background: BG, minHeight: '100vh', fontFamily: FONT }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px 60px', textAlign: 'center' }}>
          {/* 완료 체크 */}
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg,${PURPLE},${LILAC})`,
            margin: '0 auto 22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 34, boxShadow: '0 12px 28px rgba(155,93,229,.4)' }}>✓</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 12 }}>신청 완료!</h2>
          <p style={{ fontSize: 14.5, color: '#A99BC4', lineHeight: 1.8 }}>
            <b style={{ color: '#EAE3D8' }}>1영업일 이내</b>에 담당자가 연락드려요.
          </p>

          {/* 잠겨있던 1순위 공개 */}
          {firstType && (
            <div className="fade-in" style={{ marginTop: 34, padding: '26px 22px', borderRadius: 20, textAlign: 'left',
              background: 'linear-gradient(135deg, rgba(155,93,229,.18), rgba(26,17,48,.6))',
              border: '1px solid rgba(192,132,252,.3)' }}>
              <div style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 700, color: LILAC, letterSpacing: '.04em', marginBottom: 18 }}>
                🔓 잠겨있던 결과가 공개됐어요
              </div>
              <div style={{ textAlign: 'center', fontSize: 13, color: LILAC, fontWeight: 700, letterSpacing: '1px', marginBottom: 4 }}>
                🥇 {displayName ? `${displayName}님의 ` : ''}1순위 연애 유형
              </div>
              <div style={{ textAlign: 'center', fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{firstType.name}</div>
              <div style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,.5)', fontStyle: 'italic', marginBottom: 18 }}>"{firstType.tagline}"</div>
              {imgSrc && (
                <img src={imgSrc} alt={firstType.name} onError={e => { e.target.style.display = 'none' }}
                  style={{ display: 'block', width: '100%', maxWidth: 200, borderRadius: 14, margin: '0 auto 20px' }}/>
              )}
              <div style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(0,0,0,.25)', border: '1px solid rgba(192,132,252,.2)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: LILAC, marginBottom: 8 }}>💡 이 유형이 연애에서 반복하는 핵심 패턴</div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.82)', lineHeight: 1.75 }}>{firstType.trap}</p>
              </div>
              <p style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(255,255,255,.45)', lineHeight: 1.7, marginTop: 18 }}>
                더 깊은 분석은 상담에서 담당자가 자세히 알려드려요 💜
              </p>
            </div>
          )}

          <button onClick={() => navigate('/')}
            style={{ marginTop: 28, padding: '14px 32px', borderRadius: 14, border: 'none', background: 'rgba(255,255,255,.1)',
              color: 'rgba(255,255,255,.6)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
            처음으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

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

        {/* Step 1: 내 정보 확인/수정 (이름·성별·나이·직업) */}
        {step === 1 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.4, marginBottom: 8 }}>내 정보를<br/>확인해주세요</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', marginBottom: 32, lineHeight: 1.7 }}>
              {(testUser.name || testUser.age) ? '테스트에서 받은 정보예요 · 틀린 부분은 수정해주세요' : '맞춤 안내를 위해 필요해요'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelSt}>이름</label>
                <input style={inputSt} type="text" placeholder="예) 홍길동"
                  value={fd.name} onChange={e => setFd({ ...fd, name: e.target.value })}/>
              </div>
              <div>
                <label style={labelSt}>성별</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[{ val:'여자', emoji:'👩' }, { val:'남자', emoji:'👨' }].map(({ val, emoji }) => {
                    const on = fd.gender === val
                    return (
                      <button key={val} type="button" onClick={() => setFd({ ...fd, gender: val })}
                        style={{ flex: 1, padding: '15px 0', borderRadius: 14, border: '1.5px solid',
                          borderColor: on ? LILAC : 'rgba(255,255,255,.12)',
                          background: on ? 'rgba(192,132,252,.2)' : 'rgba(255,255,255,.07)',
                          color: on ? LILAC : 'rgba(255,255,255,.45)',
                          fontFamily: FONT, fontSize: 15.5, fontWeight: 600, cursor: 'pointer' }}>
                        {emoji} {val}
                      </button>
                    )
                  })}
                </div>
              </div>
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
            <button style={btnSt(canNext[1])} disabled={!canNext[1]} onClick={() => canNext[1] && goStep(2)}>다음</button>
          </div>
        )}

        {/* Step 2: 연락처 */}
        {step === 2 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.4, marginBottom: 8 }}>
              {fd.name ? `${fd.name}님,` : '연락처를'}<br/>{fd.name ? '연락처를 알려주세요' : '알려주세요'}
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', marginBottom: 32, lineHeight: 1.7 }}>결과와 맞춤 연애 조언을 문자로 바로 보내드려요</p>
            <label style={labelSt}>연락처</label>
            <input style={{ ...inputSt, fontSize: 18, letterSpacing: '1.5px' }} type="tel" inputMode="numeric" maxLength={13} placeholder="010-0000-0000"
              value={fd.phone} onChange={e => setFd({ ...fd, phone: fmtPhone(e.target.value) })}/>
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
