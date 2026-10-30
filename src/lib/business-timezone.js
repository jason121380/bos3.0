// 營業時區：整個前端一律以台灣時間（Asia/Taipei，UTC+8，無日光節約）計算與顯示日期時間。
//
// 為什麼：全站約 300 處以 date-fns 的 startOfDay／endOfMonth 等算查詢區間、約 360 處以 format 顯示時間，
// 全部依「裝置時區」運作。裝置不在台灣時區（出國、時區設錯）時，報表會查錯時段（例如洛杉磯的「今天」
// 查的是台灣昨天下午到今天中午），打資料也會記到錯的日期。
//
// 作法：App 載入時把全域 Date 換成「本地欄位一律以 UTC+8 解讀」的版本，並讓 Intl.DateTimeFormat 預設用台灣時區。
// 既有的 date-fns、日期選擇器與所有顯示因此自動以台灣時間運作，不必逐處改寫。
// - 時間戳記（getTime、toISOString、JSON）完全不變：送給後端的仍是同一個絕對時間，只是「算成哪一天、顯示幾點」改以台灣為準。
// - 裝置本來就在 UTC+8 且無日光節約（台灣、香港、新加坡等）時完全不替換，行為與原本一模一樣。
// - 台灣自 1980 年起無日光節約，固定 +8 小時即可；1979 年以前的歷史時間在海外裝置上會以 +8 計（不影響營運資料）。

export const BUSINESS_TIME_ZONE = 'Asia/Taipei'
const OFFSET_MINUTES = 8 * 60
const OFFSET_MS = OFFSET_MINUTES * 60 * 1000
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pad = (n, length = 2) => String(n).padStart(length, '0')
// 無時區的「年[-/]月[-/]日[ 或 T 時:分[:秒[.小數]]]」
const WALL_CLOCK_TEXT = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:(?:T|\s+)(\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?)?$/
const withBusinessZone = options => (options && options.timeZone ? options : { ...(options || {}), timeZone: BUSINESS_TIME_ZONE })

// 裝置時區是否已等同營業時區（UTC+8 且冬夏都不變）；須在替換前呼叫
export function deviceMatchesBusinessTime(OrigDate = Date, OrigDateTimeFormat = Intl.DateTimeFormat) {
  try {
    if (new OrigDateTimeFormat().resolvedOptions().timeZone === BUSINESS_TIME_ZONE) return true
  } catch (e) {
    // 不支援 Intl 時改看時差
  }
  const year = new OrigDate().getFullYear()
  return [0, 6].every(month => new OrigDate(year, month, 1).getTimezoneOffset() === -OFFSET_MINUTES)
}

