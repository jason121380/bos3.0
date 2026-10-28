import clsx from 'clsx'
import { Card, CardContent, CardHeader } from 'ui/card'

import { Table, TableBody, TableCell, TableHeader as TableHead, TableRow, TableHead as ReportTableHead } from 'ui/table'
// 螢幕與列印皆使用正式 ui 元件；列印樣式在使用端明確保留。
import { Card as UiCard, CardHeader as UiCardHeader, CardTitle as UiCardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import {
  Table as UiTable, TableBody as UiTableBody, TableCell as UiTableCell, TableHead as UiTableHead,
  TableHeader as UiTableHeader, TableRow as UiTableRow,
} from 'ui/table'
import PropTypes from 'prop-types'
import { Fragment, useEffect, useState } from 'react'
import { format } from 'date-fns'
import cloneDeep from 'lodash/cloneDeep'

const reportCellClass = 'h-auto px-4 py-2 text-left align-middle whitespace-pre-line text-[14px] leading-5'
const reportHeadClass = 'h-auto px-4 py-3 align-middle whitespace-pre text-[14px] leading-6 font-semibold text-black'

// 明確保留舊表格內距與列印框線，避免依賴相容層 class。
const reportTableClass = 'print:[&_td]:text-text text-[14px] leading-5 [&_tr]:border-0 [&_tr]:hover:bg-transparent [&_td]:border-0 [&_td]:[border-bottom:1px_solid_rgba(0,0,0,0.03)] [&_th]:border-0 [&_th]:[border-bottom:2px_solid_rgba(0,0,0,0.05)] print:[&_td]:!border-0 print:[&_th]:!border-0 print:[&_th]:bg-white print:[&_td]:![border-bottom:1px_solid_black] print:[&_th]:![border-bottom:1px_solid_black]'

function Results({ helperReport, titleDate, priceDisplayOnReport, isMemberShipCardActive, designerNameForReportTypeData, printMode }) {
  const [printData, setPrintData] = useState([])

  useEffect(() => {
    const data = cloneDeep(helperReport)
    let group = []
    const report = []
    data.forEach((d, index) => {
      group.push((d))
      if (group.length === 4) {
        report.push(group)
        group = []
      } else if (index === (data.length - 1)) {
        report.push(group)
        group = []
      }
    })
    setPrintData(report)
  }, [helperReport])
  return (
    <Fragment>
      {helperReport.map(data => (
        <div key={data.user.id} className="DecreaseDailyReportCard, noprint">
          {/* 螢幕顯示用卡片（外層 noprint，列印時隱藏）；列印輸出為下方 printData 區塊，以明確樣式維持原列印輸出 */}
          <UiCard className="printObject h-full">
            <UiCardHeader className="justify-center pb-4 text-center">
              <UiCardTitle>
                {`${data.user.designerNo !== null && data.user.designerNo !== ''
                  ? data.user.designerNo
                  : ''
                  } ${data.user.nickName !== null && data.user.nickName !== '' ? data.user.nickName : ''
                  } ${data.user.name} ${format(new Date(titleDate), 'MM/dd/yyyy')} 互助報表`}
              </UiCardTitle>
            </UiCardHeader>
            <div className="flex flex-col gap-4 px-5 pb-5">
              <UiTable dense aria-label="a dense table">
                <UiTableHeader>
                  <UiTableRow className="hover:bg-transparent">
                    <UiTableHead>#</UiTableHead>
                    <UiTableHead>項目</UiTableHead>
                    <UiTableHead>{designerNameForReportTypeData === 'NO' ? '#設' : '設計師'}</UiTableHead>
                    <UiTableHead numeric>金額</UiTableHead>
                    <UiTableHead numeric>點</UiTableHead>
                  </UiTableRow>
                </UiTableHeader>
                <UiTableBody>
                  {data.helperRecord.map((record, index) => (
                    <UiTableRow key={index}>
                      <UiTableCell className="tabular-nums">
                        <a
                          target="_blank"
                          href={`/order/${record.orderId}`}
                          className="text-accent underline"
                        >
                          #{record.orderNo}
                        </a>
                      </UiTableCell>
                      <UiTableCell className={reportCellClass}>
                        {record.itemName}
                      </UiTableCell>
                      <UiTableCell className={reportCellClass}>
                        {record.designer ? record.designer.nameForReport : ''}
                      </UiTableCell>
                      <UiTableCell numeric>{formatNumber(record.price === 0 && record.point !== 0 ? '' : record.price)}</UiTableCell>
                      <UiTableCell numeric>{formatNumber(record.point ? record.point : '')}</UiTableCell>
                    </UiTableRow>
                  ))}
                  <UiTableRow className="bg-surface">
                    <UiTableCell className="font-medium">合計</UiTableCell>
                    <UiTableCell />
                    <UiTableCell />
                    <UiTableCell numeric className="font-medium">{formatNumber(data.helperRecordPriceSummary)}</UiTableCell>
                    <UiTableCell numeric className="font-medium">{formatNumber(data.helperRecordPointSummary)}</UiTableCell>
                  </UiTableRow>
                </UiTableBody>
              </UiTable>
              <UiTable dense aria-label="a dense table">
                <UiTableHeader>
                  <UiTableRow className="hover:bg-transparent">
                    <UiTableHead></UiTableHead>
                    <UiTableHead numeric>日合計</UiTableHead>
                    <UiTableHead numeric>累計</UiTableHead>
                  </UiTableRow>
                </UiTableHeader>
                <UiTableBody>
                  <UiTableRow>
                    <UiTableCell>
                      互助獲得金額
                      <br />
                      (不含點)
                    </UiTableCell>
                    <UiTableCell numeric>{formatNumber(data.summaryCurrentDay.priceRetrieveWithoutPoint)}</UiTableCell>
                    <UiTableCell numeric>{formatNumber(data.summaryTillNow.priceRetrieveWithoutPoint)}</UiTableCell>
                  </UiTableRow>
                  {priceDisplayOnReport ? (
                    <UiTableRow>
                      <UiTableCell>
                        互助獲得(點)
                        <br />
                        點數/換算金額
                      </UiTableCell>
                      <UiTableCell numeric>
                        {`${formatNumber(data.summaryCurrentDay.point)}/${formatNumber(data.summaryCurrentDay.priceRetrieveFromPoint)}`}
                      </UiTableCell>
                      <UiTableCell numeric>
                        {`${formatNumber(data.summaryTillNow.point)}/${formatNumber(data.summaryTillNow.priceRetrieveFromPoint)}`}
                      </UiTableCell>
                    </UiTableRow>
                  ) : (
                    <UiTableRow>
                      <UiTableCell>互助獲得 - 點數</UiTableCell>
                      <UiTableCell numeric>{formatNumber(data.summaryCurrentDay.point)}</UiTableCell>
                      <UiTableCell numeric>{formatNumber(data.summaryTillNow.point)}</UiTableCell>
                    </UiTableRow>
                  )}
                  <UiTableRow>
                    <UiTableCell>店販業績</UiTableCell>
                    <UiTableCell numeric>{formatNumber(data.summaryCurrentDay.productPerformance)}</UiTableCell>
                    <UiTableCell numeric>{formatNumber(data.summaryTillNow.productPerformance)}</UiTableCell>
                  </UiTableRow>
                  <UiTableRow>
                    <UiTableCell>店販抽成</UiTableCell>
                    <UiTableCell numeric>{formatNumber(data.summaryCurrentDay.productRake)}</UiTableCell>
                    <UiTableCell numeric>{formatNumber(data.summaryTillNow.productRake)}</UiTableCell>
                  </UiTableRow>
                  {(isMemberShipCardActive ||
                    data.summaryTillNow.membershipPerformance !== 0 ||
                    data.summaryTillNow.membershipRake * 100 / 100 !== 0)
                    && (
                      <Fragment>
                        <UiTableRow>
                          <UiTableCell>會員卡業績</UiTableCell>
                          <UiTableCell numeric>{formatNumber(data.summaryCurrentDay.membershipPerformance)}</UiTableCell>
                          <UiTableCell numeric>{formatNumber(data.summaryTillNow.membershipPerformance)}</UiTableCell>
                        </UiTableRow>
                        <UiTableRow>
                          <UiTableCell>會員卡抽成</UiTableCell>
                          <UiTableCell numeric>{formatNumber(data.summaryCurrentDay.membershipRake)}</UiTableCell>
                          <UiTableCell numeric>{formatNumber(data.summaryTillNow.membershipRake)}</UiTableCell>
                        </UiTableRow>
                      </Fragment>
                    )}
                </UiTableBody>
              </UiTable>
            </div>
          </UiCard>
        </div>
      ))}
      {printData.map((datas, index) => {
        return (
          <div key={`printWrap-${index}`} className='DecreaseDailyReportCardPrintContainer'>
            {datas.map(data => (
              <div key={data.user.id} className="box-border DecreaseDailyReportCardPrint">
                <Card className="overflow-hidden text-text print:rounded-none print:shadow-none">
                  <CardHeader
                    className="print:border print:border-solid print:border-black print:border-b-0 !min-h-0 !items-center !gap-0 !px-4 !pb-2 !pt-4 [&>div]:flex-auto [&>div]:block text-center"
                  ><span className="block text-heading text-text">{`${data.user.designerNo !== null && data.user.designerNo !== ''
                      ? data.user.designerNo
                      : ''
                      } ${data.user.nickName !== null && data.user.nickName !== '' ? data.user.nickName : ''
                      } ${data.user.name} ${format(new Date(titleDate), 'MM/dd/yyyy')} 互助報表`}</span></CardHeader>
                  <CardContent className="last:pb-4 print:!pb-0 p-0">
                    <div>
                      <div className="ui-scroll-x w-full overflow-x-auto print:overflow-visible rounded-lg bg-background text-text print:rounded-none print:shadow-none">
                        <Table className={reportTableClass} aria-label="a dense table">
                          <TableHead className='DecreaseDailyReportCardTable'>
                            <TableRow>
                              <ReportTableHead className={reportHeadClass}>#</ReportTableHead>
                              <ReportTableHead className={clsx(reportHeadClass, printMode && 'itemPrint')}>項目</ReportTableHead>
                              <ReportTableHead className={reportHeadClass}>{designerNameForReportTypeData === 'NO' ? '#設' : '設計師'}</ReportTableHead>
                              <ReportTableHead className={reportHeadClass}>金額</ReportTableHead>
                              <ReportTableHead className={reportHeadClass}>點</ReportTableHead>
                            </TableRow>
                          </TableHead>
                          <TableBody className='DecreaseDailyReportCardTable'>
                            {data.helperRecord.map((record, index) => (
                              <TableRow key={index}>
                                <TableCell className={reportCellClass}>
                                  <a
                                    target="_blank"
                                    href={`/order/${record.orderId}`}
                                    className="underline text-[color:black]"
                                  >
                                    #{record.orderNo}
                                  </a>
                                </TableCell>
                                <TableCell className={clsx(reportCellClass, printMode && 'itemPrint')} style={{ whiteSpace: 'pre-line' }}>
                                  {record.itemName}
                                </TableCell>
                                <TableCell className={reportCellClass} style={{ whiteSpace: 'pre-line' }}>
                                  {record.designer ? record.designer.nameForReport : ''}
                                </TableCell>
                                <TableCell className={reportCellClass}>{record.price === 0 && record.point !== 0 ? '' : record.price}</TableCell>
                                <TableCell className={reportCellClass}>{record.point ? record.point : ''}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell className={reportCellClass} style={{ fontWeight: '500' }}>合計</TableCell>
                              <TableCell className={reportCellClass}></TableCell>
                              <TableCell className={reportCellClass}></TableCell>
                              <TableCell className={reportCellClass}>{data.helperRecordPriceSummary}</TableCell>
                              <TableCell className={reportCellClass}>{data.helperRecordPointSummary}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                      <div className="ui-scroll-x w-full overflow-x-auto print:overflow-visible rounded-lg bg-background text-text print:rounded-none print:shadow-none">
                        <Table className={reportTableClass} aria-label="a dense table">
                          <TableHead>
                            <TableRow>
                              <ReportTableHead className={reportHeadClass}></ReportTableHead>
                              <ReportTableHead className={reportHeadClass}>日合計</ReportTableHead>
                              <ReportTableHead className={reportHeadClass}>累計</ReportTableHead>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell className={reportCellClass}>
                                互助獲得金額
                                <br />
                                (不含點)
                              </TableCell>
                              <TableCell className={reportCellClass}>{data.summaryCurrentDay.priceRetrieveWithoutPoint}</TableCell>
                              <TableCell className={reportCellClass}>{data.summaryTillNow.priceRetrieveWithoutPoint}</TableCell>
                            </TableRow>
                            {priceDisplayOnReport ? (
                              <TableRow>
                                <TableCell className={reportCellClass}>
                                  互助獲得(點)
                                  <br />
                                  點數/換算金額
                                </TableCell>
                                <TableCell className={reportCellClass}>
                                  {`${data.summaryCurrentDay.point}/${data.summaryCurrentDay.priceRetrieveFromPoint}`}
                                </TableCell>
                                <TableCell className={reportCellClass}>
                                  {`${data.summaryTillNow.point}/${data.summaryTillNow.priceRetrieveFromPoint}`}
                                </TableCell>
                              </TableRow>
                            ) : (
                              <TableRow>
                                <TableCell className={reportCellClass}>互助獲得 - 點數</TableCell>
                                <TableCell className={reportCellClass}>{data.summaryCurrentDay.point}</TableCell>
                                <TableCell className={reportCellClass}>{data.summaryTillNow.point}</TableCell>
                              </TableRow>
                            )}
                            <TableRow>
                              <TableCell className={reportCellClass}>店販業績</TableCell>
                              <TableCell className={reportCellClass}>{data.summaryCurrentDay.productPerformance}</TableCell>
                              <TableCell className={reportCellClass}>{data.summaryTillNow.productPerformance}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className={reportCellClass}>店販抽成</TableCell>
                              <TableCell className={reportCellClass}>{data.summaryCurrentDay.productRake}</TableCell>
                              <TableCell className={reportCellClass}>{data.summaryTillNow.productRake}</TableCell>
                            </TableRow>
                            {(isMemberShipCardActive ||
                              data.summaryTillNow.membershipPerformance !== 0 ||
                              data.summaryTillNow.membershipRake * 100 / 100 !== 0)
                              && (
                                <Fragment>
                                  <TableRow>
                                    <TableCell className={reportCellClass}>會員卡業績</TableCell>
                                    <TableCell className={reportCellClass}>{data.summaryCurrentDay.membershipPerformance}</TableCell>
                                    <TableCell className={reportCellClass}>{data.summaryTillNow.membershipPerformance}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className={reportCellClass}>會員卡抽成</TableCell>
                                    <TableCell className={reportCellClass}>{data.summaryCurrentDay.membershipRake}</TableCell>
                                    <TableCell className={reportCellClass}>{data.summaryTillNow.membershipRake}</TableCell>
                                  </TableRow>
                                </Fragment>
                              )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )
      }
      )}
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
