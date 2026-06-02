import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, FONT } from '../constants/tokens'
import { store, INIT_SCORES } from '../store'

const TOTAL = 3 // 이름 · 나이 · 성별

const S = {
  input: { width:'100%', padding:'15px 16px', fontSize:17, fontFamily:FONT,
    border:`1.5px solid rgba(255,255,255,.12)`, borderRadius:12,
    background:'rgba(255,255,255,.07)', color:'#fff', outline:'none' },
  cta: { width:'100%', border:'none', borderRadius:14, padding:'16px',
    fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:FONT },
}

export default function IntroPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0) // 0:시작 1:이름 2:나이 3:성별+동의
  const [user, setUser] = useState({ name:'', age:'', gender:'', agreed:false })

  const canNext = {
    1: user.name.trim().length > 0,
    2: user.age.trim() !== '',
    3: user.gender !== '' && user.agreed,
  }

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => Math.max(0, s - 1))

  const onStart = () => {
    store.setUser(user)
    store.setScores({ ...INIT_SCORES })
    store.setAnswers([])
    store.setQIndex(0)
    navigate('/quiz')
  }

  const ctaStyle = (active) => ({
    ...S.cta,
    background: active ? 'linear-gradient(135deg, #9B5DE5, #C084FC)' : 'rgba(255,255,255,.1)',
    color: active ? '#fff' : 'rgba(255,255,255,.3)',
    boxShadow: active ? '0 8px 24px rgba(155,93,229,.4)' : 'none',
    cursor: active ? 'pointer' : 'not-allowed',
  })

  // ── 0단계: 시작 화면 (큰 히어로) ──
  if (step === 0) {
    return (
      <div className="fade-in" style={{ background:'#0E0816', minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        {/* 히어로: 원본 비율 그대로 → 말풍선 위치가 모든 화면에서 고정.
            containerType:inline-size 로 글자 크기를 이미지 너비 기준(cqw)으로 잡아 항상 말풍선에 맞춤 */}
        <div style={{ position:'relative', width:'100%', containerType:'inline-size', overflow:'hidden' }}>
          <img src={`${import.meta.env.BASE_URL}images/intro-hero.png`} alt=""
            style={{ width:'100%', height:'auto', display:'block' }}/>
          <div style={{ position:'absolute', inset:0,
            background:'linear-gradient(to bottom, rgba(14,8,22,.15) 0%, rgba(14,8,22,0) 45%, rgba(14,8,22,.85) 82%, #0E0816 100%)' }}/>

          {/* 배경 말풍선 안에 들어가는 텍스트 (이미지 좌상단 말풍선 영역) */}
          <div style={{ position:'absolute', top:'9%', left:'3%', width:'37%', textAlign:'center' }}>
            <p style={{ fontSize:'4.4cqw', color:'#F8F0FF', lineHeight:1.5, fontFamily:FONT, fontWeight:700,
              textShadow:'0 1px 6px rgba(0,0,0,.55)', margin:0 }}>
              나는 연애할 때<br/>어떤 사람일까?
            </p>
          </div>

          <div style={{ position:'absolute', top:18, right:20, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:22, height:22, borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg, #9B5DE5, #C084FC)',
              boxShadow:'0 0 10px rgba(192,132,252,.6)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:11, fontWeight:800, color:'#fff', fontFamily:FONT }}>이</span>
            <span style={{ fontSize:12.5, fontWeight:700, color:'#EAD9FF', letterSpacing:'.5px',
              textShadow:'0 1px 6px rgba(0,0,0,.5)', fontFamily:FONT }}>이음나루</span>
          </div>
          <div style={{ position:'absolute', bottom:16, left:20, right:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#C084FC', letterSpacing:'2px', fontFamily:FONT, marginBottom:6 }}>연애 심리 테스트</div>
            <h1 style={{ fontSize:26, fontWeight:800, color:'#fff', lineHeight:1.3, fontFamily:FONT }}>나의 연애 유형<br/>알아보기</h1>
          </div>
        </div>

        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'20px 22px 36px' }}>
          <p style={{ fontSize:14, color:'rgba(255,255,255,.5)', lineHeight:1.6, marginBottom:24, fontFamily:FONT }}>
            12가지 질문으로 알아보는 내 연애 유형.<br/>결과는 바로 확인할 수 있어요.
          </p>
          <div style={{ flex:1, minHeight:8 }}/>
          <button onClick={next} style={ctaStyle(true)}>테스트 시작하기</button>
          <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,.2)', marginTop:14, fontFamily:FONT }}>
            🔒 입력하신 정보는 결과 안내 목적으로만 사용돼요
          </p>
        </div>
      </div>
    )
  }

  // ── 1~3단계: 입력 위저드 ──
  const stepMeta = {
    1: { icon:'✍️', title:'먼저, 이름을 알려주세요', sub:'결과를 더 정확하게 안내해드릴게요.' },
    2: { icon:'🎂', title:`${user.name}님, 나이가 어떻게 되세요?`, sub:'또래에 맞는 결과를 보여드릴게요.' },
    3: { icon:'💗', title:'성별을 선택해주세요', sub:'마지막이에요! 곧 테스트가 시작돼요.' },
  }[step]
  const stepBtn = {
    1: { label:'다음', active:canNext[1], onClick:() => canNext[1] && next() },
    2: { label:'다음', active:canNext[2], onClick:() => canNext[2] && next() },
    3: { label:'다음', active:canNext[3], onClick:() => canNext[3] && onStart() },
  }[step]

  return (
    <div className="fade-in" style={{ background:'#0E0816', minHeight:'100vh', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
      {/* 은은한 보라 배경광 */}
      <div style={{ position:'absolute', top:'-15%', left:'50%', transform:'translateX(-50%)', width:'120%', height:'55%',
        background:'radial-gradient(60% 60% at 50% 40%, rgba(155,93,229,.22), transparent 70%)', pointerEvents:'none' }}/>

      {/* 상단 바: 뒤로 + 진행 점 */}
      <div style={{ display:'flex', alignItems:'center', gap:14, padding:'18px 22px 0', position:'relative', zIndex:1 }}>
        <button onClick={back}
          style={{ width:34, height:34, borderRadius:'50%', flexShrink:0, border:'1px solid rgba(255,255,255,.12)',
            background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.7)', fontSize:18, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', fontFamily:FONT }}>←</button>
        <div style={{ display:'flex', gap:6, flex:1 }}>
          {Array.from({ length:TOTAL }).map((_, i) => (
            <div key={i} style={{ height:5, borderRadius:3, transition:'all .3s ease',
              background: i < step ? '#C084FC' : 'rgba(255,255,255,.15)',
              width: i + 1 === step ? 22 : 6 }}/>
          ))}
        </div>
        <span style={{ fontSize:13, fontWeight:700, color:'#C084FC', fontFamily:FONT }}>{step} / {TOTAL}</span>
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'24px 22px 36px', position:'relative', zIndex:1 }}>
        {/* 중앙 정렬 콘텐츠 */}
        <div key={step} className="fade-in" style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', textAlign:'center' }}>
          {/* 단계 아이콘 */}
          <div style={{ width:74, height:74, borderRadius:'50%', margin:'0 auto 22px',
            background:'linear-gradient(135deg, rgba(155,93,229,.35), rgba(192,132,252,.18))',
            border:'1px solid rgba(192,132,252,.4)', boxShadow:'0 8px 28px rgba(155,93,229,.35)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:34 }}>{stepMeta.icon}</div>

          <h2 style={{ fontSize:23, fontWeight:800, color:'#fff', lineHeight:1.4, marginBottom:10, fontFamily:FONT }}>
            {stepMeta.title}
          </h2>
          <p style={{ fontSize:14, color:'rgba(255,255,255,.45)', marginBottom:30, fontFamily:FONT }}>
            {stepMeta.sub}
          </p>

          {/* 1단계: 이름 */}
          {step === 1 && (
            <input style={{ ...S.input, textAlign:'center' }} placeholder="홍길동" autoFocus value={user.name}
              onChange={e => setUser({ ...user, name:e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter' && canNext[1]) next() }}/>
          )}

          {/* 2단계: 나이 */}
          {step === 2 && (
            <div style={{ position:'relative', maxWidth:200, margin:'0 auto', width:'100%' }}>
              <input style={{ ...S.input, textAlign:'center', paddingRight:40 }} placeholder="27" inputMode="numeric" maxLength={3} autoFocus
                value={user.age} onChange={e => setUser({ ...user, age:e.target.value.replace(/[^0-9]/g,'') })}
                onKeyDown={e => { if (e.key === 'Enter' && canNext[2]) next() }}/>
              <span style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', fontSize:14, color:'rgba(255,255,255,.3)', fontFamily:FONT }}>세</span>
            </div>
          )}

          {/* 3단계: 성별 + 동의 */}
          {step === 3 && (
            <div>
              <div style={{ display:'flex', gap:10, marginBottom:20 }}>
                {[{ val:'여자', emoji:'👩' }, { val:'남자', emoji:'👨' }].map(({ val, emoji }) => {
                  const on = user.gender === val
                  return (
                    <button key={val} onClick={() => setUser({ ...user, gender:val })}
                      style={{ flex:1, padding:'20px 0', borderRadius:14, border:'1.5px solid',
                        borderColor: on ? '#C084FC' : 'rgba(255,255,255,.12)',
                        background: on ? 'rgba(192,132,252,.2)' : 'rgba(255,255,255,.07)',
                        color: on ? '#C084FC' : 'rgba(255,255,255,.45)',
                        fontFamily:FONT, fontSize:16, fontWeight:600, cursor:'pointer' }}>
                      {emoji} {val}
                    </button>
                  )
                })}
              </div>

              <div onClick={() => setUser({ ...user, agreed:!user.agreed })}
                style={{ display:'flex', alignItems:'flex-start', gap:12, cursor:'pointer', textAlign:'left',
                  padding:'14px 16px', borderRadius:12,
                  background: user.agreed ? 'rgba(192,132,252,.1)' : 'rgba(255,255,255,.04)',
                  border: `1.5px solid ${user.agreed ? 'rgba(192,132,252,.5)' : 'rgba(255,255,255,.1)'}`,
                  transition:'all .2s' }}>
                <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${user.agreed ? '#C084FC' : 'rgba(255,255,255,.25)'}`,
                  background: user.agreed ? '#C084FC' : 'transparent',
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                  {user.agreed && <span style={{ color:'#fff', fontSize:12, fontWeight:700 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize:13, color: user.agreed ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.5)',
                    fontWeight:600, fontFamily:FONT, lineHeight:1.5 }}>
                    개인정보 수집 및 이용에 동의합니다 <span style={{ color:'#C084FC' }}>(필수)</span>
                  </div>
                  <div style={{ fontSize:11.5, color:'rgba(255,255,255,.28)', marginTop:3, fontFamily:FONT, lineHeight:1.5 }}>
                    이름·나이는 결과 안내 목적으로만 사용되며, 제3자에게 제공되지 않아요
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 하단 고정 버튼 */}
        <button onClick={stepBtn.onClick} disabled={!stepBtn.active} style={ctaStyle(stepBtn.active)}>
          {stepBtn.label}
        </button>
      </div>
    </div>
  )
}
