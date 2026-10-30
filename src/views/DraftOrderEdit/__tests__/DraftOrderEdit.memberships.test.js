// 保護「掛單詳細」的會員卡銷售：掛單帶回的會員卡（銷售人員、會員卡、售價、到期日、第三方卡券、備註）要原樣送出；
// 選會員卡帶入售價與到期日（0 天＝永久會籍），「永久會籍」取消勾選時到期日依「原購買日＋原有效天數」（掛單帶回的卡）或「帳單日期＋卡片有效天數」（新選的卡）重算，
// 到期日早於帳單日期隔天時視為錯誤、儲存被擋下並提示；改售價、備註、清除、刪除、新增、從清單選擇後送出的 membershipOrders 必須就是畫面上的內容；
// 鍵盤 Enter 依卡片是否鎖價／是否永久跳到下一個要填的欄位。到期日送錯，顧客的會籍就會提早失效或變永久。
// GraphQL 全由模擬 link 回應，不連後端、不建立或修改真實帳單。
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { addDays } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { loginAs } from '../../../__tests__/testkit.test'
import {
  setupDraft,
  pageReady,
  pick,
  clearField,
  saveDraft,
  summaryValue,
  makeOrder,
  panel,
  panelHeader,
  DESIGNER,
  HELPER,
  YEAR_CARD,
  FOREVER_CARD,
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

const BILL_DATE = new Date(2026, 9, 21, 10, 30)
const PURCHASE = new Date(2026, 8, 1, 9, 0).getTime()
const EXPIRY = new Date(2027, 8, 1, 9, 0).getTime()
// 鎖價、有期限的會員卡
const LOCKED_CARD = {
  uuid: 'card-3',
  no: 'M03',
  name: '季卡',
  sellPrice: 3000,
  effecitveDay: 90,
  isLocked: 'TRUE',
  membershipCategory: YEAR_CARD.membershipCategory,
}

const membershipOrder = (overrides = {}) => ({
  purchaseDate: PURCHASE,
  validDayCount: 365,
  expiryDate: EXPIRY,
  price: 12000,
  thirdPartyPayId: null,
  remark: '續卡',
  seller: { id: DESIGNER.userId },
  membership: { uuid: YEAR_CARD.uuid, isLocked: 'FALSE', effecitveDay: 365 },
  ...overrides,
})

const cards = () => panel('會員卡銷售')
const cardInput = index => cards().getAllByPlaceholderText('會員卡名稱/代號')[index]
const sellerInput = index => cards().getAllByPlaceholderText('服務人員姓名/編號')[index]
const field = (label, index = 0) => cards().getAllByText(label, { selector: 'label' })[index].parentElement.querySelector('input')
const foreverBox = (index = 0) => cards().getAllByLabelText('永久會籍')[index]
const enter = el => fireEvent.keyDown(el, { key: 'Enter' })
const focusOn = el => act(() => el.focus())
const expectFocused = el => wait(() => expect(document.activeElement).toBe(el))
const nearNowPlusDays = (value, days) => expect(Math.abs(value - addDays(new Date(), days).getTime())).toBeLessThan(60 * 1000)

const setup = async (options = {}) => {
  const page = setupDraft({
    FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE: { memberships: { data: [YEAR_CARD, FOREVER_CARD, LOCKED_CARD] } },
    order: makeOrder({ membershipOrders: [membershipOrder()] }),
    ...options,
  })
  await pageReady(page)
  return page
}

describe('掛單詳細：會員卡帶回與修改', () => {
  it('帶回原掛單的會員卡並原樣送出；金額彙總有會員卡銷售', async () => {
    const page = await setup()
    expect(sellerInput(0)).toHaveValue('Amy-01')
    expect(cardInput(0)).toHaveValue('年卡-365天')
    expect(field('到期日')).toHaveValue('2027/09/01')
    expect(summaryValue('會員卡銷售')).toHaveTextContent('12,000')
    const input = await saveDraft(page.calls)
    expect(input.membershipOrders).toEqual([
      {
        sellerId: DESIGNER.userId,
        membershipUUID: YEAR_CARD.uuid,
        price: 12000,
        expiryDate: EXPIRY,
        thirdPartyCouponMerchantId: null,
        remark: '續卡',
      },
    ])
  })

  it('改銷售人員、售價（非數字視為 0）與備註後送出', async () => {
    const page = await setup()
    pick(sellerInput(0), 'Lee-02')
    await wait(() => expect(sellerInput(0)).toHaveValue('Lee-02'))
    fireEvent.change(field('價格'), { target: { value: 'x' } })
    expect(field('價格')).toHaveValue('0')
    fireEvent.change(field('價格'), { target: { value: '10000' } })
    fireEvent.change(field('備註'), { target: { value: '老客優惠' } })
    await wait(() => expect(summaryValue('會員卡銷售')).toHaveTextContent('10,000'))
    const input = await saveDraft(page.calls)
    expect(input.membershipOrders).toEqual([
      expect.objectContaining({ sellerId: HELPER.userId, price: 10000, remark: '老客優惠', expiryDate: EXPIRY }),
    ])
  })

  it('勾選永久會籍：到期日清空並停用；取消勾選：到期日＝原購買日＋原有效天數', async () => {
    const page = await setup()
    fireEvent.click(foreverBox())
    await wait(() => expect(field('到期日')).toBeDisabled())
    let input = await saveDraft(page.calls)
    expect(input.membershipOrders[0].expiryDate).toBeNull()
    fireEvent.click(foreverBox())
    await wait(() => expect(field('到期日')).not.toBeDisabled())
    page.calls.length = 0
    input = await saveDraft(page.calls)
    expect(input.membershipOrders[0].expiryDate).toBe(addDays(new Date(PURCHASE), 365).getTime())
  })

  it('原有效天數未記錄（舊資料）的永久卡取消勾選：到期日＝原購買日＋卡片有效天數', async () => {
    const page = await setup({
      order: makeOrder({
        membershipOrders: [
          membershipOrder({ validDayCount: null, expiryDate: null, membership: { uuid: YEAR_CARD.uuid, isLocked: 'FALSE', effecitveDay: 400 } }),
        ],
      }),
    })
    expect(foreverBox()).toBeChecked()
    fireEvent.click(foreverBox())
    await wait(() => expect(field('到期日')).toHaveValue('2027/10/06'))
    const input = await saveDraft(page.calls)
    expect(input.membershipOrders[0].expiryDate).toBe(addDays(new Date(PURCHASE), 400).getTime())
  })

  it('從日曆選到期日後送出新到期日', async () => {
    const page = await setup()
    fireEvent.click(field('到期日'))
    const dialog = within(await screen.findByRole('dialog'))
    fireEvent.click(dialog.getByRole('gridcell', { name: '2027年9月15日' }))
    fireEvent.click(dialog.getByRole('button', { name: '確認' }))
    await wait(() => expect(field('到期日')).toHaveValue('2027/09/15'))
    const input = await saveDraft(page.calls)
    expect(new Date(input.membershipOrders[0].expiryDate)).toEqual(new Date(2027, 8, 15, 9, 0))
  })

  it('到期日早於帳單日期隔天：視為到期日有誤，儲存時提示且不送出', async () => {
    const page = await setup({ order: makeOrder({ membershipOrders: [membershipOrder({ expiryDate: new Date(2026, 9, 1).getTime() })] }) })
    const save = screen.getByTestId('savedraft')
    await wait(() => expect(save).not.toBeDisabled())
    fireEvent.click(save)
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: '會員卡到期日有誤' })))
    expect(page.calls.filter(c => c.operationName === 'reCheckoutOrder')).toHaveLength(0)
    // 可以修正後再按
    await wait(() => expect(save).not.toBeDisabled())
  })

  // 為什麼重要：終身卡（有效天數 0）沒有可帶的到期日。原本取消「永久會籍」時到期日＝購買日（掛單帶回的卡）＋0，
  // 也就是購買當天就到期。購買日早於帳單隔天時，日期欄的 onError 會把它改成無效日期而擋下；
  // 但補登較早帳單日期的掛單（帳單日期 10/21、購買日 10/25）時購買日落在可選範圍內，儲存就照樣送出「購買當天到期」的會員卡。
  // 改為到期日一律留空待櫃檯選，儲存時以 checkMembershipOrders 擋下「會員卡到期日有誤」（同重新開單，Codex review PR #265）
  it('掛單帶回的終身卡（沒存有效天數）取消「永久會籍」：到期日留空、不帶購買日，儲存提示「會員卡到期日有誤」不送出', async () => {
    const page = await setup({
      order: makeOrder({
        membershipOrders: [
          membershipOrder({
            price: 30000,
            purchaseDate: new Date(2026, 9, 25, 9, 0).getTime(),
            validDayCount: null,
            expiryDate: null,
            membership: { uuid: FOREVER_CARD.uuid, isLocked: 'TRUE', effecitveDay: 0 },
          }),
        ],
      }),
    })
    expect(foreverBox()).toBeChecked()
    fireEvent.click(foreverBox())
    await wait(() => expect(foreverBox()).not.toBeChecked())
    expect(field('到期日')).toHaveValue('')
    expect(field('到期日')).not.toBeDisabled()
    const save = screen.getByTestId('savedraft')
    await wait(() => expect(save).not.toBeDisabled())
    fireEvent.click(save)
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: '會員卡到期日有誤' })))
    expect(page.calls.filter(c => c.operationName === 'reCheckoutOrder')).toHaveLength(0)
  })

  // 為什麼重要：「扣完後業績」是櫃台判斷這張會員卡實際入多少業績的依據。原本會員卡一律按比例算，
  // 固定金額（手續費 100 元）的卡券會顯示 12000 ×（100−100）% = 0，與服務、店販（PERCENT 按比例、其他類型減去金額）不一致。
  it('固定金額的第三方卡券：扣完後業績＝售價－手續費', async () => {
    await setup({ thirdPartTicket: true })
    pick(cards().getByPlaceholderText('第三方卡券'), '定額券')
    // 12000 − 100 = 11900
    await wait(() => expect(cards().getByText('扣完後業績:11,900')).toBeInTheDocument())
  })

  it('第三方卡券：選卡券後顯示扣完手續費的業績並送出；清除後不再送出', async () => {
    const page = await setup({ thirdPartTicket: true })
    const thirdParty = cards().getByPlaceholderText('第三方卡券')
    pick(thirdParty, '街口券')
    await wait(() => expect(cards().getByText('扣完後業績:10,800')).toBeInTheDocument())
    let input = await saveDraft(page.calls)
    expect(input.membershipOrders[0].thirdPartyCouponMerchantId).toBe('tp-1')
    clearField(thirdParty)
    await wait(() => expect(cards().queryByText('扣完後業績:10,800')).toBeNull())
    page.calls.length = 0
    input = await saveDraft(page.calls)
    expect(input.membershipOrders[0].thirdPartyCouponMerchantId).toBeNull()
  })
})

