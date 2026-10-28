import { Card, CardContent, CardHeader } from 'ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import roundDecimal from './../../helper/roundDecimal.js'
import { formatNumber } from 'ui/format'
import averageOf from 'helper/averageOf'

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
                  {formatNumber(Math.round(
                    merchantDailyReport.currentDay.service +
                    merchantDailyReport.currentDay.usedTicket +
                    merchantDailyReport.currentDay.ticketSellIntoPerformance
                  ))}
                </TableCell>
                <TableCell>{formatNumber(Math.round(merchantDailyReport.currentDay.product))}</TableCell>
                {membershipDisplay || isMemberShipCardActive ? <TableCell>{formatNumber(Math.round(merchantDailyReport.currentDay.membership))}</TableCell> : null}
              </Fragment>
            ) : (
              <Fragment>
                <TableCell>{formatNumber(Math.round(merchantDailyReport.currentDay.service))}</TableCell>
                <TableCell>{formatNumber(Math.round(merchantDailyReport.currentDay.product))}</TableCell>
                {membershipDisplay || isMemberShipCardActive ? <TableCell>{formatNumber(Math.round(merchantDailyReport.currentDay.membership))}</TableCell> : null}
                <TableCell>{formatNumber(Math.round(merchantDailyReport.currentDay.usedTicket))}</TableCell>
                <TableCell>
                  {formatNumber(Math.round(merchantDailyReport.currentDay.ticketSellIntoPerformance))}
                </TableCell>
              </Fragment>
            )}

            <TableCell>{formatNumber(Math.round(merchantDailyReport.currentDay.performanceIncome))}</TableCell>
            <TableCell>
              {formatNumber(Math.round(merchantDailyReport.currentDay.ticketSellNotIntoPerformance))}
            </TableCell>
            <TableCell>
              {formatNumber(Math.round(merchantDailyReport.currentDay.usedTicketForDecount))}
            </TableCell>
            <TableCell>
              {formatNumber(Math.round(merchantDailyReport.currentDay.thirdPartTicketForDecount))}
            </TableCell>
            <TableCell>
              {formatNumber(Math.round(merchantDailyReport.currentDay.otherPayWayForDecount))}
            </TableCell>
            <TableCell>
              {formatNumber(Math.round(merchantDailyReport.currentDay.walletUsedForDecount))}
            </TableCell>
            <TableCell>{formatNumber(Math.round(merchantDailyReport.currentDay.businessCash))}</TableCell>
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
        <div className="mb-[0.35em] text-heading text-text" style={{ margin: '10px 0' }}>
          無資料
        </div>
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
                      <TableCell>{formatNumber(Math.round(data.performance))}</TableCell>
                      <TableCell>{formatNumber(Math.round(data.totalCount))}</TableCell>
                      <TableCell>
                        {formatNumber(Math.round(data.designationCount))}/{formatNumber(Math.round(data.nonDesignationCount))}
                      </TableCell>
                      <TableCell>{formatNumber(Math.round(data.orderTypeCount))}</TableCell>
                      <TableCell>{formatNumber(Math.round(data.orderTypeAveragePerformance))}</TableCell>
                      <TableCell>{formatNumber(Math.round(data.averagePerformance))}</TableCell>
                    </TableRow>
                  )
              )}
            <TableRow>
              <TableCell className="font-bold">合計</TableCell>

              {/* 類別總業績 */}
              <TableCell>{formatNumber(merchantDailyReport.currentDay.performanceIncome)}</TableCell>

              {/* 客次(人次) */}
              <TableCell>{formatNumber(merchantDailyReport.currentDay.orderCount)}</TableCell>

              {/* 指定/不指定 */}
              <TableCell>
                {`${formatNumber(merchantDailyReport.currentDay.orderDesignateCount)}/${formatNumber(merchantDailyReport.currentDay.orderNonDesignateCount)}`}
              </TableCell>

              {/* 客項次 */}
              <TableCell>
                {formatNumber(Math.round(
                  merchantDailyReport.currentDay.categoryPerformance
                    .map(data => data.orderTypeCount)
                    .reduce((accu, curVal) => (accu += curVal), 0)
                ))}
              </TableCell>

              {/* 平均項次單價 */}
              <TableCell>
                {formatNumber(Math.round(
                  averageOf(
                    merchantDailyReport.currentDay.performanceIncome,
                    merchantDailyReport.currentDay.categoryPerformance
                      .map(data => data.orderTypeCount)
                      .reduce((accu, curVal) => (accu += curVal), 0)
                  )
                ))}
              </TableCell>

              {/* 單均價(客次價) */}
              <TableCell>
                {formatNumber(Math.round(
                  averageOf(merchantDailyReport.currentDay.performanceIncome, merchantDailyReport.currentDay.orderCount)
                ))}
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
            <TableCell>{formatNumber(Math.round(merchantDailyReport.orderTotalCount))}</TableCell>
            <TableCell>{`${formatNumber(Math.round(merchantDailyReport.orderDesignateCount))}/${formatNumber(Math.round(
              merchantDailyReport.orderNonDesignateCount
            ))}`}</TableCell>
            <TableCell>{`${formatNumber(Math.round(merchantDailyReport.orderMaleCount))}/${formatNumber(Math.round(
              merchantDailyReport.orderFemaleCount
            ))}/${formatNumber(Math.round(merchantDailyReport.orderUnknownCount))}`}</TableCell>
            <TableCell>{formatNumber(Math.round(merchantDailyReport.currentDay.walletDepositTotal))}</TableCell>
            <TableCell>{formatNumber(Math.round(merchantDailyReport.currentDay.walletUsedTotal))}</TableCell>
            <TableCell>{formatNumber(Math.round(merchantDailyReport.currentDay.ticketSellTotal))}</TableCell>
            <TableCell>{formatNumber(Math.round(merchantDailyReport.currentDay.ticketUsedTital))}</TableCell>
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
              <TableCell>{formatNumber(roundDecimal(data.cashRevenue))}</TableCell>
              <TableCell>{formatNumber(roundDecimal(data.cashExpenditure))}</TableCell>
              <TableCell>{data.remark}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell></TableCell>
            <TableCell>{`營業現金結存:${formatNumber(Math.round(
              merchantDailyReport.businessCash
            ))}`}</TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
          </TableRow>
          {merchantDailyReport.moneyFlow.map((data, index) => (
            <TableRow key={index}>
              <TableCell>{data.subjectNumber}</TableCell>
              <TableCell>{data.subjectName}</TableCell>
              <TableCell>{formatNumber(roundDecimal(data.cashRevenue))}</TableCell>
              <TableCell>{formatNumber(roundDecimal(data.cashExpenditure))}</TableCell>
              <TableCell>{data.remark}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell></TableCell>
            <TableCell className="font-black">合計</TableCell>
            <TableCell>{formatNumber(Math.round(merchantDailyReport.summaryRevenue))}</TableCell>
            <TableCell>{formatNumber(Math.round(merchantDailyReport.summaryExpenditure))}</TableCell>
            <TableCell></TableCell>
          </TableRow>
          <TableRow>
            <TableCell></TableCell>
            <TableCell className="font-bold text-danger">{`區間累計現金結存:${formatNumber(Math.round(
              merchantDailyReport.cashBalance
            ))}`}</TableCell>
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
              <TableCell>{formatNumber(roundDecimal(data.cashRevenue))}</TableCell>
              <TableCell>{formatNumber(roundDecimal(data.cashExpenditure))}</TableCell>
              <TableCell>{data.remark}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {nonCashDisplay && (
        <div className="MerchantDailyReportCardContainer -ml-6 -mt-6 flex w-[calc(100%+24px)] flex-wrap">
          <div className="MergeResultCard m-0 w-full max-w-full shrink pl-6 pt-6 min-[1200px]:basis-2/3 min-[1200px]:max-w-[66.666667%]">
            <Card className="overflow-hidden text-text print:rounded-none print:shadow-none print:!border print:!border-solid print:!border-black">
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
                    <TableCell className="font-bold text-danger">合計</TableCell>
                    <TableCell className="font-bold text-danger">{`${totalSummury('usedPrice')} / ${totalSummury('usedPriceWithNoCash')}`}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          </div>
          <div className="MerchantDailyReportCard m-0 w-full max-w-full shrink pl-6 pt-6 min-[900px]:basis-1/2 min-[900px]:max-w-[50%] min-[1200px]:basis-1/3 min-[1200px]:max-w-[33.333333%]">
            <Card className="overflow-hidden text-text print:rounded-none print:shadow-none print:!border print:!border-solid print:!border-black">
              <CardHeader className="[&>div:first-child]:flex-auto !min-h-0 !items-center !gap-0 !px-4 !pb-2 !pt-4"><span className="block text-heading text-text">入金儲值明細</span></CardHeader>
              {/* 原生 hr：列印規則以 hr 選擇器隱藏分隔線 */}
              <hr className="m-0 shrink-0 border-0 border-b border-solid border-border" />
              <CardContent className="last:pb-4" style={{ padding: 0 }}>
                <div>
                  <Table dense aria-label="a dense table">
                    <TableBody>
                      {results.walletDeposit && results.walletDeposit.map((data, index) => (
                        <TableRow key={index}>
                          <TableCell>{data.paywayName}</TableCell>
                          <TableCell>{formatNumber(data.usedPrice)}</TableCell>
                          <TableCell>({formatNumber(data.usedPriceWithNoCash)})</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
