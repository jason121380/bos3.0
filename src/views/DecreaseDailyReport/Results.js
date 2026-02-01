/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Grid,
} from '@mui/material'
import PropTypes from 'prop-types'
import { Fragment, useEffect, useState } from 'react'
import { format } from 'date-fns'
import _ from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  content: css({
    padding: 0,
  }),
  inner: css({
    // minWidth: 900,
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

function Results({ helperReport, titleDate, priceDisplayOnReport, isMemberShipCardActive, designerNameForReportTypeData, printMode }) {
  const [printData, setPrintData] = useState([])

  useEffect(() => {
    const data = _.cloneDeep(helperReport)
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
        <Grid item xs={12} md={6} lg={4} key={data.user.id} className="DecreaseDailyReportCard, noprint">
          <Card className="printObject">
            <CardHeader
              title={`${data.user.designerNo !== null && data.user.designerNo !== ''
                ? data.user.designerNo
                : ''
                } ${data.user.nickName !== null && data.user.nickName !== '' ? data.user.nickName : ''
                } ${data.user.name} ${format(new Date(titleDate), 'MM/dd/yyyy')} 互助報表`}
              css={styles.cardHeader}
            />
            <Divider />
            <CardContent css={styles.content}>
              <div>
                <TableContainer component={Paper}>
                  <Table css={styles.table} size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>項目</TableCell>
                        <TableCell>{designerNameForReportTypeData === 'NO' ? '#設' : '設計師'}</TableCell>
                        <TableCell>金額</TableCell>
                        <TableCell>點</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.helperRecord.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <a
                              target="_blank"
                              href={`/order/${record.orderId}`}
                              css={styles.orderNoLink}
                            >
                              #{record.orderNo}
                            </a>
                          </TableCell>
                          <TableCell style={{ whiteSpace: 'pre-line' }}>
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
                        <TableCell />
                        <TableCell />
                        <TableCell>{data.helperRecordPriceSummary}</TableCell>
                        <TableCell>{data.helperRecordPointSummary}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <TableContainer component={Paper}>
                  <Table css={styles.table} size="small" aria-label="a dense table">
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
                    css={styles.cardHeader}
                  />
                  <CardContent css={styles.content}>
                    <div>
                      <TableContainer component={Paper}>
                        <Table css={styles.table} size="small" aria-label="a dense table">
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
                                    css={styles.orderNoLink}
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
                        <Table css={styles.table} size="small" aria-label="a dense table">
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
