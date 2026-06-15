import React from "react";
import { T } from "../constants/tokens";
import { TYPES } from "../constants/types";
import { formatPhone } from "../utils/phone";
import { styles } from "../styles/styles";
import Field from "./ui/Field";

export default function Intro({ user, setUser, onStart }) {
  const valid = user.name.trim().length > 0 && user.phone.replace(/[^0-9]/g, "").length >= 10 && user.gender !== "";
  const interests = ["사주 연애 상담", "3코어 매직", "잘 모르겠어요"];

  return (
    <div style={styles.pad} className="fade-in">
      <div style={styles.brandRow}>
        <span style={styles.brandDot} />
        <span style={styles.brandText}>이음나루</span>
      </div>

      <div style={{ height: 18 }} />
      <div style={styles.kicker}>연애 심리 테스트</div>
      <h1 style={styles.h1}>나는 연애할 때<br />어떤 사람일까?</h1>
      <p style={styles.lead}>5가지 질문으로 알아보는 내 연애 유형.<br />결과는 바로 확인할 수 있어요.</p>

      <div style={{ height: 24 }} />
      <Field label="이름">
        <input
          style={styles.input}
          placeholder="홍길동"
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />
      </Field>
      <Field label="연락처">
        <input
          style={styles.input}
          placeholder="010-0000-0000"
          inputMode="numeric"
          value={user.phone}
          onChange={(e) => setUser({ ...user, phone: formatPhone(e.target.value) })}
        />
      </Field>

      <Field label="성별">
        <div style={{ display: "flex", gap: 10 }}>
          {[{ val: "여자", emoji: "👩" }, { val: "남자", emoji: "👨" }].map(({ val, emoji }) => {
            const on = user.gender === val;
            return (
              <button
                key={val}
                onClick={() => setUser({ ...user, gender: val })}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 12, border: `1.5px solid`,
                  borderColor: on ? T.green : T.line,
                  background: on ? "#E8F5F0" : "#FCFAF6",
                  color: on ? T.greenDeep : T.sub,
                  fontFamily: "inherit", fontSize: 15, fontWeight: 600,
                  cursor: "pointer", transition: "all .15s",
                }}
              >
                {emoji} {val}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="관심 있는 것" optional>
        <div style={styles.chips}>
          {interests.map((it) => {
            const on = user.interest === it;
            return (
              <button
                key={it}
                onClick={() => setUser({ ...user, interest: it })}
                style={{
                  ...styles.chip,
                  background: on ? TYPES.keeper.color.soft : "#F3EFE8",
                  color: on ? TYPES.cool.color.chip : T.sub,
                  borderColor: on ? T.green : "transparent",
                }}
              >
                {it}
              </button>
            );
          })}
        </div>
      </Field>

      <div style={{ height: 8 }} />
      <button
        onClick={onStart}
        disabled={!valid}
        style={{ ...styles.cta, opacity: valid ? 1 : 0.45, cursor: valid ? "pointer" : "not-allowed" }}
      >
        테스트 시작하기
      </button>
      <p style={styles.fineprint}>🔒 입력하신 정보는 결과 안내 목적으로만 사용돼요</p>
    </div>
  );
}
