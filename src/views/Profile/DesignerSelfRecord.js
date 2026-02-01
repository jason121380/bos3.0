/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, CardHeader, Divider, Table, TableBody,
  TableCell, TableHead, TableRow, Typography, TableContainer, Paper,
  CircularProgress
} from '@mui/material'
import { format } from 'date-fns'
import PropTypes from 'prop-types'
import PerfectScrollbar from 'react-perfect-scrollbar'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import { css } from '@emotion/react'

const styles = {
  root: css({
    marginTop: -24
  }),
  cardHeader: css({
    textAlign: 'center',
  }),
  orderNoLink: css({
    textDecorationLine: 'underline',
    color: 'black',
  }),
}

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
    <div {...rest} css={styles.root}>
      <MerchantSearchBar
        values={dateForHelper}
        onFilter={values => setDateForHelper(values)}
        outside
        visible={['datePicker']}
        inMerchantDailyReport={true}
        hideStartDate={true}
        onlyDayTime={true}
      />
      {isLoading ? 
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </div> : designerDailyReport && (
        designerDailyReport.length === 0 ? 
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Typography component="h1" variant="h3">
            無資料
          </Typography>
        </div>
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
                designer.totalPageCount != 1
                  ? `- ${designer.currentPageOrder}/${designer.totalPageCount}`
                  : ``
              }`}
              css={styles.cardHeader}
            />
            <Divider />
            <CardContent css={styles.content}>
              <PerfectScrollbar>
                <div css={styles.inner}>
                  <Table css={styles.table} size="small" aria-label="a dense table">
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
                      {designer.currentPageOrder != 1 && (
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
                                  css={styles.orderNoLink}
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
                                {displayFloat(orderRecord.fakePerformance)}
                              </TableCell>
                              <TableCell className="categoryPrint2">
                                {displayFloat(orderRecord.truthPerformance)}
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
                            <TableCell>{displayFloat(designer.currentFakeSummary)}</TableCell>
                          ) : (
                            <TableCell />
                          )}
                          <TableCell>{displayFloat(designer.currentTruthSummary)}</TableCell>
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
                      <Table css={styles.table} size="small" aria-label="a dense table">
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
                                {displayFloat(designer.currentDay.performanceFakeTotal)}
                              </TableCell>
                              <TableCell>
                                {displayFloat(designer.tillNow.performanceFakeTotal)}
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
                                {displayFloat(designer.currentDay.performanceTruthTotal)}
                              </TableCell>
                              <TableCell>
                                {displayFloat(designer.tillNow.performanceTruthTotal)}
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
                                {displayFloat(designer.currentDay.performanceDesignateTruthTotal)}
                              </TableCell>
                              <TableCell>
                                {displayFloat(designer.tillNow.performanceDesignateTruthTotal)}
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
                                {displayFloat(
                                  designer.currentDay.performanceNonDesignateTruthTotal
                                )}
                              </TableCell>
                              <TableCell>
                                {displayFloat(designer.tillNow.performanceNonDesignateTruthTotal)}
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
                                {displayFloat(designer.currentDay.thirdPartHandlingFee)}
                              </TableCell>
                              <TableCell>
                                {displayFloat(designer.tillNow.thirdPartHandlingFee)}
                              </TableCell>
                            </TableRow>
                          )}
                          <TableRow>
                            <TableCell className="forPrint4">特殊抽成</TableCell>
                            <TableCell>
                              {displayFloat(designer.currentDay.performanceWithSpecialRake)}
                            </TableCell>
                            <TableCell>
                              {displayFloat(designer.tillNow.performanceWithSpecialRake)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="forPrint4">店販金額</TableCell>
                            <TableCell>
                              {displayFloat(designer.currentDay.productFakeTotal)}
                            </TableCell>
                            <TableCell>{displayFloat(designer.tillNow.productFakeTotal)}</TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell className="forPrint4">店販抽成</TableCell>
                            <TableCell>{displayFloat(designer.currentDay.productRake)}</TableCell>
                            <TableCell>{displayFloat(designer.tillNow.productRake)}</TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell className="forPrint4">互助使用(不含點)</TableCell>
                            <TableCell>{`${displayFloat(
                              designer.currentDay.helperPaidPrice
                            )}`}</TableCell>
                            <TableCell>{`${displayFloat(
                              designer.tillNow.helperPaidPrice
                            )}`}</TableCell>
                          </TableRow>
                          {
                            <TableRow>
                              <TableCell className="forPrint4">互助使用(點)</TableCell>
                              <TableCell>{`${displayFloat(designer.currentDay.helperPaidPoint)}${
                                isHelperPointPriceDisplay
                                  ? `/${Math.abs(
                                      displayFloat(designer.currentDay.helperPaidPriceFromPoint)
                                    )}`
                                  : ''
                              }`}</TableCell>
                              <TableCell>{`${displayFloat(designer.tillNow.helperPaidPoint)}${
                                isHelperPointPriceDisplay
                                  ? `/${Math.abs(
                                      displayFloat(designer.tillNow.helperPaidPriceFromPoint)
                                    )}`
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
                              <TableCell>{`${displayFloat(
                                designer.currentDay.helperRetrievePoint
                              )}`}</TableCell>
                              <TableCell>{`${displayFloat(
                                designer.tillNow.helperRetrievePoint
                              )}`}</TableCell>
                            </TableRow>
                          )}
                          {(!isHiddenZero ||
                            ((designer.currentDay.orderTotalCount !== 0 ||
                              designer.tillNow.orderTotalCount !== 0) &&
                              isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">總客數</TableCell>
                              <TableCell>{designer.currentDay.orderTotalCount}</TableCell>
                              <TableCell>{designer.tillNow.orderTotalCount}</TableCell>
                            </TableRow>
                          )}
                          {(!isHiddenZero ||
                            ((designer.currentDay.designateOrderCount !== 0 ||
                              designer.tillNow.designateOrderCount !== 0) &&
                              isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">指定客</TableCell>
                              <TableCell>{designer.currentDay.designateOrderCount}</TableCell>
                              <TableCell>{designer.tillNow.designateOrderCount}</TableCell>
                            </TableRow>
                          )}
                          {(!isHiddenZero ||
                            ((designer.currentDay.nonDesignateOrderCount !== 0 ||
                              designer.tillNow.nonDesignateOrderCount !== 0) &&
                              isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">不指定客</TableCell>
                              <TableCell>{designer.currentDay.nonDesignateOrderCount}</TableCell>
                              <TableCell>{designer.tillNow.nonDesignateOrderCount}</TableCell>
                            </TableRow>
                          )}
                          {(!isHiddenZero ||
                            ((designer.currentDay.orderAveragePrice !== 0 ||
                              designer.tillNow.orderAveragePrice !== 0) &&
                              isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">客單價</TableCell>
                              <TableCell>
                                {displayFloat(
                                  designer.currentDay.performanceFakeTotal /
                                    designer.currentDay.orderTotalCount
                                )}
                              </TableCell>
                              <TableCell>
                                {displayFloat(
                                  designer.tillNow.performanceFakeTotal /
                                    designer.tillNow.orderTotalCount
                                )}
                              </TableCell>
                            </TableRow>
                          )}
                          {(!isHiddenZero ||
                            ((designer.currentDay.orderTypeCount !== 0 ||
                              designer.tillNow.orderTypeCount !== 0) &&
                              isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">客項次(服務)</TableCell>
                              <TableCell>{designer.currentDay.orderTypeCount}</TableCell>
                              <TableCell>{designer.tillNow.orderTypeCount}</TableCell>
                            </TableRow>
                          )}
                          {(!isHiddenZero ||
                            ((designer.currentDay.orderTypeAveragePrice !== 0 ||
                              designer.tillNow.orderTypeAveragePrice !== 0) &&
                              isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">平均項次單價</TableCell>
                              <TableCell>
                                {displayFloat(
                                  designer.currentDay.performanceFakeTotal /
                                    designer.currentDay.orderTypeCount
                                )}
                              </TableCell>
                              <TableCell>
                                {displayFloat(
                                  designer.tillNow.performanceFakeTotal /
                                    designer.tillNow.orderTypeCount
                                )}
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
                                {displayFloat(designer.currentDay.walletDeposit)}
                              </TableCell>
                              <TableCell>{displayFloat(designer.tillNow.walletDeposit)}</TableCell>
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
