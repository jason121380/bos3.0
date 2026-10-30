// 用法：NODE_PATH=<playwright 所在 node_modules> node mobile-overflow-scan.js <mock build> <路由清單檔（每行一個，不含開頭斜線）>
// 390px 手機寬度逐頁偵測：文件寬度超過畫面、超出右緣且不在可橫向捲動容器內的元素、寬度不到 40px 的輸入框／按鈕。
// 後端用 mock（GraphQL 一律回錯誤），所以只涵蓋無資料時的版面（頁首、篩選列、表單）；有資料才出現的內容需實機或另造資料。
const http = require('http'),
  fs = require('fs'),
  path = require('path')
const { chromium } = require('playwright')
const [build, listFile] = process.argv.slice(2)
const PORT = 5078
const routes = fs.readFileSync(listFile, 'utf8').trim().split('\n')
const types = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
}
http
  .createServer((q, r) => {
    let p = path.join(build, decodeURIComponent(q.url.split('?')[0]))
    if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) p = path.join(build, 'index.html')
    r.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' })
    fs.createReadStream(p).pipe(r)
  })
  .listen(PORT, async () => {
    const b = await chromium.launch()
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'zh-TW' })
    await ctx.route(/127\.0\.0\.1:9\//, r =>
      r.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' },
        body: JSON.stringify({ data: null, errors: [{ message: 'mock' }] }),
      })
    )
    await ctx.route(new RegExp(`^(?!http://127\\.0\\.0\\.1:(${PORT}|9)/).*`), r => r.abort())
    await ctx.addInitScript(() => {
      localStorage.setItem('token', 'mock')
      localStorage.setItem('user', JSON.stringify({ id: 'u1', name: '測試', phone: '0900000000' }))
      localStorage.setItem('userMerchant', JSON.stringify({ id: 'm1', name: '測試店' }))
      localStorage.setItem('keepLogin', 'true')
    })
    const pg = await ctx.newPage()
    for (const r of routes) {
      try {
        await pg.goto(`http://127.0.0.1:${PORT}/${r}`, { waitUntil: 'load', timeout: 15000 })
        await pg.waitForTimeout(1200)
        const res = await pg.evaluate(() => {
          const W = window.innerWidth
          const scrollable = el => {
            for (let e = el.parentElement; e; e = e.parentElement) {
              const cs = getComputedStyle(e)
              if (/(auto|scroll|hidden)/.test(cs.overflowX) && e !== document.body && e !== document.documentElement) return true
            }
            return false
          }
          const bad = []
          for (const el of document.querySelectorAll('body *')) {
            const cs = getComputedStyle(el)
            if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue
            const rc = el.getBoundingClientRect()
            if (rc.width === 0 || rc.height === 0) continue
            if (rc.right > W + 1 && !scrollable(el)) {
              bad.push({
                tag: el.tagName.toLowerCase(),
                cls: String(el.className).slice(0, 60),
                txt: (el.innerText || el.value || '').trim().slice(0, 20),
                right: Math.round(rc.right),
                w: Math.round(rc.width),
              })
            }
          }
          const narrow = [...document.querySelectorAll('input,button')]
            .filter(e => {
              const rc = e.getBoundingClientRect()
              return (
                rc.width > 0 &&
                rc.width < 40 &&
                e.type !== 'checkbox' &&
                e.type !== 'radio' &&
                !(e.tagName === 'BUTTON' && !(e.innerText || '').trim())
              )
            })
            .map(e => ({
              tag: e.tagName.toLowerCase(),
              txt: (e.innerText || e.placeholder || '').trim().slice(0, 16),
              w: Math.round(e.getBoundingClientRect().width),
            }))
          return { sw: document.documentElement.scrollWidth, bad: bad.slice(0, 4), nbad: bad.length, narrow: narrow.slice(0, 3) }
        })
        if (res.sw > 391 || res.nbad || res.narrow.length) console.log(r, JSON.stringify(res))
      } catch (e) {
        console.log(r, 'ERR', e.message.slice(0, 60))
      }
    }
    await b.close()
    process.exit(0)
  })
