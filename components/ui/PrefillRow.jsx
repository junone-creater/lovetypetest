import React from "react";
import { T } from "../../constants/tokens";
import { styles } from "../../styles/styles";

export default function PrefillRow({ k, v }) {
  return (
    <div style={styles.prefillRow}>
      <span style={{ color: T.sub }}>{k}</span>
      <span style={{ color: T.ink }}>{v} <span style={{ color: T.green }}>✓</span></span>
    </div>
  );
}