// 建立「本地時間＝台灣時間」的 Date 建構子
export function createBusinessDate(OrigDate) {
  const proto = OrigDate.prototype
  const timeOf = date => proto.getTime.call(date)
  // 以 UTC 欄位表示台灣當地時間的輔助 Date（例如台灣 10/21 01:30 → 其 UTC 欄位就是 10/21 01:30）
  const wallClock = date => new OrigDate(timeOf(date) + OFFSET_MS)

  // 字串解析：只有日期的 ISO（2026-10-21、2026-10、2026）依規格以 UTC 解析、有明確時區的字串照原樣解析；
  // 其餘（2026/10/21 10:00、2026-10-21T10:00…）原本以「裝置本地時間」解讀，改為以台灣時間解讀
  function parse(value) {
    const text = String(value).trim()
    if (/^[+-]?\d{4,6}(-\d{2}(-\d{2})?)?$/.test(text) || /(\d\s?(Z|[+-]\d{2}:?\d{2})$)|\b(GMT|UTC)\b/i.test(text)) {
      return OrigDate.parse(text)
    }
    // 是否為有效日期仍以原生解析判斷（無效字串照樣回 NaN）
    const native = OrigDate.parse(text)
    if (isNaN(native)) return NaN
    // 常見的年月日（時分秒）格式直接取字面欄位：若先以裝置時間解析，裝置日光節約跳過的那一小時會被平移
    const wall = WALL_CLOCK_TEXT.exec(text)
    if (wall) {
      const [, y, mo, d, h = 0, mi = 0, sec = 0, frac] = wall
      const ms = frac ? Number((frac + '00').slice(0, 3)) : 0
      return OrigDate.UTC(+y, mo - 1, +d, +h, +mi, +sec, ms) - OFFSET_MS
    }
    // 其他格式（如 'Oct 21, 2026 10:00'）只能先經裝置解析再取欄位
    const device = new OrigDate(native)
    return (
      OrigDate.UTC(
        proto.getFullYear.call(device),
        proto.getMonth.call(device),
        proto.getDate.call(device),
        proto.getHours.call(device),
        proto.getMinutes.call(device),
        proto.getSeconds.call(device),
        proto.getMilliseconds.call(device)
      ) - OFFSET_MS
    )
  }

  function BusinessDate(...args) {
    // 不加 new 呼叫 Date() 時與原生相同，回傳目前時間的字串
    if (!new.target) return BusinessDate.prototype.toString.call(new BusinessDate())
    let value
    if (args.length === 0) {
      value = OrigDate.now()
    } else if (args.length === 1) {
      const arg = args[0]
      value = typeof arg === 'string' ? parse(arg) : arg instanceof OrigDate ? timeOf(arg) : arg
    } else {
      // new Date(年, 月, 日, 時, 分, 秒, 毫秒)：以台灣時間解讀；省略的欄位與原生相同（日＝1，其餘＝0）
      const parts = [
        args[0],
        args[1],
        args.length > 2 ? args[2] : 1,
        args.length > 3 ? args[3] : 0,
        args.length > 4 ? args[4] : 0,
        args.length > 5 ? args[5] : 0,
        args.length > 6 ? args[6] : 0,
      ]
      value = OrigDate.UTC(...parts) - OFFSET_MS
    }
    const instance = new OrigDate(value)
    Object.setPrototypeOf(instance, new.target.prototype)
    return instance
  }

  BusinessDate.prototype = Object.create(proto, {
    constructor: { value: BusinessDate, writable: true, configurable: true },
  })
  Object.setPrototypeOf(BusinessDate, OrigDate) // 繼承 Date.now、Date.UTC
  Object.defineProperty(BusinessDate, 'name', { value: 'Date' })
  Object.defineProperty(BusinessDate, 'parse', { value: parse, writable: true, configurable: true })
  // 由其他程式（替換前載入的套件）建立的原生 Date 也要視為 Date
  Object.defineProperty(BusinessDate, Symbol.hasInstance, { value: candidate => candidate instanceof OrigDate })

  const define = (name, fn) => Object.defineProperty(BusinessDate.prototype, name, { value: fn, writable: true, configurable: true })

  const getters = {
    getFullYear: 'getUTCFullYear',
    getMonth: 'getUTCMonth',
    getDate: 'getUTCDate',
    getDay: 'getUTCDay',
    getHours: 'getUTCHours',
    getMinutes: 'getUTCMinutes',
    getSeconds: 'getUTCSeconds',
    getMilliseconds: 'getUTCMilliseconds',
  }
  Object.entries(getters).forEach(([local, utc]) => {
    define(local, function () {
      return proto[utc].call(wallClock(this))
    })
  })
  // getYear 是所有支援的瀏覽器都有的舊式 API（ECMAScript Annex B），原本「沒有 getYear」的分支跑不到，2026/10/22 經 Jason 同意刪除
  define('getYear', function () {
    const year = this.getFullYear()
    return isNaN(year) ? NaN : year - 1900
  })
  define('getTimezoneOffset', function () {
    return isNaN(timeOf(this)) ? NaN : -OFFSET_MINUTES
  })

  const setters = {
    setFullYear: 'setUTCFullYear',
    setMonth: 'setUTCMonth',
    setDate: 'setUTCDate',
    setHours: 'setUTCHours',
    setMinutes: 'setUTCMinutes',
    setSeconds: 'setUTCSeconds',
    setMilliseconds: 'setUTCMilliseconds',
  }
  Object.entries(setters).forEach(([local, utc]) => {
    define(local, function (...args) {
      const time = timeOf(this)
      // 與原生相同：無效日期上的 setHours 等回傳 NaN 且不變；setFullYear 則以 1970-01-01 00:00（本地）為基準
      if (isNaN(time) && local !== 'setFullYear') return NaN
      const shifted = new OrigDate(isNaN(time) ? 0 : time + OFFSET_MS)
      proto[utc].apply(shifted, args)
      return proto.setTime.call(this, timeOf(shifted) - OFFSET_MS)
    })
  })

  const yearText = year => (year >= 0 ? pad(year, 4) : `-${pad(-year, 6)}`)
  const dateText = date => {
    const w = wallClock(date)
    return `${WEEKDAYS[w.getUTCDay()]} ${MONTHS[w.getUTCMonth()]} ${pad(w.getUTCDate())} ${yearText(w.getUTCFullYear())}`
  }
  const timeText = date => {
    const w = wallClock(date)
    return `${pad(w.getUTCHours())}:${pad(w.getUTCMinutes())}:${pad(w.getUTCSeconds())} GMT+0800 (Taipei Standard Time)`
  }
  define('toString', function () {
    return isNaN(timeOf(this)) ? 'Invalid Date' : `${dateText(this)} ${timeText(this)}`
  })
  define('toDateString', function () {
    return isNaN(timeOf(this)) ? 'Invalid Date' : dateText(this)
  })
  define('toTimeString', function () {
    return isNaN(timeOf(this)) ? 'Invalid Date' : timeText(this)
  })
  ;['toLocaleString', 'toLocaleDateString', 'toLocaleTimeString'].forEach(name => {
    define(name, function (locales, options) {
      return proto[name].call(this, locales, withBusinessZone(options))
    })
  })

  return BusinessDate
}

