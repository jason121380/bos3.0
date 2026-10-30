// 執行：NODE_PATH=/home/box/.npm/_npx/e41f203b7505f1fb/node_modules node scripts/redesign/compat-harness/e2e/dialog-layers-run.js /tmp/dialog-layers-harness
// 建置（在 repo 根目錄執行；使用現有套件，不安裝任何依賴）：
// ESBUILD=$PWD/node_modules/esbuild node scripts/redesign/compat-harness/build.js scripts/redesign/compat-harness/e2e/dialog-layers-entry.js /tmp/dialog-layers-harness
// printf '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n' > /tmp/dialog-layers-tailwind.css
// node_modules/.bin/tailwindcss -i /tmp/dialog-layers-tailwind.css -o /tmp/dialog-layers-harness/tailwind.css --minify
// 全程不需要後端；沒有 force 點選，所有互動均由瀏覽器檢查可操作性。
const fs = require('fs')
const path = require('path')
const assert = require('assert').strict
const { chromium } = require('playwright')
const directory = path.resolve(process.argv[2] || '/tmp/dialog-layers-harness')
const html = '<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/entry.css"><link rel="stylesheet" href="/tailwind.css"><div id="root"></div><script src="/entry.js"></script>'
const focusInside = async (page, selector) => { await page.waitForFunction(selector => { const el = document.querySelector(selector); return el && el.contains(document.activeElement) }, selector, { timeout: 4000 }) }
const exists = async (page, selector) => assert(await page.locator(selector).isVisible(), `${selector} 應保持開啟`)
const delay = page => page.waitForTimeout(150)
async function main() {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1'] })
  let failed = 0
  for (const kind of ['desktop', 'mobile', 'combobox', 'select', 'popover', 'dropdown', 'nested-password', 'nested-date', 'customer-form', 'reservation', 'click-away']) {
    const context = await browser.newContext({ viewport: { width: 1000, height: 850 }, hasTouch: false })
    // 以路由直接提供靜態檔，受限環境也不必開監聽埠；所有非本機請求一律中止。
    await context.route('**/*', route => {
      const url = new URL(route.request().url())
      if (!['127.0.0.1', 'localhost'].includes(url.hostname)) return route.abort()
      if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: html })
      const file = path.join(directory, path.basename(url.pathname))
      if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: '' })
      return route.fulfill({ contentType: file.endsWith('.css') ? 'text/css' : 'application/javascript', body: fs.readFileSync(file) })
    })
    const page = await context.newPage()
    page.setDefaultTimeout(4000)
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    try {
      await page.goto(`http://127.0.0.1/?${kind}`)
      await delay(page)
      if (kind === 'click-away') {
        const after = page.locator('#after-btn')
        for (const [trigger, popup, modal] of [
          ['#away-select', '[role="listbox"]', true],
          ['#away-popover', '#away-panel', false],
          ['button[aria-label^="選擇日期"]', '[role="grid"]', false],
          ['button[aria-haspopup="listbox"]:not(#away-select)', '[role="listbox"]', false],
        ]) {
          await page.locator(trigger).click()
          await exists(page, popup)
          // modal Select 封鎖背景指標；實際滑鼠第一下只解散選單，再點一次才操作背景按鈕。
          // 用座標送真實滑鼠事件，不以 force 繞過瀏覽器命中測試。
          const box = await after.boundingBox()
          assert(box, '下一個按鈕必須可見')
          if (!modal) assert(await after.evaluate(el => {
            const r = el.getBoundingClientRect()
            return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
          }), '下一個按鈕不可被浮層覆蓋')
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
          await page.locator(popup).waitFor({ state: 'detached' })
          await exists(page, '#lower')
          if (modal) {
            await focusInside(page, trigger)
            await after.click()
          }
          await page.waitForFunction(() => document.activeElement === document.getElementById('after-btn'))
          await exists(page, '#lower')
        }
      } else if (kind === 'reservation') {
        await page.locator('#open-upper').click()
        await page.getByRole('combobox').click()
        await page.getByRole('option', { name: '染髮' }).click()
        assert.equal(await page.getByRole('combobox').inputValue(), '染髮')
        await page.getByRole('combobox').click()
        await page.keyboard.press('Escape')
        await page.getByRole('listbox').waitFor({ state: 'detached' })
        await exists(page, '#upper')
        await page.locator('#upper button[aria-label^="選擇日期"]').click()
        await page.getByRole('gridcell', { name: '2026年10月25日', exact: true }).focus()
        await page.keyboard.press('Escape')
        await page.getByRole('gridcell').first().waitFor({ state: 'detached' })
        await exists(page, '#upper')
        await page.locator('#open-password').click()
        const password = page.getByRole('dialog', { name: '預約取消密碼' })
        await password.getByLabel('取消密碼').fill('測試密碼')
        await page.keyboard.press('Escape')
        assert(await password.isVisible(), '無 onClose 的密碼窗不可因 Esc 關閉')
        await exists(page, '#upper')
        await exists(page, '#lower')
        await password.getByRole('button', { name: '取消', exact: true }).click()
        await password.waitFor({ state: 'detached' })
        await focusInside(page, '#open-password')
        await page.keyboard.press('Escape')
        await page.locator('#upper').waitFor({ state: 'detached' })
        await exists(page, '#lower')
      } else if (kind === 'customer-form') {
        await page.locator('input[role="combobox"]').click()
        await page.getByRole('option', { name: '染髮' }).click()
        assert.equal(await page.locator('#value').textContent(), '染髮')
        await exists(page, '#lower')
        await page.locator('input[role="combobox"]').click()
        await exists(page, '[role="listbox"]')
        await page.keyboard.press('Escape')
        await page.getByRole('listbox').waitFor({ state: 'detached' })
        await exists(page, '#lower')
        // NativeSelect 同層的隱藏 select，選值型別與既有表單相同。
        await page.locator('select[name="gender"]').selectOption({ label: '女' })
        assert.equal(await page.locator('select[name="gender"] option:checked').textContent(), '女')
        await exists(page, '#lower')
        const openDate = async () => page.locator('button[aria-label^="選擇日期"]').click()
        await openDate()
        await page.getByRole('gridcell', { name: '2026年10月25日', exact: true }).click()
        assert((await page.evaluate(() => window.__events)).some(e => e[0] === 'date' && e[1] === 25))
        await exists(page, '#lower')
        await openDate()
        await page.getByRole('gridcell', { name: '2026年10月24日', exact: true }).focus()
        await page.keyboard.press('Escape')
        await page.getByRole('gridcell').first().waitFor({ state: 'detached' })
        await exists(page, '#lower')
        await focusInside(page, '#lower')
        await page.keyboard.press('Escape')
        await exists(page, '#lower')
        await page.mouse.click(5, 5)
        await exists(page, '#lower')
        assert.equal(await page.locator('#lower button[aria-label="關閉"]').count(), 0)
        assert(!(await page.evaluate(() => window.__events)).some(e => e[0] === 'lower'), 'Esc／背景不可要求關閉受控表單')
        await page.locator('#close-customer').click()
      } else if (kind === 'desktop'  || kind === 'mobile') {
        const open = async () => { if (kind === 'mobile') await page.locator('#date-field').click(); else await page.locator('button[aria-label^="選擇日期"]').click(); await delay(page) }
        await open()
        const cell = page.locator('button[role="gridcell"]').filter({ hasText: /^25$/ }).first()
        await cell.click()
        await exists(page, '#lower')
        assert((await page.evaluate(() => window.__events)).some(e => e[0] === 'date' && e[1] === 25), '選日期必須回呼 onChange')
        assert(!(await page.evaluate(() => window.__events)).some(e => e[0] === 'lower'), '點選日期不可呼叫 onOpenChange')
        await open()
        await page.locator('button[role="gridcell"]').filter({ hasText: /^24$/ }).first().focus()
        await focusInside(page, '[role="dialog"]:has([role="gridcell"])') // 日期層改正式 ui/dialog 後不再輸出 .MuiDialog-paper；桌機與手機共用同一選擇器
        await page.keyboard.press('Escape'); await delay(page)
        assert.equal(await page.locator('button[role="gridcell"]').count(), 0, '第一次 Esc 僅關閉日期層')
        await exists(page, '#lower')
        await focusInside(page, '#lower')
      } else if (kind === 'combobox') {
        await page.evaluate(() => { window.__stage = '首次選取' })
        await page.getByRole('combobox').click()
        await page.getByRole('option', { name: '染髮' }).click()
        assert.equal(await page.locator('#value').textContent(), '染髮')
        await exists(page, '#lower')
        await page.evaluate(() => { window.__stage = '重開選單後Esc' })
        await page.getByRole('combobox').click()
        await exists(page, '[role="listbox"]')
        await page.keyboard.press('Escape'); await delay(page)
        assert.equal(await page.getByRole('listbox').count(), 0, '第一次 Esc 只關閉 combobox 選單')
        await exists(page, '#lower')
      } else if (kind === 'select') {
        await page.locator('#select-trigger').click()
        await page.getByRole('option', { name: '染髮' }).click()
        assert.equal(await page.locator('#value').textContent(), '染髮')
        await page.getByRole('listbox').waitFor({ state: 'detached' })
        await exists(page, '#lower')
      } else if (kind === 'popover') {
        await page.locator('#popover-trigger').click()
        await page.locator('#popover-input').fill('可輸入')
        await focusInside(page, '[data-radix-popper-content-wrapper]')
        await page.locator('#popover-button').click()
        assert.equal(await page.locator('#value').textContent(), '已點擊')
        await page.keyboard.press('Escape')
        await page.locator('#popover-input').waitFor({ state: 'detached' })
        await exists(page, '#lower')
      } else if (kind === 'nested-password') {
        await page.getByRole('combobox').click()
        await page.getByRole('option', { name: '染髮' }).click()
        assert.equal(await page.locator('#value').textContent(), '染髮')
        await page.locator('#open-upper').click()
        const password = page.getByRole('dialog', { name: '巢狀操作密碼' })
        await password.getByLabel('操作密碼').fill('測試密碼')
        await page.keyboard.press('Escape')
        await exists(page, '#lower')
        assert(await password.isVisible(), 'PasswordDialog 原無 onClose，Esc 不可關閉任何一層')
        await focusInside(page, '[role="dialog"]:has(input[type="password"])')
        assert(!(await page.evaluate(() => window.__events)).some(e => e[0] === 'lower'), '密碼窗操作不得關閉預約窗')
        await password.getByRole('button', { name: '取消', exact: true }).click()
        await password.waitFor({ state: 'detached' })
        await focusInside(page, '#open-upper')
        await page.locator('#open-upper').click()
        await password.getByLabel('操作密碼').fill('第二次密碼')
        await password.getByRole('button', { name: '確認', exact: true }).click()
        await password.waitFor({ state: 'detached' })
        assert((await page.evaluate(() => window.__events)).some(e => e[0] === '密碼確認' && e[1] === '第二次密碼'), '實際 PasswordDialog 必須保留輸入與確認回呼')
        await focusInside(page, '#open-upper')
      } else if (kind === 'nested-date') {
        await page.locator('#open-upper').click()
        await page.locator('#upper').waitFor({ state: 'visible' })
        await page.locator('#upper button[aria-label^="選擇日期"]').click()
        await page.getByRole('gridcell', { name: '2026年10月25日', exact: true }).click()
        await exists(page, '#upper')
        assert((await page.evaluate(() => window.__events)).some(e => e[0] === '巢狀日期' && e[1] === 25))
        await page.locator('#nested-mobile-date').click()
        await page.getByRole('gridcell', { name: '2026年10月26日', exact: true }).click()
        await page.getByRole('gridcell').first().waitFor({ state: 'detached' })
        await exists(page, '#upper')
        assert((await page.evaluate(() => window.__events)).some(e => e[0] === '巢狀手機日期' && e[1] === 26))
        await page.locator('#upper button[aria-label^="選擇日期"]').click()
        await page.getByRole('gridcell', { name: '2026年10月24日', exact: true }).focus()
        await page.keyboard.press('Escape')
        await page.getByRole('gridcell').first().waitFor({ state: 'detached' })
        await focusInside(page, '#upper')
        assert(!(await page.evaluate(() => window.__events)).some(e => e[0] === 'lower' || e[0] === 'upper'), '三層日期操作不可關閉任一外層')
        await page.keyboard.press('Escape')
        await page.locator('#upper').waitFor({ state: 'detached' })
        await focusInside(page, '#lower')
      } else {
        await page.locator('#show-toast').click()
        await page.locator('#open-upper').click(); await delay(page)
        await page.locator('#upper-input').fill('上層焦點')
        await focusInside(page, '#upper')
        const topVisible = await page.locator('#upper-input').evaluate(el => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)) })
        assert(topVisible, '後開對話框必須在視覺最上層')
        // 對話框會對應用程式根節點加 aria-hidden；CSS 定位仍須通過真實命中與可見性檢查。
        await exists(page, '[role="alert"]')
        const toastVisible = await page.locator('[role="alert"]').evaluate(el => {
          const r = el.getBoundingClientRect()
          return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
        })
        assert(toastVisible, '全站提示必須保持在所有對話框上方')
        if (kind === 'dropdown') {
          await page.locator('#dropdown-trigger').click(); await delay(page)
          await focusInside(page, '[role="menu"]')
          const menuVisible = await page.locator('#dropdown-item').evaluate(el => {
            const r = el.getBoundingClientRect()
            return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
          })
          assert(menuVisible, '後開選單必須在兩層對話框上方')
          await page.keyboard.press('Escape'); await delay(page)
          await page.getByRole('menu').waitFor({ state: 'detached' })
          assert.equal(await page.getByRole('menu').count(), 0, 'Esc 只關閉最上層選單')
          await exists(page, '#upper')
          await focusInside(page, '#upper')
        }
        await page.keyboard.press('Escape'); await delay(page)
        await page.locator('#upper').waitFor({ state: 'detached' })
        assert.equal(await page.locator('#upper').count(), 0, '第一次 Esc 關閉上層')
        await exists(page, '#lower')
        await focusInside(page, '#open-upper')
      }
      if (kind !== 'customer-form') await page.keyboard.press('Escape'); await delay(page)
      await page.locator('#lower').waitFor({ state: 'detached' })
      assert.equal(await page.locator('#lower').count(), 0, '最後 Esc 關閉下層')
      await page.waitForFunction(() => !document.body.style.pointerEvents && !document.body.hasAttribute('data-scroll-locked') && document.body.style.overflow !== 'hidden')
      assert.deepEqual(errors, [])
      console.log(`PASS ${kind}`)
    } catch (error) {
      failed++
      console.error(`FAIL ${kind}: ${error.message}`)
      console.error('狀態', JSON.stringify(await page.evaluate(() => ({ stage: window.__stage, events: window.__events, focusEvents: window.__focus, scopes: window.__scopes, layers: [...document.querySelectorAll('[data-state], [role=dialog]')].map(el => [el.id, el.getAttribute('data-state'), el.style.zIndex]), focus: document.activeElement && document.activeElement.outerHTML.slice(0, 250), bodyPointer: document.body.style.pointerEvents })), null, 2))
    } finally { await context.close() }
  }
  await browser.close()
  if (failed) process.exitCode = 1
}
main().catch(error => { console.error(error); process.exitCode = 1 })
