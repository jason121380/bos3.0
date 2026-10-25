import clsx from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// 讓 tailwind-merge 認得 STYLE.md 的字級名稱，避免 text-body 與 text-text 被視為同類而互相覆蓋
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'title', 'heading', 'body', 'label', 'caption'] }],
    },
  },
})

// 合併 className，後者覆蓋前者的同類 Tailwind 樣式
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// 所有可點元素共用的 focus 樣式：2px accent 外框（STYLE.md §6、§9）
export const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-background'

// 視覺小於 40px 的圖示鈕：手機以置中的透明 40×40 偽元素擴大命中區，不改外框尺寸（STYLE §9）
export const phoneIconHit =
  "relative max-sm:before:pointer-events-auto max-sm:before:absolute max-sm:before:left-1/2 max-sm:before:top-1/2 max-sm:before:h-10 max-sm:before:w-10 max-sm:before:-translate-x-1/2 max-sm:before:-translate-y-1/2 max-sm:before:content-['']"
