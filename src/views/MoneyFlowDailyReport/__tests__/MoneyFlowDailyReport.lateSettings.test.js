// 每日收支明細：「會員卡是否啟用」設定比報表晚回來時，會員卡消費列不能被拿掉（B2 #12，2026/10/30）。
// 規則：店家有啟用會員卡時，即使期間內會員卡消費全是 0，也要顯示「會員卡消費」列（沒啟用、且全 0 才隱藏）。
// 原本子層算表格的 effect 只看報表資料；設定晚到時子層先用預設 false 算完，設定回來也不重算，列就消失了。
import { cleanup, screen } from '@testing-library/react'
import React from 'react'

import { loginAs, renderPage } from '__tests__/testkit.test'
import MoneyFlowDailyReport from 'views/MoneyFlowDailyReport'

afterEach(cleanup)

const report = {
  moneyFlowDailyReport: [
    { itemName: '現金收入', itemNo: '1', type: 'REVENUE', moneyFlowRecord: [{ date: 1, price: 100 }] },
    { itemName: '會員卡消費', itemNo: '2', type: 'REVENUE', moneyFlowRecord: [{ date: 1, price: 0 }] },
  ],
}

const fixtures = active => ({
  GET_MONEY_FLOW__REPORT: report,
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: active },
})

describe('每日收支明細：會員卡設定晚到', () => {
  beforeEach(() => loginAs())

  it('啟用會員卡、設定比報表晚回來：仍顯示會員卡消費列', async () => {
    const { settle } = renderPage(<MoneyFlowDailyReport />, {
      fixtures: fixtures(true),
      delays: { GET_IS_MEMBERSHIP_CARD_ACTIVE: 50 },
    })
    await settle()
    expect(screen.getByText('現金收入')).toBeInTheDocument()
    expect(screen.getByText('會員卡消費')).toBeInTheDocument()
  })

  it('沒啟用會員卡且期間全為 0：不顯示會員卡消費列（不論誰先回來）', async () => {
    const { settle } = renderPage(<MoneyFlowDailyReport />, {
      fixtures: fixtures(false),
      delays: { GET_IS_MEMBERSHIP_CARD_ACTIVE: 50 },
    })
    await settle()
    expect(screen.getByText('現金收入')).toBeInTheDocument()
    expect(screen.queryByText('會員卡消費')).toBeNull()
  })
})
