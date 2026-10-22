// 保護打帳單「店販銷售」「預收卡販賣」「會員卡銷售」三區的櫃台操作與送出內容：
// - 店販：選服務人員與商品後以售價×數量計入；可改價、改數量（數量清空＝0 不計入），鎖價商品不能改價；可選第三方卡券（顯示扣完手續費後業績）
// - 預收卡：選卡券帶入可用次數與售價，可改次數／價格／張數／備註（可用次數、張數清空視為 1），鎖定的卡券不能改次數與價格
// - 會員卡：選卡帶入售價與到期日（今天＋有效天數；0 天＝永久會籍），可切換永久會籍、改到期日；到期日早於帳單日或超過 50 年時提示
// - 三區都可從清單選擇、新增／清除列；收合時標題顯示已填筆數與金額；F1～F7 直接切換展開的區塊
// - 鍵盤：各欄按 Enter 依序跳到下一欄，最後一欄跳到下一列
// GraphQL 全由模擬 link 回應，不建立真實帳單。
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import addDays from 'date-fns/addDays'
import format from 'date-fns/format'
import { loginAs, callsOf } from '../../../__tests__/testkit.test'
import {
  setupPage, waitPageReady, pickEmployee, checkoutButton, sentOrder, summaryValue,
  DESIGNER, HELPER, PRODUCT, PRODUCT_LOCKED, TICKET, TICKET_LOCKED, MEMBERSHIP, MEMBERSHIP_FOREVER, button, buttonsIn, findButton, currentDialog, findDialog,
} from './orderCreateKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

const enter = el => fireEvent.keyDown(el, { key: 'Enter', keyCode: 13 })
const designerInputs = () => screen.getAllByPlaceholderText('服務人員姓名/編號')
const addFromList = (dialog, name) => fireEvent.click(button('加入', within(dialog).getByText(name).closest('tr')))

const prepare = async (overrides, options) => {
  const page = setupPage(overrides, options)
  await waitPageReady()
  await pickEmployee()
  fireEvent.click(screen.getByLabelText('不留客資'))
  return page
}
const checkout = async calls => {
  await wait(() => expect(checkoutButton()).not.toBeDisabled())
  fireEvent.click(checkoutButton())
  await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
  return sentOrder(calls)
}

