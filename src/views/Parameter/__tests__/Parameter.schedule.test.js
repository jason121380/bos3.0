// 保護：系統參數「排班及打卡」分頁——班別設定（名稱、顏色、上下班與休息時間、各項啟用、遲到／加班分鐘、新增刪除）與考勤排班總表設定。
// - 修改要原樣進入 SET_MERCHANT_CLOCK_IN_SETTING（時與分拆成數字欄位）；
// - 新增的班別帶完整預設欄位（含加班相關欄位，避免送出缺欄位的班別）；
// - 時間欄位被清空（瀏覽器的時間欄位刪掉一段時會回傳空字串）時保留原時間，不送出 NaN；
// - 讀取中不能新增／刪除班別。
// GraphQL 由模擬 link 回應，不連後端、不建立真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { loginAs, renderPage } from '../../../__tests__/testkit.test'
import Parameter from '..'
import { baseFixtures, renderParameter, openTab, save, sent, checkboxByLabel, controlByLabel, controlsByLabel, typeText, cardOf } from './parameterKit.test'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginAs())
afterEach(cleanup)

const scheduleCard = () => cardOf('班別設定')
const clockIn = utils => sent(utils.calls, 'SET_MERCHANT_CLOCK_IN_SETTING').input

async function setup(fixtures) {
  const utils = await renderParameter({ fixtures })
  await openTab('排班及打卡')
  return utils
}

