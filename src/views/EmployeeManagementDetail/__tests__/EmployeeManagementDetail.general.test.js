// 保護「員工資料 › 基本資料」：
// - 帶入員工資料（姓名、角色、職稱、LINE 綁定、個資與匯款帳戶、緊急聯絡人）。
// - 儲存送出的 UPDATE_USER_INFO 必須是畫面上的資料（不含頭像、職稱；待設定抽成 pending 視為可登入 ok），
//   接著送出預約人數上限與「出現於打單／預約／報表」設定，成功後回員工列表；手機少於 7 碼擋下不送。
// - 把自己的帳號設為停用時提示並登出；後端錯誤顯示訊息。辦理離職跳確認（帶員工 id）。
// GraphQL 全由模擬 link 回應，不連後端、不改真實員工資料。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf, currentLocation, USER_ID, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { renderDetail, DESIGNER, EMP_ID } from './employeeDetailKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const SAVE_FIXTURES = {
  UPDATE_USER_INFO: { setUserInfo: true },
  SET_USER_DESIGNATE_BOOKING_LIMIT: { setUserBookingLimit: true },
  FETCH_SET_USER_DISPLAY_SITIUATION: { setUserDisplaySituation: true },
}

const setup = ({ designer = DESIGNER, fixtures = {}, id } = {}) =>
  renderDetail('general', { designer, id, fixtures: { ...SAVE_FIXTURES, ...fixtures } })

const ready = () => screen.findByDisplayValue('0911222333')
const save = () => fireEvent.click(screen.getAllByRole('button', { name: '儲存' })[0])
// 多數欄位是 Field（標籤在上方、未以 for 連到輸入框）：由標籤找同一個 Field 內的輸入框；有連結的（員工備註）直接用標籤
const field = label => {
  const labelEl = screen.getByText(label, { selector: 'label' })
  return labelEl.htmlFor ? screen.getByLabelText(label) : labelEl.parentElement.querySelector('input, select, textarea')
}
// 日期欄位的輸入框以「選擇日期，目前為 yyyy/MM/dd」為名
const dateField = current => screen.getByLabelText(`選擇日期，目前為 ${current}`)
const change = (label, value) => fireEvent.change(field(label), { target: { value } })

beforeEach(() => loginAs())
afterEach(cleanup)

describe('員工資料：基本資料帶入', () => {
  it('帶入姓名、角色、職稱、LINE 綁定與各欄位', async () => {
    setup()
    await ready()
    expect(screen.getByText('小美 王')).toBeInTheDocument()
    expect(screen.getAllByText('設計師', { selector: 'span' }).length).toBeGreaterThan(0)
    expect(screen.getByText('LINE 已綁定')).toBeInTheDocument()
    expect(field('姓氏')).toHaveValue('王')
    expect(field('名字')).toHaveValue('小美')
    expect(field('暱稱')).toHaveValue('Amy')
    expect(field('員工編號 / 代碼')).toHaveValue('07')
    expect(field('電子信箱')).toHaveValue('amy@example.com')
    expect(field('銀行匯款帳號')).toHaveValue('123456789012')
    expect(field('聯絡人姓名')).toHaveValue('王媽媽')
    expect(field('員工備註')).toHaveValue('週一休')
    expect(field('同時段預約人數上限')).toHaveValue(2)
    expect(screen.getByLabelText('女')).toBeChecked()
    expect(screen.getByLabelText('出現於打單介面')).toBeChecked()
    expect(screen.getByLabelText('包含於業績報表')).not.toBeChecked()
  })

  it('角色未設定、沒有職稱、LINE 未綁定、預約上限未設定時的顯示', async () => {
    setup({
      designer: {
        ...DESIGNER,
        merchantIdentity: { authorityName: '', authorityId: null },
        jobTitle: null,
        isLineBinded: false,
        bookingLimit: null,
        gender: null,
        nickName: null,
        birthday: null,
      },
    })
    await ready()
    expect(screen.getByText('權限未設定')).toBeInTheDocument()
    expect(screen.getByText('-')).toBeInTheDocument()
    expect(screen.getByText('LINE 未綁定')).toBeInTheDocument()
    // 預約上限未設定時顯示預設 3
    expect(field('同時段預約人數上限')).toHaveValue(3)
    expect(screen.getByLabelText('女')).not.toBeChecked()
    expect(screen.getByLabelText('男')).not.toBeChecked()
    expect(field('暱稱')).toHaveValue('')
  })
})

