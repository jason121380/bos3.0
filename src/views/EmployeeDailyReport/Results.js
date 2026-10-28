import { Card, CardContent, CardHeader } from 'ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import PropTypes from 'prop-types'
import { Fragment, useEffect, useState } from 'react'
import { format } from 'date-fns'
import cloneDeep from 'lodash/cloneDeep'
import idx from 'idx'
import useFetchGetIsDisplayHelperRetrieveInDailyReport from 'hooks/useFetchGetIsDisplayHelperRetrieveInDailyReport'
import useFetchGetIsUsingMathRoundInDesignerDailyReport from 'hooks/useFetchGetIsUsingMathRoundInDesignerDailyReport'
import { Card as UICard, CardHeader as UICardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'

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
      // 查詢失敗（data 為 undefined）時視為不顯示，不讓整頁拋錯
      setDataVisible(
        idx(getIsDisplayHelperRetrieveInDailyReport, _ => _.data.getIsDisplayHelperRetrieveInDailyReport)
      )
    }
  }, [getIsDisplayHelperRetrieveInDailyReport.loading])

  useEffect(() => {
    if (
      !mathRoundSetting.loading &&
      idx(mathRoundSetting, _ => _.data.getIsUsingMathRoundInDesignerDailyReport) === true
    ) {
      setIsMathRound(idx(mathRoundSetting, _ => _.data.getIsUsingMathRoundInDesignerDailyReport))
      const cloneData = cloneDeep(designerDailyReport)
      cloneData.forEach(data => {
        data.currentFakeSummary = Math.round(data.currentFakeSummary)
        data.currentTruthSummary = Math.round(data.currentTruthSummary)
        for (const i in data.tillNow) {
          data.tillNow[i] = Math.round(data.tillNow[i])
        }
        for (const i in data.currentDay) {
          data.currentDay[i] = Math.round(data.currentDay[i])
        }
        data.orderRecord.forEach(order => {
          order.fakePerformance = Math.round(order.fakePerformance)
          order.truthPerformance = Math.round(order.truthPerformance)
          order.truthPerformanceWithHelperUsage = Math.round(order.truthPerformanceWithHelperUsage)
        })
      })
      setMathRoundData(cloneData)

      const clonePrintData = cloneDeep(printData)
      clonePrintData.forEach(datas => {
        datas.forEach(data => {
          data.currentFakeSummary = Math.round(data.currentFakeSummary)
          data.currentTruthSummary = Math.round(data.currentTruthSummary)
          for (const i in data.tillNow) {
            data.tillNow[i] = Math.round(data.tillNow[i])
          }
          for (const i in data.currentDay) {
            data.currentDay[i] = Math.round(data.currentDay[i])
          }
          data.orderRecord.forEach(order => {
            order.fakePerformance = Math.round(order.fakePerformance)
            order.truthPerformance = Math.round(order.truthPerformance)
            order.truthPerformanceWithHelperUsage = Math.round(order.truthPerformanceWithHelperUsage)
          })
        })

      })
      setMathRoundPrintData(clonePrintData)
    }
    // 報表與列印分組換了（換日期；列印分組由頁面在本元件掛載後才算好）也要重算，否則列印區塊留著上一次的資料
  }, [mathRoundSetting.loading, designerDailyReport, printData])

  return (
    <Fragment>
      {(isMathRound ? mathRoundData : designerDailyReport).map((designer, index) => (
        <div key={designer.user.id + index} className="box-border pt-6 pl-6 basis-[100%] max-w-[100%] grow-0 min-[600px]:basis-[50%] min-[600px]:max-w-[50%] min-[600px]:grow-0 min-[900px]:basis-[33.33333333333333%] min-[900px]:max-w-[33.33333333333333%] min-[900px]:grow-0 EmployeeDailyReportCard, noprint">
          <UICard className="overflow-hidden">
            <UICardHeader className="justify-center pb-4 text-center">
              <CardTitle>
                {`${designer.user.designerNo !== null && designer.user.designerNo !== ''
                  ? designer.user.designerNo
                  : ''
                  } ${designer.user.nickName !== null && designer.user.nickName !== ''
                    ? designer.user.nickName
                    : ''
                  } ${designer.user.name} ${format(new Date(titleDate), 'yyyy/MM/dd')} 日報表 ${Number(designer.totalPageCount) !== 1
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
                    {Number(designer.currentPageOrder) !== 1 && (
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
                              className="underline text-text"
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
                            {formatNumber(displayFloat(orderRecord.fakePerformance))}
                          </TableCell>
                          <TableCell className="categoryPrint2">
                            {formatNumber(displayFloat(orderRecord.truthPerformance))}
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
                          <TableCell>{formatNumber(displayFloat(designer.currentFakeSummary))}</TableCell>
                        ) : (
                          <TableCell />
                        )}
                        <TableCell>{formatNumber(displayFloat(designer.currentTruthSummary))}</TableCell>
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
                                {formatNumber(displayFloat(designer.currentDay.performanceNonDesignateTruthTotal))}
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
                          <TableCell className="forPrint4">特殊抽成業績</TableCell>
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

                        {(isMemberShipCardActive || (designer.tillNow.membershipFakeTotal !== 0 || designer.tillNow.membershipRake !== 0)) &&
                          (
                            <Fragment>
                              <TableRow>
                                <TableCell className="forPrint4">會員卡業績</TableCell>
                                <TableCell>{formatNumber(displayFloat(designer.currentDay.membershipFakeTotal))}</TableCell>
                                <TableCell>{formatNumber(displayFloat(designer.tillNow.membershipFakeTotal))}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="forPrint4">會員卡抽成</TableCell>
                                <TableCell>{formatNumber(displayFloat(designer.currentDay.membershipRake))}</TableCell>
                                <TableCell>{formatNumber(displayFloat(designer.tillNow.membershipRake))}</TableCell>
                              </TableRow>
                            </Fragment>
                          )
                        }
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
                            <TableCell>{`${formatNumber(displayFloat(designer.currentDay.helperPaidPoint))}${isHelperPointPriceDisplay
                              ? `/${formatNumber(Math.abs(
                                displayFloat(designer.currentDay.helperPaidPriceFromPoint)
                              ))}`
                              : ''
                              }`}</TableCell>
                            <TableCell>{`${formatNumber(displayFloat(designer.tillNow.helperPaidPoint))}${isHelperPointPriceDisplay
                              ? `/${formatNumber(Math.abs(
                                displayFloat(designer.tillNow.helperPaidPriceFromPoint)
                              ))}`
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
                                <TableCell>{formatNumber(designer.currentDay.helpGetNoPoint)}</TableCell>
                                <TableCell>{formatNumber(designer.tillNow.helpGetNoPoint)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="forPrint4">
                                  互助獲得(點)
                                  <br />
                                  點數/換算金額
                                </TableCell>
                                <TableCell>
                                  {`${formatNumber(displayFloat(designer.currentDay.helperRetrievePoint))}` +
                                    '/' +
                                    designer.currentDay.helperRetrievePrice}
                                </TableCell>
                                <TableCell>
                                  {`${formatNumber(displayFloat(designer.tillNow.helperRetrievePoint))}` +
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
                            isHiddenZero)) &&
                          (isMathRound ? (
                            <TableRow>
                              <TableCell className="forPrint4">客單價</TableCell>
                              <TableCell>
                                {formatNumber(Math.round(
                                  designer.currentDay.performanceFakeTotal /
                                  designer.currentDay.orderTotalCount
                                ))}
                              </TableCell>
                              <TableCell>
                                {formatNumber(Math.round(
                                  designer.tillNow.performanceFakeTotal /
                                  designer.tillNow.orderTotalCount
                                ))}
                              </TableCell>
                            </TableRow>
                          ) : (
                            <TableRow>
                              <TableCell className="forPrint4">客單價</TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(
                                  designer.currentDay.performanceFakeTotal /
                                  designer.currentDay.orderTotalCount
                                ))}
                              </TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(
                                  designer.tillNow.performanceFakeTotal /
                                  designer.tillNow.orderTotalCount
                                ))}
                              </TableCell>
                            </TableRow>
                          ))}
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
                            isHiddenZero)) &&
                          (isMathRound ? (
                            <TableRow>
                              <TableCell className="forPrint4">平均項次單價</TableCell>
                              <TableCell>
                                {formatNumber(Math.round(
                                  designer.currentDay.performanceFakeTotal /
                                  designer.currentDay.orderTypeCount
                                ))}
                              </TableCell>
                              <TableCell>
                                {formatNumber(Math.round(
                                  designer.tillNow.performanceFakeTotal /
                                  designer.tillNow.orderTypeCount
                                ))}
                              </TableCell>
                            </TableRow>
                          ) : (
                            <TableRow>
                              <TableCell className="forPrint4">平均項次單價</TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(
                                  designer.currentDay.performanceFakeTotal /
                                  designer.currentDay.orderTypeCount
                                ))}
                              </TableCell>
                              <TableCell>
                                {formatNumber(displayFloat(
                                  designer.tillNow.performanceFakeTotal /
                                  designer.tillNow.orderTypeCount
                                ))}
                              </TableCell>
                            </TableRow>
                          ))}
                        {(!isHiddenZero ||
                          ((designer.currentDay.walletDeposit !== 0 ||
                            designer.tillNow.walletDeposit !== 0) &&
                            isHiddenZero)) && (
                            <TableRow>
                              <TableCell className="forPrint4">入金儲值</TableCell>
                              <TableCell>{formatNumber(displayFloat(designer.currentDay.walletDeposit))}</TableCell>
                              <TableCell>{formatNumber(displayFloat(designer.tillNow.walletDeposit))}</TableCell>
                            </TableRow>
                          )}
                      </TableBody>
                    </Table>
                )}
              </div>
            </div>
          </UICard>
        </div>
      ))}
      {(isMathRound ? mathRoundPrintData : printData).map((data, index) => {
        return (
          <div key={`printWrap-${index}`} className='EmployeeDailyReportCardPrintContainer'>
            {data.map((designer, index) => {
              return (
                <div key={`print-${designer.user.id}-${index}`} className="box-border pt-6 pl-6 basis-[100%] max-w-[100%] grow-0 min-[600px]:basis-[50%] min-[600px]:max-w-[50%] min-[600px]:grow-0 min-[900px]:basis-[33.33333333333333%] min-[900px]:max-w-[33.33333333333333%] min-[900px]:grow-0 EmployeeDailyReportCardPrint">
                  <Card className="overflow-hidden text-text print:rounded-none print:shadow-none">
                    <CardHeader
                      className="print:border print:border-solid print:border-black print:border-b-0 !min-h-0 !items-center !gap-0 !px-4 !pb-2 !pt-4 [&>div]:flex-auto [&>div]:block text-center"
                    ><span className="block text-heading text-text">{`${designer.user.designerNo !== null && designer.user.designerNo !== ''
                        ? designer.user.designerNo
                        : ''
                        } ${designer.user.nickName !== null && designer.user.nickName !== ''
                          ? designer.user.nickName
                          : ''
                        } ${designer.user.name} ${format(new Date(titleDate), 'MM/dd/yyyy')} 日報表 ${Number(designer.totalPageCount) !== 1
                          ? `- ${designer.currentPageOrder}/${designer.totalPageCount}`
                          : ''
                        }`}</span></CardHeader>
                    <CardContent className="last:pb-4 print:!pb-0 p-0">
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
                            {Number(designer.currentPageOrder) !== 1 && (
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
                                      className="underline text-[color:black]"
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
                </div>
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
