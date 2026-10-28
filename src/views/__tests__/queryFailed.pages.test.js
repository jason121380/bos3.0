// 查詢失敗要離開骨架，顯示可重試的錯誤狀態（與盤點作業、切換店家同一套）。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../__tests__/testkit.test'

jest.setTimeout(20000)

const PAGES = [
  ['views/SalaryOverview', '薪資總表/月結'],
  ['views/MoneyFlowTransferReport', '收支匯款表'],
  ['views/MoneyFlowCategoryReport', '收支分類明細表'],
  ['views/DesignerPerformOverview', '全店業績分析表'],
  ['views/CustomerWalletLeaderboard', '顧客入金排行榜'],
  ['views/CustomerConsumptionLeaderboard', '顧客消費排行榜'],
  ['views/CustomerFilterExport', '客資篩選匯出'],
]

const renderModule = modulePath => {
  const Page = require(modulePath).default
  return renderPage(<Page match={{ params: { id: '1', tab: 'general' } }} location={{ pathname: '/page/1', search: '' }} />, {
    fallback: 'error',
    route: '/page/1',
  })
}

beforeAll(() => {
  if (!Element.prototype.scrollTo) Element.prototype.scrollTo = () => {}
})
beforeEach(() => loginAs())
afterEach(cleanup)

it.each(PAGES)('%s 查詢失敗：顯示錯誤與重新查詢，不是一直載入', async (modulePath, title) => {
  const utils = renderModule(modulePath)
  expect((await screen.findAllByText(title, { exact: false }))[0]).toBeInTheDocument()
  await utils.settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.queryByLabelText('載入中')).toBeNull()
  expect(screen.getByText('無法載入資料')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '重新查詢' })).toBeEnabled()
})
