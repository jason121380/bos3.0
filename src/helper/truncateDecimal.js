// 無條件捨去到指定小數位（預設 2 位），並修正浮點誤差。
// 原寫法 parseInt(x * 100) / 100 會因 0.57 * 100 = 56.99999999999999 而顯示 0.56；
// 先以 toFixed(6) 消除乘法誤差再捨去，結果與「無條件捨去」的原意一致（12.345 → 12.34）。
const truncateDecimal = (value, precision = 2) => {
  const factor = Math.pow(10, precision)
  return Math.trunc(Number((Number(value) * factor).toFixed(6))) / factor
}

export default truncateDecimal
