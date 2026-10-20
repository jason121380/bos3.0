// 打帳單「鎖定日期」的每日解除時間：23:59（與原 node-schedule 排程 '* 59 23 * * *' 同一分鐘）
export const UNLOCK_HOUR = 23
export const UNLOCK_MINUTE = 59

// 距離下一次解除的毫秒數。
// initial 為 true（頁面剛開啟）且現在正處於 23:59 這一分鐘時回傳 0，立即解除——原排程在這一分鐘內每秒都會觸發；
// 解除後再排下一次時 initial 為 false，一律排到隔天 23:59，避免在同一分鐘內反覆執行。
export function msUntilDailyUnlock(now, initial = false) {
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), UNLOCK_HOUR, UNLOCK_MINUTE, 0, 0)
  if (now >= target) {
    if (initial) return 0
    target.setDate(target.getDate() + 1)
  }
  return target.getTime() - now.getTime()
}