describe('掛單詳細：選會員卡', () => {
  const emptyRow = async () => {
    const page = await setup({ order: makeOrder() })
    fireEvent.click(panelHeader('會員卡銷售'))
    pick(sellerInput(0), 'Amy-01')
    return page
  }

  it('一般會員卡：帶入售價、到期日＝今天＋有效天數，焦點跳到價格', async () => {
    const page = await emptyRow()
    pick(cardInput(0), '年卡 - M01')
    await wait(() => expect(field('價格')).toHaveValue('12000'))
    await expectFocused(field('價格'))
    const input = await saveDraft(page.calls)
    expect(input.membershipOrders[0]).toEqual(expect.objectContaining({ membershipUUID: YEAR_CARD.uuid, price: 12000, sellerId: DESIGNER.userId }))
    nearNowPlusDays(input.membershipOrders[0].expiryDate, 365)
  })

  it('鎖價的永久卡：價格停用、勾選永久會籍，焦點跳到永久會籍', async () => {
    const page = await emptyRow()
    pick(cardInput(0), '永久卡 - M02')
    await wait(() => expect(foreverBox()).toBeChecked())
    expect(field('價格')).toBeDisabled()
    await expectFocused(foreverBox())
    const input = await saveDraft(page.calls)
    expect(input.membershipOrders[0]).toEqual(expect.objectContaining({ membershipUUID: FOREVER_CARD.uuid, price: 30000, expiryDate: null }))
  })

  // 為什麼重要：新選的終身卡取消「永久會籍」時，原本到期日＝帳單日當天（已過期、早於可選最早日期），改為留空待櫃檯選。
  // 本頁日期欄的 onError 原本就會把帳單日當天改成無效日期而擋下，這個測試確保改寫後仍擋下（不會送出帳單日當天）
  it('新選的終身卡取消「永久會籍」：到期日留空，儲存提示「會員卡到期日有誤」不送出', async () => {
    const page = await emptyRow()
    pick(cardInput(0), '永久卡 - M02')
    await wait(() => expect(foreverBox()).toBeChecked())
    fireEvent.click(foreverBox())
    await wait(() => expect(foreverBox()).not.toBeChecked())
    expect(field('到期日')).toHaveValue('')
    const save = screen.getByTestId('savedraft')
    await wait(() => expect(save).not.toBeDisabled())
    fireEvent.click(save)
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: '會員卡到期日有誤' })))
    expect(page.calls.filter(c => c.operationName === 'reCheckoutOrder')).toHaveLength(0)
  })

  it('鎖價、有期限的卡：焦點跳到到期日；取消再勾選永久後再取消，到期日＝帳單日期＋有效天數', async () => {
    const page = await emptyRow()
    pick(cardInput(0), '季卡 - M03')
    await wait(() => expect(field('價格')).toHaveValue('3000'))
    await expectFocused(field('到期日'))
    fireEvent.click(foreverBox())
    await wait(() => expect(foreverBox()).toBeChecked())
    fireEvent.click(foreverBox())
    await wait(() => expect(foreverBox()).not.toBeChecked())
    const input = await saveDraft(page.calls)
    expect(input.membershipOrders[0].expiryDate).toBe(addDays(BILL_DATE, 90).getTime())
  })

  it('清除會員卡欄：該列不再有價格與到期日', async () => {
    await setup()
    clearField(cardInput(0))
    await wait(() => expect(cards().queryByText('到期日', { selector: 'label' })).toBeNull())
  })

  it('從清單選擇會員卡：第一列空白時帶入第一列', async () => {
    const page = await emptyRow()
    fireEvent.click(cards().getByRole('button', { name: '從清單選擇會員卡' }))
    const dialog = within(await screen.findByRole('dialog'))
    fireEvent.click(dialog.getAllByRole('button', { name: '加入' })[1])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    await wait(() => expect(foreverBox()).toBeChecked())
    const input = await saveDraft(page.calls)
    expect(input.membershipOrders).toEqual([expect.objectContaining({ membershipUUID: FOREVER_CARD.uuid, price: 30000, expiryDate: null })])
  })
})