describe('店販銷售', () => {
  const productInputs = () => screen.getAllByPlaceholderText('商品代號/名稱')
  const pickProduct = async (product = PRODUCT, row = 0) => {
    fireEvent.change(productInputs()[row], { target: { value: product.name.slice(0, 1) } })
    fireEvent.click(await screen.findByTestId(`undefined-${product.name}`))
  }
  const open = () => fireEvent.click(screen.getByTestId('merchantSell'))
  // 店販與會員卡的列使用相同的 data-testid，限定在店販區塊內
  const panel = () => within(screen.getByTestId('merchantSell').parentElement)

  it('選服務人員與商品：以售價×數量計入；改價、改數量後送出新值', async () => {
    const { calls } = await prepare()
    open()
    await pickEmployee(designerInputs()[1], HELPER)
    await pickProduct()
    const price = screen.getByTestId('merchantSsell-0-price')
    const count = screen.getByTestId('merchantSsell-0-count')
    fireEvent.change(price, { target: { value: '400' } })
    fireEvent.change(count, { target: { value: '3' } })
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent('1,200'))
    const { productOrders } = await checkout(calls)
    expect(productOrders).toEqual([
      expect.objectContaining({ sellerId: HELPER.userId, productId: PRODUCT.id, price: 400, count: 3 }),
    ])
  })

  it('價格清空視為 0；數量清空視為 0、該列不計入；鎖價商品不能改價', async () => {
    await prepare()
    open()
    await pickEmployee(designerInputs()[1], HELPER)
    await pickProduct(PRODUCT_LOCKED)
    expect(screen.getByTestId('merchantSsell-0-price')).toBeDisabled()
    await pickProduct(PRODUCT)
    fireEvent.change(screen.getByTestId('merchantSsell-0-price'), { target: { value: '' } })
    await wait(() => expect(screen.getByTestId('merchantSsell-0-price')).toHaveValue('0'))
    fireEvent.change(screen.getByTestId('merchantSsell-0-price'), { target: { value: '450' } })
    fireEvent.change(screen.getByTestId('merchantSsell-0-count'), { target: { value: '' } })
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent('0'))
    expect(screen.getByText(/尚缺/)).toHaveTextContent('至少一項消費')
  })

  it('店家開啟第三方卡券：選卡券隨帳單送出；清除卡券後不帶', async () => {
    const { calls } = await prepare({ GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true } })
    open()
    await pickEmployee(designerInputs()[1], HELPER)
    await pickProduct()
    const tp = screen.getByPlaceholderText('第三方卡券')
    fireEvent.click(tp)
    fireEvent.click(await screen.findByTestId('團購券'))
    await wait(() => expect(tp).toHaveValue('團購券'))
    // 百分比手續費：450 × 90% = 405
    expect(await screen.findByText('扣完後業績:405')).toBeInTheDocument()
    act(() => tp.focus())
    fireEvent.mouseDown(buttonsIn(tp.closest('.ui-root'), '清除')[0])
    await wait(() => expect(tp).toHaveValue(''))
    expect(screen.queryByText(/扣完後業績/)).toBeNull()
    fireEvent.click(tp)
    fireEvent.click(await screen.findByTestId('禮券'))
    // 固定金額手續費：450 − 100 = 350（與服務項目相同算法）
    expect(await screen.findByText('扣完後業績:350')).toBeInTheDocument()
    const { productOrders } = await checkout(calls)
    expect(productOrders[0].thirdPartyCouponMerchantId).toBe('tp-2')
  })

  it('價格改成 0 後再選第三方卡券：以 0 元送出（不是空值）', async () => {
    const { calls } = await prepare({ GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true } })
    open()
    await pickEmployee(designerInputs()[1], HELPER)
    await pickProduct()
    fireEvent.change(screen.getByTestId('merchantSsell-0-price'), { target: { value: '' } })
    await wait(() => expect(screen.getByTestId('merchantSsell-0-price')).toHaveValue('0'))
    fireEvent.click(screen.getByPlaceholderText('第三方卡券'))
    fireEvent.click(await screen.findByTestId('團購券'))
    const { productOrders } = await checkout(calls)
    expect(productOrders).toEqual([expect.objectContaining({ productId: PRODUCT.id, price: 0, thirdPartyCouponMerchantId: 'tp-1' })])
  })

  it('新增、刪除、清除列：只送出仍有內容的列', async () => {
    const { calls } = await prepare()
    open()
    await pickEmployee(designerInputs()[1], HELPER)
    await pickProduct()
    fireEvent.click(panel().getByTestId('merchantSsell-0-add'))
    await pickEmployee(designerInputs()[2], DESIGNER)
    await pickProduct(PRODUCT_LOCKED, 1)
    fireEvent.click(panel().getByTestId('merchantSsell-1-add'))
    expect(productInputs()).toHaveLength(3)
    fireEvent.click(panel().getByTestId('merchantSsell-2-delete'))
    await wait(() => expect(productInputs()).toHaveLength(2))
    // 清除第一列（多列時只清該列）
    fireEvent.click(panel().getByTestId('merchantSsell-0-clear'))
    await wait(() => expect(productInputs()[0]).toHaveValue(''))
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent('600'))
    const { productOrders } = await checkout(calls)
    expect(productOrders).toEqual([expect.objectContaining({ sellerId: DESIGNER.userId, productId: PRODUCT_LOCKED.id, price: 600 })])
  })

  it('只有一列時清除：回到空白列，帳單沒有店販', async () => {
    await prepare()
    open()
    await pickEmployee(designerInputs()[1], HELPER)
    await pickProduct()
    fireEvent.click(panel().getByTestId('merchantSsell-0-clear'))
    await wait(() => expect(productInputs()[0]).toHaveValue(''))
    expect(designerInputs()[1]).toHaveValue('')
    expect(screen.getByText(/尚缺/)).toHaveTextContent('至少一項消費')
  })

  it('從清單選擇商品：第一列空白時帶入第一列，否則新增一列；可依分類篩選與清除', async () => {
    const { calls } = await prepare()
    open()
    await pickEmployee(designerInputs()[1], HELPER)
    fireEvent.click(button('從清單選擇商品'))
    let dialog = await findDialog()
    fireEvent.click(within(dialog).getAllByText('洗護')[0])
    expect(within(dialog).getByText('洗護類商品')).toBeInTheDocument()
    fireEvent.click(button('清除', dialog))
    addFromList(dialog, PRODUCT.name)
    await wait(() => expect(currentDialog()).toBeNull())
    await wait(() => expect(productInputs()[0]).toHaveValue(PRODUCT.name))

    fireEvent.click(button('從清單選擇商品'))
    dialog = await findDialog()
    addFromList(dialog, PRODUCT_LOCKED.name)
    await wait(() => expect(productInputs()).toHaveLength(2))
    await pickEmployee(designerInputs()[2], DESIGNER)
    const { productOrders } = await checkout(calls)
    expect(productOrders.map(d => d.productId)).toEqual([PRODUCT.id, PRODUCT_LOCKED.id])
  })

  it('Enter：服務人員 → 商品 → 價格 → 數量 → 下一列（沒開卡券）', async () => {
    await prepare()
    open()
    await pickEmployee(designerInputs()[1], HELPER)
    await pickProduct()
    enter(designerInputs()[1])
    await wait(() => expect(productInputs()[0]).toHaveFocus())
    enter(productInputs()[0])
    await wait(() => expect(screen.getByTestId('merchantSsell-0-price')).toHaveFocus())
    enter(screen.getByTestId('merchantSsell-0-price'))
    await wait(() => expect(screen.getByTestId('merchantSsell-0-count')).toHaveFocus())
    enter(screen.getByTestId('merchantSsell-0-count'))
    await wait(() => expect(productInputs()).toHaveLength(2))
    // 非 Enter 不動作
    fireEvent.keyDown(designerInputs()[2], { key: 'a', keyCode: 65 })
    expect(productInputs()).toHaveLength(2)
  })

  it('Enter：開卡券時數量 → 卡券 → 下一列', async () => {
    await prepare({ GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true } })
    open()
    await pickEmployee(designerInputs()[1], HELPER)
    await pickProduct()
    enter(screen.getByTestId('merchantSsell-0-count'))
    await wait(() => expect(screen.getByPlaceholderText('第三方卡券')).toHaveFocus())
    enter(screen.getByPlaceholderText('第三方卡券'))
    await wait(() => expect(productInputs()).toHaveLength(2))
    fireEvent.keyDown(screen.getByPlaceholderText('第三方卡券'), { key: 'a', keyCode: 65 })
    expect(productInputs()).toHaveLength(2)
  })

  it('收合時標題顯示已填筆數與金額', async () => {
    await prepare()
    open()
    await pickEmployee(designerInputs()[1], HELPER)
    await pickProduct()
    open()
    expect(await screen.findByText('已填 1 筆 · 450')).toBeInTheDocument()
  })
})

