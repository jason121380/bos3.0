// 平均值：分母為 0／不是有限數時回 0，避免報表在沒有帳單的日子顯示 NaN／Infinity（2026/10/28 稽核 B-08）
export default function averageOf(total, count) {
  const t = Number(total)
  const c = Number(count)
  if (!Number.isFinite(t) || !Number.isFinite(c) || c === 0) return 0
  return t / c
}
