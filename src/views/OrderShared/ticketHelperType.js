// 預收卡（使用卡券）一列的助理類型名稱：「服務助理類型-名稱」（例如「洗髮-助理A」）。
// 與打帳單（OrderCreate/CouponUse）、四個帳單頁的服務助理、載入卡券紀錄時補欄位的格式相同；
// 帳單詳細／掛單詳細／重新開單「選卡券」時原本產生「洗髮 - 助理A」，與載入時的格式不同而重複出現欄位（2026/10/22 修正）。
export const ticketHelperType = (type, name) => `${type}-${name}`

// 比對兩個助理類型是否為同一個：舊資料可能存成「洗髮 - 助理A」，比對時忽略「-」前後的空白（只用於去重，存的值不改）
const normalize = type => String(type).replace(/\s*-\s*/g, '-')
export const isSameHelperType = (a, b) => normalize(a) === normalize(b)
