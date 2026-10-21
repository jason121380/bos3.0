import { Grid } from 'ui/grid-compat'
import { Card, CardContent, CardHeader } from 'ui/card-compat'
import { Paper } from 'ui/display-compat'
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from 'ui/table-compat'
// 螢幕卡片改用 ui 元件（以 Ui 前綴命名，避免與列印區塊仍使用的 MUI 同名元件衝突）
// 列印區塊（printData／DecreaseDailyReportCardPrint）的 @media print 樣式依 MUI class 排版：改用輸出相同 DOM／class 的相容層（ui/*-compat）
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
          {/* 螢幕顯示用卡片（外層 noprint，列印時隱藏）；列印輸出為下方 printData 區塊，以相容層維持 MUI 的 DOM 與 class */}
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
                      <UiTableCell className="whitespace-pre-line">
                        {record.itemName}
                      </UiTableCell>
                      <UiTableCell className="whitespace-pre-line">
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
                        {`${data.summaryCurrentDay.point}/${data.summaryCurrentDay.priceRetrieveFromPoint}`}
                      </UiTableCell>
                      <UiTableCell numeric>
                        {`${data.summaryTillNow.point}/${data.summaryTillNow.priceRetrieveFromPoint}`}
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
              <Grid item key={data.user.id} className="DecreaseDailyReportCardPrint">
                <Card>
                  <CardHeader
                    title={`${data.user.designerNo !== null && data.user.designerNo !== ''
                      ? data.user.designerNo
                      : ''
                      } ${data.user.nickName !== null && data.user.nickName !== '' ? data.user.nickName : ''
                      } ${data.user.name} ${format(new Date(titleDate), 'MM/dd/yyyy')} 互助報表`}
                    className="text-center"
                  />
                  <CardContent className="p-0">
                    <div>
                      <TableContainer component={Paper}>
                        <Table size="small" aria-label="a dense table">
                          <TableHead className='DecreaseDailyReportCardTable'>
                            <TableRow>
                              <TableCell>#</TableCell>
                              <TableCell className={printMode ? "itemPrint" : ''}>項目</TableCell>
                              <TableCell>{designerNameForReportTypeData === 'NO' ? '#設' : '設計師'}</TableCell>
                              <TableCell>金額</TableCell>
                              <TableCell>點</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody className='DecreaseDailyReportCardTable'>
                            {data.helperRecord.map((record, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <a
                                    target="_blank"
                                    href={`/order/${record.orderId}`}
                                    className="underline text-[color:black]"
                                  >
                                    #{record.orderNo}
                                  </a>
                                </TableCell>
                                <TableCell className={printMode ? "itemPrint" : ''} style={{ whiteSpace: 'pre-line' }}>
                                  {record.itemName}
                                </TableCell>
                                <TableCell style={{ whiteSpace: 'pre-line' }}>
                                  {record.designer ? record.designer.nameForReport : ''}
                                </TableCell>
                                <TableCell>{record.price === 0 && record.point !== 0 ? '' : record.price}</TableCell>
                                <TableCell>{record.point ? record.point : ''}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell style={{ fontWeight: '500' }}>合計</TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                              <TableCell>{data.helperRecordPriceSummary}</TableCell>
                              <TableCell>{data.helperRecordPointSummary}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <TableContainer component={Paper}>
                        <Table size="small" aria-label="a dense table">
                          <TableHead>
                            <TableRow>
                              <TableCell></TableCell>
                              <TableCell>日合計</TableCell>
                              <TableCell>累計</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>
                                互助獲得金額
                                <br />
                                (不含點)
                              </TableCell>
                              <TableCell>{data.summaryCurrentDay.priceRetrieveWithoutPoint}</TableCell>
                              <TableCell>{data.summaryTillNow.priceRetrieveWithoutPoint}</TableCell>
                            </TableRow>
                            {priceDisplayOnReport ? (
                              <TableRow>
                                <TableCell>
                                  互助獲得(點)
                                  <br />
                                  點數/換算金額
                                </TableCell>
                                <TableCell>
                                  {`${data.summaryCurrentDay.point}/${data.summaryCurrentDay.priceRetrieveFromPoint}`}
                                </TableCell>
                                <TableCell>
                                  {`${data.summaryTillNow.point}/${data.summaryTillNow.priceRetrieveFromPoint}`}
                                </TableCell>
                              </TableRow>
                            ) : (
                              <TableRow>
                                <TableCell>互助獲得 - 點數</TableCell>
                                <TableCell>{data.summaryCurrentDay.point}</TableCell>
                                <TableCell>{data.summaryTillNow.point}</TableCell>
                              </TableRow>
                            )}
                            <TableRow>
                              <TableCell>店販業績</TableCell>
                              <TableCell>{data.summaryCurrentDay.productPerformance}</TableCell>
                              <TableCell>{data.summaryTillNow.productPerformance}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>店販抽成</TableCell>
                              <TableCell>{data.summaryCurrentDay.productRake}</TableCell>
                              <TableCell>{data.summaryTillNow.productRake}</TableCell>
                            </TableRow>
                            {(isMemberShipCardActive ||
                              data.summaryTillNow.membershipPerformance !== 0 ||
                              data.summaryTillNow.membershipRake * 100 / 100 !== 0)
                              && (
                                <Fragment>
                                  <TableRow>
                                    <TableCell>會員卡業績</TableCell>
                                    <TableCell>{data.summaryCurrentDay.membershipPerformance}</TableCell>
                                    <TableCell>{data.summaryTillNow.membershipPerformance}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>會員卡抽成</TableCell>
                                    <TableCell>{data.summaryCurrentDay.membershipRake}</TableCell>
                                    <TableCell>{data.summaryTillNow.membershipRake}</TableCell>
                                  </TableRow>
                                </Fragment>
                              )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
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
