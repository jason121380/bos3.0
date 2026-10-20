import { useEffect, useState } from 'react'
import produce from 'immer'
import _ from 'lodash'

// 依底色相對亮度選字色（WCAG 2.x）：白字與深字取對比較高者。底色是固定的狀態色（不隨深淺色主題變），字色因此也用固定值。
// 例：#4FC3F7／#BDBDBD／#FF9800／#66BB6A／#F06292／#78909C 改深字（約 5.6–10:1），#202D50／#1A73E8 維持白字（13.5:1／4.51:1）
const DARK_TEXT = '#111111'
const luminance = hex => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '')
  if (!m) return null
  const channel = i => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4)
}
// 也供行事曆格子（各 OrderTable 的預約色塊）使用，讓色塊字色與圖例一致
export const readableTextOn = hex => {
  const bg = luminance(hex)
  if (bg === null) return '#FFFFFF'
  const onWhite = 1.05 / (bg + 0.05)
  const onDark = (bg + 0.05) / (luminance(DARK_TEXT) + 0.05)
  return onDark > onWhite ? DARK_TEXT : '#FFFFFF'
}

const checkin = [
  { label: '報到成功', color: '#1A73E8', display: true },
  { label: '未報到', color: '#78909C', display: true },
]

export default function ({
  eventDisplay = false, bookingCusCheck = false, checkinMode = false,
  bookingHistoryDisplay = false
}) {
  const [statusArray, setStatusArray] = useState([
    { label: '不可預約', color: '#202D50', display: true },
    { label: '待審核', color: '#4FC3F7', display: true },
    { label: '事件', color: '#66BB6A', display: false },
    { label: '未來預訂 (待確認)', color: '#FF9800', display: false },
    { label: '預約成功 (不指定)', color: '#F06292', display: true },
    { label: '預約成功 (指定)', color: '#1A73E8', display: true },
    { label: '已完成預約', color: '#BDBDBD', display: false },
  ])
  document.querySelectorAll('.MuiChip-root').forEach(el => {
    el.classList.remove('MuiChip-root')
  })

  useEffect(() => {
    if (eventDisplay) {
      setStatusArray(
        produce(draft => {
          draft[2].display = true
        })
      )
    }
    if (bookingCusCheck) {
      setStatusArray(
        produce(draft => {
          draft[3].display = true
        })
      )
    }
    if (bookingHistoryDisplay) {
      setStatusArray(
        produce(draft => {
          draft[6].display = true
        })
      )
    }
  }, [eventDisplay, bookingCusCheck, bookingHistoryDisplay])

  return (
    <div className="flex flex-wrap justify-start [&>*]:m-1">
      {(checkinMode ? checkin : statusArray).map(({ label, color, display }) => display ? (
        <span
          key={label + color}
          className="inline-flex h-8 items-center rounded-lg px-3 text-[13px] font-bold"
          style={{ backgroundColor: color, color: readableTextOn(color) }}
        >
          {label}
        </span>
      ) : null)}
    </div>
  )
}
