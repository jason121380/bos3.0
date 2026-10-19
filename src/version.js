// 畫面顯示用的 build 短版號（單一來源；TopBar／Auth Topbar 都讀這裡）
// 格式：v3.0-MMDD-HHmm（Asia/Taipei，commit 當下的月日與時分），例如 v3.0-1019-0232
// 紀律：每個完整 commit 都要更新此檔，並與 commit 訊息第一行 [版號] 一致
// 不自行升大版號（v3.1 等由 Jason 決定）；不要用 package.json 的 version（與產品版號無關）
export const APP_VERSION = 'v3.0-1019-1431'
