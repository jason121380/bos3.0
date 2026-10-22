// 保護「活動列表」：活動的建立日期／時間範圍／結束日期以台灣日期顯示、上架狀態（結束的活動顯示活動結束）、已發行／最大張數、
// 加入與公開狀態；展開規則看各規則狀態（主活動已結束的規則顯示主活動關閉）；上下架活動、啟停用規則、提前結束活動或規則
// 送出的 id 與狀態，成功／失敗／錯誤的提示；結束前要在確認視窗按確認。GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import MainEventList from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.setTimeout(20000)

// 台灣時間的某日 00:30（UTC 前一天 16:30）：顯示必須是台灣的日期
const tw = (y, m, d) => Date.UTC(y, m - 1, d - 1, 16, 30)
const rule = overrides => ({
  id: 'r1',
  nameForGroup: '滿千送券',
  startDateForGroup: tw(2026, 10, 1),
  endDateForGroup: tw(2026, 10, 31),
  endDateActual: null,
  isSMSNotifyForGroup: true,
  maxCountForGroup: 2000,
  releasedCount: 150,
  isUsingForGroup: true,
  ...overrides,
})
const EVENTS = [
  {
    id: 'e1',
    nameDefault: '周年慶',
    createTime: tw(2026, 9, 15),
    startDateDefault: tw(2026, 10, 1),
    endDateDefault: tw(2026, 12, 31),
    endDateActual: null,
    isUsingDefault: true,
    releasedCount: 1200,
    maxCountDefault: 5000,
    isJoined: true,
    isPublic: false,
    isSMSNotifyDefault: true,
    ruleGroups: [
      rule(),
      rule({ id: 'r2', nameForGroup: '提前結束的規則', endDateActual: tw(2026, 10, 10) }),
      rule({ id: 'r3', nameForGroup: '停用的規則', isUsingForGroup: false, isSMSNotifyForGroup: false }),
    ],
  },
  {
    id: 'e2',
    nameDefault: '春季活動',
    createTime: tw(2026, 3, 1),
    startDateDefault: tw(2026, 3, 1),
    endDateDefault: tw(2026, 5, 31),
    endDateActual: tw(2026, 4, 20),
    isUsingDefault: true,
    releasedCount: 10,
    maxCountDefault: 100,
    isJoined: false,
    isPublic: true,
    isSMSNotifyDefault: false,
    ruleGroups: [rule({ id: 'r4', nameForGroup: '春季規則', endDateActual: tw(2026, 4, 20) })],
  },
  {
    id: 'e3',
    nameDefault: '下架的活動',
    createTime: tw(2026, 8, 1),
    startDateDefault: tw(2026, 8, 1),
    endDateDefault: tw(2026, 8, 31),
    endDateActual: null,
    isUsingDefault: false,
    releasedCount: 0,
    maxCountDefault: 0,
    isJoined: false,
    isPublic: true,
    isSMSNotifyDefault: false,
    ruleGroups: [],
  },
]
const setup = (fixtures = {}) =>
  renderPage(<MainEventList />, {
    fixtures: { GET_MAIN_EVENTS: { mainEvents: EVENTS }, ...fixtures },
    route: '/main-event-list',
  })
