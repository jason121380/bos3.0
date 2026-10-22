// 保護「重新開單」（打帳單佇列送出失敗的帳單）：佇列裡的帳單內容要原樣帶回，「重試」要先成立帳單、成功後才刪除佇列；
// 成立失敗時保留佇列並提示，避免帳單遺失。GraphQL 全由 MockedProvider（testkit 的模擬 link）回應，不連後端、不建立真實帳單。
// 「編輯顧客資料」改姓名／生日後儲存，送出的要是新姓名與新生日（以 typeLikeBrowser 照瀏覽器方式輸入；fireEvent.change 會誤判成送出舊姓名）。
// 扣入金可用額度＝顧客目前的入金餘額，不加上佇列帳單的扣入金（佇列帳單建立失敗、尚未扣款；加上去會讓可扣金額超過實際餘額）；
// 換成另一位顧客時扣入金清空，原顧客的扣入金不帶到新顧客。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, typeLikeBrowser } from '../../../__tests__/testkit.test'
import QueueOrderEdit from '..'

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


// 佇列中保存的是送出當時的 OrderInput（JSON 字串）
const queuedInput = (overrides = {}) => ({
  no: 'A777',
  date: new Date(2026, 9, 21, 15, 0).getTime(),
  isDesignate: false,
  isReserved: false,
  payType: [],
  amountByOtherPay: 0,
  walletPay: 0,
  customerCellphone: '',
  designerId: DESIGNER.userId,
  serviceOrders: [{ serviceId: SERVICE.id, price: 800, serviceOrderHelpers: [], thirdPartyCouponMerchantId: null }],
  productOrders: [],
  ticketOrders: [],
  useTicketOrders: [],
  membershipOrders: [],
  remark: '佇列重送',
  withoutCustomerData: true,
  isPending: false,
  ...overrides,
})

const makeOrder = () => ({})
const fixtures = ({ queue = queuedInput(), order = makeOrder(), password = false, ...overrides } = {}) => ({
  GET_ORDER_INPUT_BY_QUEUE_ID: { getOrderInputByQueueId: JSON.stringify(queue) },
  FETCH_CREATE_ORDER: { createOrder2: 'A777' },
  DELETE_QUEUE: { destroyQueueById: true },
  // 服務清單（判斷第三方卡券是否鎖定），與自動完成共用同一份服務資料
  FETCH_SERVICES: {
    services: {
      totalCount: 1,
      pageOffset: 0,
      pageLimit: 50,
      data: [{ ...SERVICE, isUsing: true, helperDeductionSetting: [], serviceCategory: { id: 'cat-1', name: '剪髮' } }],
    },
  },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: false },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [DESIGNER] },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹'] },
  GET_SERIAL_NUMBER_USING: { getParameterOrderCreateSetting: { isOrderSerialNumberUsing: false } },
  GET_IS_BONUS_REWARD_WITH_LINE: { getParameterAboutSettingFunction: { isBonusRewardWithLine: false } },
  GET_IS_LBCUS_DISPLAY: { getParameterOrderCreateSetting: { isLBCusDisplay: false } },
  GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: {
    getBindedThirdPartTicketLockedSetting: { service: false, product: false, membership: false },
  },
  GET_BONUS_REWARD_RULE: {
    getParameterAboutSettingFunction: {
      bonusRewardRule: { isUsing: false, rule: { price: 100, bonus: 1, mode: 'ROUNDING' } },
    },
  },
  GET_IS_BONUS_CONVERSION: { getParameterAboutSettingFunction: { isBonusConversion: false, bonusConversionRate: 0 } },
  GET_DISBLE_PENDING_ORDER: { getParameterAboutSettingFunction: { disablePendingOrder: false } },
  GET_IS_COMBO_SETTING: { getParameterAboutSettingFunction: { isComboUsing: false } },
  // 帳單本身：頁面與各區塊分別查詢同一張帳單的不同欄位，回同一份資料
  FETCH_ORDER: { order },
  FETRCH_SERVICE_ORDER: { order },
  FETCH_PRODUCT_ORDER: { order },
  FETCH_MEMBERSHIP_ORDER: { order },
  GET_SERVICES_FOR_AUTOCOMPLETE: { services: { totalCount: 1, pageOffset: 0, pageLimit: 50, data: [SERVICE] } },
  service: { service: { helperDeductionSetting: [] } },
  GET_MERCHANT_PASSWORD: { merchantPassword: { reCheckoutOrder: { password: '1234', isUsing: password } } },
  reCheckoutOrder: { reCheckoutOrder: { id: 'order-1' } },
  UpdateOrder: { updateOrder: { id: 'order-1' } },
  // 有顧客時：入金、紅利與入金異動權限
  customerWallet: { customerWallet: 0 },
  GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [] },
  FETCH_PROFILE_IDENDITY: { me: { id: 'user-1', merchantIdentity: { authorityName: '店長', authorityId: 'auth-1' } } },
  GET_MERCHANT_AUTHORITIES: {
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
  },
  ...overrides,
})


