import { Card, CardContent, CardHeader } from 'ui/card'
import { Table, TableBody, TableCell, TableRow } from 'ui/table'
import PropTypes from 'prop-types'
import { Fragment, useState, useEffect } from 'react'

function Results({ designerRakeReport, isMemberShipCardActive }) {
  const [showMembership, setShowMembership] = useState([])

  useEffect(() => {
    const arr = []
    designerRakeReport.forEach(designer => {
      const membershipData = (
        Math.round(designer.salesAnalytics.membershipPerformanceFakeTotal) !== 0 ||
        Math.round(designer.salesAnalytics.membershipThirdPartHandlingFeeOnSales) !== 0 ||
        Math.round(designer.salesAnalytics.membershipPerformanceTruthTotal) !== 0 ||
        Math.round(
          designer.salesAnalytics.membershipRakeByCost +
          designer.salesAnalytics.membershipRakeByFixed +
          designer.salesAnalytics.membershipRakeByPrice
        ) !== 0
      )
      arr.push(membershipData || isMemberShipCardActive)
    })
    setShowMembership(arr)
  }, [isMemberShipCardActive, designerRakeReport])
  return (
    <Fragment>
      {designerRakeReport.map((designer, index) => (
        <div key={designer.user.id} className="my-5 min-w-0">
          {/* 保留 printCard 掛點與原有卡片內距。 */}
          <Card className="printCard overflow-hidden text-text">
            <CardHeader className="[&>div:first-child]:flex-auto !min-h-0 !items-center !gap-0 !px-4 !pb-2 !pt-4 text-center"><span className="block text-heading text-text">{`${designer.user.designerNo !== null && designer.user.designerNo !== ''
                ? designer.user.designerNo
                : ''
                } ${designer.user.nickName !== null && designer.user.nickName !== ''
                  ? designer.user.nickName
                  : ''
                } ${designer.user.name}`}</span></CardHeader>
            <hr className="m-0 shrink-0 border-0 border-b border-solid border-border" />
            <CardContent className="p-0 last:pb-4">
              <div>
                <Table dense aria-label="a dense table">
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
                        <TableCell style={{ paddingLeft: '40px' }}>扣業績 - 付款手續費</TableCell>
                        <TableCell>
                          {Math.round(designer.salesAnalytics.serviceThirdPartHandlingFeeOnSales) +
                            Math.round(designer.salesAnalytics.ticketThirdPartHandlingFeeOnSales)}
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
                            Math.round(designer.salesAnalytics.ticketPerformanceDecountHelperUsage)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>服務實業績 扣使用互助</TableCell>
                        <TableCell>
                          {Math.round(designer.salesAnalytics.servicePerformanceTruthTotal) +
                            Math.round(designer.salesAnalytics.ticketUsagePerformanceTruthTotal)}
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
                        <TableCell style={{ paddingLeft: '40px' }}>不指定(實) - 扣互助</TableCell>
                        <TableCell>
                          {Math.round(
                            designer.salesAnalytics.servicePerformanceNonDesignateTruthTotal
                          ) +
                            Math.round(
                              designer.salesAnalytics.ticketUsagePerformanceNonDesignateTruthTotal
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
                          {Math.round(designer.salesAnalytics.servicePerformanceNonDesignateRake) +
                            Math.round(designer.salesAnalytics.ticketPerformanceNonDesignateRake)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingLeft: '40px' }}>特殊抽成</TableCell>
                        <TableCell>{Math.round(designer.salesAnalytics.specialRake)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingLeft: '40px' }}>扣薪水 - 付款手續費</TableCell>
                        <TableCell>
                          {Math.round(designer.salesAnalytics.serviceThirdPartHandlingFeeOnSalary) +
                            Math.round(designer.salesAnalytics.ticketThirdPartHandlingFeeOnSalary)}
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
                        <TableCell style={{ paddingLeft: '40px' }}>扣薪水 - 使用互助 </TableCell>
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
                        <TableCell style={{ paddingLeft: '40px' }}>扣業績 - 付款手續費</TableCell>
                        <TableCell>
                          {Math.round(designer.salesAnalytics.productThirdPartHandlingFeeOnSales)}
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
                        <TableCell style={{ paddingLeft: '40px' }}>扣薪水 - 付款手續費</TableCell>
                        <TableCell>
                          {Math.round(designer.salesAnalytics.productThirdPartHandlingFeeOnSalary)}
                        </TableCell>
                      </TableRow>
                      {/* 若有開啟會員卡功能一率顯示會員卡相關欄位，若關閉會員卡功能要判定欄位如果都為0才不顯示 */}
                      {showMembership[index] && (
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
                          {`${Math.round(designer.salesAnalytics.helperRetrievePoint)}/${Math.round(designer.salesAnalytics.helperRetrievePriceOnlyPoint)
                            }`}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>互助使用 - 點數</TableCell>
                        <TableCell>{Math.round(designer.salesAnalytics.helperPointPaid)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>互助使用 - 金額</TableCell>
                        <TableCell>{Math.round(designer.salesAnalytics.helperPricePaid)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>扣入金手續費</TableCell>
                        <TableCell>
                          {Math.round(designer.salesAnalytics.walletDepositHandlingFeeByDesigner)}
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
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </Fragment>
  )
}

Results.propTypes = {
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
