// 保護「排班表」（輪牌）：櫃台依班表順序派客，每個動作都會把整份班表（JSON）存回後端，其他電腦經 socket 同步。守住：
// - 每個動作送出的 schedule 內容（人員順序、是否已標記時間）與目前班表 id（currentScheduleId）
// - 上移／下移／移到最後：只和「未標記時間」的人交換，已標記的人留在原位；第一位上移、最後一位下移時繞到另一端
// - 標記時間（勾選）記下當下時間、取消時歸零；移除人員；最後一位被移除時留一個空列
// - 新增／刪除班表（刪除需確認）、改班表名稱（Enter 才存）、新增人員（加在原有人員後面；班表原本是空的則取代空列）
// - 復原／重做只在店家開啟時顯示，依是否為第一版／最後一版停用；後端回「當前班表已過期」時重抓班表
// - 其他電腦更新（socket）時套用新班表、提示並關閉開著的視窗
// 已知缺口於 2026/10/22 修正（Jason fix all，見各測試註解）。人員自動完成以簡化版代替；GraphQL 全由模擬 link 回應，不連後端、不改真實班表。
import React from 'react'
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { socketActions } from 'store/socket'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import EmployeeSchedule from '..'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.mock('components/EmployeeAutoComplete', () => ({ onChange, onKeyDown, value }) => (
  <div data-testid="employee-picker" data-value={value || ''}>
    <input aria-label="人員" onKeyDown={onKeyDown} readOnly value={value || ''} />
    <button type="button" onClick={() => onChange({ userId: 'u5' })}>
      選小陳
    </button>
    <button type="button" onClick={() => onChange({ userId: 'u6' })}>
      選小林
    </button>
    <button type="button" onClick={() => onChange({})}>
      清除人員
    </button>
  </div>
))

const T = new Date(2025, 2, 10, 9, 5).getTime()
const USERS = [
  { id: 'u1', name: '王小美', nickName: 'Amy', designerNo: '01' },
  { id: 'u2', name: '李大華', nickName: null, designerNo: '02' },
  { id: 'u3', name: '張三', nickName: '', designerNo: null },
  { id: 'u4', name: '趙四', nickName: '阿四', designerNo: '04' },
  { id: 'u5', name: '陳小', nickName: '小陳', designerNo: '05' },
  { id: 'u6', name: '林小', nickName: '小林', designerNo: '06' },
]
const NAME = { u1: 'Amy', u2: '李大華', u3: '張三', u4: '阿四', u5: '小陳', u6: '小林' }
const row = (designerId, timeAdded = false) => ({ designerId, timeAdded, time: timeAdded ? T : 0 })
const card = (cardName, rows, setName = true) => ({ cardName, setName, scheduleRow: rows })
// 預設：早班 = Amy、李大華（已標記）、張三、阿四
const MORNING = card('早班', [row('u1'), row('u2', true), row('u3'), row('u4')])

const scheduleOf = (cards, extra = {}) => ({ id: 's-1', schedule: JSON.stringify(cards), isFirst: false, isLast: true, ...extra })
const setup = ({ cards = [MORNING], undo = true, extra = {}, fixtures = {}, delays } = {}) =>
  renderPage(<EmployeeSchedule />, {
    delays,
    fixtures: {
      FETCH_EMPLOYEE_SCHEDULE: { getEmployeeSchedule: scheduleOf(cards, extra) },
      GET_USERS_IN_EMPLOYEE_SCHEDULE: { users: { users: USERS } },
      GET_IS_EMPLOYEE_SCHEDULE_UNDO_ACTIVE: { getIsEmployeeScheduleUndoActive: undo },
      SET_EMPLOYEE_SCHEDULE: ({ schedule }) => ({ setEmployeeSchedule: { id: 's-2', schedule, isFirst: false, isLast: true } }),
      ...fixtures,
    },
  })
const ready = async utils => {
  await utils.settle()
  await wait(() => expect(screen.getByRole('button', { name: /新增$/ })).not.toBeDisabled())
}

