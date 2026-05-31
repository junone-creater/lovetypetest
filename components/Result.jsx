import React from "react";
import { T } from "../constants/tokens";
import { maskPhone } from "../utils/phone";
import { styles } from "../styles/styles";
import PrefillRow from "./ui/PrefillRow";

export default function Result({ type, user, onApply }) {
  const c = type.color;
  const genderSuffix = user.gender === "남자" ? "male" : "female";
  const imgSrc = `images/result-${type.key}-${genderSuffix}.png`;

  return (
    <div className="fade-in">
      {/* 결과 헤더 */}
      <div style={{ ...styles.resultHead, background: c.bg }}>
        <div style={{ ...styles.kicker, color: c.accent }}>연애 유형 결과</div>
        <div style={{ fontSize: 14, color: c.accent, marginTop: 12, opacity: 0.9 }}>
          {user.name || "당신"}님은
        </div>
        <div style={styles.resultName}>'{type.name}'</div>
        <div style={{ ...styles.resultEmoji, background: c.chip }}>{type.emoji}</div>
        <div style={{ fontSize: 13, color: c.accent, marginTop: 14 }}>{type.tagline}</div>
      </div>

      {/* 유형별 일러스트 */}
      <div style={{ background: c.bg, paddingBottom: 24, textAlign: "center" }}>
        <img
          src={imgSrc}
          alt={type.name}
          style={{ width: "100%", maxWidth: 320, display: "block", margin: "0 auto", borderRadius: 16 }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      </div>

      <div style={styles.pad}>
        <p style={styles.resultDesc}>{type.desc}</p>

        {/* 블러 처리된 잠긴 결과 */}
        <div style={styles.lockWrap}>
          <div style={styles.lockBlur}>
            <p style={styles.lockLine}>{user.name || "당신"}님이 빠지기 쉬운 연애 함정은</p>
            <p style={styles.lockLine}>올해 인연이 들어오는 시기는 ○월</p>
            <p style={styles.lockLine}>{user.name || "당신"}님과 환상의 궁합인 유형은</p>
          </div>
          <div style={styles.lockOverlay}>
            <span style={styles.lockBadge}>🔒 전체 결과 잠김</span>
          </div>
        </div>

        {/* 소모임 유도 카드 */}
        <div style={styles.promo}>
          <div style={styles.promoTitle}>
            {user.name || "당신"}님 같은 '{type.name.replace("형", "")}'이<br />가장 잘 맞는 모임이 열려요
          </div>
          <div style={styles.promoRow}><span>👥</span> 같은 유형 78%가 이미 신청했어요</div>
          <div style={{ ...styles.promoRow, color: T.coralDeep }}><span>⏰</span> 이번 주 모임 · 마감까지 3자리</div>
        </div>

        {/* 미리 채워진 정보 */}
        <div style={styles.prefill}>
          <div style={styles.prefillLabel}>입력하신 정보로 바로 신청돼요</div>
          <PrefillRow k="이름"   v={user.name || "—"} />
          <PrefillRow k="연락처" v={maskPhone(user.phone)} />
          <PrefillRow k="관심"   v={user.interest} />
        </div>

        {/* 3초 신청 버튼 */}
        <button onClick={onApply} style={styles.cta}>3초 만에 소모임 신청 완료</button>
        <p style={styles.fineprint}>신청하면 잠긴 전체 결과도 함께 보내드려요</p>
      </div>
    </div>
  );
}
