import { Table, TableBody, TableCell, TableHeader as TableHead, TableRow, TableHead as ReportTableHead } from 'ui/table'
import { Card, CardContent, CardHeader } from 'ui/card'
import PropTypes from 'prop-types'
import { useState, useEffect, Fragment } from 'react'
import DateSelector from 'components/DateSelector'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import idx from 'idx'
import { Card as UiCard } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Skeleton } from 'ui/skeleton'

const reportCellClass = 'h-auto px-4 py-2 text-left align-middle whitespace-pre-line text-[14px] leading-5'

// 明確保留舊表格內距與列印框線，避免依賴相容層 class。
const reportTableClass = 'print:[&_td]:text-text text-[14px] leading-5 [&_tr]:border-0 [&_tr]:hover:bg-transparent [&_td]:border-0 [&_td]:[border-bottom:1px_solid_rgba(0,0,0,0.03)] [&_th]:border-0 [&_th]:[border-bottom:2px_solid_rgba(0,0,0,0.05)] print:[&_td]:!border-0 print:[&_td]:![border-bottom:1px_solid_rgba(0,0,0,0.03)] print:[&_th]:!border-0 print:[&_th]:![border-bottom:2px_solid_rgba(0,0,0,0.05)] print:[&_th]:bg-white'

function RakeReport({ loading, designerRakeReport, setRakeReportDate, rakeReportDate }) {
  const [membershipDisplay, setMembershipDisplay] = useState(false)
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()

  useEffect(() => {
    if (!isMemberShipCardActiveData.loading && designerRakeReport !== undefined && designerRakeReport.length > 0) {
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      const report = designerRakeReport[0]
      const membership = (
        Math.round(report.salesAnalytics.membershipPerformanceFakeTotal) !== 0 ||
        Math.round(report.salesAnalytics.membershipThirdPartHandlingFeeOnSales) !== 0 ||
        Math.round(report.salesAnalytics.membershipPerformanceTruthTotal) !== 0 ||
        Math.round(
          report.salesAnalytics.membershipRakeByCost +
          report.salesAnalytics.membershipRakeByFixed +
          report.salesAnalytics.membershipRakeByPrice
        ) !== 0
      )
      setMembershipDisplay(membership || isMemberShipCardActive)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isMemberShipCardActiveData.loading, designerRakeReport])
  return (
    // 保留抽成卡片掛點、內距與原列印輸出。
    <div className="flex flex-col">
      <div>
        <DateSelector
          date={rakeReportDate}
          attributes={['lastmonth', 'thismonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
          dateChange={value => setRakeReportDate(value)}
        />
      </div>
      <div className="mt-6 flex w-full flex-wrap justify-center">
        {loading ? (
          <Skeleton className="h-96 w-full" />
        ) : designerRakeReport !== undefined && designerRakeReport.length === 0 ? (
          <UiCard className="w-full">
            <EmptyState title="無資料" />
          </UiCard>
        ) : (
          designerRakeReport !== undefined &&
          designerRakeReport.map(designer => (
            <div className="w-1/2" key={designer.user.id}>
              <Card className="overflow-hidden text-text printCard">
                <CardHeader
                  className="!min-h-0 !items-center !gap-0 !px-4 !pb-2 !pt-4 [&>div]:flex-auto [&>div]:block text-center"
                ><span className="block text-heading text-text">{`${designer.user.designerNo !== null && designer.user.designerNo !== ''
                      ? designer.user.designerNo
                      : ''
                    } ${designer.user.nickName !== null && designer.user.nickName !== ''
                      ? designer.user.nickName
                      : ''
                    } ${designer.user.name}`}</span></CardHeader>
                <hr className="m-0 shrink-0 border-0 border-b border-solid border-border" />
                <CardContent className="last:pb-4 p-0">
                  <div>
                    <div className="ui-scroll-x w-full overflow-x-auto rounded-md bg-background text-text">
                      <Table className={reportTableClass} aria-label="a dense table">
                        <TableHead></TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell className={reportCellClass}>服務虛業績</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(
                                designer.salesAnalytics.servicePerformanceFakeTotal +
                                designer.salesAnalytics.ticketUsagePerformanceFakeTotal
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>
                              扣業績 - 付款手續費
                            </TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(
                                designer.salesAnalytics.serviceThirdPartHandlingFeeOnSales
                              ) +
                                Math.round(
                                  designer.salesAnalytics.ticketThirdPartHandlingFeeOnSales
                                )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>扣業績 - 扣項</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(designer.salesAnalytics.servicePerformanceDecountItem) +
                                Math.round(designer.salesAnalytics.ticketPerformanceDecountItem)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass}>服務實業績</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(designer.salesAnalytics.truthPerformanceWithoutHelper)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>實業績 - 指定</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(
                                designer.salesAnalytics
                                  .servicePerformanceDesignateTruthTotalBeforeHelperDecount
                              ) +
                                Math.round(
                                  designer.salesAnalytics.ticketDesignateTruthBeforeHelperDecount
                                )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>實業績 - 不指定</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(
                                designer.salesAnalytics
                                  .servicePerformanceNonDesignateTruthTotalBeforeHelperDecount
                              ) +
                                Math.round(
                                  designer.salesAnalytics.ticketNonDesignateTruthBeforeHelperDecount
                                )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>扣業績 - 使用互助</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(
                                designer.salesAnalytics.servicePerformanceDecountHelperUsagePrice
                              ) +
                                Math.round(
                                  designer.salesAnalytics.ticketPerformanceDecountHelperUsage
                                )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass}>服務實業績 扣使用互助</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(designer.salesAnalytics.servicePerformanceTruthTotal) +
                                Math.round(
                                  designer.salesAnalytics.ticketUsagePerformanceTruthTotal
                                )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>指定(實) - 扣互助</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(
                                designer.salesAnalytics.servicePerformanceDesignateTruthTotal
                              ) +
                                Math.round(
                                  designer.salesAnalytics.ticketUsagePerformanceDesignateTruthTotal
                                )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>
                              不指定(實) - 扣互助
                            </TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(
                                designer.salesAnalytics.servicePerformanceNonDesignateTruthTotal
                              ) +
                                Math.round(
                                  designer.salesAnalytics
                                    .ticketUsagePerformanceNonDesignateTruthTotal
                                )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass}>服務換算抽成</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(designer.salesAnalytics.servicePerformanceRake) +
                                Math.round(designer.salesAnalytics.ticketPerformanceRake)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>指定抽成</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(designer.salesAnalytics.servicePerformanceDesignateRake) +
                                Math.round(designer.salesAnalytics.ticketPerformanceDesignateRake)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>不指定抽成</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(
                                designer.salesAnalytics.servicePerformanceNonDesignateRake
                              ) +
                                Math.round(
                                  designer.salesAnalytics.ticketPerformanceNonDesignateRake
                                )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>特殊抽成</TableCell>
                            <TableCell className={reportCellClass}>{Math.round(designer.salesAnalytics.specialRake)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>
                              扣薪水 - 付款手續費
                            </TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(
                                designer.salesAnalytics.serviceThirdPartHandlingFeeOnSalary
                              ) +
                                Math.round(
                                  designer.salesAnalytics.ticketThirdPartHandlingFeeOnSalary
                                )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>扣薪水 - 扣項</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(designer.salesAnalytics.serviceSalaryDecountItem) +
                                Math.round(designer.salesAnalytics.ticketSalaryDecountItem)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>
                              扣薪水 - 使用互助{' '}
                            </TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(
                                designer.salesAnalytics.serviceSalaryDecountHelperUsagePrice +
                                designer.salesAnalytics.ticketSalaryDecountHelperUsagePrice
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass}>服務應領金額</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(
                                designer.salesAnalytics.serviceSalaryShouldBePaid +
                                designer.salesAnalytics.ticketSalaryShouldBePaid
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass}>店販業績</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(designer.salesAnalytics.productPerformanceFakeTotal)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>
                              扣業績 - 付款手續費
                            </TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(
                                designer.salesAnalytics.productThirdPartHandlingFeeOnSales
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>店販業績 扣手續費</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(designer.salesAnalytics.productPerformanceTruthTotal)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass}>店販抽成</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(
                                designer.salesAnalytics.productRakeByCost +
                                designer.salesAnalytics.productRakeByFixed +
                                designer.salesAnalytics.productRakeByPrice
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>
                              扣薪水 - 付款手續費
                            </TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(
                                designer.salesAnalytics.productThirdPartHandlingFeeOnSalary
                              )}
                            </TableCell>
                          </TableRow>
                          {/* 若有開啟會員卡功能一率顯示會員卡相關欄位，若關閉會員卡功能要判定欄位如果都為0才不顯示 */}
                          {membershipDisplay && (
                            <Fragment>
                              <TableRow>
                                <TableCell className={reportCellClass}>會員卡業績</TableCell>
                                <TableCell className={reportCellClass}>
                                  {Math.round(designer.salesAnalytics.membershipPerformanceFakeTotal)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>扣業績 - 付款手續費</TableCell>
                                <TableCell className={reportCellClass}>
                                  {Math.round(designer.salesAnalytics.membershipThirdPartHandlingFeeOnSales)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>會員卡業績 扣手續費</TableCell>
                                <TableCell className={reportCellClass}>
                                  {Math.round(designer.salesAnalytics.membershipPerformanceTruthTotal)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className={reportCellClass}>會員卡抽成</TableCell>
                                <TableCell className={reportCellClass}>
                                  {Math.round(
                                    designer.salesAnalytics.membershipRakeByCost +
                                    designer.salesAnalytics.membershipRakeByFixed +
                                    designer.salesAnalytics.membershipRakeByPrice
                                  )}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className={reportCellClass} style={{ paddingLeft: '40px' }}>扣薪水 - 付款手續費</TableCell>
                                <TableCell className={reportCellClass}>
                                  {Math.round(designer.salesAnalytics.membershipThirdPartHandlingFeeOnSalary)}
                                </TableCell>
                              </TableRow>
                            </Fragment>
                          )}
                          <TableRow>
                            <TableCell className={reportCellClass}>互助獲得 - 金額</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(designer.salesAnalytics.helperRetrievePriceNoPoint)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass}>互助獲得 - 點數/換算金額</TableCell>
                            <TableCell className={reportCellClass}>
                              {`${Math.round(designer.salesAnalytics.helperRetrievePoint)}/${designer.salesAnalytics.helperRetrievePriceOnlyPoint
                                }`}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass}>互助使用 - 點數</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(designer.salesAnalytics.helperPointPaid)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass}>互助使用 - 金額</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(designer.salesAnalytics.helperPricePaid)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={reportCellClass}>扣入金手續費</TableCell>
                            <TableCell className={reportCellClass}>
                              {Math.round(
                                designer.salesAnalytics.walletDepositHandlingFeeByDesigner
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={`${reportCellClass} text-danger font-medium`}>
                              總應領薪資
                            </TableCell>
                            <TableCell className={`${reportCellClass} text-danger font-medium`}>
                              {Math.round(designer.salesAnalytics.totalSalaryShouldBePaid)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

RakeReport.propTypes = {
  customers: PropTypes.array,
}

RakeReport.defaultProps = {
  customers: [],
}

export default RakeReport
