import { useEffect, useState } from 'react'
import produce from 'immer'
import _ from 'lodash'

// 預約狀態色（四個預約週曆與本圖例的唯一來源，Jason 2026/10/21「所有預約表改成更符合主題的配色」）：
// 與品牌藍 #1A73E8 同家族的 Google 色系，保留各狀態原本的色相（不指定＝粉、待審核＝青、待確認＝橘黃），讓櫃台的辨識習慣不變；
// 不可預約為中灰（深藍在深色模式背景上幾乎看不見）。Jason 2026/10/21「預約的新配色文字白」：全部取足以配白字的深度，
// 白字對比皆 ≥ 4.5:1，readableTextOn 因此一律選白字（有測試）。
export const RESERVATION_COLORS = {
  unavailable: '#5F6368', // 不可預約（公休、休息、全店不可預約）
  pending: '#00838F', // 待審核
  event: '#188038', // 事件
  cusCheck: '#B06000', // 未來預訂（待確認）
  nonDesignate: '#D81B60', // 預約成功（不指定）
  designate: '#1A73E8', // 預約成功（指定）＝品牌藍
  done: '#8B6F5A', // 已完成預約（已開單），灰褐：與不可預約的中灰區分
  completed: '#9334E6', // 預約狀態為「已完成」
  checkedIn: '#137333', // 報到成功（比事件的綠深一階，兩者不同色）
  notCheckedIn: '#6B7280', // 未報到
}

// 依底色相對亮度選字色（WCAG 2.x）：白字與深字取對比較高者。底色是固定的狀態色（不隨深淺色主題變），字色因此也用固定值。
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
  { label: '報到成功', color: RESERVATION_COLORS.checkedIn, display: true },
  { label: '未報到', color: RESERVATION_COLORS.notCheckedIn, display: true },
]

export default function ({
  eventDisplay = false, bookingCusCheck = false, checkinMode = false,
  bookingHistoryDisplay = false
}) {
  const [statusArray, setStatusArray] = useState([
    { label: '不可預約', color: RESERVATION_COLORS.unavailable, display: true },
    { label: '待審核', color: RESERVATION_COLORS.pending, display: true },
    { label: '事件', color: RESERVATION_COLORS.event, display: false },
    { label: '未來預訂 (待確認)', color: RESERVATION_COLORS.cusCheck, display: false },
    { label: '預約成功 (不指定)', color: RESERVATION_COLORS.nonDesignate, display: true },
    { label: '預約成功 (指定)', color: RESERVATION_COLORS.designate, display: true },
    { label: '已完成預約', color: RESERVATION_COLORS.done, display: false },
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
