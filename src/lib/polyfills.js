/* global globalThis */
// 只補「程式實際用到、而 Safari 14／Chrome 87（Vite 產出的 ES module 最低需求）缺少」的功能。
// 原本整包載入 core-js（react-app-polyfill/stable，入口 chunk 約 194 KB）；2026/10/21 掃描正式 build 後，
// 只有 structuredClone（Safari 15.4 起才有）在程式中直接使用（Parameter/MerchantReservationTimes）。
// 其他新功能（Object.hasOwn、Array.prototype.at 等）在套件內都有先判斷是否支援，不需補。
// 新增使用新版瀏覽器功能時，請先確認 Safari 14 是否支援，不支援就在這裡補。

// structuredClone 簡易版：涵蓋設定資料會出現的型別（基本型別、陣列、一般物件、Date、Map、Set，含循環參照）
function cloneValue(value, seen) {
  if (value === null || typeof value !== 'object') return value
  if (seen.has(value)) return seen.get(value)
  if (value instanceof Date) return new Date(value.getTime())
  if (value instanceof Map) {
    const copy = new Map()
    seen.set(value, copy)
    value.forEach((v, k) => copy.set(cloneValue(k, seen), cloneValue(v, seen)))
    return copy
  }
  if (value instanceof Set) {
    const copy = new Set()
    seen.set(value, copy)
    value.forEach(v => copy.add(cloneValue(v, seen)))
    return copy
  }
  if (Array.isArray(value)) {
    const copy = []
    seen.set(value, copy)
    value.forEach((v, i) => {
      copy[i] = cloneValue(v, seen)
    })
    return copy
  }
  const copy = {}
  seen.set(value, copy)
  Object.keys(value).forEach(key => {
    copy[key] = cloneValue(value[key], seen)
  })
  return copy
}

export function structuredCloneFallback(value) {
  return cloneValue(value, new WeakMap())
}

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = structuredCloneFallback
}
