#!/usr/bin/env node
/*
 * 改版：把指定的 MUI 元件 import 換成 src/ui 的相容元件（只改 import，JSX 與邏輯不動）。
 * 以 Babel AST 解析 ImportDeclaration（跨行 import 也正確），依對照表搬移：
 *   - import { A, TextField } from '@mui/material'         → 清單移除 TextField，另加 import { TextField } from 'ui/text-field'
 *   - import TextField from '@mui/material/TextField'       → import TextField from 'ui/text-field'
 *   - 別名（{ Button as MuiButton }）保留
 * 用法：node scripts/redesign/swap-mui.js --map TextField=ui/text-field,InputAdornment=ui/text-field <檔案…>
 *       不帶檔案時只列出會受影響的檔案（--list）
 */
const fs = require('fs')
const path = require('path')
const parser = require(path.join(__dirname, '../../node_modules/@babel/parser'))

// 列印範本整檔保留 MUI（版面靠 MUI class 排版，CLAUDE.md 鐵則 2）：一律跳過，避免批次清單誤含
const EXCLUDE = ['src/views/MerchantBankTransferReport/TransferDetail.js']

function parseMap(arg) {
  const map = {}
  for (const pair of arg.split(',')) {
    const [name, mod] = pair.split('=')
    map[name.trim()] = mod.trim()
  }
  return map
}

// 移除整個 import 時連同行尾換行一起刪，不留空行（不動檔案其他格式）
const removal = (src, node) => ({ start: node.start, end: src[node.end] === '\n' ? node.end + 1 : node.end, text: '' })

function swap(src, map) {
  const ast = parser.parse(src, { sourceType: 'module', plugins: ['jsx', 'optionalChaining', 'classProperties'] })
  const edits = []
  const added = {} // module -> [specifier text]
  let firstImportStart = -1
  for (const node of ast.program.body) {
    if (node.type !== 'ImportDeclaration') continue
    if (firstImportStart < 0) firstImportStart = node.start
    const source = node.source.value
    if (source === '@mui/material') {
      const keep = []
      let moved = false
      for (const s of node.specifiers) {
        if (s.type === 'ImportSpecifier' && map[s.imported.name]) {
          const text = s.imported.name === s.local.name ? s.local.name : `${s.imported.name} as ${s.local.name}`
          ;(added[map[s.imported.name]] = added[map[s.imported.name]] || []).push(text)
          moved = true
        } else {
          keep.push(src.slice(s.start, s.end))
        }
      }
      if (moved)
        edits.push(
          keep.length ? { start: node.start, end: node.end, text: `import { ${keep.join(', ')} } from '@mui/material'` } : removal(src, node)
        )
    } else if (/^@mui\/material\/[A-Za-z]+$/.test(source)) {
      const comp = source.split('/')[2]
      const target = map[comp]
      if (!target) continue
      const def = node.specifiers.find(s => s.type === 'ImportDefaultSpecifier')
      const named = node.specifiers.filter(s => s.type === 'ImportSpecifier').map(s => src.slice(s.start, s.end))
      const parts = []
      if (def) parts.push(def.local.name === comp ? comp : `${comp} as ${def.local.name}`)
      parts.push(...named)
      ;(added[target] = added[target] || []).push(...parts)
      edits.push(removal(src, node))
    }
  }
  if (!edits.length) return null
  // 目標模組已有具名 import（如先前批次換過的 ui/text-field）時併入同一行，不另起一行
  for (const node of ast.program.body) {
    if (node.type !== 'ImportDeclaration' || !added[node.source.value]) continue
    if (!node.specifiers.length || node.specifiers.some(s => s.type !== 'ImportSpecifier')) continue
    const existing = node.specifiers.map(s => src.slice(s.start, s.end))
    const merged = [...new Set([...existing, ...added[node.source.value]])]
    edits.push({ start: node.start, end: node.end, text: `import { ${merged.join(', ')} } from '${node.source.value}'` })
    delete added[node.source.value]
  }
  let out = src
  const insertion = Object.entries(added)
    .map(([mod, specs]) => `import { ${[...new Set(specs)].join(', ')} } from '${mod}'`)
    .join('\n')
  // 由後往前套用，避免位移；新 import 插在第一個 import 之前（@jsxImportSource 等檔頭註解仍留在最上方）
  const all = [...edits, ...(insertion ? [{ start: firstImportStart, end: firstImportStart, text: `${insertion}\n` }] : [])].sort(
    (a, b) => b.start - a.start || b.end - a.end
  )
  for (const e of all) out = out.slice(0, e.start) + e.text + out.slice(e.end)
  return out
}

if (require.main === module) {
  const args = process.argv.slice(2)
  const mi = args.indexOf('--map')
  if (mi < 0) {
    console.error('需要 --map Name=module[,Name=module]')
    process.exit(1)
  }
  const map = parseMap(args[mi + 1])
  const files = args.filter((a, i) => i !== mi && i !== mi + 1 && a !== '--list')
  for (const file of files) {
    if (EXCLUDE.some(e => path.resolve(file) === path.resolve(e))) {
      console.log('exclude', file)
      continue
    }
    const src = fs.readFileSync(file, 'utf8')
    let out
    try {
      out = swap(src, map)
    } catch (e) {
      console.log('parse-fail', file, e.message)
      continue
    }
    if (out && !args.includes('--list')) fs.writeFileSync(file, out)
    console.log(out ? 'swapped' : 'skip   ', file)
  }
}

module.exports = { swap }
