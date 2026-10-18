#!/usr/bin/env node
/*
 * 改版第一層：把各頁「樣式物件」裡寫死的舊色碼換成 STYLE.md 的 tokens。
 *
 * 只改這些位置的字串字面值（原地替換，不重新排版）：
 *   - emotion 的 css({...}) / css`...` 以外的物件呼叫參數
 *   - JSX 的 css={{...}}、sx={{...}} 物件
 *   - 變數名含 style / styles / classes 的物件（含 styles/*.js 的 export default）
 * 不改：inline style={{...}}（列印範本靠 inline style，列印視窗讀不到 CSS 變數）、
 *       任何邏輯、JSX 結構、非色碼字串。
 * 另外移除寬 4px 的「藍色左條」::before 裝飾。
 *
 * 用法：node scripts/redesign/tokenize-colors.js [--write] [--inline] <檔案或目錄…>
 *   --inline：一併處理 inline style（自動略過含列印範本的檔案）
 */
const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default

const group = list => new Set(list.map(h => h.toUpperCase()))
const ACCENT = group(['1A73E8', '007AFF', '3865AC', '3F51B5', '1976D2', '005AC1', '0051D5', '4581DF', '174EA6'])
const ACCENT_TINT = group(['E8F0FE', 'E2F2FF', 'F0F7FF', 'D2E3FC'])
const NEUTRAL_LIGHT = group(['F0F0F0', 'EEEEEE', 'EEE', 'E0E0E0', 'DDD', 'DDDDDD', 'EBEBEB', 'E5E5E5'])
const SURFACE = group(['F5F5F5', 'F9F9F9', 'F8F9FA', 'FAFAFA', 'F1F3F4', 'F2F2F2', 'F8F8F8'])
const WHITE = group(['FFF', 'FFFFFF'])
const TEXT = group(['333', '333333', '212121', '202124', '000', '000000', '263238', '424242', '414141', '202D50', '1E1E1E', '3C4043', '0F1A3A'])
const TEXT_2 = group(['666', '666666', '5F6368', '757575', '444746', '636366', '3C3C43'])
const TEXT_3 = group(['999', '999999', '9E9E9E', '92929F', '8E8E93', 'AAA', 'AAAAAA', 'BDBDBD'])
const SUCCESS = group(['2E7D32', '66BB6A', '4CAF50', '43A047'])
const DANGER = group(['F44336', 'EE0000', 'FF6969', 'FF3B30', 'D32F2F', 'E53935'])
const WARNING = group(['FF9800', 'ED6C02', 'FB8C00'])

const v = name => `rgb(var(--${name}))`
const va = (name, a) => `rgb(var(--${name}) / ${a})`

function mapHex(hex, key) {
  const h = hex.slice(1).toUpperCase()
  const k = String(key || '')
  const isBorder = /border|outline|divider/i.test(k)
  const isBg = /background|bgcolor|^bg$/i.test(k)
  const isColor = /^color$|fill|stroke|caretColor/i.test(k)
  if (ACCENT.has(h)) return v('accent')
  if (ACCENT_TINT.has(h)) return isBorder ? va('accent', 0.3) : isColor ? v('accent') : va('accent', 0.08)
  if (NEUTRAL_LIGHT.has(h)) return isBorder ? v('border') : isColor ? v('text-tertiary') : v('surface')
  if (SURFACE.has(h)) return isBorder ? v('border') : isColor ? v('text-tertiary') : v('surface')
  if (WHITE.has(h)) return isBg ? v('background') : null // 白字（彩色底上）維持
  if (TEXT.has(h)) return isColor ? v('text') : isBorder ? v('border-strong') : null
  if (TEXT_2.has(h)) return isColor ? v('text-secondary') : isBorder ? v('border-strong') : null
  if (TEXT_3.has(h)) return isColor ? v('text-tertiary') : isBorder ? v('border-strong') : null
  if (SUCCESS.has(h)) return v('success')
  if (DANGER.has(h)) return v('danger')
  if (WARNING.has(h)) return v('warning')
  return null
}

const HEX = /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g

function isStyleContext(p) {
  // 往上找：是否位在 css()/styled 呼叫、css=/sx= 屬性、或 styles 物件中；遇到 style= 屬性則排除
  for (let cur = p.parentPath; cur; cur = cur.parentPath) {
    const n = cur.node
    if (n.type === 'JSXAttribute') {
      const name = n.name && n.name.name
      return name === 'css' || name === 'sx' || (name === 'style' && allowInline)
    }
    if (n.type === 'CallExpression') {
      const c = n.callee
      const name = c.type === 'Identifier' ? c.name : c.type === 'MemberExpression' && c.property ? c.property.name : ''
      if (name === 'css' || name === 'styled' || name === 'makeStyles' || name === 'createStyles') return true
    }
    if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && /style|classes/i.test(n.id.name)) return true
    if (n.type === 'ExportDefaultDeclaration' && /[\\/]styles[\\/]/.test(currentFile)) return true
    if (n.type === 'Program') return false
  }
  return false
}

