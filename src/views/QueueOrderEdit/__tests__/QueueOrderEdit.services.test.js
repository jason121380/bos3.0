// 保護「重新開單」的項目消費（服務）區：重試前櫃檯可新增／刪除／清除服務列、改價、從清單選服務、填助理與指定、選第三方卡券，
// 金額彙總與「重試」送出的 serviceOrders 要與畫面一致——清掉或刪掉的服務不能被送出、助理要送出選定的人與是否指定、
// 第三方卡券付的服務不收現金。服務綁定且鎖定的第三方卡券不能改。
// GraphQL 全由 testkit 的模擬 link 回應，不連後端、不建立真實帳單。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { openSnackbar } from 'elements/snackbars'
import {
  setupQueue,
  loaded,
  baseQueue,
  retry,
  summaryValue,
  pickOption,
  servicesPage,
  inputOf,
  chooseNative,
  DESIGNER,
  ASSISTANT,
  SERVICE,
  SERVICE_DYE,
} from './queueKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginAs())
afterEach(cleanup)

const serviceInput = index => inputOf(screen.getByTestId(`service-${index}`))
const priceInput = index => inputOf(screen.getByTestId(`service-${index}-price`))
const HELPER_SETTING = { service: { helperDeductionSetting: [{ type: '助理', nameList: ['洗髮'], helperDeductionType: 'FIXED' }] } }

describe('重新開單：增刪與修改服務列', () => {
  it('新增一列選服務、改價：彙總跟著變，重試送出兩個服務與新價格', async () => {
    const page = setupQueue()
    await loaded(page)
    fireEvent.click(screen.getByTestId('service-0-add'))
    await pickOption(serviceInput(1), '染髮(S02) - 2000')
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('2,800'))
    // 染髮是鎖價服務：價格欄不能改
    expect(priceInput(1)).toBeDisabled()
    fireEvent.change(priceInput(0), { target: { value: '900' } })
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('2,900'))
    // 價格清空視為 0
    fireEvent.change(priceInput(0), { target: { value: '' } })
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('2,000'))
    fireEvent.change(priceInput(0), { target: { value: '950' } })
    const input = await retry(page.calls)
    expect(input.serviceOrders).toEqual([
      expect.objectContaining({ serviceId: SERVICE.id, price: 950 }),
      expect.objectContaining({ serviceId: SERVICE_DYE.id, price: 2000, thirdPartyCouponMerchantId: 'tp-1' }),
    ])
    // 送出前去掉畫面用的鎖定欄位
    expect(input.serviceOrders[1]).not.toHaveProperty('isLocked')
  })

  it('刪除第二列後只送出第一列；清除唯一的服務後「重試」停用並說明缺少消費', async () => {
    const page = setupQueue({
      queue: baseQueue({
        serviceOrders: [
          { serviceId: SERVICE.id, price: 800, serviceOrderHelpers: [], thirdPartyCouponMerchantId: null },
          { serviceId: SERVICE_DYE.id, price: 2000, serviceOrderHelpers: [], thirdPartyCouponMerchantId: null },
        ],
      }),
    })
    await loaded(page)
    expect(summaryValue('服務消費')).toHaveTextContent('2,800')
    fireEvent.click(screen.getByTestId('service-1-delete'))
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('800'))
    expect(screen.queryByTestId('service-1')).toBeNull()
    // 第一列沒有刪除鈕
    expect(screen.queryByTestId('service-0-delete')).toBeNull()

    fireEvent.click(screen.getByTestId('service-0-clear'))
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('0'))
    expect(serviceInput(0)).toHaveValue('')
    expect(screen.queryByTestId('service-0-price')).toBeNull()
    expect(screen.getByTestId('checkout')).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('尚缺：至少一項消費')
    expect(callsOf(page.calls, 'FETCH_CREATE_ORDER')).toHaveLength(0)
  })

  it('在服務欄重新打字：原本選的服務先移除，不會以舊服務送出', async () => {
    const page = setupQueue()
    await loaded(page)
    fireEvent.change(serviceInput(0), { target: { value: '染' } })
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('0'))
    expect(screen.getByTestId('checkout')).toBeDisabled()
  })
})

