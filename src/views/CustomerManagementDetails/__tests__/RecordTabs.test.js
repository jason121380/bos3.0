// 保護顧客詳細的紀錄分頁：卡券購買／使用紀錄（只查這位顧客、使用紀錄帶 isUseTicket、各自分頁、金額四捨五入到小數 2 位）、
// 入金紀錄（入金餘額、由客人負擔手續費時實付＝入金＋手續費、合計、新增入金導頁、各自分頁）、紅利點數紀錄（餘額為點數加總、
// 新增連到帶顧客 id 的新增頁、勾選刪除後重新查詢）、簡訊（日期與時間以台灣時間）、抽獎券（依活動展開）、會員卡（依購買日新到舊、
// 無效期／無天數）。GraphQL 全由 testkit 的模擬 link 回應，不刪除真實資料。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf, currentLocation, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { renderDetails, CUSTOMER } from './detailsKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const choose = (select, text) => {
  const option = Array.from(select.querySelectorAll('option')).find(o => o.textContent === text)
  fireEvent.change(select, { target: { value: option.value } })
}
const card = title => screen.getByText(title).closest('.ui-root, [class*="rounded"]').parentElement

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

const TICKET = {
  id: 't1',
  price: 333.335,
  no: 'TK-01',
  order: { id: 'o-buy', date: new Date(2026, 8, 1, 23, 30).getTime(), no: 'A100', customer: { id: 'c1', name: '陳小姐', cellphone: '0912345678' }, designer: { id: 'd1', name: '王小美', designerNo: '01' } },
  service: { id: 's1', name: '護髮五次卡' },
  usageOrder: { id: 'o-use', no: 'A200', date: new Date(2026, 9, 21, 12).getTime() },
}

describe('卡券紀錄', () => {
  const fixtures = {
    GetTicket: v => ({
      ticketRecords: { data: [v.input.isUseTicket ? { ...TICKET, id: 't2', price: 66.666 } : TICKET], pageLimit: v.input.pageLimit, pageOffset: v.input.pageOffset, totalCount: 80 },
    }),
  }

  it('購買與使用紀錄：只查這位顧客（使用紀錄帶 isUseTicket），帳單連結、客戶、設計師、卡券、金額', async () => {
    const utils = renderDetails({ route: '/management/customers/c1/coupon', fixtures })
    await utils.settle()
    const inputs = callsOf(utils.calls, 'GetTicket').map(c => c.variables.input)
    expect(inputs).toEqual(
      expect.arrayContaining([
        { customerId: 'c1', pageLimit: 50, pageOffset: 0 },
        { customerId: 'c1', pageLimit: 50, pageOffset: 0, isUseTicket: true },
      ])
    )
    const bought = screen.getByText('卡券購買紀錄').closest('.ui-root').parentElement
    expect(within(bought).getByText('帳單詳情').closest('a')).toHaveAttribute('href', '/order/o-buy')
    ;['A100', '2026/09/01', '陳小姐 0912345678', '王小美 01', '護髮五次卡', '333.34'].forEach(t => expect(within(bought).getByText(t)).toBeInTheDocument())
    const used = screen.getByText('卡券使用紀錄').closest('.ui-root').parentElement
    const links = within(used).getAllByText('帳單詳細').map(a => a.closest('a').getAttribute('href'))
    expect(links).toEqual(['/order/o-use', '/order/o-buy'])
    ;['A200', '2026/10/21', 'TK-01', '66.67'].forEach(t => expect(within(used).getByText(t)).toBeInTheDocument())
  })

  // 卡券紀錄上方的「共 N 筆, 第幾頁/共幾頁」以後端的 totalCount 計算（原本用本頁筆數 results.length，
  // 80 筆時顯示「共 1 筆, 1 /1」；Jason 2026/10/22 fix all）
  it('筆數與總頁數以總筆數計算；各自換頁與改每頁筆數（改筆數回第一頁）', async () => {
    const utils = renderDetails({ route: '/management/customers/c1/coupon', fixtures })
    await utils.settle()
    expect(screen.getAllByText('共 80 筆, 1 /2')).toHaveLength(2)
    const [boughtNext, usedNext] = screen.getAllByLabelText('下一頁')
    fireEvent.click(boughtNext)
    await wait(() => expect(callsOf(utils.calls, 'GetTicket').pop().variables.input).toEqual({ customerId: 'c1', pageLimit: 50, pageOffset: 1 }))
    await utils.settle()
    choose(screen.getAllByLabelText('每頁筆數')[0], '10')
    await wait(() => expect(callsOf(utils.calls, 'GetTicket').pop().variables.input).toEqual({ customerId: 'c1', pageLimit: 10, pageOffset: 0 }))
    await utils.settle()
    fireEvent.click(screen.getAllByLabelText('下一頁')[1])
    await wait(() => expect(callsOf(utils.calls, 'GetTicket').pop().variables.input).toEqual({ customerId: 'c1', pageLimit: 50, pageOffset: 1, isUseTicket: true }))
    await utils.settle()
    choose(screen.getAllByLabelText('每頁筆數')[1], '25')
    await wait(() => expect(callsOf(utils.calls, 'GetTicket').pop().variables.input).toEqual({ customerId: 'c1', pageLimit: 25, pageOffset: 0, isUseTicket: true }))
    expect(usedNext).toBeTruthy()
  })

  it('後端沒有回總筆數時顯示共 0 筆', async () => {
    const utils = renderDetails({
      route: '/management/customers/c1/coupon',
      fixtures: { GetTicket: { ticketRecords: { data: [TICKET], pageLimit: 50, pageOffset: 0, totalCount: null } } },
    })
    await utils.settle()
    expect(screen.getAllByText('共 0 筆, 1 /0')).toHaveLength(2)
  })

  it('沒有資料（後端回 null）時不顯示表格；載入中顯示佔位', async () => {
    renderDetails({ route: '/management/customers/c1/coupon', fixtures: { GetTicket: { ticketRecords: { data: null } } }, delays: { GetTicket: 2000 } })
    expect(await screen.findByLabelText('載入中')).toBeInTheDocument()
    await wait(() => expect(screen.queryByLabelText('載入中')).toBeNull())
    expect(screen.queryByText('卡券購買紀錄')).toBeNull()
  })
})

