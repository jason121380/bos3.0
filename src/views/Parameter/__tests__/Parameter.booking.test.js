// 保護：系統參數「預約」分頁——同時段人數上限、預約設定（次數／天數限制與「不限制」、營業時段、疑難排解）、
// 預約通知簡訊（開關、簡訊帳號、寄送號碼格式檢查）、LINE@ 通知（對象多選、提前天數、評分邀請、不指定預約通知人）、
// 報到通知、開放預約時段（時段、星期不可重複、上限 7 組、名稱不得為空）。
// 重點是輸入的數字範圍（負數取絕對值、空白當 0、天數最少 1）、「不限制」送 null、通知開關送布林值、存檔送出的結構。
// GraphQL 由模擬 link 回應，不連後端、不建立真實資料。
// structuredClone：與正式環境相同由 lib/polyfills 補上（src/index.js 最早載入；jsdom 沒有）
import 'lib/polyfills'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { loginAs } from '../../../__tests__/testkit.test'
import {
  baseFixtures,
  renderParameter,
  openTab,
  save,
  sent,
  checkboxByLabel,
  controlByLabel,
  controlsByLabel,
  selectValue,
  selectedText,
  typeText,
  cardOf,
} from './parameterKit.test'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginAs())
afterEach(cleanup)

async function setup(fixtures) {
  const utils = await renderParameter({ fixtures })
  await openTab('預約')
  return utils
}
const bookingInput = utils => sent(utils.calls, 'SET_PARAMETER_ABOUT_BOOKING_SETTING').input
const baseBooking = () => baseFixtures().GET_PARAMETER_ABOUT_BOOKING_SETTING.getParameterAboutBookingSetting

describe('同時段預約人數上限', () => {
  it('負數取絕對值、空白當 0、小數取整數；浮動式上限開啟時不指定人數停用', async () => {
    const utils = await setup()
    const card = cardOf('同時段預約人數上限')
    const nonDes = controlByLabel('不指定人數', card)
    const des = controlByLabel('指定人數', card)
    fireEvent.focusIn(nonDes)
    // 這兩欄在 setState updater 內才讀 event.target.value，以 typeText 模擬瀏覽器輸入
    await typeText(nonDes, '-4')
    expect(nonDes).toHaveValue(4)
    await typeText(des, '')
    expect(des).toHaveValue(0)
    await typeText(des, '2.7')
    fireEvent.wheel(des.parentElement)
    fireEvent.wheel(nonDes.parentElement)
    fireEvent.focusIn(des)
    fireEvent.click(checkboxByLabel('浮動式預約人數上限'))
    expect(controlByLabel('不指定人數', card)).toBeDisabled()
    await save(utils)
    expect(bookingInput(utils)).toMatchObject({ nonDesignationOrderLimit: 4, designationOrderLimit: 2, isDynamicBookingLimitUsing: true })
  })
})

