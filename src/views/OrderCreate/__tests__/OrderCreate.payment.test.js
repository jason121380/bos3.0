// 保護打帳單「其他付款方式」「扣入金」「紅利點數」「使用預收卡」的金額規則與送出內容：
// - 其他付款方式：金額不得超過應付（不含第三方卡券的品項、已扣入金）；清除付款方式時金額歸 0；品項改變時已輸入的金額歸 0
// - 扣入金：上限為入金餘額與應付金額；只有第三方卡券的帳單不能扣；店家關閉「打帳單扣入金」時只顯示餘額
// - 入金異動權限：有儲值或扣除任一權限才可「異動入金」；找不到角色、沒有客戶管理設定時視為沒有權限
// - 紅利點數：扣點不得超過剩餘點數＋本次給點；折抵金額不得超過應付；開啟換算比率時折抵由扣點換算且不可手動改；
//   給點是否可改依「LINE 綁定才給點」與「給點規則」設定
// - 使用預收卡：選顧客後列出可用的預收卡（同一張不能重複選），帶出卡券金額與助理；助理與「指定」隨帳單送出
// GraphQL 全由模擬 link 回應，不建立真實帳單。
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { loginAs, callsOf } from '../../../__tests__/testkit.test'
import {
  setupPage, waitPageReady, pickEmployee, pickService, pickCustomer, checkoutButton, sentOrder, summaryValue,
  authorities, fieldInput, SERVICE, SERVICE_LOCKED, HELPER, CUSTOMER_DETAIL, button, buttons, buttonsIn, queryButton, findButton,
} from './orderCreateKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

const checkout = async calls => {
  await wait(() => expect(checkoutButton()).not.toBeDisabled())
  fireEvent.click(checkoutButton())
  await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
  return sentOrder(calls)
}
const enter = el => fireEvent.keyDown(el, { key: 'Enter', keyCode: 13 })
const payTypeInput = () => screen.getByPlaceholderText('選擇付款方式')
const walletInput = () => document.querySelector('input[name="walletPay"]')
const pickPayType = async () => {
  fireEvent.click(payTypeInput())
  fireEvent.click(await screen.findByTestId('-LINE Pay'))
  return screen.findByTestId('LINE Pay金額')
}

describe('其他付款方式', () => {
  it('金額不得超過應付；送出付款方式與金額，現金應收扣掉', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    await pickEmployee()
    fireEvent.click(screen.getByLabelText('不留客資'))
    await pickService()
    const amount = await pickPayType()
    fireEvent.change(amount, { target: { value: '900' } })
    expect(amount).toHaveValue('0')
    fireEvent.change(amount, { target: { value: '300' } })
    await wait(() => expect(amount).toHaveValue('300'))
    expect(summaryValue('現金應收')).toHaveTextContent('500')
    const input = await checkout(calls)
    expect(input.payType).toEqual(['LINE Pay'])
    expect(input.amountByOtherPay).toBe(300)
  })

  it('清除付款方式：金額歸 0、不送付款方式', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    await pickEmployee()
    fireEvent.click(screen.getByLabelText('不留客資'))
    await pickService()
    const amount = await pickPayType()
    fireEvent.change(amount, { target: { value: '300' } })
    act(() => payTypeInput().focus())
    fireEvent.mouseDown(buttonsIn(payTypeInput().closest('.ui-root'), '清除')[0])
    await wait(() => expect(screen.queryByTestId('LINE Pay金額')).toBeNull())
    const input = await checkout(calls)
    expect(input.payType).toEqual([])
    expect(input.amountByOtherPay).toBe(0)
  })

  it('只有第三方卡券的品項（不收現）時不能輸入其他付款金額；品項改變後已輸入的金額歸 0', async () => {
    setupPage()
    await waitPageReady()
    await pickEmployee()
    fireEvent.click(screen.getByLabelText('不留客資'))
    await pickService(SERVICE_LOCKED)
    const amount = await pickPayType()
    fireEvent.change(amount, { target: { value: '100' } })
    expect(amount).toHaveValue('0')

    fireEvent.click(screen.getByTestId('service-0-add'))
    await pickService(SERVICE, 1)
    fireEvent.change(amount, { target: { value: '100' } })
    await wait(() => expect(amount).toHaveValue('100'))
    fireEvent.click(screen.getByTestId('service-1-delete'))
    await wait(() => expect(amount).toHaveValue('0'))
  })

  it('付款方式欄 Enter：焦點跳到金額欄', async () => {
    setupPage()
    await waitPageReady()
    await pickEmployee()
    fireEvent.click(screen.getByLabelText('不留客資'))
    await pickService()
    const amount = await pickPayType()
    act(() => payTypeInput().focus())
    enter(payTypeInput())
    await wait(() => expect(amount).toHaveFocus())
    fireEvent.keyDown(payTypeInput(), { key: 'a', keyCode: 65 })
    expect(amount).toBeInTheDocument()
  })
})