describe('班別設定', () => {
  it('名稱、時間、各項啟用與分鐘數的修改原樣送出', async () => {
    const utils = await setup()
    const card = scheduleCard()
    await typeText(controlByLabel('人員班別', card), '晚班')
    const [inTime, outTime, breakStart, breakEnd] = controlsByLabel('選擇時間', card)
    expect(inTime).toHaveValue('09:05')
    expect(breakEnd).toBeDisabled()
    fireEvent.change(inTime, { target: { value: '13:30' } })
    fireEvent.change(outTime, { target: { value: '22:00' } })
    fireEvent.change(breakStart, { target: { value: '17:15' } })
    // 「休息結束」原本未啟用：先啟用再改時間
    const enables = [...card.querySelectorAll('label')].filter(l => l.textContent === '啟用').map(l => l.querySelector('input'))
    fireEvent.click(enables[3])
    fireEvent.change(controlsByLabel('選擇時間', card)[3], { target: { value: '18:45' } })
    fireEvent.click(enables[0])
    fireEvent.click(enables[1])
    fireEvent.click(enables[2])
    fireEvent.click(enables[4])
    fireEvent.click(enables[5])
    const [delay, buffer] = controlsByLabel('分鐘', card)
    fireEvent.change(delay, { target: { value: '20' } })
    fireEvent.change(buffer, { target: { value: '30' } })
    fireEvent.wheel(buffer.parentElement)
    await save(utils)
    expect(clockIn(utils)).toEqual([
      {
        name: '晚班',
        clockInHour: 13,
        clockInMinute: 30,
        isClockInUsing: false,
        clockOutHour: 22,
        clockOutMinute: 0,
        isClockOutUsing: false,
        breakTimeSetting: [{ startHour: 17, startMinute: 15, isStartTimeUsing: false, endHour: 18, endMinute: 45, isEndTimeHourUsing: true }],
        allowedDelayMinutes: 20,
        color: '#f44336',
        isWorkOverMinutesCalculated: true,
        isClockOutBufferMinutesUsing: false,
        clockOutBufferMinutes: 30,
      },
    ])
  })

  it('時間欄位被清空時保留原時間（不送出 NaN）', async () => {
    const utils = await setup()
    const [inTime] = controlsByLabel('選擇時間', scheduleCard())
    fireEvent.change(inTime, { target: { value: '' } })
    await save(utils)
    expect(clockIn(utils)[0]).toMatchObject({ clockInHour: 9, clockInMinute: 5 })
  })

  it('選取顏色：開啟取色器選色後套用到該班別，點背景關閉', async () => {
    const utils = await setup()
    fireEvent.click(screen.getByRole('button', { name: '選取顏色' }))
    const swatch = document.querySelector('[title="#2196f3"]')
    expect(swatch).not.toBeNull()
    fireEvent.click(swatch)
    // 點背景關閉取色器
    fireEvent.click(document.querySelector('.fixed.z-\\[1300\\]'))
    expect(document.querySelector('[title="#2196f3"]')).toBeNull()
    await save(utils)
    expect(clockIn(utils)[0].color).toBe('#2196f3')
  })

  it('沒有顏色的班別開啟取色器時不改顏色', async () => {
    const base = baseFixtures().GET_MERCHANT_CLOCK_IN_SETTING.getMerchantClockInSetting[0]
    const utils = await setup({ GET_MERCHANT_CLOCK_IN_SETTING: { getMerchantClockInSetting: [{ ...base, color: null }] } })
    fireEvent.click(screen.getByRole('button', { name: '選取顏色' }))
    await save(utils)
    expect(clockIn(utils)[0].color).toBeNull()
  })

  it('新增班別帶完整預設欄位、刪除班別', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0)
    const utils = await setup()
    const card = scheduleCard()
    fireEvent.click(card.querySelector('svg.lucide-plus'))
    expect(controlsByLabel('人員班別', card)).toHaveLength(2)
    await typeText(controlByLabel('人員班別', card, 1), '新班')
    // 只有最後一列有新增鈕；刪除第一列
    expect(card.querySelectorAll('svg.lucide-plus')).toHaveLength(1)
    fireEvent.click(card.querySelectorAll('svg[class*="lucide-trash"]')[0])
    Math.random.mockRestore()
    await save(utils)
    expect(clockIn(utils)).toEqual([
      {
        name: '新班',
        clockInHour: 0,
        clockInMinute: 0,
        isClockInUsing: true,
        clockOutHour: 0,
        clockOutMinute: 0,
        isClockOutUsing: true,
        breakTimeSetting: [{ startHour: 0, startMinute: 0, isStartTimeUsing: true, endHour: 0, endMinute: 0, isEndTimeHourUsing: true }],
        allowedDelayMinutes: 0,
        color: '#f44336',
        isWorkOverMinutesCalculated: false,
        isClockOutBufferMinutesUsing: false,
        clockOutBufferMinutes: 0,
      },
    ])
  })

  it('沒有班別時顯示「無資料」，可新增第一個班別', async () => {
    const utils = await setup({ GET_MERCHANT_CLOCK_IN_SETTING: { getMerchantClockInSetting: [] } })
    const card = scheduleCard()
    expect(card).toHaveTextContent('無資料')
    fireEvent.click(card.querySelector('svg.lucide-plus'))
    expect(controlsByLabel('人員班別', card)).toHaveLength(1)
    await save(utils)
    expect(clockIn(utils)).toHaveLength(1)
  })

  it('讀取中不能新增或刪除班別', async () => {
    const delays = { GET_MERCHANT_PASSWORD: 3000 }
    const utils = renderPage(<Parameter />, { fixtures: baseFixtures(), delays })
    await wait(() => expect(screen.getByRole('checkbox', { name: '指定互助人功能' })).toBeChecked())
    await openTab('排班及打卡')
    const card = scheduleCard()
    fireEvent.click(card.querySelector('svg.lucide-plus'))
    fireEvent.click(card.querySelector('svg[class*="lucide-trash"]'))
    expect(controlsByLabel('人員班別', card)).toHaveLength(1)
    await utils.settle()
  })

  it('讀取中「無資料」的新增鈕無作用', async () => {
    const utils = renderPage(<Parameter />, {
      fixtures: { ...baseFixtures(), GET_MERCHANT_CLOCK_IN_SETTING: { getMerchantClockInSetting: [] } },
      delays: { GET_MERCHANT_PASSWORD: 3000 },
    })
    await wait(() => expect(screen.getByRole('checkbox', { name: '指定互助人功能' })).toBeChecked())
    await openTab('排班及打卡')
    fireEvent.click(scheduleCard().querySelector('svg.lucide-plus'))
    expect(scheduleCard()).toHaveTextContent('無資料')
    await utils.settle()
  })
})

describe('考勤排班總表設定', () => {
  it('可編輯過往班別：勾選後送出 true', async () => {
    const utils = await setup()
    fireEvent.click(checkboxByLabel('可編輯過往班別'))
    await save(utils)
    expect(sent(utils.calls, 'SET_UES_USEING_SETTING')).toEqual({ input: true })
  })
})
