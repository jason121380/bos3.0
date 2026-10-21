// 掛單列表的純函式與固定欄樣式（自 ResultsV2.js 原樣搬出，行為不變）
import { cn } from 'ui/utils'

// 寬表（min-w 1400px）橫向捲動時固定「操作」與「帳單編號/時間」兩欄（只限螢幕，列印還原為一般欄位；比照帳單列表）：
// - sm 以上兩欄都固定：操作欄寬固定 188px（勾選 16＋間距 4＋四顆 32px 圖示鈕與間距＋左右 12px 內距），帳單編號欄接在 left-[188px]
// - 手機（< 640px）可視寬度約 320px，兩欄合計超過一半，只固定帳單編號欄（操作欄隨內容捲走，捲回最左即可操作）
// 底色跟著列：一般 surface（卡片底），hover／勾選時 surface-hover；右緣 1px 分隔線
const STICKY_BASE = 'bg-surface group-hover:bg-surface-hover group-data-[state=selected]:bg-surface-hover print:static print:bg-transparent print:shadow-none'
const STICKY_ACTION = 'sm:sticky sm:left-0 sm:w-[188px] sm:min-w-[188px]'
const STICKY_NO = 'sticky left-0 sm:left-[188px] shadow-[1px_0_0_rgb(var(--border))]'
export const STICKY_ACTION_HEAD = cn('w-[160px]', STICKY_ACTION, 'z-[3] bg-surface print:static print:bg-transparent')
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

// 第三方卡券名稱（原為元件內的同名函式；只讀傳入的 order）
export const serviceOrders = (order) => {
  const arr = []
  let returnString = ''

  order.serviceOrders.forEach(d => {
    if (d.thirdPartyPayName) {
      arr.push(d.thirdPartyPayName)
    }
  })
  arr.forEach((element, index) => {
    if (index !== 0) {
      returnString = returnString + ', 含 ' + element
    } else {
      returnString = '含 ' + element
    }
  })
  return returnString
}
export const productOrders = (order) => {
  const arr = []
  let returnString = ''

  order.productOrders.forEach(d => {
    if (d.thirdPartyPayName) {
      arr.push(d.thirdPartyPayName)
    }
  })
  arr.forEach((element, index) => {
    if (index !== 0) {
      returnString = returnString + ', 含 ' + element
    } else {
      returnString = '含 ' + element
    }
  })
  return returnString
}
export const membershipOrders = (order) => {
  const arr = []
  let returnString = ''

  order.membershipOrders.forEach(d => {
    if (d.thirdPartyPayName) {
      arr.push(d.thirdPartyPayName)
    }
  })
  arr.forEach((element, index) => {
    if (index !== 0) {
      returnString = returnString + ', 含 ' + element
    } else {
      returnString = '含 ' + element
    }
  })
  return returnString
}
export const thirdParty = (order) => {
  const arr = []
  let returnString = ''

  order.serviceOrders.forEach(d => {
    if (d.thirdPartyPayName) {
      arr.push(d.thirdPartyPayName)
    }
  })

  order.productOrders.forEach(d => {
    if (d.thirdPartyPayName) {
      if (!arr.find(elm => elm === d.thirdPartyPayName)) {
        arr.push(d.thirdPartyPayName)
      }
    }
  })

  arr.forEach((element, index) => {
    if (index !== 0) {
      returnString = returnString + ', 含 ' + element
    } else {
      returnString = '含 ' + element
    }
  })
  return returnString
}