describe('掛單詳細：會員卡列的新增、清除與刪除', () => {
  it('新增一列選卡後兩列都送出；刪除第二列後只送第一列', async () => {
    const page = await setup()
    fireEvent.click(cards().getByTestId('merchantSsell-0-add'))
    await wait(() => expect(cards().getAllByPlaceholderText('會員卡名稱/代號')).toHaveLength(2))
    expect(cards().queryByTestId('merchantSsell-0-delete')).toBeNull()
    pick(sellerInput(1), 'Lee-02')
    pick(cardInput(1), '永久卡 - M02')
    await wait(() => expect(summaryValue('會員卡銷售')).toHaveTextContent('42,000'))
    fireEvent.click(cards().getByTestId('merchantSsell-1-delete'))
    await wait(() => expect(cards().getAllByPlaceholderText('會員卡名稱/代號')).toHaveLength(1))
    const input = await saveDraft(page.calls)
    expect(input.membershipOrders.map(m => m.membershipUUID)).toEqual([YEAR_CARD.uuid])
  })

  it('只有一列時清除：整列清空，不送出會員卡', async () => {
    const page = await setup()
    fireEvent.click(cards().getByTestId('merchantSsell-0-clear'))
    await wait(() => expect(cardInput(0)).toHaveValue(''))
    const input = await saveDraft(page.calls)
    expect(input.membershipOrders).toEqual([])
  })

  it('兩列時清除第一列：第二列照送', async () => {
    const page = await setup({
      order: makeOrder({
        membershipOrders: [
          membershipOrder(),
          membershipOrder({ price: 30000, expiryDate: null, membership: { uuid: FOREVER_CARD.uuid, isLocked: 'TRUE', effecitveDay: 0 } }),
        ],
      }),
    })
    fireEvent.click(cards().getByTestId('merchantSsell-0-clear'))
    await wait(() => expect(cardInput(0)).toHaveValue(''))
    const input = await saveDraft(page.calls)
    expect(input.membershipOrders).toEqual([expect.objectContaining({ membershipUUID: FOREVER_CARD.uuid, price: 30000 })])
  })

  it('掛單沒有會員卡：預設收合；收合時顯示已填筆數與小計', async () => {
    await setup({ order: makeOrder() })
    expect(panelHeader('會員卡銷售')).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(panelHeader('會員卡銷售'))
    pick(cardInput(0), '年卡 - M01')
    await wait(() => expect(field('價格')).toHaveValue('12000'))
    fireEvent.click(panelHeader('會員卡銷售'))
    await wait(() => expect(panelHeader('會員卡銷售')).toHaveTextContent('已填 1 筆 · 12,000'))
  })
})