describe('預約設定', () => {
  it('開關、待確認狀態、疑難排解文字', async () => {
    const utils = await setup()
    fireEvent.click(checkboxByLabel('指定預約無需審核'))
    fireEvent.click(checkboxByLabel('開放客人當日預約'))
    fireEvent.click(checkboxByLabel('上限納入審核中預約'))
    fireEvent.click(checkboxByLabel('啟用「未來預訂(待確認)」的預約狀態'))
    await typeText(controlByLabel('設定顧客端疑難排解顯示的文字'), '請洽櫃檯')
    await save(utils)
    expect(bookingInput(utils)).toMatchObject({
      isBookingAutoAccept: true,
      isCustomerBookedableInSameDay: false,
      isNDBInLimitCount: true,
      troubleShooting: '請洽櫃檯',
    })
    expect(sent(utils.calls, 'SET_IS_BOOKING_CUS_CHECK_USING')).toEqual({ input: true })
  })

  it('次數與天數：「不限制」送 null、取消後從 0 開始；輸入負數取絕對值、空白當 0', async () => {
    const utils = await setup()
    const card = cardOf('預約設定')
    // 同一支電話當日次數：原本不限制 → 取消不限制 → 輸入
    const [phoneCount, cusMax] = controlsByLabel('次數', card)
    expect(phoneCount).toBeDisabled()
    expect(phoneCount).toHaveValue(null)
    fireEvent.click(checkboxByLabel('不限制次數', card, 0))
    expect(controlsByLabel('次數', card)[0]).toHaveValue(0)
    fireEvent.change(controlsByLabel('次數', card)[0], { target: { value: '-2' } })
    fireEvent.focusIn(controlsByLabel('次數', card)[0])
    fireEvent.wheel(controlsByLabel('次數', card)[0].parentElement)
    // 單一顧客上限：原本 5 → 改不限制
    expect(cusMax).toHaveValue(5)
    fireEvent.change(cusMax, { target: { value: '' } })
    fireEvent.focusIn(cusMax)
    fireEvent.wheel(cusMax.parentElement)
    fireEvent.click(checkboxByLabel('不限制次數', card, 1))
    expect(controlsByLabel('次數', card)[1]).toBeDisabled()
    fireEvent.click(checkboxByLabel('不限制次數', card, 1))
    fireEvent.change(controlsByLabel('次數', card)[1], { target: { value: '8' } })
    // 指定預約僅開放未來 N 天到 M 天
    const [fromDay, toDay] = controlsByLabel('天數', card)
    fireEvent.change(fromDay, { target: { value: '-3' } })
    fireEvent.focusIn(fromDay)
    fireEvent.wheel(fromDay.parentElement)
    fireEvent.change(toDay, { target: { value: '' } })
    fireEvent.focusIn(toDay)
    fireEvent.wheel(toDay.parentElement)
    fireEvent.click(checkboxByLabel('不限制', card, 1))
    fireEvent.click(checkboxByLabel('不限制', card, 0))
    fireEvent.click(checkboxByLabel('不限制', card, 0))
    // 取消預約期限
    const action = controlByLabel('提出申請幾天內', card)
    expect(action).toBeDisabled()
    fireEvent.click(checkboxByLabel('不限制天數', card, 0))
    fireEvent.change(controlByLabel('提出申請幾天內', card), { target: { value: '-6' } })
    fireEvent.focusIn(controlByLabel('提出申請幾天內', card))
    fireEvent.wheel(controlByLabel('提出申請幾天內', card).parentElement)
    const service = controlByLabel('預約日期幾天前', card)
    fireEvent.change(service, { target: { value: '' } })
    fireEvent.focusIn(service)
    fireEvent.wheel(service.parentElement)
    fireEvent.click(checkboxByLabel('不限制天數', card, 1))
    await save(utils)
    expect(bookingInput(utils)).toMatchObject({
      bookingLimitPerCellphoneInSameDay: 2,
      cusMaxBookingCount: 8,
      disableBookingDayLimit: 0,
      createBookingDayLimit: null,
      cancelBookingDayLimitByActionDate: 6,
      cancelBookingDayLimitByServiceDate: null,
    })
  })

  it('次數與天數的另一組輸入：空白當 0、「不限制」來回切換', async () => {
    const utils = await setup({
      GET_PARAMETER_ABOUT_BOOKING_SETTING: {
        getParameterAboutBookingSetting: {
          ...baseBooking(),
          bookingLimitPerCellphoneInSameDay: 3,
          createBookingDayLimit: null,
          cancelBookingDayLimitByActionDate: 4,
          cancelBookingDayLimitByServiceDate: null,
        },
      },
    })
    const card = cardOf('預約設定')
    fireEvent.change(controlsByLabel('次數', card)[0], { target: { value: '' } })
    fireEvent.click(checkboxByLabel('不限制次數', card, 0))
    expect(controlsByLabel('次數', card)[0]).toBeDisabled()
    fireEvent.change(controlsByLabel('天數', card)[0], { target: { value: '' } })
    fireEvent.click(checkboxByLabel('不限制', card, 1))
    fireEvent.change(controlsByLabel('天數', card)[1], { target: { value: '45' } })
    fireEvent.change(controlByLabel('提出申請幾天內', card), { target: { value: '' } })
    fireEvent.click(checkboxByLabel('不限制天數', card, 1))
    fireEvent.change(controlByLabel('預約日期幾天前', card), { target: { value: '-3' } })
    fireEvent.click(checkboxByLabel('不限制天數', card, 0))
    await save(utils)
    expect(bookingInput(utils)).toMatchObject({
      bookingLimitPerCellphoneInSameDay: null,
      disableBookingDayLimit: 0,
      createBookingDayLimit: 45,
      cancelBookingDayLimitByActionDate: null,
      cancelBookingDayLimitByServiceDate: 3,
    })
  })

  it('店家可預約的時間範圍：時與分分別選擇', async () => {
    const utils = await setup()
    const card = cardOf('預約設定')
    const [openHour, closeHour] = controlsByLabel('開始', card).concat(controlsByLabel('結束', card))
    expect(selectedText(openHour)).toBe('10')
    await selectValue(openHour, '09')
    await selectValue(within(card).getByLabelText('開始（分）'), '30')
    await selectValue(closeHour, '21')
    await selectValue(within(card).getByLabelText('結束（分）'), '00')
    await save(utils)
    expect(bookingInput(utils).bookingTimeSetting).toEqual({ openingHours: '09:30:00', closingHours: '21:00:00' })
  })
})

