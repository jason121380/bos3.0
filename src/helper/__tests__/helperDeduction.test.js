import helperDeduction from '../helperDeduction'

// 為什麼重要：助理扣項直接影響設計師與助理的抽成（薪資）。規則：
//   固定金額：指定 → 取指定／非指定較高者 × 人數；非指定且「均分」→ 只扣一次；非指定不均分 → 每人各扣
//   業績%數：同上規則換算成服務價格的百分比，金額無條件捨去到整數
//   點數：累加點數（不計入金額）

const run = (rules, servicePrice = 1000) => {
  let point
  let cash
  helperDeduction(rules, p => (point = p), c => (cash = c), servicePrice)
  return { point, cash }
}

const rule = overrides => ({
  isDesignate: false,
  isSplitted: false,
  nameList: ['A', 'B'],
  cash: 0,
  designateCash: 0,
  nonDesignateCash: 0,
  percent: 0,
  designatePercent: 0,
  nonDesignatePercent: 0,
  point: 0,
  designatePoint: 0,
  nonDesignatePoint: 0,
  ...overrides,
})

describe('helperDeduction：助理扣項計算', () => {
  describe('固定金額', () => {
    it('指定：取指定／非指定較高者，每位助理各扣', () => {
      expect(run([rule({ deductionWay: '固定金額', isDesignate: true, designateCash: 100, nonDesignateCash: 80 })]).cash).toBe(200)
    })

    it('非指定、均分：整筆只扣一次', () => {
      expect(run([rule({ deductionWay: '固定金額', isSplitted: true, cash: 90 })]).cash).toBe(90)
    })

    it('非指定、不均分：每位助理各扣', () => {
      expect(run([rule({ deductionWay: '固定金額', cash: 90 })]).cash).toBe(180)
    })
  })

  describe('業績%數（以服務價格 1,000 元計）', () => {
    it('指定：取較高的百分比 × 人數', () => {
      expect(run([rule({ deductionWay: '業績%數', isDesignate: true, designatePercent: 5, nonDesignatePercent: 3 })]).cash).toBe(100)
    })

    it('非指定、均分：只算一次', () => {
      expect(run([rule({ deductionWay: '業績%數', isSplitted: true, percent: 5 })]).cash).toBe(50)
    })

    it('非指定、不均分：每位助理各扣一次百分比', () => {
      expect(run([rule({ deductionWay: '業績%數', percent: 5 })]).cash).toBe(100)
    })

    it('金額無條件捨去到整數元', () => {
      expect(run([rule({ deductionWay: '業績%數', isSplitted: true, percent: 3.33 })], 999).cash).toBe(33)
    })
  })

  describe('點數', () => {
    it('點數與金額分開累計', () => {
      const result = run([
        rule({ deductionWay: '點數', point: 2 }),
        rule({ deductionWay: '固定金額', cash: 50 }),
      ])
      expect(result).toEqual({ point: 4, cash: 100 })
    })

    it('非指定、均分：整筆只算一次點數', () => {
      expect(run([rule({ deductionWay: '點數', isSplitted: true, point: 3 })]).point).toBe(3)
    })

    it('指定：取較高點數 × 人數', () => {
      expect(run([rule({ deductionWay: '點數', isDesignate: true, designatePoint: 3, nonDesignatePoint: 1 })]).point).toBe(6)
    })
  })

  it('多條規則的金額加總', () => {
    const result = run([
      rule({ deductionWay: '固定金額', isSplitted: true, cash: 100 }),
      rule({ deductionWay: '業績%數', isSplitted: true, percent: 10 }),
    ])
    expect(result.cash).toBe(200)
  })

  // 服務的助理設定若出現未知的扣項方式（後台新增種類、前端尚未支援），不可算出任何扣項，也不可讓其他規則失效
  it('未知的扣項方式不計入金額與點數，其他規則照算', () => {
    expect(run([rule({ deductionWay: '其他', cash: 999, point: 9 }), rule({ deductionWay: '固定金額', cash: 50 })])).toEqual({ point: 0, cash: 100 })
  })

  it('沒有規則時金額與點數皆為 0', () => {
    expect(run([])).toEqual({ point: 0, cash: 0 })
  })
})
