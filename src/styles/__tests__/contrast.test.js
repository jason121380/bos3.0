// 色彩對比（WCAG 2.x）：直接讀 src/styles/tokens.css，驗證 STYLE.md §2／§15 宣稱 ≥ 4.5:1 的組合。
// 為什麼要有：token 一改（例如為了「更淡雅」把 text-tertiary 調淺），表頭、placeholder、狀態文字就可能掉到看不清，
// 而畫面上不會報錯；這支測試讓任何 token 調整都要先過對比門檻。
import fs from 'fs'
import path from 'path'

const css = fs.readFileSync(path.join(__dirname, '..', 'tokens.css'), 'utf8')

function block(selector) {
  const start = css.indexOf(`${selector} {`)
  const body = css.slice(start, css.indexOf('}', start))
  const vars = {}
  for (const m of body.matchAll(/--([\w-]+):\s*(\d+)\s+(\d+)\s+(\d+)\s*;/g)) vars[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])]
  return vars
}

const channel = c => {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
// 狀態色 8% 淡底（bg-success/8）疊在 background 上的實際顏色
const tint = (color, bg, alpha = 0.08) => color.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)))

const WHITE = [255, 255, 255]
const TEXT_TOKENS = ['text', 'text-secondary', 'text-tertiary', 'success', 'warning', 'danger']
const STATUS = ['success', 'warning', 'danger']

const themes = {
  淺色: { vars: block(':root'), backgrounds: ['background', 'surface', 'surface-hover'] },
  深色: { vars: block('.dark'), backgrounds: ['canvas', 'background', 'surface', 'surface-hover'] },
}

describe.each(Object.entries(themes))('%s主題', (name, { vars, backgrounds }) => {
  it('tokens.css 讀得到所有需要的顏色', () => {
    ;[...TEXT_TOKENS, ...backgrounds, 'accent'].forEach(t => expect(vars[t]).toHaveLength(3))
  })

  describe.each(TEXT_TOKENS)('文字 %s', token => {
    it.each(backgrounds)(`在 %s 上 ≥ 4.5:1`, bg => {
      expect(ratio(vars[token], vars[bg])).toBeGreaterThanOrEqual(4.5)
    })
  })

  // accent（品牌藍 #1A73E8）在淺色 surface 類底上未達 4.5，STYLE.md §2 記為品牌色決策、待 Jason 拍板：這裡只記錄目前數值，不當成失敗
  it('accent 對比只記錄目前數值（已知例外，品牌色待 Jason 決定）', () => {
    const values = Object.fromEntries(backgrounds.map(bg => [bg, Math.round(ratio(vars.accent, vars[bg]) * 100) / 100]))
    expect(Object.values(values).every(v => v > 3)).toBe(true)
  })
})

describe('淺色主題的狀態色（Badge 與實心按鈕）', () => {
  const vars = themes.淺色.vars
  it.each(STATUS)('%s 文字在自身 8% 淡底上 ≥ 4.5:1', s => {
    expect(ratio(vars[s], tint(vars[s], vars.background))).toBeGreaterThanOrEqual(4.5)
  })
  it.each(STATUS)('白字在 %s 實心底上 ≥ 4.5:1', s => {
    expect(ratio(WHITE, vars[s])).toBeGreaterThanOrEqual(4.5)
  })
  it('主要按鈕：白字在 primary 上 ≥ 4.5:1', () => {
    expect(ratio(vars['primary-foreground'], vars.primary)).toBeGreaterThanOrEqual(4.5)
  })
})

describe('公式本身', () => {
  it('黑白是 21:1、同色是 1:1', () => {
    expect(ratio([0, 0, 0], WHITE)).toBeCloseTo(21, 5)
    expect(ratio(WHITE, WHITE)).toBe(1)
  })
})
