// 保護顧客詳細「消費記錄」分頁：每筆帳單的編號、日期（台灣時間）、客戶與電話、設計師、指定、各項金額（服務四捨五入、
// 第三方卡券名稱「含 …」）、其他付款方式名稱、現金應收；有活動券才顯示活動券欄、開會員卡或有會員卡消費才顯示會員卡欄、
// 開紅利或有點數折抵才顯示點數折抵欄；展開明細顯示設計師、項目（類型）、價格（卡券使用無條件捨去到小數 2 位）、數量、互助人；
// 換頁送出 pageOffset 並收合明細，改每頁筆數回到第一頁。GraphQL 全由 testkit 的模擬 link 回應。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { loginAs, callsOf } from '../../../__tests__/testkit.test'
import { renderDetails, ORDER } from './detailsKit.test'

jest.setTimeout(20000)

const ROUTE = '/management/customers/c1/invoices'
const orders = (list, extra = {}) => ({ getCustomerOrders: { orderList: list, totalCount: 120, pageLimit: 50, pageOffset: 0, ...extra } })
const lastInput = calls => callsOf(calls, 'GET_CUSTOMER_ORDER_LIST').pop().variables.input
const headers = () => screen.getAllByRole('columnheader').map(h => h.textContent)
const choose = (select, text) => {
  const option = Array.from(select.querySelectorAll('option')).find(o => o.textContent === text)
  fireEvent.change(select, { target: { value: option.value } })
}

beforeEach(() => loginAs())
afterEach(cleanup)

