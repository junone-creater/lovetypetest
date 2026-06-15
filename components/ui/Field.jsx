import React from "react";
import { styles } from "../../styles/styles";

export default function Field({ label, optional, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={styles.label}>
        {label} {optional && <span style={{ color: "#B8AE9F" }}>(선택)</span>}
      </label>
      {children}
    </div>
  );
}