describe('重新開單：從清單選擇服務', () => {
  it('依分類重新查詢、清除分類；加入後新增一列並關閉清單，彙總加上該服務', async () => {
    const page = setupQueue()
    await loaded(page)
    fireEvent.click(screen.getByLabelText('從清單選擇服務'))
    let dialog = within(await screen.findByRole('dialog'))
    expect(dialog.getByText('所有服務')).toBeInTheDocument()
    expect(dialog.getByText('2 筆服務')).toBeInTheDocument()
    fireEvent.click(dialog.getByRole('button', { name: '染燙' }))
    await wait(() => expect(callsOf(page.calls, 'FETCH_SERVICES').pop().variables.input.categoryIds).toEqual(['cat-2']))
    expect(dialog.getByText('染燙類服務')).toBeInTheDocument()
    fireEvent.click(dialog.getByRole('button', { name: '清除' }))
    await wait(() => expect(callsOf(page.calls, 'FETCH_SERVICES').pop().variables.input.categoryIds).toEqual([]))
    // 關閉：查詢條件重設
    fireEvent.click(dialog.getAllByRole('button', { name: '關閉' })[0])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())

    fireEvent.click(screen.getByLabelText('從清單選擇服務'))
    dialog = within(await screen.findByRole('dialog'))
    const dyeRow = dialog.getByText('染髮').closest('tr')
    fireEvent.click(within(dyeRow).getByRole('button', { name: '加入' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('2,800'))
    expect(serviceInput(1)).toHaveValue('染髮(S02)')
    const input = await retry(page.calls)
    expect(input.serviceOrders.map(d => d.serviceId)).toEqual([SERVICE.id, SERVICE_DYE.id])
  })

  it('換頁與每頁筆數改變時以新的分頁條件查詢', async () => {
    const page = setupQueue({
      FETCH_SERVICES: v => ({
        ...servicesPage([{ ...SERVICE, serviceCategory: { id: 'cat-1', name: '剪髮' } }]),
        services: {
          totalCount: 120,
          pageOffset: v.input.pageOffset || 0,
          pageLimit: v.input.pageLimit || 50,
          data: [{ ...SERVICE, serviceCategory: { id: 'cat-1', name: '剪髮' } }],
        },
      }),
    })
    await loaded(page)
    fireEvent.click(screen.getByLabelText('從清單選擇服務'))
    const dialog = within(await screen.findByRole('dialog'))
    fireEvent.click(dialog.getByLabelText('下一頁'))
    await wait(() => expect(callsOf(page.calls, 'FETCH_SERVICES').pop().variables.input.pageOffset).toBe(1))
    chooseNative(dialog.getByLabelText('每頁筆數'), '10')
    await wait(() => expect(String(callsOf(page.calls, 'FETCH_SERVICES').pop().variables.input.pageLimit)).toBe('10'))
  })
})

describe('重新開單：服務的助理', () => {
  it('服務有兩個助理設定、佇列只帶第二個助理：帶回到對應的欄位，另一欄空白', async () => {
    const page = setupQueue({
      queue: baseQueue({
        serviceOrders: [
          {
            serviceId: SERVICE.id,
            price: 800,
            thirdPartyCouponMerchantId: null,
            serviceOrderHelpers: [{ type: '助理-吹整', helperId: ASSISTANT.userId, isDesignate: false, helperDeductionType: 'FIXED' }],
          },
        ],
      }),
      service: { service: { helperDeductionSetting: [{ type: '助理', nameList: ['洗髮', '吹整'], helperDeductionType: 'FIXED' }] } },
    })
    await loaded(page)
    await wait(() => expect(screen.getByPlaceholderText('助理-吹整')).toHaveValue('李助理-02'))
    expect(screen.getByPlaceholderText('助理-洗髮')).toHaveValue('')
  })

  it('依服務的助理設定顯示助理欄，帶回佇列中的助理；改選助理並勾指定後送出', async () => {
    const page = setupQueue({
      queue: baseQueue({
        serviceOrders: [
          {
            serviceId: SERVICE.id,
            price: 800,
            thirdPartyCouponMerchantId: null,
            serviceOrderHelpers: [{ type: '助理-洗髮', helperId: ASSISTANT.userId, isDesignate: false, helperDeductionType: 'FIXED' }],
          },
        ],
      }),
      service: HELPER_SETTING,
      GET_HELPER_DESIGNATION_DISPLAY: { getIsHelperDesignationDisplay: true },
    })
    await loaded(page)
    const helper = await screen.findByPlaceholderText('助理-洗髮')
    await wait(() => expect(helper).toHaveValue('李助理-02'))
    await pickOption(helper, 'Amy-01')
    const designate = screen.getByText('指定', { selector: 'label, label *' }).closest('label').querySelector('input')
    fireEvent.click(designate)
    const input = await retry(page.calls)
    expect(input.serviceOrders[0].serviceOrderHelpers).toEqual([
      expect.objectContaining({ type: '助理-洗髮', helperId: DESIGNER.userId, isDesignate: true }),
    ])
  })

  it('沒選助理的欄位不送出', async () => {
    const page = setupQueue({ service: HELPER_SETTING })
    await loaded(page)
    const helper = await screen.findByPlaceholderText('助理-洗髮')
    expect(helper).toHaveValue('')
    fireEvent.change(priceInput(0), { target: { value: '850' } })
    const input = await retry(page.calls)
    expect(input.serviceOrders).toEqual([expect.objectContaining({ price: 850, serviceOrderHelpers: [] })])
  })

  it('改價、新增／清除／刪除其他列時，已選的助理保留並送出', async () => {
    const page = setupQueue({
      queue: baseQueue({
        serviceOrders: [
          {
            serviceId: SERVICE.id,
            price: 800,
            thirdPartyCouponMerchantId: null,
            serviceOrderHelpers: [{ type: '助理-洗髮', helperId: ASSISTANT.userId, isDesignate: false, helperDeductionType: 'FIXED' }],
          },
          { serviceId: SERVICE_DYE.id, price: 2000, thirdPartyCouponMerchantId: null, serviceOrderHelpers: [] },
        ],
      }),
      service: HELPER_SETTING,
    })
    await loaded(page)
    fireEvent.change(priceInput(0), { target: { value: '900' } })
    fireEvent.click(screen.getByTestId('service-1-add'))
    await pickOption(serviceInput(2), '精緻剪髮(S01) - 800')
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('3,700'))
    fireEvent.click(screen.getByTestId('service-1-clear'))
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('1,700'))
    fireEvent.click(screen.getByTestId('service-2-delete'))
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('900'))
    const input = await retry(page.calls)
    expect(input.serviceOrders).toEqual([
      expect.objectContaining({ serviceId: SERVICE.id, price: 900, serviceOrderHelpers: [expect.objectContaining({ helperId: ASSISTANT.userId })] }),
    ])
  })

  it('清除有助理的服務列：助理欄一併移除，該列不送出', async () => {
    const page = setupQueue({
      queue: baseQueue({
        serviceOrders: [
          {
            serviceId: SERVICE.id,
            price: 800,
            thirdPartyCouponMerchantId: null,
            serviceOrderHelpers: [{ type: '助理-洗髮', helperId: ASSISTANT.userId, isDesignate: true, helperDeductionType: 'FIXED' }],
          },
        ],
      }),
      service: HELPER_SETTING,
    })
    await loaded(page)
    await wait(() => expect(screen.getByPlaceholderText('助理-洗髮')).toHaveValue('李助理-02'))
    fireEvent.click(screen.getByTestId('service-0-clear'))
    await wait(() => expect(screen.queryByPlaceholderText('助理-洗髮')).toBeNull())
    expect(summaryValue('服務消費')).toHaveTextContent(/^0$/)
    expect(screen.getByTestId('checkout')).toBeDisabled()
  })
})

