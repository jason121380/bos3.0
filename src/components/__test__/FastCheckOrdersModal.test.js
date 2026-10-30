// 保護：打帳單四頁的「帳單速查」彈窗——櫃台結帳前核對當日帳單。
// 開啟時才以帳單日期（當天 00:00～23:59:59.999）、未預約帳單查詢；可依服務人員、指定／不指定篩選，重設回到全部；
// 表格各欄金額（營業現金應收、服務／店販消費、卡券、第三方、其他付款、入金、點數）與合計列要對；
// 會員卡、點數欄只在功能開啟或該期間有金額時顯示；點編輯跳到該帳單並關閉彈窗。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { endOfDay, startOfDay } from 'date-fns'
import React from 'react'

import { callsOf, currentLocation, renderPage } from '__tests__/testkit.test'
import FastCheckOrdersModal from 'components/FastCheckOrdersModal'

afterEach(cleanup)

const DAY = new Date(2026, 9, 21, 15, 0).getTime()
const order = (over = {}) => ({
  id: 'o1',
  no: 'A001',
  isDesignate: true,
  businessCash: 1234.4,
  serviceFakeTotal: 1000.6,
  productFakeTotal: 300,
  membershipFakeTotal: 500,
  useTicketTotal: 120.996,
  ticketSellIntoPerformance: 200,
  performanceIncome: 1500,
  ticketSellNotIntoPerformance: 50,
  usedTicketForDecount: 80.509,
  thirdPartTicketForDecount: 100,
  otherPayWayForDecount: 60,
  walletUsedForDecount: 40,
  bonusDecountForReport: 10,
  payType2: 'LINE Pay',
  remark: '常客',
  source: '現場',
  customer: { name: '王小明' },
  designer: { name: '設計師甲' },
  serviceOrders: [{ thirdPartyPayName: '街口' }, { thirdPartyPayName: null }, { thirdPartyPayName: '悠遊付' }],
  productOrders: [{ thirdPartyPayName: '街口' }, { thirdPartyPayName: null }, { thirdPartyPayName: '全支付' }],
  membershipOrders: [{ thirdPartyPayName: '街口' }, { thirdPartyPayName: null }, { thirdPartyPayName: '悠遊付' }],
  ...over,
})
const summary = {
  service: 1001,
  product: 300,
  usedTicket: 121,
  membership: 500,
  ticketSellIntoPerformance: 200,
  performanceIncome: 1500,
  ticketSellNotIntoPerformance: 50,
  usedTicketForDecount: 80,
  thirdPartTicketForDecount: 100,
  otherPayWayForDecount: 60,
  walletUsedForDecount: 40,
  businessCash: 1234,
  bonusDecountForReport: 10,
}
const users = [{ userId: 'u1', userName: '設計師甲', userNickName: '', userNo: '1' }]
const fixturesWith = ({ orders = [order()], intervalSummary = summary, membershipActive = true, bonusActive = true } = {}) => ({
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: membershipActive },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: bonusActive },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: users },
  FETCH_ORDERS_FOR_FAST_CHECK: { orders: { orders, intervalSummary } },
})

function Harness({ initialOpen = true, date = DAY, onClose = () => {} }) {
  const [open, setOpen] = React.useState(initialOpen)
  const [d, setD] = React.useState(date)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        開啟速查
      </button>
      <button type="button" onClick={() => setD(new Date(2026, 9, 22, 9).getTime())}>
        改帳單日期
      </button>
      <FastCheckOrdersModal
        open={open}
        date={d}
        setOpenModal={v => {
          onClose(v)
          setOpen(v)
        }}
      />
    </>
  )
}

const fastCheckInputs = calls => callsOf(calls, 'FETCH_ORDERS_FOR_FAST_CHECK').map(c => c.variables.input)

