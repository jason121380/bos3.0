// 下方明細卡片區（MerchantDailyReportCardContainer）的列印樣式依賴 MUI 結構：改用輸出相同 DOM／class 的相容層（ui/*-compat）
import { Grid } from 'ui/grid-compat'
import { Table as MuiTable, TableBody as MuiTableBody, TableCell as MuiTableCell, TableHead as MuiTableHead, TableRow as MuiTableRow, TableContainer } from 'ui/table-compat'
import { Paper, Divider } from 'ui/display-compat'
import { Card, CardContent, CardHeader } from 'ui/card-compat'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { format, startOfMonth } from 'date-fns'
import roundDecimal from './../../helper/roundDecimal.js'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

// 相容層儲存格（table-compat.css 隨頁面 chunk 載入、排在 Tailwind 之後）：原 emotion css 執行期插入、同權重時勝出，
// 改以 [&&] 疊成雙 class 權重保住「勝過相容層單一 class」；initialize(-dark).scss 較高權重的 th／深色規則仍照舊勝出（同原本）
const BOLD_CELL = '[&&]:font-bold'
const TOTAL_CELL = '[&&]:font-bold [&&]:text-[red]'

// 列印時表頭維持白底黑字（與舊版 th.MuiTableCell-head 的列印樣式一致）
const printHeader = 'print:bg-transparent print:[&_th]:text-text'

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
        if (obj2.name.indexOf(curData.name) > -1) {
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
                {formatNumber(Math.round(
                  curentDayData.currentDay.performanceIncome /
                  curentDayData.currentDay.categoryPerformance
                    .map(data => data.orderTypeCount)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                ) || 0)}
              </TableCell>

              {/* 單均價(客次價) */}
              <TableCell numeric>
                {formatNumber(Math.round(curentDayData.currentDay.performanceIncome / curentDayData.currentDay.orderCount) || 0)}
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
      {/* 下方明細卡片：@media print 依 .MuiCard-root / .MuiTableContainer-root 排版（MerchantDailyReportCardContainer），以相容層維持 MUI 的 DOM 與 class，列印輸出不變 */}
      <Grid container spacing={3} className="MerchantDailyReportCardContainer">
        {nonCashDisplay ? (
          <Grid item xs={12} md={12} lg={8} className="MergeResultCard">
            <Card>
              <TableContainer component={Paper}>
                <MuiTable size="small" aria-label="a dense table">
                  <MuiTableHead>
                    <MuiTableRow>
                      <MuiTableCell></MuiTableCell>
                      <MuiTableCell>其他支付方式明細</MuiTableCell>
                      <MuiTableCell>第三方卡券明細</MuiTableCell>
                      <MuiTableCell className={BOLD_CELL}>小計</MuiTableCell>
                    </MuiTableRow>

                  </MuiTableHead>
                  <MuiTableBody>
                    {mergeData.map(({ name, otherPayment, thirdParty }) => (
                      <MuiTableRow key={name} hover>
                        <MuiTableCell>{name}</MuiTableCell>
                        <MuiTableCell>{`${otherPayment.usedPrice} / (${otherPayment.usedPriceWithNoCash})`}</MuiTableCell>
                        <MuiTableCell>{`${thirdParty.usedPrice} / (${thirdParty.usedPriceWithNoCash})`}</MuiTableCell>
                        <MuiTableCell className={BOLD_CELL}>{
                          `${otherPayment.usedPrice + thirdParty.usedPrice} / (${otherPayment.usedPriceWithNoCash + thirdParty.usedPriceWithNoCash})`
                        }</MuiTableCell>
                      </MuiTableRow>
                    ))}
                    <MuiTableRow hover>
                      <MuiTableCell colSpan={2} />
                      <MuiTableCell className={TOTAL_CELL}>合計</MuiTableCell>
                      <MuiTableCell className={TOTAL_CELL}>{`${totalSummury('usedPrice')} / ${totalSummury('usedPriceWithNoCash')}`}</MuiTableCell>
                    </MuiTableRow>
                  </MuiTableBody>
                </MuiTable>
              </TableContainer>
            </Card>
          </Grid>
        ) : (
          <>
            <Grid item xs={12} md={6} lg={4} className="MerchantDailyReportCard">
              <Card>
                <CardHeader title="其他支付方式明細" />
                <Divider />
                <CardContent className="p-0">
                  <div>
                    <TableContainer component={Paper}>
                      <MuiTable size="small" aria-label="a dense table">
                        <MuiTableBody>
                          {results.otherPayway.map((data, index) => (
                            <MuiTableRow key={index}>
                              <MuiTableCell>{data.paywayName}</MuiTableCell>
                              <MuiTableCell>{data.usedPrice}</MuiTableCell>
                              <MuiTableCell>({data.usedPriceWithNoCash})</MuiTableCell>
                            </MuiTableRow>
                          ))}
                        </MuiTableBody>
                      </MuiTable>
                    </TableContainer>
                  </div>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={4} className="MerchantDailyReportCard">
              <Card>
                <CardHeader title="第三方卡券明細" />
                <Divider />
                <CardContent className="p-0">
                  <div>
                    <TableContainer component={Paper}>
                      <MuiTable size="small" aria-label="a dense table">
                        <MuiTableBody>
                          {results.thirdPartTicket.map((data, index) => (
                            <MuiTableRow key={index}>
                              <MuiTableCell>{data.ticketName}</MuiTableCell>
                              <MuiTableCell>{data.usedPrice}</MuiTableCell>
                              <MuiTableCell>({data.usedPriceWithNoCash})</MuiTableCell>
                            </MuiTableRow>
                          ))}
                        </MuiTableBody>
                      </MuiTable>
                    </TableContainer>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
        <Grid item xs={12} md={6} lg={4} className="MerchantDailyReportCard">
          <Card>
            <CardHeader title="入金儲值明細" />
            <Divider />
            <CardContent className="p-0">
              <div>
                <TableContainer component={Paper}>
                  <MuiTable size="small" aria-label="a dense table">
                    <MuiTableBody>
                      {results.walletDeposit.map((data, index) => (
                        <MuiTableRow key={index}>
                          <MuiTableCell>{data.paywayName}</MuiTableCell>
                          <MuiTableCell>{data.usedPrice}</MuiTableCell>
                          <MuiTableCell>({data.usedPriceWithNoCash})</MuiTableCell>
                        </MuiTableRow>
                      ))}
                    </MuiTableBody>
                  </MuiTable>
                </TableContainer>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
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
