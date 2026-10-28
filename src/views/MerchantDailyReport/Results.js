import clsx from 'clsx'
// 下方明細卡片使用正式 ui 元件，明確保留原列印框線。

import { Table as MuiTable, TableBody as MuiTableBody, TableCell as MuiTableCell, TableHeader as MuiTableHead, TableRow as MuiTableRow, TableHead as ReportTableHead } from 'ui/table'

import { Card, CardContent, CardHeader } from 'ui/card'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { format, startOfMonth } from 'date-fns'
import roundDecimal from './../../helper/roundDecimal.js'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

const reportCellClass = 'h-auto px-4 py-2 text-left align-middle whitespace-pre-line text-[14px] leading-5'
const reportHeadClass = 'h-auto px-4 py-3 align-middle whitespace-pre text-[14px] leading-6 font-semibold text-black'
const reportCardClass = 'overflow-hidden text-text print:rounded-none print:shadow-none print:border print:border-solid print:border-black'
const reportScrollClass = 'ui-scroll-x w-full overflow-x-auto rounded-md bg-background text-text print:rounded-none print:shadow-none'
const reportColumnClass = 'box-border basis-[100%] max-w-[100%] grow-0 min-[900px]:basis-[50%] min-[900px]:max-w-[50%] min-[900px]:grow-0 min-[1200px]:basis-[33.33333333333333%] min-[1200px]:max-w-[33.33333333333333%] min-[1200px]:grow-0 MerchantDailyReportCard'
const reportCardHeaderClass = '!min-h-0 !items-center !gap-0 !px-4 !pb-2 !pt-4 [&>div]:flex-auto [&>div]:block'
const reportDividerClass = 'm-0 shrink-0 border-0 border-b border-solid border-border'

// 明確保留舊表格內距與列印框線，避免依賴相容層 class。
const reportTableClass = 'print:[&_td]:text-text text-[14px] leading-5 [&_tr]:border-0 [&_tr]:hover:bg-transparent [&_td]:border-0 [&_td]:[border-bottom:1px_solid_rgba(0,0,0,0.03)] [&_th]:border-0 [&_th]:[border-bottom:2px_solid_rgba(0,0,0,0.05)] print:[&_td]:!border-0 print:[&_th]:!border-0 print:[&_th]:![border-bottom:2px_solid_rgba(0,0,0,0.05)] print:[&_th]:bg-white print:!border-0 print:!border-b print:!border-black print:[&_tr]:!border-0 print:[&_tbody_tr]:!border-t print:[&_tbody_tr]:!border-black print:[&_td]:![border-bottom:0]'
const mergedReportTableClass = 'print:[&_td]:text-text text-[14px] leading-5 [&_tr]:border-0 [&_tr]:hover:bg-transparent [&_td]:border-0 [&_td]:[border-bottom:1px_solid_rgba(0,0,0,0.03)] [&_th]:border-0 [&_th]:[border-bottom:2px_solid_rgba(0,0,0,0.05)] print:[&_td]:!border-0 print:[&_th]:!border-0 print:[&_th]:![border-bottom:1px_solid_black] print:[&_th]:bg-white print:!border-0 print:!border-b print:!border-black print:[&_tr]:!border-0 print:[&_td]:![border-bottom:1px_solid_black]'

// [&&] 雙 class 權重保留小計粗體／合計紅字，勝過 表頭的 font-semibold、ui/table 的 text-text-tertiary 與列印文字規則。
// 此處已使用正式表格，不輸出 MuiTableCell class，因此不會命中 initialize(-dark).scss 的舊儲存格選擇器。
const BOLD_CELL = '[&&]:font-bold'
const TOTAL_CELL = '[&&]:font-bold [&&]:text-[red]'

// 列印時表頭維持白底黑字（與舊版 th.MuiTableCell-head 的列印樣式一致）
const printHeader = 'print:bg-transparent print:[&_th]:text-text'

