// 資料晚到掃描：每個後台路由，讓頁面的每個查詢「輪流」比其他查詢晚回來，檢查頁面不會進錯誤邊界。
// 為什麼要有：真實網路下查詢回來的順序不固定。PR #320 的會員卡類別比清單晚到就整頁錯誤（MEMORY #203），
// 這類 bug 只有在某個查詢剛好最後回來時才會出現，本機與一般畫面掃描（所有查詢同時回）都看不到。
// 做法：
//   1. 先正常開一次頁面，記下頁面送出的查詢（操作名稱），也記下這時已有的 console error（基準，不算晚到造成的）。
//   2. 對每個「頁面自己的」查詢：重新載入頁面，只讓這個查詢延遲 LATE_MS 毫秒再回，其餘立即回。
//   3. 等它回來、畫面穩定後檢查：沒有錯誤邊界「這個頁面發生錯誤」、沒有基準以外新的未捕捉錯誤。
//   版面（側欄、頂列）共用的查詢另外整組延遲一次，不逐一做（每頁都一樣，逐一做只會重複）。
//   另跑一次「頁面查詢倒序回來」（先送的最晚回），涵蓋某個查詢最先回、其他都還沒回的順序。
// 資料全是假的（e2e/fake-graphql.js），外部連線一律 abort，不連任何後端（CLAUDE.md 鐵則 5）。
// 只跑這支：npx playwright test -c e2e/playwright.config.js late-arrival
const { test, expect } = require('@playwright/test')
const crypto = require('crypto')
const { respondGraphql } = require('./fake-graphql')
const { dashboardRoutes } = require('./routes')
const KNOWN_ISSUES = require('./known-issues')

const LATE_MS = Number(process.env.E2E_LATE_MS || 800)
const IGNORED_CONSOLE = /Failed to load resource|net::ERR_|ERR_NAME_NOT_RESOLVED|WebSocket|websocket|socket\.io/i
// 版面（Dashboard 側欄／頂列／首屏後延後載入）每頁都會送的查詢：整組延遲一次
const LAYOUT_OPS = new Set([
  'FETCH_PROFILE_IDENDITY',
  'PROFILE',
  'GET_MERCHANT_AUTHORITIES',
  'FETCH_USER',
  'GET_IS_MEMBERSHIP_CARD_ACTIVE',
  'GET_IS_REPORT_LIST_EXTENDED',
  'GET_CUSTOMER_BONUS',
  'GET_DISBLE_PENDING_ORDER',
  'CHECK_PAGE_AUTHORITY',
  'GET_USING_ORDER_QUEUE',
  'GET_USERS_PINNED_TABLE',
  'GET_USER_MERCHANTS',
])
const LAYOUT = '(版面查詢整組)'
// 頁面查詢「先送的後回」：依送出順序遞減延遲，涵蓋「某個查詢最先回、其他都還沒回」的順序
const REVERSE = '(頁面查詢倒序)'

// 假資料不足的頁面（known-issues 的 crash）一般情境就會錯，晚到掃描沒有意義，略過
const skipRoute = route => KNOWN_ISSUES.some(k => k.route === route && k.viewports === 'all' && k.skip.includes('crash'))

