// 項目 3 第一批：純假資料、固定日期；共用同一份入口建置 main 與工作樹，不連線。
import React from 'react'
import ReactDOM from 'react-dom'
import { MemoryRouter } from 'react-router-dom'
import { ApolloClient, ApolloProvider, ApolloLink, InMemoryCache, Observable } from '@apollo/client'
import Cost from 'views/CostAnalysisReport'
import Income from 'views/IncomeStatementReport'
import Analysis from 'views/DesignerPerforamnceAnalyzeReport/Results'
import Compare from 'views/DesignerPerforamnceAnalyzeReport/Compare'
import Rake from 'views/DesignerRakeReport'
import Interval from 'views/MerchantBusinessIntervalReport'
import Helper from 'views/HelperMonthlyReport'
import { PageHeader } from 'ui/page-header'

const NativeDate = Date
const now = new NativeDate('2026-01-01T08:00:00+08:00').getTime()
window.Date = class extends NativeDate {
  constructor(...args) { super(...(args.length ? args : [now])) }
  static now() { return now }
}
localStorage.clear()
localStorage.setItem('userMerchant', JSON.stringify({ id: 'fake-merchant', name: '測試門市A' }))
const date = { startDate: new Date(2026, 0, 1).getTime(), endDate: new Date(2026, 0, 31, 23, 59, 59, 999).getTime() }
const rows = (count, fn) => Array.from({ length: count }, (_, i) => fn(i))
const finance = rows(36, i => ({ subjectNumber: `TEST${i + 1}`, subjectName: i === 0 ? '營業收入' : `測試費用科目${i + 1}`, cashRevenue: i === 0 ? 10000 : 0, cashExpenditure: i === 0 ? 0 : -100, remark: '模擬資料' }))
// 依查詢選取欄位補齊固定數值；陣列／文字明確列出，未登記的根查詢直接失敗。
const lists = new Set(['helperMonthlyReport', 'userRakeReport', 'categoryPerformance', 'pickingRecord', 'generalMoneyFlow', 'moneyFlow', 'moneyFlowNotCash', 'otherPayway', 'thirdPartTicket', 'walletDeposit'])
const labels = { name: '測試項目', designer: '設計師甲', designerNo: 'TEST01', nickName: '測試甲', subjectName: '測試科目', subjectNumber: 'TEST01', remark: '模擬資料', productNumber: 'TEST01', productName: '測試商品', paywayName: '測試支付', ticketName: '測試卡券' }
function fields(selection, index = 0) {
  return Object.fromEntries(selection.selections.map(field => {
    const name = field.name.value
    let value
    if (field.selectionSet) {
      value = lists.has(name) ? rows(name === 'userRakeReport' ? 6 : name === 'helperMonthlyReport' ? 50 : 4, i => fields(field.selectionSet, i)) : fields(field.selectionSet, index)
    } else if (name === 'id') value = `fake-${index}`
    else if (name === '__typename') value = 'Mock'
    else if (name in labels) value = labels[name] + (index + 1)
    else if (['getIsMemberShipCardActive', 'CARPTDisplay', 'nonCashDisplay'].includes(name)) value = true
    else if (name === 'isServiceTicketMerged') value = false
    else value = 100
    return [field.alias?.value || name, value]
  }))
}
const roots = new Set(['merchantIncomeStatementV2', 'merchantIncomeStatementV2ForOuterStore', 'getIsMemberShipCardActive', 'getParameterReportSetting', 'helperMonthlyReport', 'userRakeReport', 'merchantDailyReportV2', 'merchantDashboard', 'getPriceDisplayOnDailyReportDefault'])
let pending = 0
const client = new ApolloClient({ cache: new InMemoryCache({ addTypename: false }), link: new ApolloLink(operation => new Observable(observer => {
  pending++
  const definition = operation.query.definitions.find(d => d.kind === 'OperationDefinition')
  const unknown = definition.selectionSet.selections.find(f => !roots.has(f.name.value))
  if (unknown) { observer.error(new Error(`未登記的模擬查詢：${unknown.name.value}`)); return }
  const data = fields(definition.selectionSet)
  if ('merchantIncomeStatementV2' in data) data.merchantIncomeStatementV2.businessIncomeDetail.moneyFlowSetConnection = finance
  if ('merchantIncomeStatementV2ForOuterStore' in data) data.merchantIncomeStatementV2ForOuterStore = finance
  observer.next({ data })
  observer.complete()
  pending--
})) })
const type = i => ({ typeName: `測試服務${i + 1}`, orderTypeCount: 10, orderTypePercentage: 10, orderTypeDesignateCount: 6, orderTypeDesignatePercentage: 60, orderTypeNonDesignateCount: 4, orderTypeNonDesignatePercentage: 40, currentOrderTypePerformance: 1000, currentOrderTypePerformancePercentage: 10, currentOrderTypeAveragePrice: 100 })
const report = rows(6, i => ({ merchantName: '測試門市A', designerName: `設計師${['甲', '乙', '丙', '丁', '戊', '己'][i]}`, totalPerformance: 10000, totalOrderCount: 100, orderAveragePrice: 100, orderDesignateCount: 60, orderDesignatePercentage: 60, orderNonDesignateCount: 40, orderNonDesignatePercentage: 40, productPerformance: 1000, productPerformancePercentage: 10, membershipPerformance: 1000, membershipPerformancePercentage: 10, serviceTypeAnalyze: rows(8, type) }))
const key = window.location.search.slice(1) || 'cost'
const title = key === 'compare' ? '設計師業績分析表' : '設計師業績分析表'
// 分析報表直接傳入 index 傳給 Results／Compare 的 props，並重現 index 的列印頁首。
const analysis = <div className="ui-root">
  <div className="merchantNamePrint" style={{ marginBottom: '10px', display: 'none', justifyContent: 'space-between' }}>
    <div className="merchantNamePrint">測試門市A   2026-01-01  - 2026-01-31   {title}</div>
    <div className="merchantNamePrint">列印時間： 2026-01-01-08:00</div>
  </div>
  <PageHeader title={title} />
  {key === 'compare' ? <Compare compareData={[report.slice(0, 3), report.slice(3)]} loading={false} isMemberShipCardActive compareInputData={[{ dateRange: date }, { dateRange: date }]} /> : <Analysis report={report} date={date} isMemberShipCardActive />}
</div>
const screens = { cost: <Cost />, income: <Income />, analysis, compare: analysis, rake: <Rake />, interval: <Interval />, helper: <Helper /> }
if (!(key in screens)) throw new Error(`未知報表：${key}`)
ReactDOM.render(<MemoryRouter initialEntries={[`/?startDate=${date.startDate}&endDate=${date.endDate}`]}><ApolloProvider client={client}>{screens[key]}</ApolloProvider></MemoryRouter>, document.getElementById('root'))
// 等 Apollo 與衍生 state 完成；runner 仍檢查實際表格／載入狀態及瀏覽器錯誤。
window.printCompareReady = () => pending === 0 && document.querySelectorAll('tbody tr').length >= 6 && !document.querySelector('[aria-busy="true"]')
