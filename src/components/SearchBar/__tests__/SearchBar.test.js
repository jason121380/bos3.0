// 保護：服務、商品、會員卡紀錄、顧客列表、客資篩選匯出共用的搜尋列。
// 簡易版：打關鍵字按 Enter 或「搜尋」都帶出關鍵字。
// 顧客版（SearchV2）：關鍵字、設計師（偏好／最近）、生日（民國年最多 3 碼、月 ≤ 12、日 ≤ 31，Enter 依序跳欄、在「日」按 Enter 直接搜尋）、
// 客戶來源、黑名單篩選；「清除」把所有條件與頁面的查詢設定（setCustomerNoSort）重設回預設；從網址 pageSetting 帶回關鍵字。
import { cleanup, fireEvent, screen } from '@testing-library/react'
import React from 'react'

import { renderPage } from '__tests__/testkit.test'
import SearchBar from 'components/SearchBar'
import SearchV2 from 'components/SearchBar/SearchV2'
import Search from 'components/SearchBar/Search'

afterEach(cleanup)

const users = [{ userId: 'u1', userName: '設計師甲', userNickName: '', userNo: '1' }]
const fixtures = {
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: users },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹', '路過'] },
}
// 「清除」（重設條件）鈕有文字；下拉的清除鈕只有 aria-label，以文字區分
const resetButton = () => screen.getByText('清除').closest('button')
const inputOf = label => screen.getAllByLabelText(label).find(el => el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.hasAttribute('data-ui-select'))

describe('SearchBar 簡易搜尋', () => {
  it('Enter 或按「搜尋」帶出關鍵字；其他按鍵不搜尋；只有簡易版時不顯示顧客版欄位', () => {
    const onSearch = jest.fn()
    renderPage(<SearchBar onSearch={onSearch} data-testid="bar" />)
    const input = screen.getByPlaceholderText('搜尋關鍵字')
    fireEvent.change(input, { target: { value: '洗髮' } })
    fireEvent.keyUp(input, { key: 'a' })
    expect(onSearch).not.toHaveBeenCalled()
    fireEvent.keyUp(input, { key: 'Enter' })
    expect(onSearch).toHaveBeenLastCalledWith('洗髮')
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    expect(onSearch).toHaveBeenCalledTimes(2)
    expect(screen.queryByText('民國年')).toBeNull()
    expect(screen.getByTestId('bar')).toBeInTheDocument()
  })

  it('簡易搜尋元件單獨使用（沒給 className）照常運作', () => {
    const onSearch = jest.fn()
    renderPage(<Search onSearch={onSearch} />)
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    expect(onSearch).toHaveBeenCalledWith('')
  })

  it('兩種都沒給時是空的', () => {
    const { container } = renderPage(<SearchBar />)
    expect(container.querySelector('input')).toBeNull()
  })
})

