// 保護「現場電腦打卡」：員工在店內電腦上打上班／下班／外出／歸來。守住：
// - 查詢選的那一天（含距離篩選條件）；狀態欄依今天最後一段打卡顯示未打卡／上班中／外出中／已下班
// - 按鈕依狀態開放：還沒上班（或已下班）只能按上班；上班中可下班、外出；外出中按鈕變「歸來」；不是今天全部停用
// - 打卡送出員工 id 與打卡類型；成功提示並重抓狀態與列表；後端拒絕時顯示原因
// - 時間欄：上班—下班、外出時段（多段以逗號分隔），遲到的上班、早退的下班標紅，距離超過 25／50 公尺以警告／危險色
// - 店家開啟篩選時才有篩選鈕，搜尋帶入選的距離條件
// GraphQL 全由模擬 link 回應，不連後端、不建立真實打卡。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { startOfDay, endOfDay, subDays } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import EmployeeClockIn from '..'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))

const today = new Date()
const at = (h, m = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m).getTime()
const p = (h, m = 0, distanceValue = 'LOWERTHAN25') => ({ time: at(h, m), distanceValue })
const NONE = { time: null, distanceValue: null }
const user = (id, extra) => ({ userId: id, userName: id, userNickName: null, userNo: null, isLate: false, isLeaveEarly: false, clockInSetting: null, clockInRecord: [], ...extra })

const USERS = [
  user('u1', { userName: '王小美', userNickName: 'Amy', userNo: '01', isLate: true, clockInSetting: { name: '早班' }, clockInRecord: [{ in: p(9, 10), out: null, breakRecord: [] }] }),
  user('u2', { userName: '李大華' }),
  user('u3', { userName: '張三', clockInRecord: [{ in: p(9), out: null, breakRecord: [{ start: p(12), end: null }] }] }),
  user('u4', { userName: '趙四', clockInRecord: [{ in: p(9), out: null, breakRecord: [{ start: p(12), end: p(13) }] }] }),
  user('u5', {
    userName: '錢五',
    isLate: true,
    isLeaveEarly: true,
    clockInRecord: [
      { in: p(9), out: p(12), breakRecord: [{ start: p(10), end: p(10, 30) }] },
      {
        in: p(13, 0, 'BETWEEN25AND50'),
        out: p(17, 0, 'MORETHAN50'),
        breakRecord: [
          { start: p(14), end: null },
          { start: p(15), end: p(15, 30, 'MORETHAN50') },
          { start: NONE, end: null },
          { start: NONE, end: p(16) },
          { start: p(16, 30), end: null },
        ],
      },
    ],
  }),
  user('u6', {
    userName: '孫六',
    clockInRecord: [
      { in: NONE, out: p(8), breakRecord: [{ start: NONE, end: null }, { start: NONE, end: NONE }] },
      { in: NONE, out: null, breakRecord: [{ start: NONE, end: NONE }] },
      { in: p(10), out: null, breakRecord: [] },
      // 沒有上班時間、只有下班
      { in: NONE, out: p(19), breakRecord: [] },
      { in: p(20), out: null, breakRecord: [] },
    ],
  }),
  user('u7', { userName: '周七', clockInRecord: [{ in: p(9), out: null, breakRecord: [{ start: NONE, end: p(11) }] }] }),
]

const setup = ({ route = '/clockin', filter = true, fixtures = {} } = {}) =>
  renderPage(<EmployeeClockIn />, {
    route,
    fixtures: {
      FETCH_DAILY_CLOCKIN_RECORD: { dailyClockInRecord: USERS },
      GET_EMPLOYEECLOCKIN_DISPLAY: { getParameterReportSetting: { isEDCIFilterDisplay: filter } },
      SET_USER_CLOCK_IN: { userClockIn: { status: true, message: null } },
      ...fixtures,
    },
  })
const ready = async utils => {
  await utils.settle()
  await screen.findByText('王小美')
}
const rowOf = name => screen.getByText(name).closest('tr')
const btn = (name, label) => within(rowOf(name)).getByRole('button', { name: label })
const timeCell = name => rowOf(name).children[5]
const lists = calls => callsOf(calls, 'FETCH_DAILY_CLOCKIN_RECORD').filter(c => c.variables.distanceFilter)
const ALL = ['NULL', 'ZERO', 'LOWERTHAN25', 'BETWEEN25AND50', 'MORETHAN50']

