// 保護「掛單詳細」的服務區塊：櫃台打開掛單後改服務、價格、助理、第三方卡券，按「儲存」送出的 serviceOrders 必須就是畫面上的內容——
// 帶回原掛單的服務與助理、換服務時帶入新服務的價格與綁定卡券、清除／刪除的列不送出、新增的空白列不送出、
// 助理依服務的助理設定展開（類型-人員）、店家開「助理指定」時可勾選指定、第三方卡券顯示扣完手續費後的業績。
// 送出內容錯了就是業績、抽成或收款錯。GraphQL 全由模擬 link 回應，不連後端、不建立或修改真實帳單。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { loginAs } from '../../../__tests__/testkit.test'
import {
  setupDraft, pageReady, pick, clearField, inputOf, saveDraft, summaryValue, makeOrder, serviceOrder,
  SERVICE, SERVICE2, HELPER,
} from './draftPageKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

// 洗髮助理兩位（A、B）：掛單時已指定 A 為李助理
const HELPER_SETTING = { [SERVICE.id]: [{ type: '洗髮', nameList: ['A', 'B'], helperDeductionType: 'FIXED' }] }
const orderWithHelper = () =>
  makeOrder({
    serviceOrders: [
      serviceOrder(SERVICE, {
        helperList: [{ id: 'h-1', type: '洗髮-A', isDesignate: true, helperDeductionType: 'FIXED', helper: { id: HELPER.userId } }],
      }),
    ],
  })

const serviceInput = (index = 0) => inputOf(`service-${index}`)

