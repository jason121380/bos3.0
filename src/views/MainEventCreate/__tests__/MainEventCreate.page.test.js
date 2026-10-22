// 保護「建立活動」：活動名稱必填（去頭尾空白）；起訖日以台灣時間的當天 00:00 與 23:59:59.999 送出，結束早於開始時自動對齊；
// 總張數只收數字；私人活動才送適用店家（公開活動一律送空陣列）；簡訊通知；成功導回活動列表、失敗／錯誤提示並可再按。
// 日期選擇器與店家選擇器以替身代替（各有自己的測試）。GraphQL 全由 testkit 的模擬 link 回應，不連任何後端、不建立真實活動。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import { fieldByLabel, pickDate } from '../../__tests__/settingsPageKit.test'
import MainEventCreate from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.mock('ui/date-picker', () => require('../../__tests__/settingsPageKit.test').datePickerModule)
jest.mock('components/MerchantListAutocpmpleteForManagement', () => require('../../__tests__/settingsPageKit.test').merchantPickerModule)
jest.setTimeout(20000)

const setup = (fixtures = {}) =>
  renderPage(<MainEventCreate />, {
    fixtures: { CREATE_MAIN_EVENT: { createMainEvent: true }, ...fixtures },
    route: '/main-event-create',
  })
const submit = () => screen.getByText('新增').closest('button')
const dateValue = label => Number(screen.getByLabelText(label).value)
const sent = calls => callsOf(calls, 'CREATE_MAIN_EVENT')[0].variables.input
// 台灣時間 2026/11/01 與 2026/11/30（install-business-timezone 讓 new Date(年, 月, 日) 以台灣時間解讀）
const NOV_1 = new Date(2026, 10, 1)
const NOV_30 = new Date(2026, 10, 30)

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('建立活動', () => {
  it('私人活動：名稱去空白、起訖日送台灣時間整天、總張數、簡訊與適用店家，成功導回活動列表', async () => {
    const { calls } = setup()
    fireEvent.change(fieldByLabel('活動名稱'), { target: { value: '  周年慶  ' } })
    pickDate('預設起始時間', NOV_1)
    pickDate('預設結束時間', NOV_30)
    const max = fieldByLabel('總張數上限')
    fireEvent.focusIn(max)
    fireEvent.change(max, { target: { value: '5000' } })
    fireEvent.change(max, { target: { value: '50a' } })
    expect(max).toHaveValue('5000')
    fireEvent.click(screen.getByLabelText('開啟簡訊通知'))
    expect(screen.queryByTestId('merchant-picker')).toBeNull()
    fireEvent.click(screen.getByText('私人'))
    fireEvent.click(screen.getByText('選擇店家（測試）'))
    expect(screen.getByTestId('merchant-picker')).toHaveAttribute('data-selected', '["m1","m2"]')
    fireEvent.click(submit())
    await wait(() => expect(currentLocation()).toBe('/main-event-list'))
    expect(sent(calls)).toEqual({
      nameDefault: '周年慶',
      startDateDefault: Date.UTC(2026, 9, 31, 16, 0, 0, 0),
      endDateDefault: Date.UTC(2026, 10, 30, 15, 59, 59, 999),
      isSMSNotifyDefault: true,
      maxCountDefault: 5000,
      isPublic: false,
      merchantIds: ['m1', 'm2'],
    })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '新增成功', variant: 'success' })
  })

  it('公開活動一律送空的店家清單（即使切到私人時選過店家）；再按已選的「公開」不會改變', async () => {
    const { calls } = setup()
    fireEvent.change(fieldByLabel('活動名稱'), { target: { value: '公開活動' } })
    fireEvent.click(screen.getByText('私人'))
    fireEvent.click(screen.getByText('選擇店家（測試）'))
    fireEvent.click(screen.getByText('公開'))
    fireEvent.click(screen.getByText('公開'))
    expect(screen.getByText('公開')).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(submit())
    await wait(() => expect(callsOf(calls, 'CREATE_MAIN_EVENT')).toHaveLength(1))
    expect(sent(calls)).toEqual(expect.objectContaining({ isPublic: true, merchantIds: [], maxCountDefault: 0, isSMSNotifyDefault: false }))
  })

  it('結束日早於開始日時開始日跟著改；開始日晚於結束日時結束日跟著改', async () => {
    setup()
    pickDate('預設起始時間', NOV_1)
    pickDate('預設結束時間', NOV_30)
    const oct20 = new Date(2026, 9, 20)
    pickDate('預設結束時間', oct20)
    expect(dateValue('預設起始時間')).toBe(oct20.getTime())
    const dec5 = new Date(2026, 11, 5)
    pickDate('預設起始時間', dec5)
    expect(dateValue('預設結束時間')).toBe(dec5.getTime())
    // 順序正確時不互相影響
    pickDate('預設結束時間', new Date(2026, 11, 25))
    expect(dateValue('預設起始時間')).toBe(dec5.getTime())
  })

  it('名稱空白時提示請輸入活動名稱、不送出，按鈕可再按', async () => {
    const { calls } = setup()
    fireEvent.change(fieldByLabel('活動名稱'), { target: { value: '   ' } })
    fireEvent.click(submit())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入活動名稱。', variant: 'error' }))
    expect(callsOf(calls, 'CREATE_MAIN_EVENT')).toHaveLength(0)
    expect(submit()).toBeEnabled()
  })

  it('後端回 false 提示新增失敗；錯誤時提示錯誤；兩者都留在本頁且可再按', async () => {
    setup({ CREATE_MAIN_EVENT: { createMainEvent: false } })
    fireEvent.change(fieldByLabel('活動名稱'), { target: { value: '周年慶' } })
    fireEvent.click(submit())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '新增失敗', variant: 'warning' }))
    expect(submit()).toBeEnabled()
    cleanup()
    setup({ CREATE_MAIN_EVENT: new Error('活動名稱重複') })
    fireEvent.change(fieldByLabel('活動名稱'), { target: { value: '周年慶' } })
    fireEvent.click(submit())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '活動名稱重複', variant: 'error' }))
    await wait(() => expect(submit()).toBeEnabled())
    expect(currentLocation()).toBe('/main-event-create')
  })
})
