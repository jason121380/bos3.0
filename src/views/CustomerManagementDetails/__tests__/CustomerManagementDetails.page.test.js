// 保護「顧客詳細」的分頁與導覽：沒有指定分頁時導到基本資料；分頁清單依資料決定——有紅利紀錄或開啟紅利時才有「紅利點數紀錄」、
// 開啟會員卡／消費紀錄有會員卡消費／顧客買過會員卡時才有「會員卡列表」；分頁清單算好前不判斷 404（直接開紅利、會員卡分頁不會被導走），
// 算好後不存在的分頁導到 404；切換分頁與返回保留「從客資篩選匯出進來」（backto=customer-filter）的來源。
// GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { loginAs, callsOf, currentLocation, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { renderDetails, ORDER, CUSTOMER } from './detailsKit.test'

jest.setTimeout(20000)

const tabNames = () => within(screen.getByRole('tablist')).getAllByRole('tab').map(t => t.textContent)
const BASE_TABS = ['基本資料', '消費記錄', '卡券紀錄', '入金紀錄', '顧客追蹤', '簡訊發送紀錄', '抽獎券紀錄']

beforeEach(() => loginAs())
afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
})

describe('顧客詳細：分頁清單', () => {
  it('沒有指定分頁：導到基本資料；查詢都以網址的顧客 id', async () => {
    const utils = renderDetails({ route: '/management/customers/c1' })
    await wait(() => expect(currentLocation()).toBe('/management/customers/c1/general'))
    await utils.settle()
    expect(callsOf(utils.calls, 'FETCH_CUSTOMER_DETAIL')[0].variables).toEqual({ id: 'c1' })
    expect(callsOf(utils.calls, 'GET_CUSTOMER_ORDER_LIST')[0].variables).toEqual({ input: { customerId: 'c1', pageLimit: 50, pageOffset: 0 } })
    expect(callsOf(utils.calls, 'GET_ORDER_STATIC_DETAIL').pop().variables).toEqual({ orderIds: ['o1'] })
    expect(callsOf(utils.calls, 'GET_CUSTOMER_HAIR_INFO')[0].variables).toEqual({ customerId: 'c1' })
    expect(callsOf(utils.calls, 'GET_CUSTOMER_SMS_RECORD')[0].variables).toEqual({ input: { customerId: 'c1' } })
    expect(callsOf(utils.calls, 'GET_CUSTOMER_EVENT_TICKETS_FOR_MERCHANT')[0].variables).toEqual({ input: 'c1' })
    expect(callsOf(utils.calls, 'GET_CUSTOMER_BONUS_RECORD')[0].variables).toEqual({ customerId: 'c1' })
  })

  it('未開紅利、沒有紅利紀錄、未開會員卡、沒有會員卡消費與購買紀錄：只有基本分頁', async () => {
    const utils = renderDetails()
    await utils.settle()
    expect(tabNames()).toEqual(BASE_TABS)
    expect(screen.getByRole('heading', { name: '陳小姐' })).toBeInTheDocument()
  })

  it('有紅利紀錄（即使未開紅利）：紅利分頁排在入金紀錄前；消費紀錄有會員卡消費：有會員卡列表', async () => {
    const utils = renderDetails({
      fixtures: {
        GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [{ id: 'b1', bonus: 10, date: 1 }] },
        GET_CUSTOMER_ORDER_LIST: { getCustomerOrders: { orderList: [{ ...ORDER, membership: 3000 }], totalCount: 1, pageLimit: 50, pageOffset: 0 } },
      },
    })
    await utils.settle()
    expect(tabNames()).toEqual(['基本資料', '消費記錄', '卡券紀錄', '紅利點數紀錄', '入金紀錄', '顧客追蹤', '簡訊發送紀錄', '抽獎券紀錄', '會員卡列表'])
  })

  it('開啟紅利與會員卡：兩個分頁都有；顧客買過會員卡也會有會員卡列表', async () => {
    const utils = renderDetails({
      fixtures: { GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true }, GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true } },
    })
    await utils.settle()
    expect(tabNames()).toContain('紅利點數紀錄')
    expect(tabNames()).toContain('會員卡列表')
    cleanup()
    const bought = renderDetails({
      fixtures: { FETCH_CUSTOMER_DETAIL: { customer: { ...CUSTOMER, membershipPurchaseRecord: [{ membershipName: '金卡', purchaseDate: 1, expiryDay: null, validityDay: null, remark: null }] } } },
    })
    await bought.settle()
    expect(tabNames()).toContain('會員卡列表')
  })

  it('直接開啟紅利分頁：分頁算好前不導 404，算好後顯示紅利紀錄', async () => {
    const utils = renderDetails({
      route: '/management/customers/c1/bonus',
      fixtures: { GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true } },
      delays: { GET_CUSTOMER_BONUS_RECORD: 100 },
    })
    await utils.settle()
    expect(currentLocation()).toBe('/management/customers/c1/bonus')
    expect(screen.getByText('紅利點數餘額')).toBeInTheDocument()
  })

  it('不存在的分頁（未開紅利卻開紅利分頁）：分頁算好後導到 404', async () => {
    renderDetails({ route: '/management/customers/c1/bonus' })
    await wait(() => expect(currentLocation()).toBe('/errors/error-404'))
  })
})

