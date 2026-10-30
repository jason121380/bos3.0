// 保護「帳單詳細」的店販銷售（PanelMerchantSells／MerchantSells）：既有帳單的店販（服務人員、商品、價格、數量、第三方卡券）
// 要原樣帶回並展開；櫃檯改動後重新結帳送出的就是改過的內容：
// - 改價格、數量（非數字視為 0）；鎖價商品的價格不能改；第三方卡券顯示扣完後業績，選／清卡券後送出
// - 清除此列（只有一列時清成空白列、不送出）、刪除此列、新增項目
// - 鍵盤：服務人員 → 商品 → 價格 → 數量 →（店家開第三方卡券）卡券 → 下一列（最後一列自動新增）；聚焦價格／數量時整段選取
// - 直接點另一列的欄位：游標留在點的欄位（不會被拉回該列的服務人員）
// - 收合時標題列顯示已填筆數與金額
// GraphQL 全由模擬 link 回應，不連後端、不改真實帳單。
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import {
  setup, pageReady, makeOrder, checkoutAndGetInput, summaryValue, loginForTest, pickEmployee,
  DESIGNER, ASSISTANT, PRODUCT,
} from './orderEditKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginForTest())
afterEach(cleanup)

const WAX = { ...PRODUCT, id: 'product-2', no: 'P02', name: '髮蠟', sellPrice: 500, isLocked: 'TRUE' }
const productOrder = (product, extra = {}) => ({
  id: `po-${product.id}`,
  name: product.name,
  count: 1,
  price: product.sellPrice,
  thirdPartyPayId: null,
  seller: { id: DESIGNER.userId, lastName: '王', firstName: '小美', designerNo: '01' },
  product: { id: product.id, no: product.no, name: product.name, isLocked: product.isLocked },
  ...extra,
})

// 第 1 列：洗髮精 ×2（團購券）；第 2 列：鎖價的髮蠟
const twoProducts = () =>
  makeOrder({ productOrders: [productOrder(PRODUCT, { count: 2, thirdPartyPayId: 'tp-1' }), productOrder(WAX)] })

const open = (overrides = {}) =>
  setup({
    order: twoProducts(),
    GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true },
    GET_PRODUCT_IN_AUTO_COMPLETE: { products: { data: [PRODUCT, WAX] } },
    ...overrides,
  })

const productInputs = () => screen.getAllByPlaceholderText('商品代號/名稱')
const rowEl = i => productInputs()[i].closest('.mb-6')
const sellerOf = i => within(rowEl(i)).getByPlaceholderText('服務人員姓名/編號')
const productOf = i => productInputs()[i]
const priceOf = i => screen.getByTestId(`merchantSsell-${i}-price`)
const countOf = i => screen.getByTestId(`merchantSsell-${i}-count`)
const thirdPartyOf = i => within(rowEl(i)).getByPlaceholderText('第三方卡券')
const enter = el => fireEvent.keyDown(el, { key: 'Enter', keyCode: 13 })
const focused = el => wait(() => expect(document.activeElement).toBe(el))
const productsHeader = () => screen.getAllByTestId('merchantSell')[0]

describe('帳單詳細：店販帶回原帳單', () => {
  it('有店販的帳單自動展開；第三方卡券顯示扣完後業績；鎖價商品價格不能改', async () => {
    const page = open()
    await pageReady(page)
    expect(productsHeader()).toHaveAttribute('aria-expanded', 'true')
    expect(productOf(0)).toHaveValue('洗髮精')
    expect(sellerOf(0)).toHaveValue('Amy-01')
    expect(countOf(0)).toHaveValue('2')
    expect(within(rowEl(0)).getByText('扣完後業績:1,080')).toBeInTheDocument()
    expect(priceOf(1)).toBeDisabled()
    expect(priceOf(0)).not.toBeDisabled()
  })

  // 為什麼重要：「扣完後業績」是櫃台判斷這筆店販實際入多少業績的依據。原本店販一律按比例算，
  // 固定金額（手續費 100 元）的卡券會顯示 售價 ×（100−100）% = 0，與打帳單、服務（PERCENT 按比例、其他類型減去金額）不一致。
  it('原帳單用固定金額的第三方卡券：扣完後業績＝價格－手續費', async () => {
    const page = open({ order: makeOrder({ productOrders: [productOrder(PRODUCT, { thirdPartyPayId: 'tp-2' })] }) })
    await pageReady(page)
    // 1200 − 100 = 1100
    expect(await within(rowEl(0)).findByText('扣完後業績:1,100')).toBeInTheDocument()
  })

  it('收合店販：標題列顯示已填筆數與金額', async () => {
    const page = open()
    await pageReady(page)
    fireEvent.click(productsHeader())
    await wait(() => expect(productsHeader()).toHaveTextContent('已填 2 筆 · 2,900'))
  })
})

