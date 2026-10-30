// 保護「掛單詳細」服務列的鍵盤輸入：櫃台以鍵盤連續打單，每按一次 Enter 焦點要跳到「下一個要填的欄位」——
// 服務 → 價格（價格鎖定時跳過）→ 各助理（店家開「助理指定」時每位助理後接「指定」勾選框）→ 第三方卡券（店家有開、且卡券沒被服務鎖定時）→ 下一列服務，
// 最後一列再按 Enter 自動新增一列。跳錯欄或跳不動，櫃台就得改用滑鼠、或把價格打進助理欄。
// 另保護：刪除／清除／改某一列時其他列的助理不受影響；服務的卡券鎖定設定「依店家設定（UNSET）」時依店家設定停用卡券欄；
// 「從清單選擇」換頁會以新頁碼查詢。GraphQL 全由模擬 link 回應，不連後端、不建立或修改真實帳單。
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { loginAs } from '../../../__tests__/testkit.test'
import { setupDraft, pageReady, pick, saveDraft, makeOrder, serviceOrder, SERVICE, SERVICE2, HELPER } from './draftPageKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

// 價格鎖定的服務（不能改價）
const LOCKED = { ...SERVICE, id: 'service-locked', no: 'S09', name: '固定價燙髮', price: 3000, isLocked: 'TRUE' }
const TWO_HELPERS = { type: '洗髮', nameList: ['A', 'B'], helperDeductionType: 'FIXED' }
const helperSetting = (...ids) => Object.fromEntries(ids.map(id => [id, [TWO_HELPERS]]))

const services = () => screen.getAllByPlaceholderText('服務名稱/代號')
const enter = el => fireEvent.keyDown(el, { key: 'Enter' })
// 焦點移到 el（與點進欄位相同：觸發欄位的 onFocus）
const focusOn = el => act(() => el.focus())
const expectFocused = el => wait(() => expect(document.activeElement).toBe(el))

const setup = async (options, delays) => {
  const page = setupDraft(
    {
      GET_SERVICES_FOR_AUTOCOMPLETE: { services: { totalCount: 3, pageOffset: 0, pageLimit: 50, data: [SERVICE, SERVICE2, LOCKED] } },
      ...options,
    },
    { delays }
  )
  await pageReady(page)
  return page
}

