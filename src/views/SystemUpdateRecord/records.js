// 版本更新紀錄的前端靜態清單（由新到舊）。清單頁不再查 GraphQL systemUpdateRecord。
// 來源的 updateTime 是 YYYY-MM-DD。Results 以 date-fns format(updateTime, 'yyyy/MM/dd') 顯示，
// 這裡轉成當地曆日的 timestamp（應用程式已把 Date 換成台灣時間時，即台灣當日開始）。
import { historicalRecords } from './historicalRecords'

export function calendarUpdateTime(isoDate) {
  const [year, month, day] = isoDate.split('-').map(part => parseInt(part, 10))
  return new Date(year, month - 1, day).getTime()
}

const shippedRecords = [
  {
    title: '2026/10/26 側欄',
    versionNo: 'v3.10260058',
    updateTime: '2026-10-26',
    content: [
      '- 主側欄收合為圖示欄時，隱藏搜尋、通知、深淺色切換、切換店家與登出；展開後這些操作仍可使用',
      '- 主側欄桌機 hover 細項浮層整塊留在視窗內；靠近底部時往上移，比視窗高才在浮層內捲動',
      '- 有 hover 的桌機不再用上下開合展開子選單，改以 hover 浮層顯示；左右收合側欄維持不變',
      '- 浮層超過 8 項時改為往右多欄，8 項以內維持單欄',
    ].join('\n'),
  },
  {
    title: '2026/10/25 更新',
    versionNo: 'v3.10251924',
    updateTime: '2026-10-25',
    content: '- 版本更新紀錄的摘要列與展開列，日期改由前端以 yyyy/MM/dd 顯示（#308）',
  },
  {
    title: '2026/10/25 元件 UI',
    versionNo: 'v3.10251859',
    updateTime: '2026-10-25',
    content: [
      '- 圖示按鈕的點擊區至少 40×40（#307）',
      '- IndexSelect 關閉時仍看得到目前選取的值；打開的選單不會被視窗裁掉（#307）',
      '- 右下角提示在滑鼠移入或聚焦時暫停倒數（#307）',
    ].join('\n'),
  },
  {
    title: '2026/10/25 工程模式',
    versionNo: 'v3.10251836',
    updateTime: '2026-10-25',
    content: [
      '- 側欄只對角色名稱為高階主管的登入者顯示工程模式（#306）',
      '- 進入工程模式需輸入密碼，正確後才顯示前端健康檢查（#306）',
      '- 登出時清除本分頁的工程模式解鎖（#306）',
    ].join('\n'),
  },
]

// 標題、版本、日期字串、內文。歷史 18 筆與匯出檔相同，前面加上已出貨的紀錄。
export const systemUpdateRecordSource = [...shippedRecords, ...historicalRecords]

export const systemUpdateRecords = systemUpdateRecordSource.map(record => ({
  title: record.title,
  content: record.content,
  versionNo: record.versionNo,
  updateTime: calendarUpdateTime(record.updateTime),
}))
