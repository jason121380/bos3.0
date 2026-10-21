// 保護重新開單「換顧客時清空扣入金」（2026/10/22 Jason：重新要清空）：
// 佇列帳單帶著原顧客的扣入金載入；櫃檯換成另一位顧客時，扣入金要歸 0，不能用新顧客的入金去扣原顧客那筆金額。
// 載入時由「尚未帶入顧客」變成原顧客不算換顧客，原本的扣入金要保留。
import React, { useState } from 'react'
import { screen, wait, fireEvent } from '@testing-library/react'
import { renderPage, loginAs } from '../../../__tests__/testkit.test'
import billContext from 'context/keyInContext'
import PaymentCustomerWallet from '../PaymentCustomerWallet'

const emptyBill = { serviceOrders: [], productOrders: [], ticketOrders: [], amountByOtherPay: 0 }

// 以真正的 state 當帳單，按鈕模擬 Head 換顧客
function Harness({ initialCustomerId, walletPay }) {
  const [bill, setBill] = useState({ ...emptyBill, customerId: initialCustomerId, walletPay })
  const handleBillChange = ({ key, value }) => setBill(prev => ({ ...prev, [key]: value }))
  return (
    <billContext.Provider value={{ bill, setBill, handleBillChange, order: { loading: true } }}>
      <PaymentCustomerWallet />
      <output data-testid="wallet-pay">{bill.walletPay}</output>
      {/* 重新開單載入佇列帳單時，顧客與扣入金同時帶入（QueueOrderEdit/index.js） */}
      <button onClick={() => setBill(prev => ({ ...prev, customerId: 'customer-1', walletPay: 300 }))}>載入佇列帳單</button>
      <button onClick={() => setBill(prev => ({ ...prev, customerId: 'customer-2' }))}>換顧客</button>
    </billContext.Provider>
  )
}

const fixtures = { customerWallet: { customerWallet: 1000 } }

beforeEach(() => loginAs())

it('換成另一位顧客時，扣入金清空為 0', async () => {
  renderPage(<Harness initialCustomerId="customer-1" walletPay={300} />, { fixtures })
  expect(screen.getByTestId('wallet-pay')).toHaveTextContent(/^300$/)
  fireEvent.click(screen.getByText('換顧客'))
  await wait(() => expect(screen.getByTestId('wallet-pay')).toHaveTextContent(/^0$/))
})

it('載入佇列帳單時由尚未帶入顧客變成原顧客，帶入的扣入金保留', async () => {
  const { settle } = renderPage(<Harness initialCustomerId={undefined} walletPay={0} />, { fixtures })
  fireEvent.click(screen.getByText('載入佇列帳單'))
  await settle()
  expect(screen.getByTestId('wallet-pay')).toHaveTextContent(/^300$/)
})