describe('FastCheckOrdersModal 帳單速查', () => {
  it('關閉時不查詢；開啟後以帳單當天、未預約帳單查詢，載入中顯示轉圈', async () => {
    const { settle, calls } = renderPage(<Harness initialOpen={false} />, { fixtures: fixturesWith(), delays: { FETCH_ORDERS_FOR_FAST_CHECK: 30 } })
    await settle()
    expect(fastCheckInputs(calls)).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: '開啟速查' }))
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('帳單速查')
    expect(dialog.querySelector('.animate-spin')).not.toBeNull()
    expect(within(dialog).getByRole('button', { name: '重設' })).toBeDisabled()
    await settle()
    expect(fastCheckInputs(calls)[0]).toEqual({
      startDate: startOfDay(DAY).getTime(),
      endDate: endOfDay(DAY).getTime(),
      employeeId: '',
      isReserved: false,
      isDesignate: null,
    })
  })

  it('表格列出帳單與合計；金額四捨五入、卡券金額無條件捨去到小數 2 位；第三方付款列出「含 …」；會員卡與點數欄在功能開啟時顯示', async () => {
    const { settle } = renderPage(<Harness />, { fixtures: fixturesWith() })
    await settle()
    const table = await screen.findByRole('table')
    const [head, row, total] = within(table).getAllByRole('row')
    expect(head).toHaveTextContent('會員卡販賣')
    expect(head).toHaveTextContent('點數折抵金額(-)')
    const cells = within(row)
      .getAllByRole('cell')
      .map(c => c.textContent)
    expect(cells.slice(1, 6)).toEqual(['A001', '王小明', '設計師甲', 'Y', '1,234'])
    expect(cells[6]).toBe('1,001含 街口, 含 悠遊付')
    expect(cells[7]).toBe('300含 街口, 含 全支付')
    expect(cells[8]).toBe('500含 街口, 含 悠遊付')
    expect(cells.slice(9, 14)).toEqual(['120.99', '200', '1,500', '50', '80.5'])
    // 第三方：服務與店販的第三方名稱合併、不重複
    expect(cells[14]).toBe('100含 街口, 含 悠遊付, 含 全支付')
    expect(cells.slice(15)).toEqual(['60LINE Pay', '40', '10', '常客', '現場'])
    const totals = within(total)
      .getAllByRole('cell')
      .map(c => c.textContent)
    expect(totals.slice(4)).toEqual(['合計', '1,234', '1,001', '300', '500', '121', '200', '1,500', '50', '80', '100', '60', '40', '10', ''])
  })

  it('會員卡、點數功能關閉且期間金額為 0 時不顯示該欄；不指定帳單顯示 N；沒有第三方付款時不顯示「含」', async () => {
    const plain = order({ isDesignate: false, serviceOrders: [], productOrders: [], membershipOrders: [] })
    const { settle } = renderPage(<Harness />, {
      fixtures: fixturesWith({
        orders: [plain],
        intervalSummary: { ...summary, membership: 0, bonusDecountForReport: 0 },
        membershipActive: false,
        bonusActive: false,
      }),
    })
    await settle()
    const table = await screen.findByRole('table')
    const [head, row] = within(table).getAllByRole('row')
    expect(head).not.toHaveTextContent('會員卡販賣')
    expect(head).not.toHaveTextContent('點數折抵金額')
    expect(row).toHaveTextContent('N')
    expect(row).not.toHaveTextContent('含')
  })

  it('功能關閉但期間有會員卡／點數金額時仍顯示該欄；合計缺值時顯示 0', async () => {
    const { settle } = renderPage(<Harness />, {
      fixtures: fixturesWith({ intervalSummary: { membership: 5, bonusDecountForReport: 3 }, membershipActive: false, bonusActive: false }),
    })
    await settle()
    const table = await screen.findByRole('table')
    const [head, , total] = within(table).getAllByRole('row')
    expect(head).toHaveTextContent('會員卡販賣')
    expect(head).toHaveTextContent('點數折抵金額(-)')
    expect(
      within(total)
        .getAllByRole('cell')
        .map(c => c.textContent)
        .slice(5, 9)
    ).toEqual(['0', '0', '0', '5'])
  })

  it('會員卡功能開啟但期間合計沒有會員卡欄位值時顯示 0', async () => {
    const { settle } = renderPage(<Harness />, { fixtures: fixturesWith({ intervalSummary: { membership: null, bonusDecountForReport: 0 } }) })
    await settle()
    const table = await screen.findByRole('table')
    const total = within(table).getAllByRole('row').pop()
    expect(
      within(total)
        .getAllByRole('cell')
        .map(c => c.textContent)[8]
    ).toBe('0')
  })

  // 已修正（Jason 2026/10/22 fix all）：第三方卡券欄的「含 …」原本只有服務與店販「都有」項目時才顯示（&&），
  // 只有服務或只有店販用第三方券的帳單不會列出；改為任一邊有項目就列出（||）
  it('只有服務或只有店販項目時，第三方卡券欄也列出第三方名稱；都沒有項目時只顯示金額', async () => {
    const onlyService = order({ id: 'o-s', productOrders: [] })
    const onlyProduct = order({ id: 'o-p', serviceOrders: [] })
    const neither = order({ id: 'o-n', serviceOrders: [], productOrders: [] })
    const { settle } = renderPage(<Harness />, { fixtures: fixturesWith({ orders: [onlyService, onlyProduct, neither] }) })
    await settle()
    const table = await screen.findByRole('table')
    const rows = within(table).getAllByRole('row')
    const thirdPartyCell = i => within(rows[i]).getAllByRole('cell')[14].textContent
    expect(thirdPartyCell(1)).toBe('100含 街口, 含 悠遊付')
    expect(thirdPartyCell(2)).toBe('100含 街口, 含 全支付')
    expect(thirdPartyCell(3)).toBe('100')
  })

  it('沒有帳單顯示無資料', async () => {
    const { settle } = renderPage(<Harness />, { fixtures: fixturesWith({ orders: [] }) })
    await settle()
    expect(await screen.findByText('無資料')).toBeInTheDocument()
  })

  it('篩選指定／不指定、服務人員、日期都會重新查詢；重設回到全部', async () => {
    const { settle, calls } = renderPage(<Harness />, { fixtures: fixturesWith() })
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '指定' }))
    await settle()
    expect(fastCheckInputs(calls).pop().isDesignate).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: '不指定' }))
    await settle()
    expect(fastCheckInputs(calls).pop().isDesignate).toBe(false)

    const employee = within(screen.getByRole('dialog')).getAllByRole('combobox')[0]
    fireEvent.click(employee)
    fireEvent.click(screen.getAllByRole('option').find(o => o.textContent === '設計師甲-1'))
    await settle()
    expect(fastCheckInputs(calls).pop()).toEqual(expect.objectContaining({ employeeId: 'u1', isDesignate: false }))
    fireEvent.focusIn(employee)
    fireEvent.mouseDown(screen.getByRole('button', { name: '清除' }))
    await settle()
    expect(fastCheckInputs(calls).pop().employeeId).toBe('')

    fireEvent.click(screen.getByRole('button', { name: '起始時間' }))
    fireEvent.click(within(screen.getAllByRole('dialog').pop()).getByRole('gridcell', { name: '2026年10月18日' }))
    await settle()
    const changed = fastCheckInputs(calls).pop()
    expect(changed.startDate).toBe(startOfDay(new Date(2026, 9, 18)).getTime())
    expect(changed.endDate).toBe(endOfDay(new Date(2026, 9, 18)).getTime())

    fireEvent.click(screen.getByRole('button', { name: '重設' }))
    await settle()
    expect(fastCheckInputs(calls).pop()).toEqual(expect.objectContaining({ employeeId: '', isDesignate: null, startDate: startOfDay(DAY).getTime() }))
  })

  it('帳單日期改變時改查新的一天', async () => {
    const { settle, calls } = renderPage(<Harness />, { fixtures: fixturesWith() })
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '改帳單日期', hidden: true }))
    await settle()
    expect(fastCheckInputs(calls).pop().startDate).toBe(startOfDay(new Date(2026, 9, 22)).getTime())
  })

  it('點編輯跳到該帳單並關閉；關閉鈕與 Esc 都會關閉', async () => {
    const onClose = jest.fn()
    const { settle } = renderPage(<Harness onClose={onClose} />, { fixtures: fixturesWith() })
    await settle()
    fireEvent.click(await screen.findByRole('button', { name: '編輯帳單' }))
    expect(currentLocation()).toBe('/order/o1')
    expect(onClose).toHaveBeenLastCalledWith(false)
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    fireEvent.click(screen.getByRole('button', { name: '開啟速查' }))
    await settle()
    fireEvent.click(within(screen.getByRole('dialog')).getAllByRole('button', { name: '關閉' })[0])
    expect(onClose).toHaveBeenCalledTimes(2)
    fireEvent.click(screen.getByRole('button', { name: '開啟速查' }))
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})
