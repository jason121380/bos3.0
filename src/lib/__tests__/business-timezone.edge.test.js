// 保護什麼：台灣時間換算（lib/business-timezone）的兩個邊界：
// - 西元前（負數年）的 toString 與原生格式相同（年份以 -00xxxx 六位數表示），不會印出錯誤的年份。
// - 執行環境沒有 Intl（極舊瀏覽器或精簡環境）時仍能替換 Date，不因少了 Intl.DateTimeFormat 而拋錯。
import { createBusinessDate } from '../business-timezone'

describe('負數年份的 toString', () => {
  it('西元前 1000 年 1 月 1 日顯示 -001000（與原生 Date 的格式一致）', () => {
    const BusinessDate = createBusinessDate(Date)
    const d = new BusinessDate(Date.UTC(-1000, 0, 1, 4, 0))
    expect(d.toString()).toMatch(/^\w{3} Jan 01 -001000 12:00:00 GMT\+0800/)
    expect(d.toDateString()).toMatch(/^\w{3} Jan 01 -001000$/)
  })
})

describe('沒有 Intl 的環境', () => {
  it('force 時只替換 Date，不碰不存在的 Intl；裝置時區記為 null', () => {
    jest.isolateModules(() => {
      const { installBusinessTimeZone, getDeviceTimeZone, isBusinessTimeZoneInstalled } = require('../business-timezone')
      const target = { Date }
      expect(installBusinessTimeZone({ force: true, target })).toBe(true)
      expect(target.Date).not.toBe(Date)
      expect(target.Intl).toBeUndefined()
      expect(getDeviceTimeZone()).toBeNull()
      expect(isBusinessTimeZoneInstalled()).toBe(true)
      // 全域 Date 不受影響
      expect(global.Date).toBe(Date)
    })
  })
})
