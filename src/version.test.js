// 版號會顯示在登入頁頂列與主側欄底部，也是 Sentry 的 release 名稱：格式壞掉（例如兩個版號接在一起）會讓錯誤回報對不到版本、
// 多出一個不存在的 release（Codex review PR #265：手動改版號的指令曾把 v3.10221320 接上舊版號）。
import { APP_VERSION } from './version'

it('APP_VERSION 是單一的 v3.MMDDHHmm', () => {
  expect(APP_VERSION).toMatch(/^v3\.(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])[0-5]\d$/)
})
