// 保護「全店打卡記錄」的查詢、顯示與打卡修正（點格子開面板的權限另見 AttendanceRecords.page.test.js）。守住：
// - 查詢送出選的月份（網址 startDate 指定的月）、員工與定位距離篩選；搜尋鈕帶入篩選條件
// - 各種打卡方式（LINE、手機定位、電腦、QR code、管理員補登）顯示對應的類型與時間；遲到的上班、早退的下班標紅；
//   同一天多段打卡之間有分隔線；沒有打卡的日子留白
// - 編輯打卡時間：只改時分，送出該筆 uuid 與新時間；刪除送該筆 uuid；成功重查，失敗提示原因並可再按
// - 補打卡：須有新增權限；時間不可是未來、須選員工；送出時間、員工與打卡類型
// - 報表匯出（一般／人資格式）帶入篩選與「匯出打卡類型」，取得網址後自動下載
// 日期選擇器以簡化版代替；GraphQL 全由模擬 link 回應，不連後端、不改真實打卡紀錄。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import AttendanceRecords from '..'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
// 與真實日期選擇器相同：選好時回傳 Date，輸入未完成時回傳 Invalid Date
jest.mock('ui/date-picker', () => ({
  MobileDatePicker: ({ onChange, localeText }) => (
    <input aria-label={localeText && localeText.toolbarTitle} onChange={e => onChange(new Date(Number(e.target.value)))} />
  ),
  DateTimePicker: ({ value, onChange, label }) => (
    <input aria-label={label} data-value={value} onChange={e => onChange(new Date(e.target.value === '輸入未完成' ? NaN : Number(e.target.value)))} />
  ),
}))

const MONTH = new Date(2025, 2, 1)
const MONTH_END = new Date(2025, 2, 31, 23, 59, 59, 999)
const at = (day, h, m = 0) => new Date(2025, 2, day, h, m).getTime()

// 打卡方式：每一天用一種方式打上班、外出、回來、下班
const KINDS = {
  LINE: { isLine: true, checkinType: null, gps: true },
  CELLPHONE: { isLine: false, checkinType: 'CELLPHONE', gps: true },
  CELLPHONE_NOGPS: { isLine: false, checkinType: 'CELLPHONE', gps: false },
  NULL_GPS: { isLine: false, checkinType: null, gps: true },
  COMPUTER: { isLine: false, checkinType: 'COMPUTER', gps: false },
  NULL: { isLine: false, checkinType: null, gps: false },
  QRCODE: { isLine: false, checkinType: 'QRCODE', gps: true },
  ADMIN: { isLine: false, checkinType: 'ADMIN', gps: false },
  OTHER: { isLine: false, checkinType: 'OTHER', gps: false },
}
const punch = (kind, day, h, m, distanceValue = 'LOWERTHAN25') => {
  const k = KINDS[kind]
  return {
    uuid: `${kind}-${day}-${h}`,
    time: at(day, h, m),
    latitude: k.gps ? 25.03 : null,
    longitude: k.gps ? 121.56 : null,
    isLine: k.isLine,
    checkinType: k.checkinType,
    distanceValue,
  }
}
const fullDay = (kind, day, extra = {}) => ({
  date: at(day, 0),
  isLate: false,
  isLeaveEarly: false,
  clockInRecord: [
    {
      in: punch(kind, day, 9, 0),
      out: punch(kind, day, 18, 0),
      breakRecord: [{ start: punch(kind, day, 12, 0), end: punch(kind, day, 13, 0) }],
    },
  ],
  ...extra,
})
const DAYS = Object.keys(KINDS).map((kind, i) => fullDay(kind, i + 1))
const RECORDS = [
  {
    userId: 'u2',
    userName: '設計師小美',
    userNickName: null,
    totalClockInDays: 12,
    absenteeismDays: 1,
    totalLateMinutes: 1234,
    attendanceRecord: [
      ...DAYS,
      // 10 號：遲到＋早退、兩段打卡（中間分隔線），第二段的上班是 QR code、下班超過 50 公尺
      {
        date: at(10, 0),
        isLate: true,
        isLeaveEarly: true,
        clockInRecord: [
          { in: punch('COMPUTER', 10, 9, 15), out: punch('COMPUTER', 10, 12, 0), breakRecord: [] },
          { in: punch('LINE', 10, 13, 0, 'BETWEEN25AND50'), out: punch('CELLPHONE', 10, 17, 30, 'MORETHAN50'), breakRecord: [] },
        ],
      },
      // 11 號：第二段只有休息紀錄；12 號：第二段全空（不畫分隔線）、第一段缺上班與休息回來
      {
        date: at(11, 0),
        isLate: false,
        isLeaveEarly: false,
        clockInRecord: [
          { in: punch('COMPUTER', 11, 9, 0), out: null, breakRecord: [] },
          { in: null, out: { ...punch('COMPUTER', 11, 18, 0), uuid: null }, breakRecord: [{ start: punch('COMPUTER', 11, 15, 0), end: null }] },
        ],
      },
      {
        date: at(12, 0),
        isLate: false,
        isLeaveEarly: false,
        clockInRecord: [
          { in: { ...punch('COMPUTER', 12, 9, 0), uuid: null }, out: punch('COMPUTER', 12, 18, 0), breakRecord: [{ start: null, end: { ...punch('COMPUTER', 12, 13, 0), uuid: null } }] },
          { in: { uuid: null, time: null }, out: { uuid: null, time: null }, breakRecord: [{ start: { uuid: null, time: null }, end: null }] },
          { in: null, out: null, breakRecord: [] },
          { in: null, out: null, breakRecord: [{ start: null, end: { uuid: null, time: null } }] },
        ],
      },
      { date: at(13, 0), isLate: false, isLeaveEarly: false, clockInRecord: [] },
      // 14 號起：每種打卡方式各一天，遲到又早退
      ...Object.keys(KINDS).map((kind, i) => fullDay(kind, 14 + i, { isLate: true, isLeaveEarly: true })),
    ],
  },
]

