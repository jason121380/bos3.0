// 保護「重新開單」的店販銷售與預收卡販賣：重試前櫃檯可新增／刪除／清除列、選商品或卡券（自動完成或從清單選擇）、改價格數量，
// 金額彙總與「重試」送出的 productOrders／ticketOrders 要與畫面一致；只填了一半的店販列（缺服務人員或缺商品）不能送出，
// 要提示缺什麼；第三方卡券付的店販不收現金。
// GraphQL 全由 testkit 的模擬 link 回應，不連後端、不建立真實帳單。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf } from '../../../__tests__/testkit.test'
import {
  setupQueue, loaded, baseQueue, retry, summaryValue, pickOption, inputOf, panel, panelOf, fieldInput,
  DESIGNER, PRODUCT, TICKET,
} from './queueKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginAs())
afterEach(cleanup)

// 店販與會員卡的列共用同一組 data-testid，以區塊範圍區分
const products = () => panel('店販銷售')
const productRow = index => ({
  seller: () => inputOf(products().getByTestId(`merchantSsell-${index}-employee`)),
  product: () => inputOf(products().getByTestId(`merchantSsell-${index}-product`)),
  price: () => inputOf(products().getByTestId(`merchantSsell-${index}-price`)),
  count: () => inputOf(products().getByTestId(`merchantSsell-${index}-count`)),
})
const productButton = id => products().getByTestId(id)
const expand = title => fireEvent.click(within(panelOf(title)).getByRole('button', { expanded: false }))
const SHAMPOO_LIST = { ...PRODUCT, cost: 100, isAvailableForSale: true, productCategory: { id: 'pc-1', name: '洗護' } }
const productListFixtures = {
  undefined: { products: { totalCount: 2, pageOffset: 0, pageLimit: 50, data: [SHAMPOO_LIST, { ...SHAMPOO_LIST, id: 'p-off', name: '停售品', isAvailableForSale: false }] } },
  PRODUCT_CATEGORIES: { productCategories: [{ id: 'pc-1', name: '洗護' }] },
}

