// 保護「新增版本紀錄」（/system-update-record/create）。守住：
// - 標題、版本、內容（Markdown）都填了才能按「新增」；更新日期預設今天，選日期後以該日 UTC 零點的時間戳送出（與原生 type=date 相同）
// - 送出 createSystemUpdate 的 input（title／content／versionNo／updateTime）；成功提示並在 1 秒後回列表；
//   後端回 false 時提示新增失敗、可再按；mutation 失敗時提示錯誤、可再按
// Markdown 編輯器與日期選擇器以簡化版代替；GraphQL 全由 testkit 的模擬 link 回應，不連後端、不建立真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import SystemUpdateRecordCreate from '..'

jest.setTimeout(20000)
jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.mock('md-editor-rt', () => {
  const Md = ({ modelValue, onChange, theme }) => (
    <textarea aria-label="內容" data-theme={theme} value={modelValue} onChange={e => onChange(e.target.value)} />
  )
  Md.config = jest.fn()
  return { __esModule: true, default: Md }
})
// 日期選擇器替身：輸入日期字串（台灣時間），清空時回傳 null（與真的選擇器清除時相同）
jest.mock('ui/date-picker', () => ({
  MobileDatePicker: ({ label, value, onChange }) => (
    <input aria-label={label} data-value={value} onChange={e => onChange(e.target.value ? new Date(e.target.value) : null)} />
  ),
}))

const setup = fixture =>
  renderPage(<SystemUpdateRecordCreate />, {
    route: '/system-update-record/create',
    fixtures: { SYSTEM_UPDATE_RECORD_CREATE: fixture === undefined ? { createSystemUpdate: true } : fixture },
  })

const submit = () => screen.getByTestId('createSystemUpdate')
const fillAll = () => {
  fireEvent.change(screen.getByLabelText('版本'), { target: { value: 'v3.2' } })
  fireEvent.change(screen.getByLabelText('標題'), { target: { value: '十一月更新' } })
  fireEvent.change(screen.getByLabelText('內容'), { target: { value: '# 新功能' } })
}

beforeEach(() => {
  loginAs()
})
afterEach(() => {
  cleanup()
  jest.useRealTimers()
  document.documentElement.removeAttribute('data-color-mode')
})

it('標題、版本、內容都要填才能新增；更新日期預設現在', async () => {
  const before = Date.now()
  setup()
  expect(screen.getByText('新增版本紀錄')).toBeInTheDocument()
  expect(Number(screen.getByLabelText('更新日期').getAttribute('data-value'))).toBeGreaterThanOrEqual(before)
  expect(submit()).toBeDisabled()
  fireEvent.change(screen.getByLabelText('版本'), { target: { value: 'v3.2' } })
  fireEvent.change(screen.getByLabelText('標題'), { target: { value: '十一月更新' } })
  expect(submit()).toBeDisabled()
  fireEvent.change(screen.getByLabelText('內容'), { target: { value: '# 新功能' } })
  expect(submit()).not.toBeDisabled()
  fireEvent.change(screen.getByLabelText('標題'), { target: { value: '' } })
  expect(submit()).toBeDisabled()
})

it('送出 input（選定日期為該日 UTC 零點）；成功提示，1 秒後回列表', async () => {
  const utils = setup()
  fillAll()
  fireEvent.change(screen.getByLabelText('更新日期'), { target: { value: '2026-11-03T15:00' } })
  // 清除日期（null）時保留原本選的日期
  fireEvent.change(screen.getByLabelText('更新日期'), { target: { value: '' } })
  expect(screen.getByLabelText('更新日期')).toHaveAttribute('data-value', String(Date.UTC(2026, 10, 3)))
  fireEvent.click(submit())
  expect(submit()).toBeDisabled()
  await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '新增成功', variant: 'success' }))
  expect(callsOf(utils.calls, 'SYSTEM_UPDATE_RECORD_CREATE').map(c => c.variables)).toEqual([
    { input: { title: '十一月更新', content: '# 新功能', versionNo: 'v3.2', updateTime: Date.UTC(2026, 10, 3) } },
  ])
  expect(currentLocation()).toBe('/system-update-record/create')
  await wait(() => expect(currentLocation()).toBe('/system-update-record'), { timeout: 3000 })
})

it('後端回 false：提示新增失敗、不離開頁面，可再按', async () => {
  const utils = setup({ createSystemUpdate: false })
  fillAll()
  fireEvent.click(submit())
  await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '新增失敗', variant: 'error' }))
  expect(submit()).not.toBeDisabled()
  await utils.settle()
  expect(currentLocation()).toBe('/system-update-record/create')
})

it('mutation 失敗：提示錯誤、可再按', async () => {
  setup(new Error('版本號重複'))
  fillAll()
  fireEvent.click(submit())
  await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '版本號重複', variant: 'error' }))
  expect(submit()).not.toBeDisabled()
})

it('Markdown 編輯器主題等 data-color-mode 出現後套用', async () => {
  setup()
  expect(screen.getByLabelText('內容')).toHaveAttribute('data-theme', '')
  document.documentElement.setAttribute('data-color-mode', 'light')
  await wait(() => expect(screen.getByLabelText('內容')).toHaveAttribute('data-theme', 'light'), { timeout: 3000 })
})
