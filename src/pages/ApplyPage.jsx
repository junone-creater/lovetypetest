import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { store } from '../store'
import { TYPES } from '../constants/types'

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyjqcPPG9Xh5eIYNng0W29NscxfKR1JzcBsB0mIM9F9vGsH6It3YIHmu0lIGJMS/exec'
const FONT = "'Pretendard', -apple-system, sans-serif"
const TOTAL = 6
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
  const [jobEtc, setJobEtc] = useState(false)   // 직업 '기타' 직접 입력 모드
  // 테스트에서 받은 이름·성별·나이를 미리 채워둠 (모두 수정 가능, 그대로 제출됨)
  const [fd, setFd] = useState({
    name: urlName, gender: urlGender, phone:'',
    age: testUser.age ? String(testUser.age) : '', job:'', location:'', calltime:'', concern:'', source:'',
  })

  const ageOk = Number(fd.age) > 0   // 나이 제한 없음 — 입력만 하면 통과
  const canNext = {
    1: fd.name.trim() && fd.gender && ageOk && fd.job.trim(),
    2: fd.phone.replace(/[^0-9]/g, '').length >= 10,
    3: fd.location.trim().length >= 2,
    4: fd.calltime !== '',
    5: fd.concern.trim().length >= 5,
    6: fd.source !== '',
  }

  const goStep = (n) => { setStep(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  // 뒤로가기: 1단계보다 뒤면 이전 단계로, 1단계에서만 이전 페이지(랜딩)로
  const goBack = () => { if (step > 1) goStep(step - 1); else navigate(-1) }

  const submit = () => {
    const data = { type: urlType, ...fd }
    // POST 한 번만 전송 (GET/JSONP 동시 전송 시 시트에 행이 2개씩 들어가 제거함)
    try { fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(data) }).catch(() => {}) } catch {}
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
    <div style={{ background: BG, height: '100dvh', overflow: 'hidden', fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
        <button onClick={goBack}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: 20, cursor: 'pointer', padding: '4px 8px 4px 0' }}>
          ←
        </button>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.5)', letterSpacing: '.5px' }}>무료 신청</span>
      </div>

      <div style={{ padding: '22px 24px 28px', maxWidth: 480, margin: '0 auto', width: '100%', flex: 1, minHeight: 0,
        display: 'flex', flexDirection: 'column' }}>
        {/* 진행 표시 */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 26, alignItems: 'center', flexShrink: 0 }}>
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
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.4, marginBottom: 8 }}>내 정보를 확인해주세요</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', marginBottom: 24, lineHeight: 1.7 }}>
              {(testUser.name || testUser.age) ? '테스트에서 받은 정보예요 · 틀린 부분은 수정해주세요' : '맞춤 안내를 위해 필요해요'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                <input style={inputSt} type="number" inputMode="numeric" placeholder="예) 24" min={1}
                  value={fd.age} onChange={e => setFd({ ...fd, age: e.target.value })}/>
              </div>
              <div>
                <label style={labelSt}>직업</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['대학생', '직장인', '취준생', '프리랜서', '기타'].map(opt => {
                    const on = opt === '기타' ? jobEtc : (!jobEtc && fd.job === opt)
                    return (
                      <button key={opt} type="button"
                        onClick={() => {
                          if (opt === '기타') { setJobEtc(true); setFd({ ...fd, job: '' }) }
                          else { setJobEtc(false); setFd({ ...fd, job: opt }) }
                        }}
                        style={{ flex: '1 1 28%', padding: '13px 0', borderRadius: 12, border: '1.5px solid',
                          borderColor: on ? LILAC : 'rgba(255,255,255,.12)',
                          background: on ? 'rgba(192,132,252,.2)' : 'rgba(255,255,255,.07)',
                          color: on ? LILAC : 'rgba(255,255,255,.45)',
                          fontFamily: FONT, fontSize: 14.5, fontWeight: 600, cursor: 'pointer' }}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
                {jobEtc && (
                  <input style={{ ...inputSt, marginTop: 10 }} type="text" placeholder="직업을 직접 입력해주세요" autoFocus
                    value={fd.job} onChange={e => setFd({ ...fd, job: e.target.value })}/>
                )}
              </div>
            </div>
            <button style={btnSt(canNext[1])} disabled={!canNext[1]} onClick={() => canNext[1] && goStep(2)}>다음</button>
          </div>
        )}

        {/* Step 2: 연락처 */}
        {step === 2 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.4, marginBottom: 8 }}>
              {fd.name ? `${fd.name}님, 연락처를 알려주세요` : '연락처를 알려주세요'}
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
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.4, marginBottom: 8 }}>거주 지역을 알려주세요</h2>
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
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.4, marginBottom: 8 }}>안내 전화 희망시간을 골라주세요</h2>
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
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.4, marginBottom: 8 }}>상담하고 싶은 내용을 적어주세요</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', marginBottom: 10, lineHeight: 1.7 }}>편하게 적어주시면 돼요</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', marginBottom: 28 }}>예) 좋아하는 사람이 생겼는데 어떻게 시작해야 할지 모르겠어요</p>
            <textarea style={{ ...inputSt, minHeight: 150, resize: 'none', lineHeight: 1.75 }}
              placeholder="상담하시고 싶은 내용을 입력하세요"
              value={fd.concern} onChange={e => setFd({ ...fd, concern: e.target.value })}/>
            <button style={btnSt(canNext[5])} disabled={!canNext[5]} onClick={() => canNext[5] && goStep(6)}>다음</button>
          </div>
        )}

        {/* Step 6: 유입 경로 */}
        {step === 6 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.4, marginBottom: 8 }}>마지막이에요! 어떻게 알고 오셨어요?</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', marginBottom: 28, lineHeight: 1.7 }}>더 좋은 안내를 위해 살짝 여쭤봐요</p>
            {[
              { val: '카카오톡', emoji: '💬' },
              { val: '친구/지인', emoji: '👥' },
              { val: '인스타', emoji: '📷' },
              { val: '블로그', emoji: '📝' },
            ].map(({ val, emoji }) => {
              const sel = fd.source === val
              return (
                <div key={val} onClick={() => setFd({ ...fd, source: val })}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', marginBottom: 10,
                    background: sel ? 'rgba(155,93,229,.18)' : 'rgba(255,255,255,.06)',
                    border: `1.5px solid ${sel ? LILAC : 'rgba(255,255,255,.1)'}`,
                    borderRadius: 14, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${sel ? LILAC : 'rgba(255,255,255,.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {sel && <div style={{ width: 10, height: 10, borderRadius: '50%', background: LILAC }}/>}
                  </div>
                  <span style={{ fontSize: 16 }}>{emoji}</span>
                  <span style={{ fontSize: 15.5, color: sel ? '#fff' : '#EAE3D8', fontWeight: sel ? 600 : 500 }}>{val}</span>
                </div>
              )
            })}
            <button style={btnSt(canNext[6])} disabled={!canNext[6]} onClick={() => canNext[6] && submit()}>신청 완료</button>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,.2)', marginTop: 14 }}>
              입력하신 정보는 결과 안내 외 사용되지 않아요
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
