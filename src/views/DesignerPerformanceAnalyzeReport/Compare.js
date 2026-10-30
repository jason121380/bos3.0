import { Card, CardHeader, CardContent } from 'ui/card'
import { Card as UiCard } from 'ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table'
import { Fragment } from 'react'
import { format } from 'date-fns'
import roundDecimal from './../../helper/roundDecimal.js'
import { LoaderCircle } from 'lucide-react'

const Compare = ({ compareData, loading, isMemberShipCardActive, compareInputData }) => {
  return (
    <div className="flex w-full flex-wrap [&_::-webkit-scrollbar]:h-[8px]" style={{ marginTop: 24 }}>
      <div className="flex w-full flex-wrap justify-center">
        {loading ? (
          <LoaderCircle className="mt-12 h-10 w-10 animate-spin text-accent" strokeWidth={1.75} />
        ) : compareData.length ? (
          // 比較組數等分欄寬（原 Grid xs={12 / 組數}，所有寬度皆同欄數）、欄距 16px（原 spacing 2）
          <div className="grid w-full gap-4" style={{ gridTemplateColumns: `repeat(${compareData.length}, minmax(0, 1fr))` }}>
            {compareData.map((rowData, i) => (
              <div key={i} className="min-w-0">
                <UiCard className="flex flex-col gap-4 p-4">
                  {rowData.length ? (
                    rowData.map((data, index) => (
                      <div key={index}>
                        {index === 0 && <h3 style={{ textAlign: 'center', marginBottom: 6 }}>{i + 1}</h3>}
                        <Card className="printLongCard overflow-hidden text-text">
                          <CardHeader className="[&>div:first-child]:flex-auto !min-h-0 !items-center !gap-0 !px-4 !pb-2 !pt-4">
                            <span className="block text-heading text-text">{`${data.merchantName}      ${format(compareInputData[i].dateRange.startDate, 'yyyy/MM/dd')}~ ${format(
                              compareInputData[i].dateRange.endDate,
                              'yyyy/MM/dd'
                            )}  ${data.designerName}`}</span>
                          </CardHeader>
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
                                    <TableCell>{roundDecimal(d.currentOrderTypePerformancePercentage)}%</TableCell>
                                    <TableCell>{Math.round(d.currentOrderTypeAveragePrice)}</TableCell>
                                  </TableRow>
                                ))}
                                <TableRow>
                                  <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
                                  <TableCell>
                                    {Math.round(data.serviceTypeAnalyze.reduce((accu, curVal) => accu + curVal.orderTypeCount, 0))}
                                  </TableCell>
                                  <TableCell>N/A</TableCell>
                                  <TableCell>
                                    {Math.round(data.serviceTypeAnalyze.reduce((accu, curVal) => accu + curVal.orderTypeDesignateCount, 0))}
                                  </TableCell>
                                  <TableCell>
                                    {data.serviceTypeAnalyze.length > 0
                                      ? Math.round(
                                          (data.serviceTypeAnalyze.reduce((accu, curVal) => accu + curVal.orderTypeDesignateCount, 0) /
                                            data.serviceTypeAnalyze.reduce((accu, curVal) => accu + curVal.orderTypeCount, 0)) *
                                            10000
                                        ) /
                                          100 +
                                        '%'
                                      : 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    {Math.round(data.serviceTypeAnalyze.reduce((accu, curVal) => accu + curVal.orderTypeNonDesignateCount, 0))}
                                  </TableCell>
                                  <TableCell>
                                    {data.serviceTypeAnalyze.length > 0
                                      ? Math.round(
                                          (data.serviceTypeAnalyze.reduce((accu, curVal) => accu + curVal.orderTypeNonDesignateCount, 0) /
                                            data.serviceTypeAnalyze.reduce((accu, curVal) => accu + curVal.orderTypeCount, 0)) *
                                            10000
                                        ) /
                                          100 +
                                        '%'
                                      : 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    {Math.round(data.serviceTypeAnalyze.reduce((accu, curVal) => accu + curVal.currentOrderTypePerformance, 0))}
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
                    ))
                  ) : (
                    <div style={{ marginTop: 48 }} className="text-center text-title font-bold text-text">
                      無資料
                    </div>
                  )}
                </UiCard>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: 48 }} className="mb-[0.35em] text-center text-title font-bold text-text">
            無資料
          </div>
        )}
      </div>
    </div>
  )
}

export default Compare
