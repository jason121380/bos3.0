#!/usr/bin/env node
// 驗證：檔案相對於 git HEAD 只有 import 宣告變動，其餘程式（含 JSX）完全相同。
const { execFileSync } = require('child_process')
const parser = require('@babel/parser')
const generate = require('@babel/generator').default
const fs = require('fs')
const body = code => {
  const ast = parser.parse(code, { sourceType: 'module', plugins: ['jsx', 'classProperties', 'optionalChaining', 'nullishCoalescingOperator'] })
  ast.program.body = ast.program.body.filter(n => n.type !== 'ImportDeclaration')
  return generate(ast, { comments: false }).code
}
let bad = 0
for (const f of process.argv.slice(2)) {
  const before = execFileSync('git', ['show', `HEAD:${f}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  if (body(before) !== body(fs.readFileSync(f, 'utf8'))) {
    console.log('CODE CHANGED:', f)
    bad++
  }
}
console.log(bad ? `${bad} 個檔案有 import 以外的變動` : `全部 ${process.argv.length - 2} 個檔案：只有 import 變動`)
process.exit(bad ? 1 : 0)
