// 從 src/dashboardRoutes.js 讀出所有後台路由（只讀字串，不 import 程式），動態參數換成假值。
const fs = require('fs')
const path = require('path')

const PARAM_VALUES = { ':id': 'id-1', ':tab': 'general' }
// 真實進入點一定帶查詢字串的頁面（例如薪資編輯由薪資總覽帶 ?date= 進來）
const ROUTE_QUERY = { '/salary/edit/:id': `?date=${Date.parse('2026-10-01T00:00:00+08:00')}` }

function dashboardRoutes() {
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'dashboardRoutes.js'), 'utf8')
  const paths = [...src.matchAll(/path:\s*'([^']+)'/g)].map(m => m[1])
  const seen = new Set()
  return paths.map(p => p.replace(/:[A-Za-z]+/g, m => PARAM_VALUES[m] || 'x-1') + (ROUTE_QUERY[p] || '')).filter(p => !seen.has(p) && seen.add(p))
}

module.exports = { dashboardRoutes }
