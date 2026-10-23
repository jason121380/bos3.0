import idx from 'idx'

// 操作密碼設定（merchantPassword.<key>.isUsing）是否要先輸入密碼。
// 只有「這次查詢成功、且設定確定為 false」才不需要密碼；載入中、查詢失敗、值不明一律要求密碼，
// 避免讀不到設定時跳過店家開啟的保護（fail closed，Codex review PR #270 P1）。傳入密碼設定查詢 useQuery 的結果。
const isPasswordRequired = (queryResult, key) => {
  if (!queryResult || queryResult.loading || queryResult.error) return true
  return idx(queryResult, _ => _.data.merchantPassword[key].isUsing) !== false
}

export default isPasswordRequired
