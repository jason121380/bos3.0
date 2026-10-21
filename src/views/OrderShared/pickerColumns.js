import idx from 'idx'
import { formatNumber } from 'ui/format'

// ItemPickerModal 的表格欄位（「加入」欄之後）。打帳單與其他三頁的服務／卡券選擇窗邏輯不同、畫面相同，欄位寫在這裡共用
export const SERVICE_COLUMNS = [
  { header: '代號', cell: data => data.no },
  { header: '類別', cell: data => idx(data, _ => _.serviceCategory.name) },
  { header: '名稱', cell: data => data.name },
  { header: '參考價格', numeric: true, cell: data => formatNumber(data.price) },
]

const couponColumns = withCategory => [
  { header: '代號', cell: coupon => coupon.no },
  // 卡券類別欄只有打帳單有
  ...(withCategory ? [{ header: '類別', cell: coupon => idx(coupon, _ => _.ServiceCategory.name) }] : []),
  { header: '名稱', cell: coupon => coupon.name },
  { header: '參考價格', numeric: true, cell: coupon => formatNumber(coupon.price) },
  { header: '可使用次數', numeric: true, cell: coupon => formatNumber(coupon.ticketAvailableCount) },
]

export const COUPON_COLUMNS_WITH_CATEGORY = couponColumns(true)
export const COUPON_COLUMNS = couponColumns(false)
