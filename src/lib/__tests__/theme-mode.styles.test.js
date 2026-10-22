// 為什麼重要：深淺色切換免重新整理，靠的是把舊版全域樣式（initialize／initialize-dark.scss）以字串放進同一個 <style>、切換時替換內容。
// 守住：①只有一個 <style>，切換是替換內容而不是疊加（兩套舊版樣式同時存在會互相覆蓋、畫面錯亂）；
// ②連續快速切換時以最後一次為準（較早的樣式字串晚到也不可蓋回去）；
// ③樣式載入失敗（離線）時保留目前樣式，下次切換同一主題會重新載入，而不是以為已套用而跳過。
// 單元測試平常不載入樣式字串（NODE_ENV=test 時略過），這裡暫時以正式環境的流程執行；樣式字串以虛擬模組代替（與 Vite 的 ?inline 相同，default 為 CSS 字串）。

const mockStyleLoad = { darkFails: false }
jest.mock('../../initialize-dark.scss?inline', () => {
  if (mockStyleLoad.darkFails) throw new Error('offline')
  return { __esModule: true, default: '/* dark legacy styles */' }
}, { virtual: true })
jest.mock('../../initialize.scss?inline', () => ({ __esModule: true, default: '/* light legacy styles */' }), { virtual: true })

const originalNodeEnv = process.env.NODE_ENV
let themeMode
beforeEach(() => {
  mockStyleLoad.darkFails = false
  process.env.NODE_ENV = 'production'
  // resetModules 也清掉虛擬樣式模組的快取，讓每個測試重新載入（模擬「這次載入失敗」）
  jest.resetModules()
  themeMode = require('../theme-mode')
  document.getElementById('legacy-theme-style')?.remove()
  document.documentElement.classList.remove('dark')
})
afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv
})

const legacyStyleElements = () => document.querySelectorAll('#legacy-theme-style')
const flush = () => new Promise(resolve => setTimeout(resolve, 0))

test('切換主題時替換同一個 <style> 的內容，不疊加', async () => {
  themeMode.syncThemeFromServer('DARK')
  await flush()
  expect(legacyStyleElements()).toHaveLength(1)
  expect(legacyStyleElements()[0].textContent).toBe('/* dark legacy styles */')

  themeMode.switchThemeByUser('DEFAULT')(true)
  await flush()
  expect(legacyStyleElements()).toHaveLength(1)
  expect(legacyStyleElements()[0].textContent).toBe('/* light legacy styles */')
})

test('連續快速切換：以最後一次為準，較早的樣式晚到也不會蓋回', async () => {
  themeMode.syncThemeFromServer('DEFAULT')
  themeMode.switchThemeByUser('DARK')
  themeMode.switchThemeByUser('DEFAULT')
  await flush()
  expect(document.documentElement.classList.contains('dark')).toBe(false)
  expect(legacyStyleElements()[0].textContent).toBe('/* light legacy styles */')
})

test('同一主題再次同步（後端回來的值與記憶相同）：不重新載入樣式', async () => {
  themeMode.syncThemeFromServer('DARK')
  await flush()
  legacyStyleElements()[0].textContent = '/* 已套用 */'
  themeMode.syncThemeFromServer('DARK')
  await flush()
  expect(legacyStyleElements()[0].textContent).toBe('/* 已套用 */')
})

test('樣式載入失敗（離線）：保留目前樣式；恢復後再切到同一主題會重新載入', async () => {
  themeMode.syncThemeFromServer('DEFAULT')
  await flush()
  mockStyleLoad.darkFails = true
  themeMode.switchThemeByUser('DARK')
  await flush()
  expect(legacyStyleElements()[0].textContent).toBe('/* light legacy styles */')

  mockStyleLoad.darkFails = false
  themeMode.switchThemeByUser('DARK')
  await flush()
  expect(legacyStyleElements()[0].textContent).toBe('/* dark legacy styles */')
})
