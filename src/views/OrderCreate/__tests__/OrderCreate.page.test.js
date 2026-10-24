// 保護「打帳單」整頁流程：設定載入後才可打單、缺什麼就擋結帳、送出的帳單內容（服務人員、服務項目、金額、不留客資）正確、
// 掛單只記錄不成立、送出失敗要提示並可重按。GraphQL 全部由 MockedProvider（testkit 的模擬 link）回應，不連後端、不建立真實帳單。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import OrderCreate from '../OrderCreate'

// 顧客搜尋有 800ms 防抖、整頁有數十支查詢，流程測試給較寬的時間
jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const DESIGNER = { userId: 'designer-1', userName: '王小美', userNickName: 'Amy', userNo: '01' }
const SERVICE = {
  id: 'service-1',
  no: 'S01',
  name: '精緻剪髮',
  price: 800,
  isLocked: false,
  isNoCash: false,
  bindedThirdPartTicket: null,
  isBindedThirdPartTicketLocked: false,
}

const orderSettingFixtures = (overrides = {}) => ({
  GET_DESIGNATION_SETTING_FOR_ORDER_CREATE: { getDesignationSettingForOrderCreate: 'DESIGNATE' },
  GET_IS_LBCUS_DISPLAY: { getParameterOrderCreateSetting: { isLBCusDisplay: false } },
  GET_IS_CUS_WALLET_USAGE_FOR_ORDER: { getParameterOrderCreateSetting: { isCusWalletUsageForOrder: true } },
  GET_IS_BONUS_REWARD_WITH_LINE: { getParameterAboutSettingFunction: { isBonusRewardWithLine: false } },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
  GET_PRINT_WINDOW_CLOSURE_DELAYED: { getParameterOrderCreateSetting: { isPrintWindowClosureDelayed: false } },
  GET_LAST_ORDER_STATUS: { getLatestOrderStatus: { orderNo: 'A001', isDesignate: true } },
  GET_SERIAL_NUMBER_USING: { getParameterOrderCreateSetting: { isOrderSerialNumberUsing: false } },
  GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: {
    getBindedThirdPartTicketLockedSetting: { service: false, product: false, membership: false },
  },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true },
  GET_BONUS_REWARD_RULE: {
    getParameterAboutSettingFunction: {
      bonusRewardRule: { isUsing: false, rule: { price: 100, bonus: 1, mode: 'ROUNDING' } },
    },
  },
  GET_IS_BONUS_CONVERSION: { getParameterAboutSettingFunction: { isBonusConversion: false, bonusConversionRate: 0 } },
  GET_DISBLE_PENDING_ORDER: { getParameterAboutSettingFunction: { disablePendingOrder: false } },
  SET_UPDATE_USER_ORDERABLE_LIST: { updateUserOrderableList: true },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹', '網路'] },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [DESIGNER] },
  GET_ORDER_WITHOUT_CUSTOMER_SETTING: { orderWithoutCustomerDefault: true },
  GET_SERVICES_FOR_AUTOCOMPLETE: { services: { totalCount: 1, pageOffset: 0, pageLimit: 50, data: [SERVICE] } },
  FETCH_CREATE_ORDER: { createOrder2: true },
  // 選定服務後查該服務的助理抽成設定（本測試的服務不需要助理）
  service: { service: { helperDeductionSetting: [] } },
  // 明細彈窗
  FETCH_CUSTOMER_DETAIL_IN_ORDER_DETAIL: { customer: null },
  FETCH_DESIGNER_IN_ORDER_DETAIL: { merchantDesigner: { name: DESIGNER.userName, nickName: DESIGNER.userNickName } },
  GET_SERVICES_IN_ORDER_DETAIL: { services: { data: [SERVICE] } },
  GET_DESIGNER_NAME_DISPLAY_ON_INVOICE: { getDesignerNameDisplayOnInvoice: 'BOTH' },
  // 顧客搜尋與選定後的顧客資料
  FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers: [CUSTOMER] } },
  FETCH_CUSTOMER_DETAIL: { customer: { ...CUSTOMER, isUnwelcome: false, isLineBinded: false, membershipPurchaseRecord: [] } },
  customerWallet: { customerWallet: 1500 },
  // 紅利點數紀錄（加總為可用點數）
  GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [{ bonus: 30 }, { bonus: -10 }] },
  // 入金異動權限：登入者身分對應的權限設定（JSON 字串）
  FETCH_PROFILE_IDENDITY: { me: { id: 'user-1', merchantIdentity: { authorityName: '店長', authorityId: 'auth-1' } } },
  GET_MERCHANT_AUTHORITIES: {
    getMerchantAuthorities: [
      {
        id: 'auth-1',
        authorityName: '店長',
        authoritySettings: JSON.stringify([
          {
            pageTitle: '客戶管理',
            pageAuthority: [
              { pageName: '入金(儲值)', authority: true },
              { pageName: '入金(扣除)', authority: false },
            ],
          },
        ]),
      },
    ],
  },
  ...overrides,
})

