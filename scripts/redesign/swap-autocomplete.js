#!/usr/bin/env node
/*
 * 改版：把 MUI Autocomplete（與 createFilterOptions）的 import 換成 src/ui/combobox（介面相容，props 原樣）。
 * 只改 import 行，JSX 與邏輯不動。用法：node scripts/redesign/swap-autocomplete.js <檔案…>
 *   - import { A, Autocomplete, createFilterOptions } from '@mui/material'  → 從清單移除，另加 import { Autocomplete, createFilterOptions } from 'ui/combobox'
 *   - import Autocomplete from '@mui/material/Autocomplete'                 → import Autocomplete from 'ui/combobox'
 *   - import { createFilterOptions } from '@mui/material/Autocomplete'      → import { createFilterOptions } from 'ui/combobox'
 */
const fs = require('fs')

const MOVE = ['Autocomplete', 'createFilterOptions']

function swap(src) {
  let changed = false
  const moved = new Set()
  let out = src.replace(/import\s*\{([^}]*)\}\s*from\s*(['"])@mui\/material\2;?[ \t]*\n/g, (line, names) => {
    const parts = names.split(',').map(s => s.trim()).filter(Boolean)
    const keep = parts.filter(p => !MOVE.includes(p.split(/\s+as\s+/)[0]))
    const take = parts.filter(p => MOVE.includes(p.split(/\s+as\s+/)[0]))
    if (take.length === 0) return line
    changed = true
    take.forEach(t => moved.add(t))
    return keep.length ? `import { ${keep.join(', ')} } from '@mui/material'\n` : ''
  })
  out = out.replace(/import\s+(\w+)\s+from\s*(['"])@mui\/material\/Autocomplete\2/g, (m, local) => {
    changed = true
    return `import ${local} from 'ui/combobox'`
  })
  out = out.replace(/import\s*\{([^}]*)\}\s*from\s*(['"])@mui\/material\/Autocomplete\2/g, (m, names) => {
    changed = true
    return `import {${names}} from 'ui/combobox'`
  })
  if (moved.size) {
    const line = `import { ${[...moved].join(', ')} } from 'ui/combobox'\n`
    // 放在最後一個 import 之後（保留第一行的 @jsxImportSource pragma）
    const imports = [...out.matchAll(/^import[\s\S]*?from\s*['"][^'"]+['"];?[ \t]*\n/gm)]
    if (imports.length) {
      const last = imports[imports.length - 1]
      const at = last.index + last[0].length
      out = out.slice(0, at) + line + out.slice(at)
    } else {
      out = line + out
    }
  }
  return changed ? out : null
}

if (require.main === module) {
  for (const file of process.argv.slice(2)) {
    const src = fs.readFileSync(file, 'utf8')
    const out = swap(src)
    if (out) {
      fs.writeFileSync(file, out)
      console.log('swapped', file)
    } else {
      console.log('skip   ', file)
    }
  }
}

module.exports = { swap }