describe('服務列 Enter 跳欄：一般價格的服務', () => {
  it('服務 → 價格 → 助理A → 指定 → 助理B → 指定 → 第三方卡券 → 自動新增下一列並跳到服務', async () => {
    await setup({ helperDesignation: true, thirdPartTicket: true, helperDeductionSetting: helperSetting(SERVICE.id) })
    const helperA = await screen.findByPlaceholderText('洗髮-A')
    const helperB = screen.getByPlaceholderText('洗髮-B')
    const [designateA, designateB] = screen.getAllByLabelText('指定')
    const thirdParty = screen.getByPlaceholderText('第三方卡券')

    focusOn(services()[0])
    enter(services()[0])
    const price = screen.getByTestId('service-0-price')
    await expectFocused(price)
    // 進價格欄時整欄選取，直接打數字即可覆蓋
    expect([price.selectionStart, price.selectionEnd]).toEqual([0, price.value.length])
    enter(price)
    await expectFocused(helperA)
    enter(helperA)
    await expectFocused(designateA)
    enter(designateA)
    await expectFocused(helperB)
    enter(helperB)
    await expectFocused(designateB)
    enter(designateB)
    await expectFocused(thirdParty)
    enter(thirdParty)
    await wait(() => expect(services()).toHaveLength(2))
    await expectFocused(services()[1])
  })

  it('未開助理指定：助理A → 助理B → 第三方卡券；非最後一列的卡券 Enter 跳到下一列服務', async () => {
    const page = await setup({
      thirdPartTicket: true,
      helperDeductionSetting: helperSetting(SERVICE.id),
      order: makeOrder({ serviceOrders: [serviceOrder(SERVICE), serviceOrder(SERVICE2, { id: 'so-2' })] }),
    })
    const helperA = (await screen.findAllByPlaceholderText('洗髮-A'))[0]
    const helperB = screen.getAllByPlaceholderText('洗髮-B')[0]
    focusOn(helperA)
    enter(helperA)
    await expectFocused(helperB)
    enter(helperB)
    const thirdParty = screen.getAllByPlaceholderText('第三方卡券')[0]
    await expectFocused(thirdParty)
    enter(thirdParty)
    await expectFocused(services()[1])
    // 沒有多出列
    expect(services()).toHaveLength(2)
  })

  it('沒開第三方卡券：最後一位助理 Enter、或沒有助理時價格 Enter，都跳到下一列服務', async () => {
    await setup({ helperDeductionSetting: helperSetting(SERVICE.id) })
    const helperB = await screen.findByPlaceholderText('洗髮-B')
    focusOn(helperB)
    enter(helperB)
    await wait(() => expect(services()).toHaveLength(2))
    await expectFocused(services()[1])
    // 第二列選沒有助理的服務：價格 Enter 直接跳到第三列
    pick(services()[1], '設計染髮(S02) - 2000')
    const price = await screen.findByTestId('service-1-price')
    focusOn(price)
    enter(price)
    await wait(() => expect(services()).toHaveLength(3))
    await expectFocused(services()[2])
  })

  it('開了助理指定、沒開第三方卡券：最後一位的「指定」Enter 跳到下一列服務；沒有助理時價格 Enter 也跳下一列', async () => {
    await setup({ helperDesignation: true, helperDeductionSetting: helperSetting(SERVICE.id) })
    await screen.findByPlaceholderText('洗髮-B')
    const designateB = screen.getAllByLabelText('指定')[1]
    focusOn(designateB)
    // 其他按鍵（例如 Tab 之外的字母）不跳欄
    fireEvent.keyDown(designateB, { key: 'a' })
    expect(services()).toHaveLength(1)
    enter(designateB)
    await wait(() => expect(services()).toHaveLength(2))
    await expectFocused(services()[1])
    pick(services()[1], '設計染髮(S02) - 2000')
    const price = await screen.findByTestId('service-1-price')
    focusOn(price)
    enter(price)
    await wait(() => expect(services()).toHaveLength(3))
  })

  it('開了助理指定與第三方卡券、服務沒有助理：價格 Enter 跳到第三方卡券', async () => {
    await setup({ helperDesignation: true, thirdPartTicket: true })
    const price = screen.getByTestId('service-0-price')
    focusOn(price)
    // 其他按鍵不跳欄
    fireEvent.keyDown(price, { key: 'a' })
    expect(document.activeElement).toBe(price)
    enter(price)
    await expectFocused(screen.getByPlaceholderText('第三方卡券'))
  })

  it('沒開助理指定、有開第三方卡券、服務沒有助理：價格 Enter 跳到第三方卡券', async () => {
    await setup({ thirdPartTicket: true })
    const price = screen.getByTestId('service-0-price')
    focusOn(price)
    enter(price)
    await expectFocused(screen.getByPlaceholderText('第三方卡券'))
  })

  it('空白列按 Enter 不跳欄', async () => {
    await setup({ order: makeOrder({ serviceOrders: [] }) })
    fireEvent.click(screen.getByTestId('panelService'))
    focusOn(services()[0])
    enter(services()[0])
    expect(document.activeElement).toBe(services()[0])
    expect(services()).toHaveLength(1)
  })
})

describe('服務列 Enter 跳欄：卡券被服務鎖定（ticketDisabled）', () => {
  it('卡券欄停用時跳過：價格、最後一位助理、最後一位「指定」的 Enter 都直接跳下一列', async () => {
    await setup({
      helperDesignation: true,
      thirdPartTicket: true,
      order: makeOrder({ serviceOrders: [serviceOrder(SERVICE2, { thirdPartyPayId: 'tp-1' })] }),
    })
    const thirdParty = screen.getByPlaceholderText('第三方卡券')
    await wait(() => expect(thirdParty).toBeDisabled())
    const price = screen.getByTestId('service-0-price')
    focusOn(price)
    enter(price)
    await wait(() => expect(services()).toHaveLength(2))
    await expectFocused(services()[1])
  })

  it('有助理且卡券鎖定：最後一位助理 Enter 跳下一列；最後一位「指定」Enter 跳下一列', async () => {
    await setup({
      thirdPartTicket: true,
      helperDeductionSetting: helperSetting(SERVICE2.id),
      order: makeOrder({ serviceOrders: [serviceOrder(SERVICE2, { thirdPartyPayId: 'tp-1' })] }),
    })
    const helperB = await screen.findByPlaceholderText('洗髮-B')
    focusOn(helperB)
    enter(helperB)
    await wait(() => expect(services()).toHaveLength(2))
    await expectFocused(services()[1])
  })

  it('開助理指定且卡券鎖定：最後一位「指定」Enter 跳下一列', async () => {
    await setup({
      helperDesignation: true,
      thirdPartTicket: true,
      helperDeductionSetting: helperSetting(SERVICE2.id),
      order: makeOrder({ serviceOrders: [serviceOrder(SERVICE2, { thirdPartyPayId: 'tp-1' })] }),
    })
    await screen.findByPlaceholderText('洗髮-B')
    const designateB = screen.getAllByLabelText('指定')[1]
    focusOn(designateB)
    enter(designateB)
    await wait(() => expect(services()).toHaveLength(2))
    await expectFocused(services()[1])
  })

  it('沒開第三方卡券，但服務鎖定了綁定的卡券：仍顯示（停用的）卡券欄與扣完後業績', async () => {
    await setup({ order: makeOrder({ serviceOrders: [serviceOrder(SERVICE2, { thirdPartyPayId: 'tp-1' })] }) })
    const thirdParty = screen.getByPlaceholderText('第三方卡券')
    await wait(() => expect(thirdParty).toHaveValue('街口券'))
    expect(thirdParty).toBeDisabled()
    expect(screen.getByText('扣完後業績:1,800')).toBeInTheDocument()
  })

  // 註：店家設定若比服務列晚到，這個鎖定目前不會套用（已回報為 bug，見交接報告），這裡只測「設定先到」
  it('服務的卡券鎖定為「依店家設定」：店家設定鎖定時卡券欄停用，未鎖定時可選', async () => {
    const UNSET = { ...SERVICE, isBindedThirdPartTicketLocked: 'UNSET' }
    const lockedSetting = service => ({
      getBindedThirdPartTicketLockedSetting: { service, product: false, membership: false },
    })
    await setup(
      {
        thirdPartTicket: true,
        order: makeOrder({ serviceOrders: [serviceOrder(UNSET)] }),
        GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: lockedSetting(true),
      },
      { FETRCH_SERVICE_ORDER: 50 }
    )
    await wait(() => expect(screen.getByPlaceholderText('第三方卡券')).toBeDisabled())
    cleanup()
    await setup(
      {
        thirdPartTicket: true,
        order: makeOrder({ serviceOrders: [serviceOrder(UNSET)] }),
        GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: lockedSetting(false),
      },
      { FETRCH_SERVICE_ORDER: 50 }
    )
    expect(screen.getByPlaceholderText('第三方卡券')).not.toBeDisabled()
  })
})

