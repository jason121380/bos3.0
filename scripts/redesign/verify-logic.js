#!/usr/bin/env node
/*
 * 改版第二層（元件替換）的邏輯保留檢查。
 * 比對檔案與基準版本（預設 git HEAD）：
 *   1. 舊檔每一段「非 JSX 的程式敘述」（JSX 以 __JSX__ 取代後）必須原樣出現在新檔。
 *   2. 舊 JSX 中每一個「邏輯屬性」的運算式（on*、value、checked、disabled、傳給子元件的資料 props…）
 *      以及 children 中的運算式，必須在新檔的程式中仍找得到（允許外層多包一層，如 formatNumber(…)、o => !o && fn()）。
 *   3. 舊檔顯示的中文文字若在新檔消失，列為警告（不擋）。
 * 只允許刪除的屬性：純樣式／排版用（className、css、sx、style、variant、color、size、Grid 欄寬…）。
 *
 * 用法：node scripts/redesign/verify-logic.js [--base <git-ref>] <檔案…>
 *       新增或刪除的檔案會略過（新檔無基準可比）。
 */
const { execFileSync } = require('child_process')
const fs = require('fs')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default
const t = require('@babel/types')

const PRESENTATIONAL = new Set([
  'className', 'css', 'sx', 'style', 'variant', 'color', 'size', 'fontSize', 'elevation', 'square', 'disableGutters',
  'xs', 'sm', 'md', 'lg', 'xl', 'spacing', 'item', 'container', 'direction', 'justifyContent', 'justify', 'alignItems',
  'alignContent', 'wrap', 'zeroMinWidth', 'columns', 'rowSpacing', 'columnSpacing', 'maxWidth', 'fixed', 'component',
  'align', 'gutterBottom', 'noWrap', 'paragraph', 'display', 'edge', 'disableElevation', 'disableRipple', 'fullWidth',
  'margin', 'dense', 'padding', 'stickyHeader', 'orientation', 'flexItem', 'textAlign', 'startIcon', 'endIcon', 'icon',
  'avatar', 'action', 'titleTypographyProps', 'subheaderTypographyProps', 'primaryTypographyProps', 'secondaryTypographyProps',
  'PaperProps', 'TransitionComponent', 'timeout', 'unmountOnExit', 'scroll', 'aria-labelledby', 'aria-describedby',
  'aria-label', 'id', 'data-testid', 'underline', 'thickness', 'disableTypography', 'role', 'tabIndex', 'inputProps',
  'InputLabelProps', 'InputProps', 'shrink', 'autoFocus', 'placement', 'arrow', 'classes', 'divider', 'square',
])
const PARSE_OPTS = { sourceType: 'module', plugins: ['jsx', 'classProperties', 'optionalChaining', 'nullishCoalescingOperator'] }

const compact = node => generate(node, { compact: true, comments: false, concise: true }).code

// 把子樹中的 JSX 換成 __JSX__ 後輸出（用於比對敘述與運算式）
function codeWithoutJsx(node) {
  const clone = t.cloneNode(node, true)
  const file = t.file(t.program([t.isStatement(clone) ? clone : t.expressionStatement(clone)]))
  traverse(file, {
    JSXElement(p) { p.replaceWith(t.identifier('__JSX__')) },
    JSXFragment(p) { p.replaceWith(t.identifier('__JSX__')) },
  })
  return compact(file.program.body[0]).replace(/;$/, '')
}