describe('重新開單：項目消費區塊', () => {
  it('佇列帳單沒有服務：區塊收合、只有一列空白服務；收合時標題顯示已填筆數與小計', async () => {
    const page = setupQueue({
      queue: baseQueue({
        serviceOrders: [],
        productOrders: [{ sellerId: 'designer-1', productId: 'product-1', price: 300, count: 1, thirdPartyCouponMerchantId: null }],
      }),
    })
    await loaded(page)
    const header = screen.getByTestId('panelService')
    expect(header).toHaveAttribute('aria-expanded', 'false')
    expect(header).not.toHaveTextContent('已填')
    fireEvent.click(header)
    expect(header).toHaveAttribute('aria-expanded', 'true')
    expect(serviceInput(0)).toHaveValue('')
    await pickOption(serviceInput(0), '精緻剪髮(S01) - 800')
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('800'))
    fireEvent.click(header)
    expect(header).toHaveTextContent('已填 1 筆 · 800')
  })

  // 服務清單延遲要比頁面其他查詢＋畫面就緒的時間長得多：全套高負載時頁面要 1.5 秒以上才畫好，原本 1500ms 的延遲會先回來（2026/10/22）
  it('服務清單還在載入時「從清單選擇服務」不開啟，載入後才開啟', async () => {
    setupQueue({}, { delays: { FETCH_SERVICES: 4000 } })
    await screen.findByText(/重新開單 \(A777\)/)
    fireEvent.click(await screen.findByLabelText('從清單選擇服務'))
    expect(screen.queryByRole('dialog')).toBeNull()
    // 服務清單回來後再按就會開啟（輪詢到開啟為止）
    await wait(
      () => {
        fireEvent.click(screen.getByLabelText('從清單選擇服務'))
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      },
      { timeout: 15000 }
    )
  }, 30000)
})

