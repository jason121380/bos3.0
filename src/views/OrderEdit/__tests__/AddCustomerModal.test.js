// 保護帳單詳細的「新增／編輯顧客」彈窗（AddCustomerModal）：
// - 新增：手機滿 10 碼才能按「新增」；姓名必填（只填手機會提示「姓名與電話為必填」、不送出）；送出帶目前店家、
//   生日三格與表單內容（不帶顧客 id 與來源），成功提示並關窗、新顧客帶進帳單；失敗提示原因、彈窗留著
// - 編輯：送出顧客 id 與改過的欄位（偏好設計師、性別、Email、生日月日…；沒填性別的顧客顯示並送出「未知」），
//   成功後帳單的顧客重新指向這位顧客；
//   失敗提示原因、彈窗留著，帳單的顧客不變
// - 客戶編號：輸入後稍候向後端確認是否重複，確認中顯示轉圈、重複時標示「客戶編號重複」、清空後不標示
// - 標題列顯示最新顧客編號，方便櫃檯編下一號
// 只渲染彈窗本身（以測試用的外層保管顧客與帳單狀態），GraphQL 全由模擬 link 回應，不建立或修改真實顧客。
import React, { useState } from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, typeLikeBrowser, MERCHANT_ID } from '../../../__tests__/testkit.test'
import { emptyCustomerForm } from 'views/OrderShared/customerField'
import AddCustomerModal from '../AddCustomerModal'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const DESIGNERS = [
  { id: 'designer-1', name: '王小美' },
  { id: 'designer-2', name: '李助理' },
]
const EXISTING = {
  customerId: 'customer-1',
  no: 'C01',
  name: '陳小姐',
  cellphone: '0912345678',
  gender: 'FEMALE',
  birthday: { year: '80', month: '1', day: '2' },
  PreferDesignerId: 'designer-1',
  email: '',
  address: '',
  lineId: '',
  nickName: '',
  category: '',
  remark: '',
  source: '',
}

const fixtures = (overrides = {}) => ({
  GET_LAST_CUSTOMER_NO: { getLastCustomerNo: 'C099' },
  FETCH_USERS: { users: { users: DESIGNERS } },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹', '網路'] },
  GET_CHECK_IS_CUSTOMER_NO_USED: v => ({ checkIsCustomerNoUsed: v.input === 'C01' && v.customerId !== 'customer-1' }),
  SET_CUSTOMER: { updateCustomer: true },
  FETCH_ADD_CUSTOMER: { addCustomer: { id: 'customer-new', name: '林先生', gender: 'MALE', cellphone: '0922333444', birthday: { year: '', month: '', day: '' }, category: '' } },
  ...overrides,
})

// 比照 Head：彈窗開關、顧客表單與帳單由外層保管；帳單內容輸出成 JSON 供斷言
function Harness({ initialCustomer }) {
  const [open, setOpen] = useState(true)
  const [customer, setCustomer] = useState(initialCustomer)
  const [bill, setBill] = useState({ customerId: 'before', customerCellphone: '0900' })
  return (
    <>
      {open && (
        <AddCustomerModal open={open} onClose={() => setOpen(false)} customer={customer} setCustomer={setCustomer} setBill={setBill} />
      )}
      <output data-testid="bill">{JSON.stringify(bill)}</output>
      <output data-testid="customer">{customer.customerId}</output>
    </>
  )
}

const renderModal = (initialCustomer, overrides) =>
  renderPage(<Harness initialCustomer={initialCustomer} />, { fixtures: fixtures(overrides) })
const modal = () => screen.getByText(/^(新增客戶|編輯客戶資料)$/).closest('[role="dialog"]')
const field = name => modal().querySelector(`input[name="${name}"]`)
const bill = () => JSON.parse(screen.getByTestId('bill').textContent)
// 下拉選單以瀏覽器的方式改值（欄位處理在 setState updater 內才讀 event.target，理由同 testkit 的 typeLikeBrowser）
const selectLikeBrowser = (select, value) => {
  Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set.call(select, value)
  select.dispatchEvent(new window.Event('change', { bubbles: true }))
}
const preferSelect = () => within(modal()).getByText('偏好設計師').parentElement.querySelector('select')

beforeEach(() => loginAs())
afterEach(cleanup)

