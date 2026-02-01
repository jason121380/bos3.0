/** @jsxImportSource @emotion/react */
import {
  Grid, CircularProgress, Table, TableBody, TableCell,
  TableHead, TableRow, Paper, TableContainer, Card,
  CardHeader, CardContent, Typography
} from "@mui/material"
import { Fragment } from 'react'
import { format } from 'date-fns'
import roundDecimal from './../../helper/roundDecimal.js'
import { css } from '@emotion/react'

const styles = {
  'root': {
    '& ::-webkit-scrollbar': {
      height: '8px'
    }
  },
  table: css({
    minWidth: 650,
  }),
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
          <CircularProgress sx={{ mt: 6 }} />
        ) : (
          compareData.length ? (
            <Grid spacing={2} container item>
              {compareData.map((rowData, i) => (
                <Grid key={i} className="MuiCard-root" xs={12 / compareData.length} item>
                  <Card sx={{ p: 2, gap: 2, display: 'flex', flexDirection: 'column' }}>
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
                            <TableContainer component={Paper}>
                              <Table css={styles.table} size="small" aria-label="a dense table">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>總業績</TableCell>
                                    <TableCell>總客數</TableCell>
                                    <TableCell>平均客單價</TableCell>
                                    <TableCell>指定數</TableCell>
                                    <TableCell>指定數%</TableCell>
                                    <TableCell>不指定數</TableCell>
                                    <TableCell>不指定%</TableCell>
                                    <TableCell>店販業績</TableCell>
                                    <TableCell>店販業績比%</TableCell>
                                    {isMemberShipCardActive && (
                                      <Fragment>
                                        <TableCell>會員卡業績</TableCell>
                                        <TableCell>會員卡業績比%</TableCell>
                                      </Fragment>
                                    )}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow hover key={index}>
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
                            </TableContainer>
                            <TableContainer component={Paper}>
                              <Table css={styles.table} size="small" aria-label="a dense table">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>項目</TableCell>
                                    <TableCell>客數</TableCell>
                                    <TableCell>客數比%</TableCell>
                                    <TableCell>指定數</TableCell>
                                    <TableCell>指定數%</TableCell>
                                    <TableCell>不指定數</TableCell>
                                    <TableCell>不指定數%</TableCell>
                                    <TableCell>單項業績</TableCell>
                                    <TableCell>業績比%</TableCell>
                                    <TableCell>平均單價</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {data.serviceTypeAnalyze.map((d, dIndex) => (
                                    <TableRow hover key={dIndex}>
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
                                  <TableRow hover>
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
                            </TableContainer>
                          </CardContent>
                        </Card>
                      </Grid>
                    )) : (
                      <Typography sx={{ mt: 6 }} align='center' variant="h3" component="div">
                        無資料
                      </Typography>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography sx={{ mt: 6 }} align='center' variant="h3" gutterBottom component="div">
              無資料
            </Typography>
          )
        )}
      </Grid>
    </Grid>
  )
}

export default Compare