function propKey(p) {
  for (let cur = p.parentPath; cur; cur = cur.parentPath) {
    const n = cur.node
    if (n.type === 'ObjectProperty') {
      const k = n.key
      return k.type === 'Identifier' ? k.name : k.type === 'StringLiteral' ? k.value : ''
    }
    if (n.type === 'ObjectExpression' || n.type === 'JSXAttribute') return ''
  }
  return ''
}

function isBlueBar(prop) {
  // { '&::before': { width: '4px', ..., backgroundColor: 藍 } }
  const k = prop.key.type === 'StringLiteral' ? prop.key.value : ''
  if (!/^&::?before$/.test(k) || prop.value.type !== 'ObjectExpression') return false
  const props = Object.fromEntries(prop.value.properties.filter(q => q.key).map(q => [q.key.name || q.key.value, q.value]))
  const width = props.width && (props.width.value ?? '')
  const bg = props.backgroundColor
  const bgIsBlue = bg && ((bg.type === 'StringLiteral' && /#(1A73E8|007AFF|1976d2)/i.test(bg.value)) ||
    (bg.type === 'MemberExpression' && /palette/.test(src.slice(bg.start, bg.end))))
  return (width === '4px' || width === 4) && bgIsBlue
}

let currentFile = ''
let src = ''
let allowInline = false
// 含列印範本的檔案：inline style 會被複製到列印視窗（讀不到 CSS 變數），一律不處理 inline style
const PRINT_MARKERS = /printMain|printThermal|window\.print|newWin|forPrint|Print-Window|innerHTML/

function transform(file) {
  currentFile = file
  src = fs.readFileSync(file, 'utf8')
  allowInline = INLINE && !PRINT_MARKERS.test(src)
  let ast
  try {
    ast = parser.parse(src, { sourceType: 'module', plugins: ['jsx', 'classProperties', 'optionalChaining', 'nullishCoalescingOperator'] })
  } catch (e) {
    return { file, error: e.message }
  }
  const edits = []
  let colors = 0
  let bars = 0
  traverse(ast, {
    ObjectProperty(p) {
      if (isBlueBar(p.node) && isStyleContext(p)) {
        let end = p.node.end
        if (src[end] === ',') end += 1
        let start = p.node.start
        while (start > 0 && /[ \t]/.test(src[start - 1])) start--
        if (src[start - 1] === '\n') start--
        edits.push({ start, end, text: '' })
        bars++
        p.skip()
      }
    },
    StringLiteral(p) {
      if (!HEX.test(p.node.value)) return
      HEX.lastIndex = 0
      if (!isStyleContext(p)) return
      const key = propKey(p)
      let changed = false
      const next = p.node.value.replace(HEX, m => {
        const r = mapHex(m, key)
        if (r) { changed = true; colors++; return r }
        return m
      })
      if (changed) {
        const quote = src[p.node.start]
        edits.push({ start: p.node.start, end: p.node.end, text: quote + next.replace(new RegExp(quote, 'g'), '\\' + quote) + quote })
      }
    },
  })
  // 由後往前套用，避免位移；略過被藍條移除範圍包住的字串修改
  edits.sort((a, b) => b.start - a.start)
  let out = src
  let lastStart = Infinity
  for (const e of edits) {
    if (e.end > lastStart) continue
    out = out.slice(0, e.start) + e.text + out.slice(e.end)
    lastStart = e.start
  }
  return { file, colors, bars, out, changed: out !== src }
}

function walk(target, files = []) {
  const st = fs.statSync(target)
  if (st.isDirectory()) fs.readdirSync(target).forEach(f => walk(path.join(target, f), files))
  else if (/\.jsx?$/.test(target) && !/__tests?__|\.test\./.test(target)) files.push(target)
  return files
}

const args = process.argv.slice(2)
const write = args.includes('--write')
const INLINE = args.includes('--inline')
const files = args.filter(a => !a.startsWith('--')).flatMap(t => walk(t))
let total = { files: 0, colors: 0, bars: 0 }
for (const f of files) {
  const r = transform(f)
  if (r.error) { console.error('PARSE ERROR', f, r.error); continue }
  if (!r.changed) continue
  total.files++; total.colors += r.colors; total.bars += r.bars
  if (write) fs.writeFileSync(f, r.out)
  if (process.env.VERBOSE) console.log(`${f}: ${r.colors} colors, ${r.bars} bars`)
}
console.log(JSON.stringify(total))
