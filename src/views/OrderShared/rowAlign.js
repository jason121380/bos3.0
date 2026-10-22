// 帳單項目列（服務、店販、預收卡、會員卡、使用預收卡；四個帳單頁共用）的對齊 className。
// 列容器用 items-start：同一列各欄位的標籤與輸入框上緣在同一水平線，永久會籍勾選框、扣完後業績、錯誤訊息等附屬內容
// 排在各自欄位的下方，不會把該欄往上推（2026/10/22，Jason：「欄位要水平對齊，box 在下方」）。
// 沒有標籤的元素（圖示鈕、佔位、單獨的勾選框）以上方位移與輸入框垂直置中。數值以瀏覽器實測：
//   Field 標籤高 20px＋間距 6px → 輸入框上緣在 26px；輸入框高 36px（手機 max-sm 40px）；
//   服務人員欄、使用預收卡的助理欄（EmployeeAutoComplete size="medium"）同為 36px／手機 40px（2026/10/22 起；原本 small 34px，比同列矮 2px）；
//   RowIconButton 與佔位 32px。

// 32px 圖示鈕／佔位與一般輸入框置中：26 + (36 - 32) / 2 = 28；手機 26 + (40 - 32) / 2 = 30
export const ROW_ICON_ALIGN = 'mt-[28px] max-sm:mt-[30px]'

// 沒有標籤的勾選框／說明文字：佔一個輸入框的高度、內容垂直置中
export const ROW_INLINE_ALIGN = 'mt-[26px] flex h-9 items-center max-sm:h-10'
