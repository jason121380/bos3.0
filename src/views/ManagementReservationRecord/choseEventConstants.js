// ChoseEvent（預約單日紀錄的預約詳情窗）的模組層級常數：自 ChoseEvent.js 原樣搬出（2026/10/21），內容未改。

// 動作列（原 ListItemButton）：整列可點、左側頭像＋文字；hover surface-hover、停用 40% 透明
export const actionRow = 'ui-root flex min-h-12 w-full items-center gap-4 rounded-md border-0 bg-transparent px-4 py-2 text-left text-body text-text no-underline transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-40 aria-disabled:opacity-40 outline-none focus-visible:ring-2 focus-visible:ring-accent'

// 原 emotion styles 逐值轉 Tailwind（spacing 單位 8px；原 `!important` 以 `!` 前綴保留）。
// breakWord／eventWrap 掛在 .MuiTypography-body1 上：display-compat 的 .MuiTypography-body1（單一 class、排在 Tailwind 之後）原本被
// 後插入的 emotion 蓋過，字級改用 [&&]（雙 class 權重）維持 14px。eventWrap 的 '& .MuiInputBase-multiline' 在 ui/text-field
// （不輸出該 class）不命中、textarea 為空規則，皆為死碼不轉；datepicker 的 '.MuiSelect-select' 一併保留原選擇器
export const styles = {
  field: '!mb-[16px]',
  field2: 'flex items-end mb-[16px]',
  breakWord: '[&&]:text-[14px] [&_div]:break-all',
  eventWrap: 'gap-[4px] flex flex-col [&_div]:break-all [&_div.info]:flex [&_div.info]:gap-[8px] [&_div.info_div:first-child]:shrink-0 [&_div.info_div:last-child]:grow [&_div.info_div:last-child]:mb-[12px]',
  datepicker: '[&_input]:!p-[6px_0_7px] [&_.MuiSelect-select]:!p-[6px_0_7px]',
}

export const designate = [
  { label: '指定', value: true },
  { label: '不指定', value: false },
]

export const timeCostArray = [
  { label: '30分鐘', value: 1 },
  { label: '1小時', value: 2 },
  { label: '1.5小時', value: 3 },
  { label: '2小時', value: 4 },
  { label: '2.5小時', value: 5 },
  { label: '3小時', value: 6 },
  { label: '3.5小時', value: 7 },
  { label: '4小時', value: 8 },
  { label: '4.5小時', value: 9 },
  { label: '5小時', value: 10 },
  { label: '5.5小時', value: 11 },
  { label: '6小時', value: 12 },
  { label: '6.5小時', value: 13 },
  { label: '7小時', value: 14 },
  { label: '7.5小時', value: 15 },
  { label: '8小時', value: 16 }
]

export const timeArr = [
  { label: '5分' , value: 5 },
  { label: '10分' , value: 10 },
  { label: '15分' , value: 15 },
  { label: '20分' , value: 20 },
  { label: '25分' , value: 25 },
  { label: '30分' , value: 30 },
  { label: '35分' , value: 35 },
  { label: '40分' , value: 40 },
  { label: '45分' , value: 45 },
  { label: '50分' , value: 50 },
  { label: '55分' , value: 55 },
  { label: '60分' , value: 60 },
]
