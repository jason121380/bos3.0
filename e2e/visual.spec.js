// 全站畫面掃描：每個後台路由在手機（390×844）與桌機（1366×800）各開一次，主要頁面另跑深色模式。
// 每頁檢查：(a) 沒有出現錯誤邊界「這個頁面發生錯誤」；(b) 沒有橫向捲動；(c) 沒有未捕捉的 console error。
// 另外每頁再開一次「所有查詢都失敗」：後端掛掉時頁面要顯示查詢失敗畫面或空畫面，不能整頁錯誤（PR #315 修過的白頁）。
// 為什麼要有：PR #315 前網路一出錯就整頁白頁、手機寬度的標題被擠成直排都是使用者回報才知道；
// 這支掃描讓每個 PR 在合併前就自動看過每一頁。資料全是假的，不連任何後端。
const { test, expect } = require('@playwright/test')
const { respondGraphql } = require('./fake-graphql')
const { dashboardRoutes } = require('./routes')
const KNOWN_ISSUES = require('./known-issues')

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1366, height: 800 },
}
const DARK_ROUTES = [
  '/order/create',
  '/management/orders',
  '/products',
  '/employee-daily-report',
  '/merchant-business-interval-report',
  '/dashboard-list-detail',
  '/parameter',
  '/profile/general',
]
// 不算頁面問題的 console 訊息：本測試刻意 abort 的外部連線、WebSocket 解析失敗
const IGNORED_CONSOLE = /Failed to load resource|net::ERR_|ERR_NAME_NOT_RESOLVED|WebSocket|websocket|socket\.io/i

// viewports：'mobile'／'desktop'／'all'（= 手機＋桌機，含深色）／'failAll'（所有查詢失敗情境，要單獨列，'all' 不含它）
const knownFor = (route, vp) =>
  KNOWN_ISSUES.filter(k => k.route === route && (k.viewports === vp || (k.viewports === 'all' && vp !== 'failAll'))).flatMap(k => k.skip)

async function openPage(page, route, { dark = false, failAll = false } = {}) {
  const errors = []
  page.on('console', m => {
    if (m.type() === 'error' && !IGNORED_CONSOLE.test(m.text())) errors.push(m.text().slice(0, 300))
  })
  page.on('pageerror', e => errors.push(`pageerror: ${String(e).slice(0, 300)}`))
  await page.addInitScript(isDark => {
    try {
      localStorage.setItem('user', JSON.stringify({ id: 'user-1', name: '測試店長', isAdmin: false, isNeedChangePassword: false }))
      localStorage.setItem('userMerchant', JSON.stringify({ id: 'merchant-1', name: '測試店' }))
      localStorage.setItem('token', 'fake-token')
      localStorage.setItem('bosTheme:user-1', isDark ? 'DARK' : 'DEFAULT')
      sessionStorage.setItem('businessTimeZoneNotice', '1')
    } catch (e) {
      // 忽略
    }
  }, dark)
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
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(respondGraphql(body, { failAll })) })
    }
    if (url.startsWith(base)) return r.continue()
    return r.abort()
  })
  await page.goto(route, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
  await page.waitForTimeout(400)
  return errors
}

async function inspect(page) {
  return page.evaluate(() => {
    const de = document.documentElement
    return {
      // 只認錯誤邊界本身（components/PageErrorBoundary 的 role="alert" 區塊），不比對整頁文字：
      // 版本更新紀錄等頁面的內容可能正好寫到「這個頁面發生錯誤」這幾個字（2026/10/30 CI 曾因此誤判）
      crash: Array.from(document.querySelectorAll('[role="alert"]')).some(el => (el.innerText || '').includes('這個頁面發生錯誤')),
      scrollWidth: de.scrollWidth,
      clientWidth: de.clientWidth,
    }
  })
}

function assertPage(info, errors, skip) {
  if (!skip.includes('crash')) expect(info.crash, '出現錯誤邊界「這個頁面發生錯誤」').toBe(false)
  if (!skip.includes('hScroll'))
    expect(info.scrollWidth, `橫向捲動：scrollWidth ${info.scrollWidth} > clientWidth ${info.clientWidth}`).toBeLessThanOrEqual(info.clientWidth + 1)
  if (!skip.includes('console')) expect(errors, '未捕捉的 console error').toEqual([])
}

const routes = dashboardRoutes()

test.describe.configure({ mode: 'parallel' })

for (const route of routes) {
  for (const [vp, size] of Object.entries(VIEWPORTS)) {
    test(`${route} ${vp}`, async ({ page }) => {
      await page.setViewportSize(size)
      const errors = await openPage(page, route)
      const info = await inspect(page)
      const skip = knownFor(route, vp)
      if (skip.length) test.info().annotations.push({ type: 'known-issue', description: skip.join(',') })
      assertPage(info, errors, skip)
    })
  }
}

for (const route of DARK_ROUTES) {
  test(`${route} desktop dark`, async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    const errors = await openPage(page, route, { dark: true })
    expect(await page.evaluate(() => document.documentElement.classList.contains('dark')), '深色模式沒有套用').toBe(true)
    const info = await inspect(page)
    assertPage(info, errors, knownFor(route, 'desktop'))
  })
}

// 後端掛掉（所有查詢回 GraphQL 錯誤）：只檢查不會進錯誤邊界。這個情境不依賴假資料的形狀，所有頁面都必須通過。
for (const route of routes) {
  test(`${route} all queries fail`, async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await openPage(page, route, { failAll: true })
    const info = await inspect(page)
    const skip = knownFor(route, 'failAll')
    if (!skip.includes('crash')) expect(info.crash, '所有查詢失敗時出現錯誤邊界「這個頁面發生錯誤」').toBe(false)
  })
}
