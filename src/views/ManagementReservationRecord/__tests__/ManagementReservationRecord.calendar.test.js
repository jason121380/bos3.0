// 保護「單日預約紀錄」的行事曆呈現：櫃台靠這張表看「誰幾點有客人、還能不能收」。守住：
// - 查詢送出的是畫面選的那一天（台灣時間 00:00–23:59:59.999）；時間軸以營業時間為準，預約超出營業時間時往前／往後延伸
// - 各狀態色塊（指定／不指定／待審核／已完成／已開單／未來預訂待確認／事件／公休）顏色正確，重疊預約並排、欄寬隨並排數加寬
// - 「可預約人數」＝上限扣掉佔名額且未開單的預約，不會出現負數；公休時段標示不可預約；設計師名稱依「顧客端顯示名稱」設定
// - 報到功能開啟時才有篩選；報到模式只顯示未完成預約並以報到狀態上色；過時未報到顯示未報到圖示、未出席顯示圖示
// - 店家設定不推播待審核時，待審核預約不顯示；即時推播（socket）同一天的異動會更新表格並提示，開著的預約被改時關閉彈窗
// - 點各種格子開啟對應的彈窗（新增預約／開放預約／不指定預約／預約明細／事件／公休／已開單的帳單）
// - 格子寬高可調；小格子裡備註太長時改為跑馬燈
// 原本的已知缺口已於 2026/10/22 修正（Jason fix all，見各測試註解）。GraphQL 全由模擬 link 回應，不連後端、不建立真實預約。
import React from 'react'
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { reservationActions } from 'store/reservation'
import { RESERVATION_COLORS } from 'components/CalendarColorClip'
import { loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import {
  setupRecord,
  pageReady,
  hasBlock,
  timeLabels,
  designerHeaders,
  designerColumn,
  designerCell,
  ndsCell,
  block,
  table,
  reservation,
  entry,
  at,
  AMY,
  NDS,
  calendarResponse,
  DAY,
  DAY_START,
  DAY_END,
  SLOT,
} from './recordKit.test'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
// 日期選擇器以簡化版代替：輸入毫秒數即選該日
jest.mock('ui/date-picker', () => ({
  MobileDatePicker: ({ value, onChange, label, localeText }) => (
    <input
      aria-label={label || (localeText && localeText.toolbarTitle)}
      data-value={value}
      onChange={e => onChange(new Date(Number(e.target.value)))}
    />
  ),
}))

beforeEach(() => {
  loginAs()
  window.open = jest.fn()
})
afterEach(cleanup)

// 一位設計師一整天的各種狀態
const FULL_DAY = base => ({
  designerId: 'd-1',
  designerName: '王小美',
  designerNickname: 'Amy',
  designerNo: '01',
  bookingLimit: 2,
  calendar: [
    // 故意不依時間排序：頁面要自己排
    reservation(base, 12, 0, 1, { ids: ['b-4'], nameToDisplay: '已完成客', bookingStatus: '已完成' }),
    ...AMY(base).calendar,
    reservation(base, 10, 30, 1, {
      ids: ['b-3'],
      nameToDisplay: '黃小姐',
      bookingStatus: '預約成功',
      isDesignate: false,
      isBookingCostUsing: true,
      isCheckin: true,
      isNoShow: true,
    }),
    reservation(base, 11, 30, 1, {
      ids: ['b-9'],
      nameToDisplay: '已開單客二',
      bookingStatus: '預約成功',
      isDone: true,
      createdOrderId: 'o-10',
      isBookingCostUsing: true,
    }),
    reservation(base, 13, 0, 1, { ids: ['b-8'], nameToDisplay: '同時段客', bookingStatus: '預約成功', isBookingCostUsing: true }),
    reservation(base, 13, 0, 1, {
      ids: ['b-5'],
      nameToDisplay: '已開單客',
      bookingStatus: '預約成功',
      isDone: true,
      createdOrderId: 'o-9',
      isBookingCostUsing: true,
    }),
    reservation(base, 14, 0, 1, { ids: ['b-6'], nameToDisplay: '待確認客', bookingStatus: '預約成功', isCusCheckRequired: true }),
    reservation(base, 15, 0, 1, { ids: ['b-7'], nameToDisplay: '已取消客', bookingStatus: '設計師已取消' }),
    entry('EVENT', at(base, 16), 2, { ids: ['e-1'], nameToDisplay: '教育訓練', remark: '全員參加' }),
    entry('RH', at(base, 17), 1, { nameToDisplay: '休息' }),
    entry('HOLIDAY', at(base, 18), 2, { ids: ['h-1'], nameToDisplay: '公休' }),
    entry('OTHER', at(base, 19), 1, { nameToDisplay: '其他' }),
  ],
})
const LEE = base => ({
  designerId: 'd-2',
  designerName: '李大華',
  designerNickname: null,
  designerNo: '02',
  bookingLimit: 1,
  calendar: [entry('HOLIDAY', at(base, 12), 1, { ids: ['h-2'], nameToDisplay: '請假' })],
})
const ZHANG = { designerId: 'd-3', designerName: '張三', designerNickname: '小張', designerNo: '03', bookingLimit: 3, calendar: [] }
const NDS_TWO = base => ({
  designerName: '不指定',
  calendar: [
    reservation(base, 10, 0, 1, {
      ids: ['n-1'],
      nameToDisplay: '路人甲',
      bookingStatus: '預約成功',
      isBookingCostUsing: true,
      isCheckin: false,
      remark: '第一次來',
    }),
    reservation(base, 10, 0, 1, { ids: ['n-2'], nameToDisplay: '路人乙', bookingStatus: '待審核', isCheckin: true }),
  ],
})

const row = (h, m = 0) => (h - 10) * 2 + m / 30
const capacity = (designer, h, m) => designerCell(designer, row(h, m)).querySelector('.capacity-value').textContent

describe('查詢與時間軸', () => {
  it('查詢送出畫面選的那一天；時間軸為營業時間 10:00–20:00，每 30 分一格', async () => {
    // 取消密碼設定晚到：行事曆照常先顯示
    const utils = setupRecord({ delays: { GET_CANCEL_BOOKING_USING: 200 } })
    await pageReady(utils)
    const last = callsOf(utils.calls, 'getMerchantDesignerCalendar').pop()
    expect(last.variables).toEqual({ input: { dateRange: { startDate: DAY_START, endDate: DAY_END } } })
    expect(timeLabels()[0]).toBe('10:00')
    expect(timeLabels()).toHaveLength(21)
    expect(timeLabels()[20]).toBe('20:00')
    // 載入完成：遮罩隱藏、行事曆不再標示忙碌
    expect(document.getElementById('Backdrop')).toHaveStyle(`visibility: hidden`)
    expect(table().parentElement).not.toHaveAttribute('aria-busy')
  })

  it('預約早於開店或晚於打烊時，時間軸往前／往後延伸（公休不影響）', async () => {
    const EARLY = base => ({
      designerId: 'd-9',
      designerName: '早鳥',
      designerNickname: null,
      designerNo: '09',
      bookingLimit: 1,
      calendar: [
        reservation(base, 8, 30, 1, { ids: ['x-1'], nameToDisplay: '早客', bookingStatus: '預約成功' }),
        reservation(base, 21, 0, 1, { ids: ['x-2'], nameToDisplay: '晚客', bookingStatus: '預約成功' }),
        entry('HOLIDAY', at(base, 6), 1, { ids: ['x-3'], nameToDisplay: '清晨公休' }),
      ],
    })
    const LATE_NDS = base => ({
      designerName: '不指定',
      calendar: [
        reservation(base, 9, 0, 1, { ids: ['n-9'], nameToDisplay: '九點客', bookingStatus: '預約成功' }),
        reservation(base, 20, 0, 2, { ids: ['n-8'], nameToDisplay: '八點客', bookingStatus: '預約成功' }),
      ],
    })
    const utils = setupRecord({ designers: [EARLY], nds: LATE_NDS })
    await pageReady(utils)
    expect(timeLabels()[0]).toBe('08:30')
    // 最後一格是最晚結束的預約的最後 30 分（21:00–21:30 → 21:00）
    expect(timeLabels()[timeLabels().length - 1]).toBe('21:00')
  })

  it('換日：重新查詢新的那一天', async () => {
    const utils = setupRecord()
    await pageReady(utils)
    const next = new Date(2025, 2, 11).getTime()
    fireEvent.change(screen.getByLabelText('選擇日期'), { target: { value: String(next) } })
    await utils.settle()
    expect(callsOf(utils.calls, 'getMerchantDesignerCalendar').pop().variables.input.dateRange).toEqual({
      startDate: next,
      endDate: new Date(2025, 2, 11, 23, 59, 59, 999).getTime(),
    })
  })

  it('後端回空資料：仍顯示時間軸與不指定欄，不進錯誤畫面', async () => {
    const utils = setupRecord({ designers: [], nds: { designerName: null, calendar: [] } })
    await pageReady(utils)
    expect(designerHeaders()).toEqual([])
    expect(screen.getByText('不指定')).toBeInTheDocument()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })

  // Jason 2026/10/22 fix all：頁面讀設定與行事曆查詢結果前原本沒有防呆，任一查詢失敗（data 為 undefined）整頁進錯誤畫面、
  // 連日期都無法切換；改以 idx 加預設值（與查詢回來前的初始值相同），失敗的那一項沿用預設、其餘照常。
  it('任一設定查詢失敗：沿用預設值，表格照常顯示', async () => {
    const names = [
      'getDesignerNameForCustomerSide',
      'GET_BOOKING_REMARK_DISPLAY',
      'GET_CUS_BOOKING_REMARK_DISPLAY',
      'GET_PARAMETER_ABOUT_SETTING_FUNCTION',
      'GET_CHECKIN_SETTING_FOR_CALENDAR',
      'GET_IS_BOOKING_CUS_CHECK_USING',
      'GET_IS_BOOKING_TYPE_FOR_SOCKET',
      'GET_BOOKING_HISTORY_DISPLAY',
      'GET_CANCEL_BOOKING_USING',
    ]
    for (const name of names) {
      const utils = setupRecord({ fixtures: { [name]: new Error('壞了') } })
      await pageReady(utils)
      expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
      expect(designerHeaders()).toEqual(['王小美'])
      expect(hasBlock('陳小姐')).toBe(true)
      cleanup()
    }
    // 全部一起失敗也一樣；推播類型讀不到時預設提示待審核
    const utils = setupRecord({ fixtures: Object.fromEntries(names.map(n => [n, new Error('壞了')])) })
    await pageReady(utils)
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(hasBlock('林先生')).toBe(true)
  })

  // 2026/10/28：行事曆查詢失敗改顯示可重試的錯誤狀態，不再顯示空的時間軸讓人誤以為當天沒有預約；換日期後照常重查
  it('行事曆查詢失敗：顯示無法載入資料與重新查詢，可切換日期', async () => {
    let fail = true
    const utils = setupRecord({
      fixtures: {
        getMerchantDesignerCalendar: vars => (fail ? new Error('壞了') : calendarResponse([AMY], NDS)(vars)),
      },
    })
    // 查詢失敗時不畫時間軸表格（pageReady 會等表頭「時間」），只等查詢都回來
    await utils.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('無法載入資料')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重新查詢' })).toBeEnabled()
    expect(document.getElementById('Backdrop')).toHaveStyle('visibility: hidden')
    fail = false
    fireEvent.change(screen.getByLabelText('選擇日期'), { target: { value: String(new Date(2025, 2, 11).getTime()) } })
    await utils.settle()
    await wait(() => expect(hasBlock('陳小姐')).toBe(true))
    expect(designerHeaders()).toEqual(['王小美'])
  })
})

describe('色塊、名額與名稱', () => {
  it('各預約狀態的顏色：指定、不指定、待審核、已完成、已開單、事件、公休；其他狀態不上色', async () => {
    const utils = setupRecord({ designers: [FULL_DAY] })
    await pageReady(utils)
    expect(block('陳小姐')).toHaveStyle(`background-color: ${RESERVATION_COLORS.designate}`)
    expect(block('黃小姐')).toHaveStyle(`background-color: ${RESERVATION_COLORS.nonDesignate}`)
    expect(block('林先生')).toHaveStyle(`background-color: ${RESERVATION_COLORS.pending}`)
    expect(block('已完成客')).toHaveStyle(`background-color: ${RESERVATION_COLORS.completed}`)
    expect(block('已開單客')).toHaveStyle(`background-color: ${RESERVATION_COLORS.done}`)
    expect(block('教育訓練')).toHaveStyle(`background-color: ${RESERVATION_COLORS.event}`)
    expect(block('休息')).toHaveStyle(`background-color: ${RESERVATION_COLORS.unavailable}`)
    expect(block('公休')).toHaveStyle(`background-color: ${RESERVATION_COLORS.unavailable}`)
    // 店家沒開「未來預訂（待確認）」：仍以原本的狀態上色
    expect(block('待確認客')).toHaveStyle(`background-color: ${RESERVATION_COLORS.nonDesignate}`)
    expect(block('已取消客').style.backgroundColor).toBe('')
    expect(block('其他').style.backgroundColor).toBe('')
    // 色塊高度＝時長 × 格高（40px）－ 2
    expect(block('陳小姐')).toHaveStyle(`height: 78px`)
    // 生日圖示
    expect(screen.getByText('🎂陳小姐')).toBeInTheDocument()
  })

  it('店家開啟「未來預訂（待確認）」時，待確認的預約改以待確認色顯示', async () => {
    const utils = setupRecord({ designers: [FULL_DAY], settings: { cusCheck: true } })
    await pageReady(utils)
    expect(block('待確認客')).toHaveStyle(`background-color: ${RESERVATION_COLORS.cusCheck}`)
  })

  it('可預約人數＝上限扣掉佔名額且未開單的預約，超額時顯示 0；公休時段標示不可預約', async () => {
    const utils = setupRecord({ designers: [FULL_DAY, LEE, ZHANG] })
    await pageReady(utils)
    expect(capacity(0, 10, 0)).toBe('1')
    // 10:30 有三筆佔名額（陳小姐、林先生、黃小姐），上限 2 → 0，不是 -1
    expect(capacity(0, 10, 30)).toBe('0')
    expect(capacity(0, 11, 0)).toBe('2')
    // 已開單的預約不再佔名額（13:00 另有一筆未開單的 → 剩 1）
    expect(capacity(0, 13, 0)).toBe('1')
    expect(capacity(0, 11, 30)).toBe('2')
    // 休息（RH）時段：標示不可預約
    expect(designerCell(0, row(17)).firstChild).toHaveAttribute('title', '不可預約時段')
    expect(within(designerCell(0, row(17))).getByText('不可預約時段，')).toBeInTheDocument()
    expect(designerCell(0, row(16)).firstChild).not.toHaveAttribute('title')
    expect(designerCell(1, row(12)).firstChild).toHaveAttribute('title', '不可預約時段')
    // 沒有預約、也沒有公休的設計師：整格顯示「可預約人數」
    expect(within(designerCell(2, row(10))).getByText('可預約人數')).toBeInTheDocument()
    expect(capacity(2, 10, 0)).toBe('3')
    expect(within(designerCell(0, row(10))).queryByText('可預約人數')).toBeNull()
  })

  it('重疊的預約並排：欄寬依最多並排數加寬，色塊平分寬度；只有公休的設計師加上公休欄', async () => {
    const utils = setupRecord({ designers: [FULL_DAY, LEE, ZHANG], nds: NDS_TWO })
    await pageReady(utils)
    // FULL_DAY：10:00–11:00 三筆重疊 → 3 個預約欄（95×3）＋公休欄 75＋人數欄 30
    expect(designerColumn(0)).toHaveStyle(`width: 390px`)
    expect(block('陳小姐')).toHaveStyle(`width: 95px`)
    expect(block('已完成客')).toHaveStyle(`width: 285px`)
    // 只有公休：一般欄寬＋人數欄
    expect(designerColumn(1)).toHaveStyle(`width: 125px`)
    expect(designerColumn(2)).toHaveStyle(`width: 95px`)
    // 不指定欄：兩筆重疊 → 2 欄（95×2）＋人數欄 30
    expect(tableBody0()).toHaveStyle(`width: 220px`)
    expect(block('路人甲')).toHaveStyle(`width: 93px`)
  })

  it('重疊判斷：同時開始、一筆接在另一筆結束時（含零時長的紀錄）也正確分組', async () => {
    const EDGE = base => ({
      designerId: 'd-8',
      designerName: '邊界',
      designerNickname: null,
      designerNo: '08',
      bookingLimit: 5,
      calendar: [
        // A 10:00–11:00；X 11:00–11:30 不與 A 重疊；Y 11:00（零時長）落在 A 的結束點 → 與 A 同組
        reservation(base, 10, 0, 2, { ids: ['A'], nameToDisplay: 'A客', bookingStatus: '預約成功' }),
        reservation(base, 11, 0, 1, { ids: ['X'], nameToDisplay: 'X客', bookingStatus: '預約成功' }),
        reservation(base, 11, 0, 0, { ids: ['Y'], nameToDisplay: 'Y客', bookingStatus: '預約成功' }),
        // Z1 12:00（零時長）與同時開始的 Z2 同組
        reservation(base, 12, 0, 0, { ids: ['Z1'], nameToDisplay: 'Z1客', bookingStatus: '預約成功' }),
        reservation(base, 12, 0, 1, { ids: ['Z2'], nameToDisplay: 'Z2客', bookingStatus: '預約成功' }),
        // 公休也用同一套分組
        entry('HOLIDAY', at(base, 14), 2, { ids: ['HA'], nameToDisplay: 'HA' }),
        // 與 HA 重疊的另一筆公休（同一時段兩筆不可預約）
        entry('HOLIDAY', at(base, 14), 1, { ids: ['HB'], nameToDisplay: 'HB' }),
        entry('HOLIDAY', at(base, 15), 1, { ids: ['HX'], nameToDisplay: 'HX' }),
        entry('HOLIDAY', at(base, 15), 0, { ids: ['HY'], nameToDisplay: 'HY' }),
        entry('HOLIDAY', at(base, 16), 0, { ids: ['HZ1'], nameToDisplay: 'HZ1' }),
        entry('HOLIDAY', at(base, 16), 1, { ids: ['HZ2'], nameToDisplay: 'HZ2' }),
      ],
    })
    // 不指定欄的公休紀錄：不畫在不指定欄
    const NDS_HOLIDAY = base => ({
      designerName: '不指定',
      calendar: [
        entry('HOLIDAY', at(base, 10), 1, { ids: ['nh'], nameToDisplay: '不指定公休' }),
        // 沒有 id 的紀錄也要能顯示（以類型＋順序當 key）
        reservation(base, 11, 0, 1, { nameToDisplay: '無編號客', bookingStatus: '預約成功' }),
        reservation(base, 11, 0, 1, { nameToDisplay: '無編號客二', bookingStatus: '預約成功' }),
      ],
    })
    const utils = setupRecord({ designers: [EDGE], nds: NDS_HOLIDAY })
    await pageReady(utils)
    expect(hasBlock('不指定公休')).toBe(false)
    expect(hasBlock('無編號客')).toBe(true)
    expect(designerCell(0, row(14)).firstChild).toHaveAttribute('title', '不可預約時段')
    const group = name => block(name).parentElement
    expect(group('Y客')).toBe(group('A客'))
    expect(group('X客')).not.toBe(group('A客'))
    expect(group('Z2客')).toBe(group('Z1客'))
    expect(group('HY')).toBe(group('HA'))
    expect(group('HX')).not.toBe(group('HA'))
    expect(group('HZ2')).toBe(group('HZ1'))
    // 同組第二筆以 margin-top 對齊自己的開始時間（Y 比 A 晚 1 小時＝2 格）
    expect(block('Y客')).toHaveStyle(`margin-top: 81px`)
    // 組的位置：A 在 10:00（第 0 格）
    expect(group('A客')).toHaveStyle(`top: 1px`)
    expect(group('X客')).toHaveStyle(`top: 81px`)
  })

  it('顧客端名稱設定為「暱稱」：表頭顯示暱稱，沒有暱稱的顯示本名', async () => {
    const utils = setupRecord({ designers: [FULL_DAY, LEE], settings: { nameType: 'NICKNAME' } })
    await pageReady(utils)
    expect(designerHeaders()).toEqual(['Amy', '李大華'])
  })

  // Jason 2026/10/22 fix all：OrderTable.js「本名＋暱稱」判斷原本寫成 `designerName === 'BOTH'`（比對設計師本名），
  // 設定為 BOTH 時只顯示本名；改為 `designerNameType === 'BOTH'`（與單週預約紀錄、共用週曆相同）。
  it('顧客端名稱設定為「本名＋暱稱」：表頭顯示「本名(暱稱)」，沒有暱稱的只顯示本名', async () => {
    const NO_NICK = { ...ZHANG, designerId: 'd-6', designerName: '無暱稱', designerNickname: null }
    const utils = setupRecord({ designers: [FULL_DAY, NO_NICK], settings: { nameType: 'BOTH' } })
    await pageReady(utils)
    expect(designerHeaders()).toEqual(['王小美(Amy)', '無暱稱'])
  })
})

const tableBody0 = () => document.querySelector('#darkBg')

describe('報到、未出席與篩選', () => {
  const lucide = (el, name) => el.querySelector(`.lucide-${name}`)

  it('報到功能開啟：已過時未報到顯示未報到圖示、已報到顯示報到圖示；事件不顯示；未出席另有圖示', async () => {
    const utils = setupRecord({ designers: [FULL_DAY], nds: NDS_TWO, settings: { checkin: true } })
    await pageReady(utils)
    expect(lucide(block('陳小姐'), 'square-x')).not.toBeNull()
    expect(lucide(block('黃小姐'), 'clipboard-check')).not.toBeNull()
    expect(lucide(block('黃小姐'), 'calendar-x')).not.toBeNull()
    expect(lucide(block('陳小姐'), 'calendar-x')).toBeNull()
    expect(lucide(block('教育訓練'), 'square-x')).toBeNull()
    expect(lucide(block('路人甲'), 'square-x')).not.toBeNull()
    expect(lucide(block('路人乙'), 'clipboard-check')).not.toBeNull()
  })

  it('報到功能開啟、預約還沒到：不顯示未報到圖示', async () => {
    const future = new Date(2099, 0, 5)
    const end = new Date(2099, 0, 5, 23, 59, 59, 999)
    const utils = setupRecord({
      designers: [FULL_DAY],
      settings: { checkin: true },
      route: `/r?startDate=${future.getTime()}&endDate=${end.getTime()}`,
    })
    await pageReady(utils)
    expect(lucide(block('陳小姐'), 'square-x')).toBeNull()
  })

  it('報到功能關閉：沒有報到圖示，也沒有篩選鈕', async () => {
    const utils = setupRecord({ designers: [FULL_DAY] })
    await pageReady(utils)
    expect(lucide(block('陳小姐'), 'square-x')).toBeNull()
    expect(lucide(block('黃小姐'), 'clipboard-check')).toBeNull()
    expect(screen.queryByRole('button', { name: /篩選/ })).toBeNull()
  })

  it('報到模式：只顯示未開單的預約，以報到狀態上色；事件、公休、已開單不顯示；關掉後恢復', async () => {
    const utils = setupRecord({ designers: [FULL_DAY, LEE], nds: NDS_TWO, settings: { checkin: true } })
    await pageReady(utils)
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    expect(screen.queryByLabelText('報到狀態篩選')).toBeNull()
    fireEvent.click(screen.getByRole('switch', { name: '報到模式' }))
    await wait(() => expect(screen.queryByText('教育訓練')).toBeNull())
    expect(screen.queryByText('公休')).toBeNull()
    expect(screen.queryByText('已開單客')).toBeNull()
    expect(block('陳小姐')).toHaveStyle(`background-color: ${RESERVATION_COLORS.notCheckedIn}`)
    expect(block('黃小姐')).toHaveStyle(`background-color: ${RESERVATION_COLORS.checkedIn}`)
    // 報到模式不顯示未出席圖示
    expect(lucide(block('黃小姐'), 'calendar-x')).toBeNull()
    // 報到模式仍計算名額（公休不計）
    expect(capacity(0, 10, 30)).toBe('0')
    expect(designerCell(0, row(17)).firstChild).not.toHaveAttribute('title')
    fireEvent.click(screen.getByRole('switch', { name: '報到模式' }))
    expect(await screen.findByText('教育訓練')).toBeInTheDocument()
    // 再按篩選收起面板
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    expect(screen.queryByRole('switch', { name: '報到模式' })).toBeNull()
  })

  it('報到狀態篩選：選「報到成功」只留已報到、選「未報到」只留未報到；關掉報到模式時篩選一併清除', async () => {
    const utils = setupRecord({ designers: [FULL_DAY], settings: { checkin: true } })
    await pageReady(utils)
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    fireEvent.click(screen.getByRole('switch', { name: '報到模式' }))
    const select = await screen.findByLabelText('報到狀態篩選')
    const choose = text => fireEvent.change(select, { target: { value: [...select.options].find(o => o.textContent === text).value } })
    choose('報到成功')
    await wait(() => expect(hasBlock('陳小姐')).toBe(false))
    expect(hasBlock('黃小姐')).toBe(true)
    // 待審核（尚無報到狀態）兩種篩選都不顯示
    expect(hasBlock('林先生')).toBe(false)
    choose('未報到')
    await wait(() => expect(hasBlock('黃小姐')).toBe(false))
    expect(hasBlock('陳小姐')).toBe(true)
    choose('全部顯示')
    await wait(() => expect(hasBlock('黃小姐')).toBe(true))
    expect(hasBlock('陳小姐')).toBe(true)
    // 篩選中關掉報到模式：篩選條件清除（一般模式也受篩選影響，所以必須清）
    choose('報到成功')
    await wait(() => expect(hasBlock('陳小姐')).toBe(false))
    fireEvent.click(screen.getByRole('switch', { name: '報到模式' }))
    await wait(() => expect(hasBlock('陳小姐')).toBe(true))
    expect(screen.getByText('教育訓練')).toBeInTheDocument()
  })

  it('店家設定不推播待審核：待審核預約不顯示', async () => {
    const utils = setupRecord({ designers: [FULL_DAY], settings: { socketTypes: ['CREATE'] } })
    await pageReady(utils)
    expect(screen.queryByText('林先生')).toBeNull()
    expect(hasBlock('陳小姐')).toBe(true)
  })
})

describe('即時推播（socket）', () => {
  const push = (store, payload) =>
    act(() => {
      store.dispatch(reservationActions.setReservation(JSON.stringify(payload)))
    })
  const pushed = (base, extra) => ({
    date: base,
    calendarData: {
      merchantDesignerCalendar: [
        {
          ...AMY(base),
          calendar: [...AMY(base).calendar, reservation(base, 15, 0, 1, { ids: ['b-new'], nameToDisplay: '新客人', bookingStatus: '預約成功' })],
        },
      ],
      nonDesignateCalendar: { designerName: '不指定', calendar: [] },
    },
    ...extra,
  })

  it('同一天有新預約：表格更新並提示「有一筆新預約」；別天的推播不影響', async () => {
    const utils = setupRecord()
    await pageReady(utils)
    push(utils.store, pushed(new Date(2025, 2, 11).getTime(), { actionType: 'CREATE', bookingDataId: 'b-new' }))
    expect(screen.queryByText('新客人')).toBeNull()
    push(utils.store, pushed(DAY_START, { actionType: 'CREATE', bookingDataId: 'b-new' }))
    expect(await screen.findByText('新客人')).toBeInTheDocument()
    expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '有一筆新預約' })
  })

  it('開著的預約被別人修改：提示「預約紀錄已更新」並關閉彈窗；不是這筆就不關', async () => {
    const utils = setupRecord()
    await pageReady(utils)
    fireEvent.click(block('陳小姐'))
    expect(await screen.findByText('電話: 0912000111')).toBeInTheDocument()
    push(utils.store, pushed(DAY_START, { actionType: 'UPDATE', bookingDataId: 'b-2' }))
    await screen.findByText('新客人')
    expect(openSnackbar).toHaveBeenCalledWith({ variant: 'warning', message: '預約紀錄已更新' })
    expect(screen.getByText('電話: 0912000111')).toBeInTheDocument()
    push(utils.store, pushed(DAY_START, { actionType: 'UPDATE', bookingDataId: 'b-1' }))
    await wait(() => expect(screen.queryByText('電話: 0912000111')).toBeNull())
  })

  it('店家不推播待審核：待審核的推播只更新表格、不提示', async () => {
    const utils = setupRecord({ settings: { socketTypes: ['CREATE'] } })
    await pageReady(utils)
    push(utils.store, pushed(DAY_START, { actionType: 'CREATE', bookingDataId: 'b-new', bookingStatus: 'UNCHECK' }))
    expect(await screen.findByText('新客人')).toBeInTheDocument()
    expect(openSnackbar).not.toHaveBeenCalled()
    push(utils.store, pushed(DAY_START, { actionType: 'CREATE', bookingDataId: 'b-new', bookingStatus: 'CHECKED' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '有一筆新預約' }))
  })

  // Jason 2026/10/22 fix all：推播的異動資訊（changeData）原本留在 state 裡，之後調整格子大小、切換報到模式等任何會重算表格的操作，
  // 都會再跳一次「有一筆新預約／預約紀錄已更新」；改為同一筆推播只提示一次。
  it('收到推播後調整格子大小、切換報到模式，不再重複提示；下一筆推播照常提示', async () => {
    const utils = setupRecord({ settings: { checkin: true } })
    await pageReady(utils)
    push(utils.store, pushed(DAY_START, { actionType: 'CREATE', bookingDataId: 'b-new' }))
    await screen.findByText('新客人')
    expect(openSnackbar).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: '調整格子寬度與高度' }))
    const slider = (await screen.findAllByRole('slider'))[0]
    const before = designerColumn(0).style.width
    fireEvent.change(slider, { target: { value: '70' } })
    await wait(() => expect(designerColumn(0).style.width).not.toBe(before))
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    fireEvent.click(await screen.findByRole('switch', { name: '報到模式' }))
    await utils.settle()
    expect(openSnackbar).toHaveBeenCalledTimes(1)
    push(utils.store, pushed(DAY_START, { actionType: 'UPDATE', bookingDataId: 'b-2' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledTimes(2))
    expect(openSnackbar).toHaveBeenLastCalledWith({ variant: 'warning', message: '預約紀錄已更新' })
  })
})

