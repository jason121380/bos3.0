import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import React from 'react'

import billContext from 'context/keyInContext'
import PanelPerformance from '../Panel/PanelPerformance'

jest.mock('hooks/useFetchTicketRecords', () => () => ({ loading: false, data: undefined }))

afterEach(cleanup)

const bill = {
  serviceOrders: [{ price: 700 }],
  productOrders: [{ price: 300, count: 2 }],
  ticketOrders: [],
  membershipOrders: [],
  useTicketOrders: [],
  walletPay: 100,
  amountByOtherPay: 0,
  bonusDecount: 0,
}

const setup = () =>
  render(
    <billContext.Provider value={{ bill }}>
      <PanelPerformance />
    </billContext.Provider>
  )

describe('打帳單 金額彙總（手機收進底部固定列）', () => {
  // 手機版（Jason 2026/10/20）：彙總卡收進底部固定列，按展開鈕才往上展開明細；預設只顯示業績合計與現金應收，不擋住打帳單操作
  it('底部固定列預設收合，點展開鈕顯示明細，數值與彙總卡相同', () => {
    setup()
    const toggle = screen.getByRole('button', { name: '金額彙總明細' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(document.getElementById('order-summary-details')).toBeNull()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const details = within(document.getElementById('order-summary-details'))
    // 服務 700、店販 300×2、扣入金 100：與彙總卡同一份運算
    expect(details.getByText('服務消費').nextSibling).toHaveTextContent('700')
    expect(details.getByText('店販消費').nextSibling).toHaveTextContent('600')
    expect(details.getByText('扣入金').nextSibling).toHaveTextContent('100')

    fireEvent.click(toggle)
    expect(document.getElementById('order-summary-details')).toBeNull()
  })
})

// 打帳單（/order/create）是底部導覽列的分頁之一，手機有底部導覽列：固定列照舊讓出 56px＋安全區（帳單詳細等三個編輯頁才貼齊底部）
describe('打帳單 底部固定列位置', () => {
  it('讓出底部導覽列的 56px', () => {
    setup()
    const bar = screen.getByRole('button', { name: '金額彙總明細' }).closest('.fixed')
    expect(bar).toHaveClass('bottom-[calc(56px+env(safe-area-inset-bottom))]')
  })
})