const clockInSection = ({ add = false, edit = false, del = false } = {}) => ({
  pageTitle: '打卡權限設定',
  authority: true,
  pageAuthority: [
    { pageName: '新增打卡紀錄', authority: add },
    { pageName: '編輯打卡紀錄', authority: edit },
    { pageName: '刪除打卡紀錄', authority: del },
  ],
})

const setup = ({ add = true, edit = true, del = true, fixtures = {} } = {}) => {
  window.history.pushState({}, '', `/attendance/records?startDate=${MONTH.getTime()}`)
  return renderPage(<AttendanceRecords />, {
    route: `/attendance/records?startDate=${MONTH.getTime()}&endDate=${MONTH_END.getTime()}`,
    fixtures: {
      FETCH_PROFILE_IDENDITY: { me: { id: 'user-1', merchantIdentity: { authorityName: '店長', authorityId: 'auth-1' } } },
      GET_MERCHANT_AUTHORITIES: {
        getMerchantAuthorities: [{ id: 'auth-1', authorityName: '店長', authoritySettings: JSON.stringify([clockInSection({ add, edit, del })]) }],
      },
      GET_USERS_FOR_CREATE_PICKING: {
        users: { users: [{ id: 'u2', name: '設計師小美', designerNo: '02' }, { id: 'u3', name: '助理阿明', designerNo: null }] },
      },
      GET_ALL_ATTENDANCE: { attendanceRecords: RECORDS },
      ...fixtures,
    },
  })
}
const ready = async utils => {
  await utils.settle()
  await screen.findByText('設計師小美')
}
const dayCell = day => screen.getByText('設計師小美').closest('tr').children[3 + day]
const searches = calls => callsOf(calls, 'GET_ALL_ATTENDANCE').map(c => c.variables.input)
const ALL_FILTERS = ['NULL', 'ZERO', 'QRCODE', 'LOWERTHAN25', 'BETWEEN25AND50', 'MORETHAN50']

beforeEach(() => loginAs())
afterEach(() => {
  cleanup()
  window.history.pushState({}, '', '/')
})

