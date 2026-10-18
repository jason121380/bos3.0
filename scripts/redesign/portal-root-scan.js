#!/usr/bin/env node
/**
 * portal-root 掃描：找出「使用 ui/ 元件、又有 MUI 浮層（Dialog／Modal／Popper／Popover／Menu／Drawer）」
 * 但整個檔案沒有 ui-root 的畫面檔。這類檔案的 ui 元件會渲染在 Portal 內，拿不到 .ui-root 的
 * box-sizing／邊框重置。
 *
 * 判斷方式（純文字比對，不解析 AST）：
 *   1. 檔案 import 了 'ui/button|card|checkbox|switch|input|badge|avatar|table'
 *   2. 檔案使用 <Dialog / <Modal / <Popper / <Popover / <Menu / <Drawer
 *   3. 檔案內容沒有出現 `ui-root`，且 import 的 ui 元件中至少有一個「根元素自己沒帶 ui-root」
 *      （根因修法：ui 元件自帶 ui-root 後，畫面檔不必再補 class）
 * 另外單獨列出沒有自帶 ui-root 的 ui 元件檔。
 *
 * 用法：node scripts/redesign/portal-root-scan.js   （畫面檔有缺漏時 exit code 1）
 */
const fs = require('fs')
const path = require('path')

const SRC = path.join(__dirname, '..', '..', 'src')
const UI_FILES = ['button', 'card', 'checkbox', 'switch', 'input', 'badge', 'avatar', 'table']
const UI_IMPORT = new RegExp(`from\\s+['"]ui/(${UI_FILES.join('|')})['"]`, 'g')
const MUI_OVERLAY = /<(Dialog|Modal|Popper|Popover|Menu|Drawer)[\s>]/

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) {
      if (name === 'ui' || name === '__test__' || name === '__tests__') continue
      walk(p, out)
    } else if (/\.jsx?$/.test(name) && !/\.test\.jsx?$/.test(name)) out.push(p)
  }
  return out
}

const uiNoRoot = UI_FILES.filter(n => !fs.readFileSync(path.join(SRC, 'ui', n + '.js'), 'utf8').includes('ui-root'))

const missing = walk(SRC)
  .filter(f => {
    const s = fs.readFileSync(f, 'utf8')
    const used = [...s.matchAll(UI_IMPORT)].map(m => m[1])
    return used.some(n => uiNoRoot.includes(n)) && MUI_OVERLAY.test(s) && !s.includes('ui-root')
  })
  .map(f => path.relative(SRC, f))

console.log(`缺 ui-root 的畫面檔：${missing.length} 個`)
missing.forEach(f => console.log('  ' + f))
console.log(`未自帶 ui-root 的 ui 元件檔：${uiNoRoot.length} 個${uiNoRoot.length ? '（' + uiNoRoot.join(', ') + '）' : ''}`)
process.exit(missing.length ? 1 : 0)
