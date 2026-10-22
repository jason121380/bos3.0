// 保護「考勤排班總表」：店長為每位員工每天排考勤班別，打卡遲到／早退依此判斷。守住：
// - 查詢送出選的那個月（月初 00:00 到月底 23:59:59.999）；表頭列出整月每天與星期
// - 只有按「編輯班表」後才能改；選班別後點空格排班、點已排的格子改成選的班別、再點同班別或沒選班別時清除；
//   點日期欄頭整欄套用、點員工名稱整列套用（只套用可編輯的日子）
// - 過去的日子不能改（灰底）；店家開啟「編輯過往班別」時可切換成只改過去的日子；過去月份沒開此設定時不能儲存
// - 儲存送出每位員工每天的班別 id（清除的送 null）；成功提示並結束編輯，失敗提示原因
// - 報表匯出取得下載網址後自動下載
// 日期都相對「現在」計算（下個月＝全部未來、上個月＝全部過去）。GraphQL 全由模擬 link 回應，不連後端、不改真實班表。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { endOfMonth, startOfMonth, getDaysInMonth, format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import AttendanceEmployeeSchedule from '..'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))

const now = new Date()
const NEXT = new Date(now.getFullYear(), now.getMonth() + 1, 1)
const LAST = new Date(now.getFullYear(), now.getMonth() - 1, 1)
const dayOf = (month, d) => new Date(month.getFullYear(), month.getMonth(), d).getTime()
const routeFor = month => `/attendance/schedule?startDate=${month.getTime()}&endDate=${endOfMonth(month).getTime()}`

const TAGS = [
  { id: 't-a', name: '早班', clockInHour: 9, clockInMinute: 0, clockOutHour: 18, clockOutMinute: 0, color: '#1976d2' },
  { id: 't-b', name: '晚班', clockInHour: 13, clockInMinute: 30, clockOutHour: 22, clockOutMinute: 5, color: '#ffeb3b' },
]
const tag = t => ({ id: t.id, name: t.name, color: t.color })
const scheduleFor = month => [
  {
    user: { id: 'u1', name: '王小美' },
    clockInSchedule: [
      { date: dayOf(month, 1), clockInSetting: tag(TAGS[0]) },
      { date: dayOf(month, 2), clockInSetting: { id: null, name: null, color: null } },
    ],
  },
  { user: { id: 'u2', name: '李大華' }, clockInSchedule: [] },
]

const setup = ({ month = NEXT, tags = TAGS, workingHour = true, ues = false, fixtures = {} } = {}) =>
  renderPage(<AttendanceEmployeeSchedule />, {
    route: routeFor(month),
    fixtures: {
      GET_MERCHANT_CLOCK_IN_SCHEDULE: { getMerchantClockInSetting: tags },
      GET_IS_EMPLOYEE_SCHEDULE_WORKING_HOUR_DISPLAY: { getIsEmployeeScheduleWorkingHourDisplay: workingHour },
      GET_UES_USEING_SETTING: { getUESUsingSetting: ues },
      GET_EMPLOYEE_CLOCK_IN_SCHEDULE: ({ input }) => ({ getEmployeeClockInSchedule: scheduleFor(new Date(input.startDate)) }),
      SET_EMPLOYEE_CLOCK_IN_SCHDULE: { setEmployeeClockInSchedule: true },
      ...fixtures,
    },
  })
const ready = async utils => {
  await utils.settle()
  await screen.findByText('王小美')
}

const rowOf = name => screen.getByText(name).closest('tr')
const cell = (name, day) => rowOf(name).children[day]
const header = day => screen.getAllByRole('columnheader')[day]
const tagButton = name => within(document.querySelector('.ScheduleTags')).getByRole('button', { name: new RegExp(`^${name}`) })
const pickTag = name => fireEvent.click(tagButton(name))
const startEditing = () => fireEvent.click(screen.getByRole('button', { name: '編輯班表' }))
const saveButton = () => screen.getByRole('button', { name: '儲存' })
const sent = calls => callsOf(calls, 'SET_EMPLOYEE_CLOCK_IN_SCHDULE').map(c => c.variables.input)

