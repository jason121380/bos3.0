// 保護「建立規則」（活動底下的發券規則）：帶入主活動的期間、簡訊與張數上限；起訖日限在主活動期間內、以台灣時間整天送出；
// 適用店家（依此活動參與的店家選，至少一間）、付款方式、門檻、每單上限、總張數（不得超過主活動上限）、入金儲值門檻；
// 自訂消費類型時依店販／會員卡／服務／四種卡券組出 consumptionTypeRules（全部套用＝ALL、自訂歸屬＝SPECIFIC＋歸屬）；
// 各種漏填的錯誤訊息；成功導回活動列表、失敗與錯誤提示。日期、店家、歸屬、付款方式選擇器以替身代替（各有自己的測試）。
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端、不建立真實規則。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import {
  fieldByLabel,
  fieldsByLabel,
  pickOption,
  pickDate,
  CONSUMPTION_TYPES,
  belongSelectOf,
  belongPickerOf,
} from '../../__tests__/settingsPageKit.test'
import EventRuleCreate from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.mock('ui/date-picker', () => require('../../__tests__/settingsPageKit.test').datePickerModule)
jest.mock('components/MerchantListAutocompleteForManagement', () => require('../../__tests__/settingsPageKit.test').merchantPickerModule)
jest.mock('components/BelongAutocomplete', () => require('../../__tests__/settingsPageKit.test').belongModule)
jest.mock('components/PaywayAutocomplete', () => require('../../__tests__/settingsPageKit.test').paywayModule)
jest.setTimeout(20000)

// 主活動期間：台灣 2026/10/01 00:00 ～ 2026/12/31 23:59:59.999
const MAIN_START = Date.UTC(2026, 8, 30, 16, 0)
const MAIN_END = Date.UTC(2026, 11, 31, 15, 59, 59, 999)
const MAIN_EVENT = { nameDefault: '周年慶', startDateDefault: MAIN_START, endDateDefault: MAIN_END, isSMSNotifyDefault: true, maxCountDefault: 5000 }
const setup = (fixtures = {}) =>
  renderPage(<EventRuleCreate match={{ params: { id: 'e1' } }} />, {
    fixtures: {
      USE_FETCH_GET_ATTRIBUTIONS: {
        getAttribution: [
          { name: '設計部', value: 'd' },
          { name: '美容部', value: 'b' },
        ],
      },
      GET_MERCHANT_EVENT_FOR_RULES: { mainEvent: MAIN_EVENT },
      CREATE_EVENT_RULE_GROUP: { createEventRuleGroup: true },
      ...fixtures,
    },
    route: '/event-rule-create/e1',
  })