describe('新增顧客', () => {
  it('手機未滿 10 碼不能按新增；填好姓名、手機、生日後送出，帶目前店家、不帶顧客 id 與來源，成功提示並關窗', async () => {
    const page = renderModal(emptyCustomerForm())
    expect(await screen.findByText('新增客戶')).toBeInTheDocument()
    expect(await screen.findByText('最新顧客編號: C099')).toBeInTheDocument()
    const add = within(modal()).getByText('新增', { selector: 'button' })
    expect(add).toBeDisabled()
    typeLikeBrowser(field('name'), '林先生')
    typeLikeBrowser(field('cellphone'), '092233')
    expect(add).toBeDisabled()
    typeLikeBrowser(field('cellphone'), '0922333444')
    await wait(() => expect(add).not.toBeDisabled())
    typeLikeBrowser(field('email'), 'lin@example.com')
    typeLikeBrowser(field('year'), '85')
    typeLikeBrowser(field('month'), '7')
    typeLikeBrowser(field('day'), '15')
    // 性別（自家下拉；選項值是選項序號：未知、男、女。改值打在同層的 select 上）
    const gender = modal().querySelector('select[name="gender"]')
    selectLikeBrowser(gender, within(gender).getByText('女').value)
    fireEvent.click(add)
    await wait(() => expect(callsOf(page.calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(1))
    const { input } = callsOf(page.calls, 'FETCH_ADD_CUSTOMER')[0].variables
    expect(input).toEqual(
      expect.objectContaining({
        name: '林先生',
        cellphone: '0922333444',
        email: 'lin@example.com',
        gender: 'FEMALE',
        OfficialBrandMerchantId: MERCHANT_ID,
        birthday: { year: '85', month: '7', day: '15' },
      })
    )
    expect(input.customerId).toBeUndefined()
    expect(input.source).toBeUndefined()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '成功新增客戶', variant: 'success' })))
    await wait(() => expect(screen.queryByText('新增客戶')).toBeNull())
    expect(screen.getByTestId('customer')).toHaveTextContent('customer-new')
    // 新顧客直接帶進帳單（與只輸入手機的快速新增相同）
    expect(bill()).toEqual({ customerId: 'customer-new', customerCellphone: '' })
  })

  it('只填手機沒填姓名：提示「姓名與電話為必填」，不送出', async () => {
    const page = renderModal(emptyCustomerForm())
    await screen.findByText('新增客戶')
    typeLikeBrowser(field('cellphone'), '0922333444')
    const add = within(modal()).getByText('新增', { selector: 'button' })
    await wait(() => expect(add).not.toBeDisabled())
    fireEvent.click(add)
    expect(openSnackbar).toHaveBeenCalledWith({ variant: 'warning', message: '姓名與電話為必填' })
    expect(callsOf(page.calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(0)
  })

  it('新增失敗：提示原因，彈窗留著可修改', async () => {
    renderModal(emptyCustomerForm(), { FETCH_ADD_CUSTOMER: new Error('手機號碼已存在') })
    await screen.findByText('新增客戶')
    typeLikeBrowser(field('name'), '林先生')
    typeLikeBrowser(field('cellphone'), '0922333444')
    const add = within(modal()).getByText('新增', { selector: 'button' })
    await wait(() => expect(add).not.toBeDisabled())
    fireEvent.click(add)
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('手機號碼已存在') }))
    )
    expect(screen.getByText('新增客戶')).toBeInTheDocument()
  })

  it('生日：月份超過 12、日期超過 31 的輸入不接受', async () => {
    renderModal(emptyCustomerForm())
    await screen.findByText('新增客戶')
    typeLikeBrowser(field('month'), '13')
    typeLikeBrowser(field('day'), '32')
    expect(field('month')).toHaveValue('')
    expect(field('day')).toHaveValue('')
  })

  it('按取消關閉彈窗，不送出', async () => {
    const page = renderModal(emptyCustomerForm())
    await screen.findByText('新增客戶')
    fireEvent.click(within(modal()).getByText('取消', { selector: 'button' }))
    await wait(() => expect(screen.queryByText('新增客戶')).toBeNull())
    expect(callsOf(page.calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(0)
  })

  it('還沒選店家（localStorage 沒有 userMerchant）：不帶店家送出，交給後端擋下，不拋錯', async () => {
    loginAs({ merchant: null })
    const page = renderModal({ ...emptyCustomerForm(), OfficialBrandMerchantId: undefined })
    await screen.findByText('新增客戶')
    typeLikeBrowser(field('name'), '林先生')
    typeLikeBrowser(field('cellphone'), '0922333444')
    const add = within(modal()).getByText('新增', { selector: 'button' })
    await wait(() => expect(add).not.toBeDisabled())
    fireEvent.click(add)
    await wait(() => expect(callsOf(page.calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(1))
    expect(callsOf(page.calls, 'FETCH_ADD_CUSTOMER')[0].variables.input.OfficialBrandMerchantId).toBeFalsy()
  })
})

describe('編輯顧客', () => {
  it('改偏好設計師後儲存：送出顧客 id 與新的偏好設計師，成功後帳單重新指向這位顧客、手機清空', async () => {
    const page = renderModal(EXISTING)
    expect(await screen.findByText('編輯客戶資料')).toBeInTheDocument()
    // 偏好設計師（相容層 Select 以原生 select 呈現；選項依序為 None、王小美、李助理）
    await wait(() => expect(within(preferSelect()).getByText('李助理')).toBeInTheDocument())
    selectLikeBrowser(preferSelect(), within(preferSelect()).getByText('李助理').value)
    fireEvent.click(within(modal()).getByText('儲存', { selector: 'button' }))
    await wait(() => expect(callsOf(page.calls, 'SET_CUSTOMER')).toHaveLength(1))
    expect(callsOf(page.calls, 'SET_CUSTOMER')[0].variables.input).toEqual(
      expect.objectContaining({ customerId: 'customer-1', PreferDesignerId: 'designer-2', birthday: EXISTING.birthday })
    )
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '成功更新顧客資訊' }))
    expect(bill()).toEqual({ customerId: 'customer-1', customerCellphone: '' })
    expect(screen.queryByText('編輯客戶資料')).toBeNull()
  })

  it('顧客沒填生日與性別：生日三格空白、性別顯示「未知」，儲存時送出空白生日與未知（UNKNOWN）、不拋錯', async () => {
    const page = renderModal({ ...EXISTING, birthday: null, gender: null })
    await screen.findByText('編輯客戶資料')
    expect(field('year')).toHaveValue('')
    expect(field('month')).toHaveValue('')
    // 原生下拉的選項值是序號，以選取中的選項文字判斷
    const gender = modal().querySelector('#orderEditAddCustomer-gender')
    expect(gender.selectedOptions[0] && gender.selectedOptions[0].textContent).toBe('未知')
    fireEvent.click(within(modal()).getByText('儲存', { selector: 'button' }))
    await wait(() => expect(callsOf(page.calls, 'SET_CUSTOMER')).toHaveLength(1))
    expect(callsOf(page.calls, 'SET_CUSTOMER')[0].variables.input.birthday).toEqual({ year: '', month: '', day: '' })
    expect(callsOf(page.calls, 'SET_CUSTOMER')[0].variables.input.gender).toBe('UNKNOWN')
  })

  it('更新失敗：提示原因，彈窗留著', async () => {
    renderModal(EXISTING, { SET_CUSTOMER: new Error('顧客資料已被刪除') })
    await screen.findByText('編輯客戶資料')
    fireEvent.click(within(modal()).getByText('儲存', { selector: 'button' }))
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('顧客資料已被刪除') }))
    )
    expect(screen.getByText('編輯客戶資料')).toBeInTheDocument()
    // 帳單的顧客不變（原本送出當下就先清掉顧客，只有成功才帶回）
    expect(bill()).toEqual({ customerId: 'before', customerCellphone: '0900' })
  })

  it('設計師名單還在載入：偏好設計師顯示載入中，不可選', async () => {
    renderPage(<Harness initialCustomer={EXISTING} />, { fixtures: fixtures(), delays: { FETCH_USERS: 200 } })
    await screen.findByText('編輯客戶資料')
    expect(within(preferSelect()).getByText('載入中…')).toBeInTheDocument()
    expect(within(preferSelect()).queryByText('王小美')).toBeNull()
  })
})

