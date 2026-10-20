// 依賴（不在專案內）：npm i --prefix /tmp/pcs postcss@8 postcss-scss@4，執行時 NODE_PATH=/tmp/pcs/node_modules。DEAD_FULL＝逐一列出的死 class 檔；dead-prefix 清單＝已無程式輸出的 Mui 元件前綴。
// 用法：node prune.js <scss檔> <dead-prefix 清單檔> [--write]
// 移除「選擇器含已無程式輸出的 Mui 元件前綴」的規則；巢狀以 & 展開後判定。只移除整條死選擇器，其餘不動。
const fs = require('fs')
const postcss = require('postcss')
const scss = require('postcss-scss')
const [file, deadFile, write] = process.argv.slice(2)
const dead = fs.readFileSync(deadFile, 'utf8').split(/\s+/).filter(Boolean)
const deadFull = fs.readFileSync(process.env.DEAD_FULL || '/dev/null', 'utf8').split(/\s+/).filter(Boolean)
const isDead = sel => dead.some(p => new RegExp(`\\.${p}(?![A-Za-z])`).test(sel)) || deadFull.some(c => new RegExp(`\\.${c}(?![A-Za-z0-9-])`).test(sel))
const root = scss.parse(fs.readFileSync(file, 'utf8'))
const resolve = (parentSels, sel) => {
  if (!parentSels) return [sel]
  return parentSels.map(p => (sel.includes('&') ? sel.replace(/&/g, p) : `${p} ${sel}`))
}
let removedSel = 0, removedRules = 0
const log = []
function walk(node, parentSels) {
  node.each(child => {
    if (child.type === 'rule') {
      const own = child.selectors
      const keep = []
      const full = []
      for (const s of own) {
        const r = resolve(parentSels, s)
        if (r.every(isDead)) { removedSel++; log.push(r.join(' | ')) } else { keep.push(s); full.push(...r) }
      }
      if (keep.length === 0) { removedRules++; child.remove(); return }
      if (keep.length !== own.length) child.selectors = keep
      walk(child, full)
    } else if (child.type === 'atrule' && child.nodes) {
      walk(child, parentSels)
      if (child.nodes.filter(n => n.type !== 'comment').length === 0) child.remove()
    }
  })
}
walk(root, null)
console.error(`${file}: removed selectors ${removedSel}, whole rules ${removedRules}`)
fs.writeFileSync((process.env.LOG_DIR || '/tmp') + '/' + require('path').basename(file) + '.removed.txt', log.join('\n') + '\n')
if (write) fs.writeFileSync(file, root.toString())
