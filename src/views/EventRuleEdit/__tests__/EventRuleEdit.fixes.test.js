// 修正（Jason 2026/10/22 長期授權）：
// ① 已結束規則的唯讀畫面中，服務／賣卡先入／賣卡後入的歸屬多選把唯讀傳成 readOnly（元件吃的是 isReadOnly，且 readOnly 會被 isReadOnly=false 蓋掉），
//    結果仍可修改；改傳 isReadOnly。
// ② 規則或歸屬查詢失敗時原本解構 undefined／對 undefined 呼叫 .map，整頁進入錯誤畫面；改為不帶入、歸屬當成沒有選項。
// ③ 規則名稱空白的錯誤訊息改為「請輸入規則名稱。」（原本寫活動名稱）。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { fieldByLabel, CONSUMPTION_TYPES, belongPickerOf } from '../../__tests__/settingsPageKit.test'
import EventRuleEdit from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.mock('ui/date-picker', () => require('../../__tests__/settingsPageKit.test').datePickerModule)
jest.mock('components/MerchantListAutocompleteForManagement', () => require('../../__tests__/settingsPageKit.test').merchantPickerModule)
jest.mock('components/BelongAutocomplete', () => require('../../__tests__/settingsPageKit.test').belongModule)
jest.mock('components/PaywayAutocomplete', () => require('../../__tests__/settingsPageKit.test').paywayModule)
jest.setTimeout(20000)
beforeEach(() => loginAs())
afterEach(cleanup)

const group = overrides => ({
  mainEventId: 'e1',
  nameForGroup: '滿千送券',
  nameDefault: '周年慶',
  startDateDefault: 0,
  endDateDefault: 0,
  startDateForGroup: 0,
  endDateForGroup: 0,
  isSMSNotifyForGroup: false,
  maxCountForGroup: 1,
  maxCountPerOrder: 1,
  maxCountDefault: 10,
  thresholdPrice: 0,
  endDateActual: null,
  consumptionTypeUsing: 'CUSTOMIZE',
  consumptionTypeRules: CONSUMPTION_TYPES.map(([, type]) => ({ consumptionType: type, attributionRange: 'SPECIFIC', attributions: ['設計部'] })),
  payTypeUsing: ['CASH'],
  merchants: [],
  walletDepositRules: [],
  ...overrides,
})
const setup = (fixtures, options = {}) =>
  renderPage(<EventRuleEdit match={{ params: { id: 'rg1' } }} />, {
    fixtures: { USE_FETCH_GET_ATTRIBUTIONS: { getAttribution: [{ name: '設計部' }] }, ...fixtures },
    ...options,
  })

it('已結束的規則：五種消費類型的歸屬多選都唯讀', async () => {
  const { settle } = setup({ GET_EVENT_RULE_GROUP: { eventRuleGroup: group({ endDateActual: 1 }) } })
  await settle()
  CONSUMPTION_TYPES.forEach(([label]) => expect(belongPickerOf(label)).toHaveAttribute('data-readonly', 'true'))
})

it('進行中的規則：歸屬多選可修改', async () => {
  const { settle } = setup({ GET_EVENT_RULE_GROUP: { eventRuleGroup: group() } })
  await settle()
  CONSUMPTION_TYPES.forEach(([label]) => expect(belongPickerOf(label)).toHaveAttribute('data-readonly', 'false'))
})

it.each([['查無規則', { GET_EVENT_RULE_GROUP: { eventRuleGroup: null } }]])('%s時不整頁壞，表單空白、沒有可送出的資料', async (_, fixtures) => {
  const { settle } = renderPage(<EventRuleEdit match={{ params: { id: 'rg1' } }} />, { fixtures, fallback: 'error' })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(fieldByLabel('規則名稱')).toHaveValue('')
})

it('規則名稱空白時提示「請輸入規則名稱。」', async () => {
  const { settle } = setup({ GET_EVENT_RULE_GROUP: { eventRuleGroup: group({ nameForGroup: ' ' }) } })
  await settle()
  fireEvent.click(screen.getByText('儲存').closest('button'))
  await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入規則名稱。', variant: 'error' }))
})

// 2026/10/28：查詢失敗（網路或後端錯誤）改顯示可重試的錯誤狀態，不再顯示空白表單／列表，避免使用者把空值存回去；查無資料仍照原本顯示
it('查詢失敗時顯示無法載入資料與重新查詢', async () => {
  const { settle } = renderPage(<EventRuleEdit match={{ params: { id: 'rg1' } }} />, { fallback: 'error' })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getByText('無法載入資料')).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: '重新查詢' })[0]).toBeEnabled()
})
