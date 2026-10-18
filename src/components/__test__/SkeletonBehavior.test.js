import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import React from 'react'
import { Router } from 'react-router-dom'

import AdminPageHeader from '../AdminPageHeader'
import NavItem from '../NavItem'

afterEach(cleanup)

const renderWithRouter = (ui, path = '/management/orders') => {
  const history = createMemoryHistory({ initialEntries: [path] })
  render(<Router history={history}>{ui}</Router>)
  return history
}

describe('NavItem（側欄改版後行為不變）', () => {
  // 店家參數「報表與分析不展開細項」時，點群組要直接進報表目錄，而不是展開
  it('報表及分析未開啟細項：點擊前往 /dashboard-list-detail 且不展開', () => {
    const history = renderWithRouter(
      <NavItem depth={0} title="報表及分析" reportListExtended={false}>
        <NavItem depth={1} title="店家日報表" href="/merchant-daily-report" />
      </NavItem>
    )
    fireEvent.click(screen.getByRole('button', { name: '報表及分析' }))
    expect(history.location.pathname).toBe('/dashboard-list-detail')
    expect(screen.queryByText('店家日報表')).toBeNull()
  })

  it('一般群組：點擊切換展開，且不改變目前路由', () => {
    const history = renderWithRouter(
      <NavItem depth={0} title="櫃檯作業" reportListExtended>
        <NavItem depth={1} title="帳單列表" href="/management/orders" />
      </NavItem>
    )
    fireEvent.click(screen.getByRole('button', { name: '櫃檯作業' }))
    expect(screen.getByText('帳單列表')).toBeInTheDocument()
    expect(history.location.pathname).toBe('/management/orders')
    fireEvent.click(screen.getByRole('button', { name: '櫃檯作業' }))
    expect(screen.queryByText('帳單列表')).toBeNull()
  })

  // 目前所在頁要標示為 aria-current，選取樣式依此判斷
  it('只有與目前路由完全相同的連結標示為目前頁面', () => {
    renderWithRouter(
      <div>
        <NavItem depth={1} title="帳單列表" href="/management/orders" />
        <NavItem depth={1} title="打帳單" href="/order/create" />
      </div>
    )
    expect(screen.getByRole('link', { name: '帳單列表' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: '打帳單' })).not.toHaveAttribute('aria-current')
  })
})

describe('AdminPageHeader（外觀改版、props 介面不變）', () => {
  it('主要動作、次要動作、篩選開關都呼叫原本的 handler', () => {
    const onPrimary = jest.fn()
    const onSecondary = jest.fn()
    const onFilter = jest.fn()
    renderWithRouter(
      <AdminPageHeader
        title="帳單列表"
        primaryAction={{ label: '新開單', onClick: onPrimary }}
        secondaryActions={[{ label: '匯出', onClick: onSecondary }]}
        onFilterClick={onFilter}
        showFilter
      />
    )
    fireEvent.click(screen.getByRole('button', { name: '新開單' }))
    fireEvent.click(screen.getByRole('button', { name: '匯出' }))
    fireEvent.click(screen.getByRole('button', { name: '篩選' }))
    expect([onPrimary, onSecondary, onFilter].map(f => f.mock.calls.length)).toEqual([1, 1, 1])
    expect(screen.getByRole('button', { name: '篩選' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('primaryAction.to 時渲染為連結並導向該路由', () => {
    const history = renderWithRouter(<AdminPageHeader title="卡券" primaryAction={{ label: '新增', to: '/coupons/create' }} />)
    fireEvent.click(screen.getByRole('link', { name: '新增' }))
    expect(history.location.pathname).toBe('/coupons/create')
  })
})

describe('TableEditBar（批次操作列改版、行為不變）', () => {
  const TableEditBar = require('../TableEditBar').default

  // 沒有勾選任何資料時不可出現批次操作，避免誤刪
  it('未勾選時不顯示', () => {
    render(<TableEditBar selected={[]} onCancel={() => {}} />)
    expect(screen.queryByRole('toolbar', { name: '批次操作' })).toBeNull()
  })

  it('勾選後顯示筆數，按鈕呼叫原 handler；editBarOnClick 時取消訂單不可按', () => {
    const onCancel = jest.fn()
    const { rerender } = render(<TableEditBar selected={['a', 'b']} onCancel={onCancel} />)
    expect(screen.getByText('已選 2 筆')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('cancelOrder'))
    expect(onCancel).toHaveBeenCalledTimes(1)
    rerender(<TableEditBar selected={['a', 'b']} onCancel={onCancel} editBarOnClick />)
    expect(screen.getByTestId('cancelOrder')).toBeDisabled()
  })
})
