// 保護：報表搜尋列的篩選欄位（Requirement）——每個欄位選取後，以頁面約定的欄位名稱與格式經 onFilter 通知：
// 設計師（employeeId／關係人 relationUserId／多選 designers）、顧客 customerId、科目名稱、日期、其他付款方式名稱、
// 收付方式、第三方卡券（id，必要時加名稱）、服務（serviceIds／serviceId，打字時先清空）、商品、帳單來源（單選／多選）、會員卡 uuid。
// 欄位依 visible 順序排列；outside 時每欄各包一層。科目選項去重且只列使用中。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import React from 'react'

import { PAGE_CRASH_TEXT, callsOf, loginAs, renderPage } from '__tests__/testkit.test'
import MerchantSearchBar from 'components/MerchantSearchBar'
import Subject from 'components/MerchantSearchBar/Subject'

afterEach(cleanup)

const fixtures = {
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [{ userId: 'u1', userName: '設計師甲', userNickName: '', userNo: '1' }] },
  FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers: [{ id: 'c1', name: '王小明', cellphone: '0912', no: 'A1' }] } },
  GET_ACCOUNTING_SUBJECTS: {
    accountingSubjects: [
      { id: 'a1', name: '水電費', isUsing: true },
      { id: 'a2', name: '水電費', isUsing: true },
      { id: 'a3', name: '停用科目', isUsing: false },
      { id: 'a4', name: '租金', isUsing: true },
    ],
  },
  GET_ACCOUNTING_TYPE: { getAccountingType: ['現金', '匯款'] },
  merchantPayWays: { merchantPayWays: [{ id: 'p1', type: 'CARD', name: '信用卡', fee: 2 }] },
  FETCH_THIRDPARTYS: { merchant: { id: 'm', thirdpartyCoupons: [{ id: 't1', name: '街口', fee: 1, type: 'A' }] } },
  GET_SERVICES_FOR_AUTOCOMPLETE: { services: { data: [{ id: 's1', no: '1', name: '洗髮', price: 200 }] } },
  GET_PRODUCT_IN_AUTO_COMPLETE: { products: { data: [{ id: 'pr1', no: 'P1', name: '洗髮精', sellPrice: 300 }] } },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹', '路過'] },
  FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE: { memberships: { data: [{ uuid: 'm1', no: 'M1', name: '金卡', sellPrice: 1, effecitveDay: 30 }] } },
}

const renderBar = (props, options = {}) => {
  loginAs()
  const onFilter = jest.fn()
  const utils = renderPage(<MerchantSearchBar values={{}} onFilter={onFilter} {...props} />, { fixtures, ...options })
  return { ...utils, onFilter }
}
const lastFilter = onFilter => onFilter.mock.calls[onFilter.mock.calls.length - 1][0]
// 標籤同時標示輸入框與選單（aria-labelledby），取輸入框
const field = label => screen.getAllByLabelText(label).find(el => el.tagName === 'INPUT')
const choose = (label, optionText) => {
  fireEvent.click(field(label))
  const option = screen.getAllByRole('option').find(o => o.textContent === optionText)
  fireEvent.click(option)
}
const clear = label => {
  fireEvent.focusIn(field(label))
  const root = field(label).closest('.ui-root')
  fireEvent.mouseDown(within(root).getByRole('button', { name: '清除' }))
}

