export function formatPhone(v) {
  const n = v.replace(/[^0-9]/g, "").slice(0, 11);
  if (n.length < 4) return n;
  if (n.length < 8) return `${n.slice(0, 3)}-${n.slice(3)}`;
  return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`;
}

export function maskPhone(v) {
  const n = v.replace(/[^0-9]/g, "");
  if (n.length < 8) return v || "—";
  return `${n.slice(0, 3)}-••••-${n.slice(7)}`;
}
