#!/usr/bin/env node
/*
 * 改版：把 @mui/icons-material 的 import 換成 src/ui/icons（lucide 轉接層，名稱與 props 相同）。
 * 只改 import 宣告，JSX 與邏輯不動；沒有對應的圖示保留原本的 MUI import。
 * 用法：node scripts/redesign/swap-icons.js [--write] <檔案或目錄…>
 */
const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')

const AVAILABLE = new Set(
  [...fs.readFileSync(path.join(__dirname, '../../src/ui/icons.js'), 'utf8').matchAll(/^export const (\w+) = adapt\(/gm)].map(m => m[1])
)

function transform(file) {
  const src = fs.readFileSync(file, 'utf8')
  if (!src.includes('@mui/icons-material')) return null
  const ast = parser.parse(src, { sourceType: 'module', plugins: ['jsx', 'classProperties', 'optionalChaining', 'nullishCoalescingOperator'] })
  const edits = []
  const specs = []
  let swapped = 0
  for (const node of ast.program.body) {
    if (node.type !== 'ImportDeclaration') continue
    const from = node.source.value
    if (from === '@mui/icons-material/') continue
    if (from.startsWith('@mui/icons-material/')) {
      const name = from.slice('@mui/icons-material/'.length)
      const def = node.specifiers.find(s => s.type === 'ImportDefaultSpecifier')
      if (!def || node.specifiers.length !== 1 || !AVAILABLE.has(name)) continue
      specs.push(def.local.name === name ? name : `${name} as ${def.local.name}`)
      edits.push({ start: node.start, end: node.end })
      swapped++
    } else if (from === '@mui/icons-material') {
      const named = node.specifiers.filter(s => s.type === 'ImportSpecifier')
      if (named.length !== node.specifiers.length) continue
      const ok = named.filter(s => AVAILABLE.has(s.imported.name))
      if (ok.length !== named.length) continue // 有未對應的就整行保留，避免拆行出錯
      ok.forEach(s => specs.push(s.imported.name === s.local.name ? s.local.name : `${s.imported.name} as ${s.local.name}`))
      edits.push({ start: node.start, end: node.end })
      swapped += ok.length
    }
  }
  if (!edits.length) return null
  // 第一個被替換的 import 位置放新的 ui/icons import，其餘移除（含行尾分號與換行）
  edits.sort((a, b) => b.start - a.start)
  let out = src
  edits.forEach((e, i) => {
    let end = e.end
    if (out[end] === ';') end++
    const isFirst = i === edits.length - 1
    if (isFirst) {
      out = out.slice(0, e.start) + `import { ${[...new Set(specs)].join(', ')} } from 'ui/icons'` + out.slice(end)
    } else {
      if (out[end] === '\n') end++
      out = out.slice(0, e.start) + out.slice(end)
    }
  })
  return { out, swapped }
}

function walk(target, files = []) {
  const st = fs.statSync(target)
  if (st.isDirectory()) fs.readdirSync(target).forEach(f => walk(path.join(target, f), files))
  else if (/\.jsx?$/.test(target) && !/__tests?__|\.test\./.test(target)) files.push(target)
  return files
}

const args = process.argv.slice(2)
const write = args.includes('--write')
let total = { files: 0, icons: 0 }
for (const f of args.filter(a => !a.startsWith('--')).flatMap(t => walk(t))) {
  let r
  try { r = transform(f) } catch (e) { console.error('PARSE ERROR', f, e.message); continue }
  if (!r) continue
  total.files++; total.icons += r.swapped
  if (write) fs.writeFileSync(f, r.out)
}
console.log(JSON.stringify(total))
