import { Divider, Paper } from 'ui/display-compat'
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from 'ui/table-compat'
import { Grid } from 'ui/grid-compat'
import { Card, CardHeader } from 'ui/card-compat'
import PropTypes from 'prop-types'
import { Fragment, useEffect, useState } from 'react'
import { format } from 'date-fns'
import clsx from 'clsx'

// 原 emotion localStyles 逐值轉 Tailwind（原 `!important` 以 `!` 前綴保留）。
// 相容層 CSS（grid-compat 的 .MuiGrid-item { margin: 0 }）以單一 class 權重排在 Tailwind 之後，原本靠 emotion 後插入勝出；
// 這裡用 [&&]（雙 class 權重）讓 margin-bottom 仍蓋過相容層，列印時 initialize.scss 較高權重的規則照舊優先。
const localStyles = {
  card: 'rounded-[16px] [box-shadow:none] border border-solid border-[rgb(var(--border))] bg-[rgb(var(--background))] overflow-hidden',
  cardHeader: '!p-[12px_24px] flex justify-between items-center [&_.MuiTypography-h5]:text-[16px] [&_.MuiTypography-h5]:font-bold [&_.MuiTypography-h5]:flex [&_.MuiTypography-h5]:items-center',
  tableCell: '!p-[2px_16px] !text-[14px] [border-bottom:1px_solid_rgb(var(--border))]',
  boldCell: '!p-[2px_16px] !text-[14px] !font-bold !text-[rgb(var(--accent))] [border-bottom:1px_solid_rgb(var(--border))] !bg-[rgba(26,115,232,0.05)]',
  itemLabel: '!p-[4px_16px] !font-bold w-[120px] [border-bottom:1px_solid_rgb(var(--border))] bg-[rgb(var(--background))]',
  itemValue: '!p-[4px_16px] w-[100px] [border-bottom:1px_solid_rgb(var(--border))] text-left',
  eachSlip: '[&&]:mb-[24px]',
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
          <Grid item xs={12} className={`EmployeePayslipTable ${localStyles.eachSlip}`}>
            <Card className={localStyles.card}>
              <div className={localStyles.cardHeader}>
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
                <div style={{ textAlign: 'end', width: '33%', fontWeight: 'bold', color: 'rgb(var(--accent))' }}>{EPWDDisplay ? `天數: ${user.workingDays}` : ''}</div>
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
                              <TableRow style={{ borderTop: '1px solid rgb(var(--border))' }}></TableRow>
                              <TableCell className={localStyles.itemLabel}>
                                <span className={clsx(payslipOptimization && 'nowrap')}>{item.itemName}</span>
                              </TableCell>
                              <TableCell className={localStyles.itemValue}>
                                {item.price}
                              </TableCell>
                            </Fragment>
                          )
                        } else {
                          return (
                            <Fragment key={`increaseItem-${i}`}>
                              <TableCell className={localStyles.itemLabel}>
                                <span className={clsx(payslipOptimization && 'nowrap')}>{item.itemName}</span>
                              </TableCell>
                              <TableCell className={localStyles.itemValue}>
                                {item.price}
                              </TableCell>
                            </Fragment>
                          )
                        }
                      })
                    ) : (
                      <TableCell className={localStyles.itemLabel}>無加項</TableCell>
                    )}
                  </TableBody>
                  <TableBody className='renderItem'>
                    {user.decreaseItem.length > 0 ? (
                      user.decreaseItem.map((item, i) => {
                        if (i % 6 === 0 && i !== 0) {
                          return (
                            <Fragment key={`decreaseItem-${i}`}>
                              <TableRow style={{ borderTop: '1px solid rgb(var(--border))' }}></TableRow>
                              <TableCell className={localStyles.itemLabel}>
                                <span className={clsx(payslipOptimization && 'nowrap')}>{item.itemName}</span>
                              </TableCell>
                              <TableCell className={localStyles.itemValue}>{item.price}</TableCell>
                            </Fragment>
                          )
                        } else {
                          return (
                            <Fragment key={`decreaseItem-${i}`}>
                              <TableCell className={localStyles.itemLabel}>
                                <span className={clsx(payslipOptimization && 'nowrap')}>{item.itemName}</span>
                              </TableCell>
                              <TableCell className={localStyles.itemValue}>{item.price}</TableCell>
                            </Fragment>
                          )
                        }
                      })
                    ) : (
                      <TableCell className={localStyles.itemLabel}>無扣項</TableCell>
                    )}
                  </TableBody>
                </Table>
                <Table size="small">
                  <TableBody>
                    <TableRow style={{ textAlign: 'center' }}>
                      <TableCell className={localStyles.boldCell}>
                        加項合計
                      </TableCell>
                      <TableCell className={localStyles.boldCell}>
                        扣項合計
                      </TableCell>
                      <TableCell className={localStyles.boldCell}>
                        實領薪資
                      </TableCell>
                      <TableCell className={localStyles.boldCell}>
                        互助獲得(點)
                      </TableCell>
                      <TableCell className={localStyles.boldCell}>
                        指定實業績
                      </TableCell>
                      <TableCell className={localStyles.boldCell}>
                        不指定實業績
                      </TableCell>
                      <TableCell className={localStyles.boldCell}>
                        特抽總業績
                      </TableCell>
                      <TableCell className={localStyles.boldCell}>
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
                      <TableCell className={`tableRemark ${localStyles.boldCell}`}>
                        備註
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ textAlign: 'center' }}>
                      <TableCell className={localStyles.tableCell}>{user.increaseItem.reduce((a, b) => a + b.price, 0)}</TableCell>
                      <TableCell className={localStyles.tableCell}>{user.decreaseItem.reduce((a, b) => a + b.price, 0)}</TableCell>
                      <TableCell className={localStyles.tableCell}>{user.summary}</TableCell>
                      <TableCell className={localStyles.tableCell}>
                        {Math.round(user.helperPointRetrieve * 10) / 10}
                      </TableCell>
                      <TableCell className={localStyles.tableCell}>
                        {Math.round(user.designateTruthPerformance * 10) / 10}
                      </TableCell>
                      <TableCell className={localStyles.tableCell}>
                        {Math.round(user.nonDesignateTruthPerformance * 10) / 10}
                      </TableCell>
                      <TableCell className={localStyles.tableCell}>
                        {Math.round(user.specialTruthPerformance * 10) / 10}
                      </TableCell>
                      <TableCell className={localStyles.tableCell}>
                        {Math.round(user.truthPerformance * 10) / 10}
                      </TableCell>
                      {isDisplayFakePerformance && (
                        <Fragment>
                          <TableCell className={localStyles.tableCell}>
                            {Math.round(user.fakePerformanceTotal * 10) / 10}
                          </TableCell>
                          <TableCell className={localStyles.tableCell}>
                            {Math.round(user.performanceDecountItem * 10) / 10}
                          </TableCell>
                          <TableCell className={localStyles.tableCell}>
                            {Math.round(user.handlingFeeOnSales * 10) / 10}
                          </TableCell>
                        </Fragment>
                      )}
                      <TableCell className={`tableRemark ${localStyles.tableCell}`} style={{ whiteSpace: 'nowrap' }}>
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
          <Grid item xs={12} className={`EmployeePayslipTable ${localStyles.eachSlip}`}>
            <Card className={localStyles.card}>
              <div className={localStyles.cardHeader}>
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
                <div style={{ textAlign: 'end', width: '33%', fontWeight: 'bold', color: 'rgb(var(--accent))' }}>天數: {user.workingDays}</div>
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
