// 保護「入金管理」：預設查本月 1 日到今天（台灣時間）的入金紀錄與入金使用，日期／篩選（設計師、顧客、付款方式）改變時重新查詢；
// 入金紀錄的「實際付款金額」在由客人負擔手續費時為入金＋手續費，手續費負擔方文字、合計列與匯出檔一致；
// 入金使用列出帳單連結、顧客、設計師、金額與合計；兩表各自分頁；按編輯到入金編輯頁（上一頁照常回到編輯頁，不再被推回列表）；
// 匯出檔比照帳單列表：只有「客資遮罩」設定查詢成功且為 false 才匯出完整姓名與手機，否則遮罩。
// GraphQL 全由 testkit 的模擬 link 回應；日期選擇與篩選列另有測試，這裡以假元件代替。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { Route } from 'react-router-dom'
import { endOfDay, startOfMonth } from 'date-fns'
import { renderPage, loginAs, callsOf, currentLocation, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import TopUp from '..'

jest.setTimeout(20000)

jest.mock('components/DateSelector', () => ({ dateChange }) => (
  <button type="button" onClick={() => dateChange({ startDate: 100, endDate: 200 })}>
    選日期區間
  </button>
))
jest.mock('components/MerchantSearchBar/index', () => ({ values, onFilter }) => (
  <button type="button" onClick={() => onFilter({ ...values, employeeId: 'designer-1', customerId: 'customer-1', payWay: ['LINE Pay'] })}>
    套用篩選
  </button>
))

const DEPOSITS = [
  {
    id: 'r1',
    date: new Date(2026, 9, 21, 23, 30).getTime(),
    money: 1000,
    Maker: { id: 'd1', name: '王小美', designerNo: '01' },
    Customer: { id: 'c1', name: '陳小姐', cellphone: '0912345678', no: 'C01' },
    payType: '信用卡',
    remark: '週年慶',
    handlingFeeDecountWay: 'BYCUSTOMER',
    handlingFeeDecountPrice: -30,
  },
  {
    id: 'r2',
    date: new Date(2026, 9, 1, 0, 5).getTime(),
    money: 500,
    Maker: { id: 'd2', name: 'Amy', designerNo: null },
    Customer: { id: 'c2', name: '林先生', cellphone: '0922333444', no: null },
    payType: 'LINE Pay',
    remark: '',
    handlingFeeDecountWay: 'BYDESIGNER',
    handlingFeeDecountPrice: -10,
  },
  {
    id: 'r3',
    date: new Date(2026, 9, 2).getTime(),
    money: 200,
    Maker: { id: 'd1', name: '王小美', designerNo: '01' },
    Customer: { id: 'c1', name: '陳小姐', cellphone: '0912345678', no: 'C01' },
    payType: '現金',
    remark: '',
    handlingFeeDecountWay: 'WITHOUTHANDLINGFEE',
    handlingFeeDecountPrice: 0,
  },
]
const USES = [
  {
    id: 'u1',
    orderNo: 'A001',
    date: new Date(2026, 9, 21, 12).getTime(),
    money: 300,
    order: { id: 'o1' },
    Customer: { id: 'c1', name: '陳小姐', cellphone: '0912345678' },
    Designer: { id: 'd1', name: '王小美', designerNo: '01' },
  },
  {
    id: 'u2',
    orderNo: 'A002',
    date: new Date(2026, 9, 20, 12).getTime(),
    money: 150,
    order: { id: 'o2' },
    Customer: { id: 'c2', name: '林先生', cellphone: '0922333444' },
    Designer: { id: 'd2', name: 'Amy', designerNo: null },
  },
]

let history
const setup = (fixtures = {}) =>
  renderPage(
    <>
      <TopUp />
      <Route
        render={props => {
          history = props.history
          return null
        }}
      />
    </>,
    {
      fixtures: {
        walletdepositrecord: { walletDepositRecord: { record: DEPOSITS, totalCount: 120, pageLimit: 50, pageOffset: 0 } },
        WALLET_USE_RECORD: { walletUseRecord: { record: USES, totalCount: 60, pageLimit: 50, pageOffset: 0 } },
        GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: false },
        ...fixtures,
      },
      route: '/topup',
    }
  )

const depositInput = calls => callsOf(calls, 'walletdepositrecord').pop().variables.input
const useInput = calls => callsOf(calls, 'WALLET_USE_RECORD').pop().variables.input
const card = title => screen.getByText(title, { selector: 'h2' }).closest('.ui-root')
const csvOf = title => decodeURIComponent(within(card(title)).getByText('報表匯出').closest('a').getAttribute('href'))
const choose = (select, text) => {
  const option = Array.from(select.querySelectorAll('option')).find(o => o.textContent === text)
  fireEvent.change(select, { target: { value: option.value } })
}