describe('預收卡販賣', () => {
  const ticketInputs = () => screen.getAllByPlaceholderText('卡券名稱/代號')
  const pickTicket = async (ticket = TICKET, row = 0) => {
    fireEvent.change(ticketInputs()[row], { target: { value: ticket.name.slice(0, 2) } })
    fireEvent.click(await screen.findByTestId(`undefined-${ticket.name}`))
  }
  const open = () => fireEvent.click(screen.getByTestId('couponSells'))
  const field = name => document.querySelector(`input[name="${name}"]`)

  it('選卡券帶入次數與售價；改次數、價格、張數、備註後送出新值（不入業績、但計入應收）', async () => {
    const { calls } = await prepare()
    open()
    await pickTicket()
    // 可改的卡券選定後焦點到「可使用次數」
    await wait(() => expect(field('availableCount')).toHaveFocus())
    fireEvent.change(field('availableCount'), { target: { value: '12' } })
    fireEvent.change(field('price'), { target: { value: '8000' } })
    fireEvent.change(field('count'), { target: { value: '2' } })
    fireEvent.change(field('remark'), { target: { value: '生日優惠' } })
    await wait(() => expect(summaryValue('預收卡販賣')).toHaveTextContent('16,000'))
    expect(summaryValue('業績合計')).toHaveTextContent('0')
    const { ticketOrders } = await checkout(calls)
    expect(ticketOrders).toEqual([
      expect.objectContaining({ serviceId: TICKET.id, availableCount: 12, price: 8000, count: 2, remark: '生日優惠' }),
    ])
  })

  it('次數、張數清空視為 1；價格清空視為 0；鎖定卡券不能改次數與價格，選定後焦點到張數', async () => {
    await prepare()
    open()
    await pickTicket()
    fireEvent.change(field('availableCount'), { target: { value: '' } })
    fireEvent.change(field('count'), { target: { value: '' } })
    fireEvent.change(field('price'), { target: { value: '' } })
    await wait(() => expect(field('availableCount')).toHaveValue('1'))
    expect(field('count')).toHaveValue('1')
    expect(field('price')).toHaveValue('0')
    await pickTicket(TICKET_LOCKED)
    await wait(() => expect(field('count')).toHaveFocus())
    expect(field('availableCount')).toBeDisabled()
    expect(field('price')).toBeDisabled()
    expect(field('remark')).toHaveValue('限本店')
  })

  it('Enter：卡券 → 次數 → 價格 → 張數 → 備註 → 下一列；鎖定卡券從卡券欄直接到張數', async () => {
    await prepare()
    open()
    await pickTicket()
    act(() => ticketInputs()[0].focus())
    enter(ticketInputs()[0])
    await wait(() => expect(field('availableCount')).toHaveFocus())
    enter(field('availableCount'))
    await wait(() => expect(field('price')).toHaveFocus())
    enter(field('price'))
    await wait(() => expect(field('count')).toHaveFocus())
    enter(field('count'))
    await wait(() => expect(field('remark')).toHaveFocus())
    enter(field('remark'))
    await wait(() => expect(ticketInputs()).toHaveLength(2))
    // 非 Enter 不動作
    fireEvent.keyDown(field('remark'), { key: 'a', keyCode: 65 })
    expect(ticketInputs()).toHaveLength(2)

    await pickTicket(TICKET_LOCKED, 1)
    enter(ticketInputs()[1])
    await wait(() => expect(document.querySelectorAll('input[name="count"]')[1]).toHaveFocus())
  })

  it('清除卡券欄：該列不計入帳單', async () => {
    await prepare()
    open()
    await pickTicket()
    act(() => ticketInputs()[0].focus())
    fireEvent.mouseDown(buttonsIn(ticketInputs()[0].closest('.ui-root'), '清除')[0])
    await wait(() => expect(screen.getByText(/尚缺/)).toHaveTextContent('至少一項消費'))
  })

  it('清除列：只有一列時回到空白；多列時只清該列', async () => {
    const { calls } = await prepare()
    open()
    await pickTicket()
    fireEvent.click(screen.getByTestId('couponSells-0-clear'))
    await wait(() => expect(ticketInputs()[0]).toHaveValue(''))
    expect(screen.getByText(/尚缺/)).toHaveTextContent('至少一項消費')

    await pickTicket()
    fireEvent.click(screen.getByTestId('couponSells-0-add'))
    await pickTicket(TICKET_LOCKED, 1)
    fireEvent.click(screen.getByTestId('couponSells-0-clear'))
    await wait(() => expect(ticketInputs()[0]).toHaveValue(''))
    await wait(() => expect(summaryValue('預收卡販賣')).toHaveTextContent('5,000'))
    const { ticketOrders } = await checkout(calls)
    expect(ticketOrders).toEqual([expect.objectContaining({ serviceId: TICKET_LOCKED.id })])
  })

  it('刪除列：刪掉的卡券不再計入合計，也不送出', async () => {
    const { calls } = await prepare()
    open()
    await pickTicket()
    fireEvent.click(screen.getByTestId('couponSells-0-add'))
    await pickTicket(TICKET_LOCKED, 1)
    await wait(() => expect(summaryValue('預收卡販賣')).toHaveTextContent('12,000'))
    fireEvent.click(screen.getByTestId('couponSells-1-delete'))
    await wait(() => expect(ticketInputs()).toHaveLength(1))
    await wait(() => expect(summaryValue('預收卡販賣')).toHaveTextContent('7,000'))
    const { ticketOrders } = await checkout(calls)
    expect(ticketOrders).toEqual([expect.objectContaining({ serviceId: TICKET.id })])
  })

  it('從清單選擇預收卡（含類別欄）：第一列空白時帶入第一列，否則新增一列；可依分類篩選與清除，關閉不帶入', async () => {
    const { calls } = await prepare()
    open()
    fireEvent.click(button('從清單選擇預收卡'))
    let dialog = await findDialog()
    expect(within(dialog).getByText('2張卡券')).toBeInTheDocument()
    fireEvent.click(within(dialog).getAllByText('剪髮')[0])
    await wait(() => expect(callsOf(calls, 'GET_TICKETS').some(c => (c.variables.categoryIds || []).includes('cat-1'))).toBe(true))
    fireEvent.click(button('清除', dialog))
    addFromList(dialog, TICKET.name)
    await wait(() => expect(currentDialog()).toBeNull())
    await wait(() => expect(ticketInputs()[0]).toHaveValue(`${TICKET.name}(${TICKET.no})`))

    fireEvent.click(button('從清單選擇預收卡'))
    dialog = await findDialog()
    addFromList(dialog, TICKET_LOCKED.name)
    await wait(() => expect(ticketInputs()).toHaveLength(2))

    fireEvent.click(button('從清單選擇預收卡'))
    dialog = await findDialog()
    fireEvent.click(buttonsIn(dialog, '關閉')[1])
    await wait(() => expect(currentDialog()).toBeNull())

    const { ticketOrders } = await checkout(calls)
    expect(ticketOrders.map(d => d.serviceId)).toEqual([TICKET.id, TICKET_LOCKED.id])
  })

  it('收合時標題顯示已填筆數與金額', async () => {
    await prepare()
    open()
    await pickTicket()
    open()
    expect(await screen.findByText('已填 1 筆 · 7,000')).toBeInTheDocument()
  })
})