const setup = (options = {}) =>
  renderPage(<QueueOrderEdit match={{ params: { id: 'queue-1' } }} />, {
    fixtures: fixtures(options),
    route: '/queue-order-edit/queue-1',
  })

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('重新開單：載入佇列中的帳單', () => {
  it('標題顯示帳單編號，服務人員與服務照佇列內容帶入', async () => {
    const { calls } = setup()
    expect(await screen.findByText(/重新開單 \(A777\)/)).toBeInTheDocument()
    expect(callsOf(calls, 'GET_ORDER_INPUT_BY_QUEUE_ID')[0].variables).toEqual({ queueId: 'queue-1' })
    await wait(() => expect(screen.getAllByPlaceholderText('服務人員姓名/編號')[0]).toHaveValue('Amy-01'))
    // 服務欄（此頁的服務欄沒有 placeholder，以顯示值找）
    expect(await screen.findByDisplayValue('精緻剪髮(S01)')).toBeInTheDocument()
    await wait(() => expect(screen.getAllByText('業績合計')[0].nextSibling).toHaveTextContent('800'))
  })
})

describe('重新開單：重試', () => {
  it('先成立帳單，成功後才刪除佇列並回帳單列表', async () => {
    const { calls } = setup()
    const retry = await screen.findByTestId('checkout')
    await wait(() => expect(retry).not.toBeDisabled())
    fireEvent.click(retry)
    await wait(() => expect(callsOf(calls, 'DELETE_QUEUE')).toHaveLength(1))
    const { input } = callsOf(calls, 'FETCH_CREATE_ORDER')[0].variables
    expect(input.designerId).toBe(DESIGNER.userId)
    expect(input.withoutCustomerData).toBe(true)
    expect(input.serviceOrders).toEqual([expect.objectContaining({ serviceId: SERVICE.id, price: 800 })])
    expect(callsOf(calls, 'DELETE_QUEUE')[0].variables).toEqual({ queueId: 'queue-1' })
    // 成立帳單在刪除佇列之前
    const order = calls.map(c => c.operationName)
    expect(order.indexOf('FETCH_CREATE_ORDER')).toBeLessThan(order.indexOf('DELETE_QUEUE'))
    await wait(() => expect(currentLocation()).toBe('/management/orders'))
  })

  it('佇列中是掛單：重試後回掛單列表', async () => {
    const { calls } = setup({ queue: queuedInput({ isPending: true }) })
    const retry = await screen.findByTestId('checkout')
    await wait(() => expect(retry).not.toBeDisabled())
    fireEvent.click(retry)
    await wait(() => expect(currentLocation()).toBe('/management/draft-orders'))
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')[0].variables.input.isPending).toBe(true)
  })

  it('成立帳單失敗：提示「重結失敗」且不刪除佇列（帳單不遺失）', async () => {
    const { calls } = setup({ FETCH_CREATE_ORDER: new Error('伺服器忙碌') })
    const retry = await screen.findByTestId('checkout')
    await wait(() => expect(retry).not.toBeDisabled())
    // 失敗後頁面會重新整理（jsdom 不支援導覽，這裡只確認不刪佇列與提示）
    fireEvent.click(retry)
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('重結失敗') }))
    )
    expect(callsOf(calls, 'DELETE_QUEUE')).toHaveLength(0)
    expect(currentLocation()).toBe('/queue-order-edit/queue-1')
  })

  // 帳單已成立但佇列紀錄刪不掉：原本什麼都不提示、留在本頁且「重試」可再按，再按一次就重複成立帳單（coverage wave 1，2026/10/22）
  describe('帳單已成立但未能從佇列移除', () => {
    const NOT_REMOVED = '帳單已成立（A777），但未能從訂單佇列移除。請勿再重試這筆，請到「訂單佇列」將它刪除'

    it('刪除佇列回傳 false：提示帳單已成立、請到訂單佇列刪除，回帳單列表，不會再成立一次', async () => {
      const { calls } = setup({ DELETE_QUEUE: { destroyQueueById: false } })
      const retry = await screen.findByTestId('checkout')
      await wait(() => expect(retry).not.toBeDisabled())
      fireEvent.click(retry)
      await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: NOT_REMOVED, variant: 'error' }))
      expect(currentLocation()).toBe('/management/orders')
      expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1)
    })

    it('刪除佇列失敗（API 錯誤）：同樣提示並回帳單列表', async () => {
      const { calls } = setup({ DELETE_QUEUE: new Error('伺服器忙碌') })
      const retry = await screen.findByTestId('checkout')
      await wait(() => expect(retry).not.toBeDisabled())
      fireEvent.click(retry)
      await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: NOT_REMOVED, variant: 'error' }))
      expect(currentLocation()).toBe('/management/orders')
      expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1)
    })

    it('成立帳單後、刪除佇列回應前：「重試」停用，連按不會重複成立', async () => {
      const { calls, settle } = setup()
      const retry = await screen.findByTestId('checkout')
      await wait(() => expect(retry).not.toBeDisabled())
      fireEvent.click(retry)
      await wait(() => expect(callsOf(calls, 'DELETE_QUEUE')).toHaveLength(1))
      expect(retry).toBeDisabled()
      fireEvent.click(retry)
      await settle()
      expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1)
    })
  })

  it('後端未回傳帳單編號時不刪除佇列', async () => {
    const { calls } = setup({ FETCH_CREATE_ORDER: { createOrder2: null } })
    const retry = await screen.findByTestId('checkout')
    await wait(() => expect(retry).not.toBeDisabled())
    fireEvent.click(retry)
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(callsOf(calls, 'DELETE_QUEUE')).toHaveLength(0)
  })
})