describe('掛單詳細：服務帶回與修改', () => {
  it('原掛單的服務與助理帶回；改價格後儲存，送出新價格與原助理', async () => {
    const page = setupDraft({ order: orderWithHelper(), helperDeductionSetting: HELPER_SETTING })
    await pageReady(page)
    // 助理依服務設定展開成「洗髮-A」「洗髮-B」，A 帶回原本的李助理
    await wait(() => expect(screen.getByPlaceholderText('洗髮-A')).toHaveValue('Lee-02'))
    expect(screen.getByPlaceholderText('洗髮-B')).toHaveValue('')
    fireEvent.change(screen.getByTestId('service-0-price'), { target: { value: '950' } })
    expect(summaryValue('業績合計')).toHaveTextContent('950')
    const input = await saveDraft(page.calls)
    expect(input.serviceOrders).toEqual([
      expect.objectContaining({
        serviceId: SERVICE.id,
        price: 950,
        serviceOrderHelpers: [expect.objectContaining({ type: '洗髮-A', helperId: HELPER.userId })],
      }),
    ])
  })

  it('價格輸入非數字視為 0', async () => {
    const page = setupDraft()
    await pageReady(page)
    fireEvent.change(screen.getByTestId('service-0-price'), { target: { value: 'abc' } })
    expect(screen.getByTestId('service-0-price')).toHaveValue('0')
    const input = await saveDraft(page.calls)
    expect(input.serviceOrders[0].price).toBe(0)
  })

  it('選第二位助理後儲存，送出兩位助理', async () => {
    const page = setupDraft({ order: orderWithHelper(), helperDeductionSetting: HELPER_SETTING })
    await pageReady(page)
    const helperB = await screen.findByPlaceholderText('洗髮-B')
    pick(helperB, 'Lee-02')
    await wait(() => expect(helperB).toHaveValue('Lee-02'))
    const input = await saveDraft(page.calls)
    expect(input.serviceOrders[0].serviceOrderHelpers.map(h => [h.type, h.helperId])).toEqual([
      ['洗髮-A', HELPER.userId],
      ['洗髮-B', HELPER.userId],
    ])
  })

  it('店家開啟助理指定：可勾選「指定」，送出 isDesignate', async () => {
    const page = setupDraft({ order: orderWithHelper(), helperDeductionSetting: HELPER_SETTING, helperDesignation: true })
    await pageReady(page)
    await screen.findByPlaceholderText('洗髮-B')
    const checks = screen.getAllByLabelText('指定')
    // A 原本就是指定，B 尚未指定
    expect(checks[0]).toBeChecked()
    expect(checks[1]).not.toBeChecked()
    fireEvent.click(checks[1])
    pick(screen.getByPlaceholderText('洗髮-B'), 'Lee-02')
    await wait(() => expect(screen.getAllByLabelText('指定')[1]).toBeChecked())
    const input = await saveDraft(page.calls)
    expect(input.serviceOrders[0].serviceOrderHelpers.map(h => h.isDesignate)).toEqual([true, true])
  })

  it('換成另一個服務：帶入新服務的價格與綁定的第三方卡券（鎖定時卡券欄停用）', async () => {
    const page = setupDraft({ thirdPartTicket: true })
    await pageReady(page)
    pick(serviceInput(), '設計染髮(S02) - 2000')
    await wait(() => expect(serviceInput()).toHaveValue('設計染髮(S02)'))
    expect(screen.getByTestId('service-0-price')).toHaveValue('2000')
    const thirdParty = screen.getAllByPlaceholderText('第三方卡券')[0]
    await wait(() => expect(thirdParty).toHaveValue('街口券'))
    expect(thirdParty).toBeDisabled()
    // 街口券手續費 10%：扣完後業績 1,800
    expect(screen.getByText('扣完後業績:1,800')).toBeInTheDocument()
    const input = await saveDraft(page.calls)
    expect(input.serviceOrders).toEqual([
      expect.objectContaining({ serviceId: SERVICE2.id, price: 2000, thirdPartyCouponMerchantId: 'tp-1' }),
    ])
  })

  it('服務的卡券鎖定為「依店家設定」、店家設定鎖定：設定比服務晚回來時，第三方卡券欄仍停用', async () => {
    const UNSET_SERVICE = { ...SERVICE, isBindedThirdPartTicketLocked: 'UNSET' }
    const page = setupDraft(
      {
        thirdPartTicket: true,
        order: makeOrder({ serviceOrders: [serviceOrder(UNSET_SERVICE)] }),
        GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: {
          getBindedThirdPartTicketLockedSetting: { service: true, product: false, membership: false },
        },
      },
      { delays: { GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: 300 } }
    )
    await pageReady(page)
    await wait(() => expect(screen.getAllByPlaceholderText('第三方卡券')[0]).toBeDisabled())
  })

  it('第三方卡券：固定手續費顯示扣完後業績，清除卡券後不再送出卡券', async () => {
    const page = setupDraft({ thirdPartTicket: true })
    await pageReady(page)
    const thirdParty = screen.getAllByPlaceholderText('第三方卡券')[0]
    pick(thirdParty, '定額券')
    // 定額券手續費 100 元：800 - 100
    await wait(() => expect(screen.getByText('扣完後業績:700')).toBeInTheDocument())
    let input = await saveDraft(page.calls)
    expect(input.serviceOrders[0].thirdPartyCouponMerchantId).toBe('tp-2')

    clearField(thirdParty)
    await wait(() => expect(screen.queryByText('扣完後業績:700')).toBeNull())
    page.calls.length = 0
    input = await saveDraft(page.calls)
    expect(input.serviceOrders[0].thirdPartyCouponMerchantId).toBeNull()
  })
})

