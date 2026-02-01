/** @jsxImportSource @emotion/react */
import {
  Card,
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
import clsx from 'clsx'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    '& span': {
      fontFamily: ' "Roboto", "Helvetica", "Arial", sans-serif'
    }
  }),
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
    padding: '10px 0px',
  }),
  eachSlip: css({
    marginBottom: '20px',
  }),
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1px 4px !important',
    '& div': {
      width: '33%'
    }
  })
}

function Results({
  userSalaryReport, date, searchId, isDisplayFakePerformance, printStyle,
  detailDisplay, EPWDDisplay, payslipOptimization
}) {
  const [displayUser, setDisplayUser] = useState([])
  useEffect(() => {
    const userSearch = userSalaryReport.filter(data => data.userId === searchId)
    if (searchId != null) {
      setDisplayUser(userSearch)
    } else {
      setDisplayUser(userSalaryReport)
    }
  }, [searchId])
  return displayUser.map((user, index) => {
    if (user.decreaseItem.length > 0 || user.increaseItem.length > 0) {
      return (
        <Fragment key={index}>
          {index > 0 && <p
            className={clsx('merchantNamePrint', printStyle ? printStyle : 'SMALL')}
            style={{ display: 'flex', width: '100%', borderTop: '1px dashed black' }}
          ></p>}
          <Grid item xs={12} css={styles.eachSlip} className='EmployeePayslipTable'>
            <Card>
              <div css={styles.header} className='MuiCardHeader-root'>
                <div>
                  {detailDisplay && <div className="merchantNamePrint" style={{ width: '100%', fontWeight: 'normal' }}>{'列印時間： ' + format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}</div>}
                </div>
                <div className='MuiCardHeader-content' style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                  <span className='MuiTypography-h5 MuiTypography-root' style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {`${JSON.parse(localStorage.getItem('userMerchant')).name}  -  ${format(
                      date,
                      'yyyy/MM'
                    )} - ${user.name}`}
                  </span>
                </div>
                <div style={{ textAlign: 'end' }}>{EPWDDisplay ? `天數: ${user.workingDays}` : ''}</div>
              </div>
              <Divider />
              <TableContainer component={Paper} style={{ paddingBottom: '30px' }}>
                <Table css={styles.root} size="small" aria-label="a dense table">
                  <TableBody className='renderItem'>
                    {user.increaseItem.length > 0 ? (
                      user.increaseItem.map((item, i) => {
                        if (i % 6 === 0 && i != 0) {
                          return (
                            <Fragment key={`increaseItem-${i}`}>
                              <TableRow></TableRow>
                              <TableCell
                                style={{ fontWeight: 'bold', width: '100px' }}
                              >
                                <span className={clsx(payslipOptimization && 'nowrap')}>{item.itemName}</span>
                              </TableCell>
                              <TableCell className='price' style={{ width: '100px' }}>
                                {item.price}
                              </TableCell>
                            </Fragment>
                          )
                        } else {
                          return (
                            <Fragment key={`increaseItem-${i}`}>
                              <TableCell
                                style={{ fontWeight: 'bold', width: '100px' }}
                              >
                                <span className={clsx(payslipOptimization && 'nowrap')}>{item.itemName}</span>
                              </TableCell>
                              <TableCell className='price' style={{ width: '100px' }}>
                                {item.price}
                              </TableCell>
                            </Fragment>
                          )
                        }
                      })
                    ) : (
                      <TableCell></TableCell>
                    )}
                  </TableBody>
                  <TableBody>
                    <TableRow>
                      <br />
                    </TableRow>
                  </TableBody>
                  <TableBody className='renderItem'>
                    {user.decreaseItem.length > 0 ? (
                      user.decreaseItem.map((item, i) => {
                        if (i % 6 === 0 && i != 0) {
                          return (
                            <Fragment key={`decreaseItem-${i}`}>
                              <TableRow></TableRow>
                              <TableCell style={{ fontWeight: 'bold' }}>
                                <span className={clsx(payslipOptimization && 'nowrap')}>{item.itemName}</span>
                              </TableCell>
                              <TableCell className='price'>{item.price}</TableCell>
                            </Fragment>
                          )
                        } else {
                          return (
                            <Fragment key={`decreaseItem-${i}`}>
                              <TableCell style={{ fontWeight: 'bold' }}>
                                <span className={clsx(payslipOptimization && 'nowrap')}>{item.itemName}</span>
                              </TableCell>
                              <TableCell className='price'>{item.price}</TableCell>
                            </Fragment>
                          )
                        }
                      })
                    ) : (
                      <TableCell></TableCell>
                    )}
                  </TableBody>
                  <TableBody>
                    <TableRow>
                      <br />
                    </TableRow>
                  </TableBody>
                </Table>
                <Table>
                  <TableBody>
                    <TableRow style={{ textAlign: 'center' }}>
                      <TableCell style={{ fontWeight: 'bold' }}>
                        加項合計
                      </TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>
                        扣項合計
                      </TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>
                        實領薪資
                      </TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>
                        互助獲得(點)
                      </TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>
                        指定實業績
                      </TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>
                        不指定實業績
                      </TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>
                        特抽總業績
                      </TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>
                        總實業績
                      </TableCell>
                      {isDisplayFakePerformance && (
                        <Fragment>
                          <TableCell style={{ fontWeight: 'bold' }}>
                            總虛業績
                          </TableCell>
                          <TableCell style={{ fontWeight: 'bold' }}>
                            扣項-扣業績
                          </TableCell>
                          <TableCell style={{ fontWeight: 'bold' }}>
                            手續費-扣業績
                          </TableCell>
                        </Fragment>
                      )}
                      <TableCell className='tableRemark' style={{ fontWeight: 'bold' }}>
                        備註
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ textAlign: 'center' }}>
                      <TableCell>{user.increaseItem.reduce((a, b) => a + b.price, 0)}</TableCell>
                      <TableCell>{user.decreaseItem.reduce((a, b) => a + b.price, 0)}</TableCell>
                      <TableCell>{user.summary}</TableCell>
                      <TableCell>
                        {Math.round(user.helperPointRetrieve * 10) / 10}
                      </TableCell>
                      <TableCell>
                        {Math.round(user.designateTruthPerformance * 10) / 10}
                      </TableCell>
                      <TableCell>
                        {Math.round(user.nonDesignateTruthPerformance * 10) / 10}
                      </TableCell>
                      <TableCell>
                        {Math.round(user.specialTruthPerformance * 10) / 10}
                      </TableCell>
                      <TableCell>
                        {Math.round(user.truthPerformance * 10) / 10}
                      </TableCell>
                      {isDisplayFakePerformance && (
                        <Fragment>
                          <TableCell>
                            {Math.round(user.fakePerformanceTotal * 10) / 10}
                          </TableCell>
                          <TableCell>
                            {Math.round(user.performanceDecountItem * 10) / 10}
                          </TableCell>
                          <TableCell>
                            {Math.round(user.handlingFeeOnSales * 10) / 10}
                          </TableCell>
                        </Fragment>
                      )}
                      <TableCell className='tableRemark' style={{ whiteSpace: 'nowrap' }}>
                        {user.remark}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Fragment>
      )
    } else {
      return (
        <Fragment key={index}>
          {index > 0 && <p
            className={clsx('merchantNamePrint', printStyle ? printStyle : 'SMALL')}
            style={{ display: 'flex', width: '100%', borderTop: '1px dashed black' }}
          ></p>}
          <Grid item xs={12} css={styles.eachSlip} className='EmployeePayslipTable'>
            <Card>
              <div css={styles.header} className='MuiCardHeader-root'>
                <div>
                  {detailDisplay && <div className="merchantNamePrint" style={{ width: '100%', fontWeight: 'normal' }}>{'列印時間： ' + format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}</div>}
                </div>
                <div className='MuiCardHeader-content' style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                  <span className='MuiTypography-h5 MuiTypography-root' style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {`${JSON.parse(localStorage.getItem('userMerchant')).name}  -  ${format(
                      date,
                      'yyyy/MM'
                    )} - ${user.name}`}
                  </span>
                </div>
                <div style={{ textAlign: 'end' }}>天數: {user.workingDays}</div>
              </div>
              <Divider />
              <TableContainer component={Paper}>
                <Table css={styles.table} size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell>無加項</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>0</TableCell>
                    </TableRow>
                  </TableBody>
                  <TableHead>
                    <TableRow>
                      <TableCell>無扣項</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>0</TableCell>
                    </TableRow>
                  </TableBody>
                  <TableBody>
                    <TableRow>
                      <TableCell> </TableCell>
                    </TableRow>
                  </TableBody>
                  <TableHead>
                    <TableRow style={{ textAlign: 'center' }}>
                      <TableCell>實領薪資</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow style={{ textAlign: 'center' }}>
                      <TableCell>{0}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Fragment>
      )
    }
  })
}

Results.propTypes = {
  className: PropTypes.string,
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
