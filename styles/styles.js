import { T, FONT } from "../constants/tokens";

export const styles = {
  // ── 레이아웃 ──────────────────────────────────────────
  viewport: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "radial-gradient(circle at 30% 0%, #F3EAD9 0%, " + T.cream + " 55%)",
    padding: "24px 12px", fontFamily: FONT,
  },
  phone: {
    width: "100%", maxWidth: 390, background: T.card, borderRadius: 28, overflow: "hidden",
    boxShadow: "0 20px 60px rgba(74,27,12,.12), 0 2px 8px rgba(0,0,0,.04)",
    border: `1px solid ${T.line}`,
  },
  pad: { padding: "26px 22px 30px" },

  // ── 브랜드 ──────────────────────────────────────────
  brandRow:  { display: "flex", alignItems: "center", gap: 8 },
  brandDot:  { width: 9, height: 9, borderRadius: "50%", background: T.green, display: "inline-block" },
  brandText: { fontSize: 13, fontWeight: 700, color: T.greenDeep, letterSpacing: ".5px" },

  // ── 타이포 ──────────────────────────────────────────
  kicker: { fontSize: 12, fontWeight: 600, color: T.coralDeep, letterSpacing: "1.5px" },
  h1:     { fontSize: 26, fontWeight: 700, color: T.ink, lineHeight: 1.35, margin: "10px 0 0" },
  lead:   { fontSize: 14, color: T.sub, lineHeight: 1.6, marginTop: 12 },
  label:  { display: "block", fontSize: 13, color: T.sub, marginBottom: 7, fontWeight: 500 },

  // ── 입력 폼 ──────────────────────────────────────────
  input: {
    width: "100%", padding: "13px 14px", fontSize: 15, fontFamily: FONT,
    border: `1.5px solid ${T.line}`, borderRadius: 12, background: "#FCFAF6", color: T.ink,
  },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: {
    fontSize: 13, padding: "9px 14px", borderRadius: 20, border: "1.5px solid transparent",
    cursor: "pointer", fontFamily: FONT, fontWeight: 500,
  },

  // ── 버튼 ──────────────────────────────────────────
  cta: {
    width: "100%", background: T.green, color: "#fff", border: "none", borderRadius: 14,
    padding: "15px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: FONT,
    boxShadow: "0 8px 20px rgba(29,158,117,.28)",
  },
  ctaGhost: {
    width: "100%", background: "transparent", color: T.sub, border: `1.5px solid ${T.line}`,
    borderRadius: 14, padding: "13px", fontSize: 14, fontWeight: 600, cursor: "pointer",
    fontFamily: FONT, marginTop: 18,
  },
  fineprint: { textAlign: "center", fontSize: 11, color: "#B8AE9F", marginTop: 12 },

  // ── 퀴즈 ──────────────────────────────────────────
  progressTop: { display: "flex", alignItems: "center", gap: 12 },
  qcount:      { fontSize: 14, fontWeight: 700, color: T.coralDeep, whiteSpace: "nowrap" },
  bar:         { flex: 1, height: 6, background: "#F0EBE2", borderRadius: 6, overflow: "hidden" },
  barFill:     { height: "100%", background: `linear-gradient(90deg, ${T.amber}, ${T.coral})`, borderRadius: 6, transition: "width .4s ease" },
  qtext:       { fontSize: 20, fontWeight: 700, color: T.ink, lineHeight: 1.45, margin: 0 },
  option: {
    display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
    padding: "15px 16px", fontSize: 14.5, color: T.ink, background: "#FCFAF6",
    border: `1.5px solid ${T.line}`, borderRadius: 14, cursor: "pointer", fontFamily: FONT, fontWeight: 500,
  },
  optionLetter: {
    width: 26, height: 26, borderRadius: 8, background: "#fff", border: `1px solid ${T.line}`,
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
    fontWeight: 700, color: T.coralDeep, flexShrink: 0,
  },

  // ── 결과 ──────────────────────────────────────────
  resultHead: { padding: "30px 22px 26px", textAlign: "center" },
  resultName: { fontSize: 26, fontWeight: 800, color: "#fff", marginTop: 4, lineHeight: 1.3 },
  resultEmoji: {
    width: 64, height: 64, borderRadius: "50%", margin: "16px auto 0",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30,
  },
  resultDesc: { fontSize: 14, color: T.sub, lineHeight: 1.65, margin: "4px 0 0" },

  // ── 잠금 블러 ──────────────────────────────────────────
  lockWrap:    { position: "relative", marginTop: 16, borderRadius: 12, overflow: "hidden" },
  lockBlur:    { filter: "blur(5px)", userSelect: "none", background: T.cream, padding: "16px 14px" },
  lockLine:    { fontSize: 13, color: T.sub, margin: "0 0 8px" },
  lockOverlay: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  lockBadge: {
    fontSize: 13, fontWeight: 600, color: T.coralDeep, background: T.coralSoft,
    padding: "8px 16px", borderRadius: 18,
  },

  // ── 프로모 ──────────────────────────────────────────
  promo:      { background: T.greenSoft, borderRadius: 16, padding: 18, marginTop: 18 },
  promoTitle: { fontSize: 14.5, fontWeight: 700, color: T.greenDeep, lineHeight: 1.5 },
  promoRow:   { display: "flex", alignItems: "center", gap: 7, marginTop: 9, fontSize: 12.5, color: T.greenDeep },

  // ── 미리채움 ──────────────────────────────────────────
  prefill:      { marginTop: 14, padding: "14px 16px", border: `1.5px dashed ${T.line}`, borderRadius: 12 },
  prefillLabel: { fontSize: 11.5, color: "#B8AE9F", marginBottom: 8 },
  prefillRow:   { display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0" },

  // ── 완료 ──────────────────────────────────────────
  doneCheck: {
    width: 64, height: 64, borderRadius: "50%", background: T.green, color: "#fff",
    fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 18px", boxShadow: "0 10px 24px rgba(29,158,117,.32)",
  },
  unlockCard:  { background: T.cream, borderRadius: 16, padding: 18, marginTop: 22 },
  unlockTitle: { fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 12 },
  unlockRow:   { display: "flex", gap: 12, alignItems: "flex-start", padding: "9px 0", borderTop: `1px solid ${T.line}` },
};