const cards = () => [...document.querySelectorAll('.ScheduleCard')]
const personRow = (name, cardIndex = 0) => within(cards()[cardIndex]).getByText(name).closest('[class*="min-h-[48px]"]')
const act$ = (name, label, cardIndex = 0) => fireEvent.click(within(personRow(name, cardIndex)).getByRole('button', { name: label }))
const saves = calls => callsOf(calls, 'SET_EMPLOYEE_SCHEDULE').map(c => ({ ...c.variables, schedule: JSON.parse(c.variables.schedule) }))
const lastSaved = calls => saves(calls).pop()
// 送出的班表人員順序（名稱＋* 表示已標記時間）
const order = (schedule, cardIndex = 0) =>
  schedule[cardIndex].scheduleRow.map(r => (r.designerId ? NAME[r.designerId] : '（空）') + (r.timeAdded ? '*' : ''))
const savedAfter = async (utils, n) => {
  await wait(() => expect(saves(utils.calls)).toHaveLength(n))
  await utils.settle()
  return lastSaved(utils.calls)
}

beforeEach(() => loginAs())
afterEach(cleanup)

describe('顯示', () => {
  it('列出班表名稱與人員（暱稱優先，沒有就用本名，並附編號）；已標記的人顯示標記時間且不能移動', async () => {
    const utils = setup()
    await ready(utils)
    expect(callsOf(utils.calls, 'GET_USERS_IN_EMPLOYEE_SCHEDULE')[0].variables).toEqual({ input: { MerchantId: 'merchant-1', pageLimit: 9999 } })
    expect(screen.getByText('早班')).toBeInTheDocument()
    expect(within(personRow('Amy')).getByText('01')).toBeInTheDocument()
    expect(personRow('李大華')).toBeInTheDocument()
    expect(personRow('張三')).toBeInTheDocument()
    expect(within(personRow('李大華')).getByText('03/10')).toBeInTheDocument()
    expect(within(personRow('李大華')).getByText('9:05')).toBeInTheDocument()
    expect(within(personRow('李大華')).getByLabelText('標記時間')).toBeChecked()
    expect(within(personRow('李大華')).queryByRole('button', { name: '上移' })).toBeNull()
    expect(within(personRow('Amy')).getByRole('button', { name: '上移' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /復原/ })).not.toBeDisabled()
    // 最後一版：重做停用
    expect(screen.getByRole('button', { name: /重做/ })).toBeDisabled()
  })

  it('後端還沒有班表（schedule 為 null）：顯示一張空白班表；名單外的人員顯示空白、空列不顯示操作', async () => {
    const utils = renderPage(<EmployeeSchedule />, {
      fixtures: {
        FETCH_EMPLOYEE_SCHEDULE: { getEmployeeSchedule: { id: 's-0', schedule: 'null', isFirst: true, isLast: true } },
        GET_USERS_IN_EMPLOYEE_SCHEDULE: { users: { users: USERS } },
        GET_IS_EMPLOYEE_SCHEDULE_UNDO_ACTIVE: { getIsEmployeeScheduleUndoActive: false },
      },
    })
    await ready(utils)
    expect(cards()).toHaveLength(1)
    expect(within(cards()[0]).getByPlaceholderText('排版標題')).toHaveValue('')
    expect(within(cards()[0]).queryByRole('button', { name: '移除人員' })).toBeNull()
    expect(screen.queryByRole('button', { name: /復原/ })).toBeNull()
    cleanup()

    const ghost = setup({ cards: [card('', [row('u-gone'), null, row('u1')])] })
    await ready(ghost)
    expect(screen.getByText('未命名班表')).toBeInTheDocument()
    expect(within(cards()[0]).getAllByRole('button', { name: '移除人員' })).toHaveLength(2)
  })

  it('載入中：顯示佔位、按鈕停用', async () => {
    const utils = setup({ delays: { GET_USERS_IN_EMPLOYEE_SCHEDULE: 300, FETCH_EMPLOYEE_SCHEDULE: 100 } })
    expect(screen.getAllByLabelText('載入中').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /新增$/ })).toBeDisabled()
    await ready(utils)
    expect(screen.queryAllByLabelText('載入中')).toHaveLength(0)
  })

  it('班表查詢晚於人員名單：先顯示卡片外框，人員區顯示載入中', async () => {
    const utils = setup({ delays: { FETCH_EMPLOYEE_SCHEDULE: 400 } })
    await wait(() => expect(cards().length).toBe(1))
    expect(within(cards()[0]).getByLabelText('載入中')).toBeInTheDocument()
    await ready(utils)
    expect(screen.getByText('早班')).toBeInTheDocument()
  })
})

