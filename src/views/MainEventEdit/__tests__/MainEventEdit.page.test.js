// 保護「編輯活動」：依網址活動 id 帶入名稱、起訖日、總張數、簡訊、公開／私人與適用店家；儲存送出 eventId 與內容
// （名稱去空白、起訖日為台灣時間整天、公開活動店家送空陣列）；已結束的活動整頁唯讀、沒有儲存鈕；失敗／錯誤提示。
// 日期選擇器與店家選擇器以替身代替（各有自己的測試）。GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import { fieldByLabel, pickDate } from '../../__tests__/settingsPageKit.test'
import MainEventEdit from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.mock('ui/date-picker', () => require('../../__tests__/settingsPageKit.test').datePickerModule)
jest.mock('components/MerchantListAutocpmpleteForManagement', () => require('../../__tests__/settingsPageKit.test').merchantPickerModule)
jest.setTimeout(20000)

// 台灣 2026/10/01 12:00 與 2026/12/31 12:00
const OCT_1_NOON = Date.UTC(2026, 9, 1, 4, 0)
const DEC_31_NOON = Date.UTC(2026, 11, 31, 4, 0)
const event = overrides => ({
  nameDefault: '周年慶',
  startDateDefault: OCT_1_NOON,
  endDateDefault: DEC_31_NOON,
  isSMSNotifyDefault: true,
  maxCountDefault: 5000,
  isUsingDefault: true,
  isPublic: false,
  endDateActual: null,
  merchantIds: ['m9'],
  ...overrides,
})
const setup = ({ mainEvent = event(), ...fixtures } = {}) =>
  renderPage(<MainEventEdit match={{ params: { id: 'e1' } }} />, {
    fixtures: { GET_MERCHANT_EVENT: { mainEvent }, UPDATE_MERCHANT_EVENT: { updateMainEvent: true }, ...fixtures },
    route: '/main-event-edit/e1',
  })