describe('會員卡銷售', () => {
  const cardInputs = () => screen.getAllByPlaceholderText('會員卡名稱/代號')
  const pickCard = async (card = MEMBERSHIP, row = 0) => {
    fireEvent.change(cardInputs()[row], { target: { value: card.name.slice(0, 1) } })
    fireEvent.click(await screen.findByTestId(`undefined-${card.name}`))
  }
  const open = () => fireEvent.click(screen.getByTestId('memberShipCardSells'))
  const forever = () => screen.getByLabelText('永久會籍')
  const expiryInput = () => screen.getAllByLabelText(/^選擇日期/)[1]
  const sellerInput = () => designerInputs()[2]

  it('選卡帶入售價與到期日（今天＋有效天數），改價後送出', async () => {
    const { calls } = await prepare()
    open()
    await pickEmployee(sellerInput(), HELPER)
    await pickCard()
    expect(forever()).not.toBeChecked()
    expect(expiryInput().value).toBe(format(addDays(new Date(), MEMBERSHIP.effecitveDay), 'yyyy/MM/dd'))
    fireEvent.change(screen.getByTestId('memberShipCardSells-0-price'), { target: { value: '2800' } })
    fireEvent.change(document.querySelector('input[name="remark"]'), { target: { value: '開卡禮' } })
    await wait(() => expect(summaryValue('會員卡販賣')).toHaveTextContent('2,800'))
    const { membershipOrders } = await checkout(calls)
    expect(membershipOrders).toEqual([
      expect.objectContaining({ sellerId: HELPER.userId, membershipUUID: MEMBERSHIP.uuid, price: 2800, remark: '開卡禮' }),
    ])
    expect(format(new Date(membershipOrders[0].expiryDate), 'yyyy/MM/dd')).toBe(format(addDays(new Date(), 365), 'yyyy/MM/dd'))
  })

  it('價格清空視為 0；有效天數 0 的卡為永久會籍（到期日停用、價格鎖定）', async () => {
    const { calls } = await prepare()
    open()
    await pickEmployee(sellerInput(), HELPER)
    await pickCard()
    fireEvent.change(screen.getByTestId('memberShipCardSells-0-price'), { target: { value: '' } })
    await wait(() => expect(screen.getByTestId('memberShipCardSells-0-price')).toHaveValue('0'))
    await pickCard(MEMBERSHIP_FOREVER)
    await wait(() => expect(forever()).toBeChecked())
    expect(expiryInput()).toBeDisabled()
    expect(screen.getByTestId('memberShipCardSells-0-price')).toBeDisabled()
    const { membershipOrders } = await checkout(calls)
    expect(membershipOrders).toEqual([expect.objectContaining({ membershipUUID: MEMBERSHIP_FOREVER.uuid, price: 9000, expiryDate: null })])
  })

  it('切換永久會籍：勾選後到期日為空；取消勾選改回帳單日＋有效天數', async () => {
    const { calls } = await prepare()
    open()
    await pickEmployee(sellerInput(), HELPER)
    await pickCard()
    fireEvent.click(forever())
    await wait(() => expect(forever()).toBeChecked())
    fireEvent.click(forever())
    await wait(() => expect(forever()).not.toBeChecked())
    fireEvent.click(forever())
    const { membershipOrders } = await checkout(calls)
    expect(membershipOrders[0].expiryDate).toBeNull()
  })

  it('從日期選擇器改到期日：送出選的日期', async () => {
    const { calls } = await prepare()
    open()
    await pickEmployee(sellerInput(), HELPER)
    await pickCard()
    fireEvent.click(expiryInput())
    const target = addDays(new Date(), 365 + 3)
    // 選擇器開在目前到期日的月份；+3 天可能跨月，跨月時先切到下個月
    if (target.getMonth() !== addDays(new Date(), 365).getMonth()) {
      fireEvent.click(await findButton(/下個月|下一月|next/i))
    }
    fireEvent.click(await screen.findByLabelText(format(target, 'yyyy年M月d日')))
    fireEvent.click(button('確認'))
    await wait(() => expect(expiryInput().value).toBe(format(target, 'yyyy/MM/dd')))
    const { membershipOrders } = await checkout(calls)
    expect(format(new Date(membershipOrders[0].expiryDate), 'yyyy/MM/dd')).toBe(format(target, 'yyyy/MM/dd'))
  })

  it('到期日早於帳單日隔天：提示「時間不得小於…」', async () => {
    // 帳單日期鎖定在 400 天後：今天選的 365 天卡會早於帳單日
    const billDate = addDays(new Date(), 400)
    localStorage.setItem('lockDate', true)
    localStorage.setItem('lockDateTimeStamp', billDate.getTime())
    await prepare()
    open()
    await pickEmployee(sellerInput(), HELPER)
    await pickCard()
    expect(await screen.findByText(`時間不得小於${format(addDays(billDate, 1), 'yyyy/MM/dd')}`)).toBeInTheDocument()
  })

  it('到期日超過帳單日 50 年：提示「時間不得大於…」', async () => {
    const billDate = new Date(1970, 0, 2, 10, 0)
    localStorage.setItem('lockDate', true)
    localStorage.setItem('lockDateTimeStamp', billDate.getTime())
    await prepare()
    open()
    await pickEmployee(sellerInput(), HELPER)
    await pickCard()
    expect(await screen.findByText('時間不得大於2020/01/02')).toBeInTheDocument()
  })

  it('店家開啟第三方卡券：選卡券顯示扣完手續費後業績並隨帳單送出', async () => {
    const { calls } = await prepare({ GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true } })
    open()
    await pickEmployee(sellerInput(), HELPER)
    await pickCard()
    const tp = screen.getByPlaceholderText('第三方卡券')
    fireEvent.click(tp)
    fireEvent.click(await screen.findByTestId('團購券'))
    // 3000 × 90% = 2700
    expect(await screen.findByText('扣完後業績:2700')).toBeInTheDocument()
    act(() => tp.focus())
    fireEvent.mouseDown(buttonsIn(tp.closest('.ui-root'), '清除')[0])
    await wait(() => expect(screen.queryByText(/扣完後業績/)).toBeNull())
    fireEvent.click(tp)
    fireEvent.click(await screen.findByTestId('禮券'))
    const { membershipOrders } = await checkout(calls)
    expect(membershipOrders[0].thirdPartyCouponMerchantId).toBe('tp-2')
  })

  it('新增、刪除、清除列：只送出有內容的列', async () => {
    const { calls } = await prepare()
    open()
    await pickEmployee(sellerInput(), HELPER)
    await pickCard()
    // 店販與會員卡的列使用相同的 data-testid，取會員卡區塊內的
    const memberPanel = () => screen.getByTestId('memberShipCardSells').parentElement
    fireEvent.click(buttonsIn(memberPanel(), '新增項目')[0])
    await wait(() => expect(cardInputs()).toHaveLength(2))
    await pickEmployee(designerInputs()[3], DESIGNER)
    await pickCard(MEMBERSHIP_FOREVER, 1)
    fireEvent.click(buttonsIn(memberPanel(), '新增項目')[0])
    await wait(() => expect(cardInputs()).toHaveLength(3))
    fireEvent.click(buttonsIn(memberPanel(), '刪除此列')[1])
    await wait(() => expect(cardInputs()).toHaveLength(2))
    fireEvent.click(buttonsIn(memberPanel(), '清除此列')[0])
    await wait(() => expect(cardInputs()[0]).toHaveValue(''))
    await wait(() => expect(summaryValue('會員卡販賣')).toHaveTextContent('9,000'))
    const { membershipOrders } = await checkout(calls)
    expect(membershipOrders).toEqual([expect.objectContaining({ sellerId: DESIGNER.userId, membershipUUID: MEMBERSHIP_FOREVER.uuid })])
  })

  it('只有一列時清除：回到空白列', async () => {
    await prepare()
    open()
    await pickEmployee(sellerInput(), HELPER)
    await pickCard()
    fireEvent.click(button('清除此列', screen.getByTestId('memberShipCardSells').parentElement))
    await wait(() => expect(cardInputs()[0]).toHaveValue(''))
    expect(screen.getByText(/尚缺/)).toHaveTextContent('至少一項消費')
  })

  it('從清單選擇會員卡：第一列空白時帶入第一列，否則新增一列', async () => {
    const { calls } = await prepare()
    open()
    await pickEmployee(sellerInput(), HELPER)
    fireEvent.click(button('從清單選擇會員卡'))
    let dialog = await findDialog()
    addFromList(dialog, MEMBERSHIP.name)
    await wait(() => expect(currentDialog()).toBeNull())
    await wait(() => expect(cardInputs()[0]).toHaveValue(`${MEMBERSHIP.name}-${MEMBERSHIP.effecitveDay}天`))
    fireEvent.click(button('從清單選擇會員卡'))
    dialog = await findDialog()
    addFromList(dialog, MEMBERSHIP_FOREVER.name)
    await wait(() => expect(cardInputs()).toHaveLength(2))
    await pickEmployee(designerInputs()[3], DESIGNER)
    const { membershipOrders } = await checkout(calls)
    expect(membershipOrders.map(d => d.membershipUUID)).toEqual([MEMBERSHIP.uuid, MEMBERSHIP_FOREVER.uuid])
  })

  it('Enter：服務人員 → 會員卡 → 價格 → 到期日 → 永久會籍 → 卡券 → 備註 → 下一列', async () => {
    await prepare({ GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true } })
    open()
    await pickEmployee(sellerInput(), HELPER)
    await pickCard()
    // 可改價的卡選定後焦點到價格欄
    await wait(() => expect(screen.getByTestId('memberShipCardSells-0-price')).toHaveFocus())
    enter(sellerInput())
    await wait(() => expect(cardInputs()[0]).toHaveFocus())
    enter(cardInputs()[0])
    await wait(() => expect(screen.getByTestId('memberShipCardSells-0-price')).toHaveFocus())
    enter(screen.getByTestId('memberShipCardSells-0-price'))
    await wait(() => expect(expiryInput()).toHaveFocus())
    fireEvent.keyDown(expiryInput(), { key: 'a', keyCode: 65 })
    // 到期日按 Enter 跳到永久會籍，不打開月曆
    enter(expiryInput())
    await wait(() => expect(forever()).toHaveFocus())
    expect(currentDialog()).toBeNull()
    enter(forever())
    await wait(() => expect(screen.getByPlaceholderText('第三方卡券')).toHaveFocus())
    enter(screen.getByPlaceholderText('第三方卡券'))
    await wait(() => expect(document.querySelector('input[name="remark"]')).toHaveFocus())
    enter(document.querySelector('input[name="remark"]'))
    await wait(() => expect(cardInputs()).toHaveLength(2))
    fireEvent.keyDown(document.querySelectorAll('input[name="remark"]')[0], { key: 'a', keyCode: 65 })
    fireEvent.keyDown(cardInputs()[0], { key: 'a', keyCode: 65 })
    fireEvent.keyDown(sellerInput(), { key: 'a', keyCode: 65 })
    expect(cardInputs()).toHaveLength(2)
  })

  it('Enter：永久會籍的卡選定後、從會員卡欄／價格欄都跳到永久會籍', async () => {
    await prepare()
    open()
    await pickEmployee(sellerInput(), HELPER)
    await pickCard(MEMBERSHIP_FOREVER)
    await wait(() => expect(forever()).toHaveFocus())
    enter(cardInputs()[0])
    await wait(() => expect(forever()).toHaveFocus())
    enter(screen.getByTestId('memberShipCardSells-0-price'))
    await wait(() => expect(forever()).toHaveFocus())
    // 改選可改價的卡：價格欄解除鎖定，焦點跳到價格欄
    await pickCard(MEMBERSHIP)
    await wait(() => expect(screen.getByTestId('memberShipCardSells-0-price')).not.toBeDisabled())
    await wait(() => expect(screen.getByTestId('memberShipCardSells-0-price')).toHaveFocus())
  })

  it('Enter：鎖價且有期限的卡從會員卡欄跳到到期日', async () => {
    const LOCKED_CARD = { ...MEMBERSHIP, uuid: 'm-3', name: '銀卡', isLocked: 'TRUE', effecitveDay: 180 }
    await prepare({
      FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE: { memberships: { data: [MEMBERSHIP, MEMBERSHIP_FOREVER, LOCKED_CARD] } },
    })
    open()
    await pickEmployee(sellerInput(), HELPER)
    await pickCard(LOCKED_CARD)
    await wait(() => expect(expiryInput()).toHaveFocus())
    enter(cardInputs()[0])
    await wait(() => expect(expiryInput()).toHaveFocus())
  })

  it('收合時標題顯示已填筆數與金額；店家沒開會員卡時不顯示此區', async () => {
    await prepare()
    open()
    await pickEmployee(sellerInput(), HELPER)
    await pickCard()
    open()
    expect(await screen.findByText('已填 1 筆 · 3,000')).toBeInTheDocument()
    cleanup()
    setupPage({ GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false } })
    await waitPageReady()
    expect(screen.queryByTestId('memberShipCardSells')).toBeNull()
  })
})

