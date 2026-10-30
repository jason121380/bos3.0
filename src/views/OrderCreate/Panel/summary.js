import { formatMoney } from 'ui/format'

// 收合卡片右側的摘要（只讀取畫面已有的帳單資料，不參與任何計算或送出）。
// 沒有填任何項目就回傳空字串，標題列不顯示摘要。
export const panelSummary = (count, total) => (count > 0 ? `已填 ${count} 筆${total === undefined ? '' : ` · ${formatMoney(total)}`}` : '')
