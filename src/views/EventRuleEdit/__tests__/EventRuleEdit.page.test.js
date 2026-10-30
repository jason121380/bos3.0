// 保護「編輯規則」：依規則 id 帶入規則（消費類型規則還原成畫面的店販／會員卡／服務／四種卡券設定，未知類型略過；
// 入金儲值規則還原成現金／其他付款方式門檻；適用店家、付款方式、門檻、上限、簡訊）；儲存送出 id 與重新組出的規則
// （起訖日以台灣時間整天）；已結束的規則整頁唯讀、沒有儲存鈕；漏填的錯誤訊息；成功導回活動列表、失敗與錯誤提示。
// 日期、店家、歸屬、付款方式選擇器以替身代替（各有自己的測試）。GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
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
  selectedText,
  CONSUMPTION_TYPES,
  belongSelectOf,
  belongPickerOf,
} from '../../__tests__/settingsPageKit.test'
import EventRuleEdit from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.mock('ui/date-picker', () => require('../../__tests__/settingsPageKit.test').datePickerModule)
jest.mock('components/MerchantListAutocompleteForManagement', () => require('../../__tests__/settingsPageKit.test').merchantPickerModule)
jest.mock('components/BelongAutocomplete', () => require('../../__tests__/settingsPageKit.test').belongModule)
jest.mock('components/PaywayAutocomplete', () => require('../../__tests__/settingsPageKit.test').paywayModule)
jest.setTimeout(20000)

// 主活動期間：台灣 2026/10/01 ～ 2026/12/31；規則期間：台灣 2026/11/01 12:00 ～ 2026/11/30 12:00
const MAIN_START = Date.UTC(2026, 8, 30, 16, 0)
const MAIN_END = Date.UTC(2026, 11, 31, 15, 59, 59, 999)
const RULE_START = Date.UTC(2026, 10, 1, 4, 0)
const RULE_END = Date.UTC(2026, 10, 30, 4, 0)
const ALL = type => ({ consumptionType: type, attributionRange: 'ALL', attributions: [] })
const SPECIFIC = (type, attributions) => ({ consumptionType: type, attributionRange: 'SPECIFIC', attributions })
const ruleGroup = overrides => ({
  mainEventId: 'e1',
  nameForGroup: '滿千送券',
  nameDefault: '周年慶',
  startDateDefault: MAIN_START,
  endDateDefault: MAIN_END,
  startDateForGroup: RULE_START,
  endDateForGroup: RULE_END,
  isSMSNotifyForGroup: true,
  maxCountForGroup: 3000,
  maxCountPerOrder: 2,
  maxCountDefault: 5000,
  thresholdPrice: 1000,
  endDateActual: null,
  consumptionTypeUsing: 'CUSTOMIZE',
  consumptionTypeRules: [
    ALL('PRODUCT'),
    ALL('MEMBERSHIP'),
    SPECIFIC('SERVICE', ['設計部']),
    ALL('TICKETSELLINPERFORMANCE'),
    SPECIFIC('TICKETSELLNOTINPERFORMANCE', ['美容部']),
    ALL('TICKETUSEPERFORMANCEENTERED'),
    SPECIFIC('TICKETUSEPERFORMANCENOTENTERED', ['設計部']),
    // 前端不認得的類型略過
    ALL('GIFT'),
  ],
  payTypeUsing: ['CASH'],
  merchants: [{ id: 'm9' }],
  walletDepositRules: [
    { payType: 'CASH', depositThreshold: 5000 },
    { payType: 'OTHERPAY', depositThreshold: 2000 },
  ],
  ...overrides,
})
const setup = ({ group = ruleGroup(), ...fixtures } = {}) =>
  renderPage(<EventRuleEdit match={{ params: { id: 'rg1' } }} />, {
    fixtures: {
      USE_FETCH_GET_ATTRIBUTIONS: {
        getAttribution: [
          { name: '設計部', value: 'd' },
          { name: '美容部', value: 'b' },
        ],
      },
      GET_EVENT_RULE_GROUP: { eventRuleGroup: group },
      UPDATE_EVENT_RULE_GROUP: { updateEventRuleGroup: true },
      ...fixtures,
    },
    route: '/event-rule-edit/rg1',
  })
