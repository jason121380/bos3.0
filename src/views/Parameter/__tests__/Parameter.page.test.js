// 保護：系統參數設定頁的「讀取 → 存檔」整體流程。
// - 讀進來的設定不經修改就存檔時，31 支 mutation 送回的內容與後端給的相同（只去掉查詢多帶的 id／type 等欄位、
//   排序依 sorting、必填欄位轉回代碼、不指定預約通知人只送仍綁定 LINE 的人員）；
// - 查詢回來前輸入與「儲存」都停用（避免把預設值存回去蓋掉店家設定）、存檔中不能重複送出；
// - 任一 mutation 失敗時提示錯誤並恢復按鈕；
// - 查詢失敗時不整頁錯誤、也不能存檔（否則會把空白預設值寫回後端）；
// - 存檔成功後設定類查詢（settings-cache）被清除重抓；操作密碼查詢不在設定快取內。
// GraphQL 全由模擬 link 回應，不連後端、不建立真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { registeredSettingsFields } from 'lib/settings-cache'
import Parameter from '..'
import { baseFixtures, renderParameter, renderWithSettingsCache, openTab, save, sent, SAVE_MUTATIONS, controlByLabel } from './parameterKit.test'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginAs())
afterEach(cleanup)

const saveButton = () => screen.getByTestId('parameter')