// 查詢的識別：有 operationName 用它；匿名查詢（例如 useFetchProducts）用查詢內容的雜湊，
// 才不會被排除在晚到情境之外（Codex，PR #324）
function opId(body) {
  if (body.operationName) return body.operationName
  const text = (body.query || '').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  const root = (text.match(/\{\s*([A-Za-z_]\w*)/) || [])[1] || 'query'
  return `anon:${root}:${crypto.createHash('sha1').update(text).digest('hex').slice(0, 8)}`
}

async function setup(page) {
  const state = { late: null, ops: [], errors: [], pendingLate: 0, pageOpCount: 0 }
  page.on('console', m => {
    if (m.type() === 'error' && !IGNORED_CONSOLE.test(m.text())) state.errors.push(m.text().split('\n')[0].slice(0, 300))
  })
  page.on('pageerror', e => state.errors.push(`pageerror: ${String(e).slice(0, 300)}`))
  await page.addInitScript(() => {
    try {
      localStorage.setItem('user', JSON.stringify({ id: 'user-1', name: '測試店長', isAdmin: false, isNeedChangePassword: false }))
      localStorage.setItem('userMerchant', JSON.stringify({ id: 'merchant-1', name: '測試店' }))
      localStorage.setItem('token', 'fake-token')
      localStorage.setItem('bosTheme:user-1', 'DEFAULT')
      sessionStorage.setItem('businessTimeZoneNotice', '1')
    } catch (e) {
      // 忽略
    }
  })
  const base = new URL(test.info().project.use.baseURL || 'http://127.0.0.1:4173').origin
  await page.route('**/*', async r => {
    const url = r.request().url()
    if (/\/graphql(\?|$)/.test(url) && r.request().method() === 'POST') {
      let body = {}
      try {
        body = JSON.parse(r.request().postData() || '{}')
      } catch (e) {
        body = {}
      }
      const name = opId(body)
      const isQuery = /^\s*(query\b|\{)/.test(body.query || '')
      if (isQuery) state.ops.push(name)
      let wait = 0
      if (state.late && isQuery) {
        if (state.late === LAYOUT) wait = LAYOUT_OPS.has(name) ? LATE_MS : 0
        else if (state.late === REVERSE) wait = LAYOUT_OPS.has(name) ? 0 : Math.max(0, LATE_MS - 200 * state.pageOpCount++)
        else wait = name === state.late ? LATE_MS : 0
      }
      const late = wait > 0
      if (late) {
        state.pendingLate += 1
        await new Promise(resolve => setTimeout(resolve, wait))
      }
      try {
        await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(respondGraphql(body)) })
      } catch (e) {
        // 頁面已換掉（下一輪重新載入）時 fulfill 會失敗，忽略
      }
      if (late) state.pendingLate -= 1
      return undefined
    }
    if (url.startsWith(base)) return r.continue()
    return r.abort()
  })
  return state
}

async function load(page, state, route, late) {
  state.late = late
  state.pageOpCount = 0
  state.ops = []
  state.errors = []
  await page.goto(route, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle', { timeout: 8000 + LATE_MS }).catch(() => {})
  // 延遲的查詢可能是其他查詢回來後才送出的，等它真的回來
  for (let i = 0; i < 40 && state.pendingLate > 0; i++) await page.waitForTimeout(100)
  await page.waitForTimeout(400)
  const crash = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[role="alert"]')).some(el => (el.innerText || '').includes('這個頁面發生錯誤'))
  )
  return { crash, ops: [...state.ops], errors: [...state.errors] }
}

test.describe.configure({ mode: 'parallel' })

for (const route of dashboardRoutes()) {
  test(`${route} late arrival`, async ({ page }) => {
    test.skip(skipRoute(route), '假資料不足（known-issues），一般情境已會出錯')
    await page.setViewportSize({ width: 1366, height: 800 })
    const state = await setup(page)
    const baseline = await load(page, state, route, null)
    expect(baseline.crash, '一般情境（沒有延遲）就出現錯誤邊界').toBe(false)
    const pageOps = [...new Set(baseline.ops.filter(n => n && !LAYOUT_OPS.has(n)))]
    const lates = [...pageOps, LAYOUT, ...(pageOps.length > 1 ? [REVERSE] : [])]
    test.setTimeout(30000 + lates.length * (LATE_MS + 4000))
    const failures = []
    for (const late of lates) {
      const result = await load(page, state, route, late)
      const newErrors = result.errors.filter(e => !baseline.errors.includes(e))
      if (result.crash || newErrors.length) failures.push({ late, crash: result.crash, errors: newErrors.slice(0, 3) })
    }
    test.info().annotations.push({ type: 'late-ops', description: lates.join(',') })
    expect(failures, `這些查詢晚到時頁面出錯（late＝延遲的查詢）`).toEqual([])
  })
}
