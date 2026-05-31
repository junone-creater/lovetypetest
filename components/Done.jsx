import React from "react";
import { styles } from "../styles/styles";
import UnlockRow from "./ui/UnlockRow";

export default function Done({ type, user, onReset }) {
  return (
    <div style={styles.pad} className="fade-in">
      <div style={{ height: 30 }} />
      <div style={styles.doneCheck}>✓</div>
      <h2 style={{ ...styles.h1, textAlign: "center", fontSize: 24 }}>신청 완료!</h2>
      <p style={{ ...styles.lead, textAlign: "center" }}>
        {user.name}님, 신청이 접수됐어요.<br />곧 입력하신 번호로 안내드릴게요.
      </p>

      <div style={styles.unlockCard}>
        <div style={styles.unlockTitle}>🔓 잠겼던 전체 결과</div>
        <UnlockRow icon="⚠️" title="빠지기 쉬운 연애 함정"    body="좋아하면 상대에게 다 맞춰주다 정작 내 마음을 놓쳐요." />
        <UnlockRow icon="🗓️" title="올해 인연 들어오는 시기"  body="늦봄~초여름, 익숙한 모임 안에서 새로운 인연이 보여요." />
        <UnlockRow icon="💞" title="환상의 궁합 유형"          body="당신의 직진을 편안히 받아주는 '쿨한 척 고수형'." />
      </div>

      <button onClick={onReset} style={styles.ctaGhost}>다시 테스트하기</button>
    </div>
  );
}