beforeEach(() => loginAs())
afterEach(cleanup)

describe('狀態與按鈕', () => {
  it('依今天最後一段打卡顯示狀態；代號、暱稱、班別', async () => {
    const utils = setup()
    await ready(utils)
    expect(lists(utils.calls)[0].variables).toEqual({ date: expect.any(Number), distanceFilter: ALL })
    expect(new Date(lists(utils.calls)[0].variables.date).toDateString()).toBe(today.toDateString())
    expect(within(rowOf('王小美')).getByText('上班中')).toBeInTheDocument()
    expect(within(rowOf('王小美')).getByText('01')).toBeInTheDocument()
    expect(within(rowOf('王小美')).getByText('Amy')).toBeInTheDocument()
    expect(within(rowOf('王小美')).getByText('早班')).toBeInTheDocument()
    expect(within(rowOf('李大華')).getByText('未打卡')).toBeInTheDocument()
    expect(within(rowOf('李大華')).getByText('無代號')).toBeInTheDocument()
    expect(within(rowOf('張三')).getByText('外出中')).toBeInTheDocument()
    expect(within(rowOf('趙四')).getByText('上班中')).toBeInTheDocument()
    expect(within(rowOf('錢五')).getByText('已下班')).toBeInTheDocument()
    expect(within(rowOf('孫六')).getByText('上班中')).toBeInTheDocument()
  })

  it('按鈕：未打卡／已下班只能上班；上班中可下班與外出；外出中按鈕變歸來', async () => {
    const utils = setup()
    await ready(utils)
    expect(btn('李大華', '上班')).not.toBeDisabled()
    expect(btn('李大華', '下班')).toBeDisabled()
    expect(btn('李大華', '外出')).toBeDisabled()
    expect(btn('錢五', '上班')).not.toBeDisabled()
    expect(btn('錢五', '下班')).toBeDisabled()
    expect(btn('王小美', '上班')).toBeDisabled()
    expect(btn('王小美', '下班')).not.toBeDisabled()
    expect(btn('王小美', '外出')).not.toBeDisabled()
    expect(btn('張三', '歸來')).not.toBeDisabled()
    expect(btn('趙四', '外出')).not.toBeDisabled()
  })

  it('打卡：送出員工 id 與類型（上班、下班、外出、歸來）；成功提示並重抓狀態與列表', async () => {
    const utils = setup()
    await ready(utils)
    const before = callsOf(utils.calls, 'FETCH_DAILY_CLOCKIN_RECORD').length
    fireEvent.click(btn('李大華', '上班'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '打卡成功', variant: 'success' }))
    await utils.settle()
    expect(callsOf(utils.calls, 'FETCH_DAILY_CLOCKIN_RECORD').length).toBe(before + 2)
    fireEvent.click(btn('王小美', '下班'))
    fireEvent.click(btn('王小美', '外出'))
    fireEvent.click(btn('張三', '歸來'))
    await utils.settle()
    expect(callsOf(utils.calls, 'SET_USER_CLOCK_IN').map(c => c.variables.input)).toEqual([
      { userIds: ['u2'], status: 'CLOCKIN' },
      { userIds: ['u1'], status: 'CLOCKOUT' },
      { userIds: ['u1'], status: 'BREAKSTART' },
      { userIds: ['u3'], status: 'BREAKEND' },
    ])
  })

  it('後端拒絕打卡：顯示原因；錯誤時顯示錯誤訊息', async () => {
    let n = 0
    const utils = setup({
      fixtures: { SET_USER_CLOCK_IN: () => (n++ === 0 ? { userClockIn: { status: false, message: '不在店內範圍' } } : new Error('伺服器忙碌')) },
    })
    await ready(utils)
    fireEvent.click(btn('李大華', '上班'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '不在店內範圍', variant: 'warning' }))
    fireEvent.click(btn('李大華', '上班'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '伺服器忙碌', variant: 'error' }))
  })

  it('不是今天：所有打卡按鈕停用', async () => {
    const y = subDays(today, 1)
    const utils = setup({ route: `/clockin?startDate=${startOfDay(y).getTime()}&endDate=${endOfDay(y).getTime()}` })
    await ready(utils)
    expect(new Date(lists(utils.calls).pop().variables.date).toDateString()).toBe(startOfDay(y).toDateString())
    expect(btn('李大華', '上班')).toBeDisabled()
    expect(btn('王小美', '下班')).toBeDisabled()
  })
})

