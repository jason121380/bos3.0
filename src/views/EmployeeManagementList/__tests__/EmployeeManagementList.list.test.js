// 保護「員工列表」的列表行為（與 EmployeeManagementList.page.test.js 互補）：
// - 排序：數字編號由小到大、非數字編號其次、沒有編號的最後。
// - 權限：非高階主管不能編輯高階主管（編輯鈕停用、不可聚焦）；高階主管可以；登入者角色找不到或缺「員工及薪資」區塊時沒有批量功能。
// - 狀態文字：可打單／可被預約／出現於預約列表／出現於報表；待設定抽成（pending）仍可登入並標示；扣項未設定提示。
// - 搜尋關鍵字、每頁筆數送出的查詢參數；全選／逐一勾選。
// GraphQL 全由模擬 link 回應，不連後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, USER_ID } from '../../../__tests__/testkit.test'
import EmployeeManagementList from '..'

jest.setTimeout(20000)

const employee = (id, name, designerNo, overrides = {}) => ({
  id,
  lastName: name.slice(0, 1),
  firstName: name.slice(1),
  designerNo,
  avatar: null,
  status: 'ok',
  nickName: '',
  cellphone: '0911000111',
  merchantIdentity: { authorityName: '設計師' },
  isUserRakeSet: true,
  deductionWay: '依服務',
  isDisplayOnBookingList: false,
  isDisplayOnServiceList: false,
  isDisplayOnPerformanceList: false,
  isDisplayOnBookingRecord: false,
  ...overrides,
})

const EMPLOYEES = [
  employee('e1', '陳無號', null),
  employee('e2', '王十號', '10'),
  employee('e3', '林字母', 'B1', { merchantIdentity: { authorityName: '高階主管' } }),
  employee('e4', '張二號', '2', {
    status: 'pending',
    isDisplayOnServiceList: true,
    isDisplayOnBookingList: true,
    isDisplayOnBookingRecord: true,
    isDisplayOnPerformanceList: true,
    deductionWay: null,
  }),
  employee('e5', '李空號', ''),
  employee('e6', '周英文', 'A9', { isUserRakeSet: false }),
]

const roleSettings = (pageAuthority = [{ pageName: '批量抽成設定', authority: true }]) =>
  JSON.stringify([{ pageTitle: '員工及薪資', authority: true, pageAuthority }])

const fixtures = ({ authName = '店長', authorityId = 'auth-1', settings = roleSettings(), totalCount = EMPLOYEES.length } = {}) => ({
  DESIGNER: { merchantDesigner: { id: USER_ID, merchantIdentity: { authorityName: authName, authorityId } } },
  GET_MERCHANT_AUTHORITIES: { getMerchantAuthorities: [{ id: 'auth-1', authorityName: authName, authoritySettings: settings }] },
  // 與後端相同：每頁最多回 pageLimit 位
  GET_USERS_IN_EMPLOYEE_LIST: ({ input }) => ({ users: { totalCount, users: EMPLOYEES.slice(0, input.pageLimit) } }),
})

const setup = options => renderPage(<EmployeeManagementList />, { fixtures: fixtures(options), route: '/management/employee' })
// 姓名連結內是「姓」「名」兩個文字節點（後面可能接「未設定抽成」標示），只取文字節點
const ownText = el =>
  Array.from(el.childNodes)
    .filter(n => n.nodeType === 3)
    .map(n => n.textContent)
    .join('')
const names = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map(tr => ownText(tr.querySelectorAll('a')[1]))
const row = name => screen.getByText(name).closest('tr')

beforeEach(() => loginAs())
afterEach(cleanup)

describe('員工列表：排序與狀態', () => {
  it('數字編號由小到大，其次非數字編號，沒有編號的最後', async () => {
    setup()
    await screen.findByText('共 6 筆')
    // 非數字編號依自然排序（utils/compareNo，Jason 2026/10/22 fix all：A9 在 B1 之前）
    expect(names()).toEqual(['張二號', '王十號', '周英文', '林字母', '陳無號', '李空號'])
    expect(within(row('張二號')).getByText('2')).toBeInTheDocument()
  })

  it('狀態文字：全部出現時依序列出；待設定抽成仍可登入並標示；沒設定扣項方式時提示', async () => {
    setup()
    await screen.findByText('共 6 筆')
    const pending = within(row('張二號'))
    expect(pending.getByText('可打單/可被預約/出現於預約列表/出現於報表')).toBeInTheDocument()
    expect(pending.getByText('未設定抽成')).toBeInTheDocument()
    expect(pending.getByText('可登入')).toBeInTheDocument()
    expect(pending.getByText('尚未設定服務扣項方式')).toBeInTheDocument()
    expect(within(row('王十號')).getByText('設定完成')).toBeInTheDocument()
    // 只缺抽成
    expect(within(row('周英文')).getByText('尚未設定抽成')).toBeInTheDocument()
  })

  it('非高階主管不能編輯高階主管：編輯鈕停用且不可聚焦；其他員工可編輯', async () => {
    setup()
    await screen.findByText('共 6 筆')
    const boss = within(row('林字母')).getByLabelText('編輯員工')
    expect(boss).toHaveAttribute('aria-disabled', 'true')
    expect(boss).toHaveAttribute('tabindex', '-1')
    const normal = within(row('王十號')).getByLabelText('編輯員工')
    expect(normal).not.toHaveAttribute('aria-disabled')
    expect(normal).toHaveAttribute('href', '/management/employee/e2/general')
  })

  it('高階主管可以編輯高階主管', async () => {
    setup({ authName: '高階主管' })
    await screen.findByText('共 6 筆')
    await wait(() => expect(within(row('林字母')).getByLabelText('編輯員工')).not.toHaveAttribute('aria-disabled'))
    expect(within(row('林字母')).getByLabelText('編輯員工')).not.toHaveAttribute('tabindex')
  })
})

