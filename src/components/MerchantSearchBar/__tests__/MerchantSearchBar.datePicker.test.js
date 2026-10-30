// 保護：報表頁共用搜尋列（MerchantSearchBar）的日期部分。
// 快捷鈕（本月、上個月、前天、昨天、今天、明天、後天）要算出正確起訖、寫進網址並經 onFilter 通知頁面重查；
// 店家日報（inMerchantDailyReport）的「今天／昨天／前天」是「本月 1 日到該日」的累計；只看單日（onlyDayTime）時改成該日。
// 手動選日：起日晚於迄日時迄日跟著調、迄日早於起日時起日跟著調；只選月份（onlyMonthYear）時為整月。
// 進頁時從網址帶回區間；頁面換掉 values 時跟著換。
import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import { addDays, endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns'
import React from 'react'

import { currentLocation, renderPage } from '__tests__/testkit.test'
import MerchantSearchBar from 'components/MerchantSearchBar'

afterEach(cleanup)

const S = startOfDay(new Date(2026, 9, 10)).getTime()
const E = endOfDay(new Date(2026, 9, 20)).getTime()
const day = offset => ({ startDate: startOfDay(addDays(new Date(), offset)).getTime(), endDate: endOfDay(addDays(new Date(), offset)).getTime() })
const monthToDay = offset => ({ startDate: startOfMonth(new Date()).getTime(), endDate: endOfDay(addDays(new Date(), offset)).getTime() })
const thisMonth = () => ({ startDate: startOfMonth(new Date()).getTime(), endDate: endOfMonth(new Date()).getTime() })
const lastMonth = () => {
  const d = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
  return { startDate: startOfMonth(d).getTime(), endDate: endOfMonth(d).getTime() }
}
const url = ({ startDate, endDate }) => `/page?startDate=${startDate}&endDate=${endDate}`
const lastFilter = onFilter => onFilter.mock.calls[onFilter.mock.calls.length - 1][0]
const click = name => fireEvent.click(screen.getByRole('button', { name }))
const pickIn = (fieldText, cell) => {
  fireEvent.click(screen.getByRole('button', { name: fieldText }))
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('gridcell', { name: cell }))
}

const renderBar = (props = {}, options = {}) => {
  const onFilter = jest.fn()
  const utils = renderPage(
    <MerchantSearchBar visible={['datePicker']} values={{ startDate: S, endDate: E }} onFilter={onFilter} {...props} />,
    options
  )
  return { ...utils, onFilter }
}

describe('MerchantSearchBar 快捷鈕', () => {
  it('一般報表：掛載即以 values 通知；本月、前天、昨天、今天各自設定區間並寫網址', () => {
    const { onFilter } = renderBar()
    expect(onFilter).toHaveBeenCalledWith({ startDate: S, endDate: E })
    expect(screen.queryByRole('button', { name: '明天' })).toBeNull()
    expect(screen.queryByRole('button', { name: '上個月' })).toBeNull()
    const cases = [
      ['本月', thisMonth()],
      ['前天', day(-2)],
      ['昨天', day(-1)],
      ['今天', day(0)],
    ]
    cases.forEach(([name, want]) => {
      click(name)
      expect(lastFilter(onFilter)).toEqual(want)
      expect(currentLocation()).toBe(url(want))
    })
  })

  it('futureDate：改顯示明天、後天（不顯示前天、昨天）；lastInLeaderBoard 多上個月', () => {
    const { onFilter } = renderBar({ futureDate: true, lastInLeaderBoard: true })
    expect(screen.queryByRole('button', { name: '昨天' })).toBeNull()
    ;[
      ['明天', day(1)],
      ['後天', day(2)],
      ['上個月', lastMonth()],
    ].forEach(([name, want]) => {
      click(name)
      expect(lastFilter(onFilter)).toEqual(want)
      expect(currentLocation()).toBe(url(want))
    })
  })

  it('displayMonth（薪資單）：只有上個月、本月；選月份的欄位顯示 yyyy/MM 並以整月為區間', () => {
    const { onFilter } = renderBar({ displayMonth: true, onlyMonthYear: true, hideEndDate: true })
    expect(screen.queryByRole('button', { name: '今天' })).toBeNull()
    click('上個月')
    expect(lastFilter(onFilter)).toEqual(lastMonth())
    click('本月')
    expect(lastFilter(onFilter)).toEqual(thisMonth())
    const field = screen.getByRole('button', { name: new RegExp(`^${new Date().getFullYear()}/\\d{2}$`) })
    fireEvent.click(field)
    fireEvent.click(
      within(screen.getByRole('dialog'))
        .getAllByRole('gridcell')
        .find(c => c.textContent === '15')
    )
    expect(lastFilter(onFilter)).toEqual(thisMonth())
    expect(currentLocation()).toBe(url(thisMonth()))
  })

  it('店家日報：今天／昨天／前天為「本月 1 日到該日」的累計', () => {
    const { onFilter } = renderBar({ inMerchantDailyReport: true })
    ;[
      ['今天', monthToDay(0)],
      ['昨天', monthToDay(-1)],
      ['前天', monthToDay(-2)],
    ].forEach(([name, want]) => {
      click(name)
      expect(lastFilter(onFilter)).toEqual(want)
      expect(currentLocation()).toBe(url(want))
    })
  })

  it('個人頁（店家日報＋只看單日）：沒有本月鈕；今天／昨天／前天為單日', () => {
    const { onFilter } = renderBar({ inMerchantDailyReport: true, onlyDayTime: true })
    expect(screen.queryByRole('button', { name: '本月' })).toBeNull()
    ;[
      ['今天', day(0)],
      ['昨天', day(-1)],
      ['前天', day(-2)],
    ].forEach(([name, want]) => {
      click(name)
      expect(lastFilter(onFilter)).toEqual(want)
      expect(currentLocation()).toBe(url(want))
    })
  })
})

