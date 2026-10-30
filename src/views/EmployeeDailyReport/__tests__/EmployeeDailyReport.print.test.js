// 設計師日報表：店家開啟「日報表四捨五入」時，列印區要印出這一天的設計師（2026/10/30）。
// 原因：Results 在日報查詢完成那次 render 才掛載，子層 effect 比父層早跑；四捨五入的列印資料原本只在設定 loading 變化時算一次，
// 讀到的是父層尚未更新的舊列印資料（第一次進頁為空、換日期為前一天），畫面表格正確、印出來卻是空白或前一天。
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import React from 'react'

import { loginAs, renderPage } from '__tests__/testkit.test'
import EmployeeDailyReport from 'views/EmployeeDailyReport'

afterEach(cleanup)

const designer = (id, name) => ({
  user: { id, name, designerNo: '', nickName: '' },
  totalPageCount: 1,
  currentPageOrder: 1,
  currentFakeSummary: 1000.4,
  currentTruthSummary: 900.6,
  tillNow: {},
  currentDay: {},
  orderRecord: [],
})

const printCards = () => document.querySelectorAll('.EmployeeDailyReportCardPrint')

describe('設計師日報表：四捨五入時的列印資料', () => {
  beforeEach(() => loginAs())

  it('開啟四捨五入：列印區印出當天的每一位設計師', async () => {
    const { settle } = renderPage(<EmployeeDailyReport />, {
      fixtures: {
        FETCH_DESIGNER_DAILY_REPORT: { designerDailyReport: [designer('u1', '王小美'), designer('u2', '陳大文')] },
        GET_IS_USING_MATH_ROUND_IN_DESIGNER_DAILY_REPORT: { getIsUsingMathRoundInDesignerDailyReport: true },
      },
    })
    await settle()
    expect(printCards()).toHaveLength(2)
  })

  it('開啟四捨五入、換日期後：列印區印出新日期的設計師，不是前一天的', async () => {
    const reportByDate = variables => {
      const day = new Date(variables.date).getDate()
      const today = new Date().getDate()
      return { designerDailyReport: day === today ? [designer('u1', '今天設計師')] : [designer('u2', '昨天甲'), designer('u3', '昨天乙')] }
    }
    const { settle } = renderPage(<EmployeeDailyReport />, {
      fixtures: {
        FETCH_DESIGNER_DAILY_REPORT: reportByDate,
        GET_IS_USING_MATH_ROUND_IN_DESIGNER_DAILY_REPORT: { getIsUsingMathRoundInDesignerDailyReport: true },
      },
    })
    await settle()
    expect(printCards()).toHaveLength(1)
    fireEvent.keyDown(screen.getByRole('combobox', { name: '快速選擇日期區間' }), { key: 'Enter' })
    fireEvent.keyDown(screen.getByRole('option', { name: '昨天' }), { key: 'Enter' })
    await settle()
    await wait(() => expect(screen.getAllByText(/昨天甲/).length).toBeGreaterThan(0))
    expect(printCards()).toHaveLength(2)
    expect([...printCards()].map(c => c.textContent).join()).toContain('昨天乙')
  })

  it('沒開四捨五入：列印區同樣印出當天的每一位設計師（對照）', async () => {
    const { settle } = renderPage(<EmployeeDailyReport />, {
      fixtures: {
        FETCH_DESIGNER_DAILY_REPORT: { designerDailyReport: [designer('u1', '王小美'), designer('u2', '陳大文')] },
        GET_IS_USING_MATH_ROUND_IN_DESIGNER_DAILY_REPORT: { getIsUsingMathRoundInDesignerDailyReport: false },
      },
    })
    await settle()
    expect(printCards()).toHaveLength(2)
  })
})