describe('員工列表：批量權限', () => {
  it.each([
    ['登入者的角色不在角色清單', { authorityId: 'auth-x' }],
    ['角色缺「員工及薪資」區塊', { settings: JSON.stringify([{ pageTitle: '客戶管理', authority: true, pageAuthority: [] }]) }],
    ['區塊內沒有「批量抽成設定」', { settings: roleSettings([{ pageName: '編輯員工', authority: true }]) }],
  ])('%s：沒有批量功能、頁面照常顯示', async (_name, options) => {
    const { settle } = setup(options)
    await screen.findByText('共 6 筆')
    await settle()
    expect(screen.queryByLabelText('全選')).toBeNull()
  })

  it('角色清單查詢失敗時視為沒有批量權限', async () => {
    const { settle } = renderPage(<EmployeeManagementList />, {
      fixtures: { ...fixtures(), GET_MERCHANT_AUTHORITIES: new Error('網路錯誤') },
      route: '/management/employee',
    })
    await screen.findByText('共 6 筆')
    await settle()
    expect(screen.queryByLabelText('全選')).toBeNull()
  })

  it('全選、取消全選、逐一勾選與取消', async () => {
    setup()
    await screen.findByText('共 6 筆')
    const all = await screen.findByLabelText('全選')
    fireEvent.click(all)
    expect(screen.getByText('已選 6 筆')).toBeInTheDocument()
    fireEvent.click(all)
    expect(screen.getByText('已選 0 筆').closest('[hidden]')).not.toBeNull()
    fireEvent.click(screen.getByLabelText('選取 王十號'))
    expect(all.indeterminate).toBe(true)
    fireEvent.click(screen.getByLabelText('選取 王十號'))
    expect(screen.getByLabelText('選取 王十號')).not.toBeChecked()
  })
})

describe('員工列表：查詢參數', () => {
  it('搜尋姓名或編號：送出關鍵字並回到第一頁', async () => {
    const { calls } = setup()
    await screen.findByText('共 6 筆')
    fireEvent.click(screen.getByRole('button', { name: '篩選' }))
    fireEvent.change(screen.getByLabelText('搜尋姓名或編號'), { target: { value: '王' } })
    await wait(() =>
      expect(callsOf(calls, 'GET_USERS_IN_EMPLOYEE_LIST').map(c => c.variables.input)).toContainEqual({
        pageLimit: 50,
        pageOffset: 0,
        keyword: '王',
        usagelimit: 'EMPLOYEE_LIST',
      })
    )
    fireEvent.click(screen.getByRole('button', { name: '篩選' }))
    expect(screen.queryByLabelText('搜尋姓名或編號')).toBeNull()
  })

  it('每頁筆數：送出新的筆數', async () => {
    const { calls } = setup()
    await screen.findByText('共 6 筆')
    const select = screen.getByLabelText('每頁筆數')
    fireEvent.change(select, { target: { value: Array.from(select.options).find(o => o.textContent === '5').value } })
    await wait(() => expect(callsOf(calls, 'GET_USERS_IN_EMPLOYEE_LIST').map(c => c.variables.input.pageLimit)).toContain(5))
  })

  // 分頁總筆數用後端 totalCount（Jason 2026/10/22；修正前用本頁人數，超過一頁時「下一頁」永遠停用）。
  it('總人數超過一頁時顯示總筆數、可按下一頁並送出頁碼', async () => {
    const { calls } = setup({ totalCount: 120 })
    await screen.findByText(/共 120 筆/)
    expect(screen.getByLabelText('下一頁')).toBeEnabled()
    fireEvent.click(screen.getByLabelText('下一頁'))
    await wait(() => expect(callsOf(calls, 'GET_USERS_IN_EMPLOYEE_LIST').map(c => c.variables.input.pageOffset)).toContain(1))
  })

  it('後端沒回總筆數時以本頁人數顯示', async () => {
    setup({ totalCount: null })
    expect(await screen.findByText('共 6 筆')).toBeInTheDocument()
    expect(screen.getByLabelText('下一頁')).toBeDisabled()
  })

  it('查詢中顯示載入骨架', async () => {
    renderPage(<EmployeeManagementList />, {
      fixtures: fixtures(),
      route: '/management/employee',
      delays: { GET_USERS_IN_EMPLOYEE_LIST: 200 },
    })
    expect(await screen.findByLabelText('載入中')).toBeInTheDocument()
    expect(await screen.findByText('共 6 筆')).toBeInTheDocument()
  })
})