describe('MerchantSearchBar 手動選日', () => {
  it('起日早於迄日：只改起日；起日晚於迄日：迄日改為起日當天結束', () => {
    const { onFilter } = renderBar()
    pickIn('2026/10/10', '2026年10月12日')
    expect(lastFilter(onFilter)).toEqual({ startDate: startOfDay(new Date(2026, 9, 12)).getTime(), endDate: E })
    pickIn('2026/10/12', '2026年10月25日')
    expect(lastFilter(onFilter)).toEqual({
      startDate: startOfDay(new Date(2026, 9, 25)).getTime(),
      endDate: endOfDay(new Date(2026, 9, 25)).getTime(),
    })
  })

  it('迄日晚於起日：只改迄日；迄日早於起日：起日改為迄日當天開始', () => {
    const { onFilter } = renderBar()
    pickIn('2026/10/20', '2026年10月18日')
    expect(lastFilter(onFilter)).toEqual({ startDate: S, endDate: endOfDay(new Date(2026, 9, 18)).getTime() })
    pickIn('2026/10/18', '2026年10月5日')
    expect(lastFilter(onFilter)).toEqual({
      startDate: startOfDay(new Date(2026, 9, 5)).getTime(),
      endDate: endOfDay(new Date(2026, 9, 5)).getTime(),
    })
  })

  // 已修正（Jason 2026/10/22 fix all）：handleChange 原本寫成 `setting.startDate || setting.endDate && onlyMonthYear`（少括號），
  // 只要已有起日就走「整月」分支，一般報表手動選日後網址被寫成整個月；改為 `(setting.startDate || setting.endDate) && onlyMonthYear`
  it('一般報表手動選日後，網址寫入「起日當天開始～迄日當天結束」（不是整月）', () => {
    renderBar()
    pickIn('2026/10/10', '2026年10月12日')
    expect(currentLocation()).toBe(url({ startDate: startOfDay(new Date(2026, 9, 12)).getTime(), endDate: E }))
  })

  it('個人頁（店家日報＋只看單日）選迄日：起訖都設成該日，網址為該日', () => {
    const { onFilter } = renderBar({ inMerchantDailyReport: true, onlyDayTime: true, hideStartDate: true })
    expect(screen.queryByRole('button', { name: '2026/10/10' })).toBeNull()
    pickIn('2026/10/20', '2026年10月15日')
    const want = { startDate: startOfDay(new Date(2026, 9, 15)).getTime(), endDate: endOfDay(new Date(2026, 9, 15)).getTime() }
    expect(lastFilter(onFilter)).toEqual(want)
    expect(currentLocation()).toBe(url(want))
  })

  it('還沒有起日（0）時改迄日：網址寫入「起日當天開始～迄日當天結束」', () => {
    const { onFilter } = renderBar({ values: { startDate: 0, endDate: E } })
    pickIn('2026/10/20', '2026年10月18日')
    expect(lastFilter(onFilter).endDate).toBe(endOfDay(new Date(2026, 9, 18)).getTime())
    expect(currentLocation()).toBe(url({ startDate: startOfDay(0).getTime(), endDate: endOfDay(new Date(2026, 9, 18)).getTime() }))
  })
})

describe('MerchantSearchBar 網址與 values', () => {
  const qs = `/page?startDate=${S}&endDate=${E}`

  it('進頁時從網址帶回區間；stopGetQueryString 時不帶', () => {
    const { onFilter } = renderBar({ values: { startDate: 1, endDate: 2 } }, { route: qs })
    expect(lastFilter(onFilter)).toEqual({ startDate: S, endDate: E })
    cleanup()
    const { onFilter: f2 } = renderBar({ values: { startDate: 1, endDate: 2 }, stopGetQueryString: true }, { route: qs })
    expect(lastFilter(f2)).toEqual({ startDate: 1, endDate: 2 })
  })

  it('網址缺迄日時不帶；網址的日期優先於畫面狀態計算新網址', () => {
    const { onFilter } = renderBar({ values: { startDate: 1, endDate: 2 } }, { route: `/page?startDate=${S}` })
    expect(lastFilter(onFilter)).toEqual({ startDate: 1, endDate: 2 })
  })

  it('頁面換掉 values 時跟著換並通知；有 onSearch 時顯示搜尋框，按搜尋帶出關鍵字；searchByBirth 顯示說明', () => {
    const onFilter = jest.fn()
    const onSearch = jest.fn()
    function Harness() {
      const [values, setValues] = React.useState({ startDate: S, endDate: E })
      return (
        <>
          <button type="button" onClick={() => setValues({ startDate: 5, endDate: 6 })}>
            換條件
          </button>
          <MerchantSearchBar visible={[]} values={values} onFilter={onFilter} onSearch={onSearch} searchByBirth />
        </>
      )
    }
    renderPage(<Harness />)
    click('換條件')
    expect(lastFilter(onFilter)).toEqual({ startDate: 5, endDate: 6 })
    expect(screen.getByText('生日/偏好設計師搜尋')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('搜尋關鍵字'), { target: { value: '王' } })
    click('搜尋')
    expect(onSearch).toHaveBeenCalledWith('王')
  })
})
