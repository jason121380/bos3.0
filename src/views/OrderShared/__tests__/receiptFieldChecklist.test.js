import fs from 'fs'
import path from 'path'
import {
  POINT_BALANCE_LABEL,
  SHARED_RECEIPT_FIELDS,
  RECEIPT_TEMPLATES,
} from '../receiptFieldChecklist'

const root = path.resolve(__dirname, '../../../..')

const read = file => fs.readFileSync(path.join(root, file), 'utf8')

const walk = (dir, acc = []) => {
  fs.readdirSync(dir).forEach(name => {
    if (name === 'node_modules' || name === '__tests__') return
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) walk(full, acc)
    else if (name.endsWith('.js')) acc.push(full)
  })
  return acc
}

describe('四份收據欄位契約', () => {
  it('只有這四份範本掛著列印內容', () => {
    const markers = [/id="printMain"/, /id="printThermal"/, /ref=\{printMainRef\}/, /ref=\{printThermalRef\}/]
    const found = walk(path.join(root, 'src'))
      .filter(file => markers.some(re => re.test(fs.readFileSync(file, 'utf8'))))
      .map(file => path.relative(root, file).split(path.sep).join('/'))
      .sort()
    expect(found).toEqual(RECEIPT_TEMPLATES.map(item => item.file).sort())
  })

  it.each(RECEIPT_TEMPLATES)('$title：$kind 的共用欄位不可少，點數餘額依種類', template => {
    const source = read(template.file)
    expect(source.includes('printMain')).toBe(true)
    expect(source.includes('printThermal')).toBe(true)
    SHARED_RECEIPT_FIELDS.forEach(field => {
      expect(source.includes(field)).toBe(true)
    })
    expect(source.includes(template.customerLabel)).toBe(true)
    expect(source.includes(template.designerLabel)).toBe(true)
    const balanceCount = source.split(POINT_BALANCE_LABEL).length - 1
    if (template.showsPointBalance) {
      expect(balanceCount).toBeGreaterThanOrEqual(2)
    } else {
      expect(balanceCount).toBe(0)
    }
  })
})
