// 保護什麼：本系統不使用 service worker（離線快取會讓使用者一直看到舊版）。入口檔只呼叫 unregister：
// 瀏覽器支援時把已安裝的舊版移除；不支援時什麼都不做、不拋錯。
// （register 等其餘 CRA 樣板函式全站沒有呼叫，2026/10/22 已刪除，只留 unregister。）
import { unregister } from '../serviceWorker'

afterEach(() => {
  delete navigator.serviceWorker
})

it('支援 service worker 時移除已安裝的註冊', async () => {
  const registration = { unregister: jest.fn() }
  Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { ready: Promise.resolve(registration) } })
  unregister()
  await Promise.resolve()
  await Promise.resolve()
  expect(registration.unregister).toHaveBeenCalledTimes(1)
})

it('瀏覽器不支援 service worker 時不動作、不拋錯', () => {
  expect('serviceWorker' in navigator).toBe(false)
  expect(() => unregister()).not.toThrow()
})