describe('時間欄', () => {
  // 2026/10/28：距離除顏色外另加文字標記（WCAG 1.4.1），超過 50 公尺的時間後面接「（距門市 50m+）」
  it('上班—下班與外出時段；遲到的上班、早退的下班標紅；多段之間有分隔線；距離以顏色區分', async () => {
    const utils = setup()
    await ready(utils)
    expect(timeCell('王小美').textContent).toBe('上班時間：09:10')
    expect(within(timeCell('王小美')).getByText('09:10').className).toMatch(/text-danger/)
    expect(timeCell('張三').textContent).toBe('上班時間：09:00外出時間：12:00')
    expect(timeCell('趙四').textContent).toBe('上班時間：09:00外出時間：12:00 - 13:00')
    const five = timeCell('錢五')
    expect(five.textContent).toBe(
      '上班時間：09:00 - 12:00外出時間：10:00 - 10:30上班時間：13:00 - 17:00外出時間：14:00, 15:00 - 15:30（距門市 50m+）,  - 16:00, 16:30'
    )
    expect(five.querySelectorAll('hr')).toHaveLength(1)
    // 只有最後一段的下班標紅（早退），第一段不標
    expect(within(five).getByText('12:00').className).not.toMatch(/text-danger/)
    expect(within(five).getByText('17:00').className).toMatch(/text-danger/)
    expect(within(five).getByText('09:00').className).not.toMatch(/text-danger/)
    expect(within(five).getByText('13:00')).toHaveStyle('color: rgb(var(--warning))')
    expect(within(five).getByText('17:00')).toHaveStyle('color: rgb(var(--danger))')
    expect(within(five).getByText('15:30')).toHaveStyle('color: rgb(var(--danger))')
    // 缺時間的紀錄：只顯示有的部分；全空的外出紀錄整筆不顯示（原本會留下「, - 」分隔符號，Jason 2026/10/22 fix all）
    const six = timeCell('孫六')
    expect(six.textContent).toBe('上班時間： - 08:00上班時間：10:00上班時間： - 19:00上班時間：20:00')
    expect(six.querySelectorAll('hr')).toHaveLength(3)
    expect(timeCell('周七').textContent).toBe('上班時間：09:00外出時間： - 11:00')
  })
})

describe('篩選', () => {
  it('店家未開啟：沒有篩選鈕', async () => {
    const utils = setup({ filter: false })
    await ready(utils)
    expect(screen.queryByRole('button', { name: /篩選/ })).toBeNull()
  })

  it('移除距離條件後搜尋：送出剩下的條件；再按篩選收起', async () => {
    const utils = setup()
    await ready(utils)
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    fireEvent.mouseDown(screen.getByRole('button', { name: '移除 未知' }))
    fireEvent.mouseDown(screen.getByRole('button', { name: '移除 超過50M' }))
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    await utils.settle()
    expect(lists(utils.calls).pop().variables.distanceFilter).toEqual(['ZERO', 'LOWERTHAN25', 'BETWEEN25AND50'])
    // 從選單勾回「未知」
    const input = screen.getByLabelText('篩選打卡記錄')
    fireEvent.change(input, { target: { value: '未' } })
    fireEvent.click(await screen.findByText('未知'))
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    await utils.settle()
    expect(lists(utils.calls).pop().variables.distanceFilter).toEqual(['ZERO', 'LOWERTHAN25', 'BETWEEN25AND50', 'NULL'])
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    expect(screen.queryByRole('button', { name: '搜尋' })).toBeNull()
  })
})
