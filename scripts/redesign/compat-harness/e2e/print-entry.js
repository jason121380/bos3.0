// 列印範本三檔（MerchantDailyReport／DecreaseDailyReport 的 Results、MerchantBankTransferReport/TransferDetail）MUI → 相容層的比對頁：
// 同一份模擬資料，#mui 渲染換檔前的原檔（*.orig.js），#compat 渲染換成 ui/*-compat 的新檔；網址 ?mdr／?ddr／?td 只渲染其一，#m／#c 只渲染一側。
// 準備：git show <換檔前 commit>:src/views/MerchantDailyReport/Results.js > src/views/MerchantDailyReport/Results.orig.js（另兩檔同理，用完刪除，不要 commit）
// 比對：ESBUILD=… node ../build.js print-entry.js <out>；node ../run.js <out> <mock build> [--dark] [--print]（computed style）；
//      SIDE='#m'／'#c' node print-px.js <out> <mock build>（兩側各自單獨截圖，螢幕與列印模式逐像素比對）
import React from 'react'
import ReactDOM from 'react-dom'
import { MuiScope } from '../mui-theme'
// eslint-disable-next-line import/no-unresolved -- 比對前才建立的原檔副本
import MDRm from 'views/MerchantDailyReport/Results.orig'
import MDRc from 'views/MerchantDailyReport/Results'
// eslint-disable-next-line import/no-unresolved -- 比對前才建立的原檔副本
import DDRm from 'views/DecreaseDailyReport/Results.orig'
import DDRc from 'views/DecreaseDailyReport/Results'
// eslint-disable-next-line import/no-unresolved -- 比對前才建立的原檔副本
import TDm from 'views/MerchantBankTransferReport/TransferDetail.orig'
import TDc from 'views/MerchantBankTransferReport/TransferDetail'

// 自動補值：明確給的欄位原樣，其餘欄位回傳 7（數字）或可 map 的空陣列行為
const auto = obj =>
  new Proxy(obj, {
    get(t, k) {
      if (k in t) {
        const v = t[k]
        if (Array.isArray(v)) return v.map(x => (x && typeof x === 'object' ? auto(x) : x))
        if (v && typeof v === 'object' && !(v instanceof Date)) return auto(v)
        return v
      }
      if (typeof k === 'symbol') return k === Symbol.toPrimitive ? () => 7 : undefined
      if (['map', 'filter', 'forEach', 'reduce', 'some', 'find', 'concat', 'slice', 'sort', 'length', 'every', 'flatMap', 'includes', 'indexOf', 'join'].includes(k)) return [][k] === undefined ? 0 : (k === 'length' ? 0 : [][k].bind([]))
      if (k === 'toFixed') return n => (7).toFixed(n)
      if (k === 'toString' || k === 'valueOf') return () => 7
      if (k === 'then' || k === '$$typeof' || k === 'toJSON') return undefined
      return auto({})
    },
  })
const pay = n => ({ paywayName: `付款${n}`, ticketName: `卡券${n}`, usedPrice: 100 * n, usedPriceWithNoCash: 10 * n })
const results = { otherPayway: [pay(1), pay(2)], thirdPartTicket: [pay(3)], walletDeposit: [pay(4), pay(5)] }
const mergeData = [{ name: 'LINE Pay', otherPayment: pay(1), thirdParty: pay(2) }, { name: '街口', otherPayment: pay(3), thirdParty: pay(4) }]
const mdr = nonCashDisplay => ({
  merchantDailyReport: auto({ currentDay: { categoryPerformance: [] }, tillNow: { categoryPerformance: [] } }),
  curentDayData: auto({ pickingRecord: [], moneyFlowNotCash: [] }),
  displayDate: { startDate: new Date(2026, 9, 1), endDate: new Date(2026, 9, 20) },
  results: auto(results),
  mergeData,
  nonCashDisplay,
  isServiceTicketMerged: false,
  membershipDisplay: true,
  isMemberShipCardActive: true,
})
const helper = id => ({
  user: { id, designerNo: 'A1', nickName: '小美', name: '王美' },
  helperRecord: [{ orderId: 'o1', orderNo: 1001, itemName: '剪髮\n洗髮', designer: { nameForReport: '設計師A' }, price: 300, point: 0 }, { orderId: 'o2', orderNo: 1002, itemName: '染髮', designer: null, price: 0, point: 5 }],
  helperRecordPriceSummary: 300,
  helperRecordPointSummary: 5,
  summaryCurrentDay: auto({ priceRetrieveWithoutPoint: 300, point: 5, priceRetrieveFromPoint: 50, productPerformance: 0 }),
  summaryTillNow: auto({ priceRetrieveWithoutPoint: 900, point: 15, priceRetrieveFromPoint: 150, productPerformance: 20 }),
})
const ddr = { helperReport: [helper('u1'), helper('u2')], titleDate: new Date(2026, 9, 20).getTime(), priceDisplayOnReport: true, isMemberShipCardActive: true, designerNameForReportTypeData: 'YES', printMode: true }
const bank = { remitterBankAccount: '012345678901', remitterBankName: '台灣銀行', remitterBankBranchName: '信義分行', trustorName: '王小明', trustorPhone: '0912345678' }
const kind = window.location.search.slice(1) || 'all'
const Side = ({ which }) => {
  const m = which === 'm'
  const MDR = m ? MDRm : MDRc
  const DDR = m ? DDRm : DDRc
  const TD = m ? TDm : TDc
  return (
    <div>
      {(kind === 'all' || kind === 'mdr') && <MDR {...mdr(false)} />}
      {(kind === 'all' || kind === 'mdr') && <MDR {...mdr(true)} />}
      {(kind === 'all' || kind === 'ddr') && <DDR {...ddr} />}
      {(kind === 'all' || kind === 'td') && <TD merchantBankSettings={bank} />}
    </div>
  )
}
ReactDOM.render(
  <MuiScope>
    {window.location.hash !== '#c' && <div id="mui"><Side which="m" /></div>}
    {window.location.hash !== '#m' && <div id="compat"><Side which="c" /></div>}
  </MuiScope>,
  document.getElementById('root')
)
