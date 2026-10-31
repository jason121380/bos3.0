// 服務／卡券設定頁（新增、編輯、列表批次編輯）測試共用的假資料與操作（本身也是測試檔：CRA 把 __tests__ 下每個檔都當測試，
// 直接執行時驗證工具本身；被其他測試 import 時只提供函式）。
// 為什麼需要：這些頁面的欄位標籤多數沒有 htmlFor（Field 上方標籤、或 Select 自帶重複的 id="select-item"），
// getByLabelText 找不到欄位；這裡以「標籤所在的欄位外框」找控制項，並提供選下拉選項、帶設定快取（settings-cache）的渲染。
// GraphQL 全由 testkit 的模擬 link 回應，不連後端、不建立真實資料。
import React from 'react'
import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'
import { act, fireEvent, render, wait } from '@testing-library/react'
import PageErrorBoundary from 'components/PageErrorBoundary'
import { settingsCacheLink, bindSettingsCache } from 'lib/settings-cache'
import { createAutoMockLink, createTestStore, blockNetwork, typeLikeBrowser } from '../../../__tests__/testkit.test'

const isMain = expect.getState().testPath === __filename

// 店家設定（設定類查詢）：抽成方式（含「系統預設」）、顧客分類、互助類別、服務類別、第三方卡券
export const COMMISSION_WAYS = [
  { id: 'cw-1', name: '系統預設', basisForDeduction: null },
  { id: 'cw-2', name: '設計師抽成' },
]
export const HELPER_ITEMS = [
  { type: '洗髮', name: '洗髮' },
  { type: '吹整', name: '吹整' },
]
export const SERVICE_CATEGORIES = [
  { id: 'cat-1', no: 'C1', name: '剪髮', isUsing: true },
  { id: 'cat-2', no: 'C2', name: '染髮', isUsing: true },
]
export const THIRD_PARTIES = [
  { id: 'tp-1', name: '團購券' },
  { id: 'tp-2', name: '禮券' },
]

export const settingFixtures = (overrides = {}) => ({
  MERCHANT_COMMISSION_WAY: { merchantCommissionWay: COMMISSION_WAYS },
  CUSTOMER_CATEGORY: { merchantCustomerCategory: [{ name: '一般' }, { name: 'VIP' }] },
  MERCHANT_HELPER_ITEMS: { merchantHelperItems: HELPER_ITEMS },
  MERCHANT_JOBTITLE_POINT: { merchantJobTitlePoint: [] },
  MERCHANT_DEDUCTION_ITEMS: { merchantDeductionItems: [] },
  ServiceCategories: { serviceCategories: SERVICE_CATEGORIES },
  FETCH_THIRDPARTYS: { merchant: { id: 'merchant-1', thirdpartyCoupons: THIRD_PARTIES } },
  ...overrides,
})

// 以欄位標籤找控制項：有 htmlFor 且找得到元素就用它，否則取標籤所在外框內的第一個輸入元件
export function controlsByLabel(labelText, root = document.body) {
  const labels = [...root.querySelectorAll('label')].filter(label => {
    const own = [...label.childNodes]
      .filter(n => n.nodeType === 3 || (n.nodeType === 1 && n.tagName !== 'INPUT'))
      .map(n => n.textContent)
      .join('')
      .replace(/\s*\*$/, '')
      .trim()
    return own === labelText
  })
  return labels.map(label => {
    const byFor = label.htmlFor && root.ownerDocument.getElementById(label.htmlFor)
    if (byFor && /INPUT|SELECT|TEXTAREA/.test(byFor.tagName)) return byFor
    return label.parentElement.querySelector('input, select, textarea')
  })
}
export function controlByLabel(labelText, root = document.body, index = 0) {
  const found = controlsByLabel(labelText, root)[index]
  if (!found) throw new Error(`找不到欄位「${labelText}」(#${index})`)
  return found
}

// 文字欄位輸入：這些頁面的 handleOnChange 在 setState updater（produce）內才讀 event.target.value，須用 typeLikeBrowser；
// 輸入後再讓 effect 跑完，否則下一次輸入時元件仍有待處理的更新，updater 延到 render 才執行而讀到被還原的舊值
// （真實瀏覽器兩次按鍵之間 effect 早已跑完，不會發生）
export async function typeText(input, value) {
  typeLikeBrowser(input, value)
  await act(async () => {})
}

// 下拉選單選取顯示文字為 text 的選項（原生 select；值以索引對應）
export function pick(select, text) {
  const option = [...select.options].find(o => o.textContent === String(text))
  if (!option) throw new Error(`下拉沒有選項「${text}」：${[...select.options].map(o => o.textContent).join('、')}`)
  fireEvent.change(select, { target: { value: option.value } })
}
// 目前選取的選項文字
export const selectedText = select => (select.selectedIndex >= 0 ? select.options[select.selectedIndex].textContent : '')

// 勾選框（FormControlLabel／CheckboxField：label 內含 input）
export function checkboxByLabel(labelText, root = document.body, index = 0) {
  const labels = [...root.querySelectorAll('label')].filter(l => l.textContent.trim() === labelText && l.querySelector('input[type="checkbox"]'))
  if (!labels[index]) throw new Error(`找不到勾選框「${labelText}」(#${index})`)
  return labels[index].querySelector('input[type="checkbox"]')
}

