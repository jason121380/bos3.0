/** @jsxImportSource @emotion/react */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from '@mui/material'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { format, startOfMonth } from 'date-fns'
import roundDecimal from './../../helper/roundDecimal.js'
import { css } from '@emotion/react'

const styles = {
  table: css({
    minWidth: 650,
  }),
  designerName: css({
    fontWeight: 'bold',
  }),
  content: css({
    padding: 0,
  }),
}

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
  curentDayData.pickingRecord.map(d => {
    totalCashRevenue += d.cashRevenue
    totalCashExpenditure += d.cashExpenditure
  })
  const stillNowData = []
  merchantDailyReport.currentDay.categoryPerformance.map(data => {
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
      curentDayData.currentDay.categoryPerformance.map(curData => {
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
      <TableContainer component={Paper} className="MerchantDailyReportTable-1">
        <Table css={styles.table} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {isServiceTicketMerged ? (
                <Fragment>
                  <TableCell>營業總業績</TableCell>
                  <TableCell>店販業績</TableCell>
                  {membershipDisplay || isMemberShipCardActive ? <TableCell>會員卡銷售</TableCell> : null}
                </Fragment>
              ) : (
                <Fragment>
                  <TableCell>服務業績</TableCell>
                  <TableCell>店販業績</TableCell>
                  {membershipDisplay || isMemberShipCardActive ? <TableCell>會員卡銷售</TableCell> : null}
                  <TableCell style={{ textAlign: 'center' }}>
                    <div>卡券使用</div>
                    <div>(入業績)</div>
                  </TableCell>
                  <TableCell style={{ textAlign: 'center' }}>
                    <div>卡券販賣</div>
                    <div>(入業績)</div>
                  </TableCell>
                </Fragment>
              )}
              <TableCell>業績收入</TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                <div>卡券販賣</div>
                <div>(不入業績)</div>
              </TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                <div>卡券使用</div>
                <div>(-)</div>
              </TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                <div>第三方卡券</div>
                <div>(-)</div>
              </TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                <div>其他付款方式</div>
                <div>(-)</div>
              </TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                <div>入金使用</div>
                <div>(-)</div>
              </TableCell>
              <TableCell>營業現金應收</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{format(displayDate.endDate, 'MM/dd')}</TableCell>
              {isServiceTicketMerged ? (
                <Fragment>
                  <TableCell>
                    {Math.round(
                      curentDayData.currentDay.service +
                      curentDayData.currentDay.usedTicket +
                      curentDayData.currentDay.ticketSellIntoPerformance
                    )}
                  </TableCell>
                  <TableCell>{Math.round(curentDayData.currentDay.product)}</TableCell>
                  {membershipDisplay || isMemberShipCardActive ? <TableCell>{Math.round(curentDayData.currentDay.membership)}</TableCell> : null}
                </Fragment>
              ) : (
                <Fragment>
                  <TableCell>{Math.round(curentDayData.currentDay.service)}</TableCell>
                  <TableCell>{Math.round(curentDayData.currentDay.product)}</TableCell>
                  {membershipDisplay || isMemberShipCardActive ? <TableCell>{Math.round(curentDayData.currentDay.membership)}</TableCell> : null}
                  <TableCell style={{ textAlign: 'center' }}>
                    {Math.round(curentDayData.currentDay.usedTicket)}
                  </TableCell>
                  <TableCell style={{ textAlign: 'center' }}>
                    {Math.round(curentDayData.currentDay.ticketSellIntoPerformance)}
                  </TableCell>
                </Fragment>
              )}

              <TableCell>{Math.round(curentDayData.currentDay.performanceIncome)}</TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                {Math.round(curentDayData.currentDay.ticketSellNotIntoPerformance)}
              </TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                {Math.round(curentDayData.currentDay.usedTicketForDecount)}
              </TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                {Math.round(curentDayData.currentDay.thirdPartTicketForDecount)}
              </TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                {Math.round(curentDayData.currentDay.otherPayWayForDecount)}
              </TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                {Math.round(curentDayData.currentDay.walletUsedForDecount)}
              </TableCell>
              <TableCell>{Math.round(curentDayData.currentDay.businessCash)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                {`${format(startOfMonth(displayDate.endDate), 'MM/dd')} - ${format(
                  displayDate.endDate,
                  'MM/dd'
                )}`}
              </TableCell>
              {isServiceTicketMerged ? (
                <Fragment>
                  <TableCell>
                    {Math.round(
                      merchantDailyReport.currentDay.service +
                      merchantDailyReport.currentDay.usedTicket +
                      merchantDailyReport.currentDay.ticketSellIntoPerformance
                    )}
                  </TableCell>
                  <TableCell>{Math.round(merchantDailyReport.currentDay.product)}</TableCell>
                  {membershipDisplay || isMemberShipCardActive ? <TableCell>{Math.round(merchantDailyReport.currentDay.membership)}</TableCell> : null}
                </Fragment>
              ) : (
                <Fragment>
                  <TableCell>{Math.round(merchantDailyReport.currentDay.service)}</TableCell>
                  <TableCell>{Math.round(merchantDailyReport.currentDay.product)}</TableCell>
                  {membershipDisplay || isMemberShipCardActive ? <TableCell>{Math.round(merchantDailyReport.currentDay.membership)}</TableCell> : null}
                  <TableCell style={{ textAlign: 'center' }}>
                    {Math.round(merchantDailyReport.currentDay.usedTicket)}
                  </TableCell>
                  <TableCell style={{ textAlign: 'center' }}>
                    {Math.round(merchantDailyReport.currentDay.ticketSellIntoPerformance)}
                  </TableCell>
                </Fragment>
              )}

              <TableCell>{Math.round(merchantDailyReport.currentDay.performanceIncome)}</TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                {Math.round(merchantDailyReport.currentDay.ticketSellNotIntoPerformance)}
              </TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                {Math.round(merchantDailyReport.currentDay.usedTicketForDecount)}
              </TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                {Math.round(merchantDailyReport.currentDay.thirdPartTicketForDecount)}
              </TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                {Math.round(merchantDailyReport.currentDay.otherPayWayForDecount)}
              </TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                {Math.round(merchantDailyReport.currentDay.walletUsedForDecount)}
              </TableCell>
              <TableCell>{Math.round(merchantDailyReport.currentDay.businessCash)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

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
        <Typography variant="h5" gutterBottom component="div" style={{ margin: '10px 0' }}>
          無資料
        </Typography>
      ) : (
        <TableContainer
          component={Paper}
          style={{ margin: '30px 0' }}
          className="MerchantDailyReportTable-2"
        >
          <Table css={styles.table} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell style={{ minWidth: '68px' }} />
                <TableCell>類別總業績</TableCell>
                <TableCell>客次(人次)</TableCell>
                <TableCell>指定/不指定</TableCell>
                <TableCell>客項次</TableCell>
                <TableCell>平均項次單價</TableCell>
                <TableCell>單均價(客次價)</TableCell>
                <TableCell>類別總業績(累積)</TableCell>
                <TableCell>客次(人次)(累積)</TableCell>
                <TableCell>指定/不指定(累積)</TableCell>
                <TableCell>客項次(累積)</TableCell>
                <TableCell>平均項次單價(累積)</TableCell>
                <TableCell>單均價(客次價)(累積)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stillNowData.map((data, index) => (
                <TableRow key={index}>
                  <TableCell style={{ minWidth: '68px' }}>{data.name}</TableCell>
                  <TableCell>{Math.round(data.curPerformance)}</TableCell>
                  <TableCell>{Math.round(data.curTotalCount)}</TableCell>
                  <TableCell>
                    {Math.round(data.curDesignationCount)}/{Math.round(data.curNonDesignationCount)}
                  </TableCell>
                  <TableCell>{Math.round(data.curOrderTypeCount)}</TableCell>
                  <TableCell>{Math.round(data.curOrderTypeAveragePerformance)}</TableCell>
                  <TableCell>{Math.round(data.curAveragePerformance)}</TableCell>

                  <Fragment>
                    <TableCell>{Math.round(data.nowPerformance)}</TableCell>
                    <TableCell>{Math.round(data.nowTotalCount)}</TableCell>
                    <TableCell>
                      {Math.round(data.nowDesignationCount)}/
                      {Math.round(data.nowNonDesignationCount)}
                    </TableCell>
                    <TableCell>{Math.round(data.nowOrderTypeCount)}</TableCell>
                    <TableCell>{Math.round(data.nowOrderTypeAveragePerformance)}</TableCell>
                    <TableCell>{Math.round(data.nowAveragePerformance)}</TableCell>
                  </Fragment>
                </TableRow>
              ))}
              <TableRow>
                <TableCell style={{ minWidth: '68px', fontWeight: 'bold' }}>合計</TableCell>

                {/* 類別總業績 */}
                <TableCell>{curentDayData.currentDay.performanceIncome}</TableCell>

                {/* 客次(人次) */}
                <TableCell>{curentDayData.currentDay.orderCount}</TableCell>

                {/* 指定/不指定 */}
                <TableCell>
                  {`${curentDayData.currentDay.orderDesignateCount}/${curentDayData.currentDay.orderNonDesignateCount}`}
                </TableCell>

                {/* 客項次 */}
                <TableCell>
                  {Math.round(
                    curentDayData.currentDay.categoryPerformance
                      .map(data => data.orderTypeCount)
                      .reduce((accu, curVal) => (accu += curVal), 0)
                  )}
                </TableCell>

                {/* 平均項次單價 */}
                <TableCell>
                  {Math.round(
                    curentDayData.currentDay.performanceIncome /
                    curentDayData.currentDay.categoryPerformance
                      .map(data => data.orderTypeCount)
                      .reduce((accu, curVal) => (accu += curVal), 0)
                  ) || 0}
                </TableCell>

                {/* 單均價(客次價) */}
                <TableCell>
                  {Math.round(curentDayData.currentDay.performanceIncome / curentDayData.currentDay.orderCount) || 0}
                </TableCell>

                {/* 類別總業績(累積) */}
                <TableCell>{merchantDailyReport.currentDay.performanceIncome}</TableCell>

                {/* 客次(人次)(累積) */}
                <TableCell>{merchantDailyReport.currentDay.orderCount}</TableCell>

                {/* 指定/不指定(累積) */}
                <TableCell>
                  {`${merchantDailyReport.currentDay.orderDesignateCount}/${merchantDailyReport.currentDay.orderNonDesignateCount}`}
                </TableCell>

                {/* 客項次(累積) */}
                <TableCell>
                  {Math.round(
                    stillNowData
                      .map(data => data.nowOrderTypeCount)
                      .reduce((accu, curVal) => (accu += curVal), 0)
                  )}
                </TableCell>

                {/* 平均項次單價(累積) */}
                <TableCell>
                  {Math.round(
                    stillNowData
                      .map(data => data.nowOrderTypeAveragePerformance)
                      .reduce((accu, curVal) => (accu += curVal), 0)
                  )}
                </TableCell>

                {/* 單均價(客次價)(累積) */}
                <TableCell>
                  {Math.round(
                    stillNowData
                      .map(data => data.nowAveragePerformance)
                      .reduce((accu, curVal) => (accu += curVal), 0)
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* <FormControlLabel
        style={{ marginBottom: '15px' }}
        control={<Checkbox color="primary" />}
        label="顯示類別區間業績"
        checked={displayIntervalData}
        onChange={() => setDisplayIntervalData(!displayIntervalData)}
      /> */}
      <TableContainer component={Paper}></TableContainer>
      <TableContainer component={Paper} className="MerchantDailyReportTable-3">
        <Table css={styles.table} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>總客數</TableCell>
              <TableCell>指定客/不指定客</TableCell>
              <TableCell>男/女/未知</TableCell>
              <TableCell>入金儲值</TableCell>
              <TableCell>入金使用</TableCell>
              <TableCell>卡券販賣</TableCell>
              <TableCell>卡券使用</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{format(displayDate.endDate, 'MM/dd')}</TableCell>
              <TableCell>{Math.round(curentDayData.orderTotalCount)}</TableCell>
              <TableCell>{`${Math.round(curentDayData.orderDesignateCount)}/${Math.round(
                curentDayData.orderNonDesignateCount
              )}`}</TableCell>
              <TableCell>{`${Math.round(curentDayData.orderMaleCount)}/${Math.round(
                curentDayData.orderFemaleCount
              )}/${Math.round(curentDayData.orderUnknownCount)}`}</TableCell>
              <TableCell>{Math.round(curentDayData.currentDay.walletDepositTotal)}</TableCell>
              <TableCell>{Math.round(curentDayData.currentDay.walletUsedTotal)}</TableCell>
              <TableCell>{Math.round(curentDayData.currentDay.ticketSellTotal)}</TableCell>
              <TableCell>{Math.round(curentDayData.currentDay.ticketUsedTital)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{`${format(startOfMonth(displayDate.endDate), 'MM/dd')} - ${format(
                displayDate.endDate,
                'MM/dd'
              )}`}</TableCell>
              <TableCell>{Math.round(merchantDailyReport.orderTotalCount)}</TableCell>
              <TableCell>{`${Math.round(merchantDailyReport.orderDesignateCount)}/${Math.round(
                merchantDailyReport.orderNonDesignateCount
              )}`}</TableCell>
              <TableCell>{`${Math.round(merchantDailyReport.orderMaleCount)}/${Math.round(
                merchantDailyReport.orderFemaleCount
              )}/${Math.round(merchantDailyReport.orderUnknownCount)}`}</TableCell>
              <TableCell>{Math.round(merchantDailyReport.currentDay.walletDepositTotal)}</TableCell>
              <TableCell>{Math.round(merchantDailyReport.currentDay.walletUsedTotal)}</TableCell>
              <TableCell>{Math.round(merchantDailyReport.currentDay.ticketSellTotal)}</TableCell>
              <TableCell>{Math.round(merchantDailyReport.currentDay.ticketUsedTital)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <TableContainer
        component={Paper}
        style={{ margin: '30px 0 ' }}
        className="MerchantDailyReportTable-4"
      >
        <Table css={styles.table} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>科目編號</TableCell>
              <TableCell>科目名稱</TableCell>
              <TableCell>收入金額</TableCell>
              <TableCell>支出金額</TableCell>
              <TableCell>備註</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {curentDayData.generalMoneyFlow.map((data, index) => (
              <TableRow key={index}>
                <TableCell>{data.subjectNumber}</TableCell>
                <TableCell>{data.subjectName}</TableCell>
                <TableCell>{roundDecimal(data.cashRevenue)}</TableCell>
                <TableCell>{roundDecimal(data.cashExpenditure)}</TableCell>
                <TableCell>{data.remark}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell></TableCell>
              <TableCell>{`營業現金結存:${Math.round(curentDayData.businessCash)}`}</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
            {curentDayData.moneyFlow.map((data, index) => (
              <TableRow key={index}>
                <TableCell>{data.subjectNumber}</TableCell>
                <TableCell>{data.subjectName}</TableCell>
                <TableCell>{roundDecimal(data.cashRevenue)}</TableCell>
                <TableCell>{roundDecimal(data.cashExpenditure)}</TableCell>
                <TableCell>{data.remark}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell></TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>{Math.round(curentDayData.summaryRevenue)}</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>{Math.round(curentDayData.summaryExpenditure)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell style={{ color: 'red', fontWeight: 'bold' }}>{`當日現金結存:${Math.round(
                curentDayData.cashBalance
              )}`}</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
            {/* 材料自購 */}
            {curentDayData.pickingRecord.map((data, index) => (
              <TableRow key={index}>
                <TableCell>{data.productNumber}</TableCell>
                <TableCell>{data.productName}</TableCell>
                <TableCell>{roundDecimal(data.cashRevenue)}</TableCell>
                <TableCell>{roundDecimal(data.cashExpenditure)}</TableCell>
                <TableCell>{data.remark}</TableCell>
              </TableRow>
            ))}
            {/* 材料自購合計 */}
            <TableRow>
              <TableCell></TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>{Math.round(totalCashRevenue)}</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>{Math.round(totalCashExpenditure)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
            {/* 材料自購合計+今日現金結存 */}
            <TableRow>
              <TableCell></TableCell>
              <TableCell
                style={{ color: 'red', fontWeight: 'bold' }}
              >{`當日現金結存（含自購）:${Math.round(
                curentDayData.cashBalance + totalCashRevenue
              )}`}</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>

            {curentDayData.moneyFlowNotCash.length > 0 && (
              <TableRow>
                <TableCell></TableCell>
                <TableCell>非現場現金收支：</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            )}
            {curentDayData.moneyFlowNotCash.map((data, index) => (
              <TableRow key={index}>
                <TableCell>{data.subjectNumber}</TableCell>
                <TableCell>{data.subjectName}</TableCell>
                <TableCell>{roundDecimal(data.cashRevenue)}</TableCell>
                <TableCell>{roundDecimal(data.cashExpenditure)}</TableCell>
                <TableCell>{data.remark}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Grid container spacing={3} className="MerchantDailyReportCardContainer">
        {nonCashDisplay ? (
          <Grid item xs={12} md={12} lg={8} className="MergeResultCard">
            <Card>
              <TableContainer component={Paper}>
                <Table size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>其他支付方式明細</TableCell>
                      <TableCell>第三方卡券明細</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>小計</TableCell>
                    </TableRow>

                  </TableHead>
                  <TableBody>
                    {mergeData.map(({ name, otherPayment, thirdParty }) => (
                      <TableRow key={name} hover>
                        <TableCell>{name}</TableCell>
                        <TableCell>{`${otherPayment.usedPrice} / (${otherPayment.usedPriceWithNoCash})`}</TableCell>
                        <TableCell>{`${thirdParty.usedPrice} / (${thirdParty.usedPriceWithNoCash})`}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{
                          `${otherPayment.usedPrice + thirdParty.usedPrice} / (${otherPayment.usedPriceWithNoCash + thirdParty.usedPriceWithNoCash})`
                        }</TableCell>
                      </TableRow>
                    ))}
                    <TableRow hover>
                      <TableCell colSpan={2} />
                      <TableCell sx={{ fontWeight: 'bold', color: 'red' }}>合計</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'red' }}>{`${totalSummury('usedPrice')} / ${totalSummury('usedPriceWithNoCash')}`}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        ) : (
          <>
            <Grid item xs={12} md={6} lg={4} className="MerchantDailyReportCard">
              <Card>
                <CardHeader title="其他支付方式明細" css={styles.cardHeader} />
                <Divider />
                <CardContent css={styles.content}>
                  <div css={styles.inner}>
                    <TableContainer component={Paper}>
                      <Table size="small" aria-label="a dense table">
                        <TableBody>
                          {results.otherPayway.map((data, index) => (
                            <TableRow key={index}>
                              <TableCell>{data.paywayName}</TableCell>
                              <TableCell>{data.usedPrice}</TableCell>
                              <TableCell>({data.usedPriceWithNoCash})</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={4} className="MerchantDailyReportCard">
              <Card>
                <CardHeader title="第三方卡券明細" css={styles.cardHeader} />
                <Divider />
                <CardContent css={styles.content}>
                  <div css={styles.inner}>
                    <TableContainer component={Paper}>
                      <Table size="small" aria-label="a dense table">
                        <TableBody>
                          {results.thirdPartTicket.map((data, index) => (
                            <TableRow key={index}>
                              <TableCell>{data.ticketName}</TableCell>
                              <TableCell>{data.usedPrice}</TableCell>
                              <TableCell>({data.usedPriceWithNoCash})</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
        <Grid item xs={12} md={6} lg={4} className="MerchantDailyReportCard">
          <Card>
            <CardHeader title="入金儲值明細" css={styles.cardHeader} />
            <Divider />
            <CardContent css={styles.content}>
              <div css={styles.inner}>
                <TableContainer component={Paper}>
                  <Table size="small" aria-label="a dense table">
                    <TableBody>
                      {results.walletDeposit.map((data, index) => (
                        <TableRow key={index}>
                          <TableCell>{data.paywayName}</TableCell>
                          <TableCell>{data.usedPrice}</TableCell>
                          <TableCell>({data.usedPriceWithNoCash})</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
