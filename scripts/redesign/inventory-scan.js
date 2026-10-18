#!/usr/bin/env node
/**
 * 改版盤點掃描：統計 src 內 MUI／emotion／theme／ui 的使用量，以及各 views 目錄的改版狀態。
 * 純文字比對（不解析 AST），略過 *.test.js 與 __test(s)__。
 *
 * 用法：node scripts/redesign/inventory-scan.js [--json] [--dirs]
 *   --json  以 JSON 輸出
 *   --dirs  另外列出「各 views 目錄」的檔案數／仍用 MUI 檔數／已用 ui 檔數
 */
const fs = require('fs')
const path = require('path')

const SRC = path.join(__dirname, '..', '..', 'src')
const all = []
;(function walk(d) {
  for (const n of fs.readdirSync(d)) {
    const p = path.join(d, n)
    if (fs.statSync(p).isDirectory()) walk(p)
    else if (/\.jsx?$/.test(n) && !/\.test\.jsx?$/.test(n) && !p.includes('__test')) all.push(p)
  }
})(SRC)

const text = Object.fromEntries(all.map(f => [f, fs.readFileSync(f, 'utf8')]))
const rel = f => path.relative(SRC, f)
const inUi = f => rel(f).startsWith('ui' + path.sep)
const inViews = f => rel(f).startsWith('views' + path.sep)
const files = (re, filter = () => true) => all.filter(f => filter(f) && re.test(text[f])).length
const times = re => {
  const g = new RegExp(re.source, 'g')
  return all.reduce((a, f) => a + (text[f].match(g) || []).length, 0)
}

const r = {}
r.srcFiles = all.length
r.viewsFiles = all.filter(inViews).length
r.muiAny = files(/from\s+'@mui\//)
r.muiAnyViews = files(/from\s+'@mui\//, inViews)
r.muiMaterial = files(/from\s+'@mui\/material/)
r.muiMaterialViews = files(/from\s+'@mui\/material/, inViews)
r.iconsMaterial = files(/@mui\/icons-material/)
r.xDatePickers = files(/@mui\/x-date-pickers/)
r.xTreeView = files(/@mui\/x-tree-view/)
r.muiOtherPkgs = files(/from\s+'@mui\/(styles|lab|system|utils|base)/)
r.emotion = files(/@emotion/)
r.styledCall = files(/\bstyled\(/)
r.makeStyles = files(/makeStyles|withStyles/)
r.themeRef = files(/from\s+'(\.\.?\/)*(src\/)?theme(\/|')|from\s+'theme(\/|')/)
r.sxProp = files(/\bsx=\{/)
r.cssProp = files(/\bcss=\{/)
r.uiUserFiles = all.filter(f => !inUi(f) && /from\s+'ui\//.test(text[f])).length
r.uiUserFilesViews = all.filter(f => inViews(f) && /from\s+'ui\//.test(text[f])).length
r.windowPrintFiles = files(/window\.print/)
r.printTemplateFiles = files(/printMain|printThermal|forPrint|printCard|merchantNamePrint/)
r.textFieldTags = times(/<TextField\b/)
r.textFieldFiles = files(/<TextField\b/)
r.textFieldFloatLabelFiles = files(/<TextField\b[^>]*?\blabel=/s)
r.autocompleteTags = times(/<Autocomplete\b/)
r.autocompleteFiles = files(/<Autocomplete\b/)
r.datePickerFiles = files(/DatePicker|DateTimePicker|TimePicker/)

const dirs = {}
for (const f of all.filter(inViews)) {
  const d = rel(f).split(path.sep)[1]
  const o = (dirs[d] ||= { files: 0, mui: 0, ui: 0, print: 0 })
  o.files++
  if (/from\s+'@mui\//.test(text[f])) o.mui++
  if (/from\s+'ui\//.test(text[f])) o.ui++
  if (/window\.print|printMain|printThermal|forPrint|printCard/.test(text[f])) o.print++
}
const dl = Object.entries(dirs)
r.viewDirs = dl.length
r.viewDirsWithUi = dl.filter(([, o]) => o.ui > 0).length
r.viewDirsNoUi = dl.filter(([, o]) => o.ui === 0).length
r.viewDirsZeroMui = dl.filter(([, o]) => o.mui === 0).length
r.viewDirsNoUiNames = dl.filter(([, o]) => o.ui === 0).map(([d, o]) => `${d}(mui ${o.mui}/${o.files}${o.print ? ', print ' + o.print : ''})`)

if (process.argv.includes('--json')) console.log(JSON.stringify(process.argv.includes('--dirs') ? { ...r, dirs } : r, null, 1))
else {
  for (const [k, v] of Object.entries(r)) console.log(k.padEnd(28), Array.isArray(v) ? v.join(' ') : v)
  if (process.argv.includes('--dirs')) {
    console.log('\n目錄\t檔案\tMUI\tui\t列印')
    dl.sort((a, b) => b[1].mui - a[1].mui).forEach(([d, o]) => console.log(`${d}\t${o.files}\t${o.mui}\t${o.ui}\t${o.print}`))
  }
}