describe('重新開單：服務的第三方卡券', () => {
  it('選固定金額的第三方卡券：顯示扣完後業績、現金應收不含該服務，送出卡券', async () => {
    const page = setupQueue({ GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true } })
    await loaded(page)
    const ticket = inputOf(screen.getByTestId('service-0-thirdParty'))
    expect(ticket).not.toBeDisabled()
    await pickOption(ticket, '禮券')
    expect(await screen.findByText('扣完後業績:700')).toBeInTheDocument()
    await wait(() => expect(summaryValue('現金應收')).toHaveTextContent(/^0$/))
    expect(summaryValue('業績合計')).toHaveTextContent('800')
    const input = await retry(page.calls)
    expect(input.serviceOrders).toEqual([expect.objectContaining({ serviceId: SERVICE.id, thirdPartyCouponMerchantId: 'tp-2' })])
  })

  it('清除第三方卡券後恢復收現金', async () => {
    const page = setupQueue({
      queue: baseQueue({ serviceOrders: [{ serviceId: SERVICE.id, price: 800, serviceOrderHelpers: [], thirdPartyCouponMerchantId: 'tp-2' }] }),
      GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true },
    })
    await loaded(page)
    expect(summaryValue('現金應收')).toHaveTextContent(/^0$/)
    const ticket = inputOf(screen.getByTestId('service-0-thirdParty'))
    fireEvent.focusIn(ticket)
    fireEvent.click(ticket)
    fireEvent.mouseDown(screen.getByLabelText('清除'))
    await wait(() => expect(summaryValue('現金應收')).toHaveTextContent('800'))
  })

  it('服務綁定的卡券鎖定方式為「依店家設定」：店家設定鎖定時不能改；未開第三方卡券也照樣顯示這張卡券', async () => {
    const page = setupQueue(
      {
        queue: baseQueue({ serviceOrders: [{ serviceId: SERVICE.id, price: 800, serviceOrderHelpers: [], thirdPartyCouponMerchantId: 'tp-1' }] }),
        FETCH_SERVICES: servicesPage([{ ...SERVICE, isBindedThirdPartTicketLocked: 'UNSET' }]),
        GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: {
          getBindedThirdPartTicketLockedSetting: { service: true, product: false, membership: false },
        },
      },
      { delays: { FETCH_SERVICES: 30 } }
    )
    await loaded(page)
    expect(inputOf(screen.getByTestId('service-0-thirdParty'))).toBeDisabled()
    expect(screen.getByText('扣完後業績:720')).toBeInTheDocument()
  })

  // 店家設定比服務清單晚到：原本只在服務列變動時套用設定，設定晚到就一直不鎖（coverage wave 1，2026/10/22）
  it('「依店家設定」且店家設定比服務資料晚到：設定回來後照樣鎖定', async () => {
    const page = setupQueue(
      {
        queue: baseQueue({ serviceOrders: [{ serviceId: SERVICE.id, price: 800, serviceOrderHelpers: [], thirdPartyCouponMerchantId: 'tp-1' }] }),
        GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true },
        FETCH_SERVICES: servicesPage([{ ...SERVICE, isBindedThirdPartTicketLocked: 'UNSET' }]),
        GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: {
          getBindedThirdPartTicketLockedSetting: { service: true, product: false, membership: false },
        },
      },
      { delays: { GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: 300 } }
    )
    await screen.findByText(/重新開單 \(A777\)/)
    await page.settle()
    expect(inputOf(screen.getByTestId('service-0-thirdParty'))).toHaveValue('團購券')
    await wait(() => expect(inputOf(screen.getByTestId('service-0-thirdParty'))).toBeDisabled())
  })
})

