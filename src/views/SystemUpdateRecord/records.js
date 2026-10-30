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
    title: '2026/10/30 不再整頁重新整理',
    versionNo: 'v3.10301525',
    updateTime: '2026-10-30',
    content: [
      '- 解除日結、薪資解鎖與刪除月結紀錄、上傳大頭照、會員卡紀錄與分類刪除後，只更新畫面資料，不再整頁重新整理（保留篩選與捲動位置）',
      '- 重新開單失敗時保留櫃檯已修改的內容與錯誤訊息，可再按一次',
      '- 員工日報表：開啟四捨五入時換日期，列印不再印到前一天的資料',
      '- 每日金流：會員卡設定晚到時不再漏掉「會員卡消費」列；待日結帳單全選後勾選框正確顯示',
      '- 預約週曆：過長的備註正確套用跑馬燈',
      '- 新增服務：清除互助設定後，協助人員人數下拉一併清空',
      '- 新增服務：「新增」鈕停用時顯示尚缺的欄位',
      '- 帳單列表、掛單列表在手機寬度下標題不再被擠成直排',
      '- 個人頁：尚未設定過功能釘選時不再整頁錯誤',
    ].join('\n'),
  },
  {
    title: '2026/10/28 載入畫面',
    versionNo: 'v3.10282323',
    updateTime: '2026-10-28',
    content: [
      '- 頁面載入較久時，內容區中央顯示轉圈與「載入中…」，不再只有頂端一條細線、看起來像白頁',
      '- 其餘列表、報表與顧客端頁面在查詢失敗時也顯示「無法載入資料」與「重新查詢」',
    ].join('\n'),
  },
  {
    title: '2026/10/28 頁首與報表篩選統一',
    versionNo: 'v3.10282101',
    updateTime: '2026-10-28',
    content: [
      '- 所有報表的日期放在同一列，其他條件收進「篩選」卡片，按「篩選」才展開',
      '- 所有頁面的頁首改用同一種樣式，標題與右側按鈕位置一致',
    ].join('\n'),
  },
  {
    title: '2026/10/28 穩定性與介面修正',
    versionNo: 'v3.10282028',
    updateTime: '2026-10-28',
    content: [
      '- 打帳單、帳單詳細、掛單詳細、QR 打卡在網路或查詢失敗時不再整頁錯誤，改顯示「無法載入資料」與「重新查詢」',
      '- 更多列表與報表頁在查詢失敗時顯示「重新查詢」，不再停在空白畫面',
      '- 錯誤提示不再重複跳兩次',
      '- 角色、支付方式、第三方卡券、進貨單、領料單刪除前會先確認',
      '- 側欄子選單可以用鍵盤（Tab／Enter／Esc）開啟與操作',
      '- 考勤與打卡的遲到、早退、距離除了顏色另加文字標示',
      '- 深色模式下報表、版本紀錄、入金與抽成報表的文字與底色修正',
      '- 營業區間報表沒有帳單的日子單均價顯示 0，不再顯示 NaN',
      '- 首次載入變快（移除未使用的套件、即時連線改為需要時才載入）',
    ].join('\n'),
  },
  {
    title: '2026/10/26 側欄換欄',
    versionNo: 'v3.10260256',
    updateTime: '2026-10-26',
    content: '- 主側欄桌機 hover 細項超過 16 項才換欄（17 項＝第一欄 16＋第二欄 1；16 項以內維持單欄）',
  },
  {
    title: '2026/10/26 側欄細項',
    versionNo: 'v3.10260211',
    updateTime: '2026-10-26',
    content: [
      '- 主側欄 hover 細項改貼近側欄右緣，只留一小段間距',
      '- 細項超過 10 項才換下一欄（一欄最多 10 項）',
      '- 浮層改為貼近視窗上下的滿高，內容由上往下排，超出在浮層內捲動',
    ].join('\n'),
  },
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
