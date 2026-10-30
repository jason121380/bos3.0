// 正式卡片與 flex 外框：以明確列印樣式重現原框線、內距及避免卡片跨頁。
import { Card, CardHeader, CardContent } from 'ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { format } from 'date-fns'
import roundDecimal from './../../helper/roundDecimal.js'


function Results({ report, date, isMemberShipCardActive }) {
  return (
    <div style={{ marginTop: 0 }} className="DesignerPerforamnceAnalyzeReportPrint -ml-6 flex w-[calc(100%+24px)] flex-wrap print:!m-0 print:!block print:!w-full">
      {report.length ? report.map((data, index) => (
        <div className="DesignerPerforamnceAnalyzeReportTableContainer m-0 w-full pl-6 pt-6 print:!p-0" key={index}>
          <Card className="printLongCard overflow-hidden text-text print:rounded-none print:shadow-none print:break-inside-avoid print:mb-[30px] print:[&>div:first-child]:!border print:[&>div:first-child]:!border-b-0 print:[&>div:first-child]:!border-solid print:[&>div:first-child]:!border-black">
            <CardHeader className="[&>div:first-child]:flex-auto !min-h-0 !items-center !gap-0 !px-4 !pb-2 !pt-4"><span className="block text-heading text-text">{`${data.merchantName}      ${format(date.startDate, 'yyyy/MM/dd')}~ ${format(
                date.endDate,
                'yyyy/MM/dd'
              )}  ${data.designerName}`}</span></CardHeader>
            <CardContent className="last:pb-4" style={{ padding: 0 }}>
              <Table dense className="min-w-[650px]" aria-label="a dense table">
                <TableHeader>
                  <TableRow>
                    <TableHead>總業績</TableHead>
                    <TableHead>總客數</TableHead>
                    <TableHead>平均客單價</TableHead>
                    <TableHead>指定數</TableHead>
                    <TableHead>指定數%</TableHead>
                    <TableHead>不指定數</TableHead>
                    <TableHead>不指定%</TableHead>
                    <TableHead>店販業績</TableHead>
                    <TableHead>店販業績比%</TableHead>
                    {isMemberShipCardActive && (
                      <Fragment>
                        <TableHead>會員卡業績</TableHead>
                        <TableHead>會員卡業績比%</TableHead>
                      </Fragment>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow key={index}>
                    <TableCell>{Math.round(data.totalPerformance)}</TableCell>
                    <TableCell>{Math.round(data.totalOrderCount)}</TableCell>
                    <TableCell>{Math.round(data.orderAveragePrice)}</TableCell>
                    <TableCell>{Math.round(data.orderDesignateCount)}</TableCell>
                    <TableCell>{roundDecimal(data.orderDesignatePercentage)}%</TableCell>
                    <TableCell>{Math.round(data.orderNonDesignateCount)}</TableCell>
                    <TableCell>{roundDecimal(data.orderNonDesignatePercentage)}%</TableCell>
                    <TableCell>{Math.round(data.productPerformance)}</TableCell>
                    <TableCell>{roundDecimal(data.productPerformancePercentage)}%</TableCell>
                    {isMemberShipCardActive && (
                      <Fragment>
                        <TableCell>{Math.round(data.membershipPerformance)}</TableCell>
                        <TableCell>{roundDecimal(data.membershipPerformancePercentage)}%</TableCell>
                      </Fragment>
                    )}
                  </TableRow>
                </TableBody>
              </Table>
              <Table dense className="min-w-[650px]" aria-label="a dense table">
                <TableHeader>
                  <TableRow>
                    <TableHead>項目</TableHead>
                    <TableHead>客數</TableHead>
                    <TableHead>客數比%</TableHead>
                    <TableHead>指定數</TableHead>
                    <TableHead>指定數%</TableHead>
                    <TableHead>不指定數</TableHead>
                    <TableHead>不指定數%</TableHead>
                    <TableHead>單項業績</TableHead>
                    <TableHead>業績比%</TableHead>
                    <TableHead>平均單價</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.serviceTypeAnalyze.map((d, dIndex) => (
                    <TableRow key={dIndex}>
                      <TableCell>{d.typeName}</TableCell>
                      <TableCell>{Math.round(d.orderTypeCount)}</TableCell>
                      <TableCell>{roundDecimal(d.orderTypePercentage)}%</TableCell>
                      <TableCell>{Math.round(d.orderTypeDesignateCount)}</TableCell>
                      <TableCell>{roundDecimal(d.orderTypeDesignatePercentage)}%</TableCell>
                      <TableCell>{Math.round(d.orderTypeNonDesignateCount)}</TableCell>
                      <TableCell>{roundDecimal(d.orderTypeNonDesignatePercentage)}%</TableCell>
                      <TableCell>{Math.round(d.currentOrderTypePerformance)}</TableCell>
                      <TableCell>
                        {roundDecimal(d.currentOrderTypePerformancePercentage)}%
                      </TableCell>
                      <TableCell>{Math.round(d.currentOrderTypeAveragePrice)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
                    <TableCell>
                      {Math.round(
                        data.serviceTypeAnalyze.reduce((accu, curVal) => accu + curVal.orderTypeCount, 0)
                      )}
                    </TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell>
                      {Math.round(
                        data.serviceTypeAnalyze.reduce((accu, curVal) => accu + curVal.orderTypeDesignateCount, 0)
                      )}
                    </TableCell>
                    <TableCell>
                      {data.serviceTypeAnalyze.length > 0 ? (
                        Math.round(
                          (data.serviceTypeAnalyze.reduce((accu, curVal) => accu + curVal.orderTypeDesignateCount, 0) /
                            data.serviceTypeAnalyze.reduce((accu, curVal) => accu + curVal.orderTypeCount, 0)) *
                          10000) / 100 + '%'
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {Math.round(
                        data.serviceTypeAnalyze.reduce((accu, curVal) => accu + curVal.orderTypeNonDesignateCount, 0)
                      )}
                    </TableCell>
                    <TableCell>
                      {data.serviceTypeAnalyze.length > 0 ? (
                        Math.round(
                          (data.serviceTypeAnalyze.reduce((accu, curVal) => accu + curVal.orderTypeNonDesignateCount, 0) /
                            data.serviceTypeAnalyze.reduce((accu, curVal) => accu + curVal.orderTypeCount, 0)) *
                          10000) / 100 + '%'
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {Math.round(
                        data.serviceTypeAnalyze.reduce((accu, curVal) => accu + curVal.currentOrderTypePerformance, 0)
                      )}
                    </TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell>
                      {Math.round(
                        data.serviceTypeAnalyze.reduce((accu, curVal) => accu + curVal.currentOrderTypePerformance, 0) /
                        data.serviceTypeAnalyze.reduce((accu, curVal) => accu + curVal.orderTypeCount, 0)
                      ) || 'N/A'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )) : (
        <div className="m-0 pl-6 pt-6">
          <div className="mb-[0.35em] text-center text-title font-bold text-text">
            無資料
          </div>
        </div>

      )}
    </div>
  )
}

Results.propTypes = {
  report: PropTypes.array,
}

Results.defaultProps = {
  report: [],
}

export default Results