describe('客戶編號重複檢查', () => {
  it('輸入後稍候確認：確認中顯示轉圈；重複時標示「客戶編號重複」；改成沒人用的編號後不標示；清空不檢查', async () => {
    const page = renderModal(emptyCustomerForm())
    await screen.findByText('新增客戶')
    typeLikeBrowser(field('no'), 'C01')
    expect(modal().querySelector('.animate-spin')).not.toBeNull()
    expect(await within(modal()).findByText('客戶編號重複', {}, { timeout: 2000 })).toBeInTheDocument()
    expect(callsOf(page.calls, 'GET_CHECK_IS_CUSTOMER_NO_USED')[0].variables).toEqual({ input: 'C01', customerId: null })

    typeLikeBrowser(field('no'), 'C02')
    await wait(() => expect(within(modal()).queryByText('客戶編號重複')).toBeNull(), { timeout: 2000 })
    await wait(() => expect(modal().querySelector('.animate-spin')).toBeNull(), { timeout: 2000 })

    const before = callsOf(page.calls, 'GET_CHECK_IS_CUSTOMER_NO_USED').length
    typeLikeBrowser(field('no'), '')
    await new Promise(r => setTimeout(r, 600))
    expect(callsOf(page.calls, 'GET_CHECK_IS_CUSTOMER_NO_USED')).toHaveLength(before)
    expect(within(modal()).queryByText('客戶編號重複')).toBeNull()
  })

  it('編輯中的顧客自己的編號不算重複（送出自己的顧客 id 給後端排除）', async () => {
    const page = renderModal(EXISTING)
    await screen.findByText('編輯客戶資料')
    await wait(() => expect(callsOf(page.calls, 'GET_CHECK_IS_CUSTOMER_NO_USED')).toHaveLength(1), { timeout: 2000 })
    expect(callsOf(page.calls, 'GET_CHECK_IS_CUSTOMER_NO_USED')[0].variables).toEqual({ input: 'C01', customerId: 'customer-1' })
    await page.settle()
    expect(within(modal()).queryByText('客戶編號重複')).toBeNull()
  })
})
