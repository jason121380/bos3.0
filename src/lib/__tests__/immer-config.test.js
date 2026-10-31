import produce from 'immer'
import { immerAutoFreezeFor } from '../immer-config'

// 為什麼重要：immer 7→9 升版後預設改為「正式環境也凍結 produce 結果」。全站 123 檔用 produce，正式環境多出凍結
// 會讓任何「produce 之後又直接改結果」的既有寫法拋錯。這些測試守住：①正式環境不凍結（與 immer 7 相同，升版不新增拋錯路徑）；
// ②開發／測試照舊凍結，直接改 produce 結果會立刻被抓到，不會等到正式環境才發現。

test('正式環境不凍結、其他環境凍結（與 immer 7 的預設相同）', () => {
  expect(immerAutoFreezeFor('production')).toBe(false)
  expect(immerAutoFreezeFor('development')).toBe(true)
  expect(immerAutoFreezeFor('test')).toBe(true)
  expect(immerAutoFreezeFor(undefined)).toBe(true)
})

test('測試環境下 produce 的結果是凍結的：直接修改會拋錯（開發時能抓到錯誤寫法）', () => {
  const next = produce({ list: [{ n: 1 }] }, draft => {
    draft.list.push({ n: 2 })
  })
  expect(Object.isFrozen(next)).toBe(true)
  expect(Object.isFrozen(next.list[0])).toBe(true)
  expect(() => {
    next.list[0].n = 9
  }).toThrow()
})
