// 保護「服務分類設定」：全選只選啟用中的分類、再按一次全部取消、單筆可取消；
// 刪除送出勾選的分類 id，成功後提示並重抓、失敗時顯示錯誤訊息且保留勾選。
// GraphQL 全由 MockedProvider（testkit 的模擬 link）回應，不連後端、不刪真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import ServiceCategories from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const category = (overrides = {}) => ({
  id: 'c1',
  no: 'C1',
  name: '剪髮',
  attribution: '剪',
  remark: '',
  isUsing: true,
  updatedAt: new Date(2026, 9, 1).getTime(),
  creator: { id: 'u1', name: '店長' },
  ...overrides,
})

const fixtures = (overrides = {}) => ({
  ServiceCategories: { serviceCategories: [category(), category({ id: 'c2', no: 'C2', name: '染髮' }), category({ id: 'c3', no: 'C3', name: '停用類', isUsing: false })] },
  DEL_SERVICE_CATEGORIES: { deleteServiceCategory: true },
  ...overrides,
})

const setup = overrides => renderPage(<ServiceCategories />, { fixtures: fixtures(overrides), route: '/service/categories' })
const deleteButton = () => within(screen.getByRole('toolbar', { hidden: true })).getByText('刪除', { selector: 'button, button *' })

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('服務分類設定', () => {
  it('全選只選啟用中的分類，再按一次全部取消；單筆可取消', async () => {
    const { settle } = setup()
    await screen.findByText('共 3 筆')
    await settle()
    const all = screen.getByLabelText('全選')
    fireEvent.click(all)
    expect(screen.getByLabelText('選取 剪髮')).toBeChecked()
    expect(screen.getByLabelText('選取 染髮')).toBeChecked()
    expect(screen.getByLabelText('選取 停用類')).not.toBeChecked()
    fireEvent.click(screen.getByLabelText('選取 染髮'))
    expect(screen.getByLabelText('選取 染髮')).not.toBeChecked()
    expect(screen.getByText('已選 1 筆')).toBeInTheDocument()
    // 全選框目前為「部分選取」，按下後再全選、再按全部取消
    fireEvent.click(all)
    expect(screen.getByText('已選 2 筆')).toBeInTheDocument()
    // Jason 2026/10/22：全選框以可選取（啟用中）的筆數判斷，含停用分類時全選後全選框為勾選，再按一次全部取消
    expect(all).toBeChecked()
    fireEvent.click(all)
    expect(all).not.toBeChecked()
    expect(screen.getByLabelText('選取 剪髮')).not.toBeChecked()
    expect(screen.getByLabelText('選取 染髮')).not.toBeChecked()
  })

  it('全部啟用時全選後再按全部取消', async () => {
    const { settle } = setup({ ServiceCategories: { serviceCategories: [category(), category({ id: 'c2', name: '染髮' })] } })
    await screen.findByText('共 2 筆')
    await settle()
    const all = screen.getByLabelText('全選')
    fireEvent.click(all)
    expect(all).toBeChecked()
    fireEvent.click(all)
    expect(screen.getByLabelText('選取 剪髮')).not.toBeChecked()
  })

  it('刪除送出勾選的分類 id，成功後提示並重抓分類', async () => {
    const { calls, settle } = setup()
    await screen.findByText('共 3 筆')
    await settle()
    fireEvent.click(screen.getByLabelText('選取 染髮'))
    const before = callsOf(calls, 'ServiceCategories').length
    fireEvent.click(deleteButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '刪除成功' }))
    expect(callsOf(calls, 'DEL_SERVICE_CATEGORIES')[0].variables).toEqual({ categories: ['c2'] })
    await wait(() => expect(callsOf(calls, 'ServiceCategories').length).toBeGreaterThan(before))
  })

  it('刪除失敗：顯示錯誤訊息、保留勾選', async () => {
    const { settle } = setup({ DEL_SERVICE_CATEGORIES: new Error('分類下還有服務') })
    await screen.findByText('共 3 筆')
    await settle()
    fireEvent.click(screen.getByLabelText('選取 剪髮'))
    fireEvent.click(deleteButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '分類下還有服務', variant: 'error' }))
    expect(screen.getByLabelText('選取 剪髮')).toBeChecked()
  })

  it('分類查詢失敗時顯示 0 筆、不整頁壞', async () => {
    const { settle } = setup({ ServiceCategories: new Error('壞了') })
    await settle()
    expect(screen.getByText('共 0 筆')).toBeInTheDocument()
  })
})
