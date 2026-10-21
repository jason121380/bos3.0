import roundDecimal from '../roundDecimal'
import truncateDecimal from '../truncateDecimal'
import giveBonus from '../giveBonus'

// 金額是帳單、報表與對帳的核心；這些測試把「店家看到的數字」固定下來，任何改動都會被抓到。

describe('truncateDecimal：卡券使用金額無條件捨去到小數 2 位', () => {
  it('修正浮點誤差：0.57 不可顯示成 0.56（原寫法 parseInt(x * 100) / 100 的 bug）', () => {
    expect(truncateDecimal(0.57)).toBe(0.57)
    expect(truncateDecimal(1.15)).toBe(1.15)
    expect(truncateDecimal(4.35)).toBe(4.35)
  })

  it('保留「無條件捨去」的原意：第 3 位小數一律捨去，不四捨五入', () => {
    expect(truncateDecimal(12.345)).toBe(12.34)
    expect(truncateDecimal(99.999)).toBe(99.99)
  })

  it('負數往 0 捨去（退款等負值與原寫法一致）', () => {
    expect(truncateDecimal(-1.239)).toBe(-1.23)
  })

  it('整數與字串數字照原值', () => {
    expect(truncateDecimal(1200)).toBe(1200)
    expect(truncateDecimal('33.3')).toBe(33.3)
  })
})

describe('roundDecimal：報表金額四捨五入', () => {
  it('預設四捨五入到 2 位', () => {
    expect(roundDecimal(12.345)).toBe(12.35)
    expect(roundDecimal(12.344)).toBe(12.34)
  })

  it('可指定位數', () => {
    expect(roundDecimal(12.5, 0)).toBe(13)
  })
})

describe('giveBonus：每消費滿一個單位送紅利點數', () => {
  // 每消費 100 元送 2 點，本次消費 250 元
  it('四捨五入：2.5 個單位算 3 個', () => {
    expect(giveBonus.ROUNDING(250, 100, 2)).toBe(6)
  })

  it('無條件進位：未滿一個單位也算', () => {
    expect(giveBonus.ROUNDUP(201, 100, 2)).toBe(6)
  })

  it('無條件捨去：未滿一個單位不算', () => {
    expect(giveBonus.ROUNDDOWN(299, 100, 2)).toBe(4)
  })
})
