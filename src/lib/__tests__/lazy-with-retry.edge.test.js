// lazy-with-retry 的邊界情況：瀏覽器擋 sessionStorage（無痕／隱私模式）、location.reload 不可用或拋錯時，
// 不可以無限重整，也不可以把頁面卡在永遠不結束的 Promise——一律交回錯誤邊界顯示錯誤畫面。
import React, { Suspense } from 'react'
import { render, screen } from '@testing-library/react'
import {
  CHUNK_RELOAD_KEY,
  clearChunkReloadFlag,
  installChunkReload,
  isChunkLoadError,
  lazyWithRetry,
  loadWithRetry,
  reloadOnceForChunkError,
} from '../lazy-with-retry'

describe('lazy-with-retry 邊界情況', () => {
  const realLocation = window.location

  beforeEach(() => {
    clearChunkReloadFlag()
  })

  afterEach(() => {
    // resetMocks 只清實作、不還原：Storage.prototype 的 spy 要還原，否則之後的 sessionStorage 全回 undefined
    jest.restoreAllMocks()
    window.location = realLocation
    clearChunkReloadFlag()
    delete window.__bosChunkReloadInstalled
  })

  const setLocation = value => {
    delete window.location
    window.location = value
  }

  it('沒有錯誤物件或一般業務錯誤不算 chunk 失敗（不能因此整頁重整）', () => {
    expect(isChunkLoadError(undefined)).toBe(false)
    expect(isChunkLoadError(null)).toBe(false)
    expect(isChunkLoadError({ name: 'ChunkLoadError' })).toBe(true)
    expect(isChunkLoadError({ message: 'Loading CSS chunk 12 failed' })).toBe(true)
  })

  it('sessionStorage 被瀏覽器擋住時不重整（無法記住重整過，重整會變成無限迴圈）', () => {
    const reload = jest.fn()
    setLocation({ reload })
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(reloadOnceForChunkError()).toBe(false)
    expect(reload).not.toHaveBeenCalled()
  })

  it('清除記號時 sessionStorage 拋錯也不影響頁面', () => {
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(() => clearChunkReloadFlag()).not.toThrow()
  })

  it('location.reload 不能用時清掉記號並回報沒重整（下次仍可再試）', () => {
    setLocation({})
    expect(reloadOnceForChunkError()).toBe(false)
    expect(sessionStorage.getItem(CHUNK_RELOAD_KEY)).toBeNull()
  })

  it('location.reload 拋錯時清掉記號並回報沒重整', () => {
    setLocation({
      reload: () => {
        throw new Error('blocked')
      },
    })
    expect(reloadOnceForChunkError()).toBe(false)
    expect(sessionStorage.getItem(CHUNK_RELOAD_KEY)).toBeNull()
  })

  it('不是 chunk 失敗的錯誤照原樣丟給錯誤邊界，不重整', async () => {
    const reload = jest.fn()
    setLocation({ reload })
    await expect(loadWithRetry(() => Promise.reject(new Error('資料格式錯誤')))).rejects.toThrow('資料格式錯誤')
    expect(reload).not.toHaveBeenCalled()
  })

  it('lazyWithRetry 包出的元件可正常載入並渲染', async () => {
    const Page = lazyWithRetry(() => Promise.resolve({ default: () => <div>頁面內容</div> }))
    render(
      <Suspense fallback={<div>載入中</div>}>
        <Page />
      </Suspense>
    )
    expect(await screen.findByText('頁面內容')).toBeInTheDocument()
  })

  it('installChunkReload 只裝一次監聽，並阻止 Vite 預設的錯誤拋出', () => {
    const reload = jest.fn()
    setLocation({ reload })
    const add = jest.spyOn(window, 'addEventListener')
    installChunkReload()
    installChunkReload()
    expect(add.mock.calls.filter(([type]) => type === 'vite:preloadError')).toHaveLength(1)
    const event = new Event('vite:preloadError', { cancelable: true })
    window.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(reload).toHaveBeenCalledTimes(1)
    // 其他來源送來沒有 preventDefault 的事件也不能讓監聽本身拋錯
    const listener = add.mock.calls.find(([type]) => type === 'vite:preloadError')[1]
    expect(() => listener(undefined)).not.toThrow()
  })

  it('沒有 window.location 時不重整也不拋錯', () => {
    setLocation(undefined)
    expect(reloadOnceForChunkError()).toBe(false)
  })
})
