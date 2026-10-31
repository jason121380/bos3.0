// 已知問題清單：掃描發現、尚未修的頁面。這份清單應該要清空——修好一項就刪掉一項。
// 每筆：route（完整路徑，含假參數）、viewports（"mobile"／"desktop"／"all"＝手機＋桌機含深色／"failAll"＝所有查詢失敗情境）、
// skip（略過的檢查：crash／hScroll／console）、reason。
// 「假資料不足」：頁面用假 GraphQL 畫不出來（沒有 schema，清單／欄位形狀猜不到），不是頁面 bug；補 e2e/fake-operations.js（依操作名稱）、
//   e2e/fake-graphql.js 的 FIXTURES（依根欄位），或重跑 e2e/learn-shapes.js 後刪掉。這些頁面仍必須通過「所有查詢失敗」情境。
// 「真 bug」：後端失敗時整頁錯誤（白頁），修好程式後刪掉。
module.exports = []
