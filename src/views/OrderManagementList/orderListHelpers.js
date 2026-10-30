// 帳單列表的純函式與固定欄樣式（自 ResultsV2.js 原樣搬出，行為不變）
import { cn } from 'ui/utils'

// 寬表（min-w 1400px）橫向捲動時固定「操作」與「帳單編號/時間」兩欄（只限螢幕，列印還原為一般欄位）：
// - sm 以上兩欄都固定：操作欄寬固定 152px（勾選 16＋間距 4＋三顆 32px 圖示鈕與間距＋左右 12px 內距），帳單編號欄接在 left-[152px]
// - 手機（< 640px）可視寬度約 320px，兩欄合計超過一半，只固定帳單編號欄（操作欄隨內容捲走，捲回最左即可操作）
// 底色跟著列：一般 surface（卡片底），hover／勾選時 surface-hover；右緣 1px 分隔線
const STICKY_BASE =
  'bg-surface group-hover:bg-surface-hover group-data-[state=selected]:bg-surface-hover print:static print:bg-transparent print:shadow-none'
const STICKY_ACTION = 'sm:sticky sm:left-0 sm:w-[152px] sm:min-w-[152px]'
const STICKY_NO = 'sticky left-0 sm:left-[152px] shadow-[1px_0_0_rgb(var(--border))]'
export const STICKY_ACTION_HEAD = cn('w-[132px]', STICKY_ACTION, 'z-[3] bg-surface print:static print:bg-transparent')
export const STICKY_NO_HEAD = cn(STICKY_NO, 'z-[3] bg-surface print:static print:bg-transparent print:shadow-none')
export const STICKY_ACTION_CELL = cn(STICKY_ACTION, 'z-[2]', STICKY_BASE)
export const STICKY_NO_CELL = cn(STICKY_NO, 'z-[2]', STICKY_BASE)

// 星期顯示（原為元件內的同名函式；不依賴 state，搬到模組層）
export const weekDisplay = week => {
  switch (week) {
    case 'Monday':
      return '(一)'
    case 'Tuesday':
      return '(二)'
    case 'Wednesday':
      return '(三)'
    case 'Thursday':
      return '(四)'
    case 'Friday':
      return '(五)'
    case 'Saturday':
      return '(六)'
    case 'Sunday':
      return '(日)'
    default:
      break
  }
}

// 第三方卡券名稱（原為元件內的同名函式；只讀傳入的 names）
export const renderTpName = names => {
  let returnString = ''
  const arr = names.map(d => d)
  arr.forEach((element, index) => {
    if (index !== 0) {
      returnString = returnString + ', 含 ' + element
    } else {
      returnString = '含 ' + element
    }
  })
  return returnString
}

// 不可點的列操作（建立中帳單）：連結無 disabled 屬性，改用 aria-disabled + 取消指標事件
export const linkDisabled = disabledLink => (disabledLink ? { 'aria-disabled': true, tabIndex: -1, className: 'pointer-events-none opacity-40' } : {})
