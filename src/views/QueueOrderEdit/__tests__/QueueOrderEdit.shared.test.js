// 保護「重新開單」裡 2026/10/21 改用 views/OrderShared 共用的部分，確保合併後在這一頁仍照原本運作：
// - 會員卡「從清單選擇」（useMembershipPicker）：清單依分類篩選時以分類重新查詢、關閉時重設條件；加入後該列帶入會員卡與售價，
//   金額彙總（BillSummary）的「會員卡販賣」與「業績合計」立即反映
// - 紅利點數（bonusRules）：點數折抵超過「顧客實際要付的金額」不接受，上限內接受，重試送出的就是這個折抵
// GraphQL 全由模擬 link 回應，不連後端、不建立真實帳單。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import QueueOrderEdit from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const DESIGNER = { userId: 'designer-1', userName: '王小美', userNickName: 'Amy', userNo: '01' }
const SERVICE = { id: 'service-1', no: 'S01', name: '精緻剪髮', price: 800, isLocked: false, isNoCash: false, bindedThirdPartTicket: null, isBindedThirdPartTicketLocked: false }
const CUSTOMER = { id: 'customer-1', no: 'C01', name: '陳小姐', cellphone: '0912345678' }
const YEAR_CARD = { uuid: 'card-1', no: 'M01', name: '年卡', sellPrice: 12000, effecitveDay: 365, isLocked: false, membershipCategory: { id: 'mc-1', uuid: 'mc-1', name: '年卡類' } }

// 佇列中保存的是送出當時的 OrderInput（JSON 字串）：一個服務、有顧客
const queuedInput = {
  no: 'A777',
  date: new Date(2026, 9, 21, 15, 0).getTime(),
  isDesignate: true,
  isReserved: false,
  payType: [],
  amountByOtherPay: 0,
  walletPay: 0,
  customerId: CUSTOMER.id,
  customerCellphone: '',
  designerId: DESIGNER.userId,
  serviceOrders: [{ serviceId: SERVICE.id, price: 800, serviceOrderHelpers: [], thirdPartyCouponMerchantId: null }],
  productOrders: [],
  ticketOrders: [],
  useTicketOrders: [],
  membershipOrders: [],
  remark: '',
  withoutCustomerData: false,
  isPending: false,
  bonusDecount: 0,
  bonusDeposit: 0,
  bonusUsed: 0,
}

const fixtures = () => ({
  GET_ORDER_INPUT_BY_QUEUE_ID: { getOrderInputByQueueId: JSON.stringify(queuedInput) },
  FETCH_CREATE_ORDER: { createOrder2: 'A777' },
  DELETE_QUEUE: { destroyQueueById: true },
  FETCH_SERVICES: { services: { totalCount: 1, pageOffset: 0, pageLimit: 50, data: [{ ...SERVICE, isUsing: true, helperDeductionSetting: [] }] } },
  GET_SERVICES_FOR_AUTOCOMPLETE: { services: { totalCount: 1, pageOffset: 0, pageLimit: 50, data: [SERVICE] } },
  service: { service: { helperDeductionSetting: [] } },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [DESIGNER] },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹'] },
  GET_SERIAL_NUMBER_USING: { getParameterOrderCreateSetting: { isOrderSerialNumberUsing: false } },
  GET_IS_BONUS_REWARD_WITH_LINE: { getParameterAboutSettingFunction: { isBonusRewardWithLine: false } },
  GET_IS_LBCUS_DISPLAY: { getParameterOrderCreateSetting: { isLBCusDisplay: false } },
  GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: {
    getBindedThirdPartTicketLockedSetting: { service: false, product: false, membership: false },
  },
  // 沒有自動給點規則、不換算：點數折抵可手動輸入
  GET_BONUS_REWARD_RULE: {
    getParameterAboutSettingFunction: { bonusRewardRule: { isUsing: false, rule: { price: 100, bonus: 1, mode: 'ROUNDING' } } },
  },
  GET_IS_BONUS_CONVERSION: { getParameterAboutSettingFunction: { isBonusConversion: false, bonusConversionRate: 0 } },
  FETCH_CUSTOMER_DETAIL: { customer: { ...CUSTOMER, membershipPurchaseRecord: [], isLineBinded: false } },
  GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [{ bonus: 5000 }] },
  customerWallet: { customerWallet: 0 },
  // 會員卡選擇清單與分類
  FETCH_MEMBERSHIPS_FOR_MODAL: { memberships: { pageLimit: 50, pageOffset: 0, data: [YEAR_CARD] } },
  FETCH_MEMBERSHIPS_CATEGORY: { membershipCategories: [{ uuid: 'mc-1', name: '年卡類' }] },
  FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE: { memberships: { pageLimit: 50, pageOffset: 0, data: [YEAR_CARD] } },
})

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