beforeEach(() => loginAs())
afterEach(cleanup)

describe('入金管理', () => {
  it('預設查本月 1 日至今天結束的入金紀錄與入金使用', async () => {
    const utils = setup()
    await utils.settle()
    const now = new Date()
    expect(depositInput(utils.calls)).toEqual({
      start: startOfMonth(now).getTime(),
      end: endOfDay(now).getTime(),
      pageLimit: 50,
      pageOffset: 0,
      designerId: '',
      customerId: '',
      payType: [],
    })
    expect(useInput(utils.calls)).toEqual({
      start: startOfMonth(now).getTime(),
      end: endOfDay(now).getTime(),
      pageLimit: 50,
      pageOffset: 0,
      designerId: '',
      customerId: '',
    })
    expect(screen.getByText('新增').closest('a')).toHaveAttribute('href', '/topup/create')
  })

  it('入金紀錄：實付金額、手續費負擔方、合計與匯出檔', async () => {
    const utils = setup()
    await utils.settle()
    const r1 = screen.getByText('週年慶').closest('tr')
    ;['2026/10/21', '陳小姐', '(C01)', '0912345678', '1030', '1000', '王小美', '01', '信用卡', '由客人負擔', '-30'].forEach(text =>
      expect(within(r1).getByText(text)).toBeInTheDocument()
    )
    const r2 = within(card('入金紀錄')).getByText('林先生').closest('tr')
    ;['500', '由設計師負擔', '-10'].forEach(text => expect(within(r2).getAllByText(text)[0]).toBeInTheDocument())
    expect(within(card('入金紀錄')).getByText('不扣項')).toBeInTheDocument()
    const total = within(card('入金紀錄')).getByText('合計').closest('tr')
    // 實付 1030 + 500 + 200、入金 1000 + 500 + 200、手續費 −30 + −10 + 0
    expect(within(total).getByText('1730')).toBeInTheDocument()
    expect(within(total).getByText('1700')).toBeInTheDocument()
    expect(within(total).getByText('-40')).toBeInTheDocument()
    await wait(() =>
      expect(csvOf('入金紀錄')).toContain('"2026/10/21","陳*姐(C01)/0912***678","1030","1000","王小美/01","信用卡","由客人負擔","-30","週年慶"')
    )
    const csv = csvOf('入金紀錄')
    expect(csv).toContain('"2026/10/01","林*生/0922***444","500","500","Amy/","LINE Pay","由設計師負擔","-10",""')
    expect(csv).not.toContain('0912345678')
    expect(csv).toContain('"現金","不扣項","0"')
    expect(csv).toContain('"合計","","1730","1700","","","","-40",""')
  })

  // 匯出檔的設計師代號讀 Designer.designerNo（原本讀不存在的 data.designerNo，匯出「王小美 / undefined」；Jason 2026/10/22 fix all）
  it('入金使用：帳單連結、顧客、設計師、金額與合計；匯出檔含設計師代號', async () => {
    const utils = setup()
    await utils.settle()
    const usage = card('入金使用')
    const u1 = within(usage).getByText('A001').closest('tr')
    expect(within(u1).getByText('帳單詳情').closest('a')).toHaveAttribute('href', '/order/o1')
    ;['2026/10/21', '陳小姐', '0912345678', '王小美 / 01', '300'].forEach(text => expect(within(u1).getByText(text)).toBeInTheDocument())
    expect(within(within(usage).getByText('A002').closest('tr')).getByText('Amy')).toBeInTheDocument()
    expect(within(within(usage).getByText('合計').closest('tr')).getByText('450')).toBeInTheDocument()
    await wait(() => expect(csvOf('入金使用')).toContain('"#A001-2026/10/21","陳*姐/0912***678","王小美 / 01","300"'))
    expect(csvOf('入金使用')).toContain('"#A002-2026/10/20","林*生/0922***444","Amy","150"')
    expect(csvOf('入金使用')).not.toContain('0912345678')
    expect(csvOf('入金使用')).toContain('"合計","","","450"')
  })

  it('日期區間與篩選改變時重新查詢；篩選區可開關', async () => {
    const utils = setup()
    await utils.settle()
    expect(screen.getByText('套用篩選').closest('[hidden]')).not.toBeNull()
    fireEvent.click(screen.getByText('篩選'))
    expect(screen.getByText('套用篩選').closest('[hidden]')).toBeNull()
    fireEvent.click(screen.getByText('選日期區間'))
    await wait(() => expect(depositInput(utils.calls)).toMatchObject({ start: 100, end: 200 }))
    fireEvent.click(screen.getByText('套用篩選'))
    await wait(() =>
      expect(depositInput(utils.calls)).toMatchObject({
        start: 100,
        end: 200,
        designerId: 'designer-1',
        customerId: 'customer-1',
        payType: ['LINE Pay'],
      })
    )
    expect(useInput(utils.calls)).toMatchObject({ designerId: 'designer-1', customerId: 'customer-1' })
  })

  it('兩個表格各自換頁與改每頁筆數', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.click(within(card('入金紀錄')).getByLabelText('下一頁'))
    await wait(() => expect(depositInput(utils.calls).pageOffset).toBe(1))
    choose(within(card('入金紀錄')).getByLabelText('每頁筆數'), '10')
    await wait(() => expect(depositInput(utils.calls).pageLimit).toBe(10))
    await utils.settle()
    fireEvent.click(within(card('入金使用')).getByLabelText('下一頁'))
    await wait(() => expect(useInput(utils.calls).pageOffset).toBe(1))
    choose(within(card('入金使用')).getByLabelText('每頁筆數'), '25')
    await wait(() => expect(useInput(utils.calls).pageLimit).toBe(25))
  })

  // 移除「上一頁落在 /topup/edit 就前進」的監聽：編輯頁儲存／刪除後改用 history.replace 回列表（TopUpEdit 測試），
  // 列表按上一頁照常往回，不再永遠離不開入金管理（Jason 2026/10/22 fix all）
  it('按編輯到入金編輯頁；回到列表後按上一頁照常回到上一頁、不被推回列表', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.click(within(screen.getByText('週年慶').closest('tr')).getByText('編輯'))
    expect(currentLocation()).toBe('/topup/edit/r1')
    history.push('/topup')
    const go = jest.spyOn(history, 'go')
    history.goBack()
    await wait(() => expect(currentLocation()).toBe('/topup/edit/r1'))
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(go).not.toHaveBeenCalled()
    expect(currentLocation()).toBe('/topup/edit/r1')
  })

  it('沒有資料時合計為 0、共 0 筆', async () => {
    const utils = setup({
      walletdepositrecord: { walletDepositRecord: { record: [], totalCount: null } },
      WALLET_USE_RECORD: { walletUseRecord: { record: [], totalCount: null } },
    })
    await utils.settle()
    expect(screen.getAllByText('共 0 筆')).toHaveLength(2)
  })

  // 查詢失敗時以空陣列處理：表格與匯出只有合計、不整頁錯誤（錯誤提示由 init-apollo 的 errorLink 統一顯示；
  // 原本匯出資料的 effect 直接 forEach 拋錯；Jason 2026/10/22 fix all）
  it('入金紀錄、入金使用查詢失敗：顯示空表格與合計 0，不整頁錯誤', async () => {
    const utils = setup({ walletdepositrecord: new Error('查詢失敗'), WALLET_USE_RECORD: new Error('查詢失敗') })
    await utils.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).not.toBeInTheDocument()
    expect(screen.getAllByText('共 0 筆')).toHaveLength(2)
    await wait(() => expect(csvOf('入金紀錄')).toContain('"合計","","0","0","","","","0",""'))
    expect(csvOf('入金使用')).toContain('"合計","","","0"')
  })

  // 匯出遮罩比照帳單列表（helper/exportCustomerMask；Jason 2026/10/22 同意）：設定為遮罩、查詢失敗或還沒回來都遮罩姓名與手機
  it.each([
    ['設定為遮罩', { getCustomerDataMarkedDefault: true }],
    ['設定查詢失敗', new Error('查詢失敗')],
  ])('%s：入金紀錄與入金使用的匯出檔遮罩顧客姓名與手機', async (_, fixture) => {
    const utils = setup({ GET_CUSTOMER_DATA_MARKED: fixture })
    await utils.settle()
    await wait(() => expect(csvOf('入金紀錄')).toContain('"2026/10/21","陳*姐(C01)/0912***678","1030"'))
    expect(csvOf('入金紀錄')).toContain('"林*生/0922***444"')
    expect(csvOf('入金紀錄')).not.toContain('0912345678')
    expect(csvOf('入金使用')).toContain('"#A001-2026/10/21","陳*姐/0912***678","王小美 / 01","300"')
    expect(csvOf('入金使用')).not.toContain('0922333444')
    // 畫面上的表格照常顯示完整資料
    expect(within(screen.getByText('週年慶').closest('tr')).getByText('0912345678')).toBeInTheDocument()
  })
})