// 含 __JSX__ 的運算式：拆成非 JSX 片段逐段比對（允許外層多包一層呼叫，如 section('標題', <…/>)）
const fragments = code => code.split('__JSX__').map(s => s.replace(/^[\s,)(]+|[\s,(]+$/g, '')).filter(s => s.length > 1)
const present = (code, corpus) => corpus.includes(code) || (code.includes('__JSX__') && fragments(code).every(f => corpus.includes(f)))

function analyze(code) {
  const ast = parser.parse(code, PARSE_OPTS)
  const statements = []
  const exprs = []
  const texts = []
  traverse(ast, {
    // 非 JSX 敘述：函式內與頂層的每一句（import 與 styles 物件除外）
    Statement(p) {
      const n = p.node
      if (t.isImportDeclaration(n) || t.isBlockStatement(n) || t.isProgram(p.parent) && t.isExportDefaultDeclaration(n)) return
      if (t.isVariableDeclaration(n) && n.declarations.every(d => t.isIdentifier(d.id) && /^(styles?|useStyles|classes|.*Styles)$/.test(d.id.name))) {
        p.skip(); return
      }
      // 只收「最內層」敘述：含函式本體的宣告不整句比對，交給內部敘述
      if (t.isFunctionDeclaration(n) || t.isClassDeclaration(n)) return
      if (t.isVariableDeclaration(n) && n.declarations.some(d => t.isFunction(d.init) || (t.isCallExpression(d.init) && d.init.arguments.some(a => t.isFunction(a))))) {
        // 例如 const handleX = () => {...}、useEffect 包在變數中：比對宣告名稱＋函式內部敘述
        n.declarations.forEach(d => {
          if (!t.isIdentifier(d.id)) return
          const fn = t.isFunction(d.init) ? d.init : null
          const params = fn ? fn.params.map(compact).join(',') : ''
          // 箭頭函式為運算式本體時（非區塊），本體本身就是邏輯，要整段比對；JSX 本體（元件）則略過
          const exprBody = fn && !t.isBlockStatement(fn.body) && !t.isJSXElement(fn.body) && !t.isJSXFragment(fn.body)
          statements.push(`decl:${d.id.name}(${params})${exprBody ? '=>' + codeWithoutJsx(fn.body) : ''}`)
        })
        return
      }
      if (t.isExpressionStatement(n) && t.isCallExpression(n.expression) && n.expression.arguments.some(a => t.isFunction(a))) {
        // 例如 useEffect(() => {...}, [deps])：比對呼叫名稱與依賴陣列，函式內部敘述另外收
        const c = n.expression
        statements.push(`call:${compact(c.callee)}(${c.arguments.filter(a => !t.isFunction(a)).map(compact).join(',')})`)
        return
      }
      if (t.isReturnStatement(n) && n.argument && (t.isJSXElement(n.argument) || t.isJSXFragment(n.argument) || t.isParenthesizedExpression(n.argument))) return
      if (t.isIfStatement(n) || t.isForStatement(n) || t.isForOfStatement(n) || t.isForInStatement(n) || t.isWhileStatement(n) || t.isSwitchStatement(n) || t.isTryStatement(n)) {
        statements.push(`ctrl:${codeWithoutJsx(n.test || n.discriminant || n.right || t.identifier('try'))}`)
        return
      }
      statements.push(codeWithoutJsx(n))
    },
    JSXAttribute(p) {
      const name = t.isJSXNamespacedName(p.node.name) ? `${p.node.name.namespace.name}:${p.node.name.name.name}` : p.node.name.name
      const v = p.node.value
      if (!v || !t.isJSXExpressionContainer(v) || t.isJSXEmptyExpression(v.expression)) return
      if (PRESENTATIONAL.has(name)) return
      if (t.isStringLiteral(v.expression) || t.isNumericLiteral(v.expression) || t.isBooleanLiteral(v.expression)) return
      if (t.isJSXElement(v.expression) || t.isJSXFragment(v.expression)) return
      exprs.push({ name, code: codeWithoutJsx(v.expression) })
    },
    JSXExpressionContainer(p) {
      if (t.isJSXAttribute(p.parent) || t.isJSXEmptyExpression(p.node.expression)) return
      const e = p.node.expression
      if (t.isStringLiteral(e) || t.isTemplateLiteral(e) && !e.expressions.length) return
      exprs.push({ name: 'children', code: codeWithoutJsx(e) })
    },
    JSXText(p) {
      const s = p.node.value.trim()
      if (s && /[一-鿿]/.test(s)) texts.push(s)
    },
  })
  return { statements, exprs, texts, corpus: [...statements, ...exprs.map(e => e.code)].join('\n') }
}

const args = process.argv.slice(2)
let base = 'HEAD'
let head = null // 預設讀工作目錄；指定 --head <ref> 時讀該版本（用於回頭驗證歷史 commit）
const bi = args.indexOf('--base')
if (bi >= 0) { base = args[bi + 1]; args.splice(bi, 2) }
const hi = args.indexOf('--head')
if (hi >= 0) { head = args[hi + 1]; args.splice(hi, 2) }
const readNew = f => head
  ? execFileSync('git', ['show', `${head}:${f}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['pipe', 'pipe', 'ignore'] })
  : fs.readFileSync(f, 'utf8')

let failed = 0
for (const f of args) {
  let before
  try { before = execFileSync('git', ['show', `${base}:${f}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['pipe', 'pipe', 'ignore'] }) } catch (e) { console.log(`SKIP（無基準版本）${f}`); continue }
  let after
  try { after = readNew(f) } catch (e) { console.log(`SKIP（已刪除）${f}`); continue }
  let A, B
  try { A = analyze(before); B = analyze(after) } catch (e) { console.log(`FAIL ${f}：無法解析 ${e.message}`); failed++; continue }
  const missingStmts = A.statements.filter(s => !B.statements.includes(s))
  const missingExprs = A.exprs.filter(e => !present(e.code, B.corpus))
  const newTexts = new Set(B.texts.join('\n').split('\n'))
  const lostTexts = [...new Set(A.texts)].filter(s => !newTexts.has(s) && !B.corpus.includes(s) && !after.includes(s))
  if (missingStmts.length || missingExprs.length) {
    failed++
    console.log(`FAIL ${f}`)
    missingStmts.slice(0, 20).forEach(s => console.log(`  缺少敘述：${s.slice(0, 200)}`))
    missingExprs.slice(0, 20).forEach(e => console.log(`  缺少屬性/運算式 [${e.name}]：${e.code.slice(0, 200)}`))
  } else {
    console.log(`OK   ${f}`)
  }
  lostTexts.slice(0, 10).forEach(s => console.log(`  警告：文字不見了「${s.slice(0, 60)}」`))
}
console.log(failed ? `\n${failed} 個檔案未通過` : `\n全部通過`)
process.exit(failed ? 1 : 0)
