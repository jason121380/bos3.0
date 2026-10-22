// 保護「新增收借支紀錄」（高階收支）：
// - 先選收入／支出才出現科目等欄位；科目只列該收支類別且使用中的科目；科目、金額、收支類別、收付方式都有才可新增
// - 送出 createMoneyFlow 的 input：日期（網址 ?date= 帶入的台灣時間時間戳）、金額轉數字、收付方式、備註、科目 id 與名稱、
//   關係人（科目為「員工借支」才出現）；登錄者有選才送 userId
// - 成功：提示並導到高階收支列表；勾選「連續新增收借支」時改為重新載入新增頁（保留網址日期）
// - 失敗（GraphQL 錯誤或後端回 null）：提示錯誤、按鈕恢復可按
// - 從科目列表彈窗選科目；清除科目時提示「請選擇科目」
// - 鍵盤流程：日期欄按 Enter 跳到收入／支出（不開月曆），左右鍵切換收支，Enter 依序跳到科目→金額→（關係人）→登錄者→收付方式→備註快捷→備註；F8 送出
// - 收付方式設定為空時提示到設定頁新增
// GraphQL 全由 testkit 的模擬 link 回應，不建立真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import AccountingRecordCreate from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const DATE = new Date(2026, 9, 20, 10, 0).getTime()
const SUBJECTS = [
  { id: 'r1', number: '4101', name: '營業收入', inoutType: 'REVENUE', isUsing: true },
  { id: 'r2', number: '4102', name: '停用收入', inoutType: 'REVENUE', isUsing: false },
  { id: 'e1', number: '5101', name: '房租', inoutType: 'EXPENDITURE', isUsing: true },
  { id: 'e2', number: '5102', name: '員工借支', inoutType: 'EXPENDITURE', isUsing: true },
]
const USERS = [
  { id: 'u1', name: '店長', designerNo: 'A1' },
  { id: 'u2', name: '小美', designerNo: null },
]

const setup = (fixtures = {}, route = `/accounting/create?date=${DATE}`) =>
  renderPage(<AccountingRecordCreate />, {
    fixtures: {
      GET_ACCOUNTING_SUBJECTS: { accountingSubjects: SUBJECTS },
      GET_USERS_FOR_CREATE_PICKING: { users: { users: USERS } },
      GET_ACCOUNTING_TYPE: { getAccountingType: ['轉帳', '現金'] },
      CREATE_MONEY_FLOW: { createMoneyFlow: { id: 'm-1' } },
      ...fixtures,
    },
    route,
  })

beforeEach(() => loginAs())
afterEach(cleanup)