describe('扣入金', () => {
  const prepare = async (overrides) => {
    const page = setupPage(overrides)
    await waitPageReady()
    await pickCustomer(page.calls)
    await pickEmployee()
    return page
  }

  it('整筆扣入金後再取消：扣入金歸 0；扣入金後明細顯示扣入金與入金剩餘', async () => {
    const { calls } = await prepare()
    await pickService()
    expect(await screen.findByText(/入金剩餘/)).toHaveTextContent('入金剩餘：1500元')
    fireEvent.click(screen.getByLabelText('整筆扣入金'))
    await wait(() => expect(walletInput()).toHaveValue('800'))
    fireEvent.click(screen.getByLabelText('整筆扣入金'))
    await wait(() => expect(walletInput()).toHaveValue('0'))
    fireEvent.change(walletInput(), { target: { value: '200' } })
    await wait(() => expect(walletInput()).toHaveValue('200'))
    act(() => walletInput().focus())

    fireEvent.click(button('明細'))
    await findButton('結帳並列印')
    const modal = within(document.getElementById('DivIdToPrint'))
    expect(modal.getAllByText('扣入金')[0].nextSibling).toHaveTextContent('200')
    expect(modal.getAllByText('入金剩餘')[0].nextSibling).toHaveTextContent('1,300')
    fireEvent.click(button('返回'))
    expect((await checkout(calls)).walletPay).toBe(200)
  })

  it('只有第三方卡券的品項：整筆扣入金扣 0', async () => {
    await prepare()
    await pickService(SERVICE_LOCKED)
    await screen.findByText(/入金剩餘/)
    fireEvent.click(screen.getByLabelText('整筆扣入金'))
    await wait(() => expect(walletInput()).toHaveValue('0'))
    fireEvent.change(walletInput(), { target: { value: '100' } })
    expect(walletInput()).toHaveValue('0')
  })

  it('店家關閉打帳單扣入金：只顯示入金餘額，不能扣', async () => {
    await prepare({ GET_IS_CUS_WALLET_USAGE_FOR_ORDER: { getParameterOrderCreateSetting: { isCusWalletUsageForOrder: false } } })
    expect(await screen.findByText(/入金剩餘/)).toHaveTextContent('入金剩餘：1500元')
    expect(walletInput()).toBeNull()
    expect(button('異動入金')).toBeInTheDocument()
  })

  it('店家關閉扣入金且沒有入金權限：只顯示餘額，沒有「異動入金」', async () => {
    await prepare({
      GET_IS_CUS_WALLET_USAGE_FOR_ORDER: { getParameterOrderCreateSetting: { isCusWalletUsageForOrder: false } },
      GET_MERCHANT_AUTHORITIES: authorities(false, false),
    })
    await screen.findByText(/入金剩餘/)
    expect(queryButton('異動入金')).toBeNull()
  })

  it('只有入金扣除權限：可開啟異動入金（扣除），返回即關閉', async () => {
    await prepare({ GET_MERCHANT_AUTHORITIES: authorities(false, true) })
    fireEvent.click(await findButton('異動入金'))
    expect(await screen.findAllByText('異動入金')).toHaveLength(2)
    fireEvent.click(button('返回'))
    await wait(() => expect(screen.getAllByText('異動入金')).toHaveLength(1))
  })

  it.each([
    ['登入者的角色不在權限清單', { getMerchantAuthorities: [{ id: 'auth-x', authoritySettings: '[]' }] }],
    ['角色沒有「客戶管理」區塊', { getMerchantAuthorities: [{ id: 'auth-1', authoritySettings: JSON.stringify([{ pageTitle: '其他', pageAuthority: [] }]) }] }],
    ['權限清單查不到', { getMerchantAuthorities: null }],
    ['客戶管理沒有入金項目', { getMerchantAuthorities: [{ id: 'auth-1', authoritySettings: JSON.stringify([{ pageTitle: '客戶管理', pageAuthority: [] }]) }] }],
  ])('%s：視為沒有入金權限（不顯示「異動入金」、頁面不出錯）', async (_name, authority) => {
    await prepare({ GET_MERCHANT_AUTHORITIES: authority })
    expect(await screen.findByText(/入金剩餘/)).toBeInTheDocument()
    expect(queryButton('異動入金')).toBeNull()
  })
})

