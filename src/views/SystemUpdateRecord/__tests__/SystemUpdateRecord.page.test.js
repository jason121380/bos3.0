// 保護「版本更新紀錄」列表（/system-update-record）。守住：
// - 依登入者查白名單（user.isWhiteList）：只有白名單看得到「新增」、每筆的編輯／刪除；非白名單只能看
// - 每筆可展開／收合（預設展開第一筆），顯示標題、版本、Markdown 內容與更新日期（MM/dd）；Markdown 連結一律開新分頁
// - 刪除先跳確認（openSnackbar 確認型，帶紀錄 id 與可重抓的查詢）；刪除後重抓的清單要反映在畫面上（原本畫面不變）
// - 查詢失敗不整頁錯誤（原本讀 undefined.length 拋錯）
// Markdown 編輯器以簡化版代替；GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import React from 'react'
import { act, cleanup, fireEvent, screen, wait } from '@testing-library/react'
import MdEditor from 'md-editor-rt'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT, USER_ID } from '../../../__tests__/testkit.test'
import SystemUpdateRecord from '..'

jest.setTimeout(20000)
jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.mock('md-editor-rt', () => {
  const Md = ({ modelValue, theme }) => (
    <div data-testid="md-preview" data-theme={theme}>
      {modelValue}
    </div>
  )
  Md.config = jest.fn()
  return { __esModule: true, default: Md }
})

const RECORDS = [
  { systemUpdateId: 's-1', title: '十月更新', content: '新增報表', versionNo: 'v3.1', updateTime: new Date(2026, 9, 5, 10).getTime() },
  { systemUpdateId: 's-2', title: '九月更新', content: '修正打卡', versionNo: 'v3.0', updateTime: new Date(2026, 8, 1, 10).getTime() },
]

const setup = ({ whiteList = false, records = RECORDS, fixtures = {} } = {}) =>
  renderPage(<SystemUpdateRecord />, {
    route: '/system-update-record',
    fixtures: {
      FETCH_IS_WHITE_LIST: { user: { isWhiteList: whiteList } },
      GET_SYSTEM_UPDATE_RECORD: typeof records === 'function' ? records : { systemUpdateRecord: records },
      ...fixtures,
    },
  })

beforeEach(() => {
  loginAs()
})
afterEach(() => {
  cleanup()
  document.documentElement.removeAttribute('data-color-mode')
})

it('非白名單：列出每筆的標題、版本、更新日期，沒有新增／編輯／刪除；以登入者 id 查白名單', async () => {
  const utils = setup()
  await utils.settle()
  expect(screen.getByText('版本更新紀錄')).toBeInTheDocument()
  expect(screen.getByText('十月更新')).toBeInTheDocument()
  expect(screen.getByText('版本:v3.1')).toBeInTheDocument()
  expect(screen.getByText('版本:v3.0')).toBeInTheDocument()
  expect(screen.getByText('更新日期:10/05')).toBeInTheDocument()
  expect(screen.getByText('更新日期:09/01')).toBeInTheDocument()
  expect(screen.queryByTestId('createSystemUpdate')).toBeNull()
  expect(screen.queryByLabelText('編輯版本紀錄')).toBeNull()
  expect(screen.queryByLabelText('刪除版本紀錄')).toBeNull()
  expect(callsOf(utils.calls, 'FETCH_IS_WHITE_LIST')[0].variables).toEqual({ input: { id: USER_ID } })
})

it('白名單：可新增、編輯（連到該筆）與刪除（先確認，帶紀錄 id 與可重抓的查詢）', async () => {
  const utils = setup({ whiteList: true })
  await utils.settle()
  expect(screen.getByTestId('createSystemUpdate')).toHaveAttribute('href', '/system-update-record/create')
  const edits = screen.getAllByLabelText('編輯版本紀錄')
  expect(edits.map(a => a.getAttribute('href'))).toEqual(['/system-update-record/edit/s-1', '/system-update-record/edit/s-2'])
  fireEvent.click(screen.getAllByLabelText('刪除版本紀錄')[1])
  expect(openSnackbar).toHaveBeenCalledTimes(1)
  const arg = openSnackbar.mock.calls[0][0]
  expect(arg).toMatchObject({
    message: '確定要刪除此筆版本更新紀錄？',
    variant: 'error',
    disableHide: true,
    resign: true,
    deleteSystemRecordPending: true,
    systemUpdateId: 's-2',
  })
  expect(typeof arg.systemUpdateRecord.refetch).toBe('function')
})

it('刪除成功後重抓清單：畫面跟著拿掉被刪的那筆', async () => {
  let records = RECORDS
  const utils = setup({ whiteList: true, records: () => ({ systemUpdateRecord: records }) })
  await utils.settle()
  fireEvent.click(screen.getAllByLabelText('刪除版本紀錄')[0])
  records = RECORDS.slice(1)
  await act(() => openSnackbar.mock.calls[0][0].systemUpdateRecord.refetch())
  await utils.settle()
  await wait(() => expect(screen.queryByText('十月更新')).toBeNull())
  expect(screen.getByText('九月更新')).toBeInTheDocument()
})

it('展開／收合：預設展開第一筆；點第二筆標題改展開第二筆，再點一次收合', async () => {
  const utils = setup()
  await utils.settle()
  const summaries = () => screen.getAllByRole('button', { name: /更新/ })
  expect(summaries()[0]).toHaveAttribute('aria-expanded', 'true')
  expect(summaries()[1]).toHaveAttribute('aria-expanded', 'false')
  fireEvent.click(summaries()[1])
  expect(summaries()[0]).toHaveAttribute('aria-expanded', 'false')
  expect(summaries()[1]).toHaveAttribute('aria-expanded', 'true')
  fireEvent.click(summaries()[1])
  expect(summaries()[1]).toHaveAttribute('aria-expanded', 'false')
})

it('Markdown 以預覽模式顯示內容；連結一律開新分頁；主題等 data-color-mode 出現後套用', async () => {
  const utils = setup()
  await utils.settle()
  expect(screen.getAllByTestId('md-preview').map(n => n.textContent)).toEqual(['新增報表', '修正打卡'])
  const { markedRenderer } = MdEditor.config.mock.calls[0][0]
  const renderer = markedRenderer({})
  expect(renderer.link('https://example.com', '說明', '連結')).toBe('<a href="https://example.com" title="說明" target="_blank">連結</a>')
  expect(screen.getAllByTestId('md-preview')[0]).toHaveAttribute('data-theme', '')
  // 主題還沒設定時持續等待（每 0.5 秒檢查一次）
  await new Promise(r => setTimeout(r, 600))
  expect(screen.getAllByTestId('md-preview')[0]).toHaveAttribute('data-theme', '')
  document.documentElement.setAttribute('data-color-mode', 'dark')
  await wait(() => expect(screen.getAllByTestId('md-preview')[0]).toHaveAttribute('data-theme', 'dark'), { timeout: 3000 })
})

it('查詢失敗：顯示頁面標題、不整頁錯誤（原本讀 undefined.length 拋錯）', async () => {
  const utils = setup({ fixtures: { GET_SYSTEM_UPDATE_RECORD: new Error('伺服器錯誤'), FETCH_IS_WHITE_LIST: new Error('伺服器錯誤') } })
  await utils.settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('版本更新紀錄')).toBeInTheDocument()
  expect(screen.queryByTestId('createSystemUpdate')).toBeNull()
})
