// 帳單列表、掛單列表「報表匯出」是否遮罩客戶姓名與手機（傳入遮罩設定查詢 useQuery 的結果）。
// 只有「這次查詢成功、且設定確定為 false」才匯出完整資料；載入中、查詢失敗（即使快取裡還留著上次的 false）一律遮罩。
// 匯出檔會被下載、轉寄，個資寧可多遮（2026/10/21，Codex review PR #254 兩輪指出設定晚到、查詢失敗、快取舊值三種漏洞）。
const isExportCustomerMasked = queryResult => {
  if (!queryResult || queryResult.loading || queryResult.error) return true
  const setting = queryResult.data ? queryResult.data.getCustomerDataMarkedDefault : undefined
  return setting !== false
}

export default isExportCustomerMasked