const CUSTOMER = { id: 'customer-1', no: 'C01', name: '陳小姐', cellphone: '0912345678' }

// 編輯顧客資料：改姓名、生日後按「儲存」，送出的 SET_CUSTOMER 要帶新姓名與新生日。
// 曾以 fireEvent.change 觀察到「送出舊姓名」，查證為測試工具的假象（見 testkit 的 typeLikeBrowser），真實瀏覽器正常；
// 這個測試以與瀏覽器相同的方式輸入，保護姓名確實會送出。
const CUSTOMER_DETAIL = {
  ...CUSTOMER,
  gender: 'FEMALE',
  birthday: { year: '80', month: '1', day: '2' },
  remark: '',
  source: '',
  preferDesigner: null,
  membershipPurchaseRecord: [],
  isLineBinded: false,
}
const editCustomerAndSave = async calls => {
  // 顧客資料載入後（顧客欄顯示姓名）才開彈窗，彈窗才會帶入這位顧客
  await wait(() => expect(screen.getByPlaceholderText('顧客姓名/手機號碼/編號').value).toContain('陳小姐'))
  fireEvent.click(await screen.findByRole('button', { name: '編輯顧客資料' }))
  const modal = (await screen.findByText('編輯客戶資料')).closest('.MuiModal-root')
  const nameInput = within(modal).getByText('客戶姓名').parentElement.querySelector('input[name="name"]')
  await wait(() => expect(nameInput).toHaveValue('陳小姐'))
  typeLikeBrowser(nameInput, '陳美美')
  expect(nameInput).toHaveValue('陳美美')
  typeLikeBrowser(modal.querySelector('input[name="year"]'), '81')
  fireEvent.click(within(modal).getByText('儲存', { selector: 'button' }))
  await wait(() => expect(callsOf(calls, 'SET_CUSTOMER')).toHaveLength(1))
  return callsOf(calls, 'SET_CUSTOMER')[0].variables.input
}

describe('重新開單：編輯顧客資料', () => {
  it('改姓名與生日後儲存，送出新姓名與新生日', async () => {
    const { calls } = setup({
      queue: queuedInput({ customerId: CUSTOMER.id, withoutCustomerData: false }),
      FETCH_CUSTOMER_DETAIL: { customer: CUSTOMER_DETAIL },
      SET_CUSTOMER: { updateCustomer: true },
    })
    await screen.findByText(/重新開單 \(A777\)/)
    const input = await editCustomerAndSave(calls)
    expect(input).toEqual(
      expect.objectContaining({ customerId: CUSTOMER.id, name: '陳美美', birthday: { year: '81', month: '1', day: '2' } })
    )
  })
})

// 佇列裡的帳單是「建立失敗」的帳單，重試時以 createOrder 重新成立（與打帳單相同），扣入金在成立時才扣。
// 因此可用額度只能是顧客目前的入金餘額，不能像帳單詳細那樣加回「這張帳單原本扣的入金」。
// 2026/10/22 Jason 確認：建立失敗時沒有扣入金。原本比對 order.customerId 的那段（抄自帳單詳細、從不成立）已移除；
// 若照帳單詳細加回，可用額度會變成 餘額＋佇列扣入金（實測 1000→1300），這個測試防止誤加。
describe('重新開單：扣入金可用額度', () => {
  it('可用額度是顧客目前的入金餘額，不加上佇列帳單的扣入金；佇列的扣入金照原值帶入', async () => {
    const page = setup({
      queue: queuedInput({ customerId: CUSTOMER.id, withoutCustomerData: false, walletPay: 300 }),
      FETCH_CUSTOMER_DETAIL: { customer: CUSTOMER_DETAIL },
      customerWallet: { customerWallet: 1000 },
    })
    await screen.findByText(/重新開單 \(A777\)/)
    await page.settle()
    const label = await screen.findByText(/^扣入金\(/)
    expect(label).toHaveTextContent('扣入金(1000可用)')
    expect(label.parentElement.querySelector('input')).toHaveValue(300)
  })
})
