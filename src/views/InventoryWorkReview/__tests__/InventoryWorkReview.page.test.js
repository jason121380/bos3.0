// 保護「盤點紀錄」檢視：明細的目前庫存、盤點數量、差異（+ 多、- 少、未盤點空白）；建立時間（台灣時間）與建立者；
// 匯出檔的差異欄（盤少要是 -3，不可變成 --3）；列印呼叫瀏覽器列印；查詢失敗或查無紀錄不白屏。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { exportedCsv } from '../../__tests__/stockKit.test'
import InventoryWorkReview from '..'

const INVENTORY = {
  id: 'inv-1',
  date: Date.UTC(2026, 9, 21, 1, 5), // 台灣 09:05
  isDraft: false,
  creatorName: '王小美',
  details: [
    { productId: 'p-1', productName: '洗髮精', productNo: 'P01', productCategoryId: 'c', currentCount: 8, inventoryCount: 5 },
    { productId: 'p-2', productName: '護髮油', productNo: 'P02', productCategoryId: 'c', currentCount: 3, inventoryCount: 5 },
    { productId: 'p-3', productName: '髮蠟', productNo: 'P03', productCategoryId: 'c', currentCount: 2, inventoryCount: 2 },
    { productId: 'p-4', productName: '梳子', productNo: 'P04', productCategoryId: 'c', currentCount: 1, inventoryCount: null },
  ],
}

const renderReview = overrides =>
  renderPage(<InventoryWorkReview match={{ params: { id: 'inv-1' } }} />, {
    fixtures: { GET_INVENTORY: { getInventory: INVENTORY }, ...overrides },
  })

const cells = name => Array.from(screen.getByText(name).closest('tr').querySelectorAll('td')).map(td => td.textContent)

beforeEach(() => loginAs())
afterEach(cleanup)

describe('盤點紀錄', () => {
  it('明細差異與建立資訊（台灣時間）', async () => {
    const { settle } = renderReview()
    await settle()
    expect(screen.getByText('建立時間:2026/10/21 09:05')).toBeInTheDocument()
    expect(screen.getByText('建立時間:2026-10-21-09:05 建立者:王小美')).toBeInTheDocument()
    expect(cells('洗髮精')).toEqual(['洗髮精', 'P01', '8', '5', '-3'])
    expect(cells('護髮油')).toEqual(['護髮油', 'P02', '3', '5', '+2'])
    expect(cells('髮蠟')).toEqual(['髮蠟', 'P03', '2', '2', '0'])
    expect(cells('梳子')).toEqual(['梳子', 'P04', '1', '', ''])
  })

  it('匯出：差異欄盤少為 -3、盤多為 +2、相同為 0、未盤點空白', async () => {
    const { settle } = renderReview()
    await settle()
    const csv = exportedCsv()
    expect(csv).toContain('"洗髮精","P01","8","5","-3"')
    expect(csv).toContain('"護髮油","P02","3","5","+2"')
    expect(csv).toContain('"髮蠟","P03","2","2","0"')
    expect(csv).toContain('"梳子","P04","1","",""')
  })

  it('列印：呼叫瀏覽器列印', async () => {
    const { settle } = renderReview()
    await settle()
    const print = jest.spyOn(window, 'print').mockImplementation(() => {})
    fireEvent.click(screen.getByRole('button', { name: /列印/ }))
    expect(print).toHaveBeenCalled()
    print.mockRestore()
  })

  it('查詢失敗或查無紀錄：不進錯誤畫面', async () => {
    const { settle } = renderPage(<InventoryWorkReview match={{ params: { id: 'inv-1' } }} />, { fallback: 'error' })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    cleanup()
    const missing = renderReview({ GET_INVENTORY: { getInventory: null } })
    await missing.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('盤點紀錄')[0]).toBeInTheDocument()
  })
})
