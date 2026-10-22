// 為什麼重要：src/index.js 最早載入 install-business-timezone，決定整個 App 的日期是否改以台灣時間計算。
// 守住啟用條件：裝置已是台灣時間（UTC+8、無日光節約）時完全不替換（行為與原本一模一樣）；
// 海外裝置一定要替換（否則報表查錯時段、帳單記到錯的日期）；偵測不到 Intl 時改看時差、不可拋錯讓 App 開不起來；
// 記下替換前的裝置時區名稱（介面據此提示「已改用台灣時間」）。
// 安裝狀態是模組變數，每個測試以 isolateModules 重新載入；全域 Date／Intl 只在最後一個測試動到，結束後還原。

const NativeDate = Date
const NativeDateTimeFormat = Intl.DateTimeFormat

const loadFresh = () => {
  let mod
  jest.isolateModules(() => {
    mod = require('../business-timezone')
  })
  return mod
}

// 時差固定的 Date（不受執行測試的機器時區影響）
const dateWithOffset = offsetMinutes =>
  class extends NativeDate {
    getTimezoneOffset() {
      return offsetMinutes
    }
  }
// 回報指定時區名稱的 Intl.DateTimeFormat
const formatReporting = timeZone => {
  function FakeDateTimeFormat() {
    return { resolvedOptions: () => ({ timeZone }) }
  }
  FakeDateTimeFormat.supportedLocalesOf = () => []
  return FakeDateTimeFormat
}

describe('installBusinessTimeZone：啟用條件', () => {
  it('裝置時區是 Asia/Taipei：不替換，記下裝置時區', () => {
    const bt = loadFresh()
    const target = { Date: dateWithOffset(-480), Intl: { DateTimeFormat: formatReporting('Asia/Taipei') } }
    const OriginalDate = target.Date
    expect(bt.installBusinessTimeZone({ target })).toBe(false)
    expect(target.Date).toBe(OriginalDate)
    expect(bt.isBusinessTimeZoneInstalled()).toBe(false)
    expect(bt.getDeviceTimeZone()).toBe('Asia/Taipei')
  })

  it('海外裝置（洛杉磯）：替換 Date 與 Intl.DateTimeFormat，之後再呼叫不會重複包裝', () => {
    const bt = loadFresh()
    const target = { Date: dateWithOffset(420), Intl: { DateTimeFormat: formatReporting('America/Los_Angeles') } }
    expect(bt.installBusinessTimeZone({ target })).toBe(true)
    expect(bt.isBusinessTimeZoneInstalled()).toBe(true)
    expect(bt.getDeviceTimeZone()).toBe('America/Los_Angeles')
    // 換上的 Date 以台灣時間解讀年月日
    expect(NativeDate.prototype.toISOString.call(new target.Date(2026, 9, 21))).toBe('2026-10-20T16:00:00.000Z')
    const InstalledDate = target.Date
    expect(bt.installBusinessTimeZone({ target })).toBe(true)
    expect(target.Date).toBe(InstalledDate)
  })

  it('裝置時區名稱讀不到（空值）時記為 null，仍依時差判斷', () => {
    const bt = loadFresh()
    const target = { Date: dateWithOffset(0), Intl: { DateTimeFormat: formatReporting(undefined) } }
    expect(bt.installBusinessTimeZone({ target })).toBe(true)
    expect(bt.getDeviceTimeZone()).toBeNull()
  })

  it('Intl.DateTimeFormat 無法建立（系統語系資料損壞時會拋 RangeError）：不拋錯，改看時差決定', () => {
    function BrokenDateTimeFormat() {
      throw new RangeError('Incorrect locale information provided')
    }
    const bt = loadFresh()
    const taipeiLike = { Date: dateWithOffset(-480), Intl: { DateTimeFormat: BrokenDateTimeFormat } }
    expect(bt.installBusinessTimeZone({ target: taipeiLike })).toBe(false)
    expect(bt.getDeviceTimeZone()).toBeNull()

    const bt2 = loadFresh()
    const overseas = { Date: dateWithOffset(300), Intl: { DateTimeFormat: BrokenDateTimeFormat } }
    expect(bt2.installBusinessTimeZone({ target: overseas })).toBe(true)
    expect(new overseas.Date(2026, 9, 21).getTimezoneOffset()).toBe(-480)
  })

  it('force：即使裝置已是台灣時間也替換（單元測試用）', () => {
    const bt = loadFresh()
    const target = { Date: dateWithOffset(-480), Intl: { DateTimeFormat: formatReporting('Asia/Taipei') } }
    const OriginalDate = target.Date
    expect(bt.installBusinessTimeZone({ target, force: true })).toBe(true)
    expect(target.Date).not.toBe(OriginalDate)
    expect(NativeDate.prototype.toISOString.call(new target.Date(2026, 9, 21))).toBe('2026-10-20T16:00:00.000Z')
  })
})

describe('install-business-timezone：App 入口載入即生效', () => {
  afterEach(() => {
    global.Date = NativeDate
    Intl.DateTimeFormat = NativeDateTimeFormat
  })

  it('載入後全域日期依裝置時區決定是否改用台灣時間；不論哪一種，「台灣 10/21 00:00」都算得一致', () => {
    let bt
    jest.isolateModules(() => {
      require('../install-business-timezone')
      bt = require('../business-timezone')
    })
    const deviceIsTaipei = bt.deviceMatchesBusinessTime(NativeDate, NativeDateTimeFormat)
    expect(bt.isBusinessTimeZoneInstalled()).toBe(!deviceIsTaipei)
    expect(Date === NativeDate).toBe(deviceIsTaipei)
    expect(bt.getDeviceTimeZone()).toBe(new NativeDateTimeFormat().resolvedOptions().timeZone)
    expect(new Date(2026, 9, 21).toISOString()).toBe('2026-10-20T16:00:00.000Z')
  })
})