// 佇列帳單裡的服務已不在服務清單（停用、刪除）：原本找不到服務就拋錯、整頁顯示錯誤畫面（coverage wave 1，2026/10/22）。
// 改為保留該列（佇列帶的服務與價格）並說明，「重試」照佇列內容送出，由後端決定是否接受
describe('重新開單：佇列帳單的服務已不在服務清單', () => {
  const GONE = { serviceId: 'service-gone', price: 650, serviceOrderHelpers: [], thirdPartyCouponMerchantId: null }

  it('頁面不壞：保留該列與價格並說明，重試送出佇列中的服務', async () => {
    const page = setupQueue({
      queue: baseQueue({ serviceOrders: [{ serviceId: SERVICE.id, price: 800, serviceOrderHelpers: [], thirdPartyCouponMerchantId: null }, GONE] }),
    })
    await loaded(page)
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('此服務已不在服務清單，重試時沿用佇列帳單的服務與價格')).toBeInTheDocument()
    expect(priceInput(1)).toHaveValue('650')
    expect(summaryValue('服務消費')).toHaveTextContent('1,450')
    const input = await retry(page.calls)
    expect(input.serviceOrders).toEqual([
      expect.objectContaining({ serviceId: SERVICE.id, price: 800 }),
      expect.objectContaining({ serviceId: GONE.serviceId, price: 650 }),
    ])
  })

  it('改選清單中的服務後不再顯示說明', async () => {
    const page = setupQueue({ queue: baseQueue({ serviceOrders: [GONE] }) })
    await loaded(page)
    expect(screen.getByText('此服務已不在服務清單，重試時沿用佇列帳單的服務與價格')).toBeInTheDocument()
    await pickOption(serviceInput(0), '染髮(S02) - 2000')
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('2,000'))
    expect(screen.queryByText('此服務已不在服務清單，重試時沿用佇列帳單的服務與價格')).toBeNull()
  })

  it('服務清單查詢失敗：頁面不壞，佇列中的服務照樣帶回', async () => {
    const page = setupQueue({ FETCH_SERVICES: new Error('查詢失敗') })
    await loaded(page)
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(summaryValue('服務消費')).toHaveTextContent('800')
  })

  it('佇列資料的服務列沒有服務 id：重試時提示「請選擇服務項目」，不送出', async () => {
    const page = setupQueue({ queue: baseQueue({ serviceOrders: [{ ...GONE, serviceId: '' }] }) })
    await loaded(page)
    fireEvent.click(screen.getByTestId('checkout'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇服務項目', variant: 'error' }))
    expect(callsOf(page.calls, 'FETCH_CREATE_ORDER')).toHaveLength(0)
  })
})

// 佇列保存的 OrderInput 沒有「鎖價」欄位：原本佇列帶回的鎖價服務價格可以改（coverage wave 1，2026/10/22）。
// 改為依服務清單的 isLocked 套用到佇列帶回的服務列
describe('重新開單：佇列帶回的鎖價服務', () => {
  it('服務清單標示鎖價（TRUE／依店家設定）：價格欄停用；未鎖價的照常可改', async () => {
    const page = setupQueue({
      queue: baseQueue({
        serviceOrders: [
          { serviceId: SERVICE.id, price: 800, serviceOrderHelpers: [], thirdPartyCouponMerchantId: null },
          { serviceId: SERVICE_DYE.id, price: 2000, serviceOrderHelpers: [], thirdPartyCouponMerchantId: null },
          { serviceId: 'service-3', price: 500, serviceOrderHelpers: [], thirdPartyCouponMerchantId: null },
        ],
      }),
      FETCH_SERVICES: servicesPage([SERVICE, SERVICE_DYE, { ...SERVICE, id: 'service-3', no: 'S03', name: '洗髮', price: 500, isLocked: 'UNSET' }]),
    })
    await loaded(page)
    expect(priceInput(0)).not.toBeDisabled()
    expect(priceInput(1)).toBeDisabled()
    expect(priceInput(2)).toBeDisabled()
    const input = await retry(page.calls)
    expect(input.serviceOrders).toEqual([
      expect.objectContaining({ serviceId: SERVICE.id, price: 800 }),
      expect.objectContaining({ serviceId: SERVICE_DYE.id, price: 2000 }),
      expect.objectContaining({ serviceId: 'service-3', price: 500 }),
    ])
    expect(input.serviceOrders[1]).not.toHaveProperty('isLocked')
  })
})
