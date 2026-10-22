// 設計師／助理／員工／薪資報表頁（覆蓋率第三波 V9）測試共用的替身與工具（本身也是測試檔：CRA 把 __tests__ 下每個檔都當測試，
// 直接執行時驗證工具本身；被其他測試 import 或在 jest.mock 工廠內 require 時只提供函式）。
// 為什麼需要：這批報表共用幾個「自己會再查詢、另有測試」的篩選元件（店家多選、報表搜尋列、服務下拉），
// 頁面測試只需要「選了什麼」；替身把頁面傳入的 props 記下來，並提供按鈕回傳固定的選擇。GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import React from 'react'
import { act, fireEvent, render, screen, within } from '@testing-library/react'

const isMain = expect.getState().testPath === __filename

// components/MerchantListAutocpmplete（店家多選，另有自己的查詢與彈窗）的替身：
// 與正式元件相同，掛載時先回傳空陣列；按「選擇店家（測試）」回傳 m1、m2，「清除店家（測試）」回傳空陣列
function StubMerchantList({ onValueChange = () => {} }) {
  React.useEffect(() => {
    onValueChange([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div data-testid="merchant-list">
      <button type="button" onClick={() => onValueChange(['m1', 'm2'])}>
        選擇店家（測試）
      </button>
      <button type="button" onClick={() => onValueChange([])}>
        清除店家（測試）
      </button>
    </div>
  )
}
export const merchantListModule = { __esModule: true, default: StubMerchantList }

// components/MerchantSearchBar（報表搜尋列：日期、設計師…，另有自己的查詢與測試）的替身：記下每次 render 的 props，
// 測試以 filterWith(...) 模擬使用者在搜尋列改條件（呼叫頁面傳入的 onFilter）
export const searchBars = []
function StubSearchBar(props) {
  searchBars.push(props)
  return <div data-testid="merchant-search-bar" data-visible={(props.visible || []).join(',')} />
}
export const searchBarModule = { __esModule: true, default: StubSearchBar }
export const lastSearchBar = (visibleKey = null) => {
  const list = visibleKey ? searchBars.filter(p => (p.visible || []).includes(visibleKey)) : searchBars
  return list[list.length - 1]
}
export const filterWith = (values, visibleKey = null) => {
  act(() => {
    lastSearchBar(visibleKey).onFilter(values)
  })
}

// components/ServicesIncludesTicketsAutoComplete（服務／卡券下拉，另有自己的查詢）的替身：
// 「選服務（測試）」回傳 { id: 's-1' }、「清除服務（測試）」回傳 null；目前值放在屬性上
function StubServicePicker({ value, onChange, label }) {
  return (
    <div data-testid="service-picker" data-label={label} data-value={JSON.stringify(value === undefined ? null : value)}>
      <button type="button" onClick={() => onChange({ id: 's-1', name: '剪髮' })}>
        選服務（測試）
      </button>
      <button type="button" onClick={() => onChange(null)}>
        清除服務（測試）
      </button>
    </div>
  )
}
export const servicePickerModule = { __esModule: true, default: StubServicePicker }

// react-csv 的 CSVLink 替身：把匯出資料放在屬性上（jsdom 沒有 Blob 網址，正式元件改用未編碼的 data URI，內容含 % 時無法解碼）
function StubCSVLink({ data, filename, children, className, style }) {
  return (
    <a data-testid="csv" data-filename={filename} data-rows={JSON.stringify(data)} href="#csv" className={className} style={style}>
      {children}
    </a>
  )
}
export const csvModule = { __esModule: true, CSVLink: StubCSVLink }
export const csvRows = () => JSON.parse(screen.getByTestId('csv').getAttribute('data-rows'))

// 後端回傳的 Excel 下載網址以 <a>.click() 開啟：記下被點的網址，不真的導頁（jsdom 不支援導頁）
export function spyAnchorClicks() {
  const hrefs = []
  const spy = jest.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(function click() {
    hrefs.push(this.getAttribute('href'))
  })
  return { hrefs, restore: () => spy.mockRestore() }
}

// 表格工具：表頭文字、某列（以第一個符合文字的儲存格定位）的儲存格文字
export const headerTexts = (root = document.body) => Array.from(root.querySelectorAll('thead th')).map(th => th.textContent)
export const rowCells = (text, root = document.body) =>
  Array.from(
    within(root)
      .getAllByText(text, { selector: 'td, td *' })[0]
      .closest('tr')
      .querySelectorAll('td')
  ).map(td => td.textContent)

if (isMain) {
  describe('staffReportKit', () => {
    beforeEach(() => {
      searchBars.length = 0
    })

    it('店家多選替身：掛載先回空陣列，按鈕回傳 m1、m2 與清除', () => {
      const onValueChange = jest.fn()
      const { unmount } = render(<StubMerchantList onValueChange={onValueChange} />)
      expect(onValueChange).toHaveBeenLastCalledWith([])
      fireEvent.click(screen.getByText('選擇店家（測試）'))
      expect(onValueChange).toHaveBeenLastCalledWith(['m1', 'm2'])
      fireEvent.click(screen.getByText('清除店家（測試）'))
      expect(onValueChange).toHaveBeenLastCalledWith([])
      unmount()
      render(<StubMerchantList />)
      fireEvent.click(screen.getByText('選擇店家（測試）'))
    })

    it('搜尋列替身：記下 props，filterWith 呼叫最後一個（可依 visible 篩選）的 onFilter', () => {
      const first = jest.fn()
      const second = jest.fn()
      render(
        <>
          <StubSearchBar visible={['datePicker']} onFilter={first} />
          <StubSearchBar visible={['employee']} onFilter={second} />
          <StubSearchBar onFilter={() => {}} />
        </>
      )
      expect(screen.getAllByTestId('merchant-search-bar')[0].getAttribute('data-visible')).toBe('datePicker')
      filterWith({ a: 1 }, 'datePicker')
      expect(first).toHaveBeenCalledWith({ a: 1 })
      filterWith({ b: 2 }, 'employee')
      expect(second).toHaveBeenCalledWith({ b: 2 })
      expect(lastSearchBar().visible).toBeUndefined()
    })

    it('服務下拉替身：回傳選取的服務與 null，目前值放在屬性上', () => {
      const onChange = jest.fn()
      const { rerender } = render(<StubServicePicker label="服務" value={['x']} onChange={onChange} />)
      expect(screen.getByTestId('service-picker').getAttribute('data-value')).toBe('["x"]')
      fireEvent.click(screen.getByText('選服務（測試）'))
      expect(onChange).toHaveBeenLastCalledWith({ id: 's-1', name: '剪髮' })
      fireEvent.click(screen.getByText('清除服務（測試）'))
      expect(onChange).toHaveBeenLastCalledWith(null)
      rerender(<StubServicePicker label="服務" onChange={onChange} />)
      expect(screen.getByTestId('service-picker').getAttribute('data-value')).toBe('null')
    })

    it('CSVLink 替身把匯出資料與檔名放在屬性上', () => {
      render(
        <StubCSVLink data={[{ a: '100%' }]} filename="x.csv">
          匯出
        </StubCSVLink>
      )
      expect(csvRows()).toEqual([{ a: '100%' }])
      expect(screen.getByText('匯出')).toHaveAttribute('data-filename', 'x.csv')
    })

    it('spyAnchorClicks 記下被點的網址；表格工具讀表頭與列', () => {
      const { hrefs, restore } = spyAnchorClicks()
      const link = document.createElement('a')
      link.href = 'https://example.com/report.xlsx'
      link.click()
      restore()
      expect(hrefs).toEqual(['https://example.com/report.xlsx'])
      render(
        <table>
          <thead>
            <tr>
              <th>名稱</th>
              <th>金額</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span>合計</span>
              </td>
              <td>10</td>
            </tr>
          </tbody>
        </table>
      )
      expect(headerTexts()).toEqual(['名稱', '金額'])
      expect(rowCells('合計')).toEqual(['合計', '10'])
    })
  })
}