const CUSTOMER = { id: 'customer-1', name: '陳小姐', cellphone: '0912345678', no: 'C01' }

const setup = (overrides, options) =>
  renderPage(<OrderCreate />, { fixtures: orderSettingFixtures(overrides), route: '/order/create', ...options })

const checkoutButton = () => screen.getByRole('button', { name: '結帳' })

// 依「服務人員 → 不留客資 → 服務項目」完成一張最基本的帳單
const fillMinimalBill = async () => {
  // 頁首的服務人員（第一個）；店販、會員卡列也有同樣的服務人員欄位
  const designer = screen.getAllByPlaceholderText('服務人員姓名/編號')[0]
  fireEvent.change(designer, { target: { value: '王' } })
  fireEvent.click(await screen.findByTestId('employee-王小美'))

  fireEvent.click(await screen.findByLabelText('不留客資'))
  expect(screen.getByLabelText('不留客資')).toBeChecked()

  const service = screen.getByPlaceholderText('服務名稱/代號')
  fireEvent.change(service, { target: { value: '剪' } })
  fireEvent.click(await screen.findByTestId('S01'))
}

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('打帳單：載入', () => {
  it('設定載入後顯示打帳單與上一筆帳單編號；尚未填寫時說明缺少的欄位並停用結帳', async () => {
    const { calls } = setup()
    expect(await screen.findByText(/#A001/)).toBeInTheDocument()
    // 店家設定「指定」：預設帶入指定
    await wait(() => expect(screen.getByRole('button', { name: '指定' })).toHaveAttribute('aria-pressed', 'true'))
    expect(screen.getByText(/尚缺/)).toHaveTextContent('服務人員')
    expect(screen.getByText(/尚缺/)).toHaveTextContent('至少一項消費')
    expect(checkoutButton()).toBeDisabled()
    // 打帳單前先請後端更新可打單人員名單
    expect(callsOf(calls, 'SET_UPDATE_USER_ORDERABLE_LIST')).toHaveLength(1)
  })

  it('更新可打單人員失敗時仍顯示打帳單（沿用現有名單），櫃台不會整頁空白', async () => {
    setup({ SET_UPDATE_USER_ORDERABLE_LIST: new Error('網路暫斷') })
    expect(await screen.findByText(/#A001/)).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText('服務人員姓名/編號')[0]).toBeInTheDocument()
  })

  it('店家設定「依上一筆」時，指定方式跟著上一筆帳單', async () => {
    setup({
      GET_DESIGNATION_SETTING_FOR_ORDER_CREATE: { getDesignationSettingForOrderCreate: 'LAST' },
      GET_LAST_ORDER_STATUS: { getLatestOrderStatus: { orderNo: 'A002', isDesignate: false } },
    })
    expect(await screen.findByText(/#A002/)).toBeInTheDocument()
    await wait(() => expect(screen.getByRole('button', { name: '不指定' })).toHaveAttribute('aria-pressed', 'true'))
    expect(screen.getByRole('button', { name: '指定' })).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('打帳單：結帳送出', () => {
  it('選服務人員、不留客資、選服務後可結帳；送出的帳單含服務人員、服務與金額，成功後提示', async () => {
    const { calls } = setup()
    await screen.findByText(/#A001/)
    await fillMinimalBill()

    // 金額彙總即時反映所選服務的價格
    await wait(() => expect(screen.getAllByText('服務消費')[0].nextSibling).toHaveTextContent('800'))
    await wait(() => expect(checkoutButton()).not.toBeDisabled())

    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    const { input } = callsOf(calls, 'FETCH_CREATE_ORDER')[0].variables
    expect(input.designerId).toBe(DESIGNER.userId)
    expect(input.withoutCustomerData).toBe(true)
    expect(input.isDesignate).toBe(true)
    expect(input.serviceOrders).toEqual([
      expect.objectContaining({ serviceId: SERVICE.id, price: 800 }),
    ])
    expect(input.isPending).toBeUndefined()
    // 送出時帶前端產生的檢查碼，避免重複送出成立兩張帳單
    expect(typeof input.checkCodeFromFE).toBe('string')
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '帳單新增成功', variant: 'success' }))
    )
  })

  const selectCustomerDesignerService = async calls => {
    const customerInput = screen.getByPlaceholderText('顧客姓名/手機號碼/編號')
    fireEvent.change(customerInput, { target: { value: '0912' } })
    // 搜尋有 800ms 防抖，結果回來後才出現選項
    fireEvent.click(await screen.findByText('陳小姐/0912345678/C01', {}, { timeout: 3000 }))
    await wait(() => expect(callsOf(calls, 'FETCH_CUSTOMER_DETAIL').some(c => c.variables.id === CUSTOMER.id)).toBe(true))

    const designer = screen.getAllByPlaceholderText('服務人員姓名/編號')[0]
    fireEvent.change(designer, { target: { value: '王' } })
    fireEvent.click(await screen.findByTestId('employee-王小美'))
    fireEvent.change(screen.getByPlaceholderText('服務名稱/代號'), { target: { value: '剪' } })
    fireEvent.click(await screen.findByTestId('S01'))
  }

  it('選擇既有顧客：帳單帶入顧客 id（不帶手機），不是不留客資', async () => {
    const { calls } = setup()
    await screen.findByText(/#A001/)
    await selectCustomerDesignerService(calls)

    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    const { input } = callsOf(calls, 'FETCH_CREATE_ORDER')[0].variables
    expect(input.customerId).toBe(CUSTOMER.id)
    // 已選既有顧客時以 id 為準，手機欄清空（helper/billVerify 的 handleTidyBill），避免後端另建一位同手機的新顧客
    expect(input.customerCellphone).toBe('')
    expect(input.withoutCustomerData).toBeFalsy()
    expect(input.walletPay).toBe(0)
  })

  it('扣入金：整筆扣入金以「應付金額」為上限（入金 1500、消費 800 → 扣 800），手動輸入超過上限不接受', async () => {
    const { calls } = setup()
    await screen.findByText(/#A001/)
    await selectCustomerDesignerService(calls)
    expect(await screen.findByText(/入金剩餘/)).toHaveTextContent('入金剩餘：1500元')
    // 有「入金(儲值)」權限即可看到異動入金
    expect(screen.getByRole('button', { name: '異動入金' })).toBeInTheDocument()

    await wait(() => expect(screen.getAllByText('服務消費')[0].nextSibling).toHaveTextContent('800'))
    fireEvent.click(screen.getByLabelText('整筆扣入金'))
    const walletInput = document.querySelector('input[name="walletPay"]')
    await wait(() => expect(walletInput).toHaveValue('800'))
    // 扣除後剩餘
    expect(screen.getByText('700元')).toBeInTheDocument()

    // 超過入金餘額與應付金額的輸入不接受，維持原值
    fireEvent.change(walletInput, { target: { value: '2000' } })
    expect(walletInput).toHaveValue('800')
    fireEvent.change(walletInput, { target: { value: '300' } })
    await wait(() => expect(walletInput).toHaveValue('300'))

    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')[0].variables.input.walletPay).toBe(300)
  })

  const bonusInput = label => screen.getByText(label, { selector: 'label' }).parentElement.querySelector('input')

  // 改服務售價會換掉 serviceOrders，打帳單既有 effect 會把扣入金歸 0，測不到「上限下降」。
  // 點數換算折抵不換品項陣列：先整筆扣入金，再扣點讓折抵出現，扣入金必須降到新上限，現金應收不能變負。
  it('整筆扣入金後點數折抵讓上限下降：扣入金跟著降，現金應收不會變負', async () => {
    const { calls } = setup({
      GET_IS_BONUS_CONVERSION: { getParameterAboutSettingFunction: { isBonusConversion: true, bonusConversionRate: 1 } },
    })
    await screen.findByText(/#A001/)
    await selectCustomerDesignerService(calls)
    await wait(() => expect(screen.getAllByText('服務消費')[0].nextSibling).toHaveTextContent('800'))
    await screen.findByText('剩餘點數: 20')
    fireEvent.click(screen.getByLabelText('整筆扣入金'))
    const walletInput = document.querySelector('input[name="walletPay"]')
    await wait(() => expect(walletInput).toHaveValue('800'))
    fireEvent.change(bonusInput('點數扣點'), { target: { value: '20' } })
    await wait(() => expect(bonusInput('點數折抵金額')).toHaveValue('20'))
    await wait(() => expect(walletInput).toHaveValue('780'))
    await wait(() => expect(screen.getAllByText('現金應收')[0].nextSibling).toHaveTextContent(/^0$/))
  })

  it('整筆扣入金後取消點數折抵：不把已扣的入金再調高', async () => {
    const { calls } = setup({
      GET_IS_BONUS_CONVERSION: { getParameterAboutSettingFunction: { isBonusConversion: true, bonusConversionRate: 1 } },
    })
    await screen.findByText(/#A001/)
    await selectCustomerDesignerService(calls)
    await screen.findByText('剩餘點數: 20')
    fireEvent.change(bonusInput('點數扣點'), { target: { value: '20' } })
    await wait(() => expect(bonusInput('點數折抵金額')).toHaveValue('20'))
    fireEvent.click(screen.getByLabelText('整筆扣入金'))
    const walletInput = document.querySelector('input[name="walletPay"]')
    await wait(() => expect(walletInput).toHaveValue('780'))
    fireEvent.change(bonusInput('點數扣點'), { target: { value: '0' } })
    await wait(() => expect(bonusInput('點數折抵金額')).toHaveValue('0'))
    expect(walletInput).toHaveValue('780')
    expect(screen.getAllByText('現金應收')[0].nextSibling).toHaveTextContent('20')
  })

  it('扣入金：入金餘額不足時整筆扣入金只扣餘額', async () => {
    const { calls } = setup({ customerWallet: { customerWallet: 500 } })
    await screen.findByText(/#A001/)
    await selectCustomerDesignerService(calls)
    expect(await screen.findByText(/入金剩餘/)).toHaveTextContent('入金剩餘：500元')
    await wait(() => expect(screen.getAllByText('服務消費')[0].nextSibling).toHaveTextContent('800'))
    fireEvent.click(screen.getByLabelText('整筆扣入金'))
    await wait(() => expect(document.querySelector('input[name="walletPay"]')).toHaveValue('500'))
    expect(screen.getByText('0元')).toBeInTheDocument()
  })

  it('沒有入金儲值／扣除權限的身分看不到「異動入金」', async () => {
    const noAuthority = {
      getMerchantAuthorities: [
        {
          id: 'auth-1',
          authoritySettings: JSON.stringify([
            {
              pageTitle: '客戶管理',
              pageAuthority: [
                { pageName: '入金(儲值)', authority: false },
                { pageName: '入金(扣除)', authority: false },
              ],
            },
          ]),
        },
      ],
    }
    const { calls } = setup({ GET_MERCHANT_AUTHORITIES: noAuthority })
    await screen.findByText(/#A001/)
    await selectCustomerDesignerService(calls)
    expect(await screen.findByText(/入金剩餘/)).toHaveTextContent('入金剩餘：1500元')
    expect(screen.queryByRole('button', { name: '異動入金' })).toBeNull()
  })

  it('送出失敗時提示錯誤並恢復結帳按鈕，可以重新送出', async () => {
    const { calls } = setup({ FETCH_CREATE_ORDER: new Error('庫存不足') })
    await screen.findByText(/#A001/)
    await fillMinimalBill()
    await wait(() => expect(checkoutButton()).not.toBeDisabled())

    fireEvent.click(checkoutButton())
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('庫存不足') }))
    )
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1)
  })

  it('掛單：確認後以 isPending 送出（只記錄、不成立帳單）', async () => {
    const { calls } = setup()
    await screen.findByText(/#A001/)
    await fillMinimalBill()
    const pending = screen.getByRole('button', { name: '掛單' })
    await wait(() => expect(pending).not.toBeDisabled())
    fireEvent.click(pending)
    // 掛單前會先確認
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('確認要掛單嗎') }))
    const confirm = openSnackbar.mock.calls.find(([arg]) => /確認要掛單嗎/.test(arg.message))[0]
    expect(confirm.orderPending).toBe(true)
    // 使用者在確認對話框按下確定
    confirm.usehandleCreateDraftOrder()
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')[0].variables.input.isPending).toBe(true)
  })

  it('停用掛單的店家看不到掛單按鈕', async () => {
    setup({ GET_DISBLE_PENDING_ORDER: { getParameterAboutSettingFunction: { disablePendingOrder: true } } })
    await screen.findByText(/#A001/)
    await wait(() => expect(screen.queryByRole('button', { name: '掛單' })).toBeNull())
  })
})

describe('打帳單：結帳前確認明細', () => {
  it('明細列出顧客與設計師（依發票名稱設定顯示）；在明細內按結帳送出同一份帳單', async () => {
    const { calls } = setup()
    await screen.findByText(/#A001/)
    await fillMinimalBill()
    const detailButton = screen.getByRole('button', { name: '明細' })
    await wait(() => expect(detailButton).not.toBeDisabled())
    fireEvent.click(detailButton)

    const title = await screen.findByText('消費明細')
    const modal = within(title.closest('[role="dialog"]') || document.body)
    // 畫面明細（列印範本另有同樣內容，取第一份）
    expect(modal.getAllByText(/顧客:未選擇/)[0]).toBeInTheDocument()
    expect(modal.getAllByText(/設計師:/)[0]).toHaveTextContent('設計師:王小美(Amy)')
    // 櫃檯看「現金應收」收錢、收據印「付現金額」給顧客：曾經永遠是 0（2026/10/21 修正），必須等於帳單金額
    expect(modal.getAllByText('應付帳款')[0].parentElement).toHaveTextContent('800')
    expect(modal.getAllByText('現金應收')[0].parentElement).toHaveTextContent('800')
    expect(screen.getAllByText(/付現金額：/)[0]).toHaveTextContent('付現金額：800')

    fireEvent.click(modal.getByRole('button', { name: '結帳' }))
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    const { input } = callsOf(calls, 'FETCH_CREATE_ORDER')[0].variables
    expect(input.designerId).toBe(DESIGNER.userId)
    expect(input.serviceOrders).toEqual([expect.objectContaining({ serviceId: SERVICE.id, price: 800 })])
  })
})

describe('打帳單：金額彙總區塊', () => {
  it('未選任何項目時各項金額為 0，業績合計與現金應收也為 0', async () => {
    setup()
    await screen.findByText(/#A001/)
    const summary = within(document.getElementById('panel'))
    expect(summary.getAllByText('業績合計')[0].nextSibling).toHaveTextContent('0')
    expect(summary.getAllByText('現金應收')[0].nextSibling).toHaveTextContent('0')
  })
})
