// 設計師細項分析的比例與單價（2026/10/22 覆蓋率第三波 V9）：
// 原本各處以 isNaN(a / b) 判斷分母為 0，只擋得住 0÷0（NaN），分子不為 0 時得到 Infinity，畫面顯示「Infinity%」「Infinity」。
// 分母為 0（結果不是有限數字）一律當 0。
const finiteOrZero = value => (Number.isFinite(value) ? value : 0)

// 占比（%）：小數 2 位的字串
export const percent = (part, total) => (finiteOrZero(part / total) * 100).toFixed(2)

// 單價：無條件捨去到整數（金額先四捨五入再除，與原本服務項目的「單項客單價」相同）
export const unitPrice = (amount, count) => Math.floor(finiteOrZero(Math.round(amount) / count))
