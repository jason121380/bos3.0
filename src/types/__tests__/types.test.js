// 保護什麼：types 的性別顯示文字（客戶列表、客資篩選匯出共用）；由 types/index 統一匯出，頁面以 import { gender } from 'types' 取用。
import { gender } from 'types'
import * as enums from '../enums'

it('性別代碼對應中文，且 types 入口與 enums 為同一份', () => {
  expect(gender).toEqual({ MALE: '男', FEMALE: '女', UNKNOWN: '未知' })
  expect(gender).toBe(enums.gender)
})