// 平均：除數為 0 時顯示 0（原本以 `|| 0` 只擋得住 NaN，業績大於 0 而次數為 0 時顯示 Infinity）
const average = (total, count) => (count ? Math.round(total / count) : 0)

// 查詢失敗時 results 為 {}：明細當成空清單，不讓整頁拋錯（Jason 2026/10/22）
const listOf = list => list || []

function Results({
  merchantDailyReport,
  isServiceTicketMerged,
  curentDayData,
  displayDate,
  results,
  membershipDisplay,
  isMemberShipCardActive,
  mergeData,
  nonCashDisplay
}) {
  let totalCashRevenue = 0
  let totalCashExpenditure = 0
  curentDayData.pickingRecord.forEach(d => {
    totalCashRevenue += d.cashRevenue
    totalCashExpenditure += d.cashExpenditure
  })
  const stillNowData = []
  merchantDailyReport.currentDay.categoryPerformance.forEach(data => {
    if (
      data.performance > 0 ||
      data.totalCount > 0 ||
      data.designationCount > 0 ||
      data.nonDesignationCount > 0 ||
      data.orderTypeCount > 0 ||
      data.orderTypeAveragePerformance > 0 ||
      data.averagePerformance > 0
    ) {
      const obj2 = {
        name: '',
        nowPerformance: 0,
        nowTotalCount: 0,
        nowDesignationCount: 0,
        nowNonDesignationCount: 0,
        nowOrderTypeCount: 0,
        nowOrderTypeAveragePerformance: 0,
        nowAveragePerformance: 0,
        curPerformance: 0,
        curTotalCount: 0,
        curDesignationCount: 0,
        curNonDesignationCount: 0,
        curOrderTypeCount: 0,
        curOrderTypeAveragePerformance: 0,
        curAveragePerformance: 0,
      }
      obj2.name = data.name
      obj2.nowPerformance = data.performance
      obj2.nowTotalCount = data.totalCount
      obj2.nowDesignationCount = data.designationCount
      obj2.nowNonDesignationCount = data.nonDesignationCount
      obj2.nowOrderTypeCount = data.orderTypeCount
      obj2.nowOrderTypeAveragePerformance = data.orderTypeAveragePerformance
      obj2.nowAveragePerformance = data.averagePerformance
      curentDayData.currentDay.categoryPerformance.forEach(curData => {
        // 以分類名稱完全相同對應（原本 indexOf 子字串比對，「護髮療程」會被後面的「護髮」覆蓋成護髮的數字）
        if (obj2.name === curData.name) {
          obj2.curPerformance = curData.performance
          obj2.curTotalCount = curData.totalCount
          obj2.curDesignationCount = curData.designationCount
          obj2.curNonDesignationCount = curData.nonDesignationCount
          obj2.curOrderTypeCount = curData.orderTypeCount
          obj2.curOrderTypeAveragePerformance = curData.orderTypeAveragePerformance
          obj2.curAveragePerformance = curData.averagePerformance
        }
      })
      stillNowData.push(obj2)
    }
  })

  const totalSummury = key => {
    return mergeData.reduce((a, b) => a + b.otherPayment[key] + b.thirdParty[key], 0)
  }
  return (
    <Fragment>
      {/* 列印：MerchantDailyReportTable-* 的 @media print 樣式以 table / th / td 標籤選取，className 保留在表格外框 */}
      <Table dense wrapperClassName="MerchantDailyReportTable-1" className="min-w-[650px]" aria-label="a dense table">
        <TableHeader className={printHeader}>
          <TableRow>
            <TableHead></TableHead>
            {isServiceTicketMerged ? (
              <Fragment>
                <TableHead numeric>營業總業績</TableHead>
                <TableHead numeric>店販業績</TableHead>
                {membershipDisplay || isMemberShipCardActive ? <TableHead numeric>會員卡銷售</TableHead> : null}
              </Fragment>
            ) : (
              <Fragment>
                <TableHead numeric>服務業績</TableHead>
                <TableHead numeric>店販業績</TableHead>
                {membershipDisplay || isMemberShipCardActive ? <TableHead numeric>會員卡銷售</TableHead> : null}
                <TableHead numeric>
                  <div>卡券使用</div>
                  <div>(入業績)</div>
                </TableHead>
                <TableHead numeric>
                  <div>卡券販賣</div>
                  <div>(入業績)</div>
                </TableHead>
              </Fragment>
            )}
            <TableHead numeric>業績收入</TableHead>
            <TableHead numeric>
              <div>卡券販賣</div>
              <div>(不入業績)</div>
            </TableHead>
            <TableHead numeric>
              <div>卡券使用</div>
              <div>(-)</div>
            </TableHead>
            <TableHead numeric>
              <div>第三方卡券</div>
              <div>(-)</div>
            </TableHead>
            <TableHead numeric>
              <div>其他付款方式</div>
              <div>(-)</div>
            </TableHead>
            <TableHead numeric>
              <div>入金使用</div>
              <div>(-)</div>
            </TableHead>
            <TableHead numeric className="text-text">營業現金應收</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="whitespace-nowrap tabular-nums">{format(displayDate.endDate, 'MM/dd')}</TableCell>
            {isServiceTicketMerged ? (
              <Fragment>
                <TableCell numeric>
                  {formatNumber(Math.round(
                    curentDayData.currentDay.service +
                    curentDayData.currentDay.usedTicket +
                    curentDayData.currentDay.ticketSellIntoPerformance
                  ))}
                </TableCell>
                <TableCell numeric>{formatNumber(Math.round(curentDayData.currentDay.product))}</TableCell>
                {membershipDisplay || isMemberShipCardActive ? <TableCell numeric>{formatNumber(Math.round(curentDayData.currentDay.membership))}</TableCell> : null}
              </Fragment>
            ) : (
              <Fragment>
                <TableCell numeric>{formatNumber(Math.round(curentDayData.currentDay.service))}</TableCell>
                <TableCell numeric>{formatNumber(Math.round(curentDayData.currentDay.product))}</TableCell>
                {membershipDisplay || isMemberShipCardActive ? <TableCell numeric>{formatNumber(Math.round(curentDayData.currentDay.membership))}</TableCell> : null}
                <TableCell numeric>
                  {formatNumber(Math.round(curentDayData.currentDay.usedTicket))}
                </TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(curentDayData.currentDay.ticketSellIntoPerformance))}
                </TableCell>
              </Fragment>
            )}

            <TableCell numeric>{formatNumber(Math.round(curentDayData.currentDay.performanceIncome))}</TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(curentDayData.currentDay.ticketSellNotIntoPerformance))}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(curentDayData.currentDay.usedTicketForDecount))}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(curentDayData.currentDay.thirdPartTicketForDecount))}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(curentDayData.currentDay.otherPayWayForDecount))}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(curentDayData.currentDay.walletUsedForDecount))}
            </TableCell>
            <TableCell numeric className="font-medium">{formatNumber(Math.round(curentDayData.currentDay.businessCash))}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="whitespace-nowrap tabular-nums">
              {`${format(startOfMonth(displayDate.endDate), 'MM/dd')} - ${format(
                displayDate.endDate,
                'MM/dd'
              )}`}
            </TableCell>
            {isServiceTicketMerged ? (
              <Fragment>
                <TableCell numeric>
                  {formatNumber(Math.round(
                    merchantDailyReport.currentDay.service +
                    merchantDailyReport.currentDay.usedTicket +
                    merchantDailyReport.currentDay.ticketSellIntoPerformance
                  ))}
                </TableCell>
                <TableCell numeric>{formatNumber(Math.round(merchantDailyReport.currentDay.product))}</TableCell>
                {membershipDisplay || isMemberShipCardActive ? <TableCell numeric>{formatNumber(Math.round(merchantDailyReport.currentDay.membership))}</TableCell> : null}
              </Fragment>
            ) : (
              <Fragment>
                <TableCell numeric>{formatNumber(Math.round(merchantDailyReport.currentDay.service))}</TableCell>
                <TableCell numeric>{formatNumber(Math.round(merchantDailyReport.currentDay.product))}</TableCell>
                {membershipDisplay || isMemberShipCardActive ? <TableCell numeric>{formatNumber(Math.round(merchantDailyReport.currentDay.membership))}</TableCell> : null}
                <TableCell numeric>
                  {formatNumber(Math.round(merchantDailyReport.currentDay.usedTicket))}
                </TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(merchantDailyReport.currentDay.ticketSellIntoPerformance))}
                </TableCell>
              </Fragment>
            )}

            <TableCell numeric>{formatNumber(Math.round(merchantDailyReport.currentDay.performanceIncome))}</TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(merchantDailyReport.currentDay.ticketSellNotIntoPerformance))}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(merchantDailyReport.currentDay.usedTicketForDecount))}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(merchantDailyReport.currentDay.thirdPartTicketForDecount))}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(merchantDailyReport.currentDay.otherPayWayForDecount))}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(merchantDailyReport.currentDay.walletUsedForDecount))}
            </TableCell>
            <TableCell numeric className="font-medium">{formatNumber(Math.round(merchantDailyReport.currentDay.businessCash))}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {merchantDailyReport.currentDay.categoryPerformance.filter(
        data =>
          data.performance > 0 ||
          data.totalCount > 0 ||
          data.designationCount > 0 ||
          data.nonDesignationCount > 0 ||
          data.orderTypeCount > 0 ||
          data.orderTypeAveragePerformance > 0 ||
          data.averagePerformance > 0
      ).length === 0 ? (
        <p className="my-2.5 text-heading text-text">
          無資料
        </p>
      ) : (
        <Table
          dense
          wrapperClassName="MerchantDailyReportTable-2 my-[30px]"
          className="min-w-[650px]"
          aria-label="a dense table"
        >
          <TableHeader className={printHeader}>
            <TableRow>
              <TableHead className="min-w-[68px]" />
              <TableHead numeric>類別總業績</TableHead>
              <TableHead numeric>客次(人次)</TableHead>
              <TableHead numeric>指定/不指定</TableHead>
              <TableHead numeric>客項次</TableHead>
              <TableHead numeric>平均項次單價</TableHead>
              <TableHead numeric>單均價(客次價)</TableHead>
              <TableHead numeric>類別總業績(累積)</TableHead>
              <TableHead numeric>客次(人次)(累積)</TableHead>
              <TableHead numeric>指定/不指定(累積)</TableHead>
              <TableHead numeric>客項次(累積)</TableHead>
              <TableHead numeric>平均項次單價(累積)</TableHead>
              <TableHead numeric>單均價(客次價)(累積)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stillNowData.map((data, index) => (
              <TableRow key={index}>
                <TableCell className="min-w-[68px]">{data.name}</TableCell>
                <TableCell numeric>{formatNumber(Math.round(data.curPerformance))}</TableCell>
                <TableCell numeric>{formatNumber(Math.round(data.curTotalCount))}</TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(data.curDesignationCount))}/{formatNumber(Math.round(data.curNonDesignationCount))}
                </TableCell>
                <TableCell numeric>{formatNumber(Math.round(data.curOrderTypeCount))}</TableCell>
                <TableCell numeric>{formatNumber(Math.round(data.curOrderTypeAveragePerformance))}</TableCell>
                <TableCell numeric>{formatNumber(Math.round(data.curAveragePerformance))}</TableCell>

                <Fragment>
                  <TableCell numeric>{formatNumber(Math.round(data.nowPerformance))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(data.nowTotalCount))}</TableCell>
                  <TableCell numeric>
                    {formatNumber(Math.round(data.nowDesignationCount))}/
                    {formatNumber(Math.round(data.nowNonDesignationCount))}
                  </TableCell>
                  <TableCell numeric>{formatNumber(Math.round(data.nowOrderTypeCount))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(data.nowOrderTypeAveragePerformance))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(data.nowAveragePerformance))}</TableCell>
                </Fragment>
              </TableRow>
            ))}
            <TableRow className="bg-surface font-medium">
              <TableCell className="min-w-[68px] font-bold">合計</TableCell>

              {/* 類別總業績 */}
              <TableCell numeric>{formatNumber(curentDayData.currentDay.performanceIncome)}</TableCell>

              {/* 客次(人次) */}
              <TableCell numeric>{formatNumber(curentDayData.currentDay.orderCount)}</TableCell>

              {/* 指定/不指定 */}
              <TableCell numeric>
                {`${formatNumber(curentDayData.currentDay.orderDesignateCount)}/${formatNumber(curentDayData.currentDay.orderNonDesignateCount)}`}
              </TableCell>

              {/* 客項次 */}
              <TableCell numeric>
                {formatNumber(Math.round(
                  curentDayData.currentDay.categoryPerformance
                    .map(data => data.orderTypeCount)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                ))}
              </TableCell>

              {/* 平均項次單價 */}
              <TableCell numeric>
                {formatNumber(average(
                  curentDayData.currentDay.performanceIncome,
                  curentDayData.currentDay.categoryPerformance
                    .map(data => data.orderTypeCount)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                ))}
              </TableCell>

              {/* 單均價(客次價) */}
              <TableCell numeric>
                {formatNumber(average(curentDayData.currentDay.performanceIncome, curentDayData.currentDay.orderCount))}
              </TableCell>

              {/* 類別總業績(累積) */}
              <TableCell numeric>{formatNumber(merchantDailyReport.currentDay.performanceIncome)}</TableCell>

              {/* 客次(人次)(累積) */}
              <TableCell numeric>{formatNumber(merchantDailyReport.currentDay.orderCount)}</TableCell>

              {/* 指定/不指定(累積) */}
              <TableCell numeric>
                {`${formatNumber(merchantDailyReport.currentDay.orderDesignateCount)}/${formatNumber(merchantDailyReport.currentDay.orderNonDesignateCount)}`}
              </TableCell>

              {/* 客項次(累積) */}
              <TableCell numeric>
                {formatNumber(Math.round(
                  stillNowData
                    .map(data => data.nowOrderTypeCount)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                ))}
              </TableCell>

              {/* 平均項次單價(累積) */}
              <TableCell numeric>
                {formatNumber(Math.round(
                  stillNowData
                    .map(data => data.nowOrderTypeAveragePerformance)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                ))}
              </TableCell>

              {/* 單均價(客次價)(累積) */}
              <TableCell numeric>
                {formatNumber(Math.round(
                  stillNowData
                    .map(data => data.nowAveragePerformance)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                ))}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}

      {/* <FormControlLabel
        style={{ marginBottom: '15px' }}
        control={<Checkbox color="primary" />}
        label="顯示類別區間業績"
        checked={displayIntervalData}
        onChange={() => setDisplayIntervalData(!displayIntervalData)}
      /> */}
      <Table dense wrapperClassName="MerchantDailyReportTable-3" className="min-w-[650px]" aria-label="a dense table">
        <TableHeader className={printHeader}>
          <TableRow>
            <TableHead></TableHead>
            <TableHead numeric>總客數</TableHead>
            <TableHead numeric>指定客/不指定客</TableHead>
            <TableHead numeric>男/女/未知</TableHead>
            <TableHead numeric>入金儲值</TableHead>
            <TableHead numeric>入金使用</TableHead>
            <TableHead numeric>卡券販賣</TableHead>
            <TableHead numeric>卡券使用</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="whitespace-nowrap tabular-nums">{format(displayDate.endDate, 'MM/dd')}</TableCell>
            <TableCell numeric>{formatNumber(Math.round(curentDayData.orderTotalCount))}</TableCell>
            <TableCell numeric>{`${formatNumber(Math.round(curentDayData.orderDesignateCount))}/${formatNumber(Math.round(
              curentDayData.orderNonDesignateCount
            ))}`}</TableCell>
            <TableCell numeric>{`${formatNumber(Math.round(curentDayData.orderMaleCount))}/${formatNumber(Math.round(
              curentDayData.orderFemaleCount
            ))}/${formatNumber(Math.round(curentDayData.orderUnknownCount))}`}</TableCell>
            <TableCell numeric>{formatNumber(Math.round(curentDayData.currentDay.walletDepositTotal))}</TableCell>
            <TableCell numeric>{formatNumber(Math.round(curentDayData.currentDay.walletUsedTotal))}</TableCell>
            <TableCell numeric>{formatNumber(Math.round(curentDayData.currentDay.ticketSellTotal))}</TableCell>
            <TableCell numeric>{formatNumber(Math.round(curentDayData.currentDay.ticketUsedTital))}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="whitespace-nowrap tabular-nums">{`${format(startOfMonth(displayDate.endDate), 'MM/dd')} - ${format(
              displayDate.endDate,
              'MM/dd'
            )}`}</TableCell>
            <TableCell numeric>{formatNumber(Math.round(merchantDailyReport.orderTotalCount))}</TableCell>
            <TableCell numeric>{`${formatNumber(Math.round(merchantDailyReport.orderDesignateCount))}/${formatNumber(Math.round(
              merchantDailyReport.orderNonDesignateCount
            ))}`}</TableCell>
            <TableCell numeric>{`${formatNumber(Math.round(merchantDailyReport.orderMaleCount))}/${formatNumber(Math.round(
              merchantDailyReport.orderFemaleCount
            ))}/${formatNumber(Math.round(merchantDailyReport.orderUnknownCount))}`}</TableCell>
            <TableCell numeric>{formatNumber(Math.round(merchantDailyReport.currentDay.walletDepositTotal))}</TableCell>
            <TableCell numeric>{formatNumber(Math.round(merchantDailyReport.currentDay.walletUsedTotal))}</TableCell>
            <TableCell numeric>{formatNumber(Math.round(merchantDailyReport.currentDay.ticketSellTotal))}</TableCell>
            <TableCell numeric>{formatNumber(Math.round(merchantDailyReport.currentDay.ticketUsedTital))}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Table
        dense
        wrapperClassName="MerchantDailyReportTable-4 my-[30px]"
        className="min-w-[650px]"
        aria-label="a dense table"
      >
        <TableHeader className={printHeader}>
          <TableRow>
            <TableHead>科目編號</TableHead>
            <TableHead>科目名稱</TableHead>
            <TableHead numeric>收入金額</TableHead>
            <TableHead numeric>支出金額</TableHead>
            <TableHead>備註</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {curentDayData.generalMoneyFlow.map((data, index) => (
            <TableRow key={index}>
              <TableCell>{data.subjectNumber}</TableCell>
              <TableCell>{data.subjectName}</TableCell>
              <TableCell numeric>{formatNumber(roundDecimal(data.cashRevenue))}</TableCell>
              <TableCell numeric>{formatNumber(roundDecimal(data.cashExpenditure))}</TableCell>
              <TableCell>{data.remark}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell></TableCell>
            <TableCell className="font-medium">{`營業現金結存:${formatNumber(Math.round(curentDayData.businessCash))}`}</TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
          </TableRow>
          {curentDayData.moneyFlow.map((data, index) => (
            <TableRow key={index}>
              <TableCell>{data.subjectNumber}</TableCell>
              <TableCell>{data.subjectName}</TableCell>
              <TableCell numeric>{formatNumber(roundDecimal(data.cashRevenue))}</TableCell>
              <TableCell numeric>{formatNumber(roundDecimal(data.cashExpenditure))}</TableCell>
              <TableCell>{data.remark}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell></TableCell>
            <TableCell className="font-bold">合計</TableCell>
            <TableCell numeric className="font-bold">{formatNumber(Math.round(curentDayData.summaryRevenue))}</TableCell>
            <TableCell numeric className="font-bold">{formatNumber(Math.round(curentDayData.summaryExpenditure))}</TableCell>
            <TableCell></TableCell>
          </TableRow>
          <TableRow>
            <TableCell></TableCell>
            <TableCell className="font-bold text-danger">{`當日現金結存:${formatNumber(Math.round(
              curentDayData.cashBalance
            ))}`}</TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
          </TableRow>
          {/* 材料自購 */}
          {curentDayData.pickingRecord.map((data, index) => (
            <TableRow key={index}>
              <TableCell>{data.productNumber}</TableCell>
              <TableCell>{data.productName}</TableCell>
              <TableCell numeric>{formatNumber(roundDecimal(data.cashRevenue))}</TableCell>
              <TableCell numeric>{formatNumber(roundDecimal(data.cashExpenditure))}</TableCell>
              <TableCell>{data.remark}</TableCell>
            </TableRow>
          ))}
          {/* 材料自購合計 */}
          <TableRow>
            <TableCell></TableCell>
            <TableCell className="font-bold">合計</TableCell>
            <TableCell numeric className="font-bold">{formatNumber(Math.round(totalCashRevenue))}</TableCell>
            <TableCell numeric className="font-bold">{formatNumber(Math.round(totalCashExpenditure))}</TableCell>
            <TableCell></TableCell>
          </TableRow>
          {/* 材料自購合計+今日現金結存 */}
          <TableRow>
            <TableCell></TableCell>
            <TableCell
              className="font-bold text-danger"
            >{`當日現金結存（含自購）:${formatNumber(Math.round(
              curentDayData.cashBalance + totalCashRevenue
            ))}`}</TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
          </TableRow>

          {curentDayData.moneyFlowNotCash.length > 0 && (
            <TableRow>
              <TableCell></TableCell>
              <TableCell className="font-medium">非現場現金收支：</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          )}
          {curentDayData.moneyFlowNotCash.map((data, index) => (
            <TableRow key={index}>
              <TableCell>{data.subjectNumber}</TableCell>
              <TableCell>{data.subjectName}</TableCell>
              <TableCell numeric>{formatNumber(roundDecimal(data.cashRevenue))}</TableCell>
              <TableCell numeric>{formatNumber(roundDecimal(data.cashExpenditure))}</TableCell>
              <TableCell>{data.remark}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* 下方明細卡片：@media print 依 .MuiCard-root / .MuiTableContainer-root 排版（MerchantDailyReportCardContainer），以明確樣式維持原列印輸出，列印輸出不變 */}
      <div className="box-border flex flex-wrap -mt-6 -ml-6 w-[calc(100%+24px)] [&>div]:pt-6 [&>div]:pl-6 MerchantDailyReportCardContainer">
        {nonCashDisplay ? (
          <div className="box-border basis-[100%] max-w-[100%] grow-0 min-[900px]:basis-[100%] min-[900px]:max-w-[100%] min-[900px]:grow-0 min-[1200px]:basis-[66.66666666666666%] min-[1200px]:max-w-[66.66666666666666%] min-[1200px]:grow-0 MergeResultCard">
            <Card className={reportCardClass}>
              <div className={reportScrollClass}>
                <MuiTable className={mergedReportTableClass} aria-label="a dense table">
                  <MuiTableHead>
                    <MuiTableRow>
                      <ReportTableHead className={reportHeadClass}></ReportTableHead>
                      <ReportTableHead className={reportHeadClass}>其他支付方式明細</ReportTableHead>
                      <ReportTableHead className={reportHeadClass}>第三方卡券明細</ReportTableHead>
                      <ReportTableHead className={clsx(reportHeadClass, BOLD_CELL)}>小計</ReportTableHead>
                    </MuiTableRow>

                  </MuiTableHead>
                  <MuiTableBody>
                    {mergeData.map(({ name, otherPayment, thirdParty }) => (
                      <MuiTableRow key={name}>
                        <MuiTableCell className={reportCellClass}>{name}</MuiTableCell>
                        <MuiTableCell className={reportCellClass}>{`${otherPayment.usedPrice} / (${otherPayment.usedPriceWithNoCash})`}</MuiTableCell>
                        <MuiTableCell className={reportCellClass}>{`${thirdParty.usedPrice} / (${thirdParty.usedPriceWithNoCash})`}</MuiTableCell>
                        <MuiTableCell className={clsx(reportCellClass, BOLD_CELL)}>{
                          `${otherPayment.usedPrice + thirdParty.usedPrice} / (${otherPayment.usedPriceWithNoCash + thirdParty.usedPriceWithNoCash})`
                        }</MuiTableCell>
                      </MuiTableRow>
                    ))}
                    <MuiTableRow>
                      <MuiTableCell className={reportCellClass} colSpan={2} />
                      <MuiTableCell className={clsx(reportCellClass, TOTAL_CELL)}>合計</MuiTableCell>
                      <MuiTableCell className={clsx(reportCellClass, TOTAL_CELL)}>{`${totalSummury('usedPrice')} / ${totalSummury('usedPriceWithNoCash')}`}</MuiTableCell>
                    </MuiTableRow>
                  </MuiTableBody>
                </MuiTable>
              </div>
            </Card>
          </div>
        ) : (
          <>
            <div className={reportColumnClass}>
              <Card className={reportCardClass}>
                <CardHeader className={reportCardHeaderClass}><span className="block text-heading text-text">其他支付方式明細</span></CardHeader>
                <hr className={reportDividerClass} />
                <CardContent className="last:pb-4 p-0">
                  <div>
                    <div className={reportScrollClass}>
                      <MuiTable className={reportTableClass} aria-label="a dense table">
                        <MuiTableBody>
                          {listOf(results.otherPayway).map((data, index) => (
                            <MuiTableRow key={index}>
                              <MuiTableCell className={reportCellClass}>{data.paywayName}</MuiTableCell>
                              <MuiTableCell className={reportCellClass}>{data.usedPrice}</MuiTableCell>
                              <MuiTableCell className={reportCellClass}>({data.usedPriceWithNoCash})</MuiTableCell>
                            </MuiTableRow>
                          ))}
                        </MuiTableBody>
                      </MuiTable>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className={reportColumnClass}>
              <Card className={reportCardClass}>
                <CardHeader className={reportCardHeaderClass}><span className="block text-heading text-text">第三方卡券明細</span></CardHeader>
                <hr className={reportDividerClass} />
                <CardContent className="last:pb-4 p-0">
                  <div>
                    <div className={reportScrollClass}>
                      <MuiTable className={reportTableClass} aria-label="a dense table">
                        <MuiTableBody>
                          {listOf(results.thirdPartTicket).map((data, index) => (
                            <MuiTableRow key={index}>
                              <MuiTableCell className={reportCellClass}>{data.ticketName}</MuiTableCell>
                              <MuiTableCell className={reportCellClass}>{data.usedPrice}</MuiTableCell>
                              <MuiTableCell className={reportCellClass}>({data.usedPriceWithNoCash})</MuiTableCell>
                            </MuiTableRow>
                          ))}
                        </MuiTableBody>
                      </MuiTable>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
        <div className={reportColumnClass}>
          <Card className={reportCardClass}>
            <CardHeader className={reportCardHeaderClass}><span className="block text-heading text-text">入金儲值明細</span></CardHeader>
            <hr className={reportDividerClass} />
            <CardContent className="last:pb-4 p-0">
              <div>
                <div className={reportScrollClass}>
                  <MuiTable className={reportTableClass} aria-label="a dense table">
                    <MuiTableBody>
                      {listOf(results.walletDeposit).map((data, index) => (
                        <MuiTableRow key={index}>
                          <MuiTableCell className={reportCellClass}>{data.paywayName}</MuiTableCell>
                          <MuiTableCell className={reportCellClass}>{data.usedPrice}</MuiTableCell>
                          <MuiTableCell className={reportCellClass}>({data.usedPriceWithNoCash})</MuiTableCell>
                        </MuiTableRow>
                      ))}
                    </MuiTableBody>
                  </MuiTable>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Fragment>
  )
}

Results.propTypes = {
  report: PropTypes.object,
}

Results.defaultProps = {
  report: {},
}

export default Results
