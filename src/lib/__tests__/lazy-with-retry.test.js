import {
  CHUNK_RELOAD_KEY,
  clearChunkReloadFlag,
  installChunkReload,
  isChunkLoadError,
  loadWithRetry,
  reloadOnceForChunkError,
} from '../lazy-with-retry'

describe('部署後 chunk 載入失敗', () => {
  const realLocation = window.location
  let reload

  beforeEach(() => {
    reload = jest.fn()
    delete window.location
    window.location = { reload }
    clearChunkReloadFlag()
  })

  afterEach(() => {
    window.location = realLocation
    clearChunkReloadFlag()
    delete window.__bosChunkReloadInstalled
  })

  it('把 HTML、動態 import 失敗認成舊版 chunk', () => {
    expect(isChunkLoadError(new Error('Failed to fetch dynamically imported module: /assets/orders.js'))).toBe(true)
    expect(isChunkLoadError(new Error('Expected a JavaScript module script but the server responded with a MIME type of "text/html"'))).toBe(true)
    expect(isChunkLoadError(new Error('資料暫時無法載入'))).toBe(false)
  })

  it('第一次失敗重新整理，成功載入後清掉記號，第二次失敗不再自動重整', async () => {
    expect(reloadOnceForChunkError()).toBe(true)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(sessionStorage.getItem(CHUNK_RELOAD_KEY)).toBe('1')

    await expect(loadWithRetry(() => Promise.resolve({ default: function Page() {} }))).resolves.toEqual({
      default: expect.any(Function),
    })
    expect(sessionStorage.getItem(CHUNK_RELOAD_KEY)).toBeNull()

    const hung = loadWithRetry(() => Promise.reject(new Error('Failed to fetch dynamically imported module')))
    let settled = false
    hung.then(
      () => {
        settled = true
      },
      () => {
        settled = true
      }
    )
    await Promise.resolve()
    await Promise.resolve()
    expect(reload).toHaveBeenCalledTimes(2)
    expect(settled).toBe(false)

    await expect(loadWithRetry(() => Promise.reject(new Error('Failed to fetch dynamically imported module')))).rejects.toThrow(
      /dynamically imported module/
    )
    expect(reload).toHaveBeenCalledTimes(2)
  })

  it('vite:preloadError 只觸發一次重新整理', () => {
    installChunkReload()
    window.dispatchEvent(new Event('vite:preloadError'))
    window.dispatchEvent(new Event('vite:preloadError'))
    expect(reload).toHaveBeenCalledTimes(1)
  })
})
