import React from "react";
import { T } from "../../constants/tokens";
import { styles } from "../../styles/styles";

export default function UnlockRow({ icon, title, body }) {
  return (
    <div style={styles.unlockRow}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: T.ink }}>{title}</div>
        <div style={{ fontSize: 12, color: T.sub, marginTop: 2, lineHeight: 1.5 }}>{body}</div>
      </div>
    </div>
  );
}