// Intl.DateTimeFormat 未指定時區時預設台灣（與替換後的 Date 一致）
export function createBusinessDateTimeFormat(OrigDateTimeFormat) {
  function BusinessDateTimeFormat(locales, options) {
    return new OrigDateTimeFormat(locales, withBusinessZone(options))
  }
  BusinessDateTimeFormat.prototype = OrigDateTimeFormat.prototype
  BusinessDateTimeFormat.supportedLocalesOf = (...args) => OrigDateTimeFormat.supportedLocalesOf(...args)
  return BusinessDateTimeFormat
}

/* global globalThis */ // ES2020 全域（Vite 目標 Safari 14／Chrome 87 以上皆支援）
let installed = false
let deviceTimeZone = null

// 替換全域 Date／Intl.DateTimeFormat；裝置已是 UTC+8 時不替換（force 供測試用）。回傳是否已替換。
export function installBusinessTimeZone({ force = false, target = globalThis } = {}) {
  if (installed) return true
  try {
    deviceTimeZone = new target.Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch (e) {
    deviceTimeZone = null
  }
  if (!force && deviceMatchesBusinessTime(target.Date, target.Intl && target.Intl.DateTimeFormat)) return false
  target.Date = createBusinessDate(target.Date)
  if (target.Intl && target.Intl.DateTimeFormat) {
    target.Intl.DateTimeFormat = createBusinessDateTimeFormat(target.Intl.DateTimeFormat)
  }
  installed = true
  return true
}

// 是否因裝置時區不同而啟用了台灣時間換算（介面據此提示使用者）
export const isBusinessTimeZoneInstalled = () => installed
// 替換前偵測到的裝置時區名稱（例如 America/Los_Angeles）
export const getDeviceTimeZone = () => deviceTimeZone
