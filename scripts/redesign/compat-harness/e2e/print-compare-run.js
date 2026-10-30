// 離線列印比較：route 供應靜態檔，DNS 封鎖其他主機；不開伺服器、不呼叫後端。
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const { chromium } = require('playwright')
const directory = path.resolve(process.argv[2])
const html =
  '<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/global.css"><link rel="stylesheet" href="/tailwind.css"><link rel="stylesheet" href="/entry.css"><link rel="stylesheet" href="/print.css"></head><body><div id="root"></div><script>window.process={env:{NODE_ENV:"production"}}</script><script src="/entry.js"></script></body></html>'
async function main() {
  console.log('啟動離線 Chrome')
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1'],
  })
  try {
    for (const key of (
      process.env.PRINT_KEYS ||
      'cost,income,analysis,compare,rake,interval,helper,decrease,merchantDaily,payslip,transfer,profileRake,employeeRake,selfRecord,employeeDaily'
    )
      .split(',')
      .map(key => key.trim())
      .filter(Boolean)) {
      console.log(`比較 ${key}`)
      const context = await browser.newContext({ viewport: { width: 794, height: 1123 }, timezoneId: 'Asia/Taipei', serviceWorkers: 'block' })
      const errors = []
      await context.route('**/*', route => {
        const url = new URL(route.request().url())
        if (!['127.0.0.1', 'localhost'].includes(url.hostname)) {
          errors.push(`外部請求：${url.origin}`)
          return route.abort()
        }
        if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: html })
        const file = path.join(directory, path.basename(url.pathname))
        if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: '' })
        return route.fulfill({ contentType: file.endsWith('.css') ? 'text/css' : 'application/javascript', body: fs.readFileSync(file) })
      })
      const page = await context.newPage()
      page.on('pageerror', error => errors.push(error.message))
      page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text())
      })
      await page.goto(`http://127.0.0.1/?${key}`)
      await page
        .waitForFunction(() => window.printCompareReady?.(), null, { timeout: 15000 })
        .catch(async error => {
          await page.screenshot({ fullPage: true, path: path.join(directory, `${key}-error.png`) })
          throw new Error(
            `${key}: ${errors.join('\n')}\n${JSON.stringify(await page.evaluate(() => window.printCompareState?.()))}\n${await page.locator('body').innerText()}\n${error.message}`
          )
        })
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(300)
      if (errors.length) throw new Error(`${key}: ${errors.join('\n')}`)
      // 轉帳單保留日期預設值、受控帳戶與未受控金額輸入行為。
      if (key === 'transfer') {
        const inputs = page.locator('.MerchantBankTransferReportTransferDetail input')
        const values = await inputs.evaluateAll(nodes => nodes.map(node => node.value))
        if (JSON.stringify(values) !== JSON.stringify(['2026', '01', '01', '00000000001', '', '測試銀行1', '測試分行1']))
          throw new Error(`轉帳單預設值不符：${JSON.stringify(values)}`)
        await inputs.nth(4).fill('1000')
        if ((await inputs.nth(4).inputValue()) !== '1000') throw new Error('轉帳單金額輸入失敗')
        // 比照點列印按鈕時離開輸入框，避免 PDF 的閃爍游標造成非內容差異。
        await inputs.nth(4).evaluate(input => input.blur())
        // 等舊輸入框 200ms 底線退場完成，兩側都截取穩定狀態。
        await page.waitForTimeout(300)
      }
      await page.emulateMedia({ media: 'print' })
      fs.writeFileSync(
        path.join(directory, `${key}-dom.json`),
        JSON.stringify(
          await page.evaluate(() =>
            [...document.querySelectorAll('table, th, td, hr, input')].slice(0, 2500).map(el => {
              const c = getComputedStyle(el)
              return {
                tag: el.tagName,
                text: el.textContent.slice(0, 40),
                rect: el.getBoundingClientRect().toJSON(),
                css: Object.fromEntries(
                  [
                    'fontSize',
                    'fontWeight',
                    'lineHeight',
                    'padding',
                    'border',
                    'borderBottom',
                    'whiteSpace',
                    'boxSizing',
                    'height',
                    'width',
                    'verticalAlign',
                  ].map(k => [k, c[k]])
                ),
              }
            })
          ),
          null,
          2
        )
      )
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
  } finally {
    await browser.close()
  }
}
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
