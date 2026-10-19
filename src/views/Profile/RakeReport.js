/** @jsxImportSource @emotion/react */
import { Card, CardContent, CardHeader } from 'ui/card-compat'
import { Divider, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper } from '@mui/material'
import PropTypes from 'prop-types'
import { useState, useEffect, Fragment } from 'react'
import DateSelector from 'components/DateSelector'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import idx from 'idx'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Card as UiCard } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Skeleton } from 'ui/skeleton'

const styles = {
  root: css({}),
  content: css({
    padding: 0,
  }),
  inner: css({
    // minWidth: 900,
  }),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  }),
  actions: css({
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  }),
  cardHeader: css({
    textAlign: 'center',
  }),
  calendarButton: css({
    backgroundColor: theme.palette.common.white,
  }),
}

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
  }, [isMemberShipCardActiveData.loading, designerRakeReport])
  return (
    // 抽成卡片（className="printCard"）依列印範本規則原封保留，只換外層排版、載入與無資料畫面
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
              <Card className="printCard">
                <CardHeader
                  title={`${designer.user.designerNo !== null && designer.user.designerNo !== ''
                      ? designer.user.designerNo
                      : ''
                    } ${designer.user.nickName !== null && designer.user.nickName !== ''
                      ? designer.user.nickName
                      : ''
                    } ${designer.user.name}`}
                  css={styles.cardHeader}
                />
                <Divider />
                <CardContent css={styles.content}>
                  <div css={styles.inner}>
                    <TableContainer component={Paper}>
                      <Table css={styles.table} size="small" aria-label="a dense table">
                        <TableHead></TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>服務虛業績</TableCell>
                            <TableCell>
                              {Math.round(
                                designer.salesAnalytics.servicePerformanceFakeTotal +
                                designer.salesAnalytics.ticketUsagePerformanceFakeTotal
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ paddingLeft: '40px' }}>
                              扣業績 - 付款手續費
                            </TableCell>
                            <TableCell>
                              {Math.round(
                                designer.salesAnalytics.serviceThirdPartHandlingFeeOnSales
                              ) +
                                Math.round(
                                  designer.salesAnalytics.ticketThirdPartHandlingFeeOnSales
                                )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ paddingLeft: '40px' }}>扣業績 - 扣項</TableCell>
                            <TableCell>
                              {Math.round(designer.salesAnalytics.servicePerformanceDecountItem) +
                                Math.round(designer.salesAnalytics.ticketPerformanceDecountItem)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>服務實業績</TableCell>
                            <TableCell>
                              {Math.round(designer.salesAnalytics.truthPerformanceWithoutHelper)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ paddingLeft: '40px' }}>實業績 - 指定</TableCell>
                            <TableCell>
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
                            <TableCell style={{ paddingLeft: '40px' }}>實業績 - 不指定</TableCell>
                            <TableCell>
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
                            <TableCell style={{ paddingLeft: '40px' }}>扣業績 - 使用互助</TableCell>
                            <TableCell>
                              {Math.round(
                                designer.salesAnalytics.servicePerformanceDecountHelperUsagePrice
                              ) +
                                Math.round(
                                  designer.salesAnalytics.ticketPerformanceDecountHelperUsage
                                )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>服務實業績 扣使用互助</TableCell>
                            <TableCell>
                              {Math.round(designer.salesAnalytics.servicePerformanceTruthTotal) +
                                Math.round(
                                  designer.salesAnalytics.ticketUsagePerformanceTruthTotal
                                )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ paddingLeft: '40px' }}>指定(實) - 扣互助</TableCell>
                            <TableCell>
                              {Math.round(
                                designer.salesAnalytics.servicePerformanceDesignateTruthTotal
                              ) +
                                Math.round(
                                  designer.salesAnalytics.ticketUsagePerformanceDesignateTruthTotal
                                )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ paddingLeft: '40px' }}>
                              不指定(實) - 扣互助
                            </TableCell>
                            <TableCell>
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
                            <TableCell>服務換算抽成</TableCell>
                            <TableCell>
                              {Math.round(designer.salesAnalytics.servicePerformanceRake) +
                                Math.round(designer.salesAnalytics.ticketPerformanceRake)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ paddingLeft: '40px' }}>指定抽成</TableCell>
                            <TableCell>
                              {Math.round(designer.salesAnalytics.servicePerformanceDesignateRake) +
                                Math.round(designer.salesAnalytics.ticketPerformanceDesignateRake)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ paddingLeft: '40px' }}>不指定抽成</TableCell>
                            <TableCell>
                              {Math.round(
                                designer.salesAnalytics.servicePerformanceNonDesignateRake
                              ) +
                                Math.round(
                                  designer.salesAnalytics.ticketPerformanceNonDesignateRake
                                )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ paddingLeft: '40px' }}>特殊抽成</TableCell>
                            <TableCell>{Math.round(designer.salesAnalytics.specialRake)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ paddingLeft: '40px' }}>
                              扣薪水 - 付款手續費
                            </TableCell>
                            <TableCell>
                              {Math.round(
                                designer.salesAnalytics.serviceThirdPartHandlingFeeOnSalary
                              ) +
                                Math.round(
                                  designer.salesAnalytics.ticketThirdPartHandlingFeeOnSalary
                                )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ paddingLeft: '40px' }}>扣薪水 - 扣項</TableCell>
                            <TableCell>
                              {Math.round(designer.salesAnalytics.serviceSalaryDecountItem) +
                                Math.round(designer.salesAnalytics.ticketSalaryDecountItem)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ paddingLeft: '40px' }}>
                              扣薪水 - 使用互助{' '}
                            </TableCell>
                            <TableCell>
                              {Math.round(
                                designer.salesAnalytics.serviceSalaryDecountHelperUsagePrice +
                                designer.salesAnalytics.ticketSalaryDecountHelperUsagePrice
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>服務應領金額</TableCell>
                            <TableCell>
                              {Math.round(
                                designer.salesAnalytics.serviceSalaryShouldBePaid +
                                designer.salesAnalytics.ticketSalaryShouldBePaid
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>店販業績</TableCell>
                            <TableCell>
                              {Math.round(designer.salesAnalytics.productPerformanceFakeTotal)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ paddingLeft: '40px' }}>
                              扣業績 - 付款手續費
                            </TableCell>
                            <TableCell>
                              {Math.round(
                                designer.salesAnalytics.productThirdPartHandlingFeeOnSales
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ paddingLeft: '40px' }}>店販業績 扣手續費</TableCell>
                            <TableCell>
                              {Math.round(designer.salesAnalytics.productPerformanceTruthTotal)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>店販抽成</TableCell>
                            <TableCell>
                              {Math.round(
                                designer.salesAnalytics.productRakeByCost +
                                designer.salesAnalytics.productRakeByFixed +
                                designer.salesAnalytics.productRakeByPrice
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ paddingLeft: '40px' }}>
                              扣薪水 - 付款手續費
                            </TableCell>
                            <TableCell>
                              {Math.round(
                                designer.salesAnalytics.productThirdPartHandlingFeeOnSalary
                              )}
                            </TableCell>
                          </TableRow>
                          {/* 若有開啟會員卡功能一率顯示會員卡相關欄位，若關閉會員卡功能要判定欄位如果都為0才不顯示 */}
                          {membershipDisplay && (
                            <Fragment>
                              <TableRow>
                                <TableCell>會員卡業績</TableCell>
                                <TableCell>
                                  {Math.round(designer.salesAnalytics.membershipPerformanceFakeTotal)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ paddingLeft: '40px' }}>扣業績 - 付款手續費</TableCell>
                                <TableCell>
                                  {Math.round(designer.salesAnalytics.membershipThirdPartHandlingFeeOnSales)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ paddingLeft: '40px' }}>會員卡業績 扣手續費</TableCell>
                                <TableCell>
                                  {Math.round(designer.salesAnalytics.membershipPerformanceTruthTotal)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>會員卡抽成</TableCell>
                                <TableCell>
                                  {Math.round(
                                    designer.salesAnalytics.membershipRakeByCost +
                                    designer.salesAnalytics.membershipRakeByFixed +
                                    designer.salesAnalytics.membershipRakeByPrice
                                  )}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ paddingLeft: '40px' }}>扣薪水 - 付款手續費</TableCell>
                                <TableCell>
                                  {Math.round(designer.salesAnalytics.membershipThirdPartHandlingFeeOnSalary)}
                                </TableCell>
                              </TableRow>
                            </Fragment>
                          )}
                          <TableRow>
                            <TableCell>互助獲得 - 金額</TableCell>
                            <TableCell>
                              {Math.round(designer.salesAnalytics.helperRetrievePriceNoPoint)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>互助獲得 - 點數/換算金額</TableCell>
                            <TableCell>
                              {`${Math.round(designer.salesAnalytics.helperRetrievePoint)}/${designer.salesAnalytics.helperRetrievePriceOnlyPoint
                                }`}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>互助使用 - 點數</TableCell>
                            <TableCell>
                              {Math.round(designer.salesAnalytics.helperPointPaid)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>互助使用 - 金額</TableCell>
                            <TableCell>
                              {Math.round(designer.salesAnalytics.helperPricePaid)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>扣入金手續費</TableCell>
                            <TableCell>
                              {Math.round(
                                designer.salesAnalytics.walletDepositHandlingFeeByDesigner
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ color: 'red', fontWeight: '500' }}>
                              總應領薪資
                            </TableCell>
                            <TableCell style={{ color: 'red', fontWeight: '500' }}>
                              {Math.round(designer.salesAnalytics.totalSalaryShouldBePaid)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
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
