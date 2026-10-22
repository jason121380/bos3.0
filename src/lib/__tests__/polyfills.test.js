import { structuredCloneFallback } from '../polyfills'

// 為什麼重要：移除整包 core-js 後，Safari 15.4 以前沒有 structuredClone；系統參數「預約時段」用它複製設定再修改，
// 若複製不是深層的，修改會直接改到原本的 state（React 偵測不到變化、畫面不更新或改錯資料）。

test('深層複製：修改複本不影響原資料', () => {
  const original = [{ title: '平日', openingHours: '10:00:00', useDay: ['MON', 'TUE'] }]
  const copy = structuredCloneFallback(original)
  copy[0].title = '假日'
  copy[0].useDay.push('SUN')
  expect(original[0].title).toBe('平日')
  expect(original[0].useDay).toEqual(['MON', 'TUE'])
  expect(copy).not.toBe(original)
  expect(copy[0].useDay).toEqual(['MON', 'TUE', 'SUN'])
})

test('Date、Map、Set 與循環參照', () => {
  const d = new Date(2026, 9, 21)
  const obj = { d, m: new Map([['a', { n: 1 }]]), s: new Set([1, 2]) }
  obj.self = obj
  const copy = structuredCloneFallback(obj)
  expect(copy.d).not.toBe(d)
  expect(copy.d.getTime()).toBe(d.getTime())
  expect(copy.m.get('a')).toEqual({ n: 1 })
  expect(copy.m.get('a')).not.toBe(obj.m.get('a'))
  expect([...copy.s]).toEqual([1, 2])
  expect(copy.self).toBe(copy)
})

test('全域 structuredClone 可用（瀏覽器原生或補上的版本）', () => {
  expect(typeof window.structuredClone).toBe('function')
})

// 瀏覽器已有原生 structuredClone 時必須用原生的（支援更多型別、效能較好），不可被簡易版蓋掉
test('已有原生 structuredClone 時不覆蓋；沒有時才補上', () => {
  const saved = window.structuredClone
  const native = jest.fn()
  try {
    window.structuredClone = native
    jest.isolateModules(() => require('../polyfills'))
    expect(window.structuredClone).toBe(native)

    delete window.structuredClone
    let fallback
    jest.isolateModules(() => {
      fallback = require('../polyfills').structuredCloneFallback
    })
    expect(window.structuredClone).toBe(fallback)
  } finally {
    window.structuredClone = saved
  }
})