describe('點格子開啟對應彈窗', () => {
  it('空白時段開「新增預約」（可關閉預約）；休息時段開「開放預約」；不指定欄開不指定預約', async () => {
    const utils = setupRecord({ designers: [FULL_DAY] })
    await pageReady(utils)
    fireEvent.click(designerCell(0, row(11)))
    expect(await screen.findByRole('button', { name: '關閉預約' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByRole('button', { name: '關閉預約' })).toBeNull())

    fireEvent.click(designerCell(0, row(17)))
    expect(await screen.findByRole('button', { name: '開啟預約' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByRole('button', { name: '開啟預約' })).toBeNull())

    fireEvent.click(ndsCell(row(11)))
    expect(await screen.findByRole('button', { name: '設定可預約人數上限' })).toBeInTheDocument()
  })

  it('預約色塊開預約明細；事件開事件內容；已開單的預約另開帳單頁', async () => {
    const utils = setupRecord({ designers: [FULL_DAY], nds: NDS_TWO })
    await pageReady(utils)
    fireEvent.click(block('陳小姐'))
    expect(await screen.findByText('電話: 0912000111')).toBeInTheDocument()
    expect(screen.getByText('設計師: 王小美')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '關閉' }))
    await wait(() => expect(screen.queryByText('電話: 0912000111')).toBeNull())

    fireEvent.click(block('教育訓練'))
    expect(await screen.findByText('事件時長: 1小時')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '關閉' }))
    await wait(() => expect(screen.queryByText('事件時長: 1小時')).toBeNull())

    fireEvent.click(block('已開單客'))
    expect(window.open).toHaveBeenCalledWith('/order/o-9', '_blank')

    // 不指定欄的預約：開編輯預約（不指定）
    fireEvent.click(block('路人甲'))
    expect(await screen.findByRole('button', { name: '儲存' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('第一次來')).toBeInTheDocument()
  })

  it('公休、休息色塊開「編輯公休」，列出該段的每 30 分；預約欄裡 id 標示公休的也是', async () => {
    const MARKED = base => ({
      designerId: 'd-5',
      designerName: '標記',
      designerNickname: null,
      designerNo: '05',
      bookingLimit: 1,
      calendar: [reservation(base, 11, 0, 2, { ids: ['HOLIDAY-1'], nameToDisplay: '整段公休', bookingStatus: '預約成功' })],
    })
    const utils = setupRecord({ designers: [FULL_DAY, MARKED] })
    await pageReady(utils)
    fireEvent.click(block('公休'))
    expect(await screen.findByText('編輯公休')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '18:00' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '18:30' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByText('編輯公休')).toBeNull())

    fireEvent.click(block('整段公休'))
    expect(await screen.findByText('編輯公休')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '11:30' })).toBeInTheDocument()
    fireEvent.keyDown(document.activeElement || document.body, { key: 'Escape' })
    await wait(() => expect(screen.queryByText('編輯公休')).toBeNull())
  })
})

