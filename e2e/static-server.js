// 對 vite build 的輸出起本機靜態伺服器（SPA：找不到的路徑回 index.html）。只監聽 127.0.0.1。
const http = require('http')
const fs = require('fs')
const path = require('path')

const BUILD = path.resolve(process.env.E2E_BUILD_DIR || path.join(__dirname, '..', 'build'))
const PORT = Number(process.env.E2E_PORT || 4173)
const TYPES = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
}

if (!fs.existsSync(path.join(BUILD, 'index.html'))) {
  console.error(`找不到 ${BUILD}/index.html，請先 npm run build（或設定 E2E_BUILD_DIR）`)
  process.exit(1)
}

http
  .createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0])
    let file = path.join(BUILD, url)
    if (!file.startsWith(BUILD) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(BUILD, 'index.html')
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' })
    fs.createReadStream(file).pipe(res)
  })
  .listen(PORT, '127.0.0.1', () => console.log(`e2e static server: http://127.0.0.1:${PORT} (${BUILD})`))
