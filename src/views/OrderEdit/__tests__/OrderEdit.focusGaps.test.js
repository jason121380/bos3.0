// 保護「帳單詳細」幾個焦點細節（補齊其他測試沒走到的鍵盤／焦點路徑）：
// - 顧客欄的「編輯顧客資料」／「新增顧客」圖示鈕取得焦點時不觸發外層顧客欄的焦點處理（焦點留在按鈕上）
// - 會員卡到期日欄（ui/date-picker，頁面以 slotProps.textField.onKeyDown 處理）按 Enter 跳到「永久會籍」，不開月曆
// - 服務列：游標移到第二列（價格鎖定、沒有助理）後再點第一列的價格，游標留在第一列價格（不被拉到第二列）
// GraphQL 全由模擬 link 回應，不連後端、不改真實帳單。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { setup, pageReady, makeOrder, withCustomer, loginForTest, MEMBERSHIP, DESIGNER, SERVICE } from './orderEditKit.test'

jest.setTimeout(20000)

beforeEach(() => loginForTest())
afterEach(cleanup)

const enter = el => fireEvent.keyDown(el, { key: 'Enter', keyCode: 13 })
const focused = el => wait(() => expect(document.activeElement).toBe(el))

describe('帳單詳細：顧客欄圖示鈕', () => {
  it('「編輯顧客資料」按鈕取得焦點時焦點留在按鈕上', async () => {
    const page = setup({ order: withCustomer() })
    await pageReady(page)
    const btn = screen.getByLabelText('編輯顧客資料', { selector: 'button' })
    btn.focus()
    fireEvent.focusIn(btn)
    await page.settle()
    expect(document.activeElement).toBe(btn)
  })

  it('「新增顧客」按鈕取得焦點時焦點留在按鈕上', async () => {
    const page = setup()
    await pageReady(page)
    fireEvent.click(screen.getByLabelText('不留客資'))
    const btn = screen.getByLabelText('新增顧客', { selector: 'button' })
    btn.focus()
    fireEvent.focusIn(btn)
    await page.settle()
    expect(document.activeElement).toBe(btn)
  })
})

describe('帳單詳細：會員卡到期日鍵盤', () => {
  it('到期日欄按 Enter 跳到「永久會籍」，不開月曆', async () => {
    const order = makeOrder({
      membershipOrders: [
        {
          expiryDate: new Date(2027, 9, 21).getTime(),
          purchaseDate: new Date(2026, 9, 1).getTime(),
          validDayCount: 30,
          price: MEMBERSHIP.sellPrice,
          thirdPartyPayId: null,
          remark: '',
          seller: { id: DESIGNER.userId },
          membership: { uuid: MEMBERSHIP.uuid, isLocked: MEMBERSHIP.isLocked, effecitveDay: MEMBERSHIP.effecitveDay },
        },
      ],
    })
    const page = setup({
      order,
      FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE: { memberships: { data: [MEMBERSHIP] } },
      FETCH_MEMBERSHIPS_FOR_MODAL: { memberships: { pageLimit: 50, pageOffset: 0, data: [MEMBERSHIP] } },
      FETCH_MEMBERSHIPS_CATEGORY: { membershipCategories: [] },
    })
    await pageReady(page)
    const row = screen.getAllByPlaceholderText('會員卡名稱/代號')[0].closest('.mb-6')
    const date = within(row).getByLabelText(/^選擇日期/)
    date.focus()
    enter(date)
    await focused(within(row).getByLabelText('永久會籍'))
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })
})

describe('帳單詳細：服務列焦點', () => {
  // 價格鎖定、卡券不鎖、沒有助理
  const LOCKED_NO_HELPER = { ...SERVICE, id: 'service-6', no: 'S06', name: '染髮', price: 2000, isLocked: 'TRUE' }
  const row = service => ({
    id: `so-${service.id}`,
    name: service.name,
    price: service.price,
    thirdPartyPayName: null,
    thirdPartyPayId: null,
    service: { id: service.id, name: service.name, no: service.no, isLocked: service.isLocked, isNoCash: false, isBindedThirdPartTicketLocked: 'FALSE' },
    helperList: [],
  })

  it('游標到第二列（價格鎖定、沒有助理）後點第一列價格：游標留在第一列價格', async () => {
    const page = setup({
      order: makeOrder({ serviceOrders: [row(SERVICE), row(LOCKED_NO_HELPER)] }),
      service: { service: { helperDeductionSetting: [] } },
      GET_SERVICES_FOR_AUTOCOMPLETE: { services: { totalCount: 2, pageOffset: 0, pageLimit: 50, data: [SERVICE, LOCKED_NO_HELPER] } },
      GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true },
    })
    await pageReady(page)
    const panel = document.getElementById('panel-content')
    const rowEl = i => within(panel).getAllByPlaceholderText('服務名稱/代號')[i].closest('.mb-6')
    const thirdPartyOf = i => within(rowEl(i)).getByPlaceholderText('第三方卡券')
    const priceOf = i => rowEl(i).querySelector('input[name="price"]')
    // 第一列：價格 → 第三方卡券 → 第二列服務
    enter(priceOf(0))
    await focused(thirdPartyOf(0))
    enter(thirdPartyOf(0))
    await focused(within(rowEl(1)).getByPlaceholderText('服務名稱/代號'))
    fireEvent.focus(priceOf(0))
    fireEvent.focusIn(priceOf(0))
    await page.settle()
    expect(document.activeElement).toBe(priceOf(0))
  })
})