describe('SearchBar 顧客版（SearchV2）', () => {
  const handlers = () => ({
    onSearchV2: jest.fn(),
    onDesignerV2: jest.fn(),
    onDesignerV3: jest.fn(),
    onBirthdayStart: jest.fn(),
    onIsUnwelcome: jest.fn(),
    onCustomerSource: jest.fn(),
    handleClearData: jest.fn(),
    setBelong: jest.fn(),
    setCustomerIsCome: jest.fn(),
    setCustomerNoSort: jest.fn(),
  })

  it('關鍵字 Enter 搜尋；生日欄限制長度與範圍，Enter 依序跳欄，在「日」按 Enter 帶出生日與關鍵字', async () => {
    const h = handlers()
    const { settle } = renderPage(<SearchBar {...h} />, { fixtures })
    await settle()
    const keyword = screen.getByLabelText('關鍵字')
    fireEvent.change(keyword, { target: { value: '王' } })
    fireEvent.keyDown(keyword, { key: 'x' })
    expect(h.onSearchV2).not.toHaveBeenCalled()
    fireEvent.keyDown(keyword, { key: 'Enter' })
    expect(h.onSearchV2).toHaveBeenLastCalledWith('王')

    const year = inputOf('民國年')
    const month = inputOf('月')
    const day = inputOf('日')
    fireEvent.change(year, { target: { value: '80' } })
    fireEvent.change(year, { target: { value: '8000' } })
    expect(year).toHaveValue('80')
    fireEvent.focusIn(year)
    fireEvent.keyDown(year, { key: 'a' })
    fireEvent.keyDown(year, { key: 'Enter' })
    expect(month).toHaveFocus()
    fireEvent.change(month, { target: { value: '13' } })
    expect(month).toHaveValue('')
    fireEvent.change(month, { target: { value: '5' } })
    fireEvent.change(month, { target: { value: '' } })
    fireEvent.change(month, { target: { value: '12' } })
    fireEvent.focusIn(month)
    fireEvent.keyDown(month, { key: 'Enter' })
    expect(day).toHaveFocus()
    fireEvent.change(day, { target: { value: '32' } })
    expect(day).toHaveValue('')
    fireEvent.change(day, { target: { value: '3' } })
    fireEvent.change(day, { target: { value: '' } })
    fireEvent.change(day, { target: { value: '31' } })
    fireEvent.focusIn(day)
    fireEvent.keyDown(day, { key: 'Enter' })
    expect(h.onBirthdayStart).toHaveBeenLastCalledWith({ year: '80', month: '12', day: '31' })
    expect(h.onSearchV2).toHaveBeenLastCalledWith('王')
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    expect(h.onSearchV2).toHaveBeenCalledTimes(3)
    expect(h.onBirthdayStart).toHaveBeenCalledTimes(2)
  })

  it('偏好設計師、客戶來源、黑名單篩選回呼；清除把所有欄位與頁面的查詢設定重設', async () => {
    const h = handlers()
    const { settle } = renderPage(<SearchBar {...h} />, { fixtures })
    await settle()
    const designer = inputOf('設計師編號/姓名')
    fireEvent.click(designer)
    fireEvent.click(screen.getAllByRole('option').find(o => o.textContent === '設計師甲-1'))
    expect(h.onDesignerV2).toHaveBeenLastCalledWith(expect.objectContaining({ userId: 'u1' }))
    const source = document.querySelector('select[name="source"]')
    fireEvent.change(source, { target: { value: '1' } })
    expect(h.onCustomerSource.mock.calls[0][0].props.value).toBe('路過')
    const unwelcome = inputOf('黑名單篩選')
    fireEvent.change(unwelcome, { target: { value: '1' } })
    expect(h.onIsUnwelcome.mock.calls[0][0].target.value).toBe('UNWELCOME')
    fireEvent.change(screen.getByLabelText('關鍵字'), { target: { value: '王' } })
    fireEvent.change(inputOf('民國年'), { target: { value: '80' } })

    fireEvent.click(resetButton())
    expect(h.handleClearData).toHaveBeenCalledTimes(1)
    expect(h.setBelong).toHaveBeenCalledWith([])
    expect(h.setCustomerIsCome).toHaveBeenCalledWith(null)
    expect(h.setCustomerNoSort).toHaveBeenCalledWith({
      keyword: '',
      preferDesigner: '',
      latestDesigner: '',
      birthday: { year: '', month: '', day: '' },
      source: '',
      pageLimit: 50,
      pageOffset: 0,
      isUnwelcome: 'ALL',
      consumptionRange: null,
      baseDateRange: null,
      customerIsCome: null,
      category: [],
    })
    expect(screen.getByLabelText('關鍵字')).toHaveValue('')
    expect(inputOf('民國年')).toHaveValue('')
    expect(inputOf('黑名單篩選').value).toBe('0')
  })

  it('客資篩選匯出：最近設計師與偏好設計師兩欄；隱藏客戶來源與黑名單；清除時沒給的 setter 不呼叫', async () => {
    const onDesignerV2 = jest.fn()
    const onDesignerV3 = jest.fn()
    const onSearchV2 = jest.fn()
    const { settle } = renderPage(
      <SearchBar onSearchV2={onSearchV2} onDesignerV2={onDesignerV2} onDesignerV3={onDesignerV3} onBirthdayStart={() => {}} inCustomerFilterExport disableCustomerSource />,
      { fixtures }
    )
    await settle()
    expect(document.querySelector('select[name="source"]')).toBeNull()
    expect(screen.queryByText('黑名單篩選')).toBeNull()
    fireEvent.click(inputOf('最近設計師編號/姓名'))
    fireEvent.click(screen.getAllByRole('option').find(o => o.textContent === '設計師甲-1'))
    expect(onDesignerV3).toHaveBeenLastCalledWith(expect.objectContaining({ userId: 'u1' }))
    fireEvent.click(inputOf('偏好設計師編號/姓名'))
    fireEvent.click(screen.getAllByRole('option').find(o => o.textContent === '設計師甲-1'))
    expect(onDesignerV2).toHaveBeenLastCalledWith(expect.objectContaining({ userId: 'u1' }))
    expect(() => fireEvent.click(resetButton())).not.toThrow()
  })

  // Jason 2026/10/22 fix all：SearchBar 原本寫成 `getQuery`（簡寫一律為 true），沒傳 getQuery 的顧客列表也會讀網址；
  // 改為傳入呼叫端的值（只有寫 pageSetting 到網址的顧客篩選匯出有傳 getQuery）
  it('getQuery 時網址帶 pageSetting 會帶回關鍵字、沒有時維持空白；沒傳 getQuery 時不讀網址', async () => {
    const setting = encodeURIComponent(JSON.stringify({ keyword: '陳' }))
    const { settle } = renderPage(<SearchBar getQuery onSearchV2={() => {}} onBirthdayStart={() => {}} disableCustomerSource />, {
      fixtures,
      route: `/page?pageSetting=${setting}`,
    })
    await settle()
    expect(screen.getByLabelText('關鍵字')).toHaveValue('陳')
    cleanup()
    const { settle: s2 } = renderPage(<SearchBar getQuery onSearchV2={() => {}} onBirthdayStart={() => {}} disableCustomerSource />, { fixtures })
    await s2()
    expect(screen.getByLabelText('關鍵字')).toHaveValue('')
    cleanup()
    const { settle: s3 } = renderPage(<SearchBar onSearchV2={() => {}} onBirthdayStart={() => {}} disableCustomerSource />, {
      fixtures,
      route: `/page?pageSetting=${setting}`,
    })
    await s3()
    expect(screen.getByLabelText('關鍵字')).toHaveValue('')
  })

  it('單獨使用 SearchV2 時預設不讀網址；生日欄 name 以外的按鍵不處理', async () => {
    const setting = encodeURIComponent(JSON.stringify({ keyword: '陳' }))
    const { settle } = renderPage(<SearchV2 onSearchV2={() => {}} onBirthdayStart={() => {}} disableCustomerSource />, {
      fixtures,
      route: `/page?pageSetting=${setting}`,
    })
    await settle()
    expect(screen.getByLabelText('關鍵字')).toHaveValue('')
    expect(() => fireEvent.click(resetButton())).not.toThrow()
  })
})