describe('服務列 Enter 跳欄：價格鎖定的服務', () => {
  it('有助理：服務 Enter 跳過價格直接到第一位助理', async () => {
    await setup({ helperDeductionSetting: helperSetting(LOCKED.id), order: makeOrder({ serviceOrders: [serviceOrder(LOCKED)] }) })
    const helperA = await screen.findByPlaceholderText('洗髮-A')
    expect(screen.getByTestId('service-0-price')).toBeDisabled()
    focusOn(services()[0])
    enter(services()[0])
    await expectFocused(helperA)
  })

  it('沒有助理、有開第三方卡券：服務 Enter 跳到第三方卡券', async () => {
    await setup({ thirdPartTicket: true, order: makeOrder({ serviceOrders: [serviceOrder(LOCKED)] }) })
    focusOn(services()[0])
    enter(services()[0])
    await expectFocused(screen.getByPlaceholderText('第三方卡券'))
  })

  it('沒有助理、沒開第三方卡券：服務 Enter 跳到下一列（自動新增）', async () => {
    await setup({ order: makeOrder({ serviceOrders: [serviceOrder(LOCKED)] }) })
    focusOn(services()[0])
    enter(services()[0])
    await wait(() => expect(services()).toHaveLength(2))
    await expectFocused(services()[1])
  })

  it('在價格欄時刪除該列：下一列（價格鎖定）遞補後焦點跳到它的第三方卡券，且原有內容不變', async () => {
    const page = await setup({
      thirdPartTicket: true,
      order: makeOrder({ serviceOrders: [serviceOrder(SERVICE), serviceOrder(SERVICE, { id: 'so-2' }), serviceOrder(LOCKED)] }),
    })
    const price1 = screen.getByTestId('service-1-price')
    focusOn(price1)
    fireEvent.click(screen.getByTestId('service-1-delete'))
    await wait(() => expect(services()).toHaveLength(2))
    await expectFocused(screen.getAllByPlaceholderText('第三方卡券')[1])
    const input = await saveDraft(page.calls)
    expect(input.serviceOrders.map(s => [s.serviceId, s.price])).toEqual([
      [SERVICE.id, 800],
      [LOCKED.id, 3000],
    ])
  })

  it('在價格欄時刪除該列：遞補的下一列（價格鎖定、有助理）助理照舊保留', async () => {
    const page = await setup({
      helperDeductionSetting: helperSetting(LOCKED.id),
      order: makeOrder({
        serviceOrders: [
          serviceOrder(SERVICE),
          serviceOrder(SERVICE, { id: 'so-2' }),
          serviceOrder(LOCKED, {
            helperList: [{ id: 'h', type: '洗髮-A', isDesignate: false, helperDeductionType: 'FIXED', helper: { id: HELPER.userId } }],
          }),
        ],
      }),
    })
    await wait(() => expect(screen.getByPlaceholderText('洗髮-A')).toHaveValue('Lee-02'))
    focusOn(screen.getByTestId('service-1-price'))
    fireEvent.click(screen.getByTestId('service-1-delete'))
    await wait(() => expect(services()).toHaveLength(2))
    await wait(() => expect(screen.getByPlaceholderText('洗髮-A')).toHaveValue('Lee-02'))
    const input = await saveDraft(page.calls)
    expect(input.serviceOrders[1]).toEqual(
      expect.objectContaining({ serviceId: LOCKED.id, serviceOrderHelpers: [expect.objectContaining({ helperId: HELPER.userId })] })
    )
  })
})

