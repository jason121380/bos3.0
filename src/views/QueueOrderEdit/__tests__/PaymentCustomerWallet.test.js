// 保護重新開單「換顧客時清空扣入金」（2026/10/22 Jason：重新要清空）：
// 佇列帳單帶著原顧客的扣入金載入；櫃檯換成另一位顧客時，扣入金要歸 0，不能用新顧客的入金去扣原顧客那筆金額。
// 載入佇列帳單（含在重新開單頁從佇列再選另一筆，元件沿用）時，帶入的顧客與扣入金不算換顧客，扣入金要保留（Codex review PR #261）。
import React, { useState } from 'react'
import { screen, wait, fireEvent } from '@testing-library/react'
import { renderPage, loginAs } from '../../../__tests__/testkit.test'
import billContext from 'context/keyInContext'
import PaymentCustomerWallet from '../PaymentCustomerWallet'

const emptyBill = { serviceOrders: [], productOrders: [], ticketOrders: [], amountByOtherPay: 0, customerId: undefined, walletPay: 0 }
const queueResult = (customerId, walletPay) => ({
  loading: false,
  data: { getOrderInputByQueueId: JSON.stringify({ customerId, walletPay }) },
})

// 比照 QueueOrderEdit/index.js：先拿到佇列查詢結果（order），再由 effect 把顧客與扣入金一起帶進帳單
function Harness() {
  const [order, setOrder] = useState({ loading: true })
  const [bill, setBill] = useState(emptyBill)
  const handleBillChange = ({ key, value }) => setBill(prev => ({ ...prev, [key]: value }))
  const loadQueue = (customerId, walletPay) => {
    setOrder(queueResult(customerId, walletPay))
    setTimeout(() => setBill(prev => ({ ...prev, customerId, walletPay })), 0)
  }
  return (
    <billContext.Provider value={{ bill, setBill, handleBillChange, order }}>
      <PaymentCustomerWallet />
      <output data-testid="wallet-pay">{bill.walletPay}</output>
      <button onClick={() => loadQueue('customer-1', 300)}>載入佇列帳單A</button>
      <button onClick={() => loadQueue('customer-3', 500)}>改選佇列帳單B</button>
      <button onClick={() => setBill(prev => ({ ...prev, customerId: 'customer-2' }))}>換顧客</button>
    </billContext.Provider>
  )
}

const fixtures = { customerWallet: { customerWallet: 1000 } }
const walletPay = () => screen.getByTestId('wallet-pay')

beforeEach(() => loginAs())

it('載入佇列帳單時，帶入的扣入金保留', async () => {
  renderPage(<Harness />, { fixtures })
  fireEvent.click(screen.getByText('載入佇列帳單A'))
  await wait(() => expect(walletPay()).toHaveTextContent(/^300$/))
})

it('換成另一位顧客時，扣入金清空為 0', async () => {
  renderPage(<Harness />, { fixtures })
  fireEvent.click(screen.getByText('載入佇列帳單A'))
  await wait(() => expect(walletPay()).toHaveTextContent(/^300$/))
  fireEvent.click(screen.getByText('換顧客'))
  await wait(() => expect(walletPay()).toHaveTextContent(/^0$/))
})

it('在重新開單頁改選另一筆佇列帳單（顧客不同），新帳單的扣入金保留', async () => {
  renderPage(<Harness />, { fixtures })
  fireEvent.click(screen.getByText('載入佇列帳單A'))
  await wait(() => expect(walletPay()).toHaveTextContent(/^300$/))
  fireEvent.click(screen.getByText('改選佇列帳單B'))
  await wait(() => expect(walletPay()).toHaveTextContent(/^500$/))
  // 等其他 effect 都跑完，確認沒有被事後清成 0
  await new Promise(r => setTimeout(r, 50))
  expect(walletPay()).toHaveTextContent(/^500$/)
})
