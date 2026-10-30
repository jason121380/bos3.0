// 部署後舊頁面還握著上一版的 chunk 網址。伺服器對找不到的 js 回傳 index.html（200），
// 動態 import 會失敗，頁面錯誤邊界顯示「這個頁面發生錯誤」。這裡只自動重新整理一次，
// 讓瀏覽器改載新的 index 與新的 chunk；第二次仍失敗就交給錯誤邊界，避免無限重整。
import { lazy } from 'react'

export const CHUNK_RELOAD_KEY = 'bos.chunk-reload'

const CHUNK_ERROR =
  /ChunkLoadError|Loading chunk|Loading CSS chunk|dynamically imported module|module script failed|Importing a module script failed|text\/html|Unexpected token\s*['"]?</i

export function isChunkLoadError(error) {
  const text = [error && error.name, error && error.message, error && error.toString && error.toString()].filter(Boolean).join(' ')
  return CHUNK_ERROR.test(text)
}

export function clearChunkReloadFlag() {
  try {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY)
  } catch (e) {
    // 忽略
  }
}

export function reloadOnceForChunkError() {
  try {
    if (sessionStorage.getItem(CHUNK_RELOAD_KEY) === '1') return false
    sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
  } catch (e) {
    return false
  }
  const reload = window.location && window.location.reload
  if (typeof reload !== 'function') {
    clearChunkReloadFlag()
    return false
  }
  try {
    reload.call(window.location)
  } catch (e) {
    clearChunkReloadFlag()
    return false
  }
  return true
}

export function loadWithRetry(importer) {
  return importer()
    .then(mod => {
      clearChunkReloadFlag()
      return mod
    })
    .catch(error => {
      if (isChunkLoadError(error) && reloadOnceForChunkError()) {
        return new Promise(() => {})
      }
      throw error
    })
}

export function lazyWithRetry(importer) {
  return lazy(() => loadWithRetry(importer))
}

export function installChunkReload() {
  if (typeof window === 'undefined' || window.__bosChunkReloadInstalled) return
  window.__bosChunkReloadInstalled = true
  window.addEventListener('vite:preloadError', event => {
    if (event && typeof event.preventDefault === 'function') event.preventDefault()
    reloadOnceForChunkError()
  })
}