describe('重新開單：店販銷售', () => {
  it('展開後選服務人員與商品、改價格與數量：彙總跟著變，重試送出', async () => {
    const page = setupQueue()
    await loaded(page)
    // 佇列沒有店販：區塊收合
    expect(panelOf('店販銷售')).toHaveAttribute('data-state', 'closed')
    expand('店販銷售')
    expect(panelOf('店販銷售')).toHaveAttribute('data-state', 'open')
    const row = productRow(0)
    await pickOption(row.seller(), 'Amy-01')
    await pickOption(row.product(), 'P01 - 洗髮精 - 300')
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent('300'))
    fireEvent.change(row.count(), { target: { value: '3' } })
    fireEvent.change(row.price(), { target: { value: '250' } })
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent('750'))
    // 清空視為 0
    fireEvent.change(row.price(), { target: { value: '' } })
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent(/^0$/))
    fireEvent.change(row.price(), { target: { value: '250' } })
    const input = await retry(page.calls)
    expect(input.productOrders).toEqual([
      expect.objectContaining({ sellerId: DESIGNER.userId, productId: PRODUCT.id, price: 250, count: 3 }),
    ])
    expect(input.productOrders[0]).not.toHaveProperty('isLocked')
  })

  it('只選商品沒選服務人員：提示「請選擇店販的服務人員」，不送出', async () => {
    const page = setupQueue()
    await loaded(page)
    await pickOption(productRow(0).product(), 'P01 - 洗髮精 - 300')
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent('300'))
    fireEvent.click(screen.getByTestId('checkout'))
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇店販的服務人員', variant: 'error' })
    expect(callsOf(page.calls, 'FETCH_CREATE_ORDER')).toHaveLength(0)
  })

  it('只選服務人員沒選商品：提示「請選擇店販商品」，不送出', async () => {
    const page = setupQueue()
    await loaded(page)
    await pickOption(productRow(0).seller(), 'Amy-01')
    fireEvent.click(screen.getByTestId('checkout'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇店販商品', variant: 'error' }))
    expect(callsOf(page.calls, 'FETCH_CREATE_ORDER')).toHaveLength(0)
  })

  it('第三方卡券付的店販：顯示扣完後業績、不收現金；改回不用卡券後照常收現金', async () => {
    const page = setupQueue({
      queue: baseQueue({ productOrders: [{ sellerId: DESIGNER.userId, productId: PRODUCT.id, price: 300, count: 1, thirdPartyCouponMerchantId: null }] }),
      GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true },
    })
    await loaded(page)
    expect(summaryValue('現金應收')).toHaveTextContent('1,100')
    const ticket = fieldInput(products(), '第三方卡券')
    await pickOption(ticket, '團購券')
    expect(await screen.findByText('扣完後業績:270')).toBeInTheDocument()
    await wait(() => expect(summaryValue('現金應收')).toHaveTextContent('800'))
    const input = await retry(page.calls)
    expect(input.productOrders).toEqual([expect.objectContaining({ productId: PRODUCT.id, thirdPartyCouponMerchantId: 'tp-1' })])
  })

  it('取消第三方卡券後恢復收現金', async () => {
    const page = setupQueue({
      queue: baseQueue({ productOrders: [{ sellerId: DESIGNER.userId, productId: PRODUCT.id, price: 300, count: 1, thirdPartyCouponMerchantId: 'tp-1' }] }),
      GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true },
    })
    await loaded(page)
    expect(summaryValue('現金應收')).toHaveTextContent('800')
    const ticket = fieldInput(products(), '第三方卡券')
    fireEvent.focusIn(ticket)
    fireEvent.mouseDown(products().getByLabelText('清除'))
    await wait(() => expect(summaryValue('現金應收')).toHaveTextContent('1,100'))
  })

  it('新增、刪除、清除列：刪掉與清掉的店販不送出', async () => {
    const page = setupQueue({
      queue: baseQueue({ productOrders: [{ sellerId: DESIGNER.userId, productId: PRODUCT.id, price: 300, count: 2, thirdPartyCouponMerchantId: null }] }),
    })
    await loaded(page)
    expect(summaryValue('店販消費')).toHaveTextContent('600')
    fireEvent.click(productButton('merchantSsell-0-add'))
    const second = productRow(1)
    await pickOption(second.seller(), 'Amy-01')
    await pickOption(second.product(), 'P01 - 洗髮精 - 300')
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent('900'))
    // 清除第一列：第二列保留
    fireEvent.click(productButton('merchantSsell-0-clear'))
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent('300'))
    // 刪除第二列：剩下清空的第一列，沒有店販
    fireEvent.click(productButton('merchantSsell-1-delete'))
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent(/^0$/))
    expect(products().queryByTestId('merchantSsell-1-employee')).toBeNull()
    const input = await retry(page.calls)
    expect(input.productOrders).toEqual([])
  })

  it('只有一列時清除：該列回到空白', async () => {
    const page = setupQueue({
      queue: baseQueue({ productOrders: [{ sellerId: DESIGNER.userId, productId: PRODUCT.id, price: 300, count: 2, thirdPartyCouponMerchantId: null }] }),
    })
    await loaded(page)
    fireEvent.click(productButton('merchantSsell-0-clear'))
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent(/^0$/))
    expect(productRow(0).product()).toHaveValue('')
    expect(products().queryByTestId('merchantSsell-0-price')).toBeNull()
  })

  it('數量清空視為 0：該列不算進店販也不送出', async () => {
    const page = setupQueue({
      queue: baseQueue({ productOrders: [{ sellerId: DESIGNER.userId, productId: PRODUCT.id, price: 300, count: 2, thirdPartyCouponMerchantId: null }] }),
    })
    await loaded(page)
    fireEvent.change(productRow(0).count(), { target: { value: '' } })
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent(/^0$/))
    expect(productRow(0).count()).toHaveValue('0')
    const input = await retry(page.calls)
    expect(input.productOrders).toEqual([])
  })

  it('清掉已選的商品：該列不算金額，重試提示「請選擇店販商品」', async () => {
    const page = setupQueue({
      queue: baseQueue({
        productOrders: [
          { sellerId: DESIGNER.userId, productId: PRODUCT.id, price: 300, count: 2, thirdPartyCouponMerchantId: null },
          { sellerId: DESIGNER.userId, productId: PRODUCT.id, price: 300, count: 1, thirdPartyCouponMerchantId: null },
        ],
      }),
    })
    await loaded(page)
    expect(summaryValue('店販消費')).toHaveTextContent('900')
    fireEvent.focusIn(productRow(0).product())
    fireEvent.mouseDown(productRow(0).product().parentElement.querySelector('[aria-label="清除"]'))
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent(/^300$/))
    // 只剩這一列（清掉的列）時也不算金額
    fireEvent.click(productButton('merchantSsell-1-delete'))
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent(/^0$/))
    fireEvent.click(screen.getByTestId('checkout'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇店販商品', variant: 'error' }))
    expect(callsOf(page.calls, 'FETCH_CREATE_ORDER')).toHaveLength(0)
  })

  it('從清單選擇商品：只列可販售的商品，加入後帶入售價', async () => {
    const page = setupQueue(productListFixtures)
    await loaded(page)
    fireEvent.click(screen.getByLabelText('從清單選擇商品'))
    const dialog = within(await screen.findByRole('dialog'))
    expect(dialog.queryByText('停售品')).toBeNull()
    fireEvent.click(within(dialog.getByText('洗髮精').closest('tr')).getByRole('button', { name: '加入' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    await wait(() => expect(summaryValue('店販消費')).toHaveTextContent('300'))
    expect(productRow(0).product()).toHaveValue('洗髮精')
  })
})

const ticketRow = index => ({
  ticket: () => inputOf(screen.getByTestId(`couponSells-${index}-coupon`)),
  counts: () => screen.getAllByTestId(`couponSells-${index}-count`).map(inputOf),
  price: () => inputOf(screen.getByTestId(`couponSells-${index}-price`)),
})

describe('重新開單：預收卡販賣', () => {
  it('選卡券後帶入次數與售價；改次數、價格、張數、備註後彙總跟著變，重試送出', async () => {
    const page = setupQueue()
    await loaded(page)
    expect(panelOf('預收卡販賣')).toHaveAttribute('data-state', 'closed')
    expand('預收卡販賣')
    const row = ticketRow(0)
    await pickOption(row.ticket(), '護髮五次卡')
    await wait(() => expect(summaryValue('預收卡販賣')).toHaveTextContent('1,000'))
    const [available] = row.counts()
    expect(available).toHaveValue('5')
    fireEvent.change(available, { target: { value: '6' } })
    fireEvent.change(row.price(), { target: { value: '1200' } })
    fireEvent.change(ticketRow(0).counts()[1], { target: { value: '2' } })
    await wait(() => expect(summaryValue('預收卡販賣')).toHaveTextContent('2,400'))
    // 次數、張數清空時視為 1；價格清空視為 0
    fireEvent.change(ticketRow(0).counts()[0], { target: { value: '' } })
    expect(ticketRow(0).counts()[0]).toHaveValue('1')
    fireEvent.change(ticketRow(0).counts()[1], { target: { value: '' } })
    fireEvent.change(row.price(), { target: { value: '' } })
    await wait(() => expect(summaryValue('預收卡販賣')).toHaveTextContent(/^0$/))
    fireEvent.change(row.price(), { target: { value: '900' } })
    fireEvent.change(fieldInput(panel('預收卡販賣'), '備註'), { target: { value: '生日優惠' } })
    const input = await retry(page.calls)
    expect(input.ticketOrders).toEqual([
      expect.objectContaining({ serviceId: TICKET.id, availableCount: 1, price: 900, count: 1, remark: '生日優惠' }),
    ])
  })

  it('從清單選擇預收卡：依分類篩選、清除分類；加入後帶入，關閉清單', async () => {
    const page = setupQueue()
    await loaded(page)
    fireEvent.click(screen.getByLabelText('從清單選擇預收卡'))
    let dialog = within(await screen.findByRole('dialog'))
    expect(dialog.getByText('1張卡券')).toBeInTheDocument()
    fireEvent.click(dialog.getByRole('button', { name: '剪髮' }))
    await wait(() => expect(callsOf(page.calls, 'GET_TICKETS').pop().variables.categoryIds).toEqual(['cat-1']))
    fireEvent.click(dialog.getByRole('button', { name: '清除' }))
    await wait(() => expect(callsOf(page.calls, 'GET_TICKETS').pop().variables.categoryIds).toEqual([]))
    fireEvent.click(dialog.getAllByRole('button', { name: '關閉' })[0])
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())

    fireEvent.click(screen.getByLabelText('從清單選擇預收卡'))
    dialog = within(await screen.findByRole('dialog'))
    fireEvent.click(within(dialog.getByText('護髮五次卡').closest('tr')).getByRole('button', { name: '加入' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    await wait(() => expect(summaryValue('預收卡販賣')).toHaveTextContent('1,000'))
    const input = await retry(page.calls)
    expect(input.ticketOrders).toEqual([expect.objectContaining({ serviceId: TICKET.id, availableCount: 5, price: 1000 })])
  })

  it('卡券清單還在載入時「從清單選擇預收卡」不開啟', async () => {
    const page = setupQueue({}, { delays: { GET_TICKETS: 1500 } })
    await screen.findByText(/重新開單 \(A777\)/)
    fireEvent.click(await screen.findByLabelText('從清單選擇預收卡'))
    expect(screen.queryByRole('dialog')).toBeNull()
    await page.settle()
    fireEvent.click(screen.getByLabelText('從清單選擇預收卡'))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('新增、刪除、清除列：刪掉與清掉的卡券不送出', async () => {
    const page = setupQueue({
      queue: baseQueue({ ticketOrders: [{ serviceId: TICKET.id, availableCount: 5, price: 1000, count: 1, remark: '', intoPerformanceWhileBuying: false }] }),
    })
    await loaded(page)
    expect(summaryValue('預收卡販賣')).toHaveTextContent('1,000')
    // 第一列沒有刪除鈕
    expect(screen.queryByTestId('couponSells-0-delete')).toBeNull()
    fireEvent.click(screen.getByTestId('couponSells-0-add'))
    await pickOption(ticketRow(1).ticket(), '護髮五次卡')
    await wait(() => expect(summaryValue('預收卡販賣')).toHaveTextContent('2,000'))
    fireEvent.click(screen.getByTestId('couponSells-0-clear'))
    await wait(() => expect(summaryValue('預收卡販賣')).toHaveTextContent('1,000'))
    fireEvent.click(screen.getByTestId('couponSells-1-delete'))
    await wait(() => expect(summaryValue('預收卡販賣')).toHaveTextContent(/^0$/))
    // 只剩一列時清除：回到空白
    fireEvent.click(screen.getByTestId('couponSells-0-clear'))
    expect(ticketRow(0).ticket()).toHaveValue('')
    expect(screen.getByTestId('checkout')).not.toBeDisabled()
    const input = await retry(page.calls)
    expect(input.ticketOrders).toEqual([])
  })
})