describe('員工資料：基本資料儲存', () => {
  it('送出畫面上的資料（不含頭像、職稱），再送預約上限與出現設定，成功後回員工列表', async () => {
    const { calls } = setup({ designer: { ...DESIGNER, status: 'pending' } })
    await ready()
    change('姓氏', '林')
    change('暱稱', '小林')
    change('手機號碼', '0933444555')
    change('銀行代號', '700')
    change('員工備註', '週二休')
    fireEvent.click(screen.getByLabelText('男'))
    change('同時段預約人數上限', '5')
    const mode = field('預約審核模式')
    fireEvent.change(mode, { target: { value: Array.from(mode.options).find(o => o.textContent === '手動關閉').value } })
    fireEvent.click(screen.getByLabelText('待審核預約是否占用預約名額'))
    fireEvent.click(screen.getByLabelText('包含於業績報表'))
    fireEvent.click(screen.getByLabelText('出現於打單介面'))
    save()
    await wait(() => expect(currentLocation()).toBe('/management/employee'))
    const input = callsOf(calls, 'UPDATE_USER_INFO')[0].variables.input
    expect(input).not.toHaveProperty('avatar')
    expect(input).not.toHaveProperty('jobTitle')
    expect(input).toEqual(
      expect.objectContaining({
        userId: EMP_ID,
        lastName: '林',
        firstName: '小美',
        nickName: '小林',
        cellphone: '0933444555',
        bankCode: '700',
        remark: '週二休',
        gender: 'MALE',
        status: 'ok',
        isBookingAutoAccept: 'FALSE',
        isRTCO: true,
        birthday: DESIGNER.birthday,
        employmentStartDate: DESIGNER.employmentStartDate,
      })
    )
    expect(callsOf(calls, 'SET_USER_DESIGNATE_BOOKING_LIMIT')[0].variables.input).toEqual({ designerId: EMP_ID, bookingLimit: 5 })
    expect(callsOf(calls, 'FETCH_SET_USER_DISPLAY_SITIUATION')[0].variables.input).toEqual({
      designerId: EMP_ID,
      isDisplayOnBookingList: true,
      isDisplayOnServiceList: false,
      isDisplayOnBookingRecord: true,
      isDisplayOnPerformanceList: true,
      isDisplayOnSalaryReportList: true,
      isDisplayOnClockInReportList: false,
    })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '儲存成功', variant: 'success' })
  })

  it('其餘出現設定與聯絡欄位也會送出', async () => {
    const { calls } = setup()
    await ready()
    fireEvent.click(screen.getByLabelText('出現於預約列表'))
    fireEvent.click(screen.getByLabelText('可接受顧客預約'))
    fireEvent.click(screen.getByLabelText('包含於薪資報表'))
    fireEvent.click(screen.getByLabelText('包含於考勤報表'))
    for (const [label, value] of [
      ['名字', '小華'],
      ['電子信箱', 'hua@example.com'],
      ['通訊住址', '台中市'],
      ['戶籍住址', '高雄市'],
      ['員工編號 / 代碼', '08'],
      ['匯款銀行名稱', '台灣銀行'],
      ['分行名稱', '高雄分行'],
      ['銀行匯款帳號', '999'],
      ['關係', '父女'],
      ['聯絡電話', '0900111222'],
      ['聯絡地址', '屏東縣'],
    ]) {
      change(label, value)
    }
    change('聯絡人姓名', '王爸爸')
    fireEvent.click(screen.getByLabelText('男'))
    fireEvent.click(screen.getByLabelText('女'))
    save()
    await wait(() => expect(callsOf(calls, 'FETCH_SET_USER_DISPLAY_SITIUATION')).toHaveLength(1))
    expect(callsOf(calls, 'FETCH_SET_USER_DISPLAY_SITIUATION')[0].variables.input).toEqual(
      expect.objectContaining({
        isDisplayOnBookingRecord: false,
        isDisplayOnBookingList: false,
        isDisplayOnSalaryReportList: false,
        isDisplayOnClockInReportList: true,
      })
    )
    expect(callsOf(calls, 'UPDATE_USER_INFO')[0].variables.input).toEqual(
      expect.objectContaining({
        firstName: '小華',
        email: 'hua@example.com',
        contactAddress: '台中市',
        address: '高雄市',
        designerNo: '08',
        bankName: '台灣銀行',
        bankBranchName: '高雄分行',
        bankAccount: '999',
        familyMemberRelation: '父女',
        familyMemberPhone: '0900111222',
        familyMemberAddress: '屏東縣',
        familyMemberName: '王爸爸',
        gender: 'FEMALE',
      })
    )
  })

  it('改生日與到職日：送出所選日期（台灣時間 00:00）', async () => {
    const { calls } = setup()
    await ready()
    fireEvent.click(dateField('1995/05/20'))
    let dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('gridcell', { name: '1995年5月10日' }))
    const confirm = within(dialog).queryByText('確認')
    if (confirm) fireEvent.click(confirm)
    fireEvent.click(dateField('2024/01/02'))
    dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('gridcell', { name: '2024年1月15日' }))
    const confirm2 = within(dialog).queryByText('確認')
    if (confirm2) fireEvent.click(confirm2)
    save()
    await wait(() => expect(callsOf(calls, 'UPDATE_USER_INFO')).toHaveLength(1))
    const input = callsOf(calls, 'UPDATE_USER_INFO')[0].variables.input
    expect(input.birthday).toBe(new Date(1995, 4, 10).getTime())
    expect(input.employmentStartDate).toBe(new Date(2024, 0, 15).getTime())
  })

  it('手機少於 7 碼：提示且不送出', async () => {
    const { calls } = setup()
    await ready()
    change('手機號碼', ' 12345 ')
    save()
    expect(openSnackbar).toHaveBeenCalledWith({ message: '手機長度必須大於六碼', variant: 'warning' })
    expect(callsOf(calls, 'UPDATE_USER_INFO')).toHaveLength(0)
  })

  it('後端拒絕時顯示訊息，不送出其他設定', async () => {
    const { calls } = setup({ fixtures: { UPDATE_USER_INFO: new Error('手機號碼重複') } })
    await ready()
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '手機號碼重複', variant: 'error' }))
    expect(callsOf(calls, 'SET_USER_DESIGNATE_BOOKING_LIMIT')).toHaveLength(0)
  })

  it('把自己的帳號（已停用）儲存時提示停用並登出', async () => {
    const { calls } = setup({ id: USER_ID, designer: { ...DESIGNER, id: USER_ID, status: 'banned' } })
    await ready()
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '已將此帳號設為停用', variant: 'error' }))
    // 150ms 後清除登入資料並導到登入頁
    await wait(() => expect(currentLocation()).toBe('/auth/login'))
    expect(localStorage.getItem('user')).toBeNull()
    expect(callsOf(calls, 'SET_USER_DESIGNATE_BOOKING_LIMIT')).toHaveLength(0)
  })

  it('辦理員工離職：跳確認並帶入員工 id', async () => {
    setup()
    await ready()
    fireEvent.click(screen.getByRole('button', { name: '辦理員工離職' }))
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ resign: true, designerId: EMP_ID, message: '確定要離職此員工？' }))
  })

  it('預約人數上限：滾輪不改數字（先失焦）', async () => {
    setup()
    await ready()
    const limit = field('同時段預約人數上限')
    limit.focus()
    fireEvent.wheel(limit)
    expect(document.activeElement).not.toBe(limit)
  })

  // 查無此員工（merchantDesigner 為 null）時導回員工列表（Jason 2026/10/22；修正前 effect 先讀 merchantDesigner.id 整頁錯誤）。
  it('查無此員工時導回員工列表', async () => {
    setup({ designer: null })
    await wait(() => expect(currentLocation()).toBe('/management/employee'))
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})