describe('讀取後存檔：原樣送回店家目前的設定', () => {
  it('31 支 mutation 各送一次，內容與後端給的設定相同', async () => {
    const utils = await renderParameter()
    expect(saveButton()).not.toBeDisabled()
    await save(utils)
    SAVE_MUTATIONS.forEach(name => expect(callsOf(utils.calls, name)).toHaveLength(1))
    const f = baseFixtures()
    const { calls } = utils
    expect(sent(calls, 'SEIING_DEDUCTION_ITEMS')).toEqual({ input: [{ name: '扣項甲' }] })
    // 加扣項依 sorting 排序、只送 itemSetting／sorting
    expect(sent(calls, 'SET_MERCHANT_SALARY_INCREASE_ITEM')).toEqual({
      input: [
        { itemSetting: '獎金', sorting: 1 },
        { itemSetting: '全勤', sorting: 2 },
      ],
    })
    expect(sent(calls, 'SET_MERCHANT_SALARY_DECREASE_ITEM')).toEqual({ input: [{ itemSetting: '勞保', sorting: 1 }] })
    expect(sent(calls, 'SET_MERCHANT_PASSWORD')).toEqual({ input: f.GET_MERCHANT_PASSWORD.merchantPassword })
    expect(sent(calls, 'SET_MERCHANT_FAKE_PERFORMANCE_REFER')).toEqual({ input: 'CASH' })
    expect(sent(calls, 'SET_MERCHANT_BANKS_SETTINGS')).toEqual({ input: f.GET_MERCHANT_BANK_SETTINGS.getMerchantBankSettings })
    expect(sent(calls, 'SET_LOCK_DATE')).toEqual({ input: true })
    expect(sent(calls, 'SET_MERCHANT_CLOCK_IN_SETTING')).toEqual({ input: f.GET_MERCHANT_CLOCK_IN_SETTING.getMerchantClockInSetting })
    expect(sent(calls, 'SET_IS_DISPLAY_NON_BANK_ACCOUNT_IN_BANK_TRANSFER_REPORT')).toEqual({ input: false })
    expect(sent(calls, 'SET_MERCHANT_BOOKING_NOTIFICATION_SETTING')).toEqual({
      input: f.GET_MERCHANT_BOOKINNG_NOTIFICATION_SETTING.getMerchantBookingNotificationSetting,
    })
    expect(sent(calls, 'SetBookingLineNotifySettings')).toEqual({ input: f.GetBookingLineNotifySettings.getBookingLineNotifySettings })
    expect(sent(calls, 'SET_PARAMETER_REPORT_SETTING')).toEqual({ input: f.GET_PARAMETER_REPORT_SETTING.getParameterReportSetting })
    expect(sent(calls, 'SET_PARAMETER_CHECKOUT_AND_SALARY_ITEM_SETTING')).toEqual({
      input: f.GET_PARAMETER_CHECKOUT_AND_SALARY_ITEM_SETTING.getParameterCheckoutAndSalaryItemsSetting,
    })
    expect(sent(calls, 'SET_MERCHANT_REVERVATION_TIME')).toEqual({ input: f.GET_MERCHANT_REVERVATION_TIME.getMerchantReservationTime })
    expect(sent(calls, 'SET_MERCHANT_HAIR_CONDITION')).toEqual({ input: f.GET_MERCHANT_HAIR_CONDITION.getMerchantHairCondition })
    // 不指定預約通知人：只留仍綁定 LINE 的人員（u-9 已解除綁定）
    expect(sent(calls, 'SET_NONDESIGNATE_BOOKING_RECIOIENTS')).toEqual({ userIds: ['u-2'] })
    // 帳單明細設定：Logo 只送是否顯示（圖檔另外上傳）、QRcode 只送是否顯示與網址
    const orderCreate = f.GET_PARAMETER_ORDER_CREATE_SETTING.getParameterOrderCreateSetting
    expect(sent(calls, 'SET_PARAMETER_ORDER_CREATE_SETTING')).toEqual({
      input: { ...orderCreate, logoDisplayOnInvoice: true, qrcodeDisplayOnInvoice: { isDisplay: false, url: null } },
    })
    expect(sent(calls, 'SET_PARAMETER_ABOUT_SETTING_FUNCTION')).toEqual({
      input: f.GET_PARAMETER_ABOUT_SETTING_FUNCTION.getParameterAboutSettingFunction,
    })
    expect(sent(calls, 'SET_CUSTOMER_REFERENCE')).toEqual({ references: ['朋友介紹', '路過'] })
    expect(sent(calls, 'SET_MERCHANT_RAKE_REFERENCE')).toEqual({ input: { designate: 'FAKE', nonDesignate: 'TRUTH' } })
    // 簡訊寄送號碼沒有資料時補一格空白（畫面上才有輸入框）
    expect(sent(calls, 'SET_PARAMETER_ABOUT_BOOKING_SETTING')).toEqual({
      input: { ...f.GET_PARAMETER_ABOUT_BOOKING_SETTING.getParameterAboutBookingSetting, bookingNotificationPhone: [''] },
    })
    expect(sent(calls, 'SET_SPECIFIC_BOOKING_NOTIFICATION_DAY_COUNT')).toEqual({ input: 3 })
    expect(sent(calls, 'SET_DISABLE_BOOKING_DAY_LIMIT')).toEqual({ count: 7 })
    expect(sent(calls, 'SET_MERCHANT_CHECKIN_SETTING')).toEqual({ input: f.GET_MERCHANT_CHECKIN_SETTING.getMerchantCheckinSettings })
    // 新客必填欄位：畫面上是選項物件，送出轉回代碼
    expect(sent(calls, 'SET_PARAMETER_ABOUT_CUSTOMER_SETTING')).toEqual({
      input: f.GET_PARAMETER_ABOUT_CUSTOMER_SETTING.getParameterAboutCustomerSetting,
    })
    expect(sent(calls, 'SET_IS_BOOKING_CUS_CHECK_USING')).toEqual({ input: false })
    expect(sent(calls, 'SET_IS_BOOKING_TYPE_FOR_SOCKET')).toEqual({ input: ['RESERVATION'] })
    expect(sent(calls, 'SET_UES_USEING_SETTING')).toEqual({ input: false })
    expect(sent(calls, 'SET_IS_CBRD_STYLIST')).toEqual({ input: true })
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '儲存成功!', variant: 'success' })
    expect(saveButton()).not.toBeDisabled()
  })

  it('後端沒有加扣項／扣項時各補一列空白；存檔不送空白的加扣項', async () => {
    const utils = await renderParameter({
      fixtures: {
        MERCHANT_DEDUCTION_ITEMS: { merchantDeductionItems: [] },
        GET_MERCHANT_SALARY_INCREASE_ITEMS: { getMerchantSalaryIncreaseItems: [] },
        GET_MERCHANT_SALARY_DECREASE_ITEMS: { getMerchantSalaryDecreaseItems: [] },
        GET_PARAMETER_ABOUT_BOOKING_SETTING: {
          getParameterAboutBookingSetting: {
            ...baseFixtures().GET_PARAMETER_ABOUT_BOOKING_SETTING.getParameterAboutBookingSetting,
            bookingNotificationPhone: ['0912345678'],
          },
        },
      },
    })
    await openTab('薪資')
    expect(screen.getByLabelText('薪資加項科目設定')).toHaveValue('')
    expect(screen.getByLabelText('薪資扣項科目設定')).toHaveValue('')
    await save(utils)
    expect(sent(utils.calls, 'SEIING_DEDUCTION_ITEMS')).toEqual({ input: [{ name: '' }] })
    expect(sent(utils.calls, 'SET_MERCHANT_SALARY_INCREASE_ITEM')).toEqual({ input: [] })
    expect(sent(utils.calls, 'SET_MERCHANT_SALARY_DECREASE_ITEM')).toEqual({ input: [] })
    expect(sent(utils.calls, 'SET_PARAMETER_ABOUT_BOOKING_SETTING').input.bookingNotificationPhone).toEqual(['0912345678'])
  })
})

