/** @jsxImportSource @emotion/react */
import { Typography } from 'ui/display-compat'
import { Grid } from 'ui/grid-compat'
import { Card, CardHeader, CardContent } from 'ui/card-compat'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table'
import { Fragment } from 'react'
import { format } from 'date-fns'
import roundDecimal from './../../helper/roundDecimal.js'
import { css } from '@emotion/react'
import { LoaderCircle } from 'lucide-react'

const styles = {
  'root': {
    '& ::-webkit-scrollbar': {
      height: '8px'
    }
  },
  designerName: css({
    fontWeight: 'bold',
  }),
  medals: css({
    fontSize: '19px',
  }),
}
const Compare = ({ compareData, loading, isMemberShipCardActive, compareInputData }) => {
  return (
    <Grid css={styles.root} container style={{ marginTop: 24 }}>
      <Grid container justifyContent='center' item>
        {loading ? (
          <LoaderCircle className="mt-12 h-10 w-10 animate-spin text-accent" strokeWidth={1.75} />
        ) : (
          compareData.length ? (
            <Grid spacing={2} container item>
              {compareData.map((rowData, i) => (
                <Grid key={i} className="MuiCard-root" xs={12 / compareData.length} item>
                  <Card className="flex flex-col gap-4 p-4">
                    {rowData.length ? rowData.map((data, index) => (
                      <Grid item key={index} >
                        {index === 0 && <h3 style={{ textAlign: 'center', marginBottom: 6 }}>{i + 1}</h3>}
                        <Card className="printLongCard">
                          <CardHeader
                            title={`${data.merchantName}      ${format(compareInputData[i].dateRange.startDate, 'yyyy/MM/dd')}~ ${format(
                              compareInputData[i].dateRange.endDate,
                              'yyyy/MM/dd'
                            )}  ${data.designerName}`}
                          />
                          <CardContent style={{ padding: 0 }}>
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
                      </Grid>
                    )) : (
                      <Typography style={{ marginTop: 48 }} align='center' variant="h3" component="div">
                        無資料
                      </Typography>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography style={{ marginTop: 48 }} align='center' variant="h3" gutterBottom component="div">
              無資料
            </Typography>
          )
        )}
      </Grid>
    </Grid>
  )
}

export default Compare
