// 守門測試（2026/10/28 稽核 B-04）：Apollo 查詢失敗時 loading=false、data=undefined。
// 只用「if (!x.loading)」當守衛、接著在同一個 if 區塊直接讀 x.data.欄位 的寫法，API 失敗會讓整頁拋錯。
// 新程式要改成 `if (!x.loading && x.data)`、`idx(x, _ => _.data.…)` 或 `x.data?.`。
// 既有未修的檔案列在 loadingGuard.baseline.json；只准減少、不准新增（修掉後請同步把檔名從 baseline 移除）。
import fs from 'fs'
import path from 'path'

const SRC = path.resolve(__dirname, '..')
const baseline = require('./loadingGuard.baseline.json')

function listFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === '__test__' || entry.name === 'node_modules') continue
      listFiles(full, out)
    } else if (entry.name.endsWith('.js') && !entry.name.endsWith('.test.js')) {
      out.push(full)
    }
  }
  return out
}

const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function blockEnd(source, openBrace) {
  let depth = 0
  for (let i = openBrace; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1
    else if (source[i] === '}') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return source.length
}

export function findUnguardedLoadingReads(source) {
  const hits = []
  const ifRe = /if\s*\(([^{]*?)\)\s*\{/g
  let m
  while ((m = ifRe.exec(source))) {
    const cond = m[1]
    const vars = [...cond.matchAll(/!\s*([A-Za-z_$][\w$]*)\.loading\b/g)].map(x => x[1])
    for (const v of vars) {
      if (new RegExp(`\\b${escape(v)}\\.(data|error)\\b`).test(cond)) continue
      if (new RegExp(`idx\\(\\s*${escape(v)}\\s*,`).test(cond)) continue
      const open = m.index + m[0].length - 1
      const body = source.slice(open, blockEnd(source, open))
      const readRe = new RegExp(`\\b${escape(v)}\\.data\\.(?!\\?)`, 'g')
      let r
      while ((r = readRe.exec(body))) {
        const pre = body.slice(Math.max(0, r.index - 60), r.index)
        if (/idx\([^)]*$/.test(pre)) continue
        hits.push(source.slice(0, m.index).split('\n').length)
        break
      }
    }
  }
  return hits
}

describe('查詢守衛：!x.loading 之後不得直接讀 x.data.欄位', () => {
  const offenders = {}
  for (const file of listFiles(SRC)) {
    const hits = findUnguardedLoadingReads(fs.readFileSync(file, 'utf8'))
    if (hits.length) offenders[path.relative(SRC, file).split(path.sep).join('/')] = hits.length
  }

  it('掃描器能辨認未防呆與已防呆的寫法', () => {
    expect(findUnguardedLoadingReads('if (!q.loading) { setA(q.data.a) }')).toHaveLength(1)
    expect(findUnguardedLoadingReads('if (!q.loading && q.data) { setA(q.data.a) }')).toHaveLength(0)
    expect(findUnguardedLoadingReads('if (!q.loading && idx(q, _ => _.data.a)) { setA(q.data.a) }')).toHaveLength(0)
    expect(findUnguardedLoadingReads('if (!q.loading) { setA(idx(q, _ => _.data.a)) }')).toHaveLength(0)
  })

  it('沒有新增的違規檔案（新碼請用 idx／?. 或同時檢查 data）', () => {
    const added = Object.keys(offenders).filter(f => !(f in baseline))
    expect(added).toEqual([])
  })

  it('既有違規數量只准減少（修掉後把檔名自 baseline 移除）', () => {
    const grew = Object.entries(offenders).filter(([f, n]) => f in baseline && n > baseline[f])
    expect(grew).toEqual([])
    const stale = Object.keys(baseline).filter(f => !(f in offenders))
    expect(stale).toEqual([])
  })
})