describe('服務列：改動某一列時其他列的助理不受影響', () => {
  const twoRowsWithHelper = () =>
    makeOrder({
      serviceOrders: [
        serviceOrder(SERVICE, {
          helperList: [{ id: 'h', type: '洗髮-A', isDesignate: false, helperDeductionType: 'FIXED', helper: { id: HELPER.userId } }],
        }),
        serviceOrder(SERVICE, { id: 'so-2' }),
      ],
    })
  const firstRowHelpers = input => input.serviceOrders[0].serviceOrderHelpers.map(h => h.helperId)

  it('清除第二列：第一列的助理照送', async () => {
    const page = await setup({ helperDeductionSetting: helperSetting(SERVICE.id), order: twoRowsWithHelper() })
    await wait(() => expect(screen.getAllByPlaceholderText('洗髮-A')[0]).toHaveValue('Lee-02'))
    fireEvent.click(screen.getByTestId('service-1-clear'))
    await wait(() => expect(services()[1]).toHaveValue(''))
    const input = await saveDraft(page.calls)
    expect(input.serviceOrders).toHaveLength(1)
    expect(firstRowHelpers(input)).toEqual([HELPER.userId])
  })

  it('刪除第二列：第一列的助理照送', async () => {
    const page = await setup({ helperDeductionSetting: helperSetting(SERVICE.id), order: twoRowsWithHelper() })
    await wait(() => expect(screen.getAllByPlaceholderText('洗髮-A')[0]).toHaveValue('Lee-02'))
    fireEvent.click(screen.getByTestId('service-1-delete'))
    await wait(() => expect(services()).toHaveLength(1))
    const input = await saveDraft(page.calls)
    expect(firstRowHelpers(input)).toEqual([HELPER.userId])
  })

  it('第二列換服務：第一列的助理照送', async () => {
    const page = await setup({ helperDeductionSetting: helperSetting(SERVICE.id), order: twoRowsWithHelper() })
    await wait(() => expect(screen.getAllByPlaceholderText('洗髮-A')[0]).toHaveValue('Lee-02'))
    pick(services()[1], '設計染髮(S02) - 2000')
    await wait(() => expect(services()[1]).toHaveValue('設計染髮(S02)'))
    const input = await saveDraft(page.calls)
    expect(input.serviceOrders.map(s => s.serviceId)).toEqual([SERVICE.id, SERVICE2.id])
    expect(firstRowHelpers(input)).toEqual([HELPER.userId])
  })
})

describe('從清單選擇服務：換頁與載入中', () => {
  it('服務清單還在載入時按「從清單選擇服務」不開窗', async () => {
    // 服務清單遲遲不回來（測試結束前都不回）
    setupDraft({}, { delays: { FETCH_SERVICES: 60000 } })
    await screen.findByText(/掛單詳細 \(A123\)/)
    fireEvent.click(screen.getByRole('button', { name: '從清單選擇服務' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('新增列選沒有綁定卡券的服務：送出時卡券為空', async () => {
    const page = await setup({ thirdPartTicket: true })
    fireEvent.click(screen.getByTestId('service-0-add'))
    await wait(() => expect(services()).toHaveLength(2))
    pick(services()[1], '精緻剪髮(S01) - 800')
    await wait(() => expect(services()[1]).toHaveValue('精緻剪髮(S01)'))
    const input = await saveDraft(page.calls)
    expect(input.serviceOrders[1]).toEqual(expect.objectContaining({ serviceId: SERVICE.id, price: 800, thirdPartyCouponMerchantId: null }))
  })

  it('服務超過一頁時按「下一頁」，以下一頁的頁碼重新查詢', async () => {
    const page = await setup({
      FETCH_SERVICES: { services: { totalCount: 120, pageOffset: 0, pageLimit: 50, data: [SERVICE, SERVICE2] } },
    })
    fireEvent.click(screen.getByRole('button', { name: '從清單選擇服務' }))
    const dialog = within(await screen.findByRole('dialog'))
    fireEvent.click(dialog.getByRole('button', { name: '下一頁' }))
    await wait(() => expect(page.calls.filter(c => c.operationName === 'FETCH_SERVICES').pop().variables.input.pageOffset).toBe(1))
  })
})
