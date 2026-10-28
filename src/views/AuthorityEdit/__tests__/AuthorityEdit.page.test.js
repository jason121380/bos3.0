// 保護「編輯角色」：以網址的角色 id 從角色清單帶入名稱與各頁權限；勾選單一頁面權限時，該區塊只要還有任一頁開著就維持開啟、
// 全部關掉時區塊也關閉（列表的「完整／部分／無權限」與側欄選單都讀這個區塊開關）；「全選/取消全選」依區塊目前狀態整區開或關；
// 儲存送出的 UPDATE_AUTHORITY 必須是畫面上的名稱與權限（JSON 字串），成功後回角色列表。GraphQL 全由模擬 link 回應，不連後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import AuthorityEdit from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const SETTINGS = [
  {
    pageTitle: '客戶管理',
    authority: true,
    pageAuthority: [
      { pageName: '客戶列表', authority: true },
      { pageName: '新增客戶', authority: false },
    ],
  },
  { pageTitle: '報表', authority: false, pageAuthority: [{ pageName: '營業報表', authority: false }] },
]

const ROLES = [
  { id: 'r-other', authorityName: '設計師', authoritySettings: '[]' },
  { id: 'r-mgr', authorityName: '店長', authoritySettings: JSON.stringify(SETTINGS) },
]

const setup = (id = 'r-mgr') =>
  renderPage(<AuthorityEdit match={{ params: { id } }} />, {
    route: `/role/edit/${id}`,
    fixtures: { GET_MERCHANT_AUTHORITIES: { getMerchantAuthorities: ROLES }, UPDATE_AUTHORITY: { updateAuthority: true } },
  })

const sentSettings = calls => JSON.parse(callsOf(calls, 'UPDATE_AUTHORITY')[0].variables.settings)
const save = () => fireEvent.click(screen.getByRole('button', { name: '儲存' }))
const selectAll = index => fireEvent.click(screen.getAllByRole('button', { name: '全選/取消全選' })[index])

beforeEach(() => loginAs())
afterEach(cleanup)

describe('編輯角色', () => {
  it('依網址的角色 id 帶入名稱與權限；改名後儲存送出名稱與原權限，回到角色列表', async () => {
    const { calls } = setup()
    const name = await screen.findByDisplayValue('店長')
    expect(screen.getByLabelText('客戶列表')).toBeChecked()
    expect(screen.getByLabelText('新增客戶')).not.toBeChecked()
    fireEvent.change(name, { target: { value: '資深店長' } })
    save()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '更新成功', variant: 'success' }))
    const { variables } = callsOf(calls, 'UPDATE_AUTHORITY')[0]
    expect(variables.authorityId).toBe('r-mgr')
    expect(variables.authorityName).toBe('資深店長')
    expect(JSON.parse(variables.settings)).toEqual(SETTINGS)
    expect(currentLocation()).toBe('/authority')
  })

  it('單一頁面權限：關到全部關閉時區塊也關閉；再開任一頁區塊恢復開啟', async () => {
    const { calls } = setup()
    await screen.findByDisplayValue('店長')
    fireEvent.click(screen.getByLabelText('客戶列表'))
    save()
    await wait(() => expect(callsOf(calls, 'UPDATE_AUTHORITY')).toHaveLength(1))
    expect(sentSettings(calls)[0]).toEqual({
      pageTitle: '客戶管理',
      authority: false,
      pageAuthority: [
        { pageName: '客戶列表', authority: false },
        { pageName: '新增客戶', authority: false },
      ],
    })
    fireEvent.click(screen.getByLabelText('營業報表'))
    save()
    await wait(() => expect(callsOf(calls, 'UPDATE_AUTHORITY')).toHaveLength(2))
    const second = JSON.parse(callsOf(calls, 'UPDATE_AUTHORITY')[1].variables.settings)
    expect(second[1]).toEqual({ pageTitle: '報表', authority: true, pageAuthority: [{ pageName: '營業報表', authority: true }] })
  })

  it('全選/取消全選：區塊開著時整區關閉，關著時整區開啟', async () => {
    const { calls } = setup()
    await screen.findByDisplayValue('店長')
    selectAll(0)
    expect(screen.getByLabelText('客戶列表')).not.toBeChecked()
    selectAll(1)
    expect(screen.getByLabelText('營業報表')).toBeChecked()
    save()
    await wait(() => expect(callsOf(calls, 'UPDATE_AUTHORITY')).toHaveLength(1))
    const sent = sentSettings(calls)
    expect(sent[0].authority).toBe(false)
    expect(sent[0].pageAuthority.every(p => p.authority === false)).toBe(true)
    expect(sent[1]).toEqual({ pageTitle: '報表', authority: true, pageAuthority: [{ pageName: '營業報表', authority: true }] })
  })

  // 網址的角色 id 不在角色清單（角色已被刪除、或網址打錯）時顯示「找不到這個角色」並可返回列表，不顯示儲存
  // （Jason 2026/10/22；修正前讀 userAuth[0].authorityName 整頁錯誤）。
  it('角色 id 不存在時顯示找不到角色，可返回角色列表、不能儲存', async () => {
    const { settle, calls } = setup('r-missing')
    await settle()
    expect(await screen.findByText('找不到這個角色')).toBeInTheDocument()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.queryByRole('button', { name: '儲存' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '返回角色列表' }))
    expect(currentLocation()).toBe('/authority')
    expect(callsOf(calls, 'UPDATE_AUTHORITY')).toHaveLength(0)
  })

  // 角色清單查詢失敗時（errorLink 已提示）不顯示「找不到」，也不整頁錯誤；角色沒讀到不能儲存，
  // 否則會送出空名稱與空權限（Codex review PR #270 P2）
  // 2026/10/28：查詢失敗（網路或後端錯誤）改顯示可重試的錯誤狀態，不再顯示空白表單／空列表，避免誤以為沒有資料或把空值存回去
  it('角色清單查詢失敗時顯示無法載入資料與重新查詢、不顯示找不到角色、沒有儲存鈕', async () => {
    const { settle, calls } = renderPage(<AuthorityEdit match={{ params: { id: 'r-mgr' } }} />, {
      route: '/role/edit/r-mgr',
      fixtures: { GET_MERCHANT_AUTHORITIES: new Error('網路錯誤') },
    })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('無法載入資料')[0]).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '重新查詢' })[0]).toBeEnabled()
    expect(screen.queryByText('找不到這個角色')).toBeNull()
    expect(screen.queryByRole('button', { name: '儲存' })).toBeNull()
    expect(callsOf(calls, 'UPDATE_AUTHORITY')).toHaveLength(0)
  })
})