describe('查詢與顯示', () => {
  it('查詢網址指定的月份、全部員工與全部距離；表頭列出整月、統計欄位', async () => {
    const utils = setup()
    await ready(utils)
    expect(searches(utils.calls)[0]).toEqual({
      userId: '',
      dateRange: { startDate: MONTH.getTime(), endDate: new Date(2025, 2, 31, 23, 59, 59, 999).getTime() },
      distanceFilter: ALL_FILTERS,
    })
    expect(screen.getByText('2025年')).toBeInTheDocument()
    expect(screen.getByText('03/01(六)')).toBeInTheDocument()
    expect(screen.getByText('03/31(一)')).toBeInTheDocument()
    expect(screen.getByText('共 1 筆')).toBeInTheDocument()
    expect(screen.getByText('12 天')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
  })

  it('各打卡方式顯示類型與時間：電腦、QR code、管理員補登直接顯示；手機與 LINE 的時間依距離上色；沒有定位的手機打卡為灰字', async () => {
    const utils = setup()
    await ready(utils)
    const cellOf = kind => dayCell(Object.keys(KINDS).indexOf(kind) + 1)
    expect(cellOf('COMPUTER').textContent).toBe('上09:00外12:00回13:00下18:00')
    expect(cellOf('COMPUTER').querySelector('.lucide-monitor')).not.toBeNull()
    expect(cellOf('NULL').textContent).toBe('上09:00外12:00回13:00下18:00')
    expect(cellOf('QRCODE').querySelector('.lucide-qr-code')).not.toBeNull()
    expect(cellOf('ADMIN').querySelector('.lucide-user-cog')).not.toBeNull()
    expect(cellOf('ADMIN').textContent).toBe('上09:00外12:00回13:00下18:00')
    // 不認得的打卡方式不顯示
    expect(cellOf('OTHER').textContent).toBe('')
    expect(cellOf('LINE').textContent).toBe('上09:00外12:00回13:00下18:00')
    expect(cellOf('LINE').querySelectorAll('.lineicon')).toHaveLength(3)
    expect(within(cellOf('CELLPHONE')).getByText('09:00').tagName).toBe('A')
    expect(within(cellOf('NULL_GPS')).getByText('18:00').tagName).toBe('A')
    expect(within(cellOf('CELLPHONE_NOGPS')).getByText('09:00')).toHaveStyle('color: rgb(var(--text-tertiary))')
    expect(within(cellOf('CELLPHONE_NOGPS')).getByText('12:00')).toHaveStyle('color: rgb(var(--text-tertiary))')
    expect(within(cellOf('CELLPHONE_NOGPS')).getByText('13:00')).toHaveStyle('color: rgb(var(--text-tertiary))')
    expect(within(cellOf('CELLPHONE_NOGPS')).getByText('18:00')).toHaveStyle('color: rgb(var(--text-tertiary))')
    expect(within(cellOf('CELLPHONE')).getByText('12:00')).toHaveStyle('color: rgb(var(--text))')
  })

  it('遲到的第一筆上班、早退的最後一筆下班標紅；超過 25／50 公尺分別以警告／危險色；兩段打卡之間有分隔線', async () => {
    const utils = setup()
    await ready(utils)
    const day10 = dayCell(10)
    expect(within(day10).getByText('上09:15').parentElement.className).toMatch(/color:red/)
    expect(within(day10).getByText('下12:00').parentElement.className).not.toMatch(/color:red/)
    expect(within(day10).getByText('13:00')).toHaveStyle('color: rgb(var(--warning))')
    expect(within(day10).getByText('17:30')).toHaveStyle('color: rgb(var(--danger))')
    expect(within(day10).getByText('17:30').className).toMatch(/color:red/)
    expect(within(day10).getByText('13:00').className).toMatch(/no-underline/)
    expect(within(day10).getAllByRole('separator')).toHaveLength(1)
    // 第二段只有休息紀錄也畫分隔線；全空的不畫
    expect(within(dayCell(11)).getAllByRole('separator')).toHaveLength(1)
    expect(dayCell(11).textContent).toBe('上09:00外15:00')
    expect(within(dayCell(12)).queryAllByRole('separator')).toHaveLength(0)
    expect(dayCell(12).textContent).toBe('下18:00')
    expect(dayCell(13).textContent).toBe('')
    // 遲到又早退：各種打卡方式的上班與下班都標紅
    Object.keys(KINDS).filter(k => k !== 'OTHER').forEach((kind, i) => {
      const cellEl = dayCell(14 + Object.keys(KINDS).indexOf(kind))
      const red = [...cellEl.querySelectorAll('[class*="color:red"]')]
      expect(red.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('篩選：選員工與距離條件後按搜尋，送出員工 id 與勾選的條件；清除員工後送空字串', async () => {
    const utils = setup()
    await ready(utils)
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    const employee = screen.getByLabelText('員工姓名/編號')
    fireEvent.change(employee, { target: { value: '02' } })
    expect(screen.getByText('設計師小美-02')).toBeInTheDocument()
    expect(screen.queryByText('助理阿明(無代號)')).toBeNull()
    fireEvent.change(employee, { target: { value: '阿明' } })
    expect(screen.getByText('助理阿明(無代號)')).toBeInTheDocument()
    fireEvent.change(employee, { target: { value: '' } })
    fireEvent.click(screen.getByText('設計師小美-02'))
    fireEvent.mouseDown(screen.getByRole('button', { name: '移除 QRCODE打卡' }))
    fireEvent.mouseDown(screen.getByRole('button', { name: /^移除 未知/ }))
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    await utils.settle()
    expect(searches(utils.calls).pop()).toMatchObject({ userId: 'u2', distanceFilter: ['ZERO', 'LOWERTHAN25', 'BETWEEN25AND50', 'MORETHAN50'] })
    // 再勾回一個條件（選單內有勾選框）
    fireEvent.change(screen.getByLabelText('篩選打卡記錄'), { target: { value: '' } })
    fireEvent.focus(screen.getByLabelText('篩選打卡記錄'))
    fireEvent.keyDown(screen.getByLabelText('篩選打卡記錄'), { key: 'ArrowDown' })
    fireEvent.click(await screen.findByText('未知'))
    fireEvent.focusIn(employee)
    fireEvent.mouseDown(within(employee.closest('[class*="rounded-md border"]')).getByRole('button', { name: '清除' }))
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    await utils.settle()
    expect(searches(utils.calls).pop()).toMatchObject({ userId: '', distanceFilter: ['ZERO', 'LOWERTHAN25', 'BETWEEN25AND50', 'MORETHAN50', 'NULL'] })
  })

  it('換月份：重查該月', async () => {
    const utils = setup()
    await ready(utils)
    fireEvent.change(screen.getByLabelText('選擇日期'), { target: { value: String(new Date(2025, 1, 10).getTime()) } })
    await utils.settle()
    expect(searches(utils.calls).pop().dateRange).toEqual({
      startDate: new Date(2025, 1, 1).getTime(),
      endDate: new Date(2025, 1, 28, 23, 59, 59, 999).getTime(),
    })
  })
})

describe('編輯與刪除打卡', () => {
  const openPanel = async text => {
    fireEvent.click(within(dayCell(5)).getByText(text).closest('[role="button"]'))
    return screen.findByText(/已選取打卡記錄:/)
  }

  it('編輯時間：只改時分，送出該筆 uuid 與新時間；成功後重查；取消關閉', async () => {
    const utils = setup({ fixtures: { UPDATA_ATTENDANT_RECORD: { updateAttendantRecord: true } } })
    await ready(utils)
    await openPanel('上09:00')
    fireEvent.click(screen.getByRole('button', { name: '編輯' }))
    expect(await screen.findByText('編輯打卡記錄')).toBeInTheDocument()
    expect(screen.getAllByText(/2025\/03\/05\s+09:00 - 上班/).length).toBeGreaterThan(0)
    const time = screen.getByLabelText('選取時間')
    expect(time).toHaveValue('09:00')
    fireEvent.change(time, { target: { value: '08:45' } })
    const before = searches(utils.calls).length
    fireEvent.click(screen.getByRole('button', { name: '確認' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '修改成功', variant: 'success' }))
    expect(callsOf(utils.calls, 'UPDATA_ATTENDANT_RECORD').map(c => c.variables)).toEqual([
      { input: { uuid: 'COMPUTER-5-9', date: at(5, 8, 45) } },
    ])
    await wait(() => expect(searches(utils.calls).length).toBe(before + 1))
  })

  it('編輯失敗：提示原因、確認鈕可再按；取消與 Esc 關閉', async () => {
    const utils = setup({ fixtures: { UPDATA_ATTENDANT_RECORD: new Error('已月結，無法修改') } })
    await ready(utils)
    await openPanel('外12:00')
    expect(screen.getByText(/12:00 - 外出/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '編輯' }))
    await screen.findByText('編輯打卡記錄')
    fireEvent.click(screen.getByRole('button', { name: '確認' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '已月結，無法修改', variant: 'error' }))
    expect(screen.getByRole('button', { name: '確認' })).not.toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByText('編輯打卡記錄')).toBeNull())
    fireEvent.click(screen.getByRole('button', { name: '編輯' }))
    await screen.findByText('編輯打卡記錄')
    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    await wait(() => expect(screen.queryByText('編輯打卡記錄')).toBeNull())
    // 面板：Esc 關閉
    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    await wait(() => expect(screen.queryByText(/已選取打卡記錄:/)).toBeNull())
  })

  // 刪除先跳確認窗（Jason 2026/10/22「加上」），按「確定」才送出
  const confirmDelete = async () => {
    fireEvent.click(screen.getByRole('button', { name: '刪除' }))
    const dialog = await screen.findByRole('dialog', { name: '確定要刪除這筆打卡紀錄嗎？' })
    fireEvent.click(within(dialog).getByRole('button', { name: '確定' }))
  }

  it('刪除：送出該筆 uuid，成功後重查；失敗時提示並可再按', async () => {
    let n = 0
    const utils = setup({
      fixtures: { deleteAttendantRecord: () => (n++ === 0 ? new Error('不能刪') : { deleteAttendantRecord: true }) },
    })
    await ready(utils)
    await openPanel('回13:00')
    expect(screen.getByText(/13:00 - 歸回/)).toBeInTheDocument()
    await confirmDelete()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '不能刪', variant: 'error' }))
    expect(screen.getByRole('button', { name: '刪除' })).not.toBeDisabled()
    await confirmDelete()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除成功', variant: 'success' }))
    expect(callsOf(utils.calls, 'deleteAttendantRecord').map(c => c.variables)).toEqual([
      { clockInScheduleUUId: 'COMPUTER-5-13' },
      { clockInScheduleUUId: 'COMPUTER-5-13' },
    ])
  })

  it('後端回 false：不提示成功、不重查', async () => {
    const utils = setup({
      fixtures: { deleteAttendantRecord: { deleteAttendantRecord: false }, UPDATA_ATTENDANT_RECORD: { updateAttendantRecord: false } },
    })
    await ready(utils)
    await openPanel('下18:00')
    expect(screen.getByText(/18:00 - 下班/)).toBeInTheDocument()
    const before = searches(utils.calls).length
    await confirmDelete()
    await utils.settle()
    fireEvent.click(screen.getByRole('button', { name: '編輯' }))
    fireEvent.click(await screen.findByRole('button', { name: '確認' }))
    await utils.settle()
    expect(openSnackbar).not.toHaveBeenCalled()
    expect(searches(utils.calls)).toHaveLength(before)
  })

  it('鍵盤：空白鍵也能開面板，其他按鍵不會', async () => {
    const utils = setup()
    await ready(utils)
    const target = within(dayCell(5)).getByText('上09:00').closest('[role="button"]')
    fireEvent.keyDown(target, { key: 'a' })
    expect(screen.queryByText(/已選取打卡記錄:/)).toBeNull()
    fireEvent.keyDown(target, { key: ' ' })
    expect(await screen.findByText(/已選取打卡記錄:/)).toBeInTheDocument()
  })

  it('QR code 打卡有定位也不提供查看位置', async () => {
    const utils = setup()
    await ready(utils)
    const qrDay = Object.keys(KINDS).indexOf('QRCODE') + 1
    fireEvent.click(within(dayCell(qrDay)).getByText('上09:00').closest('[role="button"]'))
    await screen.findByText(/已選取打卡記錄:/)
    expect(screen.queryByText('查看位置')).toBeNull()
  })
})