const loaded = () => screen.findByText('周年慶 2026/10/01 ~ 2026/12/31')
const submit = () => screen.getByText('新增').closest('button')
const sent = calls => callsOf(calls, 'CREATE_EVENT_RULE_GROUP')[0].variables.input
const fillBasics = () => {
  fireEvent.change(fieldByLabel('規則名稱'), { target: { value: '  滿千送券 ' } })
  fireEvent.click(screen.getByText('選擇店家（測試）'))
  fireEvent.click(screen.getByText('選付款方式（測試）'))
}
const customize = () => fireEvent.click(screen.getByText('自訂'))

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('建立規則', () => {
  it('帶入主活動：標題顯示名稱與期間、日期限在主活動期間、簡訊與總張數預設主活動的值；店家依此活動選', async () => {
    const { calls } = setup()
    await loaded()
    expect(callsOf(calls, 'GET_MERCHANT_EVENT_FOR_RULES')[0].variables).toEqual({ eventId: 'e1' })
    const start = screen.getByLabelText('起始時間')
    expect(Number(start.value)).toBe(MAIN_START)
    expect(start).toHaveAttribute('data-min', String(MAIN_START))
    expect(start).toHaveAttribute('data-max', String(MAIN_END))
    expect(Number(screen.getByLabelText('結束時間').value)).toBe(MAIN_END)
    expect(screen.getByLabelText('開啟簡訊通知')).toBeChecked()
    expect(fieldByLabel('總張數上限')).toHaveValue('5000')
    const picker = screen.getByTestId('merchant-picker')
    expect(picker).toHaveAttribute('data-in-rule', 'true')
    expect(picker).toHaveAttribute('data-event-id', 'e1')
    // 全部套用時不出現各消費類型的設定
    expect(screen.queryByLabelText('店販')).toBeNull()
  })

  it('全部套用：送出主活動 id、名稱去空白、台灣時間整天、店家、付款方式、門檻、上限與入金儲值規則，成功導回活動列表', async () => {
    const { calls } = setup()
    await loaded()
    fillBasics()
    pickDate('起始時間', new Date(2026, 10, 1))
    pickDate('結束時間', new Date(2026, 10, 30))
    fireEvent.click(screen.getByText('選擇店家（測試）'))
    const threshold = fieldByLabel('門檻')
    fireEvent.focusIn(threshold)
    fireEvent.change(threshold, { target: { value: '1000' } })
    fireEvent.change(threshold, { target: { value: '10.5' } })
    const perOrder = fieldByLabel('每單發券上限')
    fireEvent.focusIn(perOrder)
    fireEvent.change(perOrder, { target: { value: '2' } })
    fireEvent.change(perOrder, { target: { value: 'x' } })
    const max = fieldByLabel('總張數上限')
    fireEvent.focusIn(max)
    fireEvent.change(max, { target: { value: '3000' } })
    fireEvent.change(max, { target: { value: '3000a' } })
    fireEvent.click(screen.getByLabelText('開啟簡訊通知'))
    pickOption(fieldByLabel('現金'), '套用')
    pickOption(fieldByLabel('其他付款方式'), '套用')
    const [cash, other] = fieldsByLabel('金額門檻')
    fireEvent.focusIn(cash)
    fireEvent.change(cash, { target: { value: '5000' } })
    fireEvent.change(cash, { target: { value: '5千' } })
    fireEvent.focusIn(other)
    fireEvent.change(other, { target: { value: '3000' } })
    fireEvent.change(other, { target: { value: '-3' } })
    fireEvent.click(submit())
    await wait(() => expect(currentLocation()).toBe('/main-event-list'))
    expect(sent(calls)).toEqual({
      mainEventId: 'e1',
      nameForGroup: '滿千送券',
      startDateForGroup: Date.UTC(2026, 9, 31, 16, 0, 0, 0),
      endDateForGroup: Date.UTC(2026, 10, 30, 15, 59, 59, 999),
      merchants: ['m1', 'm2'],
      consumptionTypeUsing: 'ALL',
      maxCountForGroup: 3000,
      payTypeUsing: ['CASH', 'LINEPAY'],
      thresholdPrice: 1000,
      isSMSNotifyForGroup: false,
      maxCountPerOrder: 2,
      consumptionTypeRules: [],
      walletDepositRules: [
        { payType: 'CASH', depositThreshold: 5000 },
        { payType: 'OTHERPAY', depositThreshold: 3000 },
      ],
    })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '建立成功', variant: 'success' })
  })

  it('總張數超過主活動上限時提示上限、不改值', async () => {
    setup()
    await loaded()
    fireEvent.change(fieldByLabel('總張數上限'), { target: { value: '5001' } })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '張數上限為5000', variant: 'warning' })
    expect(fieldByLabel('總張數上限')).toHaveValue('5000')
  })

  it('入金儲值改回不套用時門檻清為 0、不送出該規則', async () => {
    const { calls } = setup()
    await loaded()
    fillBasics()
    pickOption(fieldByLabel('現金'), '套用')
    fireEvent.change(fieldsByLabel('金額門檻')[0], { target: { value: '800' } })
    pickOption(fieldByLabel('現金'), '不套用')
    expect(fieldsByLabel('金額門檻')).toHaveLength(0)
    pickOption(fieldByLabel('現金'), '套用')
    expect(fieldsByLabel('金額門檻')[0]).toHaveValue('0')
    pickOption(fieldByLabel('現金'), '不套用')
    fireEvent.click(submit())
    await wait(() => expect(callsOf(calls, 'CREATE_EVENT_RULE_GROUP')).toHaveLength(1))
    expect(sent(calls).walletDepositRules).toEqual([])
  })

  it('自訂消費類型：店販、會員卡、服務全部套用、四種卡券自訂歸屬，組出對應的 consumptionTypeRules', async () => {
    const { calls } = setup()
    await loaded()
    fillBasics()
    customize()
    pickOption(fieldByLabel('店販'), '套用')
    pickOption(fieldByLabel('會員卡'), '套用')
    CONSUMPTION_TYPES.forEach(([label]) => {
      pickOption(fieldByLabel(label), '套用')
      if (label !== '服務') {
        pickOption(belongSelectOf(label), '自訂')
        expect(belongPickerOf(label)).toHaveAttribute('data-options', '["設計部","美容部"]')
        fireEvent.click(belongPickerOf(label).querySelector('button'))
      }
    })
    // 服務先改自訂選歸屬、再改回全部套用：歸屬清空
    pickOption(belongSelectOf('服務'), '自訂')
    fireEvent.click(belongPickerOf('服務').querySelector('button'))
    expect(belongPickerOf('服務')).toHaveAttribute('data-value', '["設計部","美容部"]')
    pickOption(belongSelectOf('服務'), '全部套用')
    expect(belongPickerOf('服務')).toBeNull()
    fireEvent.click(submit())
    await wait(() => expect(callsOf(calls, 'CREATE_EVENT_RULE_GROUP')).toHaveLength(1))
    const specific = attributions => ({ attributionRange: 'SPECIFIC', attributions })
    expect(sent(calls).consumptionTypeUsing).toBe('CUSTOMIZE')
    expect(sent(calls).consumptionTypeRules).toEqual([
      { consumptionType: 'PRODUCT', attributionRange: 'ALL', attributions: [] },
      { consumptionType: 'MEMBERSHIP', attributionRange: 'ALL', attributions: [] },
      { consumptionType: 'SERVICE', attributionRange: 'ALL', attributions: [] },
      { consumptionType: 'TICKETSELLINPERFORMANCE', ...specific(['設計部', '美容部']) },
      { consumptionType: 'TICKETSELLNOTINPERFORMANCE', ...specific(['設計部', '美容部']) },
      { consumptionType: 'TICKETUSEPERFORMANCEENTERED', ...specific(['設計部', '美容部']) },
      { consumptionType: 'TICKETUSEPERFORMANCENOTENTERED', ...specific(['設計部', '美容部']) },
    ])
  })

  it('改回不套用的消費類型不送出；切回全部套用時不送任何消費類型規則；再按已選的「自訂」不變', async () => {
    const { calls } = setup()
    await loaded()
    fillBasics()
    customize()
    customize()
    expect(screen.getByText('自訂')).toHaveAttribute('aria-pressed', 'true')
    CONSUMPTION_TYPES.forEach(([label]) => {
      pickOption(fieldByLabel(label), '套用')
      pickOption(belongSelectOf(label), '自訂')
      pickOption(fieldByLabel(label), '不套用')
      expect(belongPickerOf(label)).toBeNull()
    })
    pickOption(fieldByLabel('用卡後入'), '套用')
    fireEvent.click(submit())
    await wait(() => expect(callsOf(calls, 'CREATE_EVENT_RULE_GROUP')).toHaveLength(1))
    expect(sent(calls).consumptionTypeRules).toEqual([
      { consumptionType: 'TICKETUSEPERFORMANCENOTENTERED', attributionRange: 'ALL', attributions: [] },
    ])
    cleanup()

    const second = setup()
    await loaded()
    fillBasics()
    customize()
    pickOption(fieldByLabel('店販'), '套用')
    fireEvent.click(screen.getByText('全部套用'))
    fireEvent.click(submit())
    await wait(() => expect(callsOf(second.calls, 'CREATE_EVENT_RULE_GROUP')).toHaveLength(1))
    expect(sent(second.calls)).toEqual(expect.objectContaining({ consumptionTypeUsing: 'ALL', consumptionTypeRules: [] }))
  })

  it.each(
    CONSUMPTION_TYPES.map(([label], i) => [
      label,
      [
        '請選擇服務套用的歸屬。',
        '請選擇賣卡先入套用的歸屬。',
        '請選擇賣卡後入套用的歸屬。',
        '請選擇用卡先入套用的歸屬。',
        '請選擇用卡後入套用的歸屬。',
      ][i],
    ])
  )('%s 選自訂歸屬卻沒選歸屬：提示「%s」、不送出', async (label, message) => {
    const { calls } = setup()
    await loaded()
    fillBasics()
    customize()
    pickOption(fieldByLabel(label), '套用')
    pickOption(belongSelectOf(label), '自訂')
    fireEvent.click(submit())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message, variant: 'error' }))
    expect(callsOf(calls, 'CREATE_EVENT_RULE_GROUP')).toHaveLength(0)
    expect(submit()).toBeEnabled()
  })

  it('漏填的錯誤訊息：規則名稱、適用店家、自訂卻沒選任何消費類型、付款方式、入金門檻為 0', async () => {
    const { calls } = setup()
    await loaded()
    fireEvent.click(submit())
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請輸入規則名稱。', variant: 'error' }))
    fireEvent.change(fieldByLabel('規則名稱'), { target: { value: '滿千送券' } })
    fireEvent.click(submit())
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請選擇適用店家。', variant: 'error' }))
    fireEvent.click(screen.getByText('選擇店家（測試）'))
    customize()
    fireEvent.click(submit())
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請選套用的消費類型。', variant: 'error' }))
    fireEvent.click(screen.getByText('全部套用'))
    fireEvent.click(submit())
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請選擇適用付款方式。', variant: 'error' }))
    fireEvent.click(screen.getByText('選付款方式（測試）'))
    pickOption(fieldByLabel('現金'), '套用')
    fireEvent.click(submit())
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '入金儲值現金金額門檻不得為0。', variant: 'error' }))
    pickOption(fieldByLabel('現金'), '不套用')
    pickOption(fieldByLabel('其他付款方式'), '套用')
    fireEvent.click(submit())
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '入金儲值其他付款方式金額門檻不得為0。', variant: 'error' }))
    expect(callsOf(calls, 'CREATE_EVENT_RULE_GROUP')).toHaveLength(0)
  })

  it('起訖日互相對齊：結束早於開始時開始跟著改，開始晚於結束時結束跟著改', async () => {
    setup()
    await loaded()
    pickDate('起始時間', new Date(2026, 10, 15))
    const nov10 = new Date(2026, 10, 10)
    pickDate('結束時間', nov10)
    expect(Number(screen.getByLabelText('起始時間').value)).toBe(nov10.getTime())
    const dec1 = new Date(2026, 11, 1)
    pickDate('起始時間', dec1)
    expect(Number(screen.getByLabelText('結束時間').value)).toBe(dec1.getTime())
    pickDate('結束時間', new Date(2026, 11, 20))
    expect(Number(screen.getByLabelText('起始時間').value)).toBe(dec1.getTime())
  })

  // 原本沒選適用店家也能建立規則（merchants 送空陣列），規則可能不適用任何店家。
  // Jason 2026/10/22「照建議」：至少選一間適用店家，否則提示且不送出。
  it('沒選適用店家：提示「請選擇適用店家。」、不送出、按鈕可再按', async () => {
    const { calls } = setup()
    await loaded()
    fireEvent.change(fieldByLabel('規則名稱'), { target: { value: '滿千送券' } })
    fireEvent.click(screen.getByText('選付款方式（測試）'))
    fireEvent.click(submit())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '請選擇適用店家。', variant: 'error' }))
    expect(callsOf(calls, 'CREATE_EVENT_RULE_GROUP')).toHaveLength(0)
    expect(submit()).toBeEnabled()
    expect(currentLocation()).toBe('/event-rule-create/e1')
  })

  it('後端回 false 提示建立失敗；錯誤時提示錯誤；都留在本頁可再按', async () => {
    const first = setup({ CREATE_EVENT_RULE_GROUP: { createEventRuleGroup: false } })
    await loaded()
    fillBasics()
    fireEvent.click(submit())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '建立失敗', variant: 'warning' }))
    expect(sent(first.calls).merchants).toEqual(['m1', 'm2'])
    expect(submit()).toBeEnabled()
    cleanup()

    setup({ CREATE_EVENT_RULE_GROUP: new Error('規則期間超出主活動') })
    await loaded()
    fillBasics()
    fireEvent.click(submit())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '規則期間超出主活動', variant: 'error' }))
    await wait(() => expect(submit()).toBeEnabled())
    expect(currentLocation()).toBe('/event-rule-create/e1')
  })
})