describe('帳單詳細：改店販後重新結帳', () => {
  it('改價格、數量（非數字視為 0）與服務人員：送出改過的內容', async () => {
    const page = open()
    await pageReady(page)
    fireEvent.change(priceOf(0), { target: { value: '1000' } })
    fireEvent.change(countOf(0), { target: { value: '3' } })
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent('3,500'))
    fireEvent.change(priceOf(0), { target: { value: 'x' } })
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent(/^500$/))
    fireEvent.change(priceOf(0), { target: { value: '1000' } })
    await pickEmployee(sellerOf(1), ASSISTANT.userName)
    const input = await checkoutAndGetInput(page.calls)
    expect(input.productOrders).toEqual([
      expect.objectContaining({ productId: PRODUCT.id, price: 1000, count: 3, sellerId: DESIGNER.userId, thirdPartyCouponMerchantId: 'tp-1' }),
      expect.objectContaining({ productId: WAX.id, price: 500, count: 1, sellerId: ASSISTANT.userId }),
    ])
  })

  it('數量改成非數字（0）：該列不送出', async () => {
    const page = open()
    await pageReady(page)
    fireEvent.change(countOf(1), { target: { value: 'x' } })
    const input = await checkoutAndGetInput(page.calls)
    expect(input.productOrders).toEqual([expect.objectContaining({ productId: PRODUCT.id })])
  })

  it('清除第 2 列：該列不送出；刪除第 2 列：只剩第 1 列', async () => {
    const page = open()
    await pageReady(page)
    fireEvent.click(screen.getByTestId('merchantSsell-1-clear'))
    await wait(() => expect(productOf(1)).toHaveValue(''))
    let input = await checkoutAndGetInput(page.calls)
    expect(input.productOrders).toEqual([expect.objectContaining({ productId: PRODUCT.id })])
    cleanup()

    const again = open()
    await pageReady(again)
    fireEvent.click(screen.getByTestId('merchantSsell-1-delete'))
    await wait(() => expect(productInputs()).toHaveLength(1))
    input = await checkoutAndGetInput(again.calls)
    expect(input.productOrders).toEqual([expect.objectContaining({ productId: PRODUCT.id, count: 2 })])
  })

  it('只有一列時清除：清成空白列，不送出店販', async () => {
    const page = open({ order: makeOrder({ productOrders: [productOrder(PRODUCT)] }) })
    await pageReady(page)
    // 會員卡列也用同樣的 testid，店販在前
    fireEvent.click(screen.getAllByTestId('merchantSsell-0-clear')[0])
    await wait(() => expect(productOf(0)).toHaveValue(''))
    expect(sellerOf(0)).toHaveValue('')
    const input = await checkoutAndGetInput(page.calls)
    expect(input.productOrders).toEqual([])
  })

  it('新增項目後選商品與服務人員：送出新的一列（數量 1、售價）', async () => {
    const page = open({ order: makeOrder({ productOrders: [productOrder(PRODUCT)] }) })
    await pageReady(page)
    fireEvent.click(screen.getAllByTestId('merchantSsell-0-add')[0])
    await wait(() => expect(productInputs()).toHaveLength(2))
    fireEvent.change(productOf(1), { target: { value: '蠟' } })
    fireEvent.click(await within(document.body).findByText('髮蠟', { exact: false, selector: '[data-testid$="-髮蠟"]' }))
    await pickEmployee(sellerOf(1), DESIGNER.userName)
    const input = await checkoutAndGetInput(page.calls)
    expect(input.productOrders).toEqual([
      expect.objectContaining({ productId: PRODUCT.id }),
      expect.objectContaining({ productId: WAX.id, price: 500, count: 1, sellerId: DESIGNER.userId }),
    ])
  })

  it('選第三方卡券、再清掉：送出 null', async () => {
    const page = open({ order: makeOrder({ productOrders: [productOrder(PRODUCT)] }) })
    await pageReady(page)
    fireEvent.click(thirdPartyOf(0))
    fireEvent.click(await within(document.body).findByTestId('團購券'))
    expect(await within(rowEl(0)).findByText('扣完後業績:1,080')).toBeInTheDocument()
    thirdPartyOf(0).focus()
    fireEvent.mouseDown(await within(rowEl(0)).findByLabelText('清除', { selector: 'button' }))
    await wait(() => expect(within(rowEl(0)).queryByText(/扣完後業績/)).toBeNull())
    const input = await checkoutAndGetInput(page.calls)
    expect(input.productOrders[0].thirdPartyCouponMerchantId).toBeNull()
  })
})

