// 離線列印比較：route 供應靜態檔，DNS 封鎖其他主機；不開伺服器、不呼叫後端。
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const { chromium } = require('playwright')
const directory = path.resolve(process.argv[2])
const html = '<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/global.css"><link rel="stylesheet" href="/tailwind.css"><link rel="stylesheet" href="/entry.css"><link rel="stylesheet" href="/print.css"></head><body><div id="root"></div><script>window.process={env:{NODE_ENV:"production"}}</script><script src="/entry.js"></script></body></html>'
async function main() {
  console.log('啟動離線 Chrome')
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1'] })
  try {
    for (const key of ['cost', 'income', 'analysis', 'compare', 'rake', 'interval', 'helper']) {
      console.log(`比較 ${key}`)
      const context = await browser.newContext({ viewport: { width: 794, height: 1123 }, timezoneId: 'Asia/Taipei', serviceWorkers: 'block' })
      const errors = []
      await context.route('**/*', route => {
        const url = new URL(route.request().url())
        if (!['127.0.0.1', 'localhost'].includes(url.hostname)) { errors.push(`外部請求：${url.origin}`); return route.abort() }
        if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: html })
        const file = path.join(directory, path.basename(url.pathname))
        if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: '' })
        return route.fulfill({ contentType: file.endsWith('.css') ? 'text/css' : 'application/javascript', body: fs.readFileSync(file) })
      })
      const page = await context.newPage()
      page.on('pageerror', error => errors.push(error.message))
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
      await page.goto(`http://127.0.0.1/?${key}`)
      await page.waitForFunction(() => window.printCompareReady?.(), null, { timeout: 15000 }).catch(error => { throw new Error(`${key}: ${errors.join('\n')}\n${error.message}`) })
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(300)
      if (errors.length) throw new Error(`${key}: ${errors.join('\n')}`)
      await page.emulateMedia({ media: 'print' })
      await page.screenshot({ fullPage: true, path: path.join(directory, `${key}-print.png`) })
      const pdf = path.join(directory, `${key}.pdf`)
      await page.pdf({ path: pdf, format: 'A4', printBackground: true })
      execFileSync('pdftoppm', ['-r', '80', '-png', pdf, path.join(directory, `${key}-pdf`)])
      await page.emulateMedia({ media: 'screen' })
      await page.setViewportSize({ width: 1280, height: 900 })
      await page.screenshot({ fullPage: true, path: path.join(directory, `${key}-screen.png`) })
      await context.close()
      console.log(`OK ${key}`)
    }
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