describe('人員順序', () => {
  it('上移：和前面最近一位未標記的人交換（跳過已標記的）；送出目前班表 id', async () => {
    const utils = setup()
    await ready(utils)
    act$('張三', '上移')
    const saved = await savedAfter(utils, 1)
    expect(order(saved.schedule)).toEqual(['張三', '李大華*', 'Amy', '阿四'])
    expect(saved.currentScheduleId).toBe('s-1')
  })

  it('第一位上移：繞到最後，已標記的人留在原位', async () => {
    const utils = setup()
    await ready(utils)
    act$('Amy', '上移')
    expect(order((await savedAfter(utils, 1)).schedule)).toEqual(['張三', '李大華*', '阿四', 'Amy'])
  })

  it('前面都是已標記的人時上移：繞到最後', async () => {
    const utils = setup({ cards: [card('早班', [row('u2', true), row('u3'), row('u4')])] })
    await ready(utils)
    act$('張三', '上移')
    expect(order((await savedAfter(utils, 1)).schedule)).toEqual(['李大華*', '阿四', '張三'])
  })

  it('下移：和後面最近一位未標記的人交換（跳過已標記的）', async () => {
    const utils = setup()
    await ready(utils)
    act$('Amy', '下移')
    expect(order((await savedAfter(utils, 1)).schedule)).toEqual(['張三', '李大華*', 'Amy', '阿四'])
  })

  it('中間的人下移：與下一位交換；下一位已標記時往後找', async () => {
    const utils = setup()
    await ready(utils)
    act$('張三', '下移')
    expect(order((await savedAfter(utils, 1)).schedule)).toEqual(['Amy', '李大華*', '阿四', '張三'])
    cleanup()
    const again = setup({ cards: [card('早班', [row('u1'), row('u3'), row('u2', true), row('u4')])] })
    await ready(again)
    act$('張三', '下移')
    expect(order((await savedAfter(again, 1)).schedule)).toEqual(['Amy', '阿四', '李大華*', '張三'])
  })

  it('最後一位下移、或後面都是已標記的人：繞到最前面', async () => {
    const utils = setup()
    await ready(utils)
    act$('阿四', '下移')
    expect(order((await savedAfter(utils, 1)).schedule)).toEqual(['阿四', '李大華*', 'Amy', '張三'])
    cleanup()
    const again = setup({ cards: [card('早班', [row('u1'), row('u3'), row('u2', true)])] })
    await ready(again)
    act$('張三', '下移')
    expect(order((await savedAfter(again, 1)).schedule)).toEqual(['張三', 'Amy', '李大華*'])
  })

  // Jason 2026/10/22 fix all：ScheduleCard.js 的下移迴圈原本寫成 `i <= length`，第一位下移而後面全是已標記的人時
  // 讀到 scheduleRow[length]（undefined）拋錯、按鈕一直停用；改為 `i < length`，找不到可交換的人時不送出並恢復按鈕。
  it('第一位下移而後面都是已標記的人：不拋錯、不送出，按鈕恢復可用', async () => {
    const errors = []
    const onError = e => {
      errors.push(e.error || e.message)
      e.preventDefault()
    }
    window.addEventListener('error', onError)
    try {
      const utils = setup({ cards: [card('早班', [row('u1'), row('u2', true)])] })
      await ready(utils)
      act$('Amy', '下移')
      await utils.settle()
      expect(errors).toEqual([])
      expect(saves(utils.calls)).toHaveLength(0)
      // 順序不變：Amy 仍在第一列
      expect(cards()[0].querySelector('[class*="min-h-[48px]"]')).toBe(personRow('Amy'))
      expect(screen.getByRole('button', { name: /新增$/ })).not.toBeDisabled()
    } finally {
      window.removeEventListener('error', onError)
    }
  })

  it('移到最後：排到最後一位未標記的人之後並記下時間；最後一位是已標記的人時排在他之前', async () => {
    const utils = setup()
    await ready(utils)
    const before = Date.now()
    act$('Amy', '移到最後')
    const saved = await savedAfter(utils, 1)
    expect(order(saved.schedule)).toEqual(['張三', '李大華*', '阿四', 'Amy'])
    expect(saved.schedule[0].scheduleRow[3].time).toBeGreaterThanOrEqual(before)
    cleanup()
    const again = setup({ cards: [card('早班', [row('u1'), row('u3'), row('u2', true)])] })
    await ready(again)
    act$('Amy', '移到最後')
    expect(order((await savedAfter(again, 1)).schedule)).toEqual(['張三', 'Amy', '李大華*'])
  })

  // ScheduleCard.js「移到最後」最後一位的分支原本欄位名稱打錯（timeAddd／timeAdd），只記時間、多存一個 timeAdd 欄位。
  // Jason 2026/10/22「照建議」：最後一位比照中間的人，只記下時間、不標記（timeAdded 維持 false），不多存其他欄位。
  // 已有時間時原樣存回。
  it('最後一位按「移到最後」：只記下時間、不標記，不多存其他欄位', async () => {
    const utils = setup()
    await ready(utils)
    act$('阿四', '移到最後')
    const last = (await savedAfter(utils, 1)).schedule[0].scheduleRow[3]
    expect(Object.keys(last).sort()).toEqual(['designerId', 'time', 'timeAdded'])
    expect(last).toMatchObject({ designerId: 'u4', timeAdded: false })
    expect(last.time).toBeGreaterThan(0)
    cleanup()
    const stamped = setup({ cards: [card('早班', [row('u1'), { designerId: 'u4', timeAdded: false, time: T }])] })
    await ready(stamped)
    act$('阿四', '移到最後')
    expect((await savedAfter(stamped, 1)).schedule[0].scheduleRow[1]).toEqual({ designerId: 'u4', timeAdded: false, time: T })
  })

  it('繞到另一端時，途中已標記的人都留在原位', async () => {
    // 上移繞到最後：後面有已標記的人
    const up = setup({ cards: [card('早班', [row('u2', true), row('u3'), row('u4', true), row('u1')])] })
    await ready(up)
    act$('張三', '上移')
    expect(order((await savedAfter(up, 1)).schedule)).toEqual(['李大華*', 'Amy', '阿四*', '張三'])
    cleanup()
    // 下移繞到最前：前面有已標記的人
    const down = setup({ cards: [card('早班', [row('u2', true), row('u1'), row('u3'), row('u4', true)])] })
    await ready(down)
    act$('張三', '下移')
    expect(order((await savedAfter(down, 1)).schedule)).toEqual(['李大華*', '張三', 'Amy', '阿四*'])
    cleanup()
    // 移到最後（最後一位已標記）：中間已標記的人留在原位
    const bottom = setup({ cards: [card('早班', [row('u1'), row('u2', true), row('u3'), row('u4', true)])] })
    await ready(bottom)
    act$('Amy', '移到最後')
    expect(order((await savedAfter(bottom, 1)).schedule)).toEqual(['張三', '李大華*', 'Amy', '阿四*'])
  })

  it('多張班表：只動到被操作的那張，其他班表原樣送出', async () => {
    const EVENING = card('晚班', [row('u5'), row('u6'), row('u3')], false)
    const utils = setup({ cards: [MORNING, EVENING] })
    await ready(utils)
    const ops = [
      () => fireEvent.click(within(personRow('小陳', 1)).getByLabelText('標記時間')),
      () => act$('小林', '上移', 1),
      () => act$('小林', '上移', 1),
      () => act$('張三', '上移', 1),
      () => act$('張三', '下移', 1),
      () => act$('小林', '下移', 1),
      () => act$('小林', '移到最後', 1),
    ]
    for (let i = 0; i < ops.length; i += 1) {
      await ready(utils)
      ops[i]()
      const saved = await savedAfter(utils, i + 1)
      expect(saved.schedule[0]).toEqual(MORNING)
    }
    await ready(utils)
    const title = within(cards()[1]).getByPlaceholderText('排版標題')
    fireEvent.change(title, { target: { value: '晚班 B' } })
    expect(within(cards()[0]).getByText('早班')).toBeInTheDocument()
    fireEvent.keyDown(title, { key: 'Enter', keyCode: 13 })
    const saved = await savedAfter(utils, ops.length + 1)
    expect(saved.schedule[0]).toEqual(MORNING)
    expect(saved.schedule[1]).toMatchObject({ cardName: '晚班 B', setName: true })
    fireEvent.click(within(cards()[1]).getByRole('button', { name: '編輯班表名稱' }))
    expect(within(cards()[0]).getByText('早班')).toBeInTheDocument()
  })

  it('多張班表：第一位上移／下移、最後一位下移也只動到該張', async () => {
    const EVENING = card('晚班', [row('u5'), row('u6'), row('u3')])
    const utils = setup({ cards: [MORNING, EVENING] })
    await ready(utils)
    act$('小陳', '上移', 1)
    let saved = await savedAfter(utils, 1)
    expect(order(saved.schedule, 1)).toEqual(['小林', '張三', '小陳'])
    expect(saved.schedule[0]).toEqual(MORNING)
    await ready(utils)
    act$('小林', '下移', 1)
    saved = await savedAfter(utils, 2)
    expect(order(saved.schedule, 1)).toEqual(['張三', '小林', '小陳'])
    expect(saved.schedule[0]).toEqual(MORNING)
    await ready(utils)
    act$('小陳', '下移', 1)
    saved = await savedAfter(utils, 3)
    expect(order(saved.schedule, 1)).toEqual(['小陳', '張三', '小林'])
    expect(saved.schedule[0]).toEqual(MORNING)
  })

  it('標記時間：勾選記下當下時間，取消勾選歸零', async () => {
    const utils = setup()
    await ready(utils)
    fireEvent.click(within(personRow('Amy')).getByLabelText('標記時間'))
    const saved = await savedAfter(utils, 1)
    expect(saved.schedule[0].scheduleRow[0].timeAdded).toBe(true)
    expect(saved.schedule[0].scheduleRow[0].time).toBeGreaterThan(0)
    fireEvent.click(within(personRow('李大華')).getByLabelText('標記時間'))
    const saved2 = await savedAfter(utils, 2)
    expect(saved2.schedule[0].scheduleRow[1]).toEqual({ designerId: 'u2', timeAdded: false, time: 0 })
  })

  it('移除人員；只剩一位時移除後留下空列', async () => {
    const utils = setup({ cards: [MORNING, card('晚班', [row('u5')])] })
    await ready(utils)
    act$('張三', '移除人員')
    expect(order((await savedAfter(utils, 1)).schedule)).toEqual(['Amy', '李大華*', '阿四'])
    act$('小陳', '移除人員', 1)
    expect(order((await savedAfter(utils, 2)).schedule, 1)).toEqual(['（空）'])
  })
})

