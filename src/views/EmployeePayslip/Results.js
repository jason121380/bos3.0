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

const localStyles = {
  card: css({
    borderRadius: '16px',
    boxShadow: 'none',
    border: '1px solid #f0f0f0',
    backgroundColor: '#fff',
    overflow: 'hidden',
  }),
  cardHeader: css({
    padding: '12px 24px !important',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '& .MuiTypography-h5': {
      fontSize: '16px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      '&::before': {
        content: '""',
        display: 'inline-block',
        width: '4px',
        height: '16px',
        backgroundColor: '#1A73E8',
        marginRight: '8px',
        borderRadius: '2px',
      },
    },
  }),
  tableCell: css({
    padding: '2px 16px !important',
    fontSize: '14px !important',
    borderBottom: '1px solid #f0f0f0',
  }),
  boldCell: css({
    padding: '2px 16px !important',
    fontSize: '14px !important',
    fontWeight: 'bold !important',
    color: '#212121',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#f8f9fa',
  }),
  itemLabel: css({
    padding: '4px 16px !important',
    fontWeight: 'bold !important',
    width: '120px',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#fff',
  }),
  itemValue: css({
    padding: '4px 16px !important',
    width: '100px',
    borderBottom: '1px solid #f0f0f0',
    textAlign: 'left',
  }),
  eachSlip: css({
    marginBottom: '24px',
  }),
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
          <Grid item xs={12} css={localStyles.eachSlip} className='EmployeePayslipTable'>
            <Card css={localStyles.card}>
              <div css={localStyles.cardHeader}>
                <div style={{ width: '33%' }}>
                  {detailDisplay && <div className="merchantNamePrint" style={{ width: '100%', fontWeight: 'normal', fontSize: '12px' }}>{'列印時間： ' + format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}</div>}
                </div>
                <div className='MuiCardHeader-content' style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                  <span className='MuiTypography-h5 MuiTypography-root' style={{ whiteSpace: 'nowrap' }}>
                    {`${JSON.parse(localStorage.getItem('userMerchant')).name} - ${format(
                      date,
                      'yyyy/MM'
                    )} - ${user.name}`}
                  </span>
                </div>
                <div style={{ textAlign: 'end', width: '33%', fontWeight: 'bold', color: '#1A73E8' }}>{EPWDDisplay ? `天數: ${user.workingDays}` : ''}</div>
              </div>
              <Divider />
              <TableContainer style={{ paddingBottom: '12px' }}>
                <Table size="small">
                  <TableBody className='renderItem'>
                    {user.increaseItem.length > 0 ? (
                      user.increaseItem.map((item, i) => {
                        if (i % 6 === 0 && i !== 0) {
                          return (
                            <Fragment key={`increaseItem-${i}`}>
                              <TableRow style={{ borderTop: '1px solid #f0f0f0' }}></TableRow>
                              <TableCell css={localStyles.itemLabel}>
                                <span className={clsx(payslipOptimization && 'nowrap')}>{item.itemName}</span>
                              </TableCell>
                              <TableCell css={localStyles.itemValue}>
                                {item.price}
                              </TableCell>
                            </Fragment>
                          )
                        } else {
                          return (
                            <Fragment key={`increaseItem-${i}`}>
                              <TableCell css={localStyles.itemLabel}>
                                <span className={clsx(payslipOptimization && 'nowrap')}>{item.itemName}</span>
                              </TableCell>
                              <TableCell css={localStyles.itemValue}>
                                {item.price}
                              </TableCell>
                            </Fragment>
                          )
                        }
                      })
                    ) : (
                      <TableCell css={localStyles.itemLabel}>無加項</TableCell>
                    )}
                  </TableBody>
                  <TableBody className='renderItem'>
                    {user.decreaseItem.length > 0 ? (
                      user.decreaseItem.map((item, i) => {
                        if (i % 6 === 0 && i !== 0) {
                          return (
                            <Fragment key={`decreaseItem-${i}`}>
                              <TableRow style={{ borderTop: '1px solid #f0f0f0' }}></TableRow>
                              <TableCell css={localStyles.itemLabel}>
                                <span className={clsx(payslipOptimization && 'nowrap')}>{item.itemName}</span>
                              </TableCell>
                              <TableCell css={localStyles.itemValue}>{item.price}</TableCell>
                            </Fragment>
                          )
                        } else {
                          return (
                            <Fragment key={`decreaseItem-${i}`}>
                              <TableCell css={localStyles.itemLabel}>
                                <span className={clsx(payslipOptimization && 'nowrap')}>{item.itemName}</span>
                              </TableCell>
                              <TableCell css={localStyles.itemValue}>{item.price}</TableCell>
                            </Fragment>
                          )
                        }
                      })
                    ) : (
                      <TableCell css={localStyles.itemLabel}>無扣項</TableCell>
                    )}
                  </TableBody>
                </Table>
                <Table size="small">
                  <TableBody>
                    <TableRow style={{ textAlign: 'center' }}>
                      <TableCell css={localStyles.boldCell}>
                        加項合計
                      </TableCell>
                      <TableCell css={localStyles.boldCell}>
                        扣項合計
                      </TableCell>
                      <TableCell css={localStyles.boldCell}>
                        實領薪資
                      </TableCell>
                      <TableCell css={localStyles.boldCell}>
                        互助獲得(點)
                      </TableCell>
                      <TableCell css={localStyles.boldCell}>
                        指定實業績
                      </TableCell>
                      <TableCell css={localStyles.boldCell}>
                        不指定實業績
                      </TableCell>
                      <TableCell css={localStyles.boldCell}>
                        特抽總業績
                      </TableCell>
                      <TableCell css={localStyles.boldCell}>
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
                      <TableCell className='tableRemark' css={localStyles.boldCell}>
                        備註
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ textAlign: 'center' }}>
                      <TableCell css={localStyles.tableCell}>{user.increaseItem.reduce((a, b) => a + b.price, 0)}</TableCell>
                      <TableCell css={localStyles.tableCell}>{user.decreaseItem.reduce((a, b) => a + b.price, 0)}</TableCell>
                      <TableCell css={localStyles.tableCell}>{user.summary}</TableCell>
                      <TableCell css={localStyles.tableCell}>
                        {Math.round(user.helperPointRetrieve * 10) / 10}
                      </TableCell>
                      <TableCell css={localStyles.tableCell}>
                        {Math.round(user.designateTruthPerformance * 10) / 10}
                      </TableCell>
                      <TableCell css={localStyles.tableCell}>
                        {Math.round(user.nonDesignateTruthPerformance * 10) / 10}
                      </TableCell>
                      <TableCell css={localStyles.tableCell}>
                        {Math.round(user.specialTruthPerformance * 10) / 10}
                      </TableCell>
                      <TableCell css={localStyles.tableCell}>
                        {Math.round(user.truthPerformance * 10) / 10}
                      </TableCell>
                      {isDisplayFakePerformance && (
                        <Fragment>
                          <TableCell css={localStyles.tableCell}>
                            {Math.round(user.fakePerformanceTotal * 10) / 10}
                          </TableCell>
                          <TableCell css={localStyles.tableCell}>
                            {Math.round(user.performanceDecountItem * 10) / 10}
                          </TableCell>
                          <TableCell css={localStyles.tableCell}>
                            {Math.round(user.handlingFeeOnSales * 10) / 10}
                          </TableCell>
                        </Fragment>
                      )}
                      <TableCell className='tableRemark' css={localStyles.tableCell} style={{ whiteSpace: 'nowrap' }}>
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
          <Grid item xs={12} css={localStyles.eachSlip} className='EmployeePayslipTable'>
            <Card css={localStyles.card}>
              <div css={localStyles.cardHeader}>
                <div style={{ width: '33%' }}>
                  {detailDisplay && <div className="merchantNamePrint" style={{ width: '100%', fontWeight: 'normal', fontSize: '12px' }}>{'列印時間： ' + format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}</div>}
                </div>
                <div className='MuiCardHeader-content' style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                  <span className='MuiTypography-h5 MuiTypography-root' style={{ whiteSpace: 'nowrap' }}>
                    {`${JSON.parse(localStorage.getItem('userMerchant')).name} - ${format(
                      date,
                      'yyyy/MM'
                    )} - ${user.name}`}
                  </span>
                </div>
                <div style={{ textAlign: 'end', width: '33%', fontWeight: 'bold', color: '#1A73E8' }}>天數: {user.workingDays}</div>
              </div>
              <Divider />
              <TableContainer>
                <Table size="small">
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