const DEPOSIT = {
  id: 'r1',
  date: new Date(2026, 9, 21, 23, 30).getTime(),
  money: 1000,
  Maker: { id: 'd1', name: '王小美', designerNo: '01' },
  Customer: { id: 'c1', name: '陳小姐', cellphone: '0912345678', no: 'C01' },
  payType: '信用卡',
  remark: '週年慶',
  handlingFeeDecountWay: 'BYCUSTOMER',
  handlingFeeDecountPrice: -30,
}
const USE = { id: 'u1', orderNo: 'A001', date: new Date(2026, 9, 20, 12).getTime(), money: 300, order: { id: 'o1' }, Customer: { id: 'c1', name: '陳小姐', cellphone: '0912345678' }, Designer: { id: 'd1', name: '王小美', designerNo: '01' } }

describe('入金紀錄', () => {
  const fixtures = {
    customerWallet: { customerWallet: 12500 },
    walletdepositrecord: {
      walletDepositRecord: {
        record: [
          DEPOSIT,
          { ...DEPOSIT, id: 'r2', money: 500, handlingFeeDecountWay: 'BYDESIGNER', handlingFeeDecountPrice: -10, Maker: { id: 'd2', name: 'Amy', designerNo: null }, remark: '' },
          { ...DEPOSIT, id: 'r3', money: 200, handlingFeeDecountWay: 'WITHOUTHANDLINGFEE', handlingFeeDecountPrice: 0, remark: '' },
        ],
        totalCount: 120,
      },
    },
    WALLET_USE_RECORD: { walletUseRecord: { record: [USE, { ...USE, id: 'u2', Designer: { id: 'd2', name: 'Amy', designerNo: null }, Customer: null, money: 150 }], totalCount: 60 } },
  }

  it('入金餘額、每筆入金（實付、負擔方、手續費）與合計；入金使用與合計；新增入金導到新增頁', async () => {
    const utils = renderDetails({ route: '/management/customers/c1/topup', fixtures })
    await utils.settle()
    expect(callsOf(utils.calls, 'customerWallet')[0].variables).toEqual({ customerId: 'c1' })
    expect(callsOf(utils.calls, 'walletdepositrecord')[0].variables.input).toEqual({ pageLimit: 50, pageOffset: 0, customerId: 'c1' })
    expect(callsOf(utils.calls, 'WALLET_USE_RECORD')[0].variables.input).toEqual({ pageLimit: 50, pageOffset: 0, customerId: 'c1' })
    expect(screen.getByText('12,500')).toBeInTheDocument()
    const r1 = screen.getByText('週年慶').closest('tr')
    expect(within(r1).getByText('編輯').closest('a')).toHaveAttribute('href', '/topup/edit/r1')
    ;['2026/10/21', '陳小姐', '0912345678', '1,030', '1,000', '信用卡', '由客人負擔', '-30'].forEach(t => expect(within(r1).getByText(t)).toBeInTheDocument())
    expect(r1).toHaveTextContent('王小美 / 01')
    expect(screen.getByText('由設計師負擔')).toBeInTheDocument()
    expect(screen.getByText('不扣項')).toBeInTheDocument()
    const totals = screen.getAllByText('合計').map(el => el.closest('tr'))
    expect(within(totals[0]).getByText('1,700')).toBeInTheDocument()
    expect(within(totals[1]).getByText('450')).toBeInTheDocument()
    expect(screen.getByText(/共 120 筆資料/)).toHaveTextContent('共 120 筆資料,1/3')
    const u1 = screen.getAllByText('A001')[0].closest('tr')
    expect(within(u1).getByText('帳單詳情').closest('a')).toHaveAttribute('href', '/order/o1')
    expect(u1).toHaveTextContent('王小美 / 01')
    fireEvent.click(screen.getByText('新增入金'))
    expect(currentLocation()).toBe('/topup/create')
  })

  // 入金使用上方的總頁數以總筆數計算（原本用本頁筆數 record.length，60 筆時顯示「1/1」）；改每頁筆數時回第一頁
  // （比照卡券紀錄；Jason 2026/10/22 fix all）
  it('入金使用總頁數以總筆數計算；兩表各自換頁、改每頁筆數回第一頁', async () => {
    const utils = renderDetails({ route: '/management/customers/c1/topup', fixtures })
    await utils.settle()
    expect(screen.getByText(/共 60 筆資料/)).toHaveTextContent('共 60 筆資料, 1/2')
    const [depositNext, useNext] = screen.getAllByLabelText('下一頁')
    fireEvent.click(depositNext)
    await wait(() => expect(callsOf(utils.calls, 'walletdepositrecord').pop().variables.input.pageOffset).toBe(1))
    choose(screen.getAllByLabelText('每頁筆數')[0], '10')
    await wait(() => expect(callsOf(utils.calls, 'walletdepositrecord').pop().variables.input).toMatchObject({ pageLimit: 10, pageOffset: 0 }))
    fireEvent.click(useNext)
    await wait(() => expect(callsOf(utils.calls, 'WALLET_USE_RECORD').pop().variables.input.pageOffset).toBe(1))
    choose(screen.getAllByLabelText('每頁筆數')[1], '25')
    await wait(() => expect(callsOf(utils.calls, 'WALLET_USE_RECORD').pop().variables.input).toMatchObject({ pageLimit: 25, pageOffset: 0 }))
  })

  it('入金紀錄查詢失敗時表格為空、不壞頁', async () => {
    const utils = renderDetails({
      route: '/management/customers/c1/topup',
      fixtures: { ...fixtures, walletdepositrecord: new Error('查詢失敗'), WALLET_USE_RECORD: new Error('查詢失敗') },
    })
    await utils.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('入金餘額')).toBeInTheDocument()
    expect(screen.getByText('入金使用')).toBeInTheDocument()
  })

  // 入金餘額查詢失敗時餘額顯示 0、不整頁錯誤（錯誤提示由 init-apollo 的 errorLink 統一顯示；
  // 原本 effect 直接讀 data.customerWallet 拋錯；Jason 2026/10/22 fix all）
  it('入金餘額查詢失敗：餘額顯示 0，紀錄照常顯示', async () => {
    const utils = renderDetails({ route: '/management/customers/c1/topup', fixtures: { ...fixtures, customerWallet: new Error('查詢失敗') } })
    await utils.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('入金餘額').nextElementSibling.textContent).toBe('0')
    expect(screen.getByText('週年慶')).toBeInTheDocument()
  })
})

