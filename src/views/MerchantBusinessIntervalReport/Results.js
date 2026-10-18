/** @jsxImportSource @emotion/react */
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import roundDecimal from './../../helper/roundDecimal.js'
import { css } from '@emotion/react'

const styles = {
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
      <Table dense className="min-w-[650px]" aria-label="a dense table">
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            {isServiceTicketMerged ? (
              <Fragment>
                <TableHead>服務總業績</TableHead>
                <TableHead>店販業績</TableHead>
                {membershipDisplay || isMemberShipCardActive ? <TableHead>會員卡銷售</TableHead> : null}
              </Fragment>
            ) : (
              <Fragment>
                <TableHead>服務業績</TableHead>
                <TableHead>店販業績</TableHead>
                {membershipDisplay || isMemberShipCardActive ? <TableHead>會員卡銷售</TableHead> : null}
                <TableHead className="text-center">
                  <div>卡券使用</div>
                  <div>(入業績)</div>
                </TableHead>
                <TableHead className="text-center">
                  <div>卡券販賣</div>
                  <div>(入業績)</div>
                </TableHead>
              </Fragment>
            )}
            <TableHead>業績收入</TableHead>
            <TableHead className="text-center">
              <div>卡券販賣</div>
              <div>(不入業績)</div>
            </TableHead>
            <TableHead className="text-center">
              <div>卡券使用</div>
              <div>(-)</div>
            </TableHead>
            <TableHead className="text-center">
              <div>第三方卡券</div>
              <div>(-)</div>
            </TableHead>
            <TableHead className="text-center">
              <div>其他付款方式</div>
              <div>(-)</div>
            </TableHead>
            <TableHead className="text-center">
              <div>入金使用</div>
              <div>(-)</div>
            </TableHead>
            {/* <TableCell>指定/不指定</TableCell>
            <TableCell>總單數</TableCell>
            <TableCell>單均價(客次價)</TableCell> */}
            <TableHead>營業現金應收</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>區間累積</TableCell>
            {isServiceTicketMerged ? (
              <Fragment>
                <TableCell className="text-center">
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
        <Table dense wrapperClassName="my-[30px]" className="min-w-[650px]" aria-label="a dense table">
          <TableHeader>
            <TableRow>
              <TableHead>服務歸屬</TableHead>
              <TableHead>類別總業績</TableHead>
              <TableHead>客次(人次)</TableHead>
              <TableHead>指定/不指定</TableHead>
              <TableHead>客項次</TableHead>
              <TableHead>平均項次單價</TableHead>
              <TableHead>單均價(客次價)</TableHead>
            </TableRow>
          </TableHeader>
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
              <TableCell className="font-bold">合計</TableCell>

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
      )}

      <Table dense className="min-w-[650px]" aria-label="a dense table">
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>總客數</TableHead>
            <TableHead>指定客/不指定客</TableHead>
            <TableHead>男/女/未知</TableHead>
            <TableHead>入金儲值</TableHead>
            <TableHead>入金使用</TableHead>
            <TableHead>卡券販賣</TableHead>
            <TableHead>卡券使用</TableHead>
          </TableRow>
        </TableHeader>
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
      <Table dense wrapperClassName="my-[30px]" className="min-w-[650px]" aria-label="a dense table">
        <TableHeader>
          <TableRow>
            <TableHead>科目編號</TableHead>
            <TableHead>科目名稱</TableHead>
            <TableHead>收入金額</TableHead>
            <TableHead>支出金額</TableHead>
            <TableHead>備註</TableHead>
          </TableRow>
        </TableHeader>
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
            <TableCell className="font-black">合計</TableCell>
            <TableCell>{Math.round(merchantDailyReport.summaryRevenue)}</TableCell>
            <TableCell>{Math.round(merchantDailyReport.summaryExpenditure)}</TableCell>
            <TableCell></TableCell>
          </TableRow>
          <TableRow>
            <TableCell></TableCell>
            <TableCell className="font-bold text-red-600">{`區間累計現金結存:${Math.round(
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
      {nonCashDisplay && (
        <Grid container spacing={3} className="MerchantDailyReportCardContainer">
          <Grid item xs={12} md={12} lg={8} className="MergeResultCard">
            <Card>
              <Table dense aria-label="a dense table">
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead>其他支付方式明細</TableHead>
                    <TableHead>第三方卡券明細</TableHead>
                    <TableHead className="font-bold">小計</TableHead>
                  </TableRow>

                </TableHeader>
                <TableBody>
                  {mergeData.map(({ name, otherPayment, thirdParty }) => (
                    <TableRow key={name}>
                      <TableCell>{name}</TableCell>
                      <TableCell>{`${otherPayment.usedPrice} / (${otherPayment.usedPriceWithNoCash})`}</TableCell>
                      <TableCell>{`${thirdParty.usedPrice} / (${thirdParty.usedPriceWithNoCash})`}</TableCell>
                      <TableCell className="font-bold">{
                        `${otherPayment.usedPrice + thirdParty.usedPrice} / (${otherPayment.usedPriceWithNoCash + thirdParty.usedPriceWithNoCash})`
                      }</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell className="font-bold text-red-600">合計</TableCell>
                    <TableCell className="font-bold text-red-600">{`${totalSummury('usedPrice')} / ${totalSummury('usedPriceWithNoCash')}`}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4} className="MerchantDailyReportCard">
            <Card>
              <CardHeader title="入金儲值明細" css={styles.cardHeader} />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                <div css={styles.inner}>
                  <Table dense aria-label="a dense table">
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