// 已修正（Jason 2026/10/22 fix all）：有會員卡的掛單開頁時，帶入資料自動展開區塊會觸發第 1 列「展開＋本列要聚焦」的 effect，
// 焦點落在會員卡的銷售人員欄、頁面自動往下捲。改為帶入既有資料時沒有要聚焦的列（focusRow -1）；使用者展開區塊、新增列、
// Enter 換列時才聚焦（比照打帳單）。使用者直接點本列其他欄位時不搶焦點（比照帳單詳細）
describe('掛單詳細：會員卡帶入時不自動聚焦', () => {
  it('開頁帶入會員卡：焦點不在會員卡區塊；使用者收合再展開時游標到第 1 列銷售人員', async () => {
    await setup()
    expect(panelHeader('會員卡銷售')).toHaveAttribute('aria-expanded', 'true')
    expect(sellerInput(0)).toHaveValue('Amy-01')
    expect(sellerInput(0).closest('[data-state]').contains(document.activeElement)).toBe(false)
    fireEvent.click(panelHeader('會員卡銷售'))
    await wait(() => expect(panelHeader('會員卡銷售')).toHaveAttribute('aria-expanded', 'false'))
    fireEvent.click(panelHeader('會員卡銷售'))
    await expectFocused(sellerInput(0))
  })

  it('開頁後直接點第 1 列的價格：游標留在價格', async () => {
    const page = await setup()
    focusOn(field('價格'))
    await page.settle()
    expect(document.activeElement).toBe(field('價格'))
  })
})