beforeEach(() => loginAs())
afterEach(cleanup)

describe('顯示', () => {
  it('查詢選的月份；表頭列出整月每天與星期；班別顯示上下班時間，亮色班別用黑字', async () => {
    const utils = setup()
    await ready(utils)
    expect(callsOf(utils.calls, 'GET_EMPLOYEE_CLOCK_IN_SCHEDULE').pop().variables).toEqual({
      input: { startDate: startOfMonth(NEXT).getTime(), endDate: endOfMonth(NEXT).getTime() },
    })
    const heads = screen.getAllByRole('columnheader').map(h => h.textContent)
    expect(heads).toHaveLength(getDaysInMonth(NEXT) + 1)
    const weekday = ['(日)', '(一)', '(二)', '(三)', '(四)', '(五)', '(六)'][NEXT.getDay()]
    expect(heads[1]).toBe(`${format(NEXT, 'MM/dd')}${weekday}`)
    expect(screen.getByText('共 2 人')).toBeInTheDocument()
    expect(screen.getByText('09:00~18:00')).toBeInTheDocument()
    expect(screen.getByText('13:30~22:05')).toHaveStyle('color: black')
    expect(screen.getByText('09:00~18:00')).toHaveStyle('color: white')
    // 已排早班、2 號清除過（空格）
    expect(within(cell('王小美', 1)).getByText('早班')).toBeInTheDocument()
    expect(cell('王小美', 2).textContent).toBe('')
  })

  it('不顯示工時設定：班別按鈕只有名稱；沒有班別設定時顯示無資料', async () => {
    const utils = setup({ workingHour: false, tags: [] })
    await ready(utils)
    expect(screen.queryByText('09:00~18:00')).toBeNull()
    expect(screen.getByText('無資料')).toBeInTheDocument()
    cleanup()
    const again = setup({ workingHour: false })
    await ready(again)
    expect(tagButton('早班').textContent).toBe('早班')
  })

  // Jason 2026/10/22 fix all：班表查詢失敗時 index.js 原本把 employeeSchedule 設成 undefined，Results.js 讀 .length 整頁進錯誤畫面；
  // 改為 `idx(...) || []`，顯示「共 0 人」的空表。
  it('班表查詢失敗：顯示空表（共 0 人），不進錯誤畫面', async () => {
    const utils = renderPage(<AttendanceEmployeeSchedule />, { route: routeFor(NEXT), fallback: 'error' })
    await utils.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(await screen.findByText('共 0 人')).toBeInTheDocument()
  })
})

