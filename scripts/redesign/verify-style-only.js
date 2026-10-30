#!/usr/bin/env node
// 驗證：檔案相對於 git HEAD 的差異只在「字串字面值」與「藍色左條 ::before 樣式」——程式結構完全相同。
// 用法：node scripts/redesign/verify-style-only.js <檔案…>
const { execFileSync } = require('child_process')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default
const fs = require('fs')

function normalize(code) {
  const ast = parser.parse(code, { sourceType: 'module', plugins: ['jsx', 'classProperties', 'optionalChaining', 'nullishCoalescingOperator'] })
  traverse(ast, {
    ObjectProperty(p) {
      const k = p.node.key
      if (k.type === 'StringLiteral' && /^&::?before$/.test(k.value)) p.remove()
    },
    StringLiteral(p) {
      p.node.value = ''
      p.node.extra = undefined
    },
  })
  return generate(ast, { comments: false }).code
}

let bad = 0
for (const f of process.argv.slice(2)) {
  const before = execFileSync('git', ['show', `HEAD:${f}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  const after = fs.readFileSync(f, 'utf8')
  if (normalize(before) !== normalize(after)) {
    console.log('STRUCTURE CHANGED:', f)
    bad++
  }
}
console.log(bad ? `${bad} 個檔案結構有變` : `全部 ${process.argv.length - 2} 個檔案：只有樣式字串變動`)
process.exit(bad ? 1 : 0)