describe('紅利點數', () => {
  const field = fieldInput
  const prepare = async (overrides) => {
    const page = setupPage({ GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true }, ...overrides })
    await waitPageReady()
    await pickCustomer(page.calls)
    await pickEmployee()
    await pickService()
    return page
  }

  it('扣點不得超過剩餘點數＋本次給點；折抵不得超過應付；負數、非數字不接受', async () => {
    const { calls } = await prepare()
    // 30 − 10 = 20 點
    expect(await screen.findByText('剩餘點數: 20')).toBeInTheDocument()
    fireEvent.change(field('點數扣點'), { target: { value: '25' } })
    expect(field('點數扣點')).toHaveValue('0')
    fireEvent.change(field('點數給點'), { target: { value: '8' } })
    await wait(() => expect(field('點數給點')).toHaveValue('8'))
    fireEvent.change(field('點數扣點'), { target: { value: '25' } })
    await wait(() => expect(field('點數扣點')).toHaveValue('25'))
    fireEvent.change(field('點數折抵金額'), { target: { value: '900' } })
    expect(field('點數折抵金額')).toHaveValue('0')
    fireEvent.change(field('點數折抵金額'), { target: { value: 'abc' } })
    fireEvent.change(field('點數折抵金額'), { target: { value: '-5' } })
    fireEvent.change(field('點數折抵金額'), { target: { value: '100' } })
    await wait(() => expect(field('點數折抵金額')).toHaveValue('100'))
    expect(summaryValue('現金應收')).toHaveTextContent('700')
    const input = await checkout(calls)
    expect(input).toEqual(expect.objectContaining({ bonusDeposit: 8, bonusUsed: 25, bonusDecount: 100 }))
  })

  it('開啟換算比率：折抵金額由扣點換算（無條件捨去）且不能手動改，標題顯示比率', async () => {
    await prepare({
      GET_IS_BONUS_CONVERSION: { getParameterAboutSettingFunction: { isBonusConversion: true, bonusConversionRate: 3 } },
    })
    expect(await screen.findByText('換算比率: 3')).toBeInTheDocument()
    expect(field('點數折抵金額')).toBeDisabled()
    fireEvent.change(field('點數扣點'), { target: { value: '10' } })
    await wait(() => expect(field('點數折抵金額')).toHaveValue('3'))
  })

  it('給點規則啟用時給點由系統計算，不能手動改', async () => {
    await prepare({
      GET_BONUS_REWARD_RULE: {
        getParameterAboutSettingFunction: { bonusRewardRule: { isUsing: true, rule: { price: 100, bonus: 1, mode: 'ROUNDING' } } },
      },
    })
    expect(field('點數給點')).toBeDisabled()
  })

  it('「LINE 綁定才給點」：未綁定 LINE 的顧客不能給點；已綁定可給點', async () => {
    await prepare({ GET_IS_BONUS_REWARD_WITH_LINE: { getParameterAboutSettingFunction: { isBonusRewardWithLine: true } } })
    expect(field('點數給點')).toBeDisabled()
    cleanup()
    await prepare({
      GET_IS_BONUS_REWARD_WITH_LINE: { getParameterAboutSettingFunction: { isBonusRewardWithLine: true } },
      FETCH_CUSTOMER_DETAIL: v => ({ customer: v.id ? { ...CUSTOMER_DETAIL, isLineBinded: true } : null }),
    })
    await wait(() => expect(field('點數給點')).not.toBeDisabled())
  })

  it('收合時標題顯示折抵金額；不留客資時不顯示紅利點數', async () => {
    await prepare()
    await screen.findByText('剩餘點數: 20')
    fireEvent.click(screen.getByTestId('panelRemark'))
    fireEvent.change(field('點數折抵金額'), { target: { value: '50' } })
    await wait(() => expect(field('點數折抵金額')).toHaveValue('50'))
    fireEvent.click(screen.getByTestId('panelRemark'))
    expect(await screen.findByText('折抵 50')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('不留客資'))
    await wait(() => expect(screen.queryByText(/剩餘點數/)).toBeNull())
  })
})

