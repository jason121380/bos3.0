// 修正（Jason 2026/10/22 長期授權）：
// ① 主活動或歸屬查詢失敗時原本解構 undefined／對 undefined 呼叫 .map，整頁進入錯誤畫面；改為不帶入主活動、歸屬當成沒有選項。
// ② 規則名稱空白的錯誤訊息原本寫「請輸入活動名稱。」，改為「請輸入規則名稱。」。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { fieldByLabel, pickOption, belongSelectOf, belongPickerOf } from '../../__tests__/settingsPageKit.test'
import EventRuleCreate from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.mock('ui/date-picker', () => require('../../__tests__/settingsPageKit.test').datePickerModule)
jest.mock('components/MerchantListAutocompleteForManagement', () => require('../../__tests__/settingsPageKit.test').merchantPickerModule)
jest.mock('components/BelongAutocomplete', () => require('../../__tests__/settingsPageKit.test').belongModule)
jest.mock('components/PaywayAutocomplete', () => require('../../__tests__/settingsPageKit.test').paywayModule)
jest.setTimeout(20000)
beforeEach(() => loginAs())
afterEach(cleanup)

const MAIN_EVENT = { nameDefault: '周年慶', startDateDefault: 0, endDateDefault: 0, isSMSNotifyDefault: false, maxCountDefault: 10 }

it('主活動與歸屬都查詢失敗時不整頁壞，仍顯示規則表單', async () => {
  const { settle } = renderPage(<EventRuleCreate match={{ params: { id: 'e1' } }} />, { fallback: 'error' })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(fieldByLabel('規則名稱')).toHaveValue('')
})

it('只有歸屬查詢失敗時，自訂歸屬的選項為空', async () => {
  const { settle } = renderPage(<EventRuleCreate match={{ params: { id: 'e1' } }} />, {
    fixtures: { GET_MERCHANT_EVENT_FOR_RULES: { mainEvent: MAIN_EVENT } },
    fallback: 'error',
  })
  await settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: '自訂' }))
  pickOption(fieldByLabel('服務'), '套用')
  pickOption(belongSelectOf('服務'), '自訂')
  expect(belongPickerOf('服務')).toHaveAttribute('data-options', '[]')
  // 歸屬清單是空的（查詢失敗或店家沒有歸屬）時，歸屬欄位仍要能手動輸入：BelongAutocomplete 的 isloading 會把欄位停用，
  // 所以 RuleForm 不傳 isloading（原本寫成 attributions.langth === 0，恆為 false；若「修正」成 length 會把欄位永久鎖住，Jason 2026/10/31）
  expect(belongPickerOf('服務')).toHaveAttribute('data-loading', 'false')
})

it('規則名稱空白時提示「請輸入規則名稱。」', async () => {
  const { settle } = renderPage(<EventRuleCreate match={{ params: { id: 'e1' } }} />, {
    fixtures: { GET_MERCHANT_EVENT_FOR_RULES: { mainEvent: MAIN_EVENT }, USE_FETCH_GET_ATTRIBUTIONS: { getAttribution: [] } },
  })
  await settle()
  fireEvent.click(screen.getByText('新增').closest('button'))
  await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入規則名稱。', variant: 'error' }))
})
