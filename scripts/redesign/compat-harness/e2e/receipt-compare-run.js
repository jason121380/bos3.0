// 攔截真實 document.write，原字串存檔；另開無 app CSS 的頁面輸出收據 PNG／PDF。
const fs = require('fs')
const path = require('path')
const assert = require('assert').strict
const { execFileSync } = require('child_process')
const { chromium } = require('playwright')
const directory = path.resolve(process.argv[2])
const html =
  '<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/global.css"><link rel="stylesheet" href="/tailwind.css"><link rel="stylesheet" href="/entry.css"><link rel="stylesheet" href="/print.css"></head><body><div id="root"></div><script>window.process={env:{NODE_ENV:"production"}}</script><script src="/entry.js"></script></body></html>'
async function main() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1'],
  })
  const keys = (process.env.PRINT_KEYS || 'order-detail,draft-footer,draft-list,order-list').split(',')
  try {
    for (const key of keys)
      for (const variant of ['main', 't78', 't56']) {
        console.log(`比較 ${key}-${variant}`)
        const context = await browser.newContext({ viewport: { width: 1000, height: 1000 }, timezoneId: 'Asia/Taipei', serviceWorkers: 'block' })
        const errors = []
        await context.route('**/*', route => {
          const url = new URL(route.request().url())
          if (!['127.0.0.1', 'localhost'].includes(url.hostname)) {
            errors.push(`外部請求：${url.origin}`)
            return route.abort()
          }
          if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: html })
          const file = path.join(directory, path.basename(url.pathname))
          if (url.pathname === '/entry.css' && !fs.existsSync(file)) return route.fulfill({ contentType: 'text/css', body: '' })
          if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: '' })
          return route.fulfill({ contentType: file.endsWith('.css') ? 'text/css' : 'application/javascript', body: fs.readFileSync(file) })
        })
        const page = await context.newPage()
        page.on('pageerror', error => errors.push(error.message))
        page.on('console', msg => {
          if (msg.type() === 'error') errors.push(msg.text())
        })
        await page.goto(`http://127.0.0.1/?key=${key}&variant=${variant}`)
        await page
          .waitForFunction(() => window.receiptReady?.(), null, { timeout: 15000 })
          .catch(error => {
            throw new Error(`${key}: ${errors.join('\n')}\n${error.message}`)
          })
        await page.evaluate(() => document.fonts.ready)
        if (key === 'order-detail') {
          await page.getByRole('button', { name: '結帳並列印', exact: true }).waitFor()
          // 真實鍵盤流程與重複 F8 防護；先留足 Portal 掛載時序。
          await page.keyboard.press('F8')
          await page.keyboard.press('F8')
        } else await page.getByRole('button', { name: key === 'draft-footer' ? '列印' : '列印帳單', exact: true }).click()
        await page.waitForFunction(() => window.receiptState.writes.length === 1)
        const captured = await page.evaluate(() => window.receiptState.writes[0])
        assert(captured.includes('測試客戶甲') && captured.includes('測試剪髮'), '收據必須有假客戶與明細')
        if (key === 'order-detail') {
          assert.equal(await page.evaluate(() => window.receiptState.mutations), 1)
          assert.equal(await page.evaluate(() => window.receiptState.closed), false, '列印先於關閉')
          await page.waitForFunction(() => window.receiptState.closed)
          await page.keyboard.press('F8')
          assert.equal(await page.evaluate(() => window.receiptState.writes.length), 1)
          assert.equal(await page.evaluate(() => window.receiptState.mutations), 1)
          assert.equal(await page.locator('#DivIdToPrint').count(), 0)
        }
        if (errors.length) throw new Error(`${key}: ${errors.join('\n')}`)
        const name = `${key}-${variant}`
        fs.writeFileSync(path.join(directory, `${name}.html`), captured)
        const receipt = await context.newPage()
        await receipt.addInitScript(() => {
          window.print = () => {}
        })
        // 保存原 HTML；只在重播時移除 onload 列印動作，不注入樣式或 meta。
        await receipt.setContent(captured.replace('onload="window.print()"', ''), { waitUntil: 'load' })
        const width = variant === 'main' ? 794 : Math.ceil(((variant === 't78' ? 78 : 56) * 96) / 25.4)
        await receipt.setViewportSize({ width, height: 1123 })
        await receipt.emulateMedia({ media: 'print' })
        await receipt.evaluate(() => document.fonts.ready)
        await receipt.screenshot({ fullPage: true, path: path.join(directory, `${name}-print.png`) })
        const pdf = path.join(directory, `${name}.pdf`)
        await receipt.pdf({
          path: pdf,
          ...(variant === 'main' ? { format: 'A4' } : { width: `${variant === 't78' ? 78 : 56}mm`, height: '297mm' }),
          printBackground: true,
        })
        execFileSync('pdftoppm', ['-r', '80', '-png', pdf, path.join(directory, `${name}-pdf`)])
        await context.close()
        console.log(`OK ${name}`)
      }
  } finally {
    await browser.close()
  }
}
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