describe('掛單詳細：會員卡列 Enter 跳欄', () => {
  it('銷售人員 → 會員卡 → 價格 → 到期日；永久會籍 → 第三方卡券 → 備註 → 自動新增下一列', async () => {
    await setup({ thirdPartTicket: true })
    focusOn(sellerInput(0))
    enter(sellerInput(0))
    await expectFocused(cardInput(0))
    enter(cardInput(0))
    const price = field('價格')
    await expectFocused(price)
    expect([price.selectionStart, price.selectionEnd]).toEqual([0, price.value.length])
    enter(price)
    await expectFocused(field('到期日'))
    focusOn(foreverBox())
    enter(foreverBox())
    const thirdParty = cards().getByPlaceholderText('第三方卡券')
    await expectFocused(thirdParty)
    enter(thirdParty)
    await expectFocused(field('備註'))
    fireEvent.keyDown(field('備註'), { key: 'a' })
    enter(field('備註'))
    await wait(() => expect(cards().getAllByPlaceholderText('會員卡名稱/代號')).toHaveLength(2))
    await expectFocused(sellerInput(1))
  })

  it('永久卡：會員卡 Enter 跳到永久會籍；不鎖價的永久卡價格 Enter 也跳到永久會籍', async () => {
    await setup({
      order: makeOrder({
        membershipOrders: [
          membershipOrder({ expiryDate: null, membership: { uuid: FOREVER_CARD.uuid, isLocked: 'TRUE', effecitveDay: 0 } }),
          membershipOrder({ expiryDate: null }),
        ],
      }),
    })
    focusOn(cardInput(0))
    fireEvent.keyDown(cardInput(0), { key: 'a' })
    enter(cardInput(0))
    await expectFocused(foreverBox(0))
    const price = field('價格', 1)
    focusOn(price)
    enter(price)
    await expectFocused(foreverBox(1))
  })

  it('鎖價、有期限的卡：會員卡 Enter 跳到到期日', async () => {
    await setup({
      order: makeOrder({
        membershipOrders: [membershipOrder({ price: 3000, membership: { uuid: LOCKED_CARD.uuid, isLocked: 'TRUE', effecitveDay: 90 } })],
      }),
      FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE: { memberships: { data: [YEAR_CARD, FOREVER_CARD, LOCKED_CARD] } },
    })
    focusOn(cardInput(0))
    enter(cardInput(0))
    await expectFocused(field('到期日'))
  })

  it('兩列時第一列備註 Enter 只移到下一列，不新增列', async () => {
    await setup({ order: makeOrder({ membershipOrders: [membershipOrder(), membershipOrder()] }) })
    focusOn(field('備註', 0))
    enter(field('備註', 0))
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(cards().getAllByPlaceholderText('會員卡名稱/代號')).toHaveLength(2)
  })
})