describe('帳單詳細：店販鍵盤操作', () => {
  it('服務人員 → 商品 → 價格 → 數量 → 第三方卡券 → 下一列；最後一列按 Enter 新增一列；其他鍵不移動', async () => {
    const page = open()
    await pageReady(page)
    fireEvent.keyDown(sellerOf(0), { key: 'a' })
    enter(sellerOf(0))
    await focused(productOf(0))
    enter(productOf(0))
    await focused(priceOf(0))
    expect(priceOf(0).selectionEnd).toBe('1200'.length)
    enter(priceOf(0))
    await focused(countOf(0))
    expect(countOf(0).selectionEnd).toBe(1)
    enter(countOf(0))
    await focused(thirdPartyOf(0))
    fireEvent.keyDown(thirdPartyOf(0), { key: 'a' })
    enter(thirdPartyOf(0))
    await focused(sellerOf(1))
    enter(thirdPartyOf(1))
    await wait(() => expect(productInputs()).toHaveLength(3))
    await focused(sellerOf(2))
  })

  it('從第 1 列直接點第 2 列的商品、價格欄：游標留在點的欄位（不會被拉回第 2 列的服務人員）', async () => {
    const page = open()
    await pageReady(page)
    act(() => sellerOf(0).focus())
    act(() => productOf(1).focus())
    await page.settle()
    expect(document.activeElement).toBe(productOf(1))
    act(() => priceOf(0).focus())
    await page.settle()
    expect(document.activeElement).toBe(priceOf(0))
  })

  it('店家沒開第三方卡券：數量按 Enter 不移動', async () => {
    const page = open({ GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: false } })
    await pageReady(page)
    countOf(0).focus()
    enter(countOf(0))
    await page.settle()
    expect(document.activeElement).toBe(countOf(0))
    expect(within(rowEl(0)).queryByPlaceholderText('第三方卡券')).toBeNull()
  })
})
// 已修正（Jason 2026/10/22 fix all）：帶入既有店販時自動展開區塊會觸發第 1 列「展開＋本列要聚焦」的 effect，開頁焦點就跳進這一區
// （與會員卡銷售同一個原因；會員卡修好後焦點改落在這裡）。改為帶入時沒有要聚焦的列（focusRow -1），使用者展開／新增／換列時才聚焦
describe('帳單詳細：店販帶入時不自動聚焦', () => {
  it('開頁帶入店販：焦點不在店販列；使用者收合再展開時游標到第 1 列服務人員', async () => {
    const page = open()
    await pageReady(page)
    expect(productsHeader()).toHaveAttribute('aria-expanded', 'true')
    expect(rowEl(0).contains(document.activeElement)).toBe(false)
    expect(rowEl(1).contains(document.activeElement)).toBe(false)
    fireEvent.click(productsHeader())
    await wait(() => expect(productsHeader()).toHaveAttribute('aria-expanded', 'false'))
    fireEvent.click(productsHeader())
    await focused(sellerOf(0))
  })
})