describe('預約通知簡訊設定', () => {
  it('通知開關送布林值；簡訊帳號密碼；寄送號碼新增、刪除與格式檢查', async () => {
    const utils = await setup()
    const card = cardOf('預約通知簡訊設定')
    const selects = card.querySelectorAll('select')
    expect(selects).toHaveLength(15)
    expect(selectedText(selects[0])).toBe('開啟通知')
    await selectValue(selects[0], '關閉通知')
    await selectValue(selects[4], '開啟通知')
    // 簡訊帳號：密碼空值顯示空字串
    expect(controlByLabel('API密碼', card)).toHaveValue('')
    await typeText(controlByLabel('API帳號', card), 'new-acc')
    await typeText(controlByLabel('API密碼', card), 'secret')
    // 表單送出（按 Enter）不會離開頁面
    const form = card.querySelector('form')
    const submitted = fireEvent.submit(form)
    expect(submitted).toBe(false)
    // 寄送號碼：空白不顯示錯誤、格式錯誤顯示提示
    const phones = () => controlsByLabel('手機號碼', card)
    expect(within(card).queryByText('手機格式有誤')).toBeNull()
    await typeText(phones()[0], '12345')
    expect(within(card).getByText('手機格式有誤')).toBeInTheDocument()
    await typeText(phones()[0], '0912345678')
    expect(within(card).queryByText('手機格式有誤')).toBeNull()
    // 第一列沒有刪除鈕；新增兩列後刪掉第二列
    expect(card.querySelectorAll('svg[class*="lucide-trash"]')).toHaveLength(0)
    fireEvent.click(card.querySelector('svg.lucide-plus'))
    await typeText(phones()[1], '0911111111')
    fireEvent.click(card.querySelector('svg.lucide-plus'))
    await typeText(phones()[2], '0922222222')
    fireEvent.click(card.querySelectorAll('svg[class*="lucide-trash"]')[0])
    await save(utils)
    expect(sent(utils.calls, 'SET_MERCHANT_BOOKING_NOTIFICATION_SETTING').input).toMatchObject({
      customerCreateBooking: { customer: false, designer: false, merchant: true },
      customerCancelBooking: { customer: false, designer: true, merchant: false },
    })
    expect(bookingInput(utils)).toMatchObject({
      SMSAccount: { account: 'new-acc', password: 'secret' },
      bookingNotificationPhone: ['0912345678', '0922222222'],
    })
  })

  it('簡訊帳號為空值時顯示空字串', async () => {
    await setup({
      GET_PARAMETER_ABOUT_BOOKING_SETTING: { getParameterAboutBookingSetting: { ...baseBooking(), SMSAccount: { account: null, password: 'p' } } },
    })
    expect(controlByLabel('API帳號', cardOf('預約通知簡訊設定'))).toHaveValue('')
    expect(controlByLabel('API密碼', cardOf('預約通知簡訊設定'))).toHaveValue('p')
  })
})