describe('補打卡', () => {
  const openReClock = async () => {
    fireEvent.click(screen.getByRole('button', { name: '補打卡' }))
    return screen.findByText('補打卡', { selector: 'h2' })
  }

  it('沒有新增權限：沒有補打卡鈕', async () => {
    const utils = setup({ add: false })
    await ready(utils)
    expect(screen.queryByRole('button', { name: '補打卡' })).toBeNull()
  })

  it('時間有誤、未來時間、沒選員工都擋下；送出時間、員工與打卡類型，成功後關閉並重查', async () => {
    const utils = setup({ fixtures: { SET_ADD_EMPLOYEE_CLOCK_IN_SCHEDULE: { addAttendantRecord: true } } })
    await ready(utils)
    await openReClock()
    const time = screen.getByLabelText('選取時間')
    fireEvent.change(time, { target: { value: '輸入未完成' } })
    fireEvent.click(screen.getByRole('button', { name: '確認' }))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '時間有誤', variant: 'warning' })
    fireEvent.change(time, { target: { value: String(Date.now() + 3600000) } })
    fireEvent.click(screen.getByRole('button', { name: '確認' }))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請選取過去的時間', variant: 'warning' })
    fireEvent.change(time, { target: { value: String(at(20, 18, 30)) } })
    fireEvent.click(screen.getByRole('button', { name: '確認' }))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請選取員工', variant: 'warning' })
    fireEvent.click(screen.getByRole('button', { name: '下班' }))
    const dialog = screen.getByText('補打卡', { selector: 'h2' }).closest('[role="dialog"]')
    const employee = within(dialog).getByLabelText('員工姓名/編號')
    fireEvent.change(employee, { target: { value: '阿明' } })
    expect(within(dialog).queryByText('設計師小美-02')).toBeNull()
    fireEvent.change(employee, { target: { value: '' } })
    fireEvent.click(within(dialog).getByText('助理阿明(無代號)'))
    fireEvent.mouseDown(within(dialog).getByRole('button', { name: '清除' }))
    fireEvent.click(screen.getByRole('button', { name: '確認' }))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請選取員工', variant: 'warning' })
    fireEvent.change(employee, { target: { value: '小美' } })
    fireEvent.click(within(dialog).getByText('設計師小美-02'))
    const before = searches(utils.calls).length
    fireEvent.click(screen.getByRole('button', { name: '確認' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '新增打卡成功', variant: 'success' }))
    expect(callsOf(utils.calls, 'SET_ADD_EMPLOYEE_CLOCK_IN_SCHEDULE').map(c => c.variables)).toEqual([
      { input: { date: at(20, 18, 30), userId: 'u2', status: 'CLOCKOUT' } },
    ])
    await wait(() => expect(screen.queryByText('補打卡', { selector: 'h2' })).toBeNull())
    await wait(() => expect(searches(utils.calls).length).toBe(before + 1))
  })

  it('補打卡失敗提示原因並可再按；後端回 false 時不關窗；取消關閉', async () => {
    let n = 0
    const utils = setup({
      fixtures: { SET_ADD_EMPLOYEE_CLOCK_IN_SCHEDULE: () => (n++ === 0 ? new Error('重複打卡') : { addAttendantRecord: false }) },
    })
    await ready(utils)
    await openReClock()
    fireEvent.change(screen.getByLabelText('選取時間'), { target: { value: String(at(20, 9)) } })
    const dialog = screen.getByText('補打卡', { selector: 'h2' }).closest('[role="dialog"]')
    fireEvent.change(within(dialog).getByLabelText('員工姓名/編號'), { target: { value: '小美' } })
    fireEvent.click(within(dialog).getByText('設計師小美-02'))
    fireEvent.click(screen.getByRole('button', { name: '確認' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '重複打卡', variant: 'error' }))
    expect(screen.getByRole('button', { name: '確認' })).not.toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '確認' }))
    await wait(() => expect(callsOf(utils.calls, 'SET_ADD_EMPLOYEE_CLOCK_IN_SCHEDULE')).toHaveLength(2))
    await utils.settle()
    expect(screen.getByText('補打卡', { selector: 'h2' })).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByText('補打卡', { selector: 'h2' })).toBeNull())
  })
})

