import React from 'react'
import { render, screen } from '@testing-library/react'
import CalendarColorClip, { RESERVATION_COLORS, readableTextOn } from '../CalendarColorClip'

// 為什麼重要：預約色塊上的客人姓名要在櫃台一眼看清楚（WCAG AA 4.5:1），
// 而且圖例的顏色必須與週曆色塊完全相同，否則櫃台會看錯狀態（2026/10/21 前個人頁、員工資料的色塊就與圖例不同色）。

const luminance = hex => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex)
  const channel = i => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4)
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
const toHex = rgb => '#' + rgb.match(/\d+/g).slice(0, 3).map(n => Number(n).toString(16).padStart(2, '0')).join('').toUpperCase()

describe('預約狀態色', () => {
  // Jason 2026/10/21：預約色塊文字一律白色，所以每個狀態色都要深到白字仍達 4.5:1
  it.each(Object.entries(RESERVATION_COLORS))('%s（%s）用白字，且白字對比達 4.5:1', (name, color) => {
    expect(readableTextOn(color)).toBe('#FFFFFF')
    expect(contrast(color, '#FFFFFF')).toBeGreaterThanOrEqual(4.5)
  })

  it('各狀態顏色互不相同（不同狀態不能同色）', () => {
    const values = Object.values(RESERVATION_COLORS)
    expect(new Set(values).size).toBe(values.length)
  })

  it('圖例使用與週曆相同的色票', () => {
    render(<CalendarColorClip eventDisplay bookingCusCheck bookingHistoryDisplay />)
    const expected = {
      '不可預約': RESERVATION_COLORS.unavailable,
      '待審核': RESERVATION_COLORS.pending,
      '事件': RESERVATION_COLORS.event,
      '未來預訂 (待確認)': RESERVATION_COLORS.cusCheck,
      '預約成功 (不指定)': RESERVATION_COLORS.nonDesignate,
      '預約成功 (指定)': RESERVATION_COLORS.designate,
      '已完成預約': RESERVATION_COLORS.done,
    }
    Object.entries(expected).forEach(([label, color]) => {
      expect(toHex(screen.getByText(label).style.backgroundColor)).toBe(color.toUpperCase())
    })
  })

  it('報到模式圖例與色塊同色（報到成功＝綠、未報到＝灰）', () => {
    render(<CalendarColorClip checkinMode />)
    expect(toHex(screen.getByText('報到成功').style.backgroundColor)).toBe(RESERVATION_COLORS.checkedIn.toUpperCase())
    expect(toHex(screen.getByText('未報到').style.backgroundColor)).toBe(RESERVATION_COLORS.notCheckedIn.toUpperCase())
  })
})
