import { endOfDay, endOfMonth, format, startOfDay, startOfMonth, startOfWeek, subDays } from 'date-fns'
import {
  createBusinessDate,
  createBusinessDateTimeFormat,
  deviceMatchesBusinessTime,
  installBusinessTimeZone,
  isBusinessTimeZoneInstalled,
} from '../business-timezone'

// 為什麼重要：店家在台灣營業，「今天、本月」與畫面上的時間都必須以台灣時間為準。
// 原本全依裝置時區，出國或時區設錯時報表查錯時段、打資料記到錯的日期。
// 這些測試不論在哪個時區執行（CI 為 UTC，另以 TZ=America/Los_Angeles、Asia/Tokyo、Asia/Taipei 驗證）結果都必須相同。

const NativeDate = Date
const NativeDateTimeFormat = Intl.DateTimeFormat
const iso = d => NativeDate.prototype.toISOString.call(d)

beforeAll(() => {
  // 測試一律強制啟用（在台灣時區執行時也測同一套換算）
  installBusinessTimeZone({ force: true })
})

afterAll(() => {
  global.Date = NativeDate
  Intl.DateTimeFormat = NativeDateTimeFormat
})

// 台灣 2026/10/21（週三）10:00 ＝ UTC 02:00
const TAIPEI_1021_1000 = NativeDate.UTC(2026, 9, 21, 2, 0)
// 台灣 2026/10/21 01:30 ＝ UTC 10/20 17:30（UTC 與多數海外時區此時還是 10/20）
const TAIPEI_1021_0130 = NativeDate.UTC(2026, 9, 20, 17, 30)

describe('報表查詢區間以台灣時間計算', () => {
  it('啟用後全域 Date 已替換', () => {
    expect(isBusinessTimeZoneInstalled()).toBe(true)
    expect(new Date(TAIPEI_1021_1000).getTimezoneOffset()).toBe(-480)
  })

  it('「今天」＝台灣 10/21 00:00 到 23:59:59.999', () => {
    const now = new Date(TAIPEI_1021_1000)
    expect(iso(startOfDay(now))).toBe('2026-10-20T16:00:00.000Z')
    expect(iso(endOfDay(now))).toBe('2026-10-21T15:59:59.999Z')
  })

  it('台灣凌晨 01:30 的「今天」仍是 10/21（海外此時還是 10/20，原本會查成昨天）', () => {
    const now = new Date(TAIPEI_1021_0130)
    expect(iso(startOfDay(now))).toBe('2026-10-20T16:00:00.000Z')
    expect(format(now, 'yyyy/MM/dd')).toBe('2026/10/21')
  })

  it('「本月」＝台灣 10/1 00:00 到 10/31 23:59:59.999', () => {
    const now = new Date(TAIPEI_1021_1000)
    expect(iso(startOfMonth(now))).toBe('2026-09-30T16:00:00.000Z')
    expect(iso(endOfMonth(now))).toBe('2026-10-31T15:59:59.999Z')
  })

  it('「本週」從台灣週日 00:00 開始', () => {
    expect(iso(startOfWeek(new Date(TAIPEI_1021_1000)))).toBe('2026-10-17T16:00:00.000Z')
  })

  it('「昨天」往前一個台灣日曆日', () => {
    expect(iso(startOfDay(subDays(new Date(TAIPEI_1021_1000), 1)))).toBe('2026-10-19T16:00:00.000Z')
  })
})