describe('排班', () => {
  it('還沒按編輯：點格子、欄頭、員工名稱都不會改', async () => {
    const utils = setup()
    await ready(utils)
    pickTag('晚班')
    fireEvent.click(cell('李大華', 3))
    fireEvent.click(header(3))
    fireEvent.click(screen.getByText('李大華'))
    fireEvent.click(within(cell('王小美', 1)).getByRole('button'))
    fireEvent.click(cell('王小美', 2))
    expect(cell('李大華', 3).textContent).toBe('')
    expect(within(cell('王小美', 1)).getByText('早班')).toBeInTheDocument()
  })

  it('選班別後點空格排班、點已排的改成選的班別；再點同班別清除；沒選班別時點空格不變、點已排的清除；儲存送出', async () => {
    const utils = setup()
    await ready(utils)
    startEditing()
    // 沒選班別：點空格不變
    fireEvent.click(cell('李大華', 3))
    expect(cell('李大華', 3).textContent).toBe('')
    pickTag('晚班')
    expect(tagButton('晚班')).toHaveClass('btn_focus')
    fireEvent.click(cell('李大華', 3))
    expect(within(cell('李大華', 3)).getByText('晚班')).toBeInTheDocument()
    // 王小美 3 號沒排（他其他天有排）：點了排晚班
    fireEvent.click(cell('王小美', 3))
    expect(within(cell('王小美', 3)).getByText('晚班')).toBeInTheDocument()
    fireEvent.click(within(cell('王小美', 3)).getByRole('button'))
    // 王小美 2 號原本清除過（id null 的紀錄）：點了改排晚班
    fireEvent.click(cell('王小美', 2))
    expect(within(cell('王小美', 2)).getByText('晚班')).toBeInTheDocument()
    // 已排早班改成晚班
    fireEvent.click(within(cell('王小美', 1)).getByRole('button'))
    expect(within(cell('王小美', 1)).getByText('晚班')).toBeInTheDocument()
    // 再點同班別：清除
    fireEvent.click(within(cell('李大華', 3)).getByRole('button'))
    expect(cell('李大華', 3).textContent).toBe('')
    // 取消選取班別後點已排的：清除
    pickTag('晚班')
    expect(tagButton('晚班')).not.toHaveClass('btn_focus')
    fireEvent.click(within(cell('王小美', 2)).getByRole('button'))
    expect(cell('王小美', 2).textContent).toBe('')
    fireEvent.click(saveButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '儲存成功!', variant: 'success' }))
    expect(sent(utils.calls)).toEqual([
      [
        {
          userId: 'u1',
          clockInSchedule: [
            { date: dayOf(NEXT, 1), clockInSettingId: 't-b' },
            { date: dayOf(NEXT, 2), clockInSettingId: null },
            { date: dayOf(NEXT, 3), clockInSettingId: null },
          ],
        },
        { userId: 'u2', clockInSchedule: [{ date: dayOf(NEXT, 3), clockInSettingId: null }] },
      ],
    ])
    // 儲存成功後結束編輯
    expect(screen.getByRole('button', { name: '編輯班表' })).toBeInTheDocument()
  })

  it('點日期欄頭：整欄套用（已排的改、沒排的加）；沒選班別時只清除已排的', async () => {
    const utils = setup()
    await ready(utils)
    startEditing()
    pickTag('晚班')
    fireEvent.click(header(1))
    expect(within(cell('王小美', 1)).getByText('晚班')).toBeInTheDocument()
    expect(within(cell('李大華', 1)).getByText('晚班')).toBeInTheDocument()
    pickTag('晚班')
    fireEvent.click(header(1))
    expect(cell('王小美', 1).textContent).toBe('')
    expect(cell('李大華', 1).textContent).toBe('')
    // 沒選班別、沒排的那欄：不新增
    fireEvent.click(header(5))
    expect(cell('李大華', 5).textContent).toBe('')
  })

  it('點員工名稱：整列可編輯的日子都套用；沒選班別時清除該員工已排的', async () => {
    const utils = setup()
    await ready(utils)
    startEditing()
    // 沒選班別：沒排過的員工點了不新增
    fireEvent.click(screen.getByText('李大華'))
    expect(within(rowOf('李大華')).queryAllByRole('button')).toHaveLength(0)
    pickTag('早班')
    fireEvent.click(screen.getByText('李大華'))
    const days = getDaysInMonth(NEXT)
    expect(within(rowOf('李大華')).getAllByText('早班')).toHaveLength(days)
    fireEvent.click(screen.getByText('王小美'))
    expect(within(rowOf('王小美')).getAllByText('早班')).toHaveLength(days)
    pickTag('早班')
    fireEvent.click(screen.getByText('王小美'))
    expect(within(rowOf('王小美')).queryAllByText('早班')).toHaveLength(0)
  })

  it('儲存：後端回失敗或錯誤時提示原因、維持編輯', async () => {
    const utils = setup({
      fixtures: {
        SET_EMPLOYEE_CLOCK_IN_SCHDULE: (() => {
          let i = 0
          return () => (i++ === 0 ? { setEmployeeClockInSchedule: false } : new Error('班別已停用'))
        })(),
      },
    })
    await ready(utils)
    startEditing()
    fireEvent.click(saveButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '儲存失敗!', variant: 'warning' }))
    await wait(() => expect(saveButton()).not.toBeDisabled())
    fireEvent.click(saveButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '班別已停用', variant: 'error' }))
    expect(saveButton()).toBeInTheDocument()
  })
})

