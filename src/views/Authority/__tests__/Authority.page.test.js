// 保護「角色權限管理」列表：每個角色的權限狀態（完整／部分／無權限）依 authoritySettings 內每個頁面權限計算；
// 「高階主管」不可勾選、不可編輯（避免把最高權限角色刪掉或改掉）；全選只選其他角色；
// 批次刪除對每個勾選的角色各送一次 DELETE_AUTHORITY（送出的 authorityId 正確），成功後重抓列表、失敗提示錯誤；
// 切換「預設權限」送出該角色 id 並重抓。GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import Authority from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const page = (pageTitle, flags) => ({
  pageTitle,
  authority: flags.some(Boolean),
  pageAuthority: flags.map((authority, i) => ({ pageName: `${pageTitle}-${i}`, authority })),
})

const ROLES = [
  { id: 'r-boss', authorityName: '高階主管', isDefault: false, usingDesignerCount: 1, authoritySettings: JSON.stringify([page('客戶管理', [true, true])]) },
  { id: 'r-mgr', authorityName: '店長', isDefault: true, usingDesignerCount: 1234, authoritySettings: JSON.stringify([page('客戶管理', [true, false]), page('報表', [true])]) },
  { id: 'r-new', authorityName: '新人', isDefault: false, usingDesignerCount: 0, authoritySettings: JSON.stringify([page('客戶管理', [false, false])]) },
]

const setup = (fixtures = {}) =>
  renderPage(<Authority />, {
    route: '/authority',
    fixtures: { GET_MERCHANT_AUTHORITIES: { getMerchantAuthorities: ROLES }, ...fixtures },
  })

const row = name => screen.getByText(name).closest('tr')

beforeEach(() => loginAs())
afterEach(cleanup)

describe('角色權限管理', () => {
  it('依每個頁面權限計算狀態：全開＝完整權限、部分開＝部分權限、全關＝無權限；顯示人數與預設權限', async () => {
    setup()
    expect(await screen.findByText('共 3 筆')).toBeInTheDocument()
    expect(within(row('高階主管')).getByText('完整權限')).toBeInTheDocument()
    expect(within(row('店長')).getByText('部分權限')).toBeInTheDocument()
    expect(within(row('新人')).getByText('無權限')).toBeInTheDocument()
    expect(within(row('店長')).getByText('1,234')).toBeInTheDocument()
    expect(within(row('店長')).getByRole('switch')).toBeChecked()
    expect(within(row('新人')).getByRole('switch')).not.toBeChecked()
    // 高階主管：勾選框與編輯鈕都停用；其他角色是連到編輯頁的連結
    expect(screen.getByLabelText('選取 高階主管')).toBeDisabled()
    expect(within(row('高階主管')).getByLabelText('編輯角色').tagName).toBe('BUTTON')
    expect(within(row('高階主管')).getByLabelText('編輯角色')).toBeDisabled()
    expect(within(row('店長')).getByLabelText('編輯角色')).toHaveAttribute('href', '/role/edit/r-mgr')
  })

  it('全選只選高階主管以外的角色；再按一次清空；逐一勾選／取消', async () => {
    setup()
    await screen.findByText('共 3 筆')
    const all = screen.getByLabelText('全選')
    fireEvent.click(all)
    expect(screen.getByLabelText('選取 店長')).toBeChecked()
    expect(screen.getByLabelText('選取 新人')).toBeChecked()
    expect(screen.getByLabelText('選取 高階主管')).not.toBeChecked()
    expect(all).toBeChecked()
    expect(screen.getByText('已選 2 筆')).toBeInTheDocument()
    fireEvent.click(all)
    expect(screen.getByLabelText('選取 店長')).not.toBeChecked()
    fireEvent.click(screen.getByLabelText('選取 新人'))
    expect(all.indeterminate).toBe(true)
    expect(screen.getByText('已選 1 筆')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('選取 新人'))
    expect(screen.getByLabelText('選取 新人')).not.toBeChecked()
  })

  it('批次刪除：每個勾選的角色各送一次刪除，成功後重抓列表並提示', async () => {
    const { calls } = setup({ DELETE_AUTHORITY: { deleteAuthority: true } })
    await screen.findByText('共 3 筆')
    fireEvent.click(screen.getByLabelText('選取 店長'))
    fireEvent.click(screen.getByLabelText('選取 新人'))
    const before = callsOf(calls, 'GET_MERCHANT_AUTHORITIES').length
    fireEvent.click(screen.getByRole('button', { name: '刪除' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除權限成功', variant: 'success' }))
    expect(callsOf(calls, 'DELETE_AUTHORITY').map(c => c.variables)).toEqual([{ authorityId: 'r-mgr' }, { authorityId: 'r-new' }])
    await wait(() => expect(callsOf(calls, 'GET_MERCHANT_AUTHORITIES').length).toBeGreaterThan(before))
  })

  it('刪除失敗時提示後端錯誤訊息', async () => {
    setup({ DELETE_AUTHORITY: new Error('角色仍有員工使用') })
    await screen.findByText('共 3 筆')
    fireEvent.click(screen.getByLabelText('選取 新人'))
    fireEvent.click(screen.getByRole('button', { name: '刪除' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '角色仍有員工使用', variant: 'error' }))
  })

  it('切換預設權限：送出該角色 id，成功後重抓並提示', async () => {
    const { calls } = setup({ SET_UPDATE_DEFAULT_AUTHORITY: { updateDefaultAuthority: true } })
    await screen.findByText('共 3 筆')
    fireEvent.click(within(row('新人')).getByRole('switch'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '預設權限設定成功', variant: 'success' }))
    expect(callsOf(calls, 'SET_UPDATE_DEFAULT_AUTHORITY')[0].variables).toEqual({ authorityId: 'r-new' })
  })

  it('沒有任何角色時全選停用', async () => {
    setup({ GET_MERCHANT_AUTHORITIES: { getMerchantAuthorities: [] } })
    expect(await screen.findByText('共 0 筆')).toBeInTheDocument()
    expect(screen.getByLabelText('全選')).toBeDisabled()
    expect(screen.getByLabelText('全選')).not.toBeChecked()
  })
})
