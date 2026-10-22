// 下拉選項依代號（商品／服務／卡券代號、員工編號）排序用的比較函式（Jason 2026/10/22 fix all）。
// 原本各元件寫成 a.no - b.no，只對純數字代號有效；英數代號（A01、B02）相減得 NaN，排序失效、維持後端順序。
// 改為字串自然排序（數字部分依數值：2 在 10 前、A2 在 A10 前）；沒有代號（null／undefined／空字串／只有空白）一律排最後。
const toKey = no => String(no ?? '').trim()

export default function compareNo(a, b) {
  const x = toKey(a)
  const y = toKey(b)
  if (!x || !y) return (x ? 0 : 1) - (y ? 0 : 1)
  return x.localeCompare(y, 'zh-Hant', { numeric: true })
}