describe('過去的日子', () => {
  it('上個月：格子灰底不能點，仍顯示已排班別；沒開「編輯過往班別」時不能儲存', async () => {
    const utils = setup({ month: LAST })
    await ready(utils)
    startEditing()
    expect(cell('王小美', 1)).toHaveClass('beforeToday')
    expect(within(cell('王小美', 1)).getByText('早班')).toBeInTheDocument()
    expect(cell('王小美', 2)).toHaveClass('beforeToday')
    pickTag('晚班')
    fireEvent.click(cell('李大華', 3))
    fireEvent.click(header(3))
    fireEvent.click(screen.getByText('李大華'))
    expect(cell('李大華', 3).textContent).toBe('')
    expect(saveButton()).toBeDisabled()
    expect(screen.queryByText('編輯過往班別')).toBeNull()
  })

  it('店家開啟「編輯過往班別」：可儲存過去月份；打開開關後可改過去的日子', async () => {
    const utils = setup({ month: LAST, ues: true })
    await ready(utils)
    startEditing()
    await wait(() => expect(saveButton()).not.toBeDisabled())
    pickTag('晚班')
    fireEvent.click(cell('李大華', 3))
    expect(cell('李大華', 3).textContent).toBe('')
    fireEvent.click(screen.getByRole('switch'))
    fireEvent.click(cell('李大華', 3))
    expect(within(cell('李大華', 3)).getByText('晚班')).toBeInTheDocument()
    expect(cell('李大華', 3)).not.toHaveClass('beforeToday')
  })

  // Jason 2026/10/22 決定視為 bug（fix all）：「編輯過往班別」打開後，可編輯的範圍原本從「今天以後」整個換成「今天以前」，
  // 未來的日子反而變成灰底不能改（Results.js `editBefore ? isAfter : isBefore`）；改為額外允許今天以前，今天以後照樣可編輯。
  it('打開「編輯過往班別」後，未來的日子仍可排班', async () => {
    const utils = setup({ month: NEXT, ues: true })
    await ready(utils)
    startEditing()
    fireEvent.click(screen.getByRole('switch'))
    expect(cell('李大華', 3)).not.toHaveClass('beforeToday')
    pickTag('晚班')
    fireEvent.click(cell('李大華', 3))
    expect(within(cell('李大華', 3)).getByText('晚班')).toBeInTheDocument()
  })

  it('本月：今天可以排班', async () => {
    const thisMonth = startOfMonth(now)
    const utils = setup({ month: thisMonth })
    await ready(utils)
    startEditing()
    pickTag('晚班')
    fireEvent.click(cell('李大華', now.getDate()))
    expect(within(cell('李大華', now.getDate())).getByText('晚班')).toBeInTheDocument()
  })
})

describe('報表匯出', () => {
  it('匯出該月班表：取得下載網址後自動下載；沒有網址時不下載', async () => {
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    try {
      const utils = setup({ fixtures: { FETCH_GET_EMPLOYEE_CLOCK_IN_SCHEDULE_EXCEL: { getEmployeeClockInScheduleExcel: 'https://files.example/schedule.xlsx' } } })
      await ready(utils)
      fireEvent.click(screen.getByRole('button', { name: '報表匯出' }))
      await wait(() => expect(click).toHaveBeenCalledTimes(1))
      expect(callsOf(utils.calls, 'FETCH_GET_EMPLOYEE_CLOCK_IN_SCHEDULE_EXCEL')[0].variables).toEqual({
        input: { startDate: startOfMonth(NEXT).getTime(), endDate: endOfMonth(NEXT).getTime() },
      })
      expect(click.mock.instances[0].href).toBe('https://files.example/schedule.xlsx')
      cleanup()
      click.mockClear()
      const none = setup({ fixtures: { FETCH_GET_EMPLOYEE_CLOCK_IN_SCHEDULE_EXCEL: { getEmployeeClockInScheduleExcel: null } } })
      await ready(none)
      fireEvent.click(screen.getByRole('button', { name: '報表匯出' }))
      await none.settle()
      expect(click).not.toHaveBeenCalled()
    } finally {
      click.mockRestore()
    }
  })
})