describe('班表', () => {
  it('新增班表：在最後加一張空白班表並存檔', async () => {
    const utils = setup()
    await ready(utils)
    fireEvent.click(screen.getByRole('button', { name: /新增$/ }))
    const saved = await savedAfter(utils, 1)
    expect(saved.schedule).toHaveLength(2)
    expect(saved.schedule[1]).toEqual({ cardName: '', setName: false, scheduleRow: [{ timeAdded: false, designerId: '', time: 0 }] })
    expect(cards()).toHaveLength(2)
  })

  it('改名稱：按筆可編輯，打字只改畫面，按 Enter 才存；聚焦時提示按 Enter', async () => {
    const utils = setup()
    await ready(utils)
    fireEvent.click(screen.getByRole('button', { name: '編輯班表名稱' }))
    const input = await screen.findByPlaceholderText('排版標題')
    fireEvent.focusIn(input)
    expect(screen.getByText('確認按下enter鍵')).toBeInTheDocument()
    fireEvent.change(input, { target: { value: '早班 A' } })
    fireEvent.keyDown(input, { key: 'a', keyCode: 65 })
    expect(saves(utils.calls)).toHaveLength(0)
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 })
    const saved = await savedAfter(utils, 1)
    expect(saved.schedule[0]).toMatchObject({ cardName: '早班 A', setName: true })
    expect(screen.getByText('早班 A')).toBeInTheDocument()
    // 名稱已是編輯狀態時再按筆不變
    fireEvent.click(screen.getByRole('button', { name: '編輯班表名稱' }))
    fireEvent.click(screen.getByRole('button', { name: '編輯班表名稱' }))
    expect(screen.getByPlaceholderText('排版標題')).toHaveValue('早班 A')
  })

  it('刪除班表：先確認；取消或 Esc 不刪，確定才刪並存檔', async () => {
    const utils = setup({ cards: [MORNING, card('晚班', [row('u5')])] })
    await ready(utils)
    fireEvent.click(screen.getAllByRole('button', { name: '刪除班表' })[1])
    expect(await screen.findByText('確定要刪除此班表嗎？')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByText('確定要刪除此班表嗎？')).toBeNull())
    fireEvent.click(screen.getAllByRole('button', { name: '刪除班表' })[1])
    await screen.findByText('確定要刪除此班表嗎？')
    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    await wait(() => expect(screen.queryByText('確定要刪除此班表嗎？')).toBeNull())
    expect(saves(utils.calls)).toHaveLength(0)
    fireEvent.click(screen.getAllByRole('button', { name: '刪除班表' })[1])
    fireEvent.click(await screen.findByRole('button', { name: '確定' }))
    const saved = await savedAfter(utils, 1)
    expect(saved.schedule.map(c => c.cardName)).toEqual(['早班'])
  })

  it('新增人員：選的人加在原有人員後面；可移除、按 Backspace／Delete 清掉；返回時不存並清空', async () => {
    const utils = setup()
    await ready(utils)
    fireEvent.click(screen.getByRole('button', { name: /新增人員/ }))
    expect(await screen.findByText('新增設計師')).toBeInTheDocument()
    const addButton = () => screen.getAllByRole('button', { name: '新增' }).find(b => !b.textContent.includes('人員') && b.closest('[role="dialog"]'))
    expect(addButton()).toBeDisabled()
    // 停用時說出還缺什麼（STYLE.md §6）
    expect(screen.getByText('尚缺：服務人員')).toHaveAttribute('role', 'status')
    // 選第一位後自動多一列空白可再選
    fireEvent.click(screen.getAllByRole('button', { name: '選小陳' })[0])
    expect(screen.queryByText('尚缺：服務人員')).toBeNull()
    expect(screen.getAllByTestId('employee-picker')).toHaveLength(2)
    fireEvent.click(screen.getAllByRole('button', { name: '選小林' })[1])
    expect(screen.getAllByTestId('employee-picker')).toHaveLength(3)
    // 改選已選的那列不再多加列
    fireEvent.click(screen.getAllByRole('button', { name: '選小林' })[0])
    expect(screen.getAllByTestId('employee-picker').map(p => p.dataset.value)).toEqual(['u6', 'u6', ''])
    fireEvent.click(screen.getAllByRole('button', { name: '選小陳' })[0])
    // 移除第二列
    fireEvent.click(screen.getAllByRole('button', { name: '移除此人員' })[1])
    expect(screen.getAllByTestId('employee-picker').map(p => p.dataset.value)).toEqual(['u5', ''])
    // 其他按鍵不影響；Delete 清掉最後一列時補回空列
    fireEvent.keyDown(screen.getAllByLabelText('人員')[0], { key: 'a', keyCode: 65 })
    expect(screen.getAllByTestId('employee-picker')).toHaveLength(2)
    fireEvent.keyDown(screen.getAllByLabelText('人員')[1], { key: 'Delete', keyCode: 46 })
    expect(screen.getAllByTestId('employee-picker').map(p => p.dataset.value)).toEqual(['u5', ''])
    fireEvent.click(addButton())
    const saved = await savedAfter(utils, 1)
    expect(order(saved.schedule)).toEqual(['Amy', '李大華*', '張三', '阿四', '小陳'])
    await wait(() => expect(screen.queryByText('新增設計師')).toBeNull())

    fireEvent.click(screen.getByRole('button', { name: /新增人員/ }))
    await screen.findByText('新增設計師')
    fireEvent.click(screen.getAllByRole('button', { name: '選小林' })[0])
    fireEvent.click(screen.getByRole('button', { name: '返回' }))
    await wait(() => expect(screen.queryByText('新增設計師')).toBeNull())
    fireEvent.click(screen.getByRole('button', { name: /新增人員/ }))
    expect(screen.getAllByTestId('employee-picker').map(p => p.dataset.value)).toEqual([''])
    expect(saves(utils.calls)).toHaveLength(1)
  })

  it('新增人員到空白班表：取代空列；清除人員與 Backspace 的各種情況', async () => {
    const utils = setup({ cards: [card('空班', [row('')])] })
    await ready(utils)
    fireEvent.click(screen.getByRole('button', { name: /新增人員/ }))
    await screen.findByText('新增設計師')
    // 只有一列時按 Backspace：保持一列空白
    fireEvent.keyDown(screen.getByLabelText('人員'), { key: 'Backspace', keyCode: 8 })
    expect(screen.getAllByTestId('employee-picker')).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: '選小陳' }))
    fireEvent.click(screen.getAllByRole('button', { name: '選小林' })[1])
    // 清除第一列：該列移除
    fireEvent.click(screen.getAllByRole('button', { name: '清除人員' })[0])
    expect(screen.getAllByTestId('employee-picker').map(p => p.dataset.value)).toEqual(['u6', ''])
    // Backspace 刪中間列（不是最後一列）
    fireEvent.click(screen.getAllByRole('button', { name: '選小陳' })[1])
    fireEvent.keyDown(screen.getAllByLabelText('人員')[0], { key: 'Backspace', keyCode: 8 })
    expect(screen.getAllByTestId('employee-picker').map(p => p.dataset.value)).toEqual(['u5', ''])
    fireEvent.click(screen.getAllByRole('button', { name: '新增' }).find(b => b.closest('[role="dialog"]') && b.textContent === '新增'))
    expect(order((await savedAfter(utils, 1)).schedule)).toEqual(['小陳'])
    // 清除到只剩空列
    fireEvent.click(screen.getByRole('button', { name: /新增人員/ }))
    await screen.findByText('新增設計師')
    fireEvent.click(screen.getByRole('button', { name: '清除人員' }))
    expect(screen.getAllByTestId('employee-picker')).toHaveLength(1)
  })
})

