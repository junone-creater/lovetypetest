import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { T, FONT } from '../constants/tokens'
import { store, INIT_SCORES } from '../store'

const S = {
  input: { width:'100%', padding:'13px 14px', fontSize:16, fontFamily:FONT,
    border:`1.5px solid rgba(255,255,255,.12)`, borderRadius:12,
    background:'rgba(255,255,255,.07)', color:'#fff' },
  cta: { width:'100%', border:'none', borderRadius:14, padding:'15px',
    fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:FONT,
    boxShadow:'0 8px 24px rgba(155,93,229,.4)' },
}

export default function IntroPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState({ name:'', age:'', gender:'', agreed:false })
  const valid = user.name.trim().length > 0 && user.age.trim() !== '' && user.gender !== '' && user.agreed

  const onStart = () => {
    store.setUser(user)
    store.setScores({ ...INIT_SCORES })
    store.setQIndex(0)
    navigate('/quiz')
  }

  return (
    <div className="fade-in" style={{ background:'#0E0816', minHeight:'100vh' }}>
      {/* 히어로 */}
      <div style={{ position:'relative', width:'100%', height:'85vw', maxHeight:480, overflow:'hidden' }}>
        <img src={`${import.meta.env.BASE_URL}images/intro-hero.png`} alt=""
          style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 25%' }}/>
        <div style={{ position:'absolute', inset:0,
          background:'linear-gradient(to bottom, rgba(14,8,22,.3) 0%, rgba(14,8,22,0) 40%, rgba(14,8,22,.85) 80%, #0E0816 100%)' }}/>
        <div style={{ position:'absolute', top:18, left:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#C084FC', display:'inline-block' }}/>
            <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,.8)', letterSpacing:'.5px', fontFamily:FONT }}>이음나루</span>
          </div>
        </div>
        <div style={{ position:'absolute', top:20, left:20, maxWidth:180 }}>
          <div style={{ marginTop:28, background:'rgba(255,255,255,.08)', backdropFilter:'blur(8px)',
            border:'1px solid rgba(255,255,255,.15)', borderRadius:'0 14px 14px 14px', padding:'12px 14px' }}>
            <p style={{ fontSize:13, color:'#F3E8FF', lineHeight:1.6, fontFamily:FONT, fontWeight:500 }}>
              나는 연애할 때<br/>어떤 사람일까?
            </p>
          </div>
        </div>
        <div style={{ position:'absolute', bottom:16, left:20, right:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#C084FC', letterSpacing:'2px', fontFamily:FONT, marginBottom:6 }}>연애 심리 테스트</div>
          <h1 style={{ fontSize:26, fontWeight:800, color:'#fff', lineHeight:1.3, fontFamily:FONT }}>나의 연애 유형<br/>알아보기</h1>
        </div>
      </div>

      {/* 폼 */}
      <div style={{ padding:'20px 22px 36px' }}>
        <p style={{ fontSize:14, color:'rgba(255,255,255,.5)', lineHeight:1.6, marginBottom:24, fontFamily:FONT }}>
          12가지 질문으로 알아보는 내 연애 유형.<br/>결과는 바로 확인할 수 있어요.
        </p>

        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,.45)', marginBottom:7, fontWeight:500, fontFamily:FONT }}>이름</label>
          <input style={S.input} placeholder="홍길동" value={user.name}
            onChange={e => setUser({ ...user, name:e.target.value })}/>
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,.45)', marginBottom:7, fontWeight:500, fontFamily:FONT }}>나이</label>
          <div style={{ position:'relative' }}>
            <input style={{ ...S.input, paddingRight:36 }} placeholder="예) 27" inputMode="numeric" maxLength={3}
              value={user.age} onChange={e => setUser({ ...user, age:e.target.value.replace(/[^0-9]/g,'') })}/>
            <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'rgba(255,255,255,.3)', fontFamily:FONT }}>세</span>
          </div>
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,.45)', marginBottom:7, fontWeight:500, fontFamily:FONT }}>성별</label>
          <div style={{ display:'flex', gap:10 }}>
            {[{ val:'여자', emoji:'👩' }, { val:'남자', emoji:'👨' }].map(({ val, emoji }) => {
              const on = user.gender === val
              return (
                <button key={val} onClick={() => setUser({ ...user, gender:val })}
                  style={{ flex:1, padding:'12px 0', borderRadius:12, border:'1.5px solid',
                    borderColor: on ? '#C084FC' : 'rgba(255,255,255,.12)',
                    background: on ? 'rgba(192,132,252,.2)' : 'rgba(255,255,255,.07)',
                    color: on ? '#C084FC' : 'rgba(255,255,255,.45)',
                    fontFamily:FONT, fontSize:15, fontWeight:600, cursor:'pointer' }}>
                  {emoji} {val}
                </button>
              )
            })}
          </div>
        </div>

        <div onClick={() => setUser({ ...user, agreed:!user.agreed })}
          style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:22, marginTop:8, cursor:'pointer',
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

        <button onClick={onStart} disabled={!valid}
          style={{ ...S.cta,
            background: valid ? 'linear-gradient(135deg, #9B5DE5, #C084FC)' : 'rgba(255,255,255,.1)',
            color: valid ? '#fff' : 'rgba(255,255,255,.3)',
            boxShadow: valid ? '0 8px 24px rgba(155,93,229,.4)' : 'none',
            cursor: valid ? 'pointer' : 'not-allowed' }}>
          테스트 시작하기
        </button>
        <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,.2)', marginTop:14, fontFamily:FONT }}>
          🔒 입력하신 정보는 결과 안내 목적으로만 사용돼요
        </p>
      </div>
    </div>
  )
}
