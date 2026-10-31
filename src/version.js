// 畫面顯示用的 build 短版號（單一來源；登入頁頂列與主側欄底部都讀這裡，Sentry release 也用它）
// 格式：v3.MMDDHHmm（Asia/Taipei，commit 當下的月日時分，中間不加分隔），例如 v3.10210047（Jason 2026/10/21 指定）
// 紀律：每個完整 commit 都要更新此檔，並與 commit 訊息第一行 [版號] 一致
// 不自行升大版號（v4 等由 Jason 決定）；不要用 package.json 的 version（與產品版號無關）

export const APP_VERSION = 'v3.10311917'
