// 保護「編輯版本紀錄」（/system-update-record/edit/:id）。守住：
// - 從版本紀錄清單找出網址指定的那筆，帶入日期、版本、標題、內容；讀取中不顯示表單
// - 送出 updateSystemUpdate 的 input（含 systemUpdateId 與改過的欄位；選日期為該日 UTC 零點）；任一欄清空不能儲存
// - 成功提示並在 1 秒後回列表；後端回 false 提示儲存失敗、mutation 失敗提示錯誤，都可再按
// - 查詢失敗或找不到這筆時不整頁錯誤、不顯示可存檔的空白表單（原本讀 undefined[0] 拋錯）
// Markdown 編輯器與日期選擇器以簡化版代替；GraphQL 全由 testkit 的模擬 link 回應，不連後端、不改真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { fieldByLabel } from '../../__tests__/settingsPageKit.test'
import SystemUpdateRecordEdit from '..'

jest.setTimeout(20000)
jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.mock('md-editor-rt', () => {
  const Md = ({ modelValue, onChange, theme }) => (
    <textarea aria-label="內容" data-theme={theme} value={modelValue} onChange={e => onChange(e.target.value)} />
  )
  Md.config = jest.fn()
  return { __esModule: true, default: Md }
})
jest.mock('ui/date-picker', () => ({
  MobileDatePicker: ({ label, value, onChange }) => (
    <input aria-label={label} data-value={value} onChange={e => onChange(e.target.value ? new Date(e.target.value) : null)} />
  ),
}))

const OCT5 = Date.UTC(2026, 9, 5)
const RECORDS = [
  { systemUpdateId: 's-1', title: '十月更新', content: '新增報表', versionNo: 'v3.1', updateTime: OCT5 },
  { systemUpdateId: 's-2', title: '九月更新', content: '修正打卡', versionNo: 'v3.0', updateTime: Date.UTC(2026, 8, 1) },
]

const setup = ({ id = 's-2', records = { systemUpdateRecord: RECORDS }, edit = { updateSystemUpdate: true } } = {}) =>
  renderPage(<SystemUpdateRecordEdit match={{ params: { id } }} />, {
    route: `/system-update-record/edit/${id}`,
    fixtures: { GET_SYSTEM_UPDATE_RECORD: records, SYSTEM_UPDATE_RECORD_EDIT: edit },
  })

const save = () => screen.getByTestId('createSystemUpdate')
const version = () => fieldByLabel('版本')
const title = () => fieldByLabel('標題')

beforeEach(() => {
  loginAs()
})
afterEach(() => {
  cleanup()
  document.documentElement.removeAttribute('data-color-mode')
})

it('帶入網址指定那筆的日期、版本、標題、內容；讀取中不顯示表單', async () => {
  const utils = setup()
  expect(screen.getByText('編輯版本紀錄')).toBeInTheDocument()
  expect(screen.queryByTestId('createSystemUpdate')).toBeNull()
  await utils.settle()
  expect(version()).toHaveValue('v3.0')
  expect(title()).toHaveValue('九月更新')
  expect(screen.getByLabelText('內容')).toHaveValue('修正打卡')
  expect(screen.getByLabelText('更新日期')).toHaveAttribute('data-value', String(Date.UTC(2026, 8, 1)))
  expect(save()).not.toBeDisabled()
})

it('任一欄清空不能儲存；改版本、標題、內容、日期後送出完整 input，成功提示並 1 秒後回列表', async () => {
  const utils = setup()
  await utils.settle()
  fireEvent.change(title(), { target: { value: '' } })
  expect(save()).toBeDisabled()
  fireEvent.change(title(), { target: { value: '九月更新（修訂）' } })
  fireEvent.change(version(), { target: { value: 'v3.0.1' } })
  fireEvent.change(screen.getByLabelText('內容'), { target: { value: '修正打卡與排班' } })
  fireEvent.change(screen.getByLabelText('更新日期'), { target: { value: '2026-09-02T09:00' } })
  fireEvent.change(screen.getByLabelText('更新日期'), { target: { value: '' } })
  expect(save()).not.toBeDisabled()
  fireEvent.click(save())
  expect(save()).toBeDisabled()
  await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '儲存成功', variant: 'success' }))
  expect(callsOf(utils.calls, 'SYSTEM_UPDATE_RECORD_EDIT').map(c => c.variables)).toEqual([
    {
      input: {
        systemUpdateId: 's-2',
        title: '九月更新（修訂）',
        content: '修正打卡與排班',
        versionNo: 'v3.0.1',
        updateTime: Date.UTC(2026, 8, 2),
      },
    },
  ])
  await wait(() => expect(currentLocation()).toBe('/system-update-record'), { timeout: 3000 })
})

it('後端回 false：提示儲存失敗、可再按', async () => {
  const utils = setup({ edit: { updateSystemUpdate: false } })
  await utils.settle()
  fireEvent.click(save())
  await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '儲存失敗', variant: 'error' }))
  expect(save()).not.toBeDisabled()
  expect(currentLocation()).toBe('/system-update-record/edit/s-2')
})

it('mutation 失敗：提示錯誤、可再按', async () => {
  const utils = setup({ edit: new Error('版本號重複') })
  await utils.settle()
  fireEvent.click(save())
  await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '版本號重複', variant: 'error' }))
  expect(save()).not.toBeDisabled()
})

it('Markdown 編輯器主題等 data-color-mode 出現後套用', async () => {
  const utils = setup()
  await utils.settle()
  document.documentElement.setAttribute('data-color-mode', 'dark')
  await wait(() => expect(screen.getByLabelText('內容')).toHaveAttribute('data-theme', 'dark'), { timeout: 3000 })
})

it('找不到這筆紀錄：提示找不到、不顯示可存檔的表單（原本讀 undefined.content 拋錯）', async () => {
  const utils = setup({ id: 's-404' })
  await utils.settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('找不到這筆版本紀錄')).toBeInTheDocument()
  expect(screen.queryByTestId('createSystemUpdate')).toBeNull()
})

it('查詢失敗：不整頁錯誤、不顯示可存檔的表單', async () => {
  const utils = setup({ records: new Error('伺服器錯誤') })
  await utils.settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('找不到這筆版本紀錄')).toBeInTheDocument()
  expect(screen.queryByTestId('createSystemUpdate')).toBeNull()
})
