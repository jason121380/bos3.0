// 保護「會員卡分類設定」列表：列出分類（代號、名稱、變更者、變更時間以台灣日期顯示）、編輯連結；
// 停用中的分類不能勾選、全選只選啟用中的；批次刪除送出勾選的 uuid、成功後重新整理、失敗提示錯誤；
// 查詢失敗時仍顯示空列表（不整頁壞）。GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { stubLocation } from '../../__tests__/settingsPageKit.test'
import MemberCardCategories from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.setTimeout(20000)

// 台灣 2026/10/22 01:00（UTC 10/21 17:00）：日期必須顯示台灣的 10/22
const TW_1022_0100 = Date.UTC(2026, 9, 21, 17, 0)
const CATEGORIES = [
  { uuid: 'c1', no: 'A01', name: '金卡', isUsing: true, updatedAt: TW_1022_0100, creator: { name: '店長' } },
  { uuid: 'c2', no: 'A02', name: '銀卡', isUsing: true, updatedAt: TW_1022_0100, creator: null },
  { uuid: 'c3', no: 'A03', name: '停用卡', isUsing: false, updatedAt: TW_1022_0100, creator: { name: '助理' } },
]

const setup = ({ categories = CATEGORIES, ...fixtures } = {}) =>
  renderPage(<MemberCardCategories />, {
    fixtures: { FETCH_MEMBERSHIPS_CATEGORY: { membershipCategories: categories }, ...fixtures },
    route: '/member-card-categories',
  })
const row = name => screen.getByText(name).closest('tr')

let restoreLocation
beforeEach(() => {
  loginAs()
  restoreLocation = stubLocation()
})
afterEach(() => {
  cleanup()
  restoreLocation()
})

describe('會員卡分類設定', () => {
  it('列出分類、變更者與台灣日期，編輯連到該分類；查詢含已刪除（paranoid）', async () => {
    const { calls } = setup()
    expect(await screen.findByText('共 3 筆')).toBeInTheDocument()
    const gold = within(row('金卡'))
    expect(gold.getByText('A01')).toBeInTheDocument()
    expect(gold.getByText('店長')).toBeInTheDocument()
    expect(gold.getByText('2026/10/22')).toBeInTheDocument()
    expect(gold.getByLabelText('編輯分類')).toHaveAttribute('href', '/member-card-category/edit/c1')
    expect(callsOf(calls, 'FETCH_MEMBERSHIPS_CATEGORY')[0].variables).toEqual({ input: { paranoid: true } })
    // 停用的分類標示為選取樣式且不可勾選
    expect(row('停用卡')).toHaveAttribute('data-state', 'selected')
    expect(screen.getByTestId('category-停用卡-checkbox')).toBeDisabled()
  })

  it('全選只選啟用中的分類；單選可勾可取消', async () => {
    setup()
    await screen.findByText('共 3 筆')
    const all = screen.getByLabelText('全選')
    fireEvent.click(all)
    expect(screen.getByTestId('category-金卡-checkbox')).toBeChecked()
    expect(screen.getByTestId('category-銀卡-checkbox')).toBeChecked()
    expect(screen.getByTestId('category-停用卡-checkbox')).not.toBeChecked()
    expect(screen.getByText('已選 2 筆')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('category-金卡-checkbox'))
    expect(screen.getByTestId('category-金卡-checkbox')).not.toBeChecked()

    expect(screen.getByText('已選 1 筆')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('category-銀卡-checkbox'))
    expect(screen.getByTestId('category-銀卡-checkbox')).not.toBeChecked()
    expect(screen.getByRole('toolbar', { hidden: true }).closest('[hidden]')).not.toBeNull()
  })

  it('分類都啟用時，全選後再按一次取消全部', async () => {
    setup({ categories: CATEGORIES.slice(0, 2) })
    await screen.findByText('共 2 筆')
    const all = screen.getByLabelText('全選')
    fireEvent.click(all)
    expect(all).toBeChecked()
    fireEvent.click(all)
    expect(screen.getByTestId('category-金卡-checkbox')).not.toBeChecked()
    expect(screen.getByTestId('category-銀卡-checkbox')).not.toBeChecked()
  })

  it('全部分類都停用時全選不可用；沒有分類時也不可用', async () => {
    setup({ categories: [CATEGORIES[2]] })
    await screen.findByText('共 1 筆')
    expect(screen.getByLabelText('全選')).toBeDisabled()
    cleanup()
    setup({ categories: [] })
    await screen.findByText('共 0 筆')
    expect(screen.getByLabelText('全選')).toBeDisabled()
  })

  // 成功後不整頁重新整理（2026/10/28）：重抓分類清單，刪掉的分類從畫面消失
  it('批次刪除送出勾選的 uuid，成功後提示並重抓清單，不重新整理', async () => {
    let deleted = []
    const { calls } = setup({
      deleteMembershipCategory: (variables) => {
        deleted = variables.itemUUIDs
        return { deleteMembershipCategory: true }
      },
      FETCH_MEMBERSHIPS_CATEGORY: () => ({ membershipCategories: CATEGORIES.filter(c => !deleted.includes(c.uuid)) }),
    })
    await screen.findByText('共 3 筆')
    fireEvent.click(screen.getByTestId('category-金卡-checkbox'))
    fireEvent.click(screen.getByTestId('category-銀卡-checkbox'))
    fireEvent.click(within(screen.getByRole('toolbar', { hidden: true })).getByText('刪除'))
    await screen.findByText('共 1 筆')
    expect(screen.queryByText('金卡')).toBeNull()
    expect(window.location.reload).not.toHaveBeenCalled()
    expect(callsOf(calls, 'deleteMembershipCategory')[0].variables).toEqual({ itemUUIDs: ['c1', 'c2'] })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '成功刪除會員卡類別', variant: 'success' })
  })

  it('刪除失敗時提示錯誤、不重新整理', async () => {
    setup({ deleteMembershipCategory: new Error('分類仍有會員卡') })
    await screen.findByText('共 3 筆')
    fireEvent.click(screen.getByTestId('category-金卡-checkbox'))
    fireEvent.click(within(screen.getByRole('toolbar', { hidden: true })).getByText('刪除'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '分類仍有會員卡', variant: 'error' }))
    expect(window.location.reload).not.toHaveBeenCalled()
  })

  // 2026/10/28：查詢失敗（網路或後端錯誤）改顯示可重試的錯誤狀態，不再顯示「共 0 筆」讓人誤以為沒有分類
  it('查詢失敗時顯示無法載入資料與重新查詢，不整頁壞', async () => {
    renderPage(<MemberCardCategories />, { fallback: 'error', route: '/member-card-categories' })
    expect(await screen.findByText('無法載入資料')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重新查詢' })).toBeEnabled()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})