const loaded = () => wait(() => expect(fieldByLabel('活動名稱')).toHaveValue('周年慶'))
const save = () => screen.getByText('儲存').closest('button')
const sent = calls => callsOf(calls, 'UPDATE_MERCHANT_EVENT')[0].variables.input

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('編輯活動', () => {
  it('帶入活動資料：起訖日、總張數、簡訊、私人與適用店家；以網址 id 查詢', async () => {
    const { calls } = setup()
    await loaded()
    expect(callsOf(calls, 'GET_MERCHANT_EVENT')[0].variables).toEqual({ eventId: 'e1' })
    expect(Number(screen.getByLabelText('預設起始時間').value)).toBe(OCT_1_NOON)
    expect(Number(screen.getByLabelText('預設結束時間').value)).toBe(DEC_31_NOON)
    expect(fieldByLabel('總張數上限')).toHaveValue('5000')
    expect(screen.getByLabelText('開啟簡訊通知')).toBeChecked()
    expect(screen.getByText('私人')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('merchant-picker')).toHaveAttribute('data-selected', '["m9"]')
    expect(screen.getByTestId('merchant-picker').parentElement).toHaveStyle('display: block')
    expect(screen.getByTestId('merchant-picker').parentElement.style.display).toBe('')
  })

  it('儲存：送出 eventId、名稱去空白、台灣時間整天的起訖日、張數、簡訊與店家，成功導回活動列表', async () => {
    const { calls } = setup()
    await loaded()
    fireEvent.change(fieldByLabel('活動名稱'), { target: { value: ' 周年慶加碼 ' } })
    pickDate('預設結束時間', new Date(2027, 0, 15))
    const max = fieldByLabel('總張數上限')
    fireEvent.focusIn(max)
    fireEvent.change(max, { target: { value: '8000' } })
    fireEvent.change(max, { target: { value: '-1' } })
    fireEvent.click(screen.getByLabelText('開啟簡訊通知'))
    fireEvent.click(screen.getByText('選擇店家（測試）'))
    fireEvent.click(save())
    await wait(() => expect(currentLocation()).toBe('/main-event-list'))
    expect(callsOf(calls, 'UPDATE_MERCHANT_EVENT')[0].variables.input.eventId).toBe('e1')
    expect(sent(calls).mainEventInput).toEqual({
      nameDefault: '周年慶加碼',
      startDateDefault: Date.UTC(2026, 8, 30, 16, 0, 0, 0),
      endDateDefault: Date.UTC(2027, 0, 15, 15, 59, 59, 999),
      isSMSNotifyDefault: false,
      maxCountDefault: 8000,
      isPublic: false,
      merchantIds: ['m1', 'm2'],
    })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '儲存成功', variant: 'success' })
  })

  it('改成公開：店家選擇器隱藏、送出空的店家清單；起訖日互相對齊', async () => {
    const { calls } = setup()
    await loaded()
    fireEvent.click(screen.getByText('公開'))
    expect(screen.getByTestId('merchant-picker').parentElement.style.display).toBe('none')
    fireEvent.click(screen.getByText('公開'))
    expect(screen.getByText('公開')).toHaveAttribute('aria-pressed', 'true')
    const sep1 = new Date(2026, 8, 1)
    pickDate('預設結束時間', sep1)
    expect(Number(screen.getByLabelText('預設起始時間').value)).toBe(sep1.getTime())
    const next = new Date(2027, 1, 1)
    pickDate('預設起始時間', next)
    expect(Number(screen.getByLabelText('預設結束時間').value)).toBe(next.getTime())
    pickDate('預設結束時間', new Date(2027, 1, 10))
    expect(Number(screen.getByLabelText('預設起始時間').value)).toBe(next.getTime())
    fireEvent.click(save())
    await wait(() => expect(callsOf(calls, 'UPDATE_MERCHANT_EVENT')).toHaveLength(1))
    expect(sent(calls).mainEventInput).toEqual(expect.objectContaining({ isPublic: true, merchantIds: [] }))
  })

  it('已結束的活動整頁唯讀：日期與欄位唯讀、公開／私人與簡訊不可改、沒有儲存鈕', async () => {
    setup({ mainEvent: event({ endDateActual: Date.UTC(2026, 10, 1), isPublic: true }) })
    await loaded()
    expect(screen.getByLabelText('預設起始時間')).toHaveAttribute('data-readonly', 'true')
    expect(screen.getByLabelText('預設結束時間')).toHaveAttribute('data-readonly', 'true')
    expect(fieldByLabel('活動名稱')).toHaveAttribute('readonly')
    expect(fieldByLabel('總張數上限')).toHaveAttribute('readonly')
    expect(screen.getByText('公開')).toBeDisabled()
    expect(screen.getByText('私人')).toBeDisabled()
    expect(screen.getByLabelText('開啟簡訊通知')).toBeDisabled()
    expect(screen.queryByText('儲存')).toBeNull()
  })

  it('名稱空白提示請輸入活動名稱；後端回 false 提示儲存失敗；錯誤時提示錯誤；都留在本頁', async () => {
    const first = setup()
    await loaded()
    fireEvent.change(fieldByLabel('活動名稱'), { target: { value: '' } })
    fireEvent.click(save())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入活動名稱。', variant: 'error' }))
    expect(callsOf(first.calls, 'UPDATE_MERCHANT_EVENT')).toHaveLength(0)
    cleanup()

    setup({ UPDATE_MERCHANT_EVENT: { updateMainEvent: false } })
    await loaded()
    fireEvent.click(save())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '儲存失敗', variant: 'warning' }))
    expect(save()).toBeEnabled()
    cleanup()

    setup({ UPDATE_MERCHANT_EVENT: new Error('活動已結束') })
    await loaded()
    fireEvent.click(save())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '活動已結束', variant: 'error' }))
    await wait(() => expect(save()).toBeEnabled())
    expect(currentLocation()).toBe('/main-event-edit/e1')
  })
})