describe('區塊切換', () => {
  it('F1～F7 直接展開對應區塊並收合其他區塊；點標題切換展開', async () => {
    await prepare()
    const expanded = testId => screen.getByTestId(testId).getAttribute('aria-expanded')
    fireEvent.keyDown(document, { key: 'F2' })
    await wait(() => expect(expanded('merchantSell')).toBe('true'))
    expect(expanded('panelService')).toBe('false')
    fireEvent.keyDown(document, { key: 'F3' })
    await wait(() => expect(expanded('couponSells')).toBe('true'))
    expect(expanded('merchantSell')).toBe('false')
    fireEvent.keyDown(document, { key: 'F5' })
    await wait(() => expect(expanded('memberShipCardSells')).toBe('true'))
    // 其他按鍵不影響
    fireEvent.keyDown(document, { key: 'a' })
    expect(expanded('memberShipCardSells')).toBe('true')
    fireEvent.click(screen.getByTestId('panelService'))
    await wait(() => expect(expanded('panelService')).toBe('true'))
  })
})

describe('預收卡、會員卡：其他鍵盤與載入情況', () => {
  const ticketInputs = () => screen.getAllByPlaceholderText('卡券名稱/代號')
  const pickTicket = async (ticket = TICKET, row = 0) => {
    fireEvent.change(ticketInputs()[row], { target: { value: ticket.name.slice(0, 2) } })
    fireEvent.click(await screen.findByTestId(`undefined-${ticket.name}`))
  }

  it('預收卡：非 Enter 按鍵不跳欄；第一列備註按 Enter 跳到已存在的第二列卡券', async () => {
    await prepare()
    fireEvent.click(screen.getByTestId('couponSells'))
    await pickTicket()
    fireEvent.click(screen.getByTestId('couponSells-0-add'))
    await wait(() => expect(ticketInputs()).toHaveLength(2))
    const price = document.querySelector('input[name="price"]')
    act(() => price.focus())
    fireEvent.keyDown(price, { key: 'a', keyCode: 65 })
    expect(price).toHaveFocus()
    enter(document.querySelector('input[name="remark"]'))
    await wait(() => expect(ticketInputs()[1]).toHaveFocus())
    expect(ticketInputs()).toHaveLength(2)
  })

  it('卡券清單還在載入時按「從清單選擇預收卡」不開啟', async () => {
    await prepare({}, { delays: { GET_TICKETS: 800 } })
    fireEvent.click(screen.getByTestId('couponSells'))
    fireEvent.click(button('從清單選擇預收卡'))
    expect(currentDialog()).toBeNull()
  })

  it('會員卡：價格欄非 Enter 按鍵不跳欄', async () => {
    await prepare()
    fireEvent.click(screen.getByTestId('memberShipCardSells'))
    fireEvent.change(screen.getByPlaceholderText('會員卡名稱/代號'), { target: { value: '金' } })
    fireEvent.click(await screen.findByTestId(`undefined-${MEMBERSHIP.name}`))
    const price = screen.getByTestId('memberShipCardSells-0-price')
    act(() => price.focus())
    fireEvent.keyDown(price, { key: 'a', keyCode: 65 })
    expect(price).toHaveFocus()
  })
})