const loaded = () => screen.findByText('周年慶 2026/10/01 ~ 2026/12/31')
const save = () => screen.getByText('儲存').closest('button')
const sentInput = calls => callsOf(calls, 'UPDATE_EVENT_RULE_GROUP')[0].variables.input

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('編輯規則', () => {
  it('帶入規則：期間、店家、消費類型（全部套用／自訂歸屬）、付款方式、門檻、上限、入金儲值與簡訊', async () => {
    const { calls } = setup()
    await loaded()
    expect(callsOf(calls, 'GET_EVENT_RULE_GROUP')[0].variables).toEqual({ ruleGroupId: 'rg1' })
    expect(fieldByLabel('規則名稱')).toHaveValue('滿千送券')
    const start = screen.getByLabelText('起始時間')
    expect(Number(start.value)).toBe(RULE_START)
    expect(start).toHaveAttribute('data-min', String(MAIN_START))
    expect(start).toHaveAttribute('data-max', String(MAIN_END))
    expect(start).toHaveAttribute('data-readonly', 'false')
    const picker = screen.getByTestId('merchant-picker')
    expect(picker).toHaveAttribute('data-selected', '["m9"]')
    expect(picker).toHaveAttribute('data-event-id', 'e1')
    expect(screen.getByRole('button', { name: '自訂' })).toHaveAttribute('aria-pressed', 'true')
    expect(selectedText(fieldByLabel('店販'))).toBe('套用')
    expect(selectedText(fieldByLabel('會員卡'))).toBe('套用')
    expect(selectedText(belongSelectOf('服務'))).toBe('自訂')
    expect(belongPickerOf('服務')).toHaveAttribute('data-value', '["設計部"]')
    expect(selectedText(belongSelectOf('賣卡先入'))).toBe('全部套用')
    expect(belongPickerOf('賣卡後入')).toHaveAttribute('data-value', '["美容部"]')
    expect(selectedText(belongSelectOf('用卡先入'))).toBe('全部套用')
    expect(belongPickerOf('用卡後入')).toHaveAttribute('data-value', '["設計部"]')
    expect(screen.getByTestId('payway')).toHaveAttribute('data-value', '["CASH"]')
    expect(fieldByLabel('門檻')).toHaveValue('1000')
    expect(fieldByLabel('每單發券上限')).toHaveValue('2')
    expect(fieldByLabel('總張數上限')).toHaveValue('3000')
    expect(selectedText(fieldByLabel('現金'))).toBe('套用')
    expect(fieldsByLabel('金額門檻').map(i => i.value)).toEqual(['5000', '2000'])
    expect(screen.getByLabelText('開啟簡訊通知')).toBeChecked()
    expect(screen.getByLabelText('開啟簡訊通知')).toBeEnabled()
  })

  it('不修改直接儲存：送出 id 與還原後重新組出的規則（略過未知類型），台灣時間整天，成功導回活動列表', async () => {
    const { calls } = setup()
    await loaded()
    fireEvent.click(save())
    await wait(() => expect(currentLocation()).toBe('/main-event-list'))
    expect(sentInput(calls)).toEqual({
      id: 'rg1',
      eventRuleGroup: {
        mainEventId: 'e1',
        nameForGroup: '滿千送券',
        startDateForGroup: Date.UTC(2026, 9, 31, 16, 0, 0, 0),
        endDateForGroup: Date.UTC(2026, 10, 30, 15, 59, 59, 999),
        merchants: ['m9'],
        consumptionTypeUsing: 'CUSTOMIZE',
        maxCountForGroup: 3000,
        payTypeUsing: ['CASH'],
        thresholdPrice: 1000,
        isSMSNotifyForGroup: true,
        maxCountPerOrder: 2,
        consumptionTypeRules: [
          ALL('PRODUCT'),
          ALL('MEMBERSHIP'),
          SPECIFIC('SERVICE', ['設計部']),
          ALL('TICKETSELLINPERFORMANCE'),
          SPECIFIC('TICKETSELLNOTINPERFORMANCE', ['美容部']),
          ALL('TICKETUSEPERFORMANCEENTERED'),
          SPECIFIC('TICKETUSEPERFORMANCENOTENTERED', ['設計部']),
        ],
        walletDepositRules: [
          { payType: 'CASH', depositThreshold: 5000 },
          { payType: 'OTHERPAY', depositThreshold: 2000 },
        ],
      },
    })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '儲存成功', variant: 'success' })
  })

  it('修改後儲存：名稱、日期、店家、付款方式、門檻、上限、簡訊、消費類型與入金儲值都依畫面送出', async () => {
    const { calls } = setup()
    await loaded()
    fireEvent.change(fieldByLabel('規則名稱'), { target: { value: ' 滿兩千送券 ' } })
    pickDate('起始時間', new Date(2026, 10, 5))
    pickDate('結束時間', new Date(2026, 10, 25))
    fireEvent.click(screen.getByText('選擇店家（測試）'))
    fireEvent.click(screen.getByText('選付款方式（測試）'))
    for (const [label, value] of [
      ['門檻', '2000'],
      ['每單發券上限', '3'],
      ['總張數上限', '4000'],
    ]) {
      const input = fieldByLabel(label)
      fireEvent.focusIn(input)
      fireEvent.change(input, { target: { value } })
      fireEvent.change(input, { target: { value: `${value}x` } })
    }
    fireEvent.click(screen.getByLabelText('開啟簡訊通知'))
    pickOption(fieldByLabel('店販'), '不套用')
    pickOption(fieldByLabel('會員卡'), '不套用')
    CONSUMPTION_TYPES.forEach(([label]) => {
      pickOption(fieldByLabel(label), '不套用')
      pickOption(fieldByLabel(label), '套用')
      pickOption(belongSelectOf(label), '自訂')
      fireEvent.click(belongPickerOf(label).querySelector('button'))
    })
    // 現金改不套用再套用：門檻清為 0
    pickOption(fieldByLabel('現金'), '不套用')
    pickOption(fieldByLabel('現金'), '套用')
    const [cash, other] = fieldsByLabel('金額門檻')
    expect(cash).toHaveValue('0')
    fireEvent.focusIn(cash)
    fireEvent.change(cash, { target: { value: '6000' } })
    fireEvent.change(cash, { target: { value: '6k' } })
    fireEvent.focusIn(other)
    fireEvent.change(other, { target: { value: '2500' } })
    fireEvent.change(other, { target: { value: '2.5' } })
    pickOption(fieldByLabel('其他付款方式'), '不套用')
    fireEvent.click(save())
    await wait(() => expect(callsOf(calls, 'UPDATE_EVENT_RULE_GROUP')).toHaveLength(1))
    const both = ['設計部', '美容部']
    expect(sentInput(calls).eventRuleGroup).toEqual({
      mainEventId: 'e1',
      nameForGroup: '滿兩千送券',
      startDateForGroup: Date.UTC(2026, 10, 4, 16, 0, 0, 0),
      endDateForGroup: Date.UTC(2026, 10, 25, 15, 59, 59, 999),
      merchants: ['m1', 'm2'],
      consumptionTypeUsing: 'CUSTOMIZE',
      maxCountForGroup: 4000,
      payTypeUsing: ['CASH', 'LINEPAY'],
      thresholdPrice: 2000,
      isSMSNotifyForGroup: false,
      maxCountPerOrder: 3,
      consumptionTypeRules: CONSUMPTION_TYPES.map(([, type]) => SPECIFIC(type, both)),
      walletDepositRules: [{ payType: 'CASH', depositThreshold: 6000 }],
    })
  })

  it('改成全部套用：不送消費類型規則；歸屬改回全部套用時清掉歸屬', async () => {
    const { calls } = setup()
    await loaded()
    pickOption(belongSelectOf('服務'), '全部套用')
    expect(belongPickerOf('服務')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '全部套用' }))
    fireEvent.click(screen.getByRole('button', { name: '全部套用' }))
    expect(screen.getByRole('button', { name: '全部套用' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByLabelText('店販')).toBeNull()
    fireEvent.click(save())
    await wait(() => expect(callsOf(calls, 'UPDATE_EVENT_RULE_GROUP')).toHaveLength(1))
    expect(sentInput(calls).eventRuleGroup).toEqual(expect.objectContaining({ consumptionTypeUsing: 'ALL', consumptionTypeRules: [] }))
  })

  it('已結束的規則整頁唯讀：選項唯讀、切換鈕與簡訊停用、選擇器唯讀、沒有儲存鈕', async () => {
    setup({
      group: ruleGroup({
        endDateActual: Date.UTC(2026, 10, 20),
        consumptionTypeRules: CONSUMPTION_TYPES.map(([, type]) => SPECIFIC(type, ['設計部'])),
      }),
    })
    await loaded()
    expect(screen.queryByText('儲存')).toBeNull()
    expect(screen.getByLabelText('起始時間')).toHaveAttribute('data-readonly', 'true')
    expect(screen.getByLabelText('結束時間')).toHaveAttribute('data-readonly', 'true')
    expect(fieldByLabel('規則名稱')).toHaveAttribute('readonly')
    expect(fieldByLabel('門檻')).toHaveAttribute('readonly')
    expect(screen.getByRole('button', { name: '全部套用' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '自訂' })).toBeDisabled()
    expect(fieldByLabel('店販')).toHaveAttribute('aria-readonly', 'true')
    expect(belongSelectOf('服務')).toHaveAttribute('aria-readonly', 'true')
    expect(screen.getByTestId('payway')).toHaveAttribute('data-readonly', 'true')
    expect(screen.getByTestId('merchant-picker')).toHaveAttribute('data-readonly', 'true')
    expect(fieldByLabel('現金')).toHaveAttribute('aria-readonly', 'true')
    expect(screen.getByLabelText('開啟簡訊通知')).toBeDisabled()
  })

  it('總張數超過主活動上限時提示上限、不改值；起訖日互相對齊', async () => {
    setup()
    await loaded()
    fireEvent.change(fieldByLabel('總張數上限'), { target: { value: '9999' } })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '張數上限為5000', variant: 'warning' })
    expect(fieldByLabel('總張數上限')).toHaveValue('3000')
    const nov10 = new Date(2026, 10, 10)
    pickDate('結束時間', nov10)
    pickDate('起始時間', new Date(2026, 10, 1))
    pickDate('結束時間', new Date(2026, 9, 20))
    expect(Number(screen.getByLabelText('起始時間').value)).toBe(new Date(2026, 9, 20).getTime())
    const dec1 = new Date(2026, 11, 1)
    pickDate('起始時間', dec1)
    expect(Number(screen.getByLabelText('結束時間').value)).toBe(dec1.getTime())
    expect(nov10).toBeTruthy()
  })

  it.each([
    ['規則名稱空白', { nameForGroup: '  ' }, '請輸入規則名稱。'],
    // Jason 2026/10/22「照建議」：至少選一間適用店家
    ['沒有適用店家', { merchants: [] }, '請選擇適用店家。'],
    ['自訂歸屬但沒有歸屬', { consumptionTypeRules: [SPECIFIC('SERVICE', [])] }, '請選擇服務套用的歸屬。'],
    ['自訂卻沒有任何消費類型', { consumptionTypeRules: [] }, '請選套用的消費類型。'],
    ['沒有付款方式', { payTypeUsing: [] }, '請選擇適用付款方式。'],
    ['現金入金門檻為 0', { walletDepositRules: [{ payType: 'CASH', depositThreshold: 0 }] }, '入金儲值現金金額門檻不得為0。'],
    ['其他付款方式入金門檻為 0', { walletDepositRules: [{ payType: 'OTHERPAY', depositThreshold: 0 }] }, '入金儲值其他付款方式金額門檻不得為0。'],
  ])('%s：提示錯誤、不送出、按鈕可再按', async (_, overrides, message) => {
    const { calls } = setup({ group: ruleGroup(overrides) })
    await loaded()
    fireEvent.click(save())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message, variant: 'error' }))
    expect(callsOf(calls, 'UPDATE_EVENT_RULE_GROUP')).toHaveLength(0)
    expect(save()).toBeEnabled()
  })

  it('後端回 false 提示儲存失敗；錯誤時提示錯誤；都留在本頁', async () => {
    setup({ UPDATE_EVENT_RULE_GROUP: { updateEventRuleGroup: false } })
    await loaded()
    fireEvent.click(save())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '儲存失敗', variant: 'warning' }))
    expect(save()).toBeEnabled()
    cleanup()
    setup({ UPDATE_EVENT_RULE_GROUP: new Error('規則已有發券紀錄') })
    await loaded()
    fireEvent.click(save())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '規則已有發券紀錄', variant: 'error' }))
    await wait(() => expect(save()).toBeEnabled())
    expect(currentLocation()).toBe('/event-rule-edit/rg1')
  })
})
