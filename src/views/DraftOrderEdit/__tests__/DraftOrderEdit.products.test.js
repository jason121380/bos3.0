// 保護「掛單詳細」的店販區塊：掛單帶回的店販（銷售人員、商品、單價、數量、第三方卡券）要原樣顯示，
// 改單價／數量／銷售人員、換商品、清除、刪除、新增後按「儲存」，送出的 productOrders 必須就是畫面上的內容（數量 0 的列不送出），
// 金額彙總的「店販消費」與業績合計跟著變；鍵盤 Enter 依序跳欄（銷售人員 → 商品 → 單價 → 數量 → 第三方卡券 → 下一列）。
// 送錯就是店販業績、庫存扣量或收款錯。GraphQL 全由模擬 link 回應，不連後端、不建立或修改真實帳單。
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { loginAs } from '../../../__tests__/testkit.test'
import {
  setupDraft, pageReady, pick, clearField, saveDraft, summaryValue, makeOrder, panel, panelHeader,
  DESIGNER, HELPER, PRODUCT, PRODUCT2,
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

const productOrder = (product = PRODUCT, overrides = {}) => ({
  id: `po-${product.id}`,
  name: product.name,
  count: 2,
  price: product.sellPrice,
  thirdPartyPayId: null,
  seller: { id: DESIGNER.userId, lastName: '王', firstName: '小美', designerNo: '01' },
  product: { id: product.id, no: product.no, name: product.name, isLocked: product.isLocked },
  ...overrides,
})

const products = () => panel('店販銷售')
const rowInput = (index, field) => {
  const el = products().getByTestId(`merchantSsell-${index}-${field}`)
  return el.tagName === 'INPUT' ? el : el.querySelector('input')
}
const enter = el => fireEvent.keyDown(el, { key: 'Enter' })
const focusOn = el => act(() => el.focus())
const expectFocused = el => wait(() => expect(document.activeElement).toBe(el))

const setup = async (options = {}) => {
  const page = setupDraft({ order: makeOrder({ productOrders: [productOrder()] }), ...options })
  await pageReady(page)
  return page
}

describe('掛單詳細：店販帶回與修改', () => {
  it('帶回原掛單的店販；改單價與數量後儲存，送出新單價與數量，金額彙總跟著變', async () => {
    const page = await setup()
    expect(rowInput(0, 'employee')).toHaveValue('Amy-01')
    expect(rowInput(0, 'product')).toHaveValue('洗髮精')
    expect(summaryValue('店販消費')).toHaveTextContent('2,400')
    fireEvent.change(rowInput(0, 'price'), { target: { value: '1000' } })
    fireEvent.change(rowInput(0, 'count'), { target: { value: '3' } })
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent('3,000'))
    expect(summaryValue('業績合計')).toHaveTextContent('3,800')
    const input = await saveDraft(page.calls)
    expect(input.productOrders).toEqual([
      expect.objectContaining({ sellerId: DESIGNER.userId, productId: PRODUCT.id, price: 1000, count: 3 }),
    ])
  })

  it('單價、數量輸入非數字視為 0；數量 0 的列不送出', async () => {
    const page = await setup()
    fireEvent.change(rowInput(0, 'price'), { target: { value: 'x' } })
    expect(rowInput(0, 'price')).toHaveValue('0')
    fireEvent.change(rowInput(0, 'count'), { target: { value: 'x' } })
    expect(rowInput(0, 'count')).toHaveValue('0')
    const input = await saveDraft(page.calls)
    expect(input.productOrders).toEqual([])
  })

  it('換銷售人員與商品：換商品帶入新商品的售價、數量重設為 1', async () => {
    const page = await setup()
    pick(rowInput(0, 'employee'), 'Lee-02')
    await wait(() => expect(rowInput(0, 'employee')).toHaveValue('Lee-02'))
    pick(rowInput(0, 'product'), 'P02 - 護髮油 - 500')
    await wait(() => expect(rowInput(0, 'price')).toHaveValue('500'))
    expect(rowInput(0, 'count')).toHaveValue('1')
    const input = await saveDraft(page.calls)
    expect(input.productOrders).toEqual([
      expect.objectContaining({ sellerId: HELPER.userId, productId: PRODUCT2.id, price: 500, count: 1 }),
    ])
  })

  it('單價鎖定的商品不能改單價', async () => {
    await setup({ order: makeOrder({ productOrders: [productOrder({ ...PRODUCT, isLocked: 'TRUE' })] }) })
    expect(rowInput(0, 'price')).toBeDisabled()
  })

  it('第三方卡券：選卡券後顯示扣完手續費的業績並送出；清除卡券後不再送出', async () => {
    const page = await setup({ thirdPartTicket: true })
    const thirdParty = products().getByPlaceholderText('第三方卡券')
    pick(thirdParty, '街口券')
    // 單價 1200、手續費 10%：扣完後業績 1080（以單價計）
    await wait(() => expect(products().getByText('扣完後業績:1080')).toBeInTheDocument())
    let input = await saveDraft(page.calls)
    expect(input.productOrders[0].thirdPartyCouponMerchantId).toBe('tp-1')
    clearField(thirdParty)
    await wait(() => expect(products().queryByText('扣完後業績:1080')).toBeNull())
    page.calls.length = 0
    input = await saveDraft(page.calls)
    expect(input.productOrders[0].thirdPartyCouponMerchantId).toBeNull()
  })

  // 為什麼重要：「扣完後業績」是櫃台判斷這筆店販實際入多少業績的依據。原本店販一律按比例算，
  // 固定金額（手續費 100 元）的卡券會顯示 售價 ×（100−100）% = 0，與打帳單、服務（PERCENT 按比例、其他類型減去金額）不一致。
  it('掛單帶回固定金額的第三方卡券：扣完後業績＝單價－手續費', async () => {
    await setup({ thirdPartTicket: true, order: makeOrder({ productOrders: [productOrder(PRODUCT, { thirdPartyPayId: 'tp-2' })] }) })
    // 單價 1200 − 定額券 100 = 1100（以單價計）
    await wait(() => expect(products().getByText('扣完後業績:1100')).toBeInTheDocument())
  })

  it('清除商品欄：該列不再有單價與數量欄', async () => {
    await setup()
    clearField(rowInput(0, 'product'))
    await wait(() => expect(products().queryByTestId('merchantSsell-0-price')).toBeNull())
  })
})

