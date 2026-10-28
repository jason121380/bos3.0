import averageOf from 'helper/averageOf'

// 為什麼：單均價＝業績／客次，公休日客次 0，畫面不能印出 NaN 或 Infinity
describe('averageOf', () => {
  it('分母 0 回 0', () => {
    expect(averageOf(0, 0)).toBe(0)
    expect(averageOf(1000, 0)).toBe(0)
  })
  it('非數字回 0', () => {
    expect(averageOf(undefined, 3)).toBe(0)
    expect(averageOf(100, null)).toBe(0)
    expect(averageOf('x', 2)).toBe(0)
  })
  it('正常情況回平均', () => {
    expect(averageOf(1000, 4)).toBe(250)
    expect(averageOf('900', '3')).toBe(300)
  })
})