describe('顧客詳細：切換分頁與返回', () => {
  it('切換分頁導到該分頁；返回鈕與麵包屑回客戶列表', async () => {
    const utils = renderDetails()
    await utils.settle()
    expect(screen.getByRole('navigation', { name: '麵包屑' })).toHaveTextContent('客戶列表')
    fireEvent.mouseDown(screen.getByRole('tab', { name: '簡訊發送紀錄' }), { button: 0 })
    await wait(() => expect(currentLocation()).toBe('/management/customers/c1/SMS'))
    fireEvent.click(screen.getByLabelText('返回客戶列表'))
    await wait(() => expect(currentLocation()).toBe('/management/customers'))
  })

  it('從客資篩選匯出進來：麵包屑顯示客資篩選匯出，切換分頁保留 backto，返回回上一頁', async () => {
    window.history.replaceState({}, '', '/management/customers/c1/general?backto=customer-filter')
    let history
    const utils = renderDetails({ route: '/management/customer-filter-export', onHistory: h => { history = h } })
    history.push('/management/customers/c1/general')
    await utils.settle()
    expect(screen.getByRole('navigation', { name: '麵包屑' })).toHaveTextContent('客資篩選匯出')
    fireEvent.mouseDown(screen.getByRole('tab', { name: '消費記錄' }), { button: 0 })
    await wait(() => expect(currentLocation()).toBe('/management/customers/c1/invoices?backto=customer-filter'))
    fireEvent.click(screen.getByLabelText('返回客資篩選匯出'))
    await wait(() => expect(currentLocation()).toBe('/management/customers/c1/general'))
    fireEvent.click(screen.getByText('客資篩選匯出'))
    await wait(() => expect(currentLocation()).toBe('/management/customer-filter-export'))
  })

  // 已知缺口（待 Jason 決定）：顧客查詢失敗（或查無此顧客回 null）時，頁面直接讀 customer.data.customer.name 拋錯，整頁進入錯誤畫面
  // （views/CustomerManagementDetails/index.js:253）。建議：查無顧客時顯示「找不到此顧客」並提供返回列表。
  it('已知缺口：顧客查詢失敗時整頁進入錯誤畫面', async () => {
    const utils = renderDetails({ fixtures: { FETCH_CUSTOMER_DETAIL: new Error('查無顧客') } })
    await utils.settle()
    expect(screen.getByText(PAGE_CRASH_TEXT)).toBeInTheDocument()
  })
})
