// 保護「收支紀錄詳細」（現金收支的編輯頁）：
// - 依網址 id 查詢並帶入日期、收支類別、科目、金額、登錄者、關係人、備註；沒有收付方式欄，儲存時沿用原紀錄的收付方式
// - 儲存送出 updateMoneyFlow(id, input, password)：金額轉數字、科目 id 與名稱、關係人 id、有登錄者才送 userId；成功導回現金收支列表
// - 店家開啟「編輯收支密碼」時，儲存先跳密碼對話框，確認後才送出（帶密碼）；取消清空密碼
// - 改收支類別（點選或左右鍵）會清空科目與關係人並提示重新選擇；未選科目時儲存提示「請選擇科目」、不送出
// - 刪除先確認（「確定要刪除這筆收支紀錄嗎？」）再送出 deleteMoneyFlow(id)；成功導回列表；失敗提示錯誤、按鈕恢復（Jason 2026/10/22）
// - 點選切換收支類別後焦點落在新選的按鈕；紀錄查詢失敗時以空表單顯示、不整頁錯誤（Jason 2026/10/22）
// - 鍵盤：日期欄（ui/date-picker，頁面以 slotProps.textField.onKeyDown 處理）Enter 跳到收入／支出、不開月曆，Enter 依序跳欄
// GraphQL 全由 testkit 的模擬 link 回應，不改真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import GeneralAccountingRecordDetail from '..'

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
const FLOW = {
  id: 'mf-1',
  date: DATE,
  accountingSubject: { id: 'r1', name: '營業收入', number: '4101', inoutType: 'REVENUE' },
  amount: 1200,
  inoutType: 'REVENUE',
  user: { id: 'u1', name: '店長', designerNo: 'A1' },
  walletType: '現金',
  remark: '原備註',
  relationUser: null,
}

const setup = (fixtures = {}) =>
  renderPage(<GeneralAccountingRecordDetail match={{ params: { id: 'mf-1' } }} />, {
    fixtures: {
      GET_MONEY_FLOW: { moneyFlow: FLOW },
      GET_ACCOUNTING_SUBJECTS: { accountingSubjects: SUBJECTS },
      GET_USERS_FOR_CREATE_PICKING: { users: { users: USERS } },
      GET_MERCHANT_PASSWORD: { merchantPassword: { editMoneyFlow: { isUsing: false } } },
      USE_FETCH_UPDATE_MONEY_FLOW: { updateMoneyFlow: { id: 'mf-1' } },
      USE_FETCH_DELETE_MONEY_FLOW: { deleteMoneyFlow: { id: 'mf-1' } },
      ...fixtures,
    },
    route: '/general/accounting/deatil/mf-1',
  })

beforeEach(() => loginAs())
afterEach(cleanup)