describe('掛單詳細：服務列的新增、清除與刪除', () => {
  it('「新增項目」多一列空白列（不送出）；選了服務的第二列可刪除，刪除後只送第一列', async () => {
    const page = setupDraft()
    await pageReady(page)
    fireEvent.click(screen.getByTestId('service-0-add'))
    await wait(() => expect(screen.getAllByPlaceholderText('服務名稱/代號')).toHaveLength(2))
    // 只有第一列沒有刪除鈕
    expect(screen.queryByTestId('service-0-delete')).toBeNull()
    pick(serviceInput(1), '設計染髮(S02) - 2000')
    await wait(() => expect(summaryValue('業績合計')).toHaveTextContent('2,800'))
    fireEvent.click(screen.getByTestId('service-1-delete'))
    await wait(() => expect(screen.getAllByPlaceholderText('服務名稱/代號')).toHaveLength(1))
    expect(summaryValue('業績合計')).toHaveTextContent('800')
    const input = await saveDraft(page.calls)
    expect(input.serviceOrders).toEqual([expect.objectContaining({ serviceId: SERVICE.id, price: 800 })])
  })

  it('清除此列：服務、價格與助理清空；沒有任何消費時儲存停用並說明尚缺', async () => {
    const page = setupDraft({ order: orderWithHelper(), helperDeductionSetting: HELPER_SETTING })
    await pageReady(page)
    await screen.findByPlaceholderText('洗髮-A')
    fireEvent.click(screen.getByTestId('service-0-clear'))
    await wait(() => expect(serviceInput()).toHaveValue(''))
    expect(screen.queryByPlaceholderText('洗髮-A')).toBeNull()
    expect(screen.getByTestId('savedraft')).toBeDisabled()
    expect(screen.getByTestId('savedraft').parentElement.getAttribute('title')).toContain('至少一項消費')
  })

  it('在服務欄打字（重新搜尋）會先清掉該列原本的服務', async () => {
    const page = setupDraft()
    await pageReady(page)
    fireEvent.change(serviceInput(), { target: { value: '染' } })
    await wait(() => expect(screen.getByTestId('savedraft')).toBeDisabled())
    expect(screen.queryByTestId('service-0-price')).toBeNull()
  })
})

describe('掛單詳細：服務區塊收合與從清單選擇', () => {
  it('收合後標題右側顯示已填筆數與小計', async () => {
    const page = setupDraft()
    await pageReady(page)
    fireEvent.click(screen.getByTestId('panelService'))
    await wait(() => expect(screen.getByTestId('panelService')).toHaveTextContent('已填 1 筆 · 800'))
  })

  it('掛單沒有服務：服務區塊預設收合、只有一列空白列', async () => {
    const page = setupDraft({ order: makeOrder({ serviceOrders: [] }) })
    await pageReady(page)
    expect(screen.getByTestId('panelService')).not.toHaveTextContent('已填')
    fireEvent.click(screen.getByTestId('panelService'))
    await wait(() => expect(serviceInput()).toHaveValue(''))
    expect(screen.getAllByPlaceholderText('服務名稱/代號')).toHaveLength(1)
  })

  it('從清單選擇服務：「加入」的服務新增在最後一列', async () => {
    const page = setupDraft()
    await pageReady(page)
    fireEvent.click(screen.getByRole('button', { name: '從清單選擇服務' }))
    const dialog = within(await screen.findByRole('dialog'))
    fireEvent.click(dialog.getAllByRole('button', { name: '加入' })[1])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    await wait(() => expect(summaryValue('業績合計')).toHaveTextContent('2,800'))
    const input = await saveDraft(page.calls)
    expect(input.serviceOrders.map(s => s.serviceId)).toEqual([SERVICE.id, SERVICE2.id])
  })

  it('從清單選擇服務：依分類篩選後按「關閉」，條件重設且不加入任何服務', async () => {
    const page = setupDraft()
    await pageReady(page)
    fireEvent.click(screen.getByRole('button', { name: '從清單選擇服務' }))
    const dialog = within(await screen.findByRole('dialog'))
    const lastFilter = () => page.calls.filter(c => c.operationName === 'FETCH_SERVICES').pop().variables.input.categoryIds
    // 依分類篩選：以分類重新查詢
    fireEvent.click(dialog.getByRole('button', { name: '剪髮' }))
    await wait(() => expect(lastFilter()).toEqual(['cat-1']))
    fireEvent.click(dialog.getAllByRole('button', { name: '關閉' })[0])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    // 關閉後條件重設、沒有加入任何服務
    await wait(() => expect(lastFilter()).toEqual([]))
    expect(summaryValue('業績合計')).toHaveTextContent('800')
  })
})
