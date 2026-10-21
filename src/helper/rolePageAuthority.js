// 讀登入者角色某一區塊（pageTitle，例如「打卡權限設定」「個人檔案」）的頁面權限清單。
// authorities 為 getMerchantAuthorities 的結果，各角色的 authoritySettings 是 JSON 字串。
// 以角色 id 比對（同名角色不會讀錯）；查詢失敗、找不到角色、設定格式壞掉、缺這個區塊（舊角色、後台新增區塊前建立的角色）
// 一律回傳 []＝沒有權限，頁面照常顯示（2026/10/21，Jason 同意；原本直接取 .pageAuthority 拋錯，整頁變錯誤畫面）。
export const roleSectionAuthority = (authorities, authorityId, pageTitle) => {
  if (!Array.isArray(authorities)) return []
  const role = authorities.find(d => d.id === authorityId)
  if (!role) return []
  let settings
  try {
    settings = JSON.parse(role.authoritySettings)
  } catch (e) {
    return []
  }
  if (!Array.isArray(settings)) return []
  const section = settings.find(d => d && d.pageTitle === pageTitle)
  return Array.isArray(section?.pageAuthority) ? section.pageAuthority : []
}

// 區塊內某一項是否開啟；缺項目視為沒有權限
export const hasPageAuthority = (section, pageName) => section.find(d => d && d.pageName === pageName)?.authority === true
