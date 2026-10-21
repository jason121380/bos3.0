#!/usr/bin/env node
/*
 * 產生「改版頁面檢查清單」docs/redesign/PAGE_CHECKLIST.md
 * 資料來源：src/routes.js（網址與頁面目錄）、NavBar.js（選單分類與中文名）、git 歷史（改版狀態）、檔案內容（列印、殘留 MUI）。
 * 用法：node scripts/redesign/page-checklist.js [--base <改版前的 commit，預設 c41b604>]
 */
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default

const args = process.argv.slice(2)
const bi = args.indexOf('--base')
const BASE = bi >= 0 ? args[bi + 1] : 'c41b604'
const ui = args.indexOf('--url')
const URL_BASE = ui >= 0 ? args[ui + 1] : 'http://localhost:3000'
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
const PARSE = { sourceType: 'module', plugins: ['jsx', 'classProperties', 'optionalChaining', 'nullishCoalescingOperator'] }

// ---------- 1. 路由 ----------
const routesSrc = fs.readFileSync('src/routes.js', 'utf8')
const ast = parser.parse(routesSrc, PARSE)
const importOf = {} // 識別字 → 'views/Xxx/...'
ast.program.body.forEach(n => {
  if (n.type === 'ImportDeclaration') n.specifiers.forEach(s => (importOf[s.local.name] = n.source.value))
})
const lazyImport = node => {
  let found = null
  traverse(
    t(node),
    { CallExpression(p) { if (p.node.callee.type === 'Import' && p.node.arguments[0]) found = p.node.arguments[0].value } },
    undefined,
    {}
  )
  return found
}
function t(node) { return { type: 'File', program: { type: 'Program', sourceType: 'module', body: [{ type: 'ExpressionStatement', expression: node }] } } }
const keyOf = p => (p.key.name || p.key.value)
function importedArray(rel) {
  const file = path.join('src', rel.replace(/^\.\//, '') + (rel.endsWith('.js') ? '' : '.js'))
  const sub = parser.parse(fs.readFileSync(file, 'utf8'), PARSE)
  const decl = sub.program.body.find(n => n.type === 'ExportDefaultDeclaration')
  if (!decl || decl.declaration.type !== 'ArrayExpression') throw new Error(`${file} 的 export default 不是陣列`)
  return decl.declaration
}
const routes = []
function walk(arr, layout) {
  arr.elements.forEach(el => {
    if (!el) return
    if (el.type === 'SpreadElement') {
      // ...(cond ? [ {…} ] : [])
      traverse(t(el.argument), { ArrayExpression(p) { if (p.node.elements.length) { walk(p.node, layout); p.stop() } } }, undefined, {})
      return
    }
    if (el.type !== 'ObjectExpression') return
    const o = {}
    el.properties.forEach(p => { if (p.key) o[keyOf(p)] = p.value })
    const route = o.path && o.path.value
    let comp = null
    if (o.component) {
      if (o.component.type === 'Identifier') comp = importOf[o.component.name] || o.component.name
      else comp = lazyImport(o.component)
    }
    if (o.routes && o.routes.type === 'ArrayExpression') {
      walk(o.routes, o.component && o.component.type === 'Identifier' ? o.component.name : layout)
    } else if (o.routes && o.routes.type === 'Identifier' && /^\.\//.test(importOf[o.routes.name] || '')) {
      // 子路由陣列拆在同目錄另一檔（例如 routes: dashboardRoutes ← ./dashboardRoutes）：讀該檔 export default 的陣列
      walk(importedArray(importOf[o.routes.name]), o.component && o.component.type === 'Identifier' ? o.component.name : layout)
    } else if (route) {
      routes.push({ path: route, comp, layout })
    }
  })
}
traverse(ast, {
  ExportDefaultDeclaration(p) { walk(p.node.declaration, null); p.stop() },
})
const DEV_ONLY = new Set(['/ui-preview'])
for (let k = routes.length - 1; k >= 0; k--) if (DEV_ONLY.has(routes[k].path)) routes.splice(k, 1)
const viewDirOf = comp => {
  if (!comp) return null
  const m = String(comp).replace(/^(\.\/)?(src\/)?/, '').match(/^views\/([^/]+)/)
  return m ? m[1] : null
}

// ---------- 2. 選單 ----------
const nav = fs.readFileSync('src/layouts/Dashboard/NavBar.js', 'utf8').split('\n')
const menu = [] // [{ title, items: [{title, href}] }]
nav.forEach(line => {
  const c = line.match(/^ {4}title: '([^']+)',?$/)
  if (c) menu.push({ title: c[1], items: [] })
  const i = line.match(/^ {6}\{ title: '([^']+)', href: '(\/[^']*)' \}/)
  if (i && menu.length) menu[menu.length - 1].items.push({ title: i[1], href: i[2] })
})
const draft = menu.find(m => m.title === '櫃檯作業')
if (draft && !draft.items.some(i => i.href === '/management/draft-orders')) draft.items.splice(2, 0, { title: '掛單列表（商家啟用掛單時顯示）', href: '/management/draft-orders' })
const menuTitle = {}
menu.forEach(m => m.items.forEach(i => (menuTitle[i.href] = i.title)))

// ---------- 3. 各頁面目錄的改版狀態 ----------
// 頁面可能是目錄（多數），也可能是單一檔案（如 Error404.js、GettingStarted.js）
const viewPath = d => (fs.existsSync(`src/views/${d}`) ? `src/views/${d}` : `src/views/${d}.js`)
const views = fs.readdirSync('src/views').map(d => d.replace(/\.js$/, '')).filter(d => d !== 'index')
const filesOf = dir => {
  const out = []
  const w = d => { if (fs.statSync(d).isFile()) return /\.js$/.test(d) && out.push(d); fs.readdirSync(d).forEach(f => { const p = path.join(d, f); fs.statSync(p).isDirectory() ? w(p) : /\.js$/.test(p) && !/__tests?__/.test(p) && out.push(p) }) }
  w(viewPath(dir))
  return out
}
const subjectsByDir = {}
git('log', '--no-merges', '--format=@@%s', '--name-only', `${BASE}..HEAD`, '--', 'src/views').split('@@').slice(1).forEach(block => {
  const [subject, ...files] = block.split('\n').filter(Boolean)
  const dirs = new Set(files.map(f => f.split('/')[2].replace(/\.js$/, '')))
  dirs.forEach(d => (subjectsByDir[d] = (subjectsByDir[d] || []).concat(subject)))
})
const PRINT = /window\.print|printMain|printThermal|forPrint|printCard|merchantNamePrint/
const info = {}
views.forEach(d => {
  const subs = subjectsByDir[d] || []
  const files = filesOf(d)
  const src = files.map(f => fs.readFileSync(f, 'utf8'))
  const muiFiles = src.filter(s => /from '@mui\/material/.test(s)).length
  const round2 = subs.some(s => /第二輪/.test(s))
  const l2 = subs.some(s => /^feat\(ui\)/.test(s) && !/第二輪/.test(s))
  const l1 = subs.some(s => /^style/.test(s))
  const changedFile = git('diff', '--name-only', BASE, 'HEAD', '--', viewPath(d)).trim()
  let status
  if (round2 && l2) status = '🟢 已改版（兩輪）'
  else if (round2) status = '🟢 已改版（第二輪）'
  else if (l2) status = '🟢 已改版'
  else if (l1 || changedFile) status = '🟡 只換外觀（色碼／圖示）'
  else status = '⚪ 沒改'
  info[d] = { status, muiFiles, files: files.length, prints: src.some(s => PRINT.test(s)) }
})

// ---------- 4. 組表 ----------
const DYNAMIC = /:/
const SENSITIVE = new Set(['OrderCreate', 'OrderEdit', 'DraftOrderEdit', 'QueueOrderEdit', 'CheckoutDaily', 'SalaryEdit', 'SalaryOverview', 'TopUp', 'TopUpCreate', 'TopUpEdit', 'Parameter', 'AccountingRecordCreate', 'GeneralAccountingRecordCreate'])
const NOTE = {
  OrderCreate: '金額重點：折扣、付款、整單結帳',
  OrderEdit: '金額重點：帳單修改後數字',
  DraftOrderEdit: '金額重點',
  QueueOrderEdit: '金額重點',
  CheckoutDaily: '金額重點：日結數字',
  SalaryEdit: '金額重點：薪資計算',
  SalaryOverview: '金額重點：薪資總表',
  TopUp: '金額重點：入金',
  TopUpCreate: '金額重點：入金',
  TopUpEdit: '金額重點：入金',
  Parameter: '設定很多，逐分頁點開',
}
// 頁面標題找不到中文時使用
const TITLE_OVERRIDE = {
  ClearStorage: '清除快取（顧客端）', CouponEdit: '編輯預收卡', CustomerManagementDetails: '客戶詳細資料',
  CustomerSelfCreate: '顧客自助建檔', CustomerSendEventTicket: '顧客轉贈活動券', DraftOrderEdit: '掛單詳細',
  EmployeeManagementDetail: '員工個人設定', Error401: '錯誤頁 401', Error404: '錯誤頁 404', Error500: '錯誤頁 500',
  GettingStarted: '新手指南', Login: '登入', MemberCard: '顧客端會員卡', OrderEdit: '帳單詳細', ProductEdit: '編輯商品',
  QueueOrderEdit: '重新開單（排隊單）', Register: '註冊', ServiceEdit: '編輯服務項目',
}
const CJK = /[一-鿿]/
const titleOfView = dir => {
  const pats = [/<Page[^>]*title=(?:"([^"]+)"|'([^']+)'|\{['"]([^'"]+)['"]\})/, /<(?:AdminPageHeader|PageHeader|PageTitle)[^>]*title=(?:"([^"]+)"|'([^']+)'|\{['"]([^'"]+)['"]\})/]
  const files = [...filesOf(dir)].sort((a, b) => (/\/index\.js$/.test(b) ? 1 : 0) - (/\/index\.js$/.test(a) ? 1 : 0))
  for (const pat of pats) {
    for (const p of files) {
      if (!fs.existsSync(p)) continue
      const m = fs.readFileSync(p, 'utf8').match(pat)
      const t = m && (m[1] || m[2] || m[3])
      if (t && CJK.test(t)) return t
    }
  }
  return null
}
const row = r => {
  const dir = viewDirOf(r.comp)
  const i = dir && info[dir]
  let title = menuTitle[r.path] || (dir && (titleOfView(dir) || TITLE_OVERRIDE[dir])) || dir || '(轉址)'
  if (/duplicate/.test(r.path) && !/複製/.test(title)) title += '（複製）'
  const tag = []
  if (i && i.prints) tag.push('🖨 有列印')
  if (dir && NOTE[dir]) tag.push(NOTE[dir])
  if (DYNAMIC.test(r.path)) tag.push('需帶 ID，從列表點進去')
  const mui = i ? (i.muiFiles ? `${i.muiFiles}/${i.files}` : '0') : '-'
  const link = DYNAMIC.test(r.path) ? `\`${r.path}\`` : `[\`${r.path}\`](${URL_BASE}${r.path})`
  return { r, dir, title, line: `| ☐ | ${title} | ${link} | ${i ? i.status : '-'} | ${mui} | ${tag.join('；')} |` }
}
const HEAD = '| 檢查 | 頁面 | 網址 | 改版狀態 | 殘留 MUI 檔數／檔案數 | 檢查重點 |\n|---|---|---|---|---|---|'

const byPath = Object.fromEntries(routes.map(r => [r.path, r]))
const used = new Set()
const out = []
const dash = routes.filter(r => r.layout === 'DashboardLayout')
let md = ''

// 後台：依選單分類
md += '## A. 後台——選單上的頁面\n\n'
menu.forEach(m => {
  const rows = m.items.map(i => byPath[i.href] && row(byPath[i.href])).filter(Boolean)
  if (!rows.length) return
  rows.forEach(x => used.add(x.r.path))
  md += `### ${m.title}\n\n${HEAD}\n${rows.map(x => x.line).join('\n')}\n\n`
})

// 後台：子頁面
const rest = dash.filter(r => !used.has(r.path))
const groups = {}
rest.forEach(r => { const g = '/' + r.path.split('/')[1]; (groups[g] = groups[g] || []).push(r) })
md += '## B. 後台——新增／編輯／明細等子頁面（從列表頁點進去）\n\n'
md += `${HEAD}\n${rest.map(r => row(r).line).join('\n')}\n\n`

// 顧客端、登入、錯誤、其他
const other = (layoutName, heading, note) => {
  const rs = routes.filter(r => r.layout === layoutName)
  if (!rs.length) return ''
  return `## ${heading}\n\n${note ? note + '\n\n' : ''}${HEAD}\n${rs.map(r => row(r).line).join('\n')}\n\n`
}
md += other('Customer', 'C. 顧客端（手機版）', '> 這些頁面給顧客用，請用手機或手機寬度檢查。')
md += other('AuthLayout', 'D. 登入／註冊')
md += other('ErrorLayout', 'E. 錯誤頁')
md += other('EHSLayout', 'F. LINE／EHS（決定不改版）')
const lonely = routes.filter(r => !['DashboardLayout', 'Customer', 'AuthLayout', 'ErrorLayout', 'EHSLayout'].includes(r.layout) && r.path !== '/')
md += `## G. 其他（決定不改版）\n\n${HEAD}\n${lonely.map(r => row(r).line).join('\n')}\n\n`

// ---------- 5. 沒改／沒被路由使用的頁面目錄 ----------
const routedDirs = new Set(routes.map(r => viewDirOf(r.comp)).filter(Boolean))
const unchanged = views.filter(d => info[d].status === '⚪ 沒改')
const orphan = views.filter(d => !routedDirs.has(d) && d !== 'UiPreview')
const count = s => views.filter(d => info[d].status.startsWith(s)).length
const doneRoutes = routes.filter(r => { const d = viewDirOf(r.comp); return d && info[d] && info[d].status.startsWith('🟢') }).length
let head = `# 改版頁面檢查清單\n\n> 自動產生（\`node scripts/redesign/page-checklist.js\`），產生時間：${new Date().toISOString().slice(0, 16).replace('T', ' ')}　改版前基準：\`${BASE}\`\n>\n`
head += `> 網址欄的連結指向 \`${URL_BASE}\`（本機執行 \`npm start\` 後可直接點；後端接測試機）。要換成別的網址：\`node scripts/redesign/page-checklist.js --url https://你的測試網址\`。有 \`:id\` 的頁面要從列表頁點進去。\n>\n`
head += '> 狀態說明：🟢 已改版＝頁面的 MUI 元件已換成新元件；🟡 只換外觀＝只有色碼與圖示統一，版面是舊的；⚪ 沒改。\n> 「殘留 MUI」是這個頁面目錄裡還在用 MUI 的檔案數，不為 0 不代表有問題（日期選擇器、Autocomplete、列印表格等刻意保留）。\n\n'
head += `## 總覽\n\n| 項目 | 數量 |\n|---|---|\n| 頁面目錄總數 | ${views.length} |\n| 🟢 已改版 | ${count('🟢')} |\n| 🟡 只換外觀 | ${count('🟡')} |\n| ⚪ 沒改 | ${count('⚪')} |\n| 有路由的頁面（網址）數 | ${routes.length} |\n| 其中屬於已改版目錄的網址數 | ${doneRoutes} |\n\n`
head += '建議檢查順序：先看標 **金額重點** 的頁面（打帳單、帳單詳細、日結、薪資、入金），再看 **🖨 有列印** 的頁面（按列印預覽），最後走一遍選單。\n\n'

let tail = '## H. 沒改的頁面目錄\n\n'
tail += unchanged.length ? unchanged.map(d => `- \`${d}\`${routedDirs.has(d) ? '' : '（沒有被任何路由使用，疑似舊程式碼）'}`).join('\n') : '（無）'
tail += '\n\n## I. 沒有被任何路由使用的頁面目錄（不會出現在網站上）\n\n'
tail += orphan.length ? orphan.map(d => `- \`${d}\`　${info[d].status}`).join('\n') : '（無）'
tail += '\n'
fs.writeFileSync('docs/redesign/PAGE_CHECKLIST.md', head + md + tail)
console.log(JSON.stringify({ views: views.length, routes: routes.length, done: count('🟢'), l1only: count('🟡'), unchanged: unchanged.length, orphan: orphan.length }))
