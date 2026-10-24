// 商品／進貨／領用／盤點／廠商頁面測試共用的假資料與操作（本身也是測試檔：CRA 把 __tests__ 下每個檔都當測試，直接執行時驗證工具本身）。
// 為什麼需要：這批頁面共用同一組設定查詢（商品分類、廠商、員工、入庫密碼設定），而且好幾支商品查詢是「沒有名稱的 query」
// （testkit 以 operation 名稱對應假資料，沒有名稱時鍵值是 'undefined'），需要依查詢欄位分辨是哪一支。
// 另外提供自家下拉（ui/combobox）、原生 select 的操作，讓各頁測試只寫業務流程。GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import { fireEvent, screen, within } from '@testing-library/react'
import { print } from 'graphql'

const isMain = expect.getState().testPath === __filename

export const CATEGORIES = [
  { id: 'cat-1', no: 'C1', name: '洗髮' },
  { id: 'cat-2', no: 'C2', name: '護髮' },
]

export const VENDORS = [
  { uuid: 'mv-1', no: 'V01', name: '大和貿易', nickname: '大和', cellphone: '', remark: '', vendor: { uuid: 'vendor-1' } },
  { uuid: 'mv-2', no: '', name: '美髮材料行', nickname: '', cellphone: '', remark: '老客戶', vendor: { uuid: 'vendor-2' } },
]

export const USERS = [
  { id: 'user-a', name: '王小美', designerNo: 'A01' },
  { id: 'user-b', name: '李助理', designerNo: null },
]

// 進貨用商品（GET_PRODUCT_IN_PRODUCT_RESTOCK）
export const RESTOCK_PRODUCTS = [
  {
    id: 'p-1',
    no: 'P01',
    name: '洗髮精',
    cost: 120,
    remainingCount: 5,
    productCategory: { id: 'cat-1', name: '洗髮' },
    merchantVendor: { merchantVendorUUId: 'mv-1', name: '大和貿易' },
  },
  {
    id: 'p-2',
    no: 'P02',
    name: '護髮油',
    cost: 300,
    remainingCount: 1,
    productCategory: { id: 'cat-2', name: '護髮' },
    merchantVendor: { merchantVendorUUId: 'mv-2', name: '美髮材料行' },
  },
  {
    id: 'p-3',
    no: 'P10',
    name: '髮蠟',
    cost: 80,
    remainingCount: 20,
    productCategory: { id: 'cat-1', name: '洗髮' },
    merchantVendor: null,
  },
]

// 入庫／取消入庫是否需要密碼（GET_STOCK_IN_USING）
export const stockInUsing = (stockIn, stockInUndo) => ({
  merchantPassword: { purchaseStockIn: { isUsing: stockIn }, purchaseStockInUndo: { isUsing: stockInUndo } },
})

// 沒有名稱的查詢：依查詢內容分派（fixtures 的鍵值為 'undefined'）。matchers：[[查詢中出現的欄位名稱, 回應], …]
export const byQueryText = matchers => (variables, operation) => {
  const text = print(operation.query)
  const hit = matchers.find(([field]) => text.includes(field))
  if (!hit) return {}
  const [, response] = hit
  return typeof response === 'function' ? response(variables, operation) : response
}

// 打開自家下拉（已開著就不再切換；點擊沒打開時改按 ↓）
// 自家下拉的選項（排除原生 select 的 <option>）
export const comboOptions = () => screen.queryAllByRole('option').filter(o => o.tagName !== 'OPTION')

// 以標籤找輸入框（下拉的選單 ul 也以 aria-labelledby 指向同一個標籤，要排除）
// 欄位標籤沒有以 for 關聯時（ui/input 的 Field 未給 htmlFor），改找標籤所在欄位容器內的輸入框
const isField = el => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.hasAttribute('data-ui-select')
export const inputsByLabel = (label, container = document.body) => {
  const linked = within(container).queryAllByLabelText(label).filter(isField)
  if (linked.length) return linked
  return within(container)
    .queryAllByText(label, { selector: 'label' })
    .map(l => l.parentElement.querySelector('input, select, textarea'))
    .filter(Boolean)
}

export function openCombo(label, { typed, container = document.body, index = 0 } = {}) {
  const input = inputsByLabel(label, container)[index]
  fireEvent.focusIn(input)
  if (!comboOptions().length) fireEvent.click(input)
  if (typed !== undefined) fireEvent.change(input, { target: { value: typed } })
  if (!comboOptions().length) fireEvent.keyDown(input, { key: 'ArrowDown' })
  return input
}

// 自家下拉：以標籤找到輸入框，輸入文字（可省略）後點選選項文字
export function pickOption(label, optionText, { typed, container = document.body, index = 0 } = {}) {
  const input = openCombo(label, { typed, container, index })
  const option = comboOptions().find(o => o.textContent === optionText)
  if (!option) throw new Error(`找不到選項「${optionText}」：${comboOptions().map(o => o.textContent).join('、')}`)
  fireEvent.click(option)
  return input
}

// 清除自家下拉的值（清除鈕在欄位取得焦點後才出現）
export function clearCombo(input) {
  fireEvent.focusIn(input)
  fireEvent.mouseDown(within(input.closest('.ui-root')).getByRole('button', { name: '清除' }))
}

// 下拉目前的選項文字（先打開）
export function optionTexts(label, { typed, container = document.body, index = 0 } = {}) {
  openCombo(label, { typed, container, index })
  return comboOptions().map(o => o.textContent)
}

// 匯出檔內容（react-csv 在 jsdom 以 data URI 放在連結上）
export const exportedCsv = (linkText = '報表匯出') =>
  decodeURIComponent(screen.getByText(linkText).closest('a').getAttribute('href'))

// 日期快速選擇（components/DateSelector 的「快速選擇日期區間」下拉）
export function pickQuickDate(title) {
  fireEvent.keyDown(screen.getByRole('combobox', { name: '快速選擇日期區間' }), { key: 'Enter' })
  fireEvent.keyDown(screen.getByRole('option', { name: title }), { key: 'Enter' })
}

// 原生 select：依選項文字選取
export function chooseNative(select, optionText) {
  const option = Array.from(select.options).find(o => o.textContent.trim() === optionText)
  if (!option) throw new Error(`找不到選項「${optionText}」`)
  fireEvent.change(select, { target: { value: option.value } })
}

if (isMain) {
  const { gql } = require('@apollo/client')
  describe('stockKit', () => {
    it('byQueryText 依查詢欄位分派沒有名稱的查詢；都不符合時回空物件', () => {
      const fixture = byQueryText([
        ['remainingCount', { products: { data: [{ id: 'a' }] } }],
        ['isPublished', () => ({ products: { data: [{ id: 'b' }] } })],
      ])
      const op = query => ({ query })
      expect(fixture({}, op(gql`query { products { data { id remainingCount } } }`))).toEqual({ products: { data: [{ id: 'a' }] } })
      expect(fixture({}, op(gql`query { products { data { id isPublished } } }`))).toEqual({ products: { data: [{ id: 'b' }] } })
      expect(fixture({}, op(gql`query { other }`))).toEqual({})
    })

    it('stockInUsing 組出入庫密碼設定', () => {
      expect(stockInUsing(true, false).merchantPassword.purchaseStockInUndo.isUsing).toBe(false)
    })
  })
}