describe('報表匯出', () => {
  it('一般與人資格式：帶入篩選條件與「匯出打卡類型」，取得網址後自動下載', async () => {
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    try {
      const utils = setup({
        fixtures: {
          FETCH_ATTENDANCE_RECORDS_EXCELV2: { attendanceRecordsExcelV2: 'https://files.example/a.xlsx' },
          FETCH_ATTENDANCE_RECORDS_EXCELV2_FOR_HR: { attendanceRecordsExcelV2ForHR: 'https://files.example/hr.xlsx' },
        },
      })
      await ready(utils)
      fireEvent.click(screen.getByRole('button', { name: '報表匯出' }))
      await wait(() => expect(click).toHaveBeenCalledTimes(1))
      expect(click.mock.instances[0].href).toBe('https://files.example/a.xlsx')
      expect(callsOf(utils.calls, 'FETCH_ATTENDANCE_RECORDS_EXCELV2')[0].variables.input).toMatchObject({
        userId: '', distanceFilter: ALL_FILTERS, isTypeDisplay: true,
      })
      fireEvent.click(screen.getByLabelText('匯出打卡類型'))
      fireEvent.click(screen.getByRole('button', { name: '報表匯出(人資格式)' }))
      await wait(() => expect(click).toHaveBeenCalledTimes(2))
      expect(click.mock.instances[1].href).toBe('https://files.example/hr.xlsx')
      expect(callsOf(utils.calls, 'FETCH_ATTENDANCE_RECORDS_EXCELV2_FOR_HR')[0].variables.input).toMatchObject({
        userId: '', distanceFilter: ALL_FILTERS, isTypeDisplay: false,
        dateRange: { startDate: MONTH.getTime(), endDate: new Date(2025, 2, 31, 23, 59, 59, 999).getTime() },
      })
    } finally {
      click.mockRestore()
    }
  })
})
