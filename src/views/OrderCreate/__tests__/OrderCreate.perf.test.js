// 保護打帳單效能修正 B（Jason 2026/10/31）不改變行為，並防止回到「每次整頁重畫，所有下拉都重跑篩選」：
// - 加入多個服務（含綁定第三方卡券的服務）並改價後，送出的 variables 與逐項計算相同
// - 改價（整頁重畫）時，選項與搜尋字都沒變的下拉（服務、服務人員、店販、卡券）不重跑篩選（以篩選排序用的 compareNo 次數判斷，只驗「沒有整份重排」）
// - 在某一列的服務欄打字時，只有那一個下拉重跑篩選
// GraphQL 全由模擬 link 回應，不建立真實帳單。
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import compareNo from 'utils/compareNo'
import { loginAs, callsOf } from '../../../__tests__/testkit.test'
import {
  setupPage,
  waitPageReady,
  pickEmployee,
  pickService,
  checkoutButton,
  sentOrder,
  SERVICE,
  SERVICE_LOCKED,
  SERVICE_UNSET,
} from './orderCreateKit.test'

jest.mock('utils/compareNo', () => ({ __esModule: true, default: jest.fn() }))

jest.setTimeout(30000)

beforeEach(() => {
  loginAs()
  // CRA 的 resetMocks 會在每個測試前清掉 mock 實作，放在 beforeEach 才有效
  compareNo.mockImplementation(jest.requireActual('utils/compareNo').default)
})
afterEach(cleanup)

const serviceInputs = () => screen.getAllByPlaceholderText('服務名稱/代號')
const priceInput = (row = 0) => document.querySelectorAll('input[name="price"]')[row]

const prepareThreeRows = async () => {
  const page = setupPage()
  await waitPageReady()
  await pickEmployee()
  fireEvent.click(screen.getByLabelText('不留客資'))
  await pickService(SERVICE, 0)
  fireEvent.click(screen.getByTestId('service-0-add'))
  await pickService(SERVICE_LOCKED, 1)
  fireEvent.click(screen.getByTestId('service-1-add'))
  await pickService(SERVICE_UNSET, 2)
  await page.settle()
  return page
}

describe('打帳單效能修正：行為不變', () => {
  it('加入三個服務並改價：送出的服務項目、價格與第三方卡券與逐項計算相同', async () => {
    const { calls } = await prepareThreeRows()
    fireEvent.change(priceInput(0), { target: { value: '650' } })
    await wait(() => expect(priceInput(0)).toHaveValue('650'))
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    const sent = sentOrder(calls)
    expect(sent.serviceOrders).toEqual([
      { serviceId: SERVICE.id, price: 650, serviceOrderHelpers: [], thirdPartyCouponMerchantId: null },
      { serviceId: SERVICE_LOCKED.id, price: 2000, serviceOrderHelpers: [], thirdPartyCouponMerchantId: 'tp-1' },
      { serviceId: SERVICE_UNSET.id, price: 1200, serviceOrderHelpers: [], thirdPartyCouponMerchantId: null },
    ])
    expect(sent.designerId).toBe('designer-1')
  })
})

describe('打帳單效能修正：下拉不重跑篩選', () => {
  it('改價造成整頁重畫時，服務、服務人員、店販、卡券下拉都不重新排序選項', async () => {
    await prepareThreeRows()
    compareNo.mockClear()
    fireEvent.change(priceInput(0), { target: { value: '7' } })
    await wait(() => expect(priceInput(0)).toHaveValue('7'))
    fireEvent.change(priceInput(0), { target: { value: '70' } })
    await wait(() => expect(priceInput(0)).toHaveValue('70'))
    // 改版前每次重畫，每個下拉都把整份選項重排一次（服務×3、服務人員、店販、卡券 × 每次重畫）；現在選項、搜尋字都沒變，不重排
    expect(compareNo.mock.calls.length).toBe(0)
  })

  it('在第 2 列服務欄打字時，只有那一個下拉重跑篩選（其他列的服務下拉不重排）', async () => {
    await prepareThreeRows()
    // 只重排一份服務清單（3 個服務）時 compareNo 最多約 3 次；所有服務下拉都重排會是好幾倍
    const sortOnce = (() => {
      compareNo.mockClear()
      ;[...[SERVICE, SERVICE_LOCKED, SERVICE_UNSET]].sort((a, b) => compareNo(a.no, b.no))
      return compareNo.mock.calls.length
    })()
    compareNo.mockClear()
    fireEvent.change(serviceInputs()[1], { target: { value: '頭' } })
    await screen.findByTestId(SERVICE_UNSET.no)
    expect(compareNo.mock.calls.length).toBeGreaterThan(0)
    expect(compareNo.mock.calls.length).toBeLessThanOrEqual(sortOnce * 2)
  })
})