describe('消費記錄', () => {
  it('每筆帳單的編號、日期、客戶、設計師、金額與第三方卡券名稱', async () => {
    const utils = renderDetails({ route: ROUTE })
    await utils.settle()
    expect(screen.getByTestId('result-counter')).toHaveTextContent('共 120 筆, 1 / 3')
    const row = screen.getByTestId('order-row')
    expect(screen.getByTestId('order-0')).toHaveAttribute('href', '/order/o1')
    ;['A001', '2026/10/21', '陳小姐', '0912345678', 'Y', '800', '含 團購券, 含 禮券', '300', '含 禮券', '1,001', '200', '50', '100', 'LINE Pay', '2,150', '剪短'].forEach(
      text => expect(within(row).getByText(text)).toBeInTheDocument()
    )
    expect(row).toHaveTextContent('王小美 / /01')
    expect(headers()).not.toContain('活動券')
    expect(headers()).not.toContain('會員卡消費')
    expect(headers()).not.toContain('點數折抵金額')
  })

  it('有活動券、會員卡消費、點數折抵時顯示對應欄位；沒有第三方卡券、設計師代號、不指定時', async () => {
    const utils = renderDetails({
      route: ROUTE,
      fixtures: {
        GET_CUSTOMER_ORDER_LIST: orders([
          { ...ORDER, raffleCount: 2, membership: 3000.5, bonusDecountForReport: 30, TPTName: { service: [], product: [], membership: ['團購券'], overAll: [] }, designerNo: null, isDesignate: false },
        ]),
      },
    })
    await utils.settle()
    expect(headers()).toEqual(expect.arrayContaining(['活動券', '會員卡消費', '點數折抵金額']))
    const row = screen.getByTestId('order-row')
    ;['2', '3,001', '含 團購券', '30', 'N'].forEach(text => expect(within(row).getByText(text)).toBeInTheDocument())
    expect(within(row).queryByText(/含 禮券/)).toBeNull()
    expect(row).not.toHaveTextContent('/01')
  })

  it('開啟紅利（即使沒有點數折抵）顯示點數折抵欄', async () => {
    const utils = renderDetails({ route: ROUTE, fixtures: { GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true } } })
    await utils.settle()
    expect(headers()).toContain('點數折抵金額')
  })

  it('展開明細：設計師、項目（類型）、價格（卡券使用捨去到小數 2 位）、數量、互助人；再按收合', async () => {
    const utils = renderDetails({
      route: ROUTE,
      fixtures: {
        GET_ORDER_STATIC_DETAIL: {
          getOrderStaticDetail: [
            { orderId: 'other', orderStaticDetail: [] },
            {
              orderId: 'o1',
              orderStaticDetail: [
                { designerName: '王小美', serviceType: '服務', itemName: '精緻剪髮', count: 1, price: 800.555, helperList: [{ helperName: '李助理', helperNo: '02', helperType: '洗髮' }] },
                { designerName: 'Amy', serviceType: '卡券使用', itemName: '護髮卡', count: 2, price: 199.999, helperList: [] },
              ],
            },
          ],
        },
        GET_CUSTOMER_ORDER_LIST: orders([ORDER, { ...ORDER, id: 'o2', orderNo: 'A002' }]),
      },
    })
    await utils.settle()
    const [first, second] = screen.getAllByLabelText('展開明細')
    fireEvent.click(first)
    expect(screen.getByText('精緻剪髮(服務)')).toBeInTheDocument()
    expect(screen.getByText('800.555')).toBeInTheDocument()
    expect(screen.getByText('洗髮[李助理]')).toBeInTheDocument()
    expect(screen.getByText('護髮卡(卡券使用)')).toBeInTheDocument()
    expect(screen.getByText('199.99')).toBeInTheDocument()
    expect(screen.getByLabelText('收合明細')).toHaveAttribute('aria-expanded', 'true')
    // 沒有統計明細的帳單展開後只有標題列
    fireEvent.click(second)
    expect(screen.getAllByText('互助人')).toHaveLength(2)
    fireEvent.click(screen.getAllByLabelText('收合明細')[0])
    expect(screen.queryByText('精緻剪髮(服務)')).toBeNull()
  })

  it('換頁送出 pageOffset 並收合明細；改每頁筆數回到第一頁', async () => {
    // 後端照送出的分頁回應（頁面以回應的分頁資訊為準）
    const utils = renderDetails({
      route: ROUTE,
      fixtures: { GET_CUSTOMER_ORDER_LIST: v => orders([ORDER], { pageLimit: v.input.pageLimit, pageOffset: v.input.pageOffset }) },
    })
    await utils.settle()
    fireEvent.click(screen.getByLabelText('展開明細'))
    fireEvent.click(screen.getByLabelText('下一頁'))
    await wait(() => expect(lastInput(utils.calls)).toEqual({ customerId: 'c1', pageLimit: 50, pageOffset: 1 }))
    await utils.settle()
    expect(screen.getByTestId('result-counter')).toHaveTextContent('共 120 筆, 2 / 3')
    expect(screen.queryByText('精緻剪髮(服務)')).toBeNull()
    choose(screen.getByLabelText('每頁筆數'), '10')
    await wait(() => expect(lastInput(utils.calls)).toEqual({ customerId: 'c1', pageLimit: 10, pageOffset: 0 }))
  })

  it('統計明細為空時照樣顯示帳單；沒有消費時顯示無資料', async () => {
    const utils = renderDetails({ route: ROUTE, fixtures: { GET_ORDER_STATIC_DETAIL: { getOrderStaticDetail: [] } } })
    await utils.settle()
    fireEvent.click(screen.getByLabelText('展開明細'))
    expect(screen.queryByText('精緻剪髮(服務)')).toBeNull()
    cleanup()
    const empty = renderDetails({ route: ROUTE, fixtures: { GET_CUSTOMER_ORDER_LIST: orders([], { totalCount: 0 }) } })
    await empty.settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
  })

  it('消費紀錄載入中顯示載入佔位', async () => {
    renderDetails({ route: ROUTE, delays: { GET_CUSTOMER_ORDER_LIST: 2000 } })
    expect(await screen.findByLabelText('載入中')).toBeInTheDocument()
  })
})
