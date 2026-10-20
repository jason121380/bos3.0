import { msUntilDailyUnlock } from '../dailyUnlock'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE

// 為什麼重要：櫃台會鎖定帳單日期（例如補登昨天的帳），鎖定必須在每天 23:59 自動解除，
// 否則隔天開出的帳單會記到錯誤日期。原本用 node-schedule 在 render 中排程，每次按鍵都多一個永不取消的排程。
describe('msUntilDailyUnlock：每天 23:59 解除鎖定日期', () => {
  it('白天開啟頁面：排到當天 23:59', () => {
    expect(msUntilDailyUnlock(new Date(2026, 9, 20, 10, 0, 0), true)).toBe(13 * HOUR + 59 * MINUTE)
  })

  it('剛過午夜：排到當天（新的一天）23:59，不會跳過一天', () => {
    expect(msUntilDailyUnlock(new Date(2026, 9, 21, 0, 0, 10), true)).toBe(23 * HOUR + 59 * MINUTE - 10 * 1000)
  })

  it('頁面在 23:59 這一分鐘內開啟：立即解除（與原排程在這一分鐘內會觸發一致）', () => {
    expect(msUntilDailyUnlock(new Date(2026, 9, 20, 23, 59, 30), true)).toBe(0)
  })

  it('解除後再排下一次：排到隔天 23:59，不會在同一分鐘內反覆觸發', () => {
    expect(msUntilDailyUnlock(new Date(2026, 9, 20, 23, 59, 0, 5), false)).toBe(24 * HOUR - 5)
  })

  it('跨月：10/31 解除後下一次是 11/1 23:59', () => {
    const now = new Date(2026, 9, 31, 23, 59, 1)
    const next = new Date(now.getTime() + msUntilDailyUnlock(now, false))
    expect([next.getMonth(), next.getDate(), next.getHours(), next.getMinutes()]).toEqual([10, 1, 23, 59])
  })
})
