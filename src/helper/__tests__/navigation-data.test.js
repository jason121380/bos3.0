// 保護什麼：
// - helper/pageData：側欄「釘選頁」與搜尋用的頁面清單。NavBar 以「頁名」對應釘選資料（後端只存頁名），
//   頁名重複會對到錯的頁；網址必須是後台真的有的路由，否則釘選後點了只會到 404。
// - helper/enum：支付方式與收支的顯示文字（新增／編輯支付方式、收支登錄共用）。
// - helper/paginationLabel：把舊 MUI 分頁的「1–5 of 20」改寫成中文；頁面上沒有分頁時不得拋錯。
import { matchPath } from 'react-router'
import pageData from '../pageData'
import { AccountingInOutType, PaymentEnum, PaymentSymbol, WalletType } from '../enum'
import paginationLabel from '../paginationLabel'
import dashboardRoutes from '../../dashboardRoutes'

describe('pageData（釘選頁與搜尋用的頁面清單）', () => {
  it('每一筆都有分組、頁名與網址，且頁名不重複', () => {
    pageData.forEach(page => {
      expect(page).toEqual({ groupTitle: expect.any(String), title: expect.any(String), href: expect.stringMatching(/^\//) })
    })
    const titles = pageData.map(p => p.title)
    expect(new Set(titles).size).toBe(titles.length)
  })

  it('每個網址都對得到後台路由（不會釘到 404）', () => {
    const paths = dashboardRoutes.filter(r => r.path).map(r => r.path)
    const missing = pageData.filter(p => !paths.some(path => matchPath(p.href, { path, exact: true })))
    expect(missing).toEqual([])
  })
})

describe('enum', () => {
  it('支付手續費：百分比顯示 %、固定金額不加幣別符號', () => {
    expect(PaymentEnum).toEqual({ PERCENT: '百分比(%)', AMOUNT: '固定金額' })
    expect(PaymentSymbol.PERCENT).toBe('%')
    expect(PaymentSymbol.AMOUNT).toBeUndefined()
  })

  it('收支類型與錢包類型的顯示文字', () => {
    expect(AccountingInOutType).toEqual({ REVENUE: '收入', EXPENDITURE: '支出' })
    expect(Object.keys(WalletType)).toEqual(['COUNTER', 'CASH', 'BANKTRANSFER', 'MONEYTRANSFER'])
  })
})

describe('paginationLabel', () => {
  it('頁面上沒有 MUI 分頁文字時不動作、不拋錯', () => {
    const root = document.createElement('div')
    root.innerHTML = '<p>沒有分頁</p>'
    expect(() => paginationLabel(root)).not.toThrow()
    expect(root.innerHTML).toBe('<p>沒有分頁</p>')
  })

  it('有多個分頁時只改寫最後一個（舊頁面的表格分頁在最下方）', () => {
    const root = document.createElement('div')
    root.innerHTML = '<p class="MuiTablePagination-displayedRows">1–5 of 20</p><p class="MuiTablePagination-displayedRows">6–10 of 20</p>'
    paginationLabel(root)
    const [first, last] = root.querySelectorAll('p')
    expect(first.textContent).toBe('1–5 of 20')
    expect(last.textContent.replace(/ /g, ' ')).toBe('第 6–10 筆   共 20 筆')
    // 選擇窗會重複呼叫：已是中文時不再包一層
    paginationLabel(root)
    expect(last.textContent.replace(/ /g, ' ')).toBe('第 6–10 筆   共 20 筆')
  })
})