describe('讀取中與存檔中', () => {
  it('任一設定還沒回來時輸入與「儲存」停用，全部回來才可操作', async () => {
    // 密碼設定晚回：其他設定都到了、密碼還沒到的期間仍不可操作
    const utils = renderPage(<Parameter />, { fixtures: baseFixtures(), delays: { GET_MERCHANT_PASSWORD: 1500 } })
    await wait(() => expect(screen.getByRole('checkbox', { name: '指定互助人功能' })).toBeChecked())
    expect(saveButton()).toBeDisabled()
    expect(controlByLabel('帳單明細列印格式')).toBeDisabled()
    await utils.settle()
    await wait(() => expect(saveButton()).not.toBeDisabled(), { timeout: 12000 })
    expect(controlByLabel('帳單明細列印格式')).not.toBeDisabled()
  })

  it('存檔送出到回應前「儲存」停用（不能重複送出）', async () => {
    const utils = await renderParameter({ delays: { SET_MERCHANT_PASSWORD: 600 } })
    fireEvent.click(saveButton())
    await wait(() => expect(saveButton()).toBeDisabled())
    await wait(() => expect(saveButton()).not.toBeDisabled(), { timeout: 12000 })
    expect(callsOf(utils.calls, 'SET_MERCHANT_PASSWORD')).toHaveLength(1)
  })

  it('任一 mutation 失敗：顯示錯誤訊息並恢復「儲存」', async () => {
    const utils = await renderParameter({ fixtures: { SET_MERCHANT_PASSWORD: new Error('密碼格式錯誤') } })
    await save(utils)
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '密碼格式錯誤', variant: 'error' }))
    expect(saveButton()).not.toBeDisabled()
  })
})

describe('查詢失敗', () => {
  const TABS = ['打帳單', '排班及打卡', '薪資', '報表', '預約', '業績依據及抽成', '密碼', '功能設定', '顧客追蹤', '顧客端', '設計師端']

  it('所有設定查詢都失敗：各分頁不整頁錯誤，且不能存檔（避免把空白預設值寫回後端）', async () => {
    await renderParameter({ fixtures: Object.fromEntries(Object.keys(baseFixtures()).map(k => [k, new Error(`模擬 API 失敗：${k}`)])) })
    for (const tab of TABS) {
      await openTab(tab)
      expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    }
    expect(saveButton()).toBeDisabled()
  })

  it('只有一支查詢失敗（LINE 綁定人員）：其他分頁照常顯示，但不能存檔', async () => {
    await renderParameter({ fixtures: { GET_LINE_CONNECTED_USER: new Error('LINE 服務異常') } })
    await openTab('預約')
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('預約通知LINE@設定')).toBeInTheDocument()
    expect(saveButton()).toBeDisabled()
  })
})

describe('設定快取（settings-cache）', () => {
  it('存檔成功後設定類查詢清除重抓；操作密碼查詢不在設定快取內', async () => {
    const utils = renderWithSettingsCache(<Parameter />, { fixtures: baseFixtures() })
    await utils.settle()
    expect(registeredSettingsFields()).not.toContain('merchantPassword')
    expect(registeredSettingsFields()).toContain('getParameterReportSetting')
    expect(callsOf(utils.calls, 'GET_PARAMETER_REPORT_SETTING')).toHaveLength(1)
    await save(utils)
    await wait(() => expect(callsOf(utils.calls, 'GET_PARAMETER_REPORT_SETTING')).toHaveLength(2))
    await utils.settle()
    // 操作密碼（cache-and-network）不因清除設定快取而重抓
    expect(callsOf(utils.calls, 'GET_MERCHANT_PASSWORD')).toHaveLength(1)
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '儲存成功!', variant: 'success' })
  })
})