const field = label => screen.getAllByLabelText(label).find(el => ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
const listOptions = () => screen.queryAllByRole('option').filter(o => o.tagName !== 'OPTION')
const options = label => {
  fireEvent.click(field(label))
  const list = listOptions().map(o => o.textContent)
  fireEvent.keyDown(field(label), { key: 'Escape' })
  return list
}
const choose = (label, text) => {
  fireEvent.click(field(label))
  fireEvent.click(listOptions().find(o => o.textContent === text))
}
const clear = label => {
  fireEvent.focusIn(field(label))
  fireEvent.mouseDown(within(field(label).closest('.ui-root')).getByRole('button', { name: '清除' }))
}
const toggle = text => screen.getByText(text, { selector: 'button' })
const saveButton = () => screen.getByText('儲存', { selector: 'button' })
const deleteButton = () => screen.getByText('刪除', { selector: 'button' })
const enter = el => fireEvent.keyDown(el, { key: 'Enter' })
const dateInput = () => screen.getAllByLabelText(/^選擇日期/).find(el => el.tagName === 'INPUT')
const RESET_MESSAGE = '收支更動，請重新選擇科目或關係人。'
const updates = calls => callsOf(calls, 'USE_FETCH_UPDATE_MONEY_FLOW')

describe('收支紀錄詳細（現金）', () => {
  it('依網址 id 查詢並帶入原紀錄', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'GET_MONEY_FLOW')[0].variables).toEqual({ id: 'mf-1' })
    expect(dateInput()).toHaveValue('2026/10/20')
    expect(toggle('收入').getAttribute('aria-pressed')).toBe('true')
    expect(field('科目')).toHaveValue('4101 營業收入')
    expect(field('金額')).toHaveValue(1200)
    expect(field('登錄者')).toHaveValue('店長-A1')
    expect(screen.queryByLabelText('收付方式')).toBeNull()
    expect(field('備註')).toHaveValue('原備註')
    expect(screen.queryByLabelText('關係人')).toBeNull()
  })

  it('修改金額、備註快捷與日期後儲存，送出完整 input（收付方式沿用原紀錄）並導回列表', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.change(field('金額'), { target: { value: '1500' } })
    fireEvent.change(field('備註快捷鍵'), { target: { value: '5' } }) // 勞健保費用
    expect(field('備註')).toHaveValue('勞健保費用')
    expect(document.activeElement).toBe(field('備註'))
    fireEvent.change(field('備註'), { target: { value: '勞健保費用－補繳' } })
    fireEvent.click(dateInput())
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('gridcell', { name: '2026年10月18日' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByText('確認'))
    await wait(() => expect(dateInput()).toHaveValue('2026/10/18'))
    fireEvent.click(saveButton())
    await wait(() => expect(updates(calls)).toHaveLength(1))
    expect(updates(calls)[0].variables).toEqual({
      id: 'mf-1',
      input: {
        date: new Date(2026, 9, 18, 10, 0).getTime(),
        amount: 1500,
        walletType: '現金',
        remark: '勞健保費用－補繳',
        accountingSubjectId: 'r1',
        accountingSubjectName: '營業收入',
        relationUserId: null,
        userId: 'u1',
      },
      password: '',
    })
    await wait(() => expect(currentLocation()).toBe('/general/accounting/records'))
    expect(openSnackbar).toHaveBeenCalledWith({ message: '更新收借支成功', variant: 'success' })
  })

  it('店家開啟編輯收支密碼：儲存先輸入密碼，取消會清空；確認後送出密碼', async () => {
    const { calls, settle } = setup({ GET_MERCHANT_PASSWORD: { merchantPassword: { editMoneyFlow: { isUsing: true } } } })
    await settle()
    fireEvent.click(saveButton())
    const dialog = () => within(screen.getByRole('dialog'))
    expect(dialog().getByText('儲存收支紀錄')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('儲存密碼'), { target: { value: '1234' } })
    fireEvent.click(dialog().getByText('取消'))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(updates(calls)).toHaveLength(0)
    fireEvent.click(saveButton())
    expect(screen.getByLabelText('儲存密碼')).toHaveValue('')
    fireEvent.change(screen.getByLabelText('儲存密碼'), { target: { value: '5678' } })
    fireEvent.click(screen.getByTestId('confirm'))
    await wait(() => expect(updates(calls)).toHaveLength(1))
    expect(updates(calls)[0].variables.password).toBe('5678')
  })

  it('改成支出會清空科目並提示重新選擇；未選科目儲存時提示「請選擇科目」不送出', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(toggle('支出'))
    expect(screen.getByText(RESET_MESSAGE)).toBeInTheDocument()
    expect(field('科目')).toHaveValue('')
    expect(options('科目')).toEqual(['5101 房租', '5102 員工借支'])
    fireEvent.click(saveButton())
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇科目', variant: 'warning' })
    expect(updates(calls)).toHaveLength(0)
    // 選一般科目後提示消失
    choose('科目', '5101 房租')
    await wait(() => expect(screen.queryByText(RESET_MESSAGE)).toBeNull())
    // 再按一次支出（已選）不會清空
    fireEvent.click(toggle('支出'))
    expect(field('科目')).toHaveValue('5101 房租')
  })

  it('點選切換收支類別後，焦點落在新選的類別按鈕（Jason 2026/10/22）', async () => {
    const { settle } = setup()
    await settle()
    fireEvent.click(toggle('支出'))
    expect(document.activeElement).toBe(toggle('支出'))
    fireEvent.click(toggle('收入'))
    expect(document.activeElement).toBe(toggle('收入'))
  })

  it('支出選「員工借支」要再選關係人提示才消失；儲存送出關係人 id', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(toggle('支出'))
    choose('科目', '5102 員工借支')
    expect(screen.getByText(RESET_MESSAGE)).toBeInTheDocument()
    expect(options('關係人')).toEqual(['店長-A1', '小美-(無代號)'])
    choose('關係人', '小美-(無代號)')
    await wait(() => expect(screen.queryByText(RESET_MESSAGE)).toBeNull())
    fireEvent.click(saveButton())
    await wait(() => expect(updates(calls)).toHaveLength(1))
    expect(updates(calls)[0].variables.input).toMatchObject({
      accountingSubjectId: 'e2',
      accountingSubjectName: '員工借支',
      relationUserId: 'u2',
    })
  })

  it('左右鍵切換收支類別：右鍵改支出並清空，已是支出再按右鍵不動；左鍵改回收入', async () => {
    const { settle } = setup()
    await settle()
    const group = toggle('收入').closest('[role="group"]')
    fireEvent.keyDown(group, { key: 'ArrowLeft' }) // 已是收入：不動
    expect(field('科目')).toHaveValue('4101 營業收入')
    fireEvent.keyDown(group, { key: 'ArrowRight' })
    expect(toggle('支出').getAttribute('aria-pressed')).toBe('true')
    expect(document.activeElement).toBe(toggle('支出'))
    expect(screen.getByText(RESET_MESSAGE)).toBeInTheDocument()
    choose('科目', '5101 房租')
    fireEvent.keyDown(group, { key: 'ArrowRight' })
    expect(field('科目')).toHaveValue('5101 房租')
    fireEvent.keyDown(group, { key: 'ArrowLeft' })
    expect(toggle('收入').getAttribute('aria-pressed')).toBe('true')
    expect(document.activeElement).toBe(toggle('收入'))
    expect(field('科目')).toHaveValue('')
    fireEvent.keyDown(group, { key: 'Tab' })
    fireEvent.keyDown(group, { key: 'Enter' })
    expect(document.activeElement).toBe(field('科目'))
  })

  it('原紀錄是員工借支且有關係人、沒有登錄者：帶入關係人，儲存不送 userId', async () => {
    const { calls, settle } = setup({
      GET_MONEY_FLOW: {
        moneyFlow: {
          ...FLOW,
          inoutType: 'EXPENDITURE',
          accountingSubject: { id: 'e2', name: '員工借支', number: '5102', inoutType: 'EXPENDITURE' },
          user: null,
          relationUser: { id: 'u1', name: '店長', designerNo: 'A1' },
        },
      },
    })
    await settle()
    expect(field('關係人')).toHaveValue('店長-A1')
    expect(field('登錄者')).toHaveValue('')
    fireEvent.click(saveButton())
    await wait(() => expect(updates(calls)).toHaveLength(1))
    expect(updates(calls)[0].variables.input).toEqual({
      date: DATE,
      amount: 1200,
      walletType: '現金',
      remark: '原備註',
      accountingSubjectId: 'e2',
      accountingSubjectName: '員工借支',
      relationUserId: 'u1',
    })
  })

  it('原紀錄沒有科目時，科目名稱與 id 以空字串送出', async () => {
    const { calls, settle } = setup({ GET_MONEY_FLOW: { moneyFlow: { ...FLOW, accountingSubject: null } } })
    await settle()
    expect(field('科目')).toHaveValue('')
    fireEvent.click(saveButton())
    await wait(() => expect(updates(calls)).toHaveLength(1))
    expect(updates(calls)[0].variables.input).toMatchObject({ accountingSubjectId: '', accountingSubjectName: '' })
  })

  it('清除科目時提示重新選擇', async () => {
    const { settle } = setup()
    await settle()
    clear('科目')
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇科目', variant: 'warning' })
  })

  it('從科目列表彈窗選科目', async () => {
    const { settle } = setup()
    await settle()
    fireEvent.click(screen.getByLabelText('從科目列表選擇'))
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText('收入科目')).toBeInTheDocument()
    expect(dialog.queryByText('房租')).toBeNull()
    fireEvent.click(dialog.getByText('選擇'))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    fireEvent.click(toggle('支出'))
    fireEvent.click(screen.getByLabelText('從科目列表選擇'))
    fireEvent.click(within(screen.getByRole('dialog')).getAllByText('選擇')[0])
    await wait(() => expect(field('科目')).toHaveValue('5101 房租'))
    // 開了再按一次按鈕會關閉
    fireEvent.click(screen.getByLabelText('從科目列表選擇'))
    fireEvent.click(within(screen.getByRole('dialog')).getAllByText('關閉')[0])
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('儲存失敗或後端回 null 時提示錯誤、按鈕恢復可按', async () => {
    const { settle } = setup({ USE_FETCH_UPDATE_MONEY_FLOW: new Error('密碼錯誤') })
    await settle()
    fireEvent.click(saveButton())
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('密碼錯誤') }))
    )
    await wait(() => expect(saveButton()).not.toBeDisabled())
    cleanup()
    const second = setup({ USE_FETCH_UPDATE_MONEY_FLOW: { updateMoneyFlow: null } })
    await second.settle()
    fireEvent.click(saveButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '更新收借支失敗', variant: 'error' }))
  })

  it('刪除先確認：取消不送出；確定後送出紀錄 id，成功後導回列表（Jason 2026/10/22）', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(deleteButton())
    let dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText('確定要刪除這筆收支紀錄嗎？')).toBeInTheDocument()
    fireEvent.click(dialog.getByText('取消'))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(callsOf(calls, 'USE_FETCH_DELETE_MONEY_FLOW')).toHaveLength(0)
    fireEvent.click(deleteButton())
    dialog = within(screen.getByRole('dialog'))
    fireEvent.click(dialog.getByText('確定刪除'))
    await wait(() => expect(callsOf(calls, 'USE_FETCH_DELETE_MONEY_FLOW')).toHaveLength(1))
    expect(callsOf(calls, 'USE_FETCH_DELETE_MONEY_FLOW')[0].variables).toEqual({ id: 'mf-1' })
    await wait(() => expect(currentLocation()).toBe('/general/accounting/records'))
    expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除收借支成功', variant: 'success' })
  })

  // Jason 2026/10/22「照建議」：前端不改，列為後端待辦（docs/redesign/TODO.md）——後端 deleteMoneyFlow 加 password 參數後，前端再比照編輯收支要求輸入密碼。
  it('後端待辦（Jason 2026/10/22）：店家開啟編輯收支密碼時，刪除有確認但仍不需密碼（deleteMoneyFlow 沒有 password 參數，需後端支援）', async () => {
    const { calls, settle } = setup({ GET_MERCHANT_PASSWORD: { merchantPassword: { editMoneyFlow: { isUsing: true } } } })
    await settle()
    fireEvent.click(deleteButton())
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.queryByLabelText('儲存密碼')).toBeNull()
    fireEvent.click(dialog.getByText('確定刪除'))
    await wait(() => expect(callsOf(calls, 'USE_FETCH_DELETE_MONEY_FLOW')).toHaveLength(1))
    expect(callsOf(calls, 'USE_FETCH_DELETE_MONEY_FLOW')[0].variables).toEqual({ id: 'mf-1' })
  })

  it('刪除失敗或後端回 null 時提示錯誤、按鈕恢復可按', async () => {
    const { settle } = setup({ USE_FETCH_DELETE_MONEY_FLOW: new Error('已日結不可刪除') })
    await settle()
    fireEvent.click(deleteButton())
    fireEvent.click(within(screen.getByRole('dialog')).getByText('確定刪除'))
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('已日結不可刪除') }))
    )
    await wait(() => expect(deleteButton()).not.toBeDisabled())
    // 失敗後確認框關閉
    expect(screen.queryByRole('dialog')).toBeNull()
    cleanup()
    const second = setup({ USE_FETCH_DELETE_MONEY_FLOW: { deleteMoneyFlow: null } })
    await second.settle()
    fireEvent.click(deleteButton())
    fireEvent.click(within(screen.getByRole('dialog')).getByText('確定刪除'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除收借支失敗', variant: 'error' }))
  })

  describe('鍵盤操作', () => {
    it('日期欄 Enter 跳到目前的收支類別按鈕，不開月曆；其他按鍵不動作', async () => {
      const { settle } = setup()
      await settle()
      enter(dateInput())
      expect(document.activeElement).toBe(toggle('收入'))
      expect(screen.queryByRole('dialog')).toBeNull()
      fireEvent.click(toggle('支出'))
      enter(dateInput())
      expect(document.activeElement).toBe(toggle('支出'))
      dateInput().focus()
      fireEvent.keyDown(dateInput(), { key: 'a' })
      expect(document.activeElement).toBe(dateInput())
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('Enter 依序跳欄：科目→金額→登錄者→備註快捷→備註；員工借支時金額後先到關係人', async () => {
      const { settle } = setup()
      await settle()
      fireEvent.focusIn(field('科目'))
      enter(field('科目'))
      expect(document.activeElement).toBe(field('金額'))
      enter(field('金額'))
      expect(document.activeElement).toBe(field('登錄者'))
      enter(field('登錄者'))
      expect(document.activeElement).toBe(field('備註快捷鍵'))
      enter(field('備註快捷鍵'))
      expect(document.activeElement).toBe(field('備註'))

      choose('登錄者', '小美-(無代號)')
      expect(document.activeElement).toBe(field('備註快捷鍵'))

      fireEvent.click(toggle('支出'))
      choose('科目', '5102 員工借支')
      expect(document.activeElement).toBe(field('金額'))
      enter(field('金額'))
      expect(document.activeElement).toBe(field('關係人'))
      enter(field('關係人'))
      expect(document.activeElement).toBe(field('登錄者'))
      ;['登錄者', '金額', '關係人', '備註快捷鍵', '科目'].forEach(label => {
        field(label).focus()
        fireEvent.keyDown(field(label), { key: 'a' })
        expect(document.activeElement).toBe(field(label))
      })
    })

    it('各欄位取得焦點時記住位置；金額欄滾輪離開焦點', async () => {
      const { settle } = setup()
      await settle()
      fireEvent.click(toggle('支出'))
      choose('科目', '5102 員工借支')
      ;['關係人', '登錄者', '備註快捷鍵', '備註', '金額'].forEach(label => fireEvent.focusIn(field(label)))
      expect(document.activeElement).toBe(field('金額'))
      fireEvent.wheel(field('金額'))
      expect(document.activeElement).not.toBe(field('金額'))
    })
  })

  it('人員查詢失敗時不顯示登錄者欄，其餘照常', async () => {
    const { settle } = setup({ GET_USERS_FOR_CREATE_PICKING: new Error('x'), GET_ACCOUNTING_SUBJECTS: new Error('y') })
    await settle()
    expect(screen.queryByLabelText('登錄者')).toBeNull()
    expect(field('金額')).toHaveValue(1200)
  })

  it('紀錄查詢失敗（或已被刪除）時以空表單顯示，不整頁錯誤（Jason 2026/10/22）', async () => {
    const { calls, settle } = setup({ GET_MONEY_FLOW: new Error('查無資料') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('收支紀錄詳細', { selector: 'h1' })).toBeInTheDocument()
    // 沒帶入科目：儲存提示選科目、不送出
    fireEvent.click(toggle('收入'))
    fireEvent.click(saveButton())
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '請選擇科目', variant: 'warning' }))
    expect(callsOf(calls, 'USE_FETCH_UPDATE_MONEY_FLOW')).toHaveLength(0)
  })
})