describe('格子尺寸與備註顯示', () => {
  it('調整寬度與高度：欄寬、格高、色塊高度跟著變；再按一次收起', async () => {
    const utils = setupRecord({ designers: [ZHANG] })
    await pageReady(utils)
    const toggle = screen.getByRole('button', { name: '調整格子寬度與高度' })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const [width, height] = await screen.findAllByRole('slider')
    fireEvent.change(width, { target: { value: '120' } })
    await wait(() => expect(designerColumn(0)).toHaveStyle(`width: 120px`))
    fireEvent.change(height, { target: { value: '60' } })
    await wait(() => expect(designerCell(0, 0)).toHaveStyle(`height: 60px`))
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  describe('小格子備註過長改跑馬燈', () => {
    // jsdom 不排版：色塊大小取自 inline style，備註高度以字數模擬（6 字以上＝兩行 34px，否則一行 17px）
    let restore
    beforeEach(() => {
      const h = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')
      const w = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        configurable: true,
        get() {
          if (this.id === 'remark' || this.id === 'cusRemark') return this.textContent.length >= 6 ? 34 : 17
          return parseFloat(this.style.height) || 0
        },
      })
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        configurable: true,
        get() {
          return parseFloat(this.style.width) || 0
        },
      })
      restore = () => {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', h)
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', w)
      }
    })
    afterEach(() => restore())

    const REMARKS = base => ({
      designerId: 'd-4',
      designerName: '備註',
      designerNickname: null,
      designerNo: '04',
      bookingLimit: 9,
      calendar: [
        reservation(base, 10, 0, 1, {
          ids: ['r-1'],
          nameToDisplay: '都很長',
          bookingStatus: '預約成功',
          remark: '請準備熱毛巾',
          remarkForCustomer: '我想要剪短一點',
        }),
        reservation(base, 11, 0, 1, {
          ids: ['r-2'],
          nameToDisplay: '備註長',
          bookingStatus: '預約成功',
          remark: '請準備熱毛巾',
          remarkForCustomer: '短',
        }),
        reservation(base, 12, 0, 1, {
          ids: ['r-3'],
          nameToDisplay: '顧客長',
          bookingStatus: '預約成功',
          remark: '短',
          remarkForCustomer: '我想要剪短一點',
        }),
        reservation(base, 13, 0, 1, { ids: ['r-4'], nameToDisplay: '都很短', bookingStatus: '預約成功', remark: '短', remarkForCustomer: '短' }),
        reservation(base, 14, 0, 3, {
          ids: ['r-5'],
          nameToDisplay: '大格子',
          bookingStatus: '預約成功',
          remark: '請準備熱毛巾',
          remarkForCustomer: '我想要剪短一點',
        }),
        // 讓欄位變成「並排」模式，色塊才進入計算
        reservation(base, 14, 0, 3, { ids: ['r-6'], nameToDisplay: '大格子二', bookingStatus: '預約成功', remark: '短', remarkForCustomer: '短' }),
        entry('HOLIDAY', at(base, 18), 1, { ids: ['r-h'], nameToDisplay: '休假', remark: '出國' }),
      ],
    })
    const REMARK_NDS = base => ({
      designerName: '不指定',
      calendar: [
        reservation(base, 10, 0, 1, {
          ids: ['rn-1'],
          nameToDisplay: '不指定壽星',
          bookingStatus: '預約成功',
          displayBirthdayIcon: true,
          remark: '請準備熱毛巾',
          remarkForCustomer: '短',
        }),
        reservation(base, 10, 0, 1, { ids: ['rn-2'], nameToDisplay: '不指定二', bookingStatus: '預約成功', remark: '短', remarkForCustomer: '短' }),
      ],
    })
    const remarkOf = name => block(name).querySelector('#remark')
    const cusRemarkOf = name => block(name).querySelector('#cusRemark')

    it('顯示備註與顧客備註時：小格子裡超過一行的備註加跑馬燈，大格子維持換行', async () => {
      const utils = setupRecord({ designers: [REMARKS], nds: REMARK_NDS, settings: { remark: true, cusRemark: true } })
      await pageReady(utils)
      // 不指定欄的預約與公休也顯示備註；壽星有生日圖示
      expect(screen.getByText('🎂不指定壽星')).toBeInTheDocument()
      expect(screen.getByText('出國')).toBeInTheDocument()
      // 表格重算一次讓 effect 讀到完整的格子（調整寬度）
      fireEvent.click(screen.getByRole('button', { name: '調整格子寬度與高度' }))
      fireEvent.change((await screen.findAllByRole('slider'))[0], { target: { value: '70' } })
      await wait(() => expect(remarkOf('都很長')).toHaveClass('textAnimation'))
      expect(cusRemarkOf('都很長')).toHaveClass('textAnimation')
      expect(cusRemarkOf('都很長').style.whiteSpace).toBe('nowrap')
      expect(remarkOf('備註長')).toHaveClass('textAnimation')
      expect(cusRemarkOf('備註長')).not.toHaveClass('textAnimation')
      expect(remarkOf('顧客長')).not.toHaveClass('textAnimation')
      expect(cusRemarkOf('顧客長')).toHaveClass('textAnimation')
      expect(remarkOf('都很短')).not.toHaveClass('textAnimation')
      expect(cusRemarkOf('都很短')).not.toHaveClass('textAnimation')
      expect(remarkOf('大格子')).not.toHaveClass('textAnimation')
      expect(remarkOf('大格子').style.alignSelf).toBe('')
      expect(remarkOf('不指定壽星')).toHaveClass('textAnimation')
      expect(cusRemarkOf('大格子').style.whiteSpace).toBe('')
    })

    it('只顯示其中一種備註（或都不顯示）時不加跑馬燈', async () => {
      const utils = setupRecord({ designers: [REMARKS], settings: { remark: true, cusRemark: false } })
      await pageReady(utils)
      fireEvent.click(screen.getByRole('button', { name: '調整格子寬度與高度' }))
      fireEvent.change((await screen.findAllByRole('slider'))[0], { target: { value: '70' } })
      await wait(() => expect(designerColumn(0)).toHaveStyle(`width: 245px`))
      expect(remarkOf('都很長')).not.toHaveClass('textAnimation')
      expect(cusRemarkOf('都很長')).toBeNull()
      expect(remarkOf('大格子')).not.toHaveClass('textAnimation')
      cleanup()

      const again = setupRecord({ designers: [REMARKS], settings: { remark: false, cusRemark: true } })
      await pageReady(again)
      fireEvent.click(screen.getByRole('button', { name: '調整格子寬度與高度' }))
      fireEvent.change((await screen.findAllByRole('slider'))[0], { target: { value: '70' } })
      await wait(() => expect(designerColumn(0)).toHaveStyle(`width: 245px`))
      expect(remarkOf('大格子')).toBeNull()
      expect(cusRemarkOf('大格子').style.whiteSpace).toBe('')
    })
  })
})

it('時段常數：每格 30 分鐘', () => {
  expect(SLOT).toBe(1800000)
  expect(DAY.getDate()).toBe(10)
})