describe('打資料：選擇的日期時間以台灣時間記錄', () => {
  it('日期選擇器選「2026/10/21 10:00」記錄為台灣 10:00', () => {
    expect(iso(new Date(2026, 9, 21, 10, 0))).toBe('2026-10-21T02:00:00.000Z')
  })

  it('只給年月日時為台灣當天 00:00；省略的欄位與原生相同', () => {
    expect(iso(new Date(2026, 9, 21))).toBe('2026-10-20T16:00:00.000Z')
    expect(iso(new Date(2026, 9))).toBe('2026-09-30T16:00:00.000Z')
  })

  it('setHours／setDate 依台灣時間調整', () => {
    const d = new Date(TAIPEI_1021_1000)
    d.setHours(23, 59, 0, 0)
    expect(iso(d)).toBe('2026-10-21T15:59:00.000Z')
    d.setDate(32) // 10/32 → 11/1，與原生相同會進位
    expect(format(d, 'yyyy/MM/dd HH:mm')).toBe('2026/11/01 23:59')
  })

  it('沒有時區的日期時間字串以台灣時間解讀', () => {
    expect(iso(new Date('2026/10/21 10:00'))).toBe('2026-10-21T02:00:00.000Z')
    expect(iso(new Date('2026-10-21T10:00'))).toBe('2026-10-21T02:00:00.000Z')
    expect(Date.parse('2026/10/21 10:00')).toBe(TAIPEI_1021_1000)
  })

  it('字串解析不受裝置日光節約影響（洛杉磯 3/8 02:30 不存在，台灣 02:30 仍是 02:30）', () => {
    // 裝置在有日光節約的時區時，跳過的那一小時若先以裝置時間解析會被平移成 03:30；台灣沒有日光節約，必須照字面記錄
    expect(iso(new Date('2026-03-08T02:30'))).toBe('2026-03-07T18:30:00.000Z')
    expect(iso(new Date('2026/03/08 02:30:15'))).toBe('2026-03-07T18:30:15.000Z')
    // 聖地牙哥等時區的日光節約從午夜開始，只有日期的斜線字串也不能被平移
    expect(iso(new Date('2026/09/06'))).toBe('2026-09-05T16:00:00.000Z')
    // 小數秒依字面補位（.5 是 500 毫秒）
    expect(iso(new Date('2026-10-21T10:00:00.5'))).toBe('2026-10-21T02:00:00.500Z')
  })

  it('有明確時區的字串與只有日期的 ISO 字串維持原本的解析（不改變既有存值）', () => {
    expect(iso(new Date('2026-10-21T02:00:00.000Z'))).toBe('2026-10-21T02:00:00.000Z')
    expect(iso(new Date('2026-10-21T10:00:00+08:00'))).toBe('2026-10-21T02:00:00.000Z')
    expect(iso(new Date('2026-10-21'))).toBe('2026-10-21T00:00:00.000Z')
  })
})

describe('畫面顯示以台灣時間', () => {
  it('date-fns format 顯示台灣時間', () => {
    expect(format(new Date(TAIPEI_1021_0130), 'yyyy/MM/dd HH:mm')).toBe('2026/10/21 01:30')
    expect(format(new Date(TAIPEI_1021_1000), 'EEEE')).toBe('Wednesday')
  })

  it('toLocaleString／Intl.DateTimeFormat 未指定時區時用台灣', () => {
    const d = new Date(TAIPEI_1021_0130)
    expect(d.toLocaleDateString('en-US')).toBe('10/21/2026')
    expect(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false }).format(d)).toBe('01')
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('Asia/Taipei')
  })

  it('指定其他時區時照指定的時區', () => {
    expect(new Date(TAIPEI_1021_0130).toLocaleDateString('en-US', { timeZone: 'UTC' })).toBe('10/20/2026')
  })

  it('toString 與原生格式相同，時區為台灣', () => {
    expect(new Date(TAIPEI_1021_1000).toString()).toBe('Wed Oct 21 2026 10:00:00 GMT+0800 (Taipei Standard Time)')
    expect(String(new Date('not a date'))).toBe('Invalid Date')
  })
})