// 卡片區塊：標題（CardTitle h3）所在 CardHeader 之後的 CardContent；rowsOf 取其中含下拉的每一列
export function sectionOf(title, root = document.body) {
  const heading = [...root.querySelectorAll('h3')].find(h => h.textContent === title)
  if (!heading) throw new Error(`找不到區塊「${title}」`)
  return heading.parentElement.parentElement.nextElementSibling
}
export const rowsOf = section => [...section.children].filter(el => el.querySelector('select'))
// 列內的圖示鈕（aria-label）
export const buttonIn = (row, label) => row.querySelector(`button[aria-label="${label}"]`)

// 彈窗內的扣項區塊：標題 h3 與各列是同一層的兄弟元素
export function rowsUnderHeading(title, root = document.body) {
  const heading = [...root.querySelectorAll('h3')].find(h => h.textContent === title)
  if (!heading) throw new Error(`找不到區塊「${title}」`)
  return [...heading.parentElement.children].filter(el => el !== heading && el.querySelector('select'))
}

// 設定扣項的一列：type（扣業績／扣薪水／無扣項）、way（依業績%數／依固定金額）、special（分指定/不指定）、數字與基準點。
// getRows(title) 取該區塊的列（頁面用 rowsOf(sectionOf)，彈窗用 rowsUnderHeading）；wayLabel 為「扣成方式」或彈窗的「抽成方式」
export function fillDeductionRow(
  title,
  index,
  { type, way, special, price, designate, nonDesignate, ref },
  { getRows = t => rowsOf(sectionOf(t)), wayLabel = '扣成方式' } = {}
) {
  const row = () => getRows(title)[index]
  if (type) pick(controlByLabel('扣項類別', row()), type)
  if (way) pick(controlByLabel(wayLabel, row()), way)
  if (special) fireEvent.click(checkboxByLabel('分指定/不指定', row()))
  const isFixed = way === '依固定金額'
  if (price !== undefined) fireEvent.change(controlByLabel(isFixed ? '固定金額' : '業績%數', row()), { target: { value: String(price) } })
  if (designate !== undefined) fireEvent.change(controlByLabel(isFixed ? '指定金額' : '指定%', row()), { target: { value: String(designate) } })
  if (nonDesignate !== undefined)
    fireEvent.change(controlByLabel(isFixed ? '不指定金額' : '不指定%', row()), { target: { value: String(nonDesignate) } })
  if (ref !== undefined) pick(controlByLabel('扣項基準點', row()), ref)
}
export function addDeductionRow(title, { getRows = t => rowsOf(sectionOf(t)) } = {}) {
  const rows = getRows(title)
  fireEvent.click(buttonIn(rows[rows.length - 1], '新增扣項'))
}

// 與 renderPage 相同的外層，但 link 前面接正式環境的 settingsCacheLink、並綁定這次的 cache：
// 用來驗證「存檔（mutation 成功）後設定類查詢被清除並重抓」
export function renderWithSettingsCache(ui, { fixtures = {}, route = '/page' } = {}) {
  const calls = []
  blockNetwork()
  const mockLink = createAutoMockLink(fixtures, { calls })
  const cache = new InMemoryCache({ addTypename: false })
  bindSettingsCache(cache, { expire: false })
  const utils = render(
    <Provider store={createTestStore()}>
      <MockedProvider link={settingsCacheLink.concat(mockLink)} cache={cache} addTypename={false}>
        <MemoryRouter initialEntries={[route]}>
          <PageErrorBoundary resetKey="test">{ui}</PageErrorBoundary>
          <Route
            render={({ location }) => (
              <div hidden data-testid="testkit-location">
                {location.pathname + location.search}
              </div>
            )}
          />
        </MemoryRouter>
      </MockedProvider>
    </Provider>
  )
  const settle = async () => {
    let last = -1
    await wait(() => {
      const stable = mockLink.pending === 0 && calls.length === last
      last = calls.length
      if (!stable) throw new Error('查詢尚未全部回應')
    })
  }
  return { ...utils, calls, cache, settle }
}

if (isMain) {
  describe('itemFormKit：以標籤找欄位、選下拉', () => {
    it('Field 上方標籤（無 htmlFor）與 FormControl 標籤都找得到欄位，pick 依顯示文字選取', () => {
      const onChange = jest.fn()
      const { unmount } = render(
        <div>
          <div>
            <label>名稱</label>
            <input defaultValue="a" />
          </div>
          <div>
            <label htmlFor="sel">
              類別<span> *</span>
            </label>
            <select id="sel" onChange={e => onChange(e.target.value)} defaultValue="0">
              <option value="0">甲</option>
              <option value="1">乙</option>
            </select>
          </div>
          <label>
            <input type="checkbox" />
            <span>均分</span>
          </label>
        </div>
      )
      expect(controlByLabel('名稱').value).toBe('a')
      const select = controlByLabel('類別')
      pick(select, '乙')
      expect(onChange).toHaveBeenCalledWith('1')
      expect(selectedText(select)).toBe('乙')
      expect(checkboxByLabel('均分').type).toBe('checkbox')
      expect(() => controlByLabel('不存在')).toThrow('找不到欄位')
      expect(() => pick(select, '丙')).toThrow('下拉沒有選項')
      expect(() => checkboxByLabel('不存在')).toThrow('找不到勾選框')
      unmount()
    })
  })
}