const setup = () =>
  renderPage(<QueueOrderEdit match={{ params: { id: 'queue-1' } }} />, { fixtures: fixtures(), route: '/queue-order-edit/queue-1' })

const summaryValue = label => screen.getAllByText(label)[0].nextSibling

describe('重新開單：會員卡「從清單選擇」', () => {
  it('依分類重新查詢、關閉時重設條件；加入後金額彙總立即反映', async () => {
    const { calls } = setup()
    await screen.findByText(/重新開單 \(A777\)/)
    await wait(() => expect(summaryValue('業績合計')).toHaveTextContent('800'))
    // 會員卡卡片沒有資料時預設收合，先展開（會員卡與店販卡片共用同一個 data-testid，取最後一個）
    const panels = await screen.findAllByTestId('merchantSell')
    fireEvent.click(panels[panels.length - 1])
    fireEvent.click(screen.getAllByLabelText('從清單選擇會員卡')[0])
    let dialog = within(await screen.findByRole('dialog'))
    const before = callsOf(calls, 'FETCH_MEMBERSHIPS_FOR_MODAL').length
    fireEvent.click(dialog.getByRole('button', { name: '年卡類' }))
    await wait(() => expect(callsOf(calls, 'FETCH_MEMBERSHIPS_FOR_MODAL').length).toBeGreaterThan(before))
    expect(callsOf(calls, 'FETCH_MEMBERSHIPS_FOR_MODAL').pop().variables.input.categoryUUIds).toEqual(['mc-1'])
    // 關閉：條件重設（不再帶分類）
    fireEvent.click(dialog.getAllByRole('button', { name: '關閉' })[0])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    await wait(() => expect(callsOf(calls, 'FETCH_MEMBERSHIPS_FOR_MODAL').pop().variables.input.categoryUUIds).toEqual([]))

    fireEvent.click(screen.getAllByLabelText('從清單選擇會員卡')[0])
    dialog = within(await screen.findByRole('dialog'))
    fireEvent.click(dialog.getByRole('button', { name: '加入' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    await wait(() => expect(summaryValue('會員卡販賣')).toHaveTextContent('12,000'))
    expect(summaryValue('業績合計')).toHaveTextContent('12,800')
  })
})

describe('重新開單：紅利點數折抵上限', () => {
  it('折抵超過顧客要付的金額（800）不接受，上限內接受；重試送出這個折抵', async () => {
    const { calls } = setup()
    await screen.findByText(/重新開單 \(A777\)/)
    await wait(() => expect(summaryValue('業績合計')).toHaveTextContent('800'))
    const label = await screen.findByText('點數折抵金額', { selector: 'label' })
    const decount = label.parentElement.querySelector('input')
    fireEvent.change(decount, { target: { value: '900' } })
    expect(decount).toHaveValue('0')
    fireEvent.change(decount, { target: { value: '300' } })
    await wait(() => expect(decount).toHaveValue('300'))

    const retry = screen.getByTestId('checkout')
    await wait(() => expect(retry).not.toBeDisabled())
    fireEvent.click(retry)
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')[0].variables.input.bonusDecount).toBe(300)
  })
})

// 已修正（Jason 2026/10/22 fix all）：手機底部固定列原本一律讓出 56px 給底部導覽列，但重新開單的路由不顯示底部導覽列
// （layouts/Dashboard/MobileNav 的 FLOW），列下方露出頁面內容；改為貼齊畫面底部（只讓出 iPhone 安全區）
describe('重新開單：底部固定列貼齊畫面底部', () => {
  it('沒有底部導覽列：固定列不讓出 56px', async () => {
    setup()
    await screen.findByText(/重新開單 \(/)
    const bar = screen.getByRole('button', { name: '金額彙總明細' }).closest('.fixed')
    expect(bar.className).not.toMatch(/56px/)
    expect(bar.className).toMatch(/(^| )bottom-0( |$)/)
  })

  // 已修正（Jason 2026/10/22 fix all）：「重試」下方的停用原因（處理中，請稍候）會被底部固定列遮住；內容區下方留白比照掛單詳細加高（h-12 → h-16）
  it('內容區下方留白足以露出「重試」下方的停用原因（比照掛單詳細 h-16）', async () => {
    setup()
    await screen.findByText(/重新開單 \(/)
    expect(screen.getByTestId('checkout').closest('.grid').parentElement.lastElementChild).toHaveClass('h-16')
  })
})