describe('預約通知LINE@設定', () => {
  it('通知對象多選、提前通知天數、啟用預約通知與評分邀請、不指定預約通知人', async () => {
    const utils = await setup()
    const card = cardOf('預約通知LINE@設定')
    const combos = within(card).getAllByRole('combobox')
    expect(combos).toHaveLength(16)
    // 顧客新增預約／顧客：加選「已指定設計師」
    fireEvent.click(combos[0])
    fireEvent.click(screen.getByRole('option', { name: '已指定設計師' }))
    // 顧客新增預約／店家：移除「未指定設計師」
    fireEvent.mouseDown(within(card).getAllByRole('button', { name: '移除 未指定設計師' })[1])
    // 提前通知天數：小於 1 視為不設定（空白）
    const dayCount = controlByLabel('天數', card)
    expect(dayCount).toHaveValue(3)
    fireEvent.change(dayCount, { target: { value: '0' } })
    expect(dayCount).toHaveValue(null)
    fireEvent.change(dayCount, { target: { value: '5' } })
    fireEvent.focusIn(dayCount)
    fireEvent.wheel(dayCount.parentElement)
    // 啟用預約通知：幾天前通知最少 1
    expect(within(card).queryByText('幾天前通知')).toBeNull()
    fireEvent.click(checkboxByLabel('啟用預約通知', card))
    const before = controlByLabel('幾天前通知', card)
    fireEvent.change(before, { target: { value: '0' } })
    expect(before).toHaveValue(1)
    fireEvent.change(before, { target: { value: '4' } })
    fireEvent.wheel(before.parentElement)
    // 評分邀請：開啟後從 0 天開始、負數視為 0
    fireEvent.click(checkboxByLabel('開啟評分邀請', card))
    const invite = controlByLabel('幾天後發送邀請', card)
    expect(invite).toHaveValue(0)
    fireEvent.change(invite, { target: { value: '-2' } })
    expect(invite).toHaveValue(0)
    fireEvent.change(invite, { target: { value: '3' } })
    fireEvent.wheel(invite.parentElement)
    const limit = controlByLabel('評論有效天數', card)
    fireEvent.change(limit, { target: { value: '-1' } })
    expect(limit).toHaveValue(0)
    fireEvent.change(limit, { target: { value: '14' } })
    fireEvent.wheel(limit.parentElement)
    // 不指定預約通知人：原本只有設計師乙，加選設計師丙
    fireEvent.click(combos[15])
    fireEvent.click(screen.getByRole('option', { name: '設計師丙' }))
    await save(utils)
    expect(sent(utils.calls, 'SetBookingLineNotifySettings').input.cusCreateBooking).toEqual({
      customer: ['NODESIGNER', 'HASDESIGNER'],
      designer: [],
      merchant: ['HASDESIGNER'],
    })
    expect(sent(utils.calls, 'SET_SPECIFIC_BOOKING_NOTIFICATION_DAY_COUNT')).toEqual({ input: 5 })
    expect(bookingInput(utils)).toMatchObject({
      bookingNotificationLine: { isUsing: true, notifyDayCount: 4 },
      inviteRatingDayCount: 3,
      cusRatingDayLimit: 14,
    })
    expect(sent(utils.calls, 'SET_NONDESIGNATE_BOOKING_RECIOIENTS')).toEqual({ userIds: ['u-2', 'u-3'] })
  })

  it('關閉評分邀請送 null；提前通知天數清空送 null', async () => {
    const utils = await setup({
      GET_PARAMETER_ABOUT_BOOKING_SETTING: { getParameterAboutBookingSetting: { ...baseBooking(), inviteRatingDayCount: 2, cusRatingDayLimit: 10 } },
    })
    const card = cardOf('預約通知LINE@設定')
    fireEvent.click(checkboxByLabel('開啟評分邀請', card))
    expect(within(card).queryByText('幾天後發送邀請')).toBeNull()
    fireEvent.change(controlByLabel('天數', card), { target: { value: '' } })
    await save(utils)
    expect(bookingInput(utils).inviteRatingDayCount).toBeNull()
    expect(sent(utils.calls, 'SET_SPECIFIC_BOOKING_NOTIFICATION_DAY_COUNT')).toEqual({ input: null })
  })
})

describe('LINE 綁定人員讀取中', () => {
  it('不指定預約通知人的選項為空、輸入停用，回來後可選', async () => {
    const { renderPage } = require('../../../__tests__/testkit.test')
    const Parameter = require('..').default
    const utils = renderPage(<Parameter />, { fixtures: baseFixtures(), delays: { GET_LINE_CONNECTED_USER: 1500 } })
    await wait(() => expect(screen.getByRole('checkbox', { name: '指定互助人功能' })).toBeChecked())
    await openTab('預約')
    const card = cardOf('預約通知LINE@設定')
    const recipients = () => within(card).getAllByRole('combobox')[15]
    expect(recipients()).toBeDisabled()
    await utils.settle()
    await wait(() => expect(recipients()).not.toBeDisabled())
    fireEvent.click(recipients())
    expect(
      screen
        .getAllByRole('option')
        .filter(o => o.tagName === 'LI')
        .map(o => o.textContent)
    ).toEqual(['設計師甲', '設計師乙', '設計師丙'])
  })
})

