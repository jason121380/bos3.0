// 產生 e2e/fake-shapes.json：讓假 GraphQL 回出頁面能畫的形狀。
// 沒有 GraphQL schema 可查，所以用「不壓縮的 build」實際開每一頁，從錯誤訊息與出錯那行程式碼找出欄位名：
//   - `xxx.map is not a function`、`Cannot read properties of null (reading 'map')` → 該欄位其實是清單
//   - `Invalid time value` → 出錯那行用到的 *At／*Date 等欄位改給時間戳
// 只在新增頁面或查詢改了形狀、掃描因假資料出錯時重跑；結果要 commit。不連任何後端。
// 用法：npx vite build --minify false --outDir /tmp/e2e-dev
//       E2E_BUILD_DIR=/tmp/e2e-dev node e2e/static-server.js &   （另一個終端或背景）
//       E2E_BUILD_DIR=/tmp/e2e-dev node e2e/learn-shapes.js
const fs = require('fs')
const path = require('path')
const { chromium } = require('@playwright/test')
const { dashboardRoutes } = require('./routes')

const BASE = `http://127.0.0.1:${process.env.E2E_PORT || 4173}`
const BUILD = path.resolve(process.env.E2E_BUILD_DIR || path.join(__dirname, '..', 'build'))
const SHAPES_FILE = path.join(__dirname, 'fake-shapes.json')
const ARRAY_METHODS = 'map|forEach|filter|find|findIndex|reduce|some|every|sort|flatMap|slice|concat|join|includes|length|indexOf'

// src 裡所有 gql 查詢用到的欄位名：錯誤訊息裡的名字可能是頁面自己的 state（例如 attributions），
// 那種名字改假資料也沒用，只收真的出現在查詢裡的欄位
const { parse, visit } = require('graphql')
const GQL_FIELDS = (() => {
  const names = new Set()
  const walk = d =>
    fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
      const p = path.join(d, e.name)
      if (e.isDirectory()) {
        if (!/node_modules|__tests__|__test__/.test(e.name)) walk(p)
      } else if (/\.js$/.test(e.name) && !/\.test\.js$/.test(e.name)) {
        for (const m of fs.readFileSync(p, 'utf8').matchAll(/gql`([\s\S]*?)`/g)) {
          try {
            visit(parse(m[1].replace(/\$\{[^}]*\}/g, '')), { Field: n => void names.add(n.name.value) })
          } catch (err) {
            // 片段組合或無法單獨解析的查詢略過
          }
        }
      }
    })
  walk(path.join(__dirname, '..', 'src'))
  return names
})()
const isField = n => GQL_FIELDS.has(n)

const loadShapes = () => JSON.parse(fs.readFileSync(SHAPES_FILE, 'utf8'))
const saveShapes = s => {
  const out = Object.fromEntries(Object.entries(s).map(([k, v]) => [k, [...new Set(v)].sort()]))
  fs.writeFileSync(SHAPES_FILE, JSON.stringify(out, null, 2) + '\n')
}

// 從錯誤堆疊第一個本站 frame 取出那一行程式碼（不壓縮 build，所以是可讀的屬性名）
function sourceLine(stack) {
  const m = (stack || '').match(/\(?(http:\/\/127\.0\.0\.1:\d+)(\/assets\/[^:)]+):(\d+):(\d+)/)
  if (!m) return null
  const file = path.join(BUILD, m[2])
  if (!fs.existsSync(file)) return null
  const lines = fs.readFileSync(file, 'utf8').split('\n')
  return { text: lines[Number(m[3]) - 1] || '', col: Number(m[4]) }
}

// 出錯位置前面最後一個屬性名（`a.b.c.map` 在 col 指向 .map 時取 c）
function fieldBefore(src, prop) {
  if (!src) return null
  const before = src.text.slice(0, src.col + 40)
  const re = new RegExp(`\\.([A-Za-z_$][\\w$]*)\\s*(?:\\?\\.)?\\s*\\.?${prop}\\b`, 'g')
  let m
  let last = null
  while ((m = re.exec(before))) if (m.index <= src.col + 5) last = m[1]
  return last
}