const field = label => screen.getAllByLabelText(label).find(el => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')
// 下拉選單的選項（不含原生 <select> 的 <option>）
const listOptions = () => screen.queryAllByRole('option').filter(o => o.tagName !== 'OPTION')
const options = label => {
  fireEvent.click(field(label))
  return listOptions().map(o => o.textContent)
}
const choose = (label, text) => {
  fireEvent.click(field(label))
  fireEvent.click(listOptions().find(o => o.textContent === text))
}
const toggle = text => screen.getByText(text, { selector: 'button' })
const submitButton = () => screen.getByText('新增', { selector: 'button' })
const enter = el => fireEvent.keyDown(el, { key: 'Enter' })
const sent = calls => callsOf(calls, 'CREATE_MONEY_FLOW')[0].variables.input

const fillRevenue = () => {
  fireEvent.click(toggle('收入'))
  choose('科目', '4101 營業收入')
  fireEvent.change(field('金額'), { target: { value: '1500' } })
}

describe('新增收借支紀錄（高階）', () => {
  it('選收入／支出前不顯示科目欄、不能新增；科目只列該類別且使用中的科目', async () => {
    const { settle } = setup()
    await settle()
    expect(screen.queryByLabelText('科目')).toBeNull()
    expect(submitButton()).toBeDisabled()
    fireEvent.click(toggle('收入'))
    expect(options('科目')).toEqual(['4101 營業收入'])
    fireEvent.keyDown(field('科目'), { key: 'Escape' })
    // 再按一次已選的收入不會取消選取（維持收入）
    fireEvent.click(toggle('收入'))
    expect(toggle('收入').getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(toggle('支出'))
    expect(options('科目')).toEqual(['5101 房租', '5102 員工借支'])
  })

  it('收入：送出日期、金額（數字）、收付方式、備註快捷、科目、登錄者；成功後導到列表', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(document.getElementById('date-picker')).toHaveValue('2026/10/20')
    fillRevenue()
    expect(submitButton()).not.toBeDisabled()
    expect(options('收付方式')).toEqual(['轉帳', '現金'])
    fireEvent.click(listOptions().find(o => o.textContent === '現金'))
    choose('登錄者', '店長-A1')
    // 備註快捷：第 2 個選項「廣告預收款」
    fireEvent.change(field('備註快捷鍵'), { target: { value: '1' } })
    expect(field('備註')).toHaveValue('廣告預收款')
    expect(document.activeElement).toBe(field('備註'))
    fireEvent.change(field('備註'), { target: { value: '廣告預收款－十月' } })
    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(calls, 'CREATE_MONEY_FLOW')).toHaveLength(1))
    expect(sent(calls)).toEqual({
      date: DATE,
      amount: 1500,
      walletType: '現金',
      remark: '廣告預收款－十月',
      accountingSubjectId: 'r1',
      accountingSubjectName: '營業收入',
      relationUserId: null,
      userId: 'u1',
    })
    await wait(() => expect(currentLocation()).toBe('/accounting/records'))
    expect(openSnackbar).toHaveBeenCalledWith({ message: '新增收借支成功', variant: 'success' })
  })

  it('支出選「員工借支」才出現關係人；沒選登錄者時不送 userId、收付方式預設轉帳', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(toggle('支出'))
    choose('科目', '5101 房租')
    expect(screen.queryByLabelText('關係人')).toBeNull()
    choose('科目', '5102 員工借支')
    expect(options('關係人')).toEqual(['店長-A1', '小美-(無代號)'])
    fireEvent.click(listOptions().find(o => o.textContent === '小美-(無代號)'))
    fireEvent.change(field('金額'), { target: { value: '3000' } })
    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(calls, 'CREATE_MONEY_FLOW')).toHaveLength(1))
    expect(sent(calls)).toEqual({
      date: DATE,
      amount: 3000,
      walletType: '轉帳',
      remark: '',
      accountingSubjectId: 'e2',
      accountingSubjectName: '員工借支',
      relationUserId: 'u2',
    })
  })

  it('從科目列表彈窗選科目（依目前收支類別列出），也可按關閉不選', async () => {
    const { settle } = setup()
    await settle()
    fireEvent.click(toggle('支出'))
    fireEvent.click(screen.getByLabelText('從科目列表選擇'))
    let dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText('支出科目')).toBeInTheDocument()
    expect(dialog.getByText('房租')).toBeInTheDocument()
    expect(dialog.queryByText('營業收入')).toBeNull()
    fireEvent.click(dialog.getAllByText('關閉')[0])
    expect(screen.queryByRole('dialog')).toBeNull()

    fireEvent.click(toggle('收入'))
    fireEvent.click(screen.getByLabelText('從科目列表選擇'))
    dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText('收入科目')).toBeInTheDocument()
    fireEvent.click(dialog.getByText('選擇'))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(field('科目')).toHaveValue('4101 營業收入')
    // 再開一次後以底部「關閉」關掉
    fireEvent.click(screen.getByLabelText('從科目列表選擇'))
    fireEvent.click(within(screen.getByRole('dialog')).getAllByText('關閉')[1])
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('清除已選的科目時提示「請選擇科目」，新增鈕維持原科目可按', async () => {
    const { settle } = setup()
    await settle()
    fillRevenue()
    fireEvent.focusIn(field('科目'))
    fireEvent.mouseDown(within(field('科目').closest('.ui-root')).getByRole('button', { name: '清除' }))
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇科目', variant: 'warning' })
  })

  it('新增失敗時提示錯誤、按鈕恢復可按；後端回 null 時提示「新增收借支失敗」', async () => {
    const { calls, settle } = setup({ CREATE_MONEY_FLOW: new Error('權限不足') })
    await settle()
    fillRevenue()
    fireEvent.click(submitButton())
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('權限不足') }))
    )
    await wait(() => expect(submitButton()).not.toBeDisabled())
    expect(currentLocation()).toBe(`/accounting/create?date=${DATE}`)
    cleanup()
    openSnackbar.mockClear()
    const second = setup({ CREATE_MONEY_FLOW: { createMoneyFlow: null } }, '/accounting/create')
    await second.settle()
    fillRevenue()
    fireEvent.click(submitButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '新增收借支失敗', variant: 'error' }))
    expect(callsOf(calls, 'CREATE_MONEY_FLOW')).toHaveLength(1)
  })

  describe('連續新增收借支', () => {
    const realLocation = window.location
    afterEach(() => {
      window.location = realLocation
    })
    const fakeLocation = () => {
      delete window.location
      window.location = { href: '' }
    }

    it('勾選後記住設定；成功後重新載入新增頁並保留網址日期；取消勾選後清除設定', async () => {
      const { settle } = setup()
      await settle()
      const box = screen.getByLabelText('連續新增收借支')
      expect(box.checked).toBe(false)
      fireEvent.click(box)
      expect(JSON.parse(localStorage.getItem('stayInCreateAccount'))).toBe(true)
      fillRevenue()
      fakeLocation()
      fireEvent.click(submitButton())
      await wait(() => expect(window.location.href).toBe(`/accounting/create?date=${DATE}`))
      window.location = realLocation
      fireEvent.click(box)
      expect(localStorage.getItem('stayInCreateAccount')).toBeNull()
    })

    it('之前勾選過（localStorage）時預設勾選；網址沒有日期時重新載入不帶日期', async () => {
      localStorage.setItem('stayInCreateAccount', true)
      const { settle } = setup({}, '/accounting/create')
      await settle()
      expect(screen.getByLabelText('連續新增收借支').checked).toBe(true)
      fillRevenue()
      fakeLocation()
      fireEvent.click(submitButton())
      await wait(() => expect(window.location.href).toBe('/accounting/create'))
    })
  })

  it('從月曆選日期：網址帶入新日期，送出該日期', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(document.getElementById('date-picker'))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('gridcell', { name: '2026年10月15日' }))
    await wait(() => expect(document.getElementById('date-picker')).toHaveValue('2026/10/15'))
    const picked = new Date(2026, 9, 15, 10, 0).getTime()
    expect(currentLocation()).toBe(`/accounting/create?date=${picked}`)
    fillRevenue()
    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(calls, 'CREATE_MONEY_FLOW')).toHaveLength(1))
    expect(sent(calls).date).toBe(picked)
  })

  describe('鍵盤操作', () => {
    it('日期欄按 Enter 跳到「收入」（尚未選或選收入時），不開月曆；選了支出則跳到「支出」', async () => {
      const { settle } = setup()
      await settle()
      // 自訂日期欄每次重繪都是新元素，每次重新取得
      const date = () => document.getElementById('date-picker')
      enter(date())
      expect(document.activeElement).toBe(toggle('收入'))
      expect(screen.queryByRole('dialog')).toBeNull()
      fireEvent.click(toggle('支出'))
      enter(date())
      expect(document.activeElement).toBe(toggle('支出'))
      // 其他按鍵不跳欄
      date().focus()
      fireEvent.keyDown(date(), { key: 'a' })
      expect(document.activeElement).toBe(date())
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('收支切換：右鍵選支出、左鍵選收入，Enter 跳到科目，其他按鍵不動作', async () => {
      const { settle } = setup()
      await settle()
      const group = toggle('收入').closest('[role="group"]')
      fireEvent.keyDown(group, { key: 'ArrowRight' })
      expect(toggle('支出').getAttribute('aria-pressed')).toBe('true')
      expect(document.activeElement).toBe(toggle('支出'))
      fireEvent.keyDown(group, { key: 'ArrowLeft' })
      expect(toggle('收入').getAttribute('aria-pressed')).toBe('true')
      expect(document.activeElement).toBe(toggle('收入'))
      fireEvent.keyDown(group, { key: 'Tab' })
      expect(document.activeElement).toBe(toggle('收入'))
      fireEvent.keyDown(group, { key: 'Enter' })
      expect(document.activeElement).toBe(field('科目'))
    })

    it('Enter 依序跳欄：科目→金額（全選）→登錄者→收付方式→備註快捷→備註；員工借支時金額後先到關係人', async () => {
      const { settle } = setup()
      await settle()
      fireEvent.click(toggle('收入'))
      fireEvent.focusIn(field('科目'))
      enter(field('科目'))
      expect(document.activeElement).toBe(field('金額'))
      fireEvent.change(field('金額'), { target: { value: '200' } })
      enter(field('金額'))
      expect(document.activeElement).toBe(field('登錄者'))
      enter(field('登錄者'))
      expect(document.activeElement).toBe(field('收付方式'))
      enter(field('收付方式'))
      expect(document.activeElement).toBe(field('備註快捷鍵'))
      enter(field('備註快捷鍵'))
      expect(document.activeElement).toBe(field('備註'))

      fireEvent.click(toggle('支出'))
      choose('科目', '5102 員工借支')
      expect(document.activeElement).toBe(field('金額'))
      enter(field('金額'))
      expect(document.activeElement).toBe(field('關係人'))
      enter(field('關係人'))
      expect(document.activeElement).toBe(field('登錄者'))
      // 選了登錄者自動跳到收付方式；選了收付方式自動跳到備註快捷
      choose('登錄者', '小美-(無代號)')
      expect(document.activeElement).toBe(field('收付方式'))
      choose('收付方式', '轉帳')
      expect(document.activeElement).toBe(field('備註快捷鍵'))
      // 選關係人後跳到登錄者
      choose('關係人', '店長-A1')
      expect(document.activeElement).toBe(field('登錄者'))
      // 非 Enter 不跳欄
      ;['登錄者', '金額', '關係人', '收付方式', '備註快捷鍵', '科目'].forEach(label => {
        field(label).focus()
        fireEvent.keyDown(field(label), { key: 'a' })
        expect(document.activeElement).toBe(field(label))
      })
    })

    it('各欄位取得焦點時記住目前位置；金額欄滾輪離開焦點', async () => {
      const { settle } = setup()
      await settle()
      fireEvent.click(toggle('收入'))
      ;['登錄者', '收付方式', '備註快捷鍵', '備註', '金額'].forEach(label => fireEvent.focusIn(field(label)))
      expect(document.activeElement).toBe(field('金額'))
      fireEvent.wheel(field('金額'))
      expect(document.activeElement).not.toBe(field('金額'))
      fireEvent.click(toggle('支出'))
      choose('科目', '5102 員工借支')
      fireEvent.focusIn(field('關係人'))
      expect(document.activeElement).toBe(field('關係人'))
    })

    it('按 F8 送出（科目、金額、收支類別都有才送）', async () => {
      const { calls, settle } = setup()
      await settle()
      fireEvent.keyDown(window, { key: 'F8' })
      fireEvent.click(toggle('收入'))
      choose('科目', '4101 營業收入')
      fireEvent.keyDown(window, { key: 'F8' })
      fireEvent.keyDown(window, { key: 'F9' })
      expect(callsOf(calls, 'CREATE_MONEY_FLOW')).toHaveLength(0)
      fireEvent.change(field('金額'), { target: { value: '800' } })
      fireEvent.keyDown(window, { key: 'F8' })
      await wait(() => expect(callsOf(calls, 'CREATE_MONEY_FLOW')).toHaveLength(1))
      expect(sent(calls)).toMatchObject({ amount: 800, accountingSubjectId: 'r1', walletType: '轉帳' })
    })

    it('已知缺口（待 Jason 決定）：F8 送出用的是最後一次改科目／金額／收支時的資料，之後才選的登錄者、收付方式、備註不會送出', async () => {
      // keyDownSubmit 只在 [accountingSubject, amount, inoutType] 改變時重新註冊，閉包裡的 userId／walletType／remark 是舊值
      const { calls, settle } = setup()
      await settle()
      fillRevenue()
      choose('登錄者', '店長-A1')
      choose('收付方式', '現金')
      fireEvent.change(field('備註'), { target: { value: '十月租金' } })
      fireEvent.keyDown(window, { key: 'F8' })
      await wait(() => expect(callsOf(calls, 'CREATE_MONEY_FLOW')).toHaveLength(1))
      expect(sent(calls)).toEqual({
        date: DATE,
        amount: 1500,
        walletType: '轉帳',
        remark: '',
        accountingSubjectId: 'r1',
        accountingSubjectName: '營業收入',
        relationUserId: null,
      })
    })
  })

  it('收付方式尚未設定時，選項提示到收支科目設定新增', async () => {
    const { settle } = setup({ GET_ACCOUNTING_TYPE: { getAccountingType: [] } })
    await settle()
    fireEvent.click(toggle('收入'))
    expect(options('收付方式')).toEqual(['請至收支科目設定中新增收付方式'])
  })

  it('科目與人員查詢失敗時仍可顯示表單（選項為空）', async () => {
    const { settle } = setup({ GET_ACCOUNTING_SUBJECTS: new Error('x'), GET_USERS_FOR_CREATE_PICKING: new Error('y') })
    await settle()
    fireEvent.click(toggle('收入'))
    fireEvent.click(field('登錄者'))
    expect(listOptions()).toHaveLength(0)
  })
})