describe('MerchantSearchBar 篩選欄位', () => {
  it('設計師：選取回傳 employeeId、清除回傳空字串；欄位依 visible 排列', async () => {
    const { settle, onFilter } = renderBar({ visible: ['employee', 'customer'] })
    await settle()
    const labels = [...document.querySelectorAll('.MerchantSearchBar label')].map(l => l.textContent)
    expect(labels).toEqual(['設計師編號/姓名', '顧客編號/姓名'])
    choose('設計師編號/姓名', '設計師甲-1')
    expect(lastFilter(onFilter)).toEqual({ employeeId: 'u1' })
    await wait(() => expect(field('設計師編號/姓名')).toHaveValue('設計師甲-1'))
    clear('設計師編號/姓名')
    expect(lastFilter(onFilter)).toEqual({ employeeId: '' })
  })

  it('關係人（relationUserId）與互助人（扣抵明細）的標籤與欄位名稱；多選設計師以 designers 回傳', async () => {
    const { settle, onFilter } = renderBar({ visible: ['employee'], relationUserId: true, values: { relationUserId: 'u1' } })
    await settle()
    await wait(() => expect(field('關係人編號/姓名')).toHaveValue('設計師甲-1'))
    clear('關係人編號/姓名')
    expect(lastFilter(onFilter)).toEqual({ relationUserId: '' })
    cleanup()
    const { settle: s2 } = renderBar({ visible: ['employee'], useInDecreaseDetailReport: true })
    await s2()
    expect(field('互助人編號/姓名')).toBeInTheDocument()
    cleanup()
    const { settle: s3, onFilter: f3 } = renderBar({ visible: ['employee'], multiple: ['employee'], values: { designers: '' } })
    await s3()
    choose('設計師編號/姓名', '設計師甲-1')
    expect(lastFilter(f3).designers).toEqual(expect.objectContaining({ userId: 'u1' }))
  })

  // Jason 2026/10/22 決定設計師欄維持預設「全部」：不自動帶入第一位設計師。
  // 頁面原本傳的 initFirst={['employee']} 轉給 EmployeeAutoComplete 後沒有作用（它不支援），已移除（Jason 2026/10/22 fix all）
  it('設計師欄預設為空（全部）：載入設計師清單後不自動帶入、不通知 onFilter', async () => {
    const { settle, onFilter } = renderBar({ visible: ['employee'] })
    await settle()
    expect(field('設計師編號/姓名')).toHaveValue('')
    expect(onFilter.mock.calls.some(([v]) => v.employeeId || v.designers)).toBe(false)
  })

  it('顧客：選取回傳 customerId、清除回傳空字串', async () => {
    const { settle, onFilter } = renderBar({ visible: ['customer'] })
    await settle()
    choose('顧客編號/姓名', '王小明 / 0912 / A1')
    expect(lastFilter(onFilter)).toEqual({ customerId: 'c1' })
    await settle()
    clear('顧客編號/姓名')
    expect(lastFilter(onFilter)).toEqual({ customerId: '' })
  })

  it('科目：選項去除同名、只列使用中；選取回傳名稱、清除回傳空字串', async () => {
    const { settle, onFilter } = renderBar({ visible: ['subject'], values: { accountingSubjectName: '租金' } })
    await settle()
    await wait(() => expect(field('選擇科目')).toHaveValue('租金'))
    fireEvent.click(field('選擇科目'))
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual(['水電費', '租金'])
    fireEvent.click(screen.getAllByRole('option')[0])
    expect(lastFilter(onFilter)).toEqual({ accountingSubjectName: '水電費' })
    clear('選擇科目')
    expect(lastFilter(onFilter)).toEqual({ accountingSubjectName: '' })
  })

  // 已修正（Jason 2026/10/22 fix all）：科目查詢失敗時原本直接 .filter 而拋錯，整個報表頁變成錯誤畫面；改為當成沒有科目
  it('科目查詢失敗時不拋錯，沒有科目可選', async () => {
    const { settle } = renderBar({ visible: ['subject'] }, { fixtures: {}, fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    fireEvent.click(field('選擇科目'))
    expect(screen.queryAllByRole('option')).toEqual([])
  })

  it('日期：輸入日期回傳時間戳；清空時用現在時間', async () => {
    const { settle, onFilter } = renderBar({ visible: ['date'] })
    await settle()
    fireEvent.change(field('日期'), { target: { value: '2026-10-21' } })
    expect(lastFilter(onFilter)).toEqual({ date: new Date('2026-10-21').getTime() })
    const before = Date.now()
    fireEvent.change(field('日期'), { target: { value: '' } })
    expect(lastFilter(onFilter).date).toBeGreaterThanOrEqual(before)
  })

  it('其他付款方式：選取回傳名稱；清除回傳空陣列（目前行為）', async () => {
    const { settle, onFilter } = renderBar({ visible: ['payment'], values: { payWay: '信用卡' } })
    await settle()
    await wait(() => expect(field('其他付款方式')).toHaveValue('信用卡'))
    clear('其他付款方式')
    expect(lastFilter(onFilter)).toEqual({ payWay: [] })
    choose('其他付款方式', '信用卡')
    expect(lastFilter(onFilter)).toEqual({ payWay: '信用卡' })
  })

  it('收付方式：選項來自一般記帳的收付類型，選取回傳文字', async () => {
    const { settle, onFilter, calls } = renderBar({ visible: ['payType'] })
    expect(document.querySelector('.animate-spin')).not.toBeNull()
    await settle()
    expect(callsOf(calls, 'GET_ACCOUNTING_TYPE')[0].variables).toEqual({ input: 'GENERAL' })
    choose('收付方式', '匯款')
    expect(lastFilter(onFilter)).toEqual({ payTypeKeyWord: '匯款' })
  })

  it('第三方卡券：選取回傳 id；getThirdPartyName 時另回傳名稱', async () => {
    const { settle, onFilter } = renderBar({ visible: ['thirdPartyCoupon'] })
    await settle()
    choose('第三方卡券', '街口')
    expect(lastFilter(onFilter)).toEqual({ thirdPartTicketId: 't1' })
    cleanup()
    const { settle: s2, onFilter: f2 } = renderBar({ visible: ['thirdPartyCoupon'], getThirdPartyName: true })
    await s2()
    choose('第三方卡券', '街口')
    expect(lastFilter(f2)).toEqual({ thirdPartTicketName: '街口', thirdPartTicketId: 't1' })
  })

  it('服務（多筆 serviceIds／單筆 serviceId）：打字先清空條件，選取回傳 id', async () => {
    const { settle, onFilter } = renderBar({ visible: ['services', 'service'], outside: true })
    await settle()
    // outside：每欄各包一層 div
    expect(document.querySelectorAll('.MerchantSearchBar > div')).toHaveLength(2)
    const [multi, single] = screen.getAllByLabelText('服務名稱/代號').filter(el => el.tagName === 'INPUT')
    fireEvent.click(multi)
    fireEvent.change(multi, { target: { value: '洗' } })
    expect(lastFilter(onFilter)).toEqual({ serviceIds: [] })
    fireEvent.click(screen.getAllByRole('option')[0])
    expect(lastFilter(onFilter)).toEqual({ serviceIds: 's1' })
    fireEvent.click(single)
    fireEvent.change(single, { target: { value: '洗' } })
    expect(lastFilter(onFilter)).toEqual({ serviceIds: 's1', serviceId: '' })
    fireEvent.click(screen.getAllByRole('option')[0])
    expect(lastFilter(onFilter)).toEqual({ serviceIds: 's1', serviceId: 's1' })
  })

  it('商品：選取回傳 id', async () => {
    const { settle, onFilter } = renderBar({ visible: ['product'] })
    await settle()
    choose('商品名稱', 'P1 - 洗髮精 - 300')
    expect(lastFilter(onFilter)).toEqual({ productId: 'pr1' })
  })

  it('帳單來源（單選）：開啟時才查來源；選取回傳文字', async () => {
    const { settle, onFilter, calls } = renderBar({ visible: ['source'] })
    await settle()
    expect(callsOf(calls, 'GET_CUSTOMER_REFERENCE')).toHaveLength(1)
    choose('帳單來源', '路過')
    expect(lastFilter(onFilter)).toEqual({ source: '路過' })
    cleanup()
    const { settle: s2, calls: c2 } = renderBar({ visible: ['employee'] })
    await s2()
    expect(callsOf(c2, 'GET_CUSTOMER_REFERENCE')).toHaveLength(0)
  })

  it('帳單來源（多選 sources）：勾選回傳陣列；會員卡：選取回傳 uuid、清除回傳空字串', async () => {
    const { settle, onFilter } = renderBar({ visible: ['sources', 'membershipcard'], values: { source: [] } })
    await settle()
    choose('帳單來源', '朋友介紹')
    expect(lastFilter(onFilter).source).toEqual(['朋友介紹'])
    choose('會員卡名稱/代號', '金卡 - M1')
    expect(lastFilter(onFilter).membershipId).toBe('m1')
    await wait(() => expect(field('會員卡名稱/代號')).toHaveValue('金卡-30天'))
    clear('會員卡名稱/代號')
    expect(lastFilter(onFilter).membershipId).toBe('')
  })

  it('沒給 visible 時只有搜尋列外框、不顯示任何欄位', () => {
    const { onFilter } = renderBar({ visible: undefined })
    expect(document.querySelector('.MerchantSearchBar').children).toHaveLength(0)
    expect(onFilter).toHaveBeenCalledWith({})
  })

  it('科目元件單獨使用：名稱空白的科目顯示空白（不顯示 undefined），選取回傳原始事件與選項', async () => {
    const onChange = jest.fn()
    const { settle } = renderPage(<Subject onChange={onChange} value="" />, {
      fixtures: { GET_ACCOUNTING_SUBJECTS: { accountingSubjects: [{ id: 'x', name: '', isUsing: true }, { id: 'y', name: '雜支', isUsing: true }] } },
    })
    await settle()
    fireEvent.click(field('選擇科目'))
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual(['', '雜支'])
    fireEvent.click(screen.getAllByRole('option')[1])
    expect(onChange.mock.calls[0][1]).toEqual(expect.objectContaining({ id: 'y', name: '雜支' }))
  })
})