function learn(shapes, err) {
  const msg = err.message
  let m = msg.match(new RegExp(`\\.?([A-Za-z_$][\\w$]*)\\.(${ARRAY_METHODS}) is not a function`))
  if (m && isField(m[1])) return (shapes.lists.push(m[1]), `list ${m[1]}`)
  m = msg.match(new RegExp(`Cannot read properties of null \\(reading '(${ARRAY_METHODS})'\\)`))
  if (m) {
    const f = fieldBefore(sourceLine(err.stack), m[1])
    if (f && isField(f)) return (shapes.scalarLists.push(f), shapes.lists.push(f), `list(null) ${f}`)
  }
  if (/Invalid time value/.test(msg)) {
    const src = sourceLine(err.stack)
    const names = src
      ? [...src.text.matchAll(/\.([A-Za-z_$][\w$]*(?:At|Date|date|Time|time|Day|birthday|Birthday))\b/g)].map(x => x[1]).filter(isField)
      : []
    if (names.length) return (names.forEach(n => shapes.timestamps.push(n)), `time ${names.join(',')}`)
  }
  return null
}

;(async () => {
  if (!fs.existsSync(SHAPES_FILE)) saveShapes({ lists: [], scalarLists: [], timestamps: [] })
  const browser = await chromium.launch({
    args: [
      '--host-resolver-rules=MAP *.run.app ~NOTFOUND, MAP *beautyos* ~NOTFOUND, MAP *crt-test* ~NOTFOUND, MAP *mlgroup* ~NOTFOUND, MAP *lure.com.tw ~NOTFOUND',
    ],
  })
  let routes = process.argv.slice(2).length ? process.argv.slice(2) : dashboardRoutes()
  const unresolved = {}
  for (let round = 1; round <= 12 && routes.length; round++) {
    // 每輪重新載入 fake-graphql，套用上一輪學到的形狀
    Object.keys(require.cache)
      .filter(k => k.includes(`${path.sep}e2e${path.sep}fake-`))
      .forEach(k => delete require.cache[k])
    const { respondGraphql } = require('./fake-graphql')
    const shapes = loadShapes()
    const next = []
    let learned = 0
    for (const route of routes) {
      const ctx = await browser.newContext({ viewport: { width: 1366, height: 800 } })
      await ctx.addInitScript(() => {
        localStorage.setItem('user', JSON.stringify({ id: 'user-1', name: '測試店長', isAdmin: false, isNeedChangePassword: false }))
        localStorage.setItem('userMerchant', JSON.stringify({ id: 'merchant-1', name: '測試店' }))
        localStorage.setItem('token', 'fake-token')
        sessionStorage.setItem('businessTimeZoneNotice', '1')
      })
      const page = await ctx.newPage()
      const errors = []
      page.on('pageerror', e => errors.push({ message: String(e.message || e), stack: e.stack || '' }))
      page.on('console', msg => {
        if (msg.type() !== 'error') return
        const t = msg.text()
        if (/TypeError|RangeError/.test(t)) errors.push({ message: t.split('\n')[0], stack: t })
      })
      await page.route('**/*', async r => {
        const url = r.request().url()
        if (/\/graphql/.test(url) && r.request().method() === 'POST') {
          return r.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(respondGraphql(JSON.parse(r.request().postData() || '{}'))),
          })
        }
        if (url.startsWith(BASE)) return r.continue()
        return r.abort()
      })
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded' })
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
      await page.waitForTimeout(300)
      const crashed = await page.evaluate(() => (document.body.innerText || '').includes('這個頁面發生錯誤'))
      await ctx.close()
      if (!crashed) {
        delete unresolved[route]
        continue
      }
      const got = errors.map(e => learn(shapes, e)).filter(Boolean)
      if (got.length) {
        learned += got.length
        next.push(route)
      } else unresolved[route] = errors.map(e => e.message.slice(0, 160))
    }
    saveShapes(shapes)
    console.log(`round ${round}: learned ${learned}, still crashing ${next.length + Object.keys(unresolved).length}`)
    routes = next
    if (!learned) break
  }
  await browser.close()
  fs.writeFileSync(path.join(__dirname, 'e2e-results', 'learn-unresolved.json'), JSON.stringify(unresolved, null, 1))
  console.log('unresolved:', Object.keys(unresolved).length)
})()
