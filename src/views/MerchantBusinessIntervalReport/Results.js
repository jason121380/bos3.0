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
  Divider
} from '@mui/material'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import roundDecimal from './../../helper/roundDecimal.js'
import { css } from '@emotion/react'

const styles = {
  table: css({
    minWidth: 650,
  }),
  designerName: css({
    fontWeight: 'bold',
  }),
}

function Results({
  merchantDailyReport,
  isServiceTicketMerged,
  membershipDisplay,
  isMemberShipCardActive,
  results,
  mergeData,
  nonCashDisplay
}) {
  const totalSummury = key => {
    return mergeData.reduce((a, b) => a + b.otherPayment[key] + b.thirdParty[key], 0)
  }
  return (
    <div className="MerchantBusinessIntervalReportTopTable">
      <TableContainer component={Paper}>
        <Table css={styles.table} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {isServiceTicketMerged ? (
                <Fragment>
                  <TableCell>服務總業績</TableCell>
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
              {/* <TableCell>指定/不指定</TableCell>
              <TableCell>總單數</TableCell>
              <TableCell>單均價(客次價)</TableCell> */}
              <TableCell>營業現金應收</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>區間累積</TableCell>
              {isServiceTicketMerged ? (
                <Fragment>
                  <TableCell style={{ textAlign: 'center' }}>
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
                  <TableCell>{Math.round(merchantDailyReport.currentDay.usedTicket)}</TableCell>
                  <TableCell>
                    {Math.round(merchantDailyReport.currentDay.ticketSellIntoPerformance)}
                  </TableCell>
                </Fragment>
              )}

              <TableCell>{Math.round(merchantDailyReport.currentDay.performanceIncome)}</TableCell>
              <TableCell>
                {Math.round(merchantDailyReport.currentDay.ticketSellNotIntoPerformance)}
              </TableCell>
              <TableCell>
                {Math.round(merchantDailyReport.currentDay.usedTicketForDecount)}
              </TableCell>
              <TableCell>
                {Math.round(merchantDailyReport.currentDay.thirdPartTicketForDecount)}
              </TableCell>
              <TableCell>
                {Math.round(merchantDailyReport.currentDay.otherPayWayForDecount)}
              </TableCell>
              <TableCell>
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
        <TableContainer component={Paper} style={{ margin: '30px 0 ' }}>
          <Table css={styles.table} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>服務歸屬</TableCell>
                <TableCell>類別總業績</TableCell>
                <TableCell>客次(人次)</TableCell>
                <TableCell>指定/不指定</TableCell>
                <TableCell>客項次</TableCell>
                <TableCell>平均項次單價</TableCell>
                <TableCell>單均價(客次價)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {merchantDailyReport.currentDay.categoryPerformance
                .filter(
                  data =>
                    data.performance > 0 ||
                    data.totalCount > 0 ||
                    data.designationCount > 0 ||
                    data.nonDesignationCount > 0 ||
                    data.orderTypeCount > 0 ||
                    data.orderTypeAveragePerformance > 0 ||
                    data.averagePerformance > 0
                )
                .map(
                  (data, index) =>
                    !data.isTillNow && (
                      <TableRow key={index}>
                        <TableCell>{data.name}</TableCell>
                        <TableCell>{Math.round(data.performance)}</TableCell>
                        <TableCell>{Math.round(data.totalCount)}</TableCell>
                        <TableCell>
                          {Math.round(data.designationCount)}/{Math.round(data.nonDesignationCount)}
                        </TableCell>
                        <TableCell>{Math.round(data.orderTypeCount)}</TableCell>
                        <TableCell>{Math.round(data.orderTypeAveragePerformance)}</TableCell>
                        <TableCell>{Math.round(data.averagePerformance)}</TableCell>
                      </TableRow>
                    )
                )}
              <TableRow>
                <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>

                {/* 類別總業績 */}
                <TableCell>{merchantDailyReport.currentDay.performanceIncome}</TableCell>

                {/* 客次(人次) */}
                <TableCell>{merchantDailyReport.currentDay.orderCount}</TableCell>

                {/* 指定/不指定 */}
                <TableCell>
                  {`${merchantDailyReport.currentDay.orderDesignateCount}/${merchantDailyReport.currentDay.orderNonDesignateCount}`}
                </TableCell>

                {/* 客項次 */}
                <TableCell>
                  {Math.round(
                    merchantDailyReport.currentDay.categoryPerformance
                      .map(data => data.orderTypeCount)
                      .reduce((accu, curVal) => (accu += curVal), 0)
                  )}
                </TableCell>

                {/* 平均項次單價 */}
                <TableCell>
                  {Math.round(
                    merchantDailyReport.currentDay.performanceIncome /
                    merchantDailyReport.currentDay.categoryPerformance
                      .map(data => data.orderTypeCount)
                      .reduce((accu, curVal) => (accu += curVal), 0)
                  )}
                </TableCell>

                {/* 單均價(客次價) */}
                <TableCell>
                  {Math.round(
                    merchantDailyReport.currentDay.performanceIncome / merchantDailyReport.currentDay.orderCount
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TableContainer component={Paper}>
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
              <TableCell>區間累積</TableCell>
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
      <TableContainer component={Paper} style={{ margin: '30px 0 ' }}>
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
            {merchantDailyReport.generalMoneyFlow.map((data, index) => (
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
              <TableCell>{`營業現金結存:${Math.round(
                merchantDailyReport.businessCash
              )}`}</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
            {merchantDailyReport.moneyFlow.map((data, index) => (
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
              <TableCell style={{ fontWeight: '1000' }}>合計</TableCell>
              <TableCell>{Math.round(merchantDailyReport.summaryRevenue)}</TableCell>
              <TableCell>{Math.round(merchantDailyReport.summaryExpenditure)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell style={{ color: 'red', fontWeight: 'bold' }}>{`區間累計現金結存:${Math.round(
                merchantDailyReport.cashBalance
              )}`}</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
            {merchantDailyReport.moneyFlowNotCash.length > 0 && (
              <TableRow>
                <TableCell></TableCell>
                <TableCell>非現場現金收支：</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            )}
            {merchantDailyReport.moneyFlowNotCash.map((data, index) => (
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
      {nonCashDisplay && (
        <Grid container spacing={3} className="MerchantDailyReportCardContainer">
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
          <Grid item xs={12} md={6} lg={4} className="MerchantDailyReportCard">
            <Card>
              <CardHeader title="入金儲值明細" css={styles.cardHeader} />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                <div css={styles.inner}>
                  <TableContainer component={Paper}>
                    <Table size="small" aria-label="a dense table">
                      <TableBody>
                        {results.walletDeposit && results.walletDeposit.map((data, index) => (
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
      )}
    </div>
  )
}

Results.propTypes = {
  report: PropTypes.object,
}

Results.defaultProps = {
  report: {},
}

export default Results