describe('與原生 Date 相容', () => {
  it('時間戳記與 JSON 不變（送給後端的絕對時間相同）', () => {
    const d = new Date(TAIPEI_1021_1000)
    expect(d.getTime()).toBe(TAIPEI_1021_1000)
    expect(JSON.stringify({ d })).toBe('{"d":"2026-10-21T02:00:00.000Z"}')
    expect(+d).toBe(TAIPEI_1021_1000)
  })

  it('instanceof 與型別判斷：替換前建立的原生 Date 也算 Date', () => {
    const native = new NativeDate(0)
    expect(native instanceof Date).toBe(true)
    expect(new Date() instanceof NativeDate).toBe(true)
    expect(Object.prototype.toString.call(new Date())).toBe('[object Date]')
  })

  it('無效日期的行為與原生相同', () => {
    const bad = new Date('nope')
    expect(isNaN(bad.getTime())).toBe(true)
    expect(bad.getHours()).toBeNaN()
    expect(bad.setHours(1)).toBeNaN()
    expect(isNaN(bad.getTime())).toBe(true)
    // setFullYear 在無效日期上以本地 1970-01-01 00:00 為基準
    bad.setFullYear(2026)
    expect(iso(bad)).toBe('2025-12-31T16:00:00.000Z')
  })

  it('以既有 Date 複製（date-fns 的 toDate、new Date(d)）得到同一個時間', () => {
    const d = new Date(TAIPEI_1021_1000)
    expect(new Date(d).getTime()).toBe(TAIPEI_1021_1000)
    expect(new Date(new NativeDate(TAIPEI_1021_1000)).getTime()).toBe(TAIPEI_1021_1000)
  })

  it('new Date(年, 月, 日, 時, 分, 秒, 毫秒) 的秒與毫秒照字面記錄', () => {
    expect(iso(new Date(2026, 9, 21, 10, 0, 30, 500))).toBe('2026-10-21T02:00:30.500Z')
    expect(iso(new Date(2026, 9, 21, 10, 0, 30))).toBe('2026-10-21T02:00:30.000Z')
  })

  it('toDateString／toTimeString 以台灣時間顯示（與原生格式相同）', () => {
    const d = new Date(TAIPEI_1021_0130)
    expect(d.toDateString()).toBe('Wed Oct 21 2026')
    expect(d.toTimeString()).toBe('01:30:00 GMT+0800 (Taipei Standard Time)')
    const bad = new Date('nope')
    expect(bad.toDateString()).toBe('Invalid Date')
    expect(bad.toTimeString()).toBe('Invalid Date')
  })

  it('舊式 getYear（年−1900）依台灣日期；無效日期回 NaN', () => {
    // 台灣 2027/1/1 00:30 在 UTC 仍是 2026 年
    expect(new Date(NativeDate.UTC(2026, 11, 31, 16, 30)).getYear()).toBe(127)
    expect(new Date('nope').getYear()).toBeNaN()
  })

  it('無效日期的 getTimezoneOffset 與原生相同為 NaN', () => {
    expect(new Date('nope').getTimezoneOffset()).toBeNaN()
  })

  it('英文月份等非數字格式先經裝置解析再以台灣時間解讀（測試環境裝置時區見檔頭）', () => {
    // 這類格式依裝置時區解析後取字面欄位：字面 10:00 → 台灣 10:00（非日光節約切換時刻皆成立）
    expect(iso(new Date('Oct 21, 2026 10:00'))).toBe('2026-10-21T02:00:00.000Z')
    expect(iso(new Date('October 21, 2026'))).toBe('2026-10-20T16:00:00.000Z')
  })

  it('Intl.DateTimeFormat.supportedLocalesOf 照常可用（日期選擇器的語系判斷用）', () => {
    expect(Intl.DateTimeFormat.supportedLocalesOf(['en-US'])).toEqual(NativeDateTimeFormat.supportedLocalesOf(['en-US']))
  })

  it('不加 new 呼叫 Date() 回傳字串；Date.now／Date.UTC 照常', () => {
    expect(typeof Date()).toBe('string')
    expect(typeof Date.now()).toBe('number')
    expect(Date.UTC(2026, 9, 21)).toBe(NativeDate.UTC(2026, 9, 21))
  })
})

describe('啟用條件', () => {
  it('不強制時：裝置已是 UTC+8 就不替換，否則替換', () => {
    // 已安裝的狀態下再呼叫一律回傳 true；這裡直接檢查判斷函式在原生物件上的結果
    const expected = new NativeDateTimeFormat().resolvedOptions().timeZone === 'Asia/Taipei' ||
      [0, 6].every(m => new NativeDate(2026, m, 1).getTimezoneOffset() === -480)
    expect(deviceMatchesBusinessTime(NativeDate, NativeDateTimeFormat)).toBe(expected)
  })

  it('不傳參數時檢查目前的全域 Date／Intl（此檔已強制啟用台灣時間，因此視為已是台灣時間）', () => {
    expect(deviceMatchesBusinessTime()).toBe(true)
  })

  it('裝置時區名稱就是 Asia/Taipei 時直接視為相同，不必再比對時差', () => {
    function TaipeiFormat() {
      return { resolvedOptions: () => ({ timeZone: 'Asia/Taipei' }) }
    }
    const UtcLikeDate = function () {}
    expect(deviceMatchesBusinessTime(UtcLikeDate, TaipeiFormat)).toBe(true)
  })

  it('沒有 Intl 時改看冬夏時差：都是 −480 分鐘才視為台灣時間', () => {
    const fixedOffset = offset =>
      class extends NativeDate {
        getTimezoneOffset() {
          return offset
        }
      }
    expect(deviceMatchesBusinessTime(fixedOffset(-480), null)).toBe(true)
    expect(deviceMatchesBusinessTime(fixedOffset(-540), null)).toBe(false)
  })

  it('建構子工廠可獨立使用，不需替換全域', () => {
    const LocalDate = createBusinessDate(NativeDate)
    expect(iso(new LocalDate(2026, 9, 21))).toBe('2026-10-20T16:00:00.000Z')
    const Fmt = createBusinessDateTimeFormat(NativeDateTimeFormat)
    expect(new Fmt('en-US').resolvedOptions().timeZone).toBe('Asia/Taipei')
  })
})
