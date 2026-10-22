// 保護：報表與列表頁共用的日期區間選擇。
// 快速選擇（今天、昨天、前天、明天、後天、本週、上週、下週、本月、上個月、下個月）要算出正確的起訖（起日 00:00、迄日 23:59:59.999），
// 同時寫進網址（重新整理或分享網址時保留查詢區間）並回呼頁面；目前區間若剛好是某個快速選項就顯示該名稱。
// 手動選日期：起日晚於迄日時迄日跟著調、迄日早於起日時起日跟著調；onlyStart（單日報表）迄日一律為起日當天結束。
// 進頁時從網址帶回區間（rangelimit 可擋下超出範圍的網址）。
import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns'
import React from 'react'

import { currentLocation, renderPage } from '__tests__/testkit.test'
import DateSelector from 'components/DateSelector'

afterEach(cleanup)

const now = () => new Date()
const range = (s, e) => ({ startDate: s.getTime(), endDate: e.getTime() })
const RANGES = {
  today: ['今天', () => range(startOfDay(now()), endOfDay(now()))],
  yesterday: ['昨天', () => range(startOfDay(subDays(now(), 1)), endOfDay(subDays(now(), 1)))],
  dbyesterday: ['前天', () => range(startOfDay(subDays(now(), 2)), endOfDay(subDays(now(), 2)))],
  tomorrow: ['明天', () => range(startOfDay(addDays(now(), 1)), endOfDay(addDays(now(), 1)))],
  datomorrow: ['後天', () => range(startOfDay(addDays(now(), 2)), endOfDay(addDays(now(), 2)))],
  thisweek: ['本週', () => range(startOfWeek(now()), endOfWeek(now()))],
  lastweek: ['上週', () => range(startOfWeek(subWeeks(now(), 1)), endOfWeek(subWeeks(now(), 1)))],
  nextweek: ['下週', () => range(startOfWeek(addWeeks(now(), 1)), endOfWeek(addWeeks(now(), 1)))],
  thismonth: ['本月', () => range(startOfMonth(now()), endOfMonth(now()))],
  lastmonth: ['上個月', () => range(startOfMonth(subMonths(now(), 1)), endOfMonth(subMonths(now(), 1)))],
  nextmonth: ['下個月', () => range(startOfMonth(addMonths(now(), 1)), endOfMonth(addMonths(now(), 1)))],
}
const ALL_QUICK = Object.keys(RANGES)
const trigger = () => screen.getByRole('combobox', { name: '快速選擇日期區間' })
const pickQuick = title => {
  fireEvent.keyDown(trigger(), { key: 'Enter' })
  fireEvent.keyDown(screen.getByRole('option', { name: title }), { key: 'Enter' })
}

describe('DateSelector 快速選擇', () => {
  it.each(ALL_QUICK)('%s：回呼正確起訖並寫進網址', key => {
    const [title, expected] = RANGES[key]
    const dateChange = jest.fn()
    renderPage(<DateSelector date={{ startDate: 0, endDate: 0 }} attributes={ALL_QUICK} dateChange={dateChange} />)
    pickQuick(title)
    const want = expected()
    expect(dateChange).toHaveBeenCalledWith(want)
    expect(currentLocation()).toBe(`/page?startDate=${want.startDate}&endDate=${want.endDate}`)
  })

  it.each(ALL_QUICK.filter(k => k !== 'nextmonth'))('%s：目前區間相同時下拉顯示該名稱', key => {
    const [title, expected] = RANGES[key]
    renderPage(<DateSelector date={expected()} attributes={ALL_QUICK} />)
    expect(trigger()).toHaveTextContent(title)
  })

  it('下個月沒有「目前區間」判斷：區間剛好是下個月也顯示「快速選擇」', () => {
    renderPage(<DateSelector date={RANGES.nextmonth[1]()} attributes={['nextmonth']} />)
    expect(trigger()).toHaveTextContent('快速選擇')
  })

  it('沒有快速選項時不顯示下拉；停用時下拉與日期鈕都停用；margin 加上外距', () => {
    const { container } = renderPage(<DateSelector date={RANGES.today[1]()} attributes={['startDate']} disabled margin />)
    expect(screen.queryByRole('combobox', { name: '快速選擇日期區間' })).toBeNull()
    expect(screen.getByRole('button', { name: '起始時間' })).toBeDisabled()
    expect(container.querySelector('#DateSelector')).toHaveClass('my-6')
    cleanup()
    renderPage(<DateSelector date={RANGES.today[1]()} attributes={['today']} disabled />)
    expect(trigger()).toBeDisabled()
  })
})

