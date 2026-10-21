import { __resetThemeModeForTest, applyStoredTheme, readStoredTheme, switchThemeByUser, syncThemeFromServer } from '../theme-mode'

// 為什麼重要：深色使用者每次開頁原本先看到淺色（要等後端個人資料），切換深色模式要整頁重新整理約 3 秒。
// 改為記住主題、開頁即套用、切換立即生效；這些測試守住「不閃、不被舊值蓋回、失敗會還原、不同使用者不互相影響」。

// setupTests 的 localStorage 假物件會把值再 JSON.stringify 一次（與瀏覽器不同），本檔改用與瀏覽器一致的存取
// （CRA 的 resetMocks 會在每個測試前清掉 mock 實作，所以在 beforeEach 設定）
const realStore = new Map()
beforeEach(() => {
  realStore.clear()
  jest.spyOn(window.localStorage, 'getItem').mockImplementation(key => (realStore.has(key) ? realStore.get(key) : null))
  jest.spyOn(window.localStorage, 'setItem').mockImplementation((key, value) => realStore.set(key, String(value)))
})
afterAll(() => jest.restoreAllMocks())

const isDark = () => document.documentElement.classList.contains('dark')
const colorMode = () => document.documentElement.getAttribute('data-color-mode')
const login = id => localStorage.setItem('user', JSON.stringify({ id }))

beforeEach(() => {
  __resetThemeModeForTest()
  document.documentElement.classList.remove('dark')
  document.documentElement.removeAttribute('data-color-mode')
  login('u1')
})

test('開頁時套用此使用者上次的主題（不等後端）', () => {
  localStorage.setItem('bosTheme:u1', 'DARK')
  expect(applyStoredTheme()).toBe('DARK')
  expect(isDark()).toBe(true)
  expect(colorMode()).toBe('dark')
})

test('沒有記憶時不改變畫面，等後端', () => {
  expect(applyStoredTheme()).toBeNull()
  expect(isDark()).toBe(false)
})

test('後端回來的主題會套用並記住，下次開頁直接用', () => {
  syncThemeFromServer('DARK')
  expect(isDark()).toBe(true)
  expect(readStoredTheme()).toBe('DARK')
  syncThemeFromServer('DEFAULT')
  expect(isDark()).toBe(false)
  expect(readStoredTheme()).toBe('DEFAULT')
})

test('不同使用者的主題分開記憶（同一台電腦多人共用）', () => {
  syncThemeFromServer('DARK')
  login('u2')
  expect(readStoredTheme()).toBeNull()
  login('u1')
  expect(readStoredTheme()).toBe('DARK')
})

test('按下切換立即套用；存檔中後端舊值不會蓋回；存檔成功維持新主題', () => {
  syncThemeFromServer('DEFAULT')
  const settle = switchThemeByUser('DARK')
  expect(isDark()).toBe(true)
  syncThemeFromServer('DEFAULT') // 存檔完成前，其他查詢帶回的舊值
  expect(isDark()).toBe(true)
  settle(true)
  expect(isDark()).toBe(true)
  expect(readStoredTheme()).toBe('DARK')
})

test('存檔失敗還原為原本的主題', () => {
  syncThemeFromServer('DEFAULT')
  const settle = switchThemeByUser('DARK')
  settle(false)
  expect(isDark()).toBe(false)
  expect(readStoredTheme()).toBe('DEFAULT')
})

test('未知的主題值不處理', () => {
  syncThemeFromServer('PURPLE')
  expect(isDark()).toBe(false)
  expect(readStoredTheme()).toBeNull()
})
