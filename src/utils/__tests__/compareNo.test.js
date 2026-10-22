// 保護：下拉選項依代號排序（utils/compareNo）。櫃台習慣依代號找品項／員工，英數代號也要排得出順序，
// 沒有代號的排最後（Jason 2026/10/22 fix all：原本 a.no - b.no 對英數代號無效）。
import compareNo from 'utils/compareNo'

const sortNos = list => [...list].sort(compareNo)

describe('compareNo', () => {
  it('純數字代號依數值排序（2 在 10 前）', () => {
    expect(sortNos(['10', '2', '1'])).toEqual(['1', '2', '10'])
  })

  it('英數代號依自然順序（A2 在 A10 前、A 開頭在 B 開頭前）', () => {
    expect(sortNos(['B02', 'A10', 'A2', 'A01'])).toEqual(['A01', 'A2', 'A10', 'B02'])
  })

  it('沒有代號（null、undefined、空字串、只有空白）排最後，彼此維持原順序', () => {
    expect(sortNos([null, 'B', '', '  ', undefined, 'A'])).toEqual(['A', 'B', null, '', '  ', undefined])
    expect(compareNo(null, '')).toBe(0)
    expect(compareNo('A', null)).toBeLessThan(0)
    expect(compareNo(null, 'A')).toBeGreaterThan(0)
  })

  it('數字型別的代號也可以比較', () => {
    expect(sortNos([10, 2, '3'])).toEqual([2, '3', 10])
  })
})
