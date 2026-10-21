// 保護「帳單詳細」裡 2026/10/21 改用 views/OrderShared 共用的部分，確保合併後在這一頁仍照原本運作：
// - 店販「從清單選擇」（useProductPicker）：只列出可販售的商品，選取後該列帶入商品與售價，重新結帳送出的店販就是它
// - 金額彙總（BillSummary）：手機底部固定列的展開鈕可展開／收起完整明細，數字與彙總卡相同
// - 帳單來源（BillSourceField）：改來源後送出的帳單帶新來源
// - 只輸入手機就按「新增顧客」（quickAddCustomerInput）：以該手機與目前店家先建立顧客，再開啟彈窗補資料
// GraphQL 全由模擬 link 回應，不連後端、不改真實帳單或顧客。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, MERCHANT_ID } from '../../../__tests__/testkit.test'
import OrderEdit from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const DESIGNER = { userId: 'designer-1', userName: '王小美', userNickName: 'Amy', userNo: '01' }
const SERVICE = { id: 'service-1', no: 'S01', name: '精緻剪髮', price: 800, isLocked: false, isNoCash: false, bindedThirdPartTicket: null, isBindedThirdPartTicketLocked: false }
const SHAMPOO = { id: 'product-1', no: 'P01', name: '洗髮精', sellPrice: 1200, isLocked: false, isUsing: true, isAvailableForSale: true, productCategory: { id: 'pc-1', name: '洗護' } }
// 停售的商品不應出現在選擇清單
const RETIRED = { id: 'product-2', no: 'P02', name: '停售髮蠟', sellPrice: 500, isLocked: false, isUsing: true, isAvailableForSale: false, productCategory: { id: 'pc-1', name: '洗護' } }

const ORDER = {
  id: 'order-1',
  no: 'A123',
  date: new Date(2026, 9, 21, 10, 30).getTime(),
  payType: [],
  walletPay: 0,
  isReserved: false,
  isDesignate: true,
  isCloseAccount: false,
  amountByOtherPay: 0,
  status: '已完成',
  remark: '',
  customer: { id: 'no-customer', no: '', name: '不留客資', cellphone: '' },
  designer: { id: DESIGNER.userId, name: DESIGNER.userName, designerNo: '01' },
  serviceOrders: [
    {
      id: 'so-1',
      name: SERVICE.name,
      price: 800,
      thirdPartyPayName: null,
      thirdPartyPayId: null,
      service: { id: SERVICE.id, name: SERVICE.name, no: SERVICE.no, isLocked: false, isNoCash: false, isBindedThirdPartTicketLocked: false },
      helperList: [],
    },
  ],
  productOrders: [],
  ticketOrders: [],
  membershipOrders: [],
  useTicketOrders: [],
  staticDetail: [],
  isServiceEditable: true,
  isProductEditable: true,
  isTicketSellingEditable: true,
  isTicketUsageEditable: true,
  bonusDecount: 0,
  bonusDeposit: 0,
  bonusUsed: 0,
  source: null,
  serialNumber: null,
  raffleRecord: [],
}

const fixtures = (overrides = {}) => ({
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: false },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [DESIGNER] },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹', '網路'] },
  GET_SERIAL_NUMBER_USING: { getParameterOrderCreateSetting: { isOrderSerialNumberUsing: false } },
  GET_IS_BONUS_REWARD_WITH_LINE: { getParameterAboutSettingFunction: { isBonusRewardWithLine: false } },
  GET_IS_LBCUS_DISPLAY: { getParameterOrderCreateSetting: { isLBCusDisplay: false } },
  GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: {
    getBindedThirdPartTicketLockedSetting: { service: false, product: false, membership: false },
  },
  GET_BONUS_REWARD_RULE: {
    getParameterAboutSettingFunction: { bonusRewardRule: { isUsing: false, rule: { price: 100, bonus: 1, mode: 'ROUNDING' } } },
  },
  GET_IS_BONUS_CONVERSION: { getParameterAboutSettingFunction: { isBonusConversion: false, bonusConversionRate: 0 } },
  GET_DISBLE_PENDING_ORDER: { getParameterAboutSettingFunction: { disablePendingOrder: false } },
  GET_IS_COMBO_SETTING: { getParameterAboutSettingFunction: { isComboUsing: false } },
  FETCH_ORDER: { order: ORDER },
  FETRCH_SERVICE_ORDER: { order: ORDER },
  FETCH_PRODUCT_ORDER: { order: ORDER },
  FETCH_MEMBERSHIP_ORDER: { order: ORDER },
  GET_SERVICES_FOR_AUTOCOMPLETE: { services: { totalCount: 1, pageOffset: 0, pageLimit: 50, data: [SERVICE] } },
  service: { service: { helperDeductionSetting: [] } },
  // 店販選擇清單（未命名查詢）與分類
  undefined: { products: { totalCount: 2, pageOffset: 0, pageLimit: 50, data: [SHAMPOO, RETIRED] } },
  GET_PRODUCT_IN_AUTO_COMPLETE: { products: { data: [SHAMPOO] } },
  PRODUCT_CATEGORIES: { productCategories: [{ id: 'pc-1', name: '洗護' }] },
  GET_MERCHANT_PASSWORD: { merchantPassword: { reCheckoutOrder: { password: '1234', isUsing: false } } },
  reCheckoutOrder: { reCheckoutOrder: { id: 'order-1' } },
  FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers: [] } },
  FETCH_ADD_CUSTOMER: { addCustomer: { id: 'customer-new', name: '', gender: 'MALE', cellphone: '0999888777', birthday: { year: '', month: '', day: '' }, category: '' } },
  customerWallet: { customerWallet: 0 },
  GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [] },
  FETCH_CUSTOMER_DETAIL: { customer: { id: 'customer-new', name: '', cellphone: '0999888777', membershipPurchaseRecord: [], isLineBinded: false } },
  // 有顧客後付款區讀入金異動權限（登入者身分對應的權限設定）
  FETCH_PROFILE_IDENDITY: { me: { id: 'user-1', merchantIdentity: { authorityName: '店長', authorityId: 'auth-1' } } },
  GET_MERCHANT_AUTHORITIES: {
    getMerchantAuthorities: [
      {
        id: 'auth-1',
        authoritySettings: JSON.stringify([
          { pageTitle: '客戶管理', pageAuthority: [{ pageName: '入金(儲值)', authority: false }, { pageName: '入金(扣除)', authority: false }] },
        ]),
      },
    ],
  },
  ...overrides,
})

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