describe('掛單詳細：店販列的新增、清除與刪除', () => {
  it('新增一列並選商品後兩列都送出；刪除第二列後只送第一列', async () => {
    const page = await setup()
    fireEvent.click(products().getByTestId('merchantSsell-0-add'))
    await wait(() => expect(products().getByTestId('merchantSsell-1-product')).toBeInTheDocument())
    // 只有第一列有「從清單選擇商品」、沒有刪除鈕
    expect(products().getAllByRole('button', { name: '從清單選擇商品' })).toHaveLength(1)
    expect(products().queryByTestId('merchantSsell-0-delete')).toBeNull()
    pick(rowInput(1, 'employee'), 'Lee-02')
    pick(rowInput(1, 'product'), 'P02 - 護髮油 - 500')
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent('2,900'))
    fireEvent.click(products().getByTestId('merchantSsell-1-delete'))
    await wait(() => expect(products().queryByTestId('merchantSsell-1-product')).toBeNull())
    const input = await saveDraft(page.calls)
    expect(input.productOrders).toEqual([expect.objectContaining({ productId: PRODUCT.id, count: 2 })])
  })

  it('只有一列時清除：整列清空、不送出店販', async () => {
    const page = await setup()
    fireEvent.click(products().getByTestId('merchantSsell-0-clear'))
    await wait(() => expect(rowInput(0, 'product')).toHaveValue(''))
    expect(rowInput(0, 'employee')).toHaveValue('')
    const input = await saveDraft(page.calls)
    expect(input.productOrders).toEqual([])
  })

  it('兩列時清除第一列：只清空該列，第二列照送', async () => {
    const page = await setup({
      order: makeOrder({ productOrders: [productOrder(), productOrder(PRODUCT2, { count: 1, price: 500 })] }),
    })
    fireEvent.click(products().getByTestId('merchantSsell-0-clear'))
    await wait(() => expect(rowInput(0, 'product')).toHaveValue(''))
    expect(rowInput(1, 'product')).toHaveValue('護髮油')
    const input = await saveDraft(page.calls)
    expect(input.productOrders).toEqual([expect.objectContaining({ productId: PRODUCT2.id, price: 500, count: 1 })])
  })
})