describe('DateSelector 手動選日期', () => {
  const base = { startDate: new Date(2026, 9, 10).getTime(), endDate: endOfDay(new Date(2026, 9, 20)).getTime() }
  const pickDay = (button, label) => {
    fireEvent.click(screen.getByRole('button', { name: button }))
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('gridcell', { name: label }))
  }

  it('顯示起訖日期（預設 yyyy/MM/dd）；選起日回呼並寫網址', () => {
    const dateChange = jest.fn()
    renderPage(<DateSelector date={base} attributes={['startDate', 'endDate']} dateChange={dateChange} />)
    expect(screen.getByRole('button', { name: '起始時間' })).toHaveTextContent('2026/10/10')
    expect(screen.getByRole('button', { name: '結束時間' })).toHaveTextContent('2026/10/20')
    pickDay('起始時間', '2026年10月12日')
    const want = { startDate: new Date(2026, 9, 12).getTime(), endDate: base.endDate }
    expect(dateChange).toHaveBeenCalledWith(want)
    expect(currentLocation()).toBe(`/page?startDate=${want.startDate}&endDate=${want.endDate}`)
  })

  // 已修正（Jason 2026/10/22 fix all）：起訖交錯時原本直接把另一端設成同一個時間點（起日 00:00 或迄日 23:59:59.999），
  // 區間只剩一瞬間、查不到當天資料；改為「那一整天」（起日當天 00:00～23:59:59.999）
  it('起日選在迄日之後：迄日改成起日當天結束（區間為那一整天）', () => {
    const dateChange = jest.fn()
    renderPage(<DateSelector date={base} attributes={['startDate', 'endDate']} dateChange={dateChange} />)
    pickDay('起始時間', '2026年10月25日')
    const start = new Date(2026, 9, 25).getTime()
    const want = { startDate: start, endDate: endOfDay(new Date(2026, 9, 25)).getTime() }
    expect(dateChange).toHaveBeenCalledWith(want)
    expect(currentLocation()).toBe(`/page?startDate=${want.startDate}&endDate=${want.endDate}`)
  })

  it('迄日保留原本的 23:59:59.999；迄日選在起日之前時起日改成迄日當天開始（那一整天）；在起日之後只改迄日', () => {
    const dateChange = jest.fn()
    renderPage(<DateSelector date={base} attributes={['startDate', 'endDate']} dateChange={dateChange} />)
    pickDay('結束時間', '2026年10月5日')
    const end = endOfDay(new Date(2026, 9, 5)).getTime()
    expect(dateChange).toHaveBeenLastCalledWith({ startDate: new Date(2026, 9, 5).getTime(), endDate: end })
    pickDay('結束時間', '2026年10月15日')
    expect(dateChange).toHaveBeenLastCalledWith({ startDate: base.startDate, endDate: endOfDay(new Date(2026, 9, 15)).getTime() })
  })

  it('onlyStart：只有一個「選擇日期」鈕，迄日一律為起日當天結束；可自訂顯示格式', () => {
    const dateChange = jest.fn()
    renderPage(<DateSelector date={base} attributes={['startDate']} onlyStart inputFormat="MM-dd" dateChange={dateChange} />)
    expect(screen.getByRole('button', { name: '選擇日期' })).toHaveTextContent('10-10')
    pickDay('選擇日期', '2026年10月3日')
    expect(dateChange).toHaveBeenCalledWith({
      startDate: new Date(2026, 9, 3).getTime(),
      endDate: endOfDay(new Date(2026, 9, 3)).getTime(),
    })
  })
})

describe('DateSelector 從網址帶回區間', () => {
  const s = new Date(2026, 9, 1).getTime()
  const e = endOfDay(new Date(2026, 9, 31)).getTime()

  it('網址有起訖時進頁就回呼；onlyStart 時迄日改為起日當天結束', () => {
    const dateChange = jest.fn()
    renderPage(<DateSelector date={{ startDate: 0, endDate: 0 }} dateChange={dateChange} />, { route: `/page?startDate=${s}&endDate=${e}` })
    expect(dateChange).toHaveBeenCalledWith({ startDate: s, endDate: e })
    cleanup()
    const onlyStart = jest.fn()
    renderPage(<DateSelector date={{ startDate: 0, endDate: 0 }} onlyStart dateChange={onlyStart} />, { route: `/page?startDate=${s}&endDate=${e}` })
    expect(onlyStart).toHaveBeenCalledWith({ startDate: s, endDate: endOfDay(s).getTime() })
  })

  it('rangelimit 判定超出範圍、getQueryData=false、網址缺起訖時都不回呼', () => {
    const dateChange = jest.fn()
    const rangelimit = jest.fn(() => true)
    renderPage(<DateSelector date={{ startDate: 0, endDate: 0 }} rangelimit={rangelimit} dateChange={dateChange} />, {
      route: `/page?startDate=${s}&endDate=${e}`,
    })
    expect(rangelimit).toHaveBeenCalledWith({ startDate: s, endDate: e })
    cleanup()
    renderPage(<DateSelector date={{ startDate: 0, endDate: 0 }} getQueryData={false} dateChange={dateChange} />, {
      route: `/page?startDate=${s}&endDate=${e}`,
    })
    cleanup()
    renderPage(<DateSelector date={{ startDate: 0, endDate: 0 }} dateChange={dateChange} />, { route: `/page?startDate=${s}` })
    expect(dateChange).not.toHaveBeenCalled()
  })

  it('沒給 dateChange 時選日期不拋錯（預設空函式）', () => {
    renderPage(<DateSelector date={RANGES.today[1]()} attributes={['today', 'yesterday']} />)
    expect(() => pickQuick('昨天')).not.toThrow()
    expect(currentLocation()).toBe(`/page?startDate=${RANGES.yesterday[1]().startDate}&endDate=${RANGES.yesterday[1]().endDate}`)
  })
})