describe('復原、重做、存檔失敗與同步', () => {
  it('復原／重做送目前班表 id；第一版時復原停用', async () => {
    const utils = setup({
      extra: { isFirst: false, isLast: false },
      fixtures: {
        UNDO_EMPLOYEE_SCHEDULE: { undoEmployeeSchedule: scheduleOf([card('舊版', [row('u1')])], { id: 's-0', isFirst: true }) },
        REDO_EMPLOYEE_SCHEDULE: { redoEmployeeSchedule: scheduleOf([MORNING], { id: 's-1' }) },
      },
    })
    await ready(utils)
    fireEvent.click(screen.getByRole('button', { name: /復原/ }))
    await utils.settle()
    expect(callsOf(utils.calls, 'UNDO_EMPLOYEE_SCHEDULE').map(c => c.variables)).toEqual([{ currentScheduleId: 's-1' }])
  })

  // Jason 2026/10/22 fix all：index.js 的 handleSetData 原本讀頁面查詢（employeeScheduleData）判斷回應有沒有資料，
  // 存檔／復原／重做的回應一律被略過（班表 id 不更新、復原後按鈕停用，要等 socket 推播）；改讀這次的回應。
  it('存檔、復原、重做的回應會套用：班表 id、畫面與按鈕狀態都更新', async () => {
    const utils = setup({
      extra: { isLast: false },
      fixtures: {
        UNDO_EMPLOYEE_SCHEDULE: { undoEmployeeSchedule: scheduleOf([card('舊版', [row('u1')])], { id: 's-0', isFirst: true, isLast: false }) },
        REDO_EMPLOYEE_SCHEDULE: { redoEmployeeSchedule: scheduleOf([MORNING], { id: 's-3', isFirst: false, isLast: true }) },
      },
    })
    await ready(utils)
    act$('張三', '移除人員')
    await savedAfter(utils, 1)
    await ready(utils)
    act$('阿四', '移除人員')
    // 第一次存檔回了新 id s-2，第二次送 s-2
    expect((await savedAfter(utils, 2)).currentScheduleId).toBe('s-2')
    await ready(utils)
    fireEvent.click(screen.getByRole('button', { name: /復原/ }))
    expect(await screen.findByText('舊版')).toBeInTheDocument()
    await ready(utils)
    expect(callsOf(utils.calls, 'UNDO_EMPLOYEE_SCHEDULE').map(c => c.variables)).toEqual([{ currentScheduleId: 's-2' }])
    // 第一版：復原停用、重做可用
    expect(screen.getByRole('button', { name: /復原/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /重做/ })).not.toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /重做/ }))
    expect(await screen.findByText('早班')).toBeInTheDocument()
    await ready(utils)
    expect(callsOf(utils.calls, 'REDO_EMPLOYEE_SCHEDULE').map(c => c.variables)).toEqual([{ currentScheduleId: 's-0' }])
    expect(screen.getByRole('button', { name: /重做/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /復原/ })).not.toBeDisabled()
    // 之後存檔送重做回來的班表 id
    act$('張三', '移除人員')
    expect((await savedAfter(utils, 3)).currentScheduleId).toBe('s-3')
    // 推播的提示只在 socket 更新時出現，自己的存檔／復原／重做不提示
    expect(openSnackbar).not.toHaveBeenCalledWith({ message: '排班表已更新', variant: 'success' })
  })

  it('後端回「當前班表已過期」：提示並重抓班表；其他錯誤只提示', async () => {
    const expired = new Error('當前班表已過期，請重新整理')
    const utils = setup({
      extra: { isLast: false },
      fixtures: {
        SET_EMPLOYEE_SCHEDULE: (() => {
          let i = 0
          return () => (i++ === 0 ? expired : new Error('網路不穩'))
        })(),
        UNDO_EMPLOYEE_SCHEDULE: (() => {
          let i = 0
          return () => (i++ === 0 ? expired : new Error('沒有上一版'))
        })(),
        REDO_EMPLOYEE_SCHEDULE: (() => {
          let i = 0
          return () => (i++ === 0 ? expired : new Error('沒有下一版'))
        })(),
      },
    })
    await ready(utils)
    const fetches = () => callsOf(utils.calls, 'FETCH_EMPLOYEE_SCHEDULE').length
    act$('張三', '移除人員')
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '當前班表已過期，請重新整理', variant: 'error' }))
    await wait(() => expect(fetches()).toBe(2))
    await ready(utils)
    act$('張三', '移除人員')
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '網路不穩', variant: 'error' }))
    await ready(utils)
    expect(fetches()).toBe(2)

    fireEvent.click(screen.getByRole('button', { name: /復原/ }))
    await wait(() => expect(fetches()).toBe(3))
    await ready(utils)
    fireEvent.click(screen.getByRole('button', { name: /復原/ }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '沒有上一版', variant: 'error' }))
    fireEvent.click(screen.getByRole('button', { name: /重做/ }))
    await wait(() => expect(fetches()).toBe(4))
    await ready(utils)
    fireEvent.click(screen.getByRole('button', { name: /重做/ }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '沒有下一版', variant: 'error' }))
    await utils.settle()
    expect(fetches()).toBe(4)
  })

  it('其他電腦更新（socket）：套用新班表、提示，並關閉開著的刪除確認與新增人員視窗', async () => {
    const utils = setup()
    await ready(utils)
    fireEvent.click(screen.getByRole('button', { name: '刪除班表' }))
    await screen.findByText('確定要刪除此班表嗎？')
    act(() => {
      utils.store.dispatch(socketActions.setSchedule(scheduleOf([card('午班', [row('u6')])], { id: 's-9' })))
    })
    expect(await screen.findByText('午班')).toBeInTheDocument()
    expect(openSnackbar).toHaveBeenCalledWith({ message: '排班表已更新', variant: 'success' })
    await wait(() => expect(screen.queryByText('確定要刪除此班表嗎？')).toBeNull())
    fireEvent.click(screen.getByRole('button', { name: /新增人員/ }))
    await screen.findByText('新增設計師')
    act(() => {
      utils.store.dispatch(socketActions.setSchedule(scheduleOf(null, { id: 's-10' })))
    })
    await wait(() => expect(screen.queryByText('新增設計師')).toBeNull())
    expect(within(cards()[0]).getByPlaceholderText('排版標題')).toBeInTheDocument()
    // 之後存檔送 socket 帶來的班表 id
    fireEvent.click(screen.getByRole('button', { name: /新增$/ }))
    expect((await savedAfter(utils, 1)).currentScheduleId).toBe('s-10')
  })
})
