/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
} from '@mui/material'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import PropTypes from 'prop-types'
import { Fragment, useEffect, useState } from 'react'
import { format } from 'date-fns'
import _ from 'lodash'
import idx from 'idx'
import useFetchGetIsDisplayHelperRetrieveInDailyReport from 'hooks/useFetchGetIsDisplayHelperRetrieveInDailyReport'
import useFetchGetIsUsingMathRoundInDesignerDailyReport from 'hooks/useFetchGetIsUsingMathRoundInDesignerDailyReport'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Card as UICard, CardHeader as UICardHeader, CardTitle } from 'ui/card'

const styles = {
  root: css({}),
  content: css({
    padding: 0,
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
  orderNoLink: css({
    textDecorationLine: 'underline',
    color: 'black',
  }),
}

function Results({
  designerDailyReport,
  titleDate,
  priceDisplayOnReport,
  isHelperPointPriceDisplay,
  isHiddenZero,
  isMemberShipCardActive,
  printData,
  printMode,
}) {
  // 參數設定 設計師日報表是否顯示互助獲得
  const getIsDisplayHelperRetrieveInDailyReport = useFetchGetIsDisplayHelperRetrieveInDailyReport()
  const mathRoundSetting = useFetchGetIsUsingMathRoundInDesignerDailyReport()
  const [dataVisible, setDataVisible] = useState(false)
  const [isMathRound, setIsMathRound] = useState(false)
  const [mathRoundData, setMathRoundData] = useState([])
  const [mathRoundPrintData, setMathRoundPrintData] = useState([])
  const displayFloat = num => {
    // 超過六位數則忽略小數點
    if (num / 100000 >= 1) {
      return +(Math.round(num + 'e+0') + 'e-0')
    } else {
      return +(Math.round(num + 'e+1') + 'e-1')
    }
  }

  useEffect(() => {
    if (!getIsDisplayHelperRetrieveInDailyReport.loading) {
      setDataVisible(
        getIsDisplayHelperRetrieveInDailyReport.data.getIsDisplayHelperRetrieveInDailyReport
      )
    }
  }, [getIsDisplayHelperRetrieveInDailyReport.loading])

  useEffect(() => {
    if (
      !mathRoundSetting.loading &&
      mathRoundSetting.data.getIsUsingMathRoundInDesignerDailyReport === true
    ) {
      setIsMathRound(idx(mathRoundSetting, _ => _.data.getIsUsingMathRoundInDesignerDailyReport))
      const cloneData = _.cloneDeep(designerDailyReport)
      cloneData.map(data => {
        data.currentFakeSummary = Math.round(data.currentFakeSummary)
        data.currentTruthSummary = Math.round(data.currentTruthSummary)
        for (const i in data.tillNow) {
          data.tillNow[i] = Math.round(data.tillNow[i])
        }
        for (const i in data.currentDay) {
          data.currentDay[i] = Math.round(data.currentDay[i])
        }
        data.orderRecord.map(order => {
          order.fakePerformance = Math.round(order.fakePerformance)
          order.truthPerformance = Math.round(order.truthPerformance)
          order.truthPerformanceWithHelperUsage = Math.round(order.truthPerformanceWithHelperUsage)
        })
      })
      setMathRoundData(cloneData)

      const clonePrintData = _.cloneDeep(printData)
      clonePrintData.map(datas => {
        datas.map(data => {
          data.currentFakeSummary = Math.round(data.currentFakeSummary)
          data.currentTruthSummary = Math.round(data.currentTruthSummary)
          for (const i in data.tillNow) {
            data.tillNow[i] = Math.round(data.tillNow[i])
          }
          for (const i in data.currentDay) {
            data.currentDay[i] = Math.round(data.currentDay[i])
          }
          data.orderRecord.map(order => {
            order.fakePerformance = Math.round(order.fakePerformance)
            order.truthPerformance = Math.round(order.truthPerformance)
            order.truthPerformanceWithHelperUsage = Math.round(order.truthPerformanceWithHelperUsage)
          })
        })

      })
      setMathRoundPrintData(clonePrintData)
    }
  }, [mathRoundSetting.loading])

  return (
    <Fragment>
      {(isMathRound ? mathRoundData : designerDailyReport).map((designer, index) => (
        <Grid item xs={12} sm={6} md={4} key={designer.user.id + index} className="EmployeeDailyReportCard, noprint">
          <UICard className="overflow-hidden">
            <UICardHeader className="justify-center pb-4 text-center">
              <CardTitle>
                {`${designer.user.designerNo !== null && designer.user.designerNo !== ''
                  ? designer.user.designerNo
                  : ''
                  } ${designer.user.nickName !== null && designer.user.nickName !== ''
                    ? designer.user.nickName
                    : ''
                  } ${designer.user.name} ${format(new Date(titleDate), 'MM/dd/yyyy')} 日報表 ${designer.totalPageCount != 1
                    ? `- ${designer.currentPageOrder}/${designer.totalPageCount}`
                    : ''
                  }`}
              </CardTitle>
            </UICardHeader>
            <div className="h-px bg-border" />
            <div>
              <div className="printCard">
                <Table dense aria-label="a dense table">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="categoryPrint">單號</TableHead>
                      <TableHead className="categoryPrintService2">類別</TableHead>
                      <TableHead className="itemPrint">項目</TableHead>
                      <TableHead className="categoryPrint">金額</TableHead>
                      <TableHead className="categoryPrint">業績</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {designer.currentPageOrder != 1 && (
                      <TableRow>
                        <TableCell colSpan="5" className="text-center">
                          承上張
                        </TableCell>
                      </TableRow>
                    )}
                    {designer.orderRecord.length > 0
                      ? designer.orderRecord.map((orderRecord, index) => (
                        <TableRow key={index}>
                          <TableCell className="categoryPrint2">
                            <a
                              target="_blank"
                              href={`/order/${orderRecord.orderId}`}
                              css={styles.orderNoLink}
                            >
                              {orderRecord.orderNo}
                              {orderRecord.designation ? `*` : null}
                            </a>
                          </TableCell>
                          <TableCell className="categoryPrintService2">
                            {orderRecord.category === '項目消費'
                              ? `${orderRecord.category[2]}${orderRecord.category[3]}`
                              : orderRecord.category}
                          </TableCell>
                          <TableCell className="itemPrint">
                            {orderRecord.itemName}
                          </TableCell>
                          <TableCell className="categoryPrint2">
                            {displayFloat(orderRecord.fakePerformance)}
                          </TableCell>
                          <TableCell className="categoryPrint2">
                            {displayFloat(orderRecord.truthPerformance)}
                          </TableCell>
                        </TableRow>
                      ))
                      : null}

                    {designer.isLastPage ? (
                      <TableRow>
                        <TableCell className="font-medium">合計</TableCell>
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
                        <TableCell colSpan="5" className="text-center">
                          {/* 接續第 {designer.currentPageOrder+1} 頁 */}
                          接續下張
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {designer.isLastPage && (
                    <Table dense aria-label="a dense table">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="forPrint3"></TableHead>
                          <TableHead>日合計</TableHead>
                          <TableHead>累計</TableHead>
                        </TableRow>
                      </TableHeader>
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
                                {displayFloat(designer.currentDay.performanceNonDesignateTruthTotal)}
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
                          <TableCell className="forPrint4">特殊抽成業績</TableCell>
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

                        {(isMemberShipCardActive || (designer.tillNow.membershipFakeTotal !== 0 || designer.tillNow.membershipRake !== 0)) &&
                          (
                            <Fragment>
                              <TableRow>
                                <TableCell className="forPrint4">會員卡業績</TableCell>
                                <TableCell>{displayFloat(designer.currentDay.membershipFakeTotal)}</TableCell>
                                <TableCell>{displayFloat(designer.tillNow.membershipFakeTotal)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="forPrint4">會員卡抽成</TableCell>
                                <TableCell>{displayFloat(designer.currentDay.membershipRake)}</TableCell>
                                <TableCell>{displayFloat(designer.tillNow.membershipRake)}</TableCell>
                              </TableRow>
                            </Fragment>
                          )
                        }
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
                            <TableCell>{`${displayFloat(designer.currentDay.helperPaidPoint)}${isHelperPointPriceDisplay
                              ? `/${Math.abs(
                                displayFloat(designer.currentDay.helperPaidPriceFromPoint)
                              )}`
                              : ''
                              }`}</TableCell>
                            <TableCell>{`${displayFloat(designer.tillNow.helperPaidPoint)}${isHelperPointPriceDisplay
                              ? `/${Math.abs(
                                displayFloat(designer.tillNow.helperPaidPriceFromPoint)
                              )}`
                              : ''
                              }`}</TableCell>
                          </TableRow>
                        }
                        {dataVisible
                          ? (!isHiddenZero ||
                            ((designer.currentDay.helperRetrievePoint !== 0 ||
                              designer.currentDay.helperRetrievePrice !== 0 ||
                              designer.currentDay.helpGetNoPoint !== 0 ||
                              designer.tillNow.helperRetrievePoint !== 0 ||
                              designer.tillNow.helperRetrievePrice !== 0 ||
                              designer.tillNow.helpGetNoPoint !== 0) &&
                              isHiddenZero)) && (
                            <Fragment>
                              <TableRow>
                                <TableCell className="forPrint4">
                                  互助獲得金額 <br />
                                  (不含點)
                                </TableCell>
                                <TableCell>{designer.currentDay.helpGetNoPoint}</TableCell>
                                <TableCell>{designer.tillNow.helpGetNoPoint}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="forPrint4">
                                  互助獲得(點)
                                  <br />
                                  點數/換算金額
                                </TableCell>
                                <TableCell>
                                  {`${displayFloat(designer.currentDay.helperRetrievePoint)}` +
                                    '/' +
                                    designer.currentDay.helperRetrievePrice}
                                </TableCell>
                                <TableCell>
                                  {`${displayFloat(designer.tillNow.helperRetrievePoint)}` +
                                    '/' +
                                    designer.tillNow.helperRetrievePrice}
                                </TableCell>
                              </TableRow>
                            </Fragment>
                          )
                          : (!isHiddenZero ||
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
                            isHiddenZero)) &&
                          (isMathRound ? (
                            <TableRow>
                              <TableCell className="forPrint4">客單價</TableCell>
                              <TableCell>
                                {Math.round(
                                  designer.currentDay.performanceFakeTotal /
                                  designer.currentDay.orderTotalCount
                                )}
                              </TableCell>
                              <TableCell>
                                {Math.round(
                                  designer.tillNow.performanceFakeTotal /
                                  designer.tillNow.orderTotalCount
                                )}
                              </TableCell>
                            </TableRow>
                          ) : (
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
                          ))}
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
                            isHiddenZero)) &&
                          (isMathRound ? (
                            <TableRow>
                              <TableCell className="forPrint4">平均項次單價</TableCell>
                              <TableCell>
                                {Math.round(
                                  designer.currentDay.performanceFakeTotal /
                                  designer.currentDay.orderTypeCount
                                )}
                              </TableCell>
                              <TableCell>
                                {Math.round(
                                  designer.tillNow.performanceFakeTotal /
                                  designer.tillNow.orderTypeCount
                                )}
                              </TableCell>
                            </TableRow>
                          ) : (
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
                          ))}
                        {(!isHiddenZero ||
                          ((designer.currentDay.walletDeposit !== 0 ||
                            designer.tillNow.walletDeposit !== 0) &&
                            isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">入金儲值</TableCell>
                              <TableCell>{displayFloat(designer.currentDay.walletDeposit)}</TableCell>
                              <TableCell>{displayFloat(designer.tillNow.walletDeposit)}</TableCell>
                            </TableRow>
                          )}
                      </TableBody>
                    </Table>
                )}
              </div>
            </div>
          </UICard>
        </Grid>
      ))}
      {(isMathRound ? mathRoundPrintData : printData).map((data, index) => {
        return (
          <div key={`printWrap-${index}`} className='EmployeeDailyReportCardPrintContainer'>
            {data.map((designer, index) => {
              return (
                <Grid item xs={12} sm={6} md={4} key={`print-${designer.user.id}-${index}`} className="EmployeeDailyReportCardPrint">
                  <Card>
                    <CardHeader
                      title={`${designer.user.designerNo !== null && designer.user.designerNo !== ''
                        ? designer.user.designerNo
                        : ''
                        } ${designer.user.nickName !== null && designer.user.nickName !== ''
                          ? designer.user.nickName
                          : ''
                        } ${designer.user.name} ${format(new Date(titleDate), 'MM/dd/yyyy')} 日報表 ${designer.totalPageCount != 1
                          ? `- ${designer.currentPageOrder}/${designer.totalPageCount}`
                          : ''
                        }`}
                      css={styles.cardHeader}
                    />
                    <CardContent css={styles.content}>
                      <div className="printCard">
                        <Table dense aria-label="a dense table">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="categoryPrint">單號</TableHead>
                              <TableHead className="categoryPrintService2">類別</TableHead>
                              <TableHead className={printMode ? "itemPrint" : null}>項目</TableHead>
                              <TableHead className="categoryPrint">金額</TableHead>
                              <TableHead className="categoryPrint">業績</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {designer.currentPageOrder != 1 && (
                              <TableRow>
                                <TableCell colSpan="5" className="text-center">
                                  承上張
                                </TableCell>
                              </TableRow>
                            )}
                            {designer.orderRecord.length > 0
                              ? designer.orderRecord.map((orderRecord, index) => (
                                <TableRow key={`print-${index}`}>
                                  <TableCell className="categoryPrint2">
                                    <a
                                      target="_blank"
                                      href={`/order/${orderRecord.orderId}`}
                                      css={styles.orderNoLink}
                                    >
                                      {orderRecord.orderNo}
                                      {orderRecord.designation ? `*` : null}
                                    </a>
                                  </TableCell>
                                  <TableCell className="categoryPrintService2">
                                    {orderRecord.category === '項目消費'
                                      ? `${orderRecord.category[2]}${orderRecord.category[3]}`
                                      : orderRecord.category}
                                  </TableCell>
                                  <TableCell className={printMode ? "itemPrint" : null}>
                                    {orderRecord.itemName}
                                  </TableCell>
                                  <TableCell className="categoryPrint2">
                                    {displayFloat(orderRecord.fakePerformance)}
                                  </TableCell>
                                  <TableCell className="categoryPrint2">
                                    {displayFloat(orderRecord.truthPerformance)}
                                  </TableCell>
                                </TableRow>
                              ))
                              : null}

                            {designer.isLastPage ? (
                              <TableRow>
                                <TableCell className="font-medium">合計</TableCell>
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
                                <TableCell colSpan="5" className="text-center">
                                  {/* 接續第 {designer.currentPageOrder+1} 頁 */}
                                  接續下張
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                        {designer.isLastPage && (
                            <Table dense aria-label="a dense table">
                              <TableHeader>
                                <TableRow>
                                  <TableHead></TableHead>
                                  <TableHead>日合計</TableHead>
                                  <TableHead>累計</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {priceDisplayOnReport && (
                                  <TableRow>
                                    <TableCell>金額(虛)</TableCell>
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
                                      <TableCell>實業績</TableCell>
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
                                      <TableCell>指定實業績</TableCell>
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
                                      <TableCell>不指定實業績</TableCell>
                                      <TableCell>
                                        {displayFloat(designer.currentDay.performanceNonDesignateTruthTotal)}
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
                                      <TableCell>手續費</TableCell>
                                      <TableCell>
                                        {displayFloat(designer.currentDay.thirdPartHandlingFee)}
                                      </TableCell>
                                      <TableCell>
                                        {displayFloat(designer.tillNow.thirdPartHandlingFee)}
                                      </TableCell>
                                    </TableRow>
                                  )}
                                <TableRow>
                                  <TableCell>特殊抽成業績</TableCell>
                                  <TableCell>
                                    {displayFloat(designer.currentDay.performanceWithSpecialRake)}
                                  </TableCell>
                                  <TableCell>
                                    {displayFloat(designer.tillNow.performanceWithSpecialRake)}
                                  </TableCell>
                                </TableRow>

                                <TableRow>
                                  <TableCell>店販金額</TableCell>
                                  <TableCell>
                                    {displayFloat(designer.currentDay.productFakeTotal)}
                                  </TableCell>
                                  <TableCell>{displayFloat(designer.tillNow.productFakeTotal)}</TableCell>
                                </TableRow>

                                <TableRow>
                                  <TableCell>店販抽成</TableCell>
                                  <TableCell>{displayFloat(designer.currentDay.productRake)}</TableCell>
                                  <TableCell>{displayFloat(designer.tillNow.productRake)}</TableCell>
                                </TableRow>

                                {(isMemberShipCardActive || (designer.tillNow.membershipFakeTotal !== 0 || designer.tillNow.membershipRake !== 0)) &&
                                  (
                                    <Fragment>
                                      <TableRow>
                                        <TableCell>會員卡業績</TableCell>
                                        <TableCell>{displayFloat(designer.currentDay.membershipFakeTotal)}</TableCell>
                                        <TableCell>{displayFloat(designer.tillNow.membershipFakeTotal)}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>會員卡抽成</TableCell>
                                        <TableCell>{displayFloat(designer.currentDay.membershipRake)}</TableCell>
                                        <TableCell>{displayFloat(designer.tillNow.membershipRake)}</TableCell>
                                      </TableRow>
                                    </Fragment>
                                  )
                                }
                                <TableRow>
                                  <TableCell>互助使用(不含點)</TableCell>
                                  <TableCell>{`${displayFloat(
                                    designer.currentDay.helperPaidPrice
                                  )}`}</TableCell>
                                  <TableCell>{`${displayFloat(
                                    designer.tillNow.helperPaidPrice
                                  )}`}</TableCell>
                                </TableRow>
                                {
                                  <TableRow>
                                    <TableCell>互助使用(點)</TableCell>
                                    <TableCell>{`${displayFloat(designer.currentDay.helperPaidPoint)}${isHelperPointPriceDisplay
                                      ? `/${Math.abs(
                                        displayFloat(designer.currentDay.helperPaidPriceFromPoint)
                                      )}`
                                      : ''
                                      }`}</TableCell>
                                    <TableCell>{`${displayFloat(designer.tillNow.helperPaidPoint)}${isHelperPointPriceDisplay
                                      ? `/${Math.abs(
                                        displayFloat(designer.tillNow.helperPaidPriceFromPoint)
                                      )}`
                                      : ''
                                      }`}</TableCell>
                                  </TableRow>
                                }
                                {dataVisible
                                  ? (!isHiddenZero ||
                                    ((designer.currentDay.helperRetrievePoint !== 0 ||
                                      designer.currentDay.helperRetrievePrice !== 0 ||
                                      designer.currentDay.helpGetNoPoint !== 0 ||
                                      designer.tillNow.helperRetrievePoint !== 0 ||
                                      designer.tillNow.helperRetrievePrice !== 0 ||
                                      designer.tillNow.helpGetNoPoint !== 0) &&
                                      isHiddenZero)) && (
                                    <Fragment>
                                      <TableRow>
                                        <TableCell>
                                          互助獲得金額 <br />
                                          (不含點)
                                        </TableCell>
                                        <TableCell>{designer.currentDay.helpGetNoPoint}</TableCell>
                                        <TableCell>{designer.tillNow.helpGetNoPoint}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell>
                                          互助獲得(點)
                                          <br />
                                          點數/換算金額
                                        </TableCell>
                                        <TableCell>
                                          {`${displayFloat(designer.currentDay.helperRetrievePoint)}` +
                                            '/' +
                                            designer.currentDay.helperRetrievePrice}
                                        </TableCell>
                                        <TableCell>
                                          {`${displayFloat(designer.tillNow.helperRetrievePoint)}` +
                                            '/' +
                                            designer.tillNow.helperRetrievePrice}
                                        </TableCell>
                                      </TableRow>
                                    </Fragment>
                                  )
                                  : (!isHiddenZero ||
                                    ((designer.currentDay.helperRetrievePoint !== 0 ||
                                      designer.tillNow.helperRetrievePoint !== 0) &&
                                      isHiddenZero)) && (
                                    <TableRow>
                                      <TableCell>互助獲得</TableCell>
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
                                      <TableCell>總客數</TableCell>
                                      <TableCell>{designer.currentDay.orderTotalCount}</TableCell>
                                      <TableCell>{designer.tillNow.orderTotalCount}</TableCell>
                                    </TableRow>
                                  )}
                                {(!isHiddenZero ||
                                  ((designer.currentDay.designateOrderCount !== 0 ||
                                    designer.tillNow.designateOrderCount !== 0) &&
                                    isHiddenZero)) && (
                                    <TableRow>
                                      <TableCell>指定客</TableCell>
                                      <TableCell>{designer.currentDay.designateOrderCount}</TableCell>
                                      <TableCell>{designer.tillNow.designateOrderCount}</TableCell>
                                    </TableRow>
                                  )}
                                {(!isHiddenZero ||
                                  ((designer.currentDay.nonDesignateOrderCount !== 0 ||
                                    designer.tillNow.nonDesignateOrderCount !== 0) &&
                                    isHiddenZero)) && (
                                    <TableRow>
                                      <TableCell>不指定客</TableCell>
                                      <TableCell>{designer.currentDay.nonDesignateOrderCount}</TableCell>
                                      <TableCell>{designer.tillNow.nonDesignateOrderCount}</TableCell>
                                    </TableRow>
                                  )}
                                {(!isHiddenZero ||
                                  ((designer.currentDay.orderAveragePrice !== 0 ||
                                    designer.tillNow.orderAveragePrice !== 0) &&
                                    isHiddenZero)) &&
                                  (isMathRound ? (
                                    <TableRow>
                                      <TableCell>客單價</TableCell>
                                      <TableCell>
                                        {Math.round(
                                          designer.currentDay.performanceFakeTotal /
                                          designer.currentDay.orderTotalCount
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {Math.round(
                                          designer.tillNow.performanceFakeTotal /
                                          designer.tillNow.orderTotalCount
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    <TableRow>
                                      <TableCell>客單價</TableCell>
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
                                  ))}
                                {(!isHiddenZero ||
                                  ((designer.currentDay.orderTypeCount !== 0 ||
                                    designer.tillNow.orderTypeCount !== 0) &&
                                    isHiddenZero)) && (
                                    <TableRow>
                                      <TableCell>客項次(服務)</TableCell>
                                      <TableCell>{designer.currentDay.orderTypeCount}</TableCell>
                                      <TableCell>{designer.tillNow.orderTypeCount}</TableCell>
                                    </TableRow>
                                  )}
                                {(!isHiddenZero ||
                                  ((designer.currentDay.orderTypeAveragePrice !== 0 ||
                                    designer.tillNow.orderTypeAveragePrice !== 0) &&
                                    isHiddenZero)) &&
                                  (isMathRound ? (
                                    <TableRow>
                                      <TableCell>平均項次單價</TableCell>
                                      <TableCell>
                                        {Math.round(
                                          designer.currentDay.performanceFakeTotal /
                                          designer.currentDay.orderTypeCount
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {Math.round(
                                          designer.tillNow.performanceFakeTotal /
                                          designer.tillNow.orderTypeCount
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    <TableRow>
                                      <TableCell>平均項次單價</TableCell>
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
                                  ))}
                                {(!isHiddenZero ||
                                  ((designer.currentDay.walletDeposit !== 0 ||
                                    designer.tillNow.walletDeposit !== 0) &&
                                    isHiddenZero)) && (
                                    <TableRow>
                                      <TableCell>入金儲值</TableCell>
                                      <TableCell>{displayFloat(designer.currentDay.walletDeposit)}</TableCell>
                                      <TableCell>{displayFloat(designer.tillNow.walletDeposit)}</TableCell>
                                    </TableRow>
                                  )}
                              </TableBody>
                            </Table>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })
            }
          </div>
        )
      })}
    </Fragment>
  )
}

Results.propTypes = {
  className: PropTypes.string,
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
