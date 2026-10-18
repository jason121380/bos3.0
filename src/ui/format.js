// 數字顯示格式（STYLE.md §7）：只在整數部分加千分位，小數位與原值完全相同（不四捨五入）。
// 非數字（undefined、null、空字串）原樣回傳，與舊畫面顯示一致。
export const formatNumber = value => {
  if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) return value
  const [int, dec] = String(value).split('.')
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return dec === undefined ? grouped : `${grouped}.${dec}`
}

export const formatMoney = value => `NT$ ${formatNumber(value) ?? 0}`