const row = name => within(screen.getByText(name).closest('tr'))
const dialog = () => within(screen.getByRole('dialog'))

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('活動列表', () => {
  it('列出活動：台灣日期、上架狀態、張數、加入／公開、簡訊、結束日期與可用操作', async () => {
    setup()
    expect(await screen.findByText('共 3 筆資料')).toBeInTheDocument()
    const anniversary = row('周年慶')
    expect(anniversary.getByText('2026/09/15')).toBeInTheDocument()
    expect(anniversary.getByText('2026/10/01 ~ 2026/12/31')).toBeInTheDocument()
    expect(anniversary.getByText('上架中')).toBeInTheDocument()
    expect(anniversary.getByText('1,200 / 5,000')).toBeInTheDocument()
    expect(anniversary.getByText('已加入 / 私人')).toBeInTheDocument()
    expect(anniversary.getByText('開啟')).toBeInTheDocument()
    expect(anniversary.getByText('-')).toBeInTheDocument()
    expect(anniversary.getByText('建立規則').closest('a')).toHaveAttribute('href', '/event-rule-create/e1')
    expect(anniversary.getByLabelText('編輯活動')).toHaveAttribute('href', '/main-event-edit/e1')
    expect(anniversary.getByText('下架')).toBeInTheDocument()

    const spring = row('春季活動')
    expect(spring.getByText('活動結束')).toBeInTheDocument()
    expect(spring.getByText('2026/04/20')).toBeInTheDocument()
    expect(spring.getByText('未加入 / 公開')).toBeInTheDocument()
    expect(spring.getByText('關閉')).toBeInTheDocument()
    expect(spring.getByLabelText('檢視活動')).toHaveAttribute('href', '/main-event-edit/e2')
    expect(spring.queryByText('建立規則')).toBeNull()

    const off = row('下架的活動')
    expect(off.getByText('已下架')).toBeInTheDocument()
    expect(off.getByText('上架')).toBeInTheDocument()
    // 沒有規則的活動沒有展開鈕
    expect(off.queryByLabelText('展開規則')).toBeNull()
  })

  it('展開規則：顯示各規則期間（台灣日期）、張數與狀態；主活動已結束的規則顯示主活動關閉；可收合', async () => {
    setup()
    await screen.findByText('共 3 筆資料')
    fireEvent.click(row('周年慶').getByLabelText('展開規則'))
    const active = row('滿千送券')
    expect(active.getByText('10/01 ~ 10/31')).toBeInTheDocument()
    expect(active.getByText('150 / 2,000')).toBeInTheDocument()
    expect(active.getByText('啟用中')).toBeInTheDocument()
    expect(active.getByText('是')).toBeInTheDocument()
    expect(active.getByLabelText('編輯規則')).toHaveAttribute('href', '/event-rule-edit/r1')
    expect(active.getByText('停用')).toBeInTheDocument()
    const ended = row('提前結束的規則')
    expect(ended.getByText('已停用')).toBeInTheDocument()
    expect(ended.getByLabelText('檢視規則')).toHaveAttribute('href', '/event-rule-edit/r2')
    expect(ended.queryByText('結束')).toBeNull()
    const disabled = row('停用的規則')
    expect(disabled.getByText('已停用')).toBeInTheDocument()
    expect(disabled.getByText('否')).toBeInTheDocument()
    expect(disabled.getByText('啟用')).toBeInTheDocument()

    fireEvent.click(row('春季活動').getByLabelText('展開規則'))
    expect(row('春季規則').getByText('主活動關閉')).toBeInTheDocument()

    fireEvent.click(row('周年慶').getByLabelText('收合規則'))
    expect(screen.queryByText('滿千送券')).toBeNull()
    expect(screen.getByText('春季規則')).toBeInTheDocument()
  })

  it('全部展開／全部收合', async () => {
    setup()
    await screen.findByText('共 3 筆資料')
    fireEvent.click(screen.getByText('全部展開'))
    expect(screen.getByText('滿千送券')).toBeInTheDocument()
    expect(screen.getByText('春季規則')).toBeInTheDocument()
    fireEvent.click(screen.getByText('全部收合'))
    expect(screen.queryByText('滿千送券')).toBeNull()
    expect(screen.getByText('全部展開')).toBeInTheDocument()
  })

  it('沒有活動時顯示無活動資料、沒有全部展開鈕', async () => {
    setup({ GET_MAIN_EVENTS: { mainEvents: [] } })
    expect(await screen.findByText('無活動資料')).toBeInTheDocument()
    expect(screen.queryByText('全部展開')).toBeNull()
  })

  it('下架活動：送出活動 id 與 isUsing=false，成功提示並重抓列表', async () => {
    const { calls } = setup({ SET_MAIN_EVENT_USING: { setMainEventUsing: true } })
    await screen.findByText('共 3 筆資料')
    fireEvent.click(row('周年慶').getByText('下架'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '修改成功', variant: 'success' }))
    expect(callsOf(calls, 'SET_MAIN_EVENT_USING')[0].variables).toEqual({ input: { id: 'e1', isUsing: false } })
    await wait(() => expect(callsOf(calls, 'GET_MAIN_EVENTS')).toHaveLength(2))
  })

  it('上架活動：後端回 false 提示修改失敗；錯誤時提示錯誤訊息', async () => {
    const { calls } = setup({ SET_MAIN_EVENT_USING: { setMainEventUsing: false } })
    await screen.findByText('共 3 筆資料')
    fireEvent.click(row('下架的活動').getByText('上架'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '修改失敗', variant: 'warning' }))
    expect(callsOf(calls, 'SET_MAIN_EVENT_USING')[0].variables).toEqual({ input: { id: 'e3', isUsing: true } })
    cleanup()
    setup({ SET_MAIN_EVENT_USING: new Error('活動已過期') })
    await screen.findByText('共 3 筆資料')
    fireEvent.click(row('下架的活動').getByText('上架'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '活動已過期', variant: 'error' }))
  })

  it('下架成功重抓後，列表更新為已下架、按鈕變成上架', async () => {
    let fetched = 0
    const { calls } = setup({
      GET_MAIN_EVENTS: () => {
        fetched += 1
        return { mainEvents: fetched === 1 ? EVENTS : [{ ...EVENTS[0], isUsingDefault: false }, EVENTS[1], EVENTS[2]] }
      },
      SET_MAIN_EVENT_USING: { setMainEventUsing: true },
    })
    await screen.findByText('共 3 筆資料')
    fireEvent.click(row('周年慶').getByText('下架'))
    await wait(() => expect(callsOf(calls, 'GET_MAIN_EVENTS')).toHaveLength(2))
    await wait(() => expect(row('周年慶').getByText('已下架')).toBeInTheDocument())
    expect(row('周年慶').getByText('上架')).toBeInTheDocument()
  })

  it('停用／啟用規則：送出規則 id 與相反狀態；成功、失敗、錯誤各自提示', async () => {
    const { calls } = setup({ SET_EVENT_RULE_GROUP_USING: { setEventRuleGroupUsing: true } })
    await screen.findByText('共 3 筆資料')
    fireEvent.click(row('周年慶').getByLabelText('展開規則'))
    fireEvent.click(row('滿千送券').getByText('停用'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '修改成功', variant: 'success' }))
    expect(callsOf(calls, 'SET_EVENT_RULE_GROUP_USING')[0].variables).toEqual({ input: { id: 'r1', isUsing: false } })
    await wait(() => expect(callsOf(calls, 'GET_MAIN_EVENTS')).toHaveLength(2))
    cleanup()

    const second = setup({ SET_EVENT_RULE_GROUP_USING: { setEventRuleGroupUsing: false } })
    await screen.findByText('共 3 筆資料')
    fireEvent.click(row('周年慶').getByLabelText('展開規則'))
    fireEvent.click(row('停用的規則').getByText('啟用'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '修改失敗', variant: 'warning' }))
    expect(callsOf(second.calls, 'SET_EVENT_RULE_GROUP_USING')[0].variables).toEqual({ input: { id: 'r3', isUsing: true } })
    cleanup()

    setup({ SET_EVENT_RULE_GROUP_USING: new Error('規則已結束') })
    await screen.findByText('共 3 筆資料')
    fireEvent.click(row('周年慶').getByLabelText('展開規則'))
    fireEvent.click(row('滿千送券').getByText('停用'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '規則已結束', variant: 'error' }))
  })

  it('提前結束活動：確認視窗顯示活動名稱，按取消不送出；按確認送出活動 id，成功後關閉並重抓', async () => {
    const { calls } = setup({ SET_END_MAIN_EVENT: { endMainEvent: true } })
    await screen.findByText('共 3 筆資料')
    fireEvent.click(row('周年慶').getByText('結束'))
    expect(dialog().getByText('周年慶')).toBeInTheDocument()
    expect(dialog().getByText('結束後將不可復原。')).toBeInTheDocument()
    fireEvent.click(dialog().getByText('取消'))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(callsOf(calls, 'SET_END_MAIN_EVENT')).toHaveLength(0)

    fireEvent.click(row('周年慶').getByText('結束'))
    fireEvent.click(dialog().getByText('確認'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '修改成功', variant: 'success' }))
    expect(callsOf(calls, 'SET_END_MAIN_EVENT')[0].variables).toEqual({ eventId: 'e1' })
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    await wait(() => expect(callsOf(calls, 'GET_MAIN_EVENTS')).toHaveLength(2))
  })

  it('提前結束活動：後端回 false 時提示修改失敗、視窗不關；錯誤時提示錯誤、確認鈕恢復可按', async () => {
    setup({ SET_END_MAIN_EVENT: { endMainEvent: false } })
    await screen.findByText('共 3 筆資料')
    fireEvent.click(row('周年慶').getByText('結束'))
    fireEvent.click(dialog().getByText('確認'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '修改失敗', variant: 'warning' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    cleanup()

    setup({ SET_END_MAIN_EVENT: new Error('活動有未完成的帳單') })
    await screen.findByText('共 3 筆資料')
    fireEvent.click(row('周年慶').getByText('結束'))
    fireEvent.click(dialog().getByText('確認'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '活動有未完成的帳單', variant: 'error' }))
    await wait(() => expect(dialog().getByText('確認').closest('button')).toBeEnabled())
  })

  it('提前結束規則：送出規則 id；成功關閉視窗、失敗提示、錯誤提示', async () => {
    const { calls } = setup({ END_EVENT_RULE_GROUP: { endEventRuleGroup: true } })
    await screen.findByText('共 3 筆資料')
    fireEvent.click(row('周年慶').getByLabelText('展開規則'))
    fireEvent.click(row('滿千送券').getByText('結束'))
    expect(dialog().getByText('滿千送券')).toBeInTheDocument()
    fireEvent.click(dialog().getByText('確認'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '修改成功', variant: 'success' }))
    expect(callsOf(calls, 'END_EVENT_RULE_GROUP')[0].variables).toEqual({ groupId: 'r1' })
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    cleanup()

    setup({ END_EVENT_RULE_GROUP: { endEventRuleGroup: false } })
    await screen.findByText('共 3 筆資料')
    fireEvent.click(row('周年慶').getByLabelText('展開規則'))
    fireEvent.click(row('滿千送券').getByText('結束'))
    fireEvent.click(dialog().getByText('確認'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '修改失敗', variant: 'warning' }))
    cleanup()

    setup({ END_EVENT_RULE_GROUP: new Error('規則不存在') })
    await screen.findByText('共 3 筆資料')
    fireEvent.click(row('周年慶').getByLabelText('展開規則'))
    fireEvent.click(row('滿千送券').getByText('結束'))
    fireEvent.click(dialog().getByText('確認'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '規則不存在', variant: 'error' }))
  })
})