describe('紅利點數紀錄', () => {
  const RECORDS = [
    { id: 'b1', customerName: '陳小姐', customerNo: 'C01', date: new Date(2026, 9, 21, 23, 50).getTime(), bonus: 1200, designerName: '王小美', remark: '消費回饋' },
    { id: 'b2', customerName: '陳小姐', customerNo: 'C01', date: new Date(2026, 9, 1).getTime(), bonus: -200, designerName: 'Amy', remark: '' },
  ]
  const fixtures = { GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: RECORDS }, DELETE_BONUS_DEPOSIT: { deleteBonusDeposit: true } }
  const toolbar = () => screen.getByRole('toolbar', { hidden: true })

  it('餘額為點數加總；每筆紀錄與編輯連結；新增連到帶顧客 id 的新增頁', async () => {
    const utils = renderDetails({ route: '/management/customers/c1/bonus', fixtures })
    await utils.settle()
    expect(screen.getByText('1,000')).toBeInTheDocument()
    expect(screen.getByText('共 2 筆資料')).toBeInTheDocument()
    expect(screen.getByText('新增紅利點數').closest('a')).toHaveAttribute('href', '/customer-bonus-record/create/c1')
    const [r1] = screen.getAllByTestId('category-row')
    ;['2026/10/21', 'C01', '陳小姐', '1,200', '王小美', '消費回饋'].forEach(t => expect(within(r1).getByText(t)).toBeInTheDocument())
    expect(within(r1).getByText('編輯').closest('a')).toHaveAttribute('href', '/customer-bonus-record/edit/b1')
  })

  it('勾選（單筆、全選、取消）後刪除：送出勾選的 id，成功清除勾選並重新查詢紅利紀錄', async () => {
    const utils = renderDetails({ route: '/management/customers/c1/bonus', fixtures })
    await utils.settle()
    const [one, two] = screen.getAllByLabelText('選取此筆')
    fireEvent.click(one)
    expect(screen.getByLabelText('全選').indeterminate).toBe(true)
    fireEvent.click(screen.getByLabelText('全選'))
    expect(two).toBeChecked()
    fireEvent.click(screen.getByLabelText('全選'))
    expect(one).not.toBeChecked()
    fireEvent.click(two)
    fireEvent.click(one)
    fireEvent.click(one)
    const before = callsOf(utils.calls, 'GET_CUSTOMER_BONUS_RECORD').length
    fireEvent.click(within(toolbar()).getByText('刪除'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除成功', variant: 'success' }))
    expect(callsOf(utils.calls, 'DELETE_BONUS_DEPOSIT')[0].variables).toEqual({ bonusId: ['b2'] })
    await wait(() => expect(callsOf(utils.calls, 'GET_CUSTOMER_BONUS_RECORD').length).toBeGreaterThan(before))
    expect(screen.getAllByLabelText('選取此筆')[1]).not.toBeChecked()
  })

  it('刪除：後端回 false 提示失敗，錯誤以訊息提示', async () => {
    const utils = renderDetails({ route: '/management/customers/c1/bonus', fixtures: { ...fixtures, DELETE_BONUS_DEPOSIT: { deleteBonusDeposit: false } } })
    await utils.settle()
    fireEvent.click(screen.getAllByLabelText('選取此筆')[0])
    fireEvent.click(within(toolbar()).getByText('刪除'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除失敗', variant: 'warning' }))
    cleanup()
    const errored = renderDetails({ route: '/management/customers/c1/bonus', fixtures: { ...fixtures, DELETE_BONUS_DEPOSIT: new Error('已被使用') } })
    await errored.settle()
    fireEvent.click(screen.getAllByLabelText('選取此筆')[0])
    fireEvent.click(within(toolbar()).getByText('刪除'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '已被使用', variant: 'error' }))
  })

  it('沒有紀錄（開啟紅利時仍有分頁）：餘額 0、全選不勾；紀錄重新查詢中顯示載入佔位', async () => {
    const utils = renderDetails({ route: '/management/customers/c1/bonus', fixtures: { GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: true } } })
    await utils.settle()
    expect(screen.getByText('共 0 筆資料')).toBeInTheDocument()
    expect(screen.getByLabelText('全選')).not.toBeChecked()
  })
})

describe('簡訊、抽獎券、會員卡', () => {
  it('簡訊：日期、時間（台灣時間）、手機、內容；沒有紀錄顯示無資料', async () => {
    const utils = renderDetails({
      route: '/management/customers/c1/SMS',
      fixtures: { GET_CUSTOMER_SMS_RECORD: { customerSMSRecord: [{ date: new Date(2026, 9, 21, 9, 5).getTime(), cellphone: '0912345678', message: '您的預約已確認' }] } },
    })
    await utils.settle()
    const row = screen.getByText('您的預約已確認').closest('tr')
    ;['2026/10/21', '9:05', '0912345678'].forEach(t => expect(within(row).getByText(t)).toBeInTheDocument())
    cleanup()
    const empty = renderDetails({ route: '/management/customers/c1/SMS' })
    await empty.settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
  })

  it('簡訊查詢中顯示空清單（不壞頁）', async () => {
    renderDetails({ route: '/management/customers/c1/SMS', delays: { GET_CUSTOMER_SMS_RECORD: 200 } })
    expect(await screen.findByText('無資料')).toBeInTheDocument()
  })

  it('抽獎券：依活動列出，有券的活動點開顯示流水號、發券日、店家，再點收合；沒有券的活動不展開', async () => {
    const utils = renderDetails({
      route: '/management/customers/c1/EventTicketsRecord',
      fixtures: {
        GET_CUSTOMER_EVENT_TICKETS_FOR_MERCHANT: {
          customerEventTicketsForMerchant: [
            { eventName: '週年慶抽獎', tickets: [{ serialNumber: 'SN-1', consumptionDate: new Date(2026, 9, 21, 23).getTime(), consumptionStoreName: '信義店' }] },
            { eventName: '已結束活動', tickets: [] },
          ],
        },
      },
      delays: { GET_CUSTOMER_EVENT_TICKETS_FOR_MERCHANT: 2000 },
    })
    // 載入中先顯示佔位
    expect(await screen.findByLabelText('載入中')).toBeTruthy()
    await utils.settle()
    expect(screen.queryByText('SN-1')).toBeNull()
    fireEvent.click(screen.getByText('週年慶抽獎'))
    expect(screen.getByText('SN-1')).toBeInTheDocument()
    expect(screen.getByText('2026/10/21')).toBeInTheDocument()
    expect(screen.getByText('信義店')).toBeInTheDocument()
    fireEvent.click(screen.getByText('週年慶抽獎'))
    expect(screen.queryByText('SN-1')).toBeNull()
    fireEvent.click(screen.getByText('已結束活動'))
    expect(screen.queryByText('流水號')).toBeNull()
  })

  it('抽獎券：沒有資料顯示無資料', async () => {
    const utils = renderDetails({ route: '/management/customers/c1/EventTicketsRecord' })
    await utils.settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
  })

  it('會員卡：依購買日新到舊；沒有到期日顯示無效期、沒有天數顯示無；沒有紀錄顯示無資料', async () => {
    const utils = renderDetails({
      route: '/management/customers/c1/membership',
      fixtures: {
        GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
        FETCH_CUSTOMER_DETAIL: {
          customer: {
            ...CUSTOMER,
            membershipPurchaseRecord: [
              { membershipName: '舊卡', purchaseDate: new Date(2025, 0, 1).getTime(), expiryDay: new Date(2025, 11, 31).getTime(), validityDay: 365, remark: '續約' },
              { membershipName: '金卡', purchaseDate: new Date(2026, 9, 21, 23).getTime(), expiryDay: null, validityDay: null, remark: null },
            ],
          },
        },
      },
    })
    await utils.settle()
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows[0]).toHaveTextContent('金卡2026/10/21無效期無')
    expect(rows[1]).toHaveTextContent('舊卡2025/01/012025/12/31365續約')
    cleanup()
    const empty = renderDetails({ route: '/management/customers/c1/membership', fixtures: { GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true } } })
    await empty.settle()
    expect(screen.getByText('無資料')).toBeInTheDocument()
  })
})
