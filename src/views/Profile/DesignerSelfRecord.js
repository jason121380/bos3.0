import { Paper } from 'ui/display-compat'
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from 'ui/table-compat'
import { Card, CardContent, CardHeader } from 'ui/card-compat'
import { format } from 'date-fns'
import PropTypes from 'prop-types'
import PerfectScrollbar from 'react-perfect-scrollbar'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import { Card as UiCard } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Skeleton } from 'ui/skeleton'
import { formatNumber } from 'ui/format'

// 客單價／平均項次單價：沒有客人（分母為 0）時顯示 0，不顯示 NaN（Jason 2026/10/22）
const averageOf = (total, count) => (count ? total / count : 0)

function OrderRecord({
  designerDailyReport,
  titleDate,
  priceDisplayOnReport,
  isHelperPointPriceDisplay,
  startDateOfMonth,
  isHiddenZero,
  setDateForHelper,
  dateForHelper,
  isLoading,
  ...rest
}) {
  const displayFloat = num => {
    // 超過六位數則忽略小數點
    if (num / 100000 >= 1) {
      return +(Math.round(num + 'e+0') + 'e-0')
    } else {
      return +(Math.round(num + 'e+1') + 'e-1')
    }
  }

  return (
    <div {...rest} className="mt-[-24px]">
      <MerchantSearchBar
        values={dateForHelper}
        onFilter={values => setDateForHelper(values)}
        outside
        visible={['datePicker']}
        inMerchantDailyReport={true}
        hideStartDate={true}
        onlyDayTime={true}
      />
      {/* 日報表卡片內含列印用欄位（categoryPrint / itemPrint / forPrint*），依列印範本規則原封保留；只換載入與無資料畫面 */}
      {isLoading ?
        <Skeleton className="mx-auto h-96 w-full max-w-[800px]" /> : designerDailyReport && (
        designerDailyReport.length === 0 ?
        <UiCard>
          <EmptyState title="無資料" />
        </UiCard>
        : designerDailyReport.map(designer => (
          <Card style={{ margin: '0 auto', minWidth: '500px', maxWidth: '800px' }}>
            <CardHeader
              title={`${
                designer.user.designerNo !== null && designer.user.designerNo !== ''
                  ? designer.user.designerNo
                  : ''
              } ${
                designer.user.nickName !== null && designer.user.nickName !== ''
                  ? designer.user.nickName
                  : ''
              } ${designer.user.name} ${format(new Date(titleDate), 'MM/dd/yyyy')} 日報表 ${
                Number(designer.totalPageCount) !== 1
                  ? `- ${designer.currentPageOrder}/${designer.totalPageCount}`
                  : ``
              }`}
              className="text-center"
            />
            <div className="h-px bg-border" />
            <CardContent>
              <PerfectScrollbar>
                <div>
                  <Table size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        <TableCell className="categoryPrint">單號</TableCell>
                        <TableCell className="categoryPrintService2">類別</TableCell>
                        <TableCell className="itemPrint">項目</TableCell>
                        <TableCell className="categoryPrint">金額</TableCell>
                        <TableCell className="categoryPrint">業績</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Number(designer.currentPageOrder) !== 1 && (
                        <TableRow>
                          <TableCell colSpan="5" style={{ textAlign: 'center' }}>
                            承上張
                          </TableCell>
                        </TableRow>
                      )}
                      {designer.orderRecord.length > 0
                        ? designer.orderRecord.map((orderRecord, index) => (
                            <TableRow>
                              <TableCell className="categoryPrint2">
                                <a
                                  target="_blank"
                                  href={`/order/${orderRecord.orderId}`}
                                  className="text-black underline"
                                >
                                  {orderRecord.orderNo}
                                  {orderRecord.designation ? `*` : ``}
                                </a>
                              </TableCell>
                              <TableCell className="categoryPrintService2">
                                {orderRecord.category === '項目消費'
                                  ? `${orderRecord.category[2]}${orderRecord.category[3]}`
                                  : orderRecord.category}
                              </TableCell>
                              <TableCell className="itemPrint">{orderRecord.itemName}</TableCell>
                              <TableCell className="categoryPrint2">
                                {formatNumber(displayFloat(orderRecord.fakePerformance))}
                              </TableCell>
                              <TableCell className="categoryPrint2">
                                {formatNumber(displayFloat(orderRecord.truthPerformance))}
                              </TableCell>
                            </TableRow>
                          ))
                        : ``}

                      {designer.isLastPage ? (
                        <TableRow>
                          <TableCell style={{ fontWeight: '500' }}>合計</TableCell>
                          <TableCell className="categoryPrintService2"></TableCell>
                          <TableCell></TableCell>
                          {priceDisplayOnReport ? (
                            <TableCell>{formatNumber(displayFloat(designer.currentFakeSummary))}</TableCell>
                          ) : (
                            <TableCell />
                          )}
                          <TableCell>{formatNumber(displayFloat(designer.currentTruthSummary))}</TableCell>
                        </TableRow>
                      ) : (
                        <TableRow>
                          <TableCell colSpan="5" style={{ textAlign: 'center' }}>
                            接續下張
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {designer.isLastPage && (
                    <TableContainer component={Paper}>
                      <Table size="small" aria-label="a dense table">
                        <TableHead>
                          <TableRow>
                            <TableCell className="forPrint3"></TableCell>
                            <TableCell>日合計</TableCell>
                            <TableCell>累計</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {priceDisplayOnReport && (
                            <TableRow>
                              <TableCell className="forPrint4">金額(虛)</TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(designer.currentDay.performanceFakeTotal))}
                              </TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(designer.tillNow.performanceFakeTotal))}
                              </TableCell>
                            </TableRow>
                          )}
                          {(!isHiddenZero ||
                            ((designer.currentDay.performanceTruthTotal !== 0 ||
                              designer.tillNow.performanceTruthTotal !== 0) &&
                              isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">實業績</TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(designer.currentDay.performanceTruthTotal))}
                              </TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(designer.tillNow.performanceTruthTotal))}
                              </TableCell>
                            </TableRow>
                          )}
                          {(!isHiddenZero ||
                            ((designer.currentDay.performanceDesignateTruthTotal !== 0 ||
                              designer.tillNow.performanceDesignateTruthTotal !== 0) &&
                              isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">指定實業績</TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(designer.currentDay.performanceDesignateTruthTotal))}
                              </TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(designer.tillNow.performanceDesignateTruthTotal))}
                              </TableCell>
                            </TableRow>
                          )}
                          {(!isHiddenZero ||
                            ((designer.currentDay.performanceNonDesignateTruthTotal !== 0 ||
                              designer.tillNow.performanceNonDesignateTruthTotal !== 0) &&
                              isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">不指定實業績</TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(
                                  designer.currentDay.performanceNonDesignateTruthTotal
                                ))}
                              </TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(designer.tillNow.performanceNonDesignateTruthTotal))}
                              </TableCell>
                            </TableRow>
                          )}
                          {(!isHiddenZero ||
                            ((designer.currentDay.thirdPartHandlingFee !== 0 ||
                              designer.tillNow.thirdPartHandlingFee !== 0) &&
                              isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">手續費</TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(designer.currentDay.thirdPartHandlingFee))}
                              </TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(designer.tillNow.thirdPartHandlingFee))}
                              </TableCell>
                            </TableRow>
                          )}
                          <TableRow>
                            <TableCell className="forPrint4">特殊抽成</TableCell>
                            <TableCell>
                              {formatNumber(displayFloat(designer.currentDay.performanceWithSpecialRake))}
                            </TableCell>
                            <TableCell>
                              {formatNumber(displayFloat(designer.tillNow.performanceWithSpecialRake))}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="forPrint4">店販金額</TableCell>
                            <TableCell>
                              {formatNumber(displayFloat(designer.currentDay.productFakeTotal))}
                            </TableCell>
                            <TableCell>{formatNumber(displayFloat(designer.tillNow.productFakeTotal))}</TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell className="forPrint4">店販抽成</TableCell>
                            <TableCell>{formatNumber(displayFloat(designer.currentDay.productRake))}</TableCell>
                            <TableCell>{formatNumber(displayFloat(designer.tillNow.productRake))}</TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell className="forPrint4">互助使用(不含點)</TableCell>
                            <TableCell>{`${formatNumber(displayFloat(
                              designer.currentDay.helperPaidPrice
                            ))}`}</TableCell>
                            <TableCell>{`${formatNumber(displayFloat(
                              designer.tillNow.helperPaidPrice
                            ))}`}</TableCell>
                          </TableRow>
                          {
                            <TableRow>
                              <TableCell className="forPrint4">互助使用(點)</TableCell>
                              <TableCell>{`${formatNumber(displayFloat(designer.currentDay.helperPaidPoint))}${
                                isHelperPointPriceDisplay
                                  ? `/${formatNumber(Math.abs(
                                      displayFloat(designer.currentDay.helperPaidPriceFromPoint)
                                    ))}`
                                  : ''
                              }`}</TableCell>
                              <TableCell>{`${formatNumber(displayFloat(designer.tillNow.helperPaidPoint))}${
                                isHelperPointPriceDisplay
                                  ? `/${formatNumber(Math.abs(
                                      displayFloat(designer.tillNow.helperPaidPriceFromPoint)
                                    ))}`
                                  : ''
                              }`}</TableCell>
                            </TableRow>
                          }
                          {(!isHiddenZero ||
                            ((designer.currentDay.helperRetrievePoint !== 0 ||
                              designer.tillNow.helperRetrievePoint !== 0) &&
                              isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">互助獲得</TableCell>
                              <TableCell>{`${formatNumber(displayFloat(
                                designer.currentDay.helperRetrievePoint
                              ))}`}</TableCell>
                              <TableCell>{`${formatNumber(displayFloat(
                                designer.tillNow.helperRetrievePoint
                              ))}`}</TableCell>
                            </TableRow>
                          )}
                          {(!isHiddenZero ||
                            ((designer.currentDay.orderTotalCount !== 0 ||
                              designer.tillNow.orderTotalCount !== 0) &&
                              isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">總客數</TableCell>
                              <TableCell>{formatNumber(designer.currentDay.orderTotalCount)}</TableCell>
                              <TableCell>{formatNumber(designer.tillNow.orderTotalCount)}</TableCell>
                            </TableRow>
                          )}
                          {(!isHiddenZero ||
                            ((designer.currentDay.designateOrderCount !== 0 ||
                              designer.tillNow.designateOrderCount !== 0) &&
                              isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">指定客</TableCell>
                              <TableCell>{formatNumber(designer.currentDay.designateOrderCount)}</TableCell>
                              <TableCell>{formatNumber(designer.tillNow.designateOrderCount)}</TableCell>
                            </TableRow>
                          )}
                          {(!isHiddenZero ||
                            ((designer.currentDay.nonDesignateOrderCount !== 0 ||
                              designer.tillNow.nonDesignateOrderCount !== 0) &&
                              isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">不指定客</TableCell>
                              <TableCell>{formatNumber(designer.currentDay.nonDesignateOrderCount)}</TableCell>
                              <TableCell>{formatNumber(designer.tillNow.nonDesignateOrderCount)}</TableCell>
                            </TableRow>
                          )}
                          {(!isHiddenZero ||
                            ((designer.currentDay.orderAveragePrice !== 0 ||
                              designer.tillNow.orderAveragePrice !== 0) &&
                              isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">客單價</TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(
                                  averageOf(designer.currentDay.performanceFakeTotal, designer.currentDay.orderTotalCount)
                                ))}
                              </TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(
                                  averageOf(designer.tillNow.performanceFakeTotal, designer.tillNow.orderTotalCount)
                                ))}
                              </TableCell>
                            </TableRow>
                          )}
                          {(!isHiddenZero ||
                            ((designer.currentDay.orderTypeCount !== 0 ||
                              designer.tillNow.orderTypeCount !== 0) &&
                              isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">客項次(服務)</TableCell>
                              <TableCell>{formatNumber(designer.currentDay.orderTypeCount)}</TableCell>
                              <TableCell>{formatNumber(designer.tillNow.orderTypeCount)}</TableCell>
                            </TableRow>
                          )}
                          {(!isHiddenZero ||
                            ((designer.currentDay.orderTypeAveragePrice !== 0 ||
                              designer.tillNow.orderTypeAveragePrice !== 0) &&
                              isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">平均項次單價</TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(
                                  averageOf(designer.currentDay.performanceFakeTotal, designer.currentDay.orderTypeCount)
                                ))}
                              </TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(
                                  averageOf(designer.tillNow.performanceFakeTotal, designer.tillNow.orderTypeCount)
                                ))}
                              </TableCell>
                            </TableRow>
                          )}
                          {(!isHiddenZero ||
                            ((designer.currentDay.walletDeposit !== 0 ||
                              designer.tillNow.walletDeposit !== 0) &&
                              isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">入金儲值</TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(designer.currentDay.walletDeposit))}
                              </TableCell>
                              <TableCell>{formatNumber(displayFloat(designer.tillNow.walletDeposit))}</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </div>
              </PerfectScrollbar>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

OrderRecord.propTypes = {
  orders: PropTypes.array,
}

OrderRecord.defaultProps = {
  orders: [],
}

export default OrderRecord