describe('使用預收卡', () => {
  const RECORDS = [
    {
      ticketName: '剪髮十次卡', remark: '', price: 700,
      ticketRecordForOrder: [
        { id: 'tr-1', no: '1', name: '剪髮十次卡', price: 700, remark: '', helperSetting: [{ type: '助理', helperDeductionType: 'PERCENT', nameList: ['洗髮', '吹整'] }] },
        { id: 'tr-2', no: '2', name: '剪髮十次卡', price: 700, remark: '', helperSetting: [{ type: '助理', helperDeductionType: 'PERCENT', nameList: ['洗髮', '吹整'] }] },
      ],
    },
    {
      ticketName: '護髮五次卡', remark: '限本店', price: 1000,
      ticketRecordForOrder: [{ id: 'tr-3', no: '3', name: '護髮五次卡', price: 1000, remark: '限本店', helperSetting: [] }],
    },
  ]
  const PRICES = { 'tr-1': 700, 'tr-2': 700, 'tr-3': 1000 }
  const fixtures = {
    GET_TICKET_RECORDS_FOR_ORDERS_V2: { ticketRecordsForOrderV2: RECORDS },
    GET_TICKET_RECORDS_FOR_ORDERS: {
      ticketRecordsForOrder: RECORDS.flatMap(r => r.ticketRecordForOrder.map(({ id, name, price, remark }) => ({ id, name, price, remark }))),
    },
    GetTicket: v => ({ ticketRecords: { data: (v.input.ids || []).map(id => ({ id, price: PRICES[id] })) } }),
  }
  const couponInputs = () => screen.getAllByPlaceholderText('卡券代號/名稱')
  const pickRecord = async (name, row = 0) => {
    fireEvent.click(couponInputs()[row])
    fireEvent.click(await screen.findByTestId(`-${name}`))
  }
  const prepare = async (overrides, total = '3') => {
    const page = setupPage({ ...fixtures, ...overrides })
    await waitPageReady()
    await pickCustomer(page.calls)
    await pickEmployee()
    fireEvent.click(screen.getByTestId('panelCouponUse'))
    await screen.findByText(`x${total}`)
    return page
  }

  it('選預收卡：帶出卡券金額與助理欄，選的助理與指定隨帳單送出；使用預收卡計入業績', async () => {
    const { calls } = await prepare()
    await pickRecord('剪髮十次卡')
    expect(await screen.findByDisplayValue('700')).toBeDisabled()
    const wash = screen.getByPlaceholderText('助理-洗髮')
    await pickEmployee(wash, HELPER)
    // 選了助理後焦點到「指定」
    await wait(() => expect(document.activeElement.name).toBe('助理-洗髮designate'))
    fireEvent.click(document.activeElement)
    await wait(() => expect(summaryValue('使用預收卡')).toHaveTextContent('700'))
    expect(summaryValue('業績合計')).toHaveTextContent('700')
    const { useTicketOrders } = await checkout(calls)
    expect(useTicketOrders).toEqual([
      {
        customerTicketId: 'tr-1',
        useTicketOrderHelpers: [expect.objectContaining({ type: '助理-洗髮', helperId: HELPER.userId, isDesignate: true })],
      },
    ])
  })

  it('同一張預收卡不能重複選；新增一列後選同類卡帶出下一張', async () => {
    const { calls } = await prepare()
    await pickRecord('護髮五次卡')
    fireEvent.click(button('新增項目', screen.getByTestId('panelCouponUse').parentElement))
    await wait(() => expect(couponInputs()).toHaveLength(2))
    fireEvent.click(couponInputs()[1])
    // 護髮五次卡只有一張且已選，第二列只剩剪髮十次卡
    expect(await screen.findByTestId('-剪髮十次卡')).toBeInTheDocument()
    expect(screen.queryByTestId('-護髮五次卡')).toBeNull()
    fireEvent.click(screen.getByTestId('-剪髮十次卡'))
    const { useTicketOrders } = await checkout(calls)
    expect(useTicketOrders.map(d => d.customerTicketId)).toEqual(['tr-3', 'tr-1'])
  })

  it('清除此列、清除欄位：該卡不再使用', async () => {
    await prepare()
    await pickRecord('剪髮十次卡')
    await screen.findByPlaceholderText('助理-洗髮')
    fireEvent.click(button('清除此列', screen.getByTestId('panelCouponUse').parentElement))
    await wait(() => expect(screen.queryByPlaceholderText('助理-洗髮')).toBeNull())
    await wait(() => expect(screen.getByText(/尚缺/)).toHaveTextContent('至少一項消費'))

    await pickRecord('剪髮十次卡')
    await screen.findByPlaceholderText('助理-洗髮')
    act(() => couponInputs()[0].focus())
    fireEvent.mouseDown(buttonsIn(couponInputs()[0].closest('.ui-root'), '清除')[0])
    await wait(() => expect(screen.queryByPlaceholderText('助理-洗髮')).toBeNull())
    await wait(() => expect(screen.getByText(/尚缺/)).toHaveTextContent('至少一項消費'))
  })

  it('Enter：卡券 → 第一個助理 → 指定 → 下一個助理 → 最後一個指定新增下一列並跳到該列卡券', async () => {
    await prepare()
    await pickRecord('剪髮十次卡')
    const wash = await screen.findByPlaceholderText('助理-洗髮')
    act(() => couponInputs()[0].focus())
    enter(couponInputs()[0])
    await wait(() => expect(wash).toHaveFocus())
    enter(wash)
    await wait(() => expect(document.activeElement.name).toBe('助理-洗髮designate'))
    enter(document.activeElement)
    await wait(() => expect(screen.getByPlaceholderText('助理-吹整')).toHaveFocus())
    enter(screen.getByPlaceholderText('助理-吹整'))
    await wait(() => expect(document.activeElement.name).toBe('助理-吹整designate'))
    enter(document.activeElement)
    await wait(() => expect(couponInputs()).toHaveLength(2))
    await wait(() => expect(couponInputs()[1]).toHaveFocus())
    // 非 Enter 不動作
    fireEvent.keyDown(wash, { key: 'a', keyCode: 65 })
    fireEvent.keyDown(couponInputs()[1], { key: 'a', keyCode: 65 })
    expect(couponInputs()).toHaveLength(2)
  })

  it('Enter：沒有助理的卡券直接新增下一列；沒選卡券時 Enter 不動作', async () => {
    await prepare()
    act(() => couponInputs()[0].focus())
    enter(couponInputs()[0])
    expect(couponInputs()).toHaveLength(1)
    await pickRecord('護髮五次卡')
    enter(couponInputs()[0])
    await wait(() => expect(couponInputs()).toHaveLength(2))
    await wait(() => expect(couponInputs()[1]).toHaveFocus())
  })

  it('換顧客時重新查詢該顧客的預收卡；清除顧客後不顯示預收卡數量', async () => {
    const { calls } = await prepare()
    expect(callsOf(calls, 'GET_TICKET_RECORDS_FOR_ORDERS_V2')[0].variables).toEqual({ customerId: 'customer-1' })
    const customerInput = screen.getByPlaceholderText('顧客姓名/手機號碼/編號')
    act(() => customerInput.focus())
    fireEvent.mouseDown(buttons('清除')[0])
    await wait(() => expect(screen.queryByText('x3')).toBeNull())
    expect(screen.queryByPlaceholderText('卡券代號/名稱')).toBeNull()
  })

  it('卡券設定了兩類助理：兩類的助理欄都列出；指定欄按一般按鍵不跳欄', async () => {
    await prepare({
      GET_TICKET_RECORDS_FOR_ORDERS_V2: {
        ticketRecordsForOrderV2: [
          {
            ticketName: '染燙卡', remark: '', price: 3000,
            ticketRecordForOrder: [{
              id: 'tr-9', no: '9', name: '染燙卡', price: 3000, remark: '',
              helperSetting: [
                { type: '助理', helperDeductionType: 'PERCENT', nameList: ['洗髮'] },
                { type: '技師', helperDeductionType: 'CASH', nameList: ['上色'] },
              ],
            }],
          },
        ],
      },
    }, '1')
    await pickRecord('染燙卡')
    expect(await screen.findByPlaceholderText('助理-洗髮')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('技師-上色')).toBeInTheDocument()
    const designate = document.querySelector('input[name="助理-洗髮designate"]')
    act(() => designate.focus())
    fireEvent.keyDown(designate, { key: 'a', keyCode: 65 })
    expect(designate).toHaveFocus()
  })

  it('多列時清除其中一列：另一列照樣使用', async () => {
    const { calls } = await prepare()
    await pickRecord('護髮五次卡')
    fireEvent.click(button('新增項目', screen.getByTestId('panelCouponUse').parentElement))
    await wait(() => expect(couponInputs()).toHaveLength(2))
    await pickRecord('剪髮十次卡', 1)
    await screen.findByPlaceholderText('助理-洗髮')
    fireEvent.click(buttonsIn(screen.getByTestId('panelCouponUse').parentElement, '清除此列')[0])
    await wait(() => expect(couponInputs()[0]).toHaveValue(''))
    const { useTicketOrders } = await checkout(calls)
    expect(useTicketOrders).toEqual([{ customerTicketId: 'tr-1', useTicketOrderHelpers: [] }])
  })

  it('收合時標題顯示已使用張數；不留客資時不顯示使用預收卡', async () => {
    await prepare()
    await pickRecord('護髮五次卡')
    fireEvent.click(screen.getByTestId('panelCouponUse'))
    expect(await screen.findByText('已填 1 筆')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('不留客資'))
    await wait(() => expect(screen.queryByTestId('panelCouponUse')).toBeNull())
  })
})