const setup = () =>
  renderPage(<OrderEdit match={{ params: { id: 'order-1' } }} />, { fixtures: fixtures(), route: '/order/order-1' })

const checkoutAndGetInput = async calls => {
  const checkout = await screen.findByTestId('checkout')
  await wait(() => expect(checkout).not.toBeDisabled())
  fireEvent.click(checkout)
  await wait(() => expect(callsOf(calls, 'reCheckoutOrder')).toHaveLength(1))
  return callsOf(calls, 'reCheckoutOrder')[0].variables.input.orderInput
}

describe('帳單詳細：店販「從清單選擇」', () => {
  it('清單只列可販售的商品；加入後該列帶入商品與售價，重新結帳送出這筆店販', async () => {
    const { calls } = setup()
    await screen.findByText(/帳單詳細 \(A123\)/)
    // 店販卡片沒有資料時預設收合，先展開
    fireEvent.click((await screen.findAllByTestId('merchantSell'))[0])
    fireEvent.click(screen.getAllByLabelText('從清單選擇商品')[0])
    const dialog = within(await screen.findByRole('dialog'))
    expect(dialog.getByText('洗髮精')).toBeInTheDocument()
    expect(dialog.queryByText('停售髮蠟')).toBeNull()
    fireEvent.click(dialog.getByRole('button', { name: '加入' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    // 金額彙總立即反映：店販消費 = 售價 × 1
    await wait(() => expect(screen.getAllByText('店販消費')[0].nextSibling).toHaveTextContent('1,200'))

    // 店販要有服務人員才能送出：頁首之後第一個服務人員欄位是店販列
    fireEvent.change(screen.getAllByPlaceholderText('服務人員姓名/編號')[1], { target: { value: '王' } })
    const options = await screen.findAllByTestId('employee-王小美')
    fireEvent.click(options[options.length - 1])
    const input = await checkoutAndGetInput(calls)
    expect(input.productOrders).toEqual([
      expect.objectContaining({ productId: SHAMPOO.id, price: 1200, count: 1, sellerId: DESIGNER.userId }),
    ])
  })
})

describe('帳單詳細：金額彙總與帳單來源', () => {
  it('手機底部固定列的展開鈕展開完整明細（與彙總卡同一份數字），再按收起', async () => {
    setup()
    await screen.findByText(/帳單詳細 \(A123\)/)
    const toggle = screen.getByRole('button', { name: '金額彙總明細' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const details = document.getElementById(toggle.getAttribute('aria-controls'))
    expect(within(details).getByText('服務消費').nextSibling).toHaveTextContent('800')
    expect(within(details).getByText('紅利點數折抵')).toBeInTheDocument()
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(document.getElementById('order-summary-details')).toBeNull()
  })

  it('改帳單來源後重新結帳，送出的帳單帶新來源', async () => {
    const { calls } = setup()
    await screen.findByText(/帳單詳細 \(A123\)/)
    const label = await screen.findByText('帳單來源', { selector: 'label' })
    const select = label.parentElement.querySelector('select')
    const option = within(select).getByText('網路')
    fireEvent.change(select, { target: { value: option.value } })
    const input = await checkoutAndGetInput(calls)
    expect(input.source).toBe('網路')
  })
})

describe('帳單詳細：只輸入手機就新增顧客', () => {
  it('以輸入的手機與目前店家先建立顧客，再開啟彈窗補資料', async () => {
    const { calls } = setup()
    await screen.findByText(/帳單詳細 \(A123\)/)
    // 原帳單不留客資：先取消不留客資才能輸入顧客
    fireEvent.click(await screen.findByLabelText('不留客資'))
    fireEvent.change(screen.getByPlaceholderText('顧客姓名/手機號碼/編號'), { target: { value: '0999888777' } })
    fireEvent.click(await screen.findByText('新增 "0999888777"', {}, { timeout: 3000 }))
    fireEvent.click(screen.getByLabelText('新增顧客'))
    await wait(() => expect(callsOf(calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(1))
    expect(callsOf(calls, 'FETCH_ADD_CUSTOMER')[0].variables.input).toEqual(
      expect.objectContaining({ cellphone: '0999888777', OfficialBrandMerchantId: MERCHANT_ID, gender: 'MALE' })
    )
    expect(await screen.findByText('編輯客戶資料')).toBeInTheDocument()
    // 彈窗帶入剛建立的顧客手機
    expect(screen.getByDisplayValue('0999888777')).toBeInTheDocument()
  })
})
