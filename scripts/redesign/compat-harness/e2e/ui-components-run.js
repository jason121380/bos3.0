// 建置方式與 dialog-layers 相同，輸出目錄改為 /tmp/ui-components-harness。
// ESBUILD=$PWD/node_modules/esbuild node scripts/redesign/compat-harness/build.js scripts/redesign/compat-harness/e2e/ui-components-entry.js /tmp/ui-components-harness
// printf '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n' > /tmp/ui-components-tailwind.css
// node_modules/.bin/tailwindcss -i /tmp/ui-components-tailwind.css -o /tmp/ui-components-harness/tailwind.css --minify
// NODE_PATH=/home/box/.npm/_npx/e41f203b7505f1fb/node_modules node scripts/redesign/compat-harness/e2e/ui-components-run.js /tmp/ui-components-harness
const fs = require('fs')
const path = require('path')
const assert = require('assert').strict
const { chromium } = require('playwright')
const directory = path.resolve(process.argv[2] || '/tmp/ui-components-harness')
const html =
  '<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/entry.css"><link rel="stylesheet" href="/tailwind.css"><div id="root"></div><script src="/entry.js"></script>'
async function main() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1'],
  })
  let failed = 0
  for (const kind of ['tree-mouse', 'tree-keyboard', 'rating', 'tag']) {
    const context = await browser.newContext({ viewport: { width: 1000, height: 850 }, hasTouch: false })
    // 只供應本機靜態檔，所有外部請求一律中止；DNS 同時阻擋 WebSocket。
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
      await page.getByRole('dialog').waitFor()
      const group = page.getByRole('treeitem', { name: '群組', exact: true })
      if (kind === 'tree-mouse') {
        await page.getByText('群組', { exact: true }).click()
        assert.equal(await group.getAttribute('aria-expanded'), 'true')
        const a = page.getByRole('treeitem', { name: '甲店', exact: true })
        await a.click()
        assert.equal(await a.getAttribute('aria-selected'), 'true')
        // 等待選取色的 transition 完成；過渡中的混色不是最終樣式。
        await page.waitForFunction(() => {
          const row = document.querySelector('[data-node-id="a"] [data-tree-content]')
          if (!row) return false
          const style = getComputedStyle(row)
          // 底色與字色都在 transition-colors 內，兩者都到終值才斷言。
          return style.backgroundColor === 'rgba(26, 115, 232, 0.12)' && style.color === 'rgb(26, 115, 232)'
        })
        const selectedStyle = await a
          .locator('[data-tree-content]')
          .evaluate(el => ({ background: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color }))
        assert(selectedStyle.background.endsWith(', 0.12)'), `選取底色須為 accent 12%：${selectedStyle.background}`)
        assert.equal(selectedStyle.color, 'rgb(26, 115, 232)')
        assert.equal(await page.locator('#tree-value').textContent(), 'a')
        const target = await a.locator('[data-tree-content]').boundingBox()
        assert(target.height >= 40, '樹列觸控高度至少 40px')
        await page.getByText('群組', { exact: true }).click()
        assert.equal(await page.getByRole('treeitem', { name: '甲店' }).count(), 0, '收合卸載子層')
      } else if (kind === 'tree-keyboard') {
        await group.focus()
        await page.keyboard.press('ArrowRight')
        assert.equal(await group.getAttribute('aria-expanded'), 'true')
        await page.keyboard.press('ArrowRight')
        assert.equal(await page.evaluate(() => document.activeElement.textContent), '甲店')
        await page.keyboard.press('Space')
        assert.equal(await page.locator('#tree-value').textContent(), 'a')
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        assert.equal(await page.locator('#tree-value').textContent(), 'b')
        await page.keyboard.press('ArrowLeft')
        assert(await group.evaluate(el => el === document.activeElement))
        await page.keyboard.press('ArrowLeft')
        assert.equal(await group.getAttribute('aria-expanded'), 'false')
        await page.keyboard.press('End')
        assert.equal(await page.evaluate(() => document.activeElement.textContent), '丙店')
        await page.keyboard.press('Home')
        assert(await group.evaluate(el => el === document.activeElement))
      }
      await page.keyboard.press('Escape')
      await page.getByRole('dialog').waitFor({ state: 'detached' })
      await page.waitForFunction(
        () => !document.body.style.pointerEvents && !document.body.hasAttribute('data-scroll-locked') && document.body.style.overflow !== 'hidden'
      )
      if (kind === 'rating') {
        const four = page.getByRole('radio', { name: '4 星' })
        await four.click()
        assert(await four.isChecked())
        assert.equal(await page.locator('#rating-value').textContent(), '4')
        await page.keyboard.press('ArrowLeft')
        assert(await page.getByRole('radio', { name: '3 星' }).isChecked())
        await page.keyboard.press('Space')
        assert.equal(await page.locator('#rating-value').textContent(), '空')
        await four.click()
        await four.click()
        assert.equal(await page.locator('#rating-value').textContent(), '空')
      } else if (kind === 'tag') {
        await page.getByRole('button', { name: '刪除「乾燥」' }).click()
        assert.equal(await page.getByTestId('tag-乾燥').count(), 0)
        await page.getByTestId('tag-敏感').focus()
        await page.keyboard.press('Backspace')
        assert.equal(await page.getByTestId('tag-敏感').count(), 0)
        await page.getByTestId('tag-一般').focus()
        await page.keyboard.press('Delete')
        assert.equal(await page.getByTestId('tag-一般').count(), 0)
      }
      assert.deepEqual(errors, [])
      console.log(`PASS ${kind}`)
    } catch (error) {
      failed++
      console.error(`FAIL ${kind}: ${error.message}`)
    } finally {
      await context.close()
    }
  }
  await browser.close()
  if (failed) process.exitCode = 1
}
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