describe('掛單詳細：店販區塊收合與從清單選擇', () => {
  it('掛單沒有店販：預設收合；展開後是一列空白列，收合時顯示已填筆數與小計', async () => {
    await pageReady(setupDraft())
    expect(panelHeader('店販銷售')).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(panelHeader('店販銷售'))
    await wait(() => expect(panelHeader('店販銷售')).toHaveAttribute('aria-expanded', 'true'))
    expect(rowInput(0, 'product')).toHaveValue('')
    pick(rowInput(0, 'product'), 'P01 - 洗髮精 - 1200')
    await wait(() => expect(rowInput(0, 'price')).toHaveValue('1200'))
    fireEvent.click(panelHeader('店販銷售'))
    await wait(() => expect(panelHeader('店販銷售')).toHaveTextContent('已填 1 筆 · 1,200'))
  })

  it('從清單選擇商品：第一列空白時帶入第一列（售價、數量 1）', async () => {
    const page = setupDraft()
    await pageReady(page)
    fireEvent.click(panelHeader('店販銷售'))
    pick(rowInput(0, 'employee'), 'Amy-01')
    fireEvent.click(products().getByRole('button', { name: '從清單選擇商品' }))
    const dialog = within(await screen.findByRole('dialog'))
    fireEvent.click(dialog.getAllByRole('button', { name: '加入' })[1])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    await wait(() => expect(rowInput(0, 'product')).toHaveValue('護髮油'))
    const input = await saveDraft(page.calls)
    expect(input.productOrders).toEqual([expect.objectContaining({ sellerId: DESIGNER.userId, productId: PRODUCT2.id, price: 500, count: 1 })])
  })
})

describe('掛單詳細：店販列 Enter 跳欄', () => {
  it('銷售人員 → 商品 → 單價 → 數量 → 第三方卡券 → 自動新增下一列', async () => {
    await setup({ thirdPartTicket: true })
    focusOn(rowInput(0, 'employee'))
    enter(rowInput(0, 'employee'))
    await expectFocused(rowInput(0, 'product'))
    enter(rowInput(0, 'product'))
    const price = rowInput(0, 'price')
    await expectFocused(price)
    // 單價、數量進欄時整欄選取
    expect([price.selectionStart, price.selectionEnd]).toEqual([0, price.value.length])
    enter(price)
    await expectFocused(rowInput(0, 'count'))
    // 其他按鍵不跳欄
    fireEvent.keyDown(rowInput(0, 'count'), { key: '1' })
    expect(document.activeElement).toBe(rowInput(0, 'count'))
    enter(rowInput(0, 'count'))
    const thirdParty = products().getByPlaceholderText('第三方卡券')
    await expectFocused(thirdParty)
    fireEvent.keyDown(thirdParty, { key: 'a' })
    enter(thirdParty)
    await wait(() => expect(products().getByTestId('merchantSsell-1-employee')).toBeInTheDocument())
  })

  it('兩列時第一列卡券 Enter 不新增列（只移到下一列）', async () => {
    await setup({
      thirdPartTicket: true,
      order: makeOrder({ productOrders: [productOrder(), productOrder(PRODUCT2, { count: 1, price: 500 })] }),
    })
    const thirdParty = products().getAllByPlaceholderText('第三方卡券')[0]
    focusOn(thirdParty)
    enter(thirdParty)
    await wait(() => expect(products().queryByTestId('merchantSsell-2-employee')).toBeNull())
    expect(products().getAllByPlaceholderText('第三方卡券')).toHaveLength(2)
  })
})
