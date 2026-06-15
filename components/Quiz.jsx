import React from "react";
import { T } from "../constants/tokens";
import { styles } from "../styles/styles";

export default function Quiz({ q, index, total, onAnswer }) {
  const pct = Math.round((index / total) * 100);
  return (
    <div style={styles.pad} className="fade-in" key={index}>
      <div style={styles.progressTop}>
        <span style={styles.qcount}>Q{index + 1} <span style={{ color: T.line }}>/ {total}</span></span>
        <div style={styles.bar}>
          <div style={{ ...styles.barFill, width: `${pct + 100 / total}%` }} />
        </div>
      </div>

      <div style={{ height: 28 }} />
      <h2 style={styles.qtext}>{q.q}</h2>
      <div style={{ height: 20 }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {q.options.map((op, i) => (
          <button key={i} onClick={() => onAnswer(op.score)} style={styles.option} className="option-btn">
            <span style={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
            <span>{op.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
