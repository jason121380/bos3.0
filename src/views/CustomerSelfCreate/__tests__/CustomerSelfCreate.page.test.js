// 保護顧客前台「顧客資料建立」（自助建檔，/customer/self-create/:id）：店家未開放時顯示未開放；開放時標題顯示店名；
// 電話只收數字；姓名或電話空白時提示不送出；送出的 input 含姓名、電話、暱稱、性別、Email、LINE ID、生日（選定日的時間戳）、地址、
// 店家 id，網址帶 designerId 時一併送出（不送店名與驗證旗標）；成功顯示完成畫面，後端回 false 或錯誤時提示並可再送；
// 「資料建立中」提示不可被點掉。GraphQL 全由 testkit 的模擬 link 回應，不建立真實顧客。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { renderPage, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import CustomerSelfCreate from '..'

jest.setTimeout(20000)

jest.mock('ui/date-picker', () => ({
  MobileDatePicker: ({ value, onChange }) => (
    <input aria-label="選擇生日" data-value={String(value)} onChange={e => onChange(new Date(e.target.value))} />
  ),
}))

const setup = ({ fixtures = {}, route = '/customer/self-create/merchant-9', delays } = {}) =>
  renderPage(<CustomerSelfCreate />, {
    fixtures: {
      GET_MERCHANT_NAME: { getMerchantName: '信義店' },
      GET_CUSTOMER_SELF_CREATE_ACTIVE: { getIsCustomerSelfCreateActive: true },
      CUSTOMER_SELF_CREATE: { customerSelfCreateV2: true },
      ...fixtures,
    },
    path: '/customer/self-create/:id',
    route,
    delays,
  })

const input = label => screen.getByLabelText(new RegExp(`^${label}`))
const submit = () => fireEvent.click(screen.getByRole('button', { name: '提交' }))
const clickAway = async () => {
  await new Promise(resolve => setTimeout(resolve, 10))
  fireEvent.click(document.body)
}
const fillRequired = () => {
  fireEvent.change(input('姓名'), { target: { value: '陳小姐' } })
  fireEvent.change(input('電話'), { target: { value: '0912345678' } })
}

afterEach(cleanup)

describe('顧客自助建檔', () => {
  it('店家未開放：顯示未開放此功能', async () => {
    setup({ fixtures: { GET_CUSTOMER_SELF_CREATE_ACTIVE: { getIsCustomerSelfCreateActive: false } } })
    expect(await screen.findByText('該店未開放此功能')).toBeInTheDocument()
  })

  it('填寫全部欄位送出：input 內容正確（含店家 id 與網址的 designerId），成功顯示完成畫面', async () => {
    const utils = setup({ route: '/customer/self-create/merchant-9?designerId=designer-1' })
    expect(await screen.findByText('信義店 顧客資料建立')).toBeInTheDocument()
    expect(callsOf(utils.calls, 'GET_MERCHANT_NAME')[0].variables).toEqual({ input: 'merchant-9' })
    expect(callsOf(utils.calls, 'GET_CUSTOMER_SELF_CREATE_ACTIVE')[0].variables).toEqual({ input: 'merchant-9' })
    fireEvent.change(input('姓名'), { target: { value: '陳小姐' } })
    fireEvent.change(input('電話'), { target: { value: '09x' } })
    expect(input('電話')).toHaveValue('')
    fireEvent.change(input('電話'), { target: { value: '0912345678' } })
    fireEvent.change(input('暱稱'), { target: { value: '小陳' } })
    expect(screen.getByLabelText('男')).toBeChecked()
    fireEvent.click(screen.getByLabelText('女'))
    expect(screen.getByLabelText('女')).toBeChecked()
    fireEvent.click(screen.getByLabelText('男'))
    expect(screen.getByLabelText('男')).toBeChecked()
    fireEvent.click(screen.getByLabelText('女'))
    fireEvent.change(input('Email'), { target: { value: 'chen@example.com' } })
    fireEvent.change(input('Line ID'), { target: { value: 'chen01' } })
    fireEvent.change(screen.getByLabelText('選擇生日'), { target: { value: '1990/02/28' } })
    fireEvent.change(input('地址'), { target: { value: '台北市信義區' } })
    submit()
    expect(await screen.findByText(/您已填寫完成/)).toBeInTheDocument()
    expect(callsOf(utils.calls, 'CUSTOMER_SELF_CREATE')[0].variables).toEqual({
      input: {
        name: '陳小姐',
        cellphone: '0912345678',
        nickName: '小陳',
        gender: 'FEMALE',
        email: 'chen@example.com',
        lineId: 'chen01',
        birthday: new Date(1990, 1, 28).getTime(),
        address: '台北市信義區',
        merchantId: 'merchant-9',
        designerId: 'designer-1',
      },
    })
  })

  it('姓名或電話空白：提示不得為空、不送出；點畫面其他地方關閉提示', async () => {
    const utils = setup()
    await screen.findByText('信義店 顧客資料建立')
    fireEvent.change(input('姓名'), { target: { value: '  ' } })
    submit()
    expect(await screen.findByText('姓名、電話不得為空')).toBeInTheDocument()
    await clickAway()
    await wait(() => expect(screen.queryByText('姓名、電話不得為空')).toBeNull())
    fireEvent.change(input('姓名'), { target: { value: '陳小姐' } })
    submit()
    expect(await screen.findByText('姓名、電話不得為空')).toBeInTheDocument()
    expect(callsOf(utils.calls, 'CUSTOMER_SELF_CREATE')).toHaveLength(0)
  })

  it('送出中「資料建立中請稍候」點外面不關閉；沒有 designerId 時不送；後端回 false 提示建立失敗並可再送', async () => {
    const utils = setup({ fixtures: { CUSTOMER_SELF_CREATE: { customerSelfCreateV2: false } }, delays: { CUSTOMER_SELF_CREATE: 2000 } })
    await screen.findByText('信義店 顧客資料建立')
    fillRequired()
    submit()
    expect(await screen.findByText('資料建立中請稍候')).toBeInTheDocument()
    await clickAway()
    expect(screen.getByText('資料建立中請稍候')).toBeInTheDocument()
    expect(await screen.findByText('建立失敗')).toBeInTheDocument()
    expect(callsOf(utils.calls, 'CUSTOMER_SELF_CREATE')[0].variables.input).not.toHaveProperty('designerId')
    expect(screen.getByRole('button', { name: '提交' })).not.toBeDisabled()
  })

  it('建立發生錯誤：顯示錯誤訊息', async () => {
    setup({ fixtures: { CUSTOMER_SELF_CREATE: new Error('此電話已建檔') } })
    await screen.findByText('信義店 顧客資料建立')
    fillRequired()
    submit()
    expect(await screen.findByText('此電話已建檔')).toBeInTheDocument()
  })

  // 已知缺口（待 Jason 決定）：開放設定或店名查詢失敗時 data 為 undefined，effect 直接讀欄位拋錯，整頁進入錯誤畫面
  // （views/CustomerSelfCreate/index.js:125、132）。建議：查詢失敗時視為未開放並顯示提示。
  it('已知缺口：開放設定查詢失敗時整頁進入錯誤畫面', async () => {
    const utils = setup({ fixtures: { GET_CUSTOMER_SELF_CREATE_ACTIVE: new Error('查詢失敗') } })
    await utils.settle()
    expect(screen.getByText(PAGE_CRASH_TEXT)).toBeInTheDocument()
  })
})
