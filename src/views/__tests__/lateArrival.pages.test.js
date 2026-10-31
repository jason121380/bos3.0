// 資料晚到／設定查詢異常時不整頁錯誤（e2e/late-arrival.spec.js 與畫面掃描補假資料時找到的頁面，每一處一則回歸測試）。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../__tests__/testkit.test'

jest.setTimeout(30000)

beforeAll(() => {
  if (!Element.prototype.scrollTo) Element.prototype.scrollTo = () => {}
})
beforeEach(() => loginAs())
afterEach(cleanup)

describe('設計師排行榜（DesignerPerformBasic）', () => {
  // 原本把「月平均顯示設定」的值（布林）當成查詢物件讀 .loading；設定查詢失敗或回 null 時值是 undefined／null，整頁錯誤
  const DesignerPerformBasic = require('views/DesignerPerformBasic').default
  const leaderboard = { designerLeaderboard: { designerLeaderBoard: [], monthlyAveragePerformanceTotal: 0 } }

  it('月平均顯示設定查詢失敗：排行榜照常顯示，不整頁錯誤', async () => {
    const utils = renderPage(<DesignerPerformBasic />, {
      fixtures: { FETCH_DESIGNERS_LEADERBOARD: leaderboard, GET_MONTHLY_AVERAGE_DISPLAY_FOR_DESIGNER_LEADERBOARD: new Error('設定讀取失敗') },
    })
    await utils.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('設計師排行榜', { exact: false })[0]).toBeInTheDocument()
  })

  it('月平均顯示設定回 null、且比排行榜晚到：不整頁錯誤', async () => {
    const utils = renderPage(<DesignerPerformBasic />, {
      fixtures: {
        FETCH_DESIGNERS_LEADERBOARD: leaderboard,
        GET_MONTHLY_AVERAGE_DISPLAY_FOR_DESIGNER_LEADERBOARD: { getMonthlyAverageDisplayForDesignerLeaderBoard: null },
      },
      delays: { GET_MONTHLY_AVERAGE_DISPLAY_FOR_DESIGNER_LEADERBOARD: 80 },
    })
    await utils.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})
