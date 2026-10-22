// 保護：App 啟動時註冊給 validate.js 的自訂驗證器（regex、checked）。重設密碼等表單靠它們擋下格式錯誤與未勾選同意。
// prismjs mixin 只載入語法高亮套件，確認載入後 Prism 有各語言即可。
import validate from 'validate.js'
import 'mixins/validate'
import 'mixins/prismjs'

describe('mixins/validate 自訂驗證器', () => {
  it('保留 validate.js 內建驗證器', () => {
    expect(validate({ email: 'x' }, { email: { email: true } })).toBeTruthy()
  })

  it('regex：不符合 pattern 回傳設定的訊息，符合則通過', () => {
    const rule = { phone: { regex: { pattern: '^09\\d{8}$', message: '手機格式錯誤' } } }
    expect(validate({ phone: '0912345678' }, rule)).toBeUndefined()
    expect(validate({ phone: '12345' }, rule, { fullMessages: false })).toEqual({ phone: ['手機格式錯誤'] })
  })

  it('checked：不是 true 就擋下；沒給訊息時用預設文字', () => {
    expect(validate({ agree: true }, { agree: { checked: true } })).toBeUndefined()
    expect(validate({ agree: false }, { agree: { checked: { message: '請勾選同意' } } }, { fullMessages: false })).toEqual({
      agree: ['請勾選同意'],
    })
    expect(validate({ agree: 'yes' }, { agree: { checked: {} } }, { fullMessages: false })).toEqual({
      agree: ['must be checked'],
    })
  })
})

describe('mixins/prismjs', () => {
  it('載入後 Prism 具備各語言的語法定義', () => {
    const Prism = require('prismjs')
    ;['bash', 'css', 'diff', 'javascript', 'json', 'jsx', 'markup', 'powershell', 'sass', 'scss'].forEach(lang => {
      expect(Prism.languages[lang]).toBeTruthy()
    })
  })
})
