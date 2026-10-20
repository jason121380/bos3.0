// 用法：NODE_PATH=<playwright 所在 node_modules> node run.js <outDir> <buildDir> [width] [--dark] [--print]
// buildDir＝mock build（REACT_APP_API_URL=http://127.0.0.1:9/graphql BUILD_PATH=… npm run build）
// 載入比對頁：main.css（Tailwind＋tokens）→ 打包的相容 CSS → initialize(.dark).scss（後載入，同實際 App）
// 逐一比對 #mui 與 #compat 兩棵 DOM 樹對應元素的 computed style 與尺寸，印出差異
const fs = require('fs'), path = require('path'), http = require('http')
const { chromium } = require('playwright')
const [outDir, buildDir, widthArg] = process.argv.slice(2)
const dark = process.argv.includes('--dark'), print = process.argv.includes('--print')
const css = f => path.join(buildDir, 'static/css', f)
const cssFiles = fs.readdirSync(path.join(buildDir, 'static/css'))
const mainCss = cssFiles.find(f => f.startsWith('main.'))
const globalCss = cssFiles.find(f => { const t = fs.readFileSync(css(f), 'utf8'); return t.includes('merchantNamePrint') && (dark ? t.includes('#1f1f1f') : !t.includes('#1f1f1f')) })
const html = `<!doctype html><html${dark ? ' class="dark"' : ''}><head><meta charset="utf8">
<link rel="stylesheet" href="/b/static/css/${mainCss}"><link rel="stylesheet" href="/h/entry.css"></head>
<body><div id="root"></div><script src="/h/entry.js"></script></body></html>`
const server = http.createServer((req, res) => {
  const u = req.url.split('?')[0]
  if (u === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(html) }
  const p = u.startsWith('/b/') ? path.join(buildDir, u.slice(3)) : path.join(outDir, u.slice(3))
  if (!fs.existsSync(p)) { res.writeHead(404); return res.end() }
  res.writeHead(200, { 'Content-Type': p.endsWith('.css') ? 'text/css' : 'application/javascript' }); fs.createReadStream(p).pipe(res)
}).listen(5091, async () => {
  const b = await chromium.launch()
  const page = await b.newPage({ viewport: { width: Number(widthArg || 1440), height: 900 } })
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => m.type() === 'error' && errs.push(m.text()))
  await page.goto('http://127.0.0.1:5091/')
  await page.addStyleTag({ path: css(globalCss) })
  if (print) await page.emulateMedia({ media: 'print' })
  // 滑鼠預設停在 (0,0)，會讓左上角的 #mui 元素進入 :hover；移到畫面右下角的空白處
  // 比對頁很長時右下角仍可能壓在 #mui 的表格列上：放一個固定在右下角的小遮罩，讓滑鼠停在它上面
  await page.evaluate(() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;right:0;bottom:0;width:8px;height:8px;z-index:2147483647'; document.body.appendChild(d) })
  await page.mouse.move(Number(widthArg || 1440) - 1, 899)
  await page.waitForTimeout(500)
  const diffs = await page.evaluate(() => {
    const PROPS = ['display', 'position', 'box-sizing', 'width', 'height', 'min-width', 'max-width', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
      'border-top-width', 'border-top-style', 'border-top-color', 'border-right-width', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color', 'border-left-width', 'border-radius', 'border-collapse',
      'color', 'background-color', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-align', 'vertical-align', 'white-space', 'overflow-x', 'overflow-y', 'box-shadow', 'flex-direction', 'z-index', 'opacity', 'cursor',
      'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-dashoffset', 'transform', 'animation-name', 'animation-duration', 'text-transform', 'transition-property', 'text-overflow', 'flex-shrink']
    const a = document.querySelector('#mui'), c = document.querySelector('#compat')
    const out = []
    const walk = (x, y, p) => {
      if (x.tagName !== y.tagName) { out.push(`${p}: tag ${x.tagName} vs ${y.tagName}`); return }
      const sx = getComputedStyle(x), sy = getComputedStyle(y)
      for (const k of PROPS) if (sx.getPropertyValue(k) !== sy.getPropertyValue(k)) out.push(`${p}: ${k} ${sx.getPropertyValue(k)} | ${sy.getPropertyValue(k)}`)
      const rx = x.getBoundingClientRect(), ry = y.getBoundingClientRect()
      if (Math.abs(rx.width - ry.width) > 0.5 || Math.abs(rx.height - ry.height) > 0.5) out.push(`${p}: rect ${rx.width}x${rx.height} | ${ry.width}x${ry.height}`)
      const cls = (x.className || '').toString().split(' ').filter(s => s.startsWith('Mui')).sort().join(' ')
      const cly = (y.className || '').toString().split(' ').filter(s => s.startsWith('Mui')).sort().join(' ')
      if (cls !== cly) out.push(`${p}: class [${cls}] | [${cly}]`)
      for (const at of ['scope', 'aria-sort', 'role', 'colspan']) if (x.getAttribute(at) !== y.getAttribute(at)) out.push(`${p}: attr ${at} ${x.getAttribute(at)} | ${y.getAttribute(at)}`)
      if (x.children.length !== y.children.length) { out.push(`${p}: children ${x.children.length} vs ${y.children.length}`); return }
      for (let i = 0; i < x.children.length; i++) walk(x.children[i], y.children[i], `${p}>${x.children[i].tagName.toLowerCase()}${x.children[i].getAttribute('data-k') ? '[' + x.children[i].getAttribute('data-k') + ']' : ''}:${i}`)
    }
    for (let i = 0; i < a.children.length; i++) walk(a.children[i], c.children[i], `#${i}`)
    return out
  })
  console.log(`${dark ? 'dark' : 'light'}${print ? ' print' : ''} ${widthArg || 1440}: ${diffs.length} diffs`)
  diffs.slice(0, 60).forEach(d => console.log('  ' + d))
  if (errs.length) console.log('errors:', errs.slice(0, 5))
  await b.close(); server.close()
})