describe('報到通知設定', () => {
  it('開啟報到通知後才顯示細項；待審核狀態的預約切換推播類型', async () => {
    const utils = await setup()
    const card = cardOf('報到通知設定')
    expect(card.querySelectorAll('input[type="checkbox"]')).toHaveLength(2)
    fireEvent.click(checkboxByLabel('開啟報到通知功能', card))
    expect(card.querySelectorAll('input[type="checkbox"]')).toHaveLength(5)
    fireEvent.click(checkboxByLabel('未完成預約自動提醒，提醒下一順位預約顧客本預約未完成、完成後會再另行通知', card))
    const uncheck = checkboxByLabel('單日預約紀錄顯示待審核狀態的預約', card)
    fireEvent.click(uncheck)
    expect(uncheck).toBeChecked()
    await save(utils)
    expect(sent(utils.calls, 'SET_MERCHANT_CHECKIN_SETTING').input).toEqual({
      isBookingCheckinEnabled: true,
      isDoneBookingAutoNotify: false,
      isUnDoneBookingAutoNotify: true,
      isUnDoneBookingManualNotify: false,
    })
    expect(sent(utils.calls, 'SET_IS_BOOKING_TYPE_FOR_SOCKET')).toEqual({ input: ['UNCHECK', 'RESERVATION'] })
    fireEvent.click(checkboxByLabel('單日預約紀錄顯示待審核狀態的預約', card))
    await save(utils)
    expect(sent(utils.calls, 'SET_IS_BOOKING_TYPE_FOR_SOCKET')).toEqual({ input: ['RESERVATION'] })
  })
})

describe('開放預約時段設定', () => {
  it('名稱、時段、星期（其他時段已用的星期停用）、新增與刪除', async () => {
    const utils = await setup()
    const card = cardOf('開放預約時段設定')
    const title = within(card).getAllByPlaceholderText('請輸入名稱')[0]
    await typeText(title, '平日班')
    await selectValue(controlByLabel('開始', card), '11')
    await selectValue(within(card).getByLabelText('開始（分）'), '30')
    await selectValue(controlByLabel('結束', card), '19')
    await selectValue(within(card).getByLabelText('結束（分）'), '00')
    // 星期：取消「二」、加選「三」
    fireEvent.click(within(card).getByRole('button', { name: '二' }))
    fireEvent.click(within(card).getByRole('button', { name: '三' }))
    // 新增第二個時段：第一個時段已用的星期停用
    fireEvent.click(within(card).getByRole('button', { name: '新增時段' }))
    const days = () => within(card).getAllByRole('button', { name: '一' })
    expect(days()[1]).toBeDisabled()
    expect(within(card).getAllByRole('button', { name: '二' })[1]).not.toBeDisabled()
    await typeText(within(card).getAllByPlaceholderText('請輸入名稱')[1], '週末')
    fireEvent.click(within(card).getAllByRole('button', { name: '六' })[1])
    await save(utils)
    expect(sent(utils.calls, 'SET_MERCHANT_REVERVATION_TIME')).toEqual({
      input: [
        { title: '平日班', useDay: ['MON', 'WED'], openingHours: '11:30:00', closingHours: '19:00:00' },
        { title: '週末', useDay: ['SAT'], openingHours: '10:00:00', closingHours: '20:00:00' },
      ],
    })
    // 刪除第一個時段
    fireEvent.click(within(card).getAllByRole('button', { name: '刪除時段' })[0])
    await save(utils)
    expect(sent(utils.calls, 'SET_MERCHANT_REVERVATION_TIME').input.map(d => d.title)).toEqual(['週末'])
  })

  it('名稱清空離開欄位時提示不得為空；有名稱時不提示', async () => {
    await setup()
    const title = within(cardOf('開放預約時段設定')).getByPlaceholderText('請輸入名稱')
    fireEvent.focusOut(title)
    await typeText(title, '')
    fireEvent.focusOut(title)
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '開放預約時段的名稱不得為空', variant: 'error' }))
    expect(openSnackbar).toHaveBeenCalledTimes(1)
  })

  it('最多 7 個時段：第 7 個時段後新增鈕停用', async () => {
    await setup()
    const card = cardOf('開放預約時段設定')
    for (let i = 0; i < 6; i += 1) {
      const adds = within(card).getAllByRole('button', { name: '新增時段' })
      fireEvent.click(adds[adds.length - 1])
    }
    expect(within(card).getAllByRole('button', { name: '刪除時段' })).toHaveLength(7)
    expect(within(card).getByRole('button', { name: '新增時段' })).toBeDisabled()
  })

  it('沒有時段時顯示「無資料」，可新增第一個時段', async () => {
    const utils = await setup({ GET_MERCHANT_REVERVATION_TIME: { getMerchantReservationTime: [] } })
    const card = cardOf('開放預約時段設定')
    expect(card).toHaveTextContent('無資料')
    fireEvent.click(within(card).getByRole('button', { name: '新增時段' }))
    await save(utils)
    expect(sent(utils.calls, 'SET_MERCHANT_REVERVATION_TIME')).toEqual({
      input: [{ title: '', openingHours: '10:00:00', closingHours: '20:00:00', useDay: [] }],
    })
  })
})
