import { Table, TableBody, TableCell, TableHeader as TableHead, TableRow, TableHead as ReportTableHead } from 'ui/table'

import { Card } from 'ui/card'
import PropTypes from 'prop-types'
import { Fragment, useEffect, useState } from 'react'
import { format } from 'date-fns'
import clsx from 'clsx'

const reportCellClass = 'h-auto px-4 py-2 text-left align-middle whitespace-pre-line text-[14px] leading-5'
const reportHeadClass = 'h-auto px-4 py-3 align-middle whitespace-pre text-[14px] leading-6 font-semibold text-black'
const payslipClass = 'box-border basis-[100%] max-w-[100%] grow-0 print:!mb-0 print:break-inside-avoid EmployeePayslipTable'

// 明確保留舊表格內距與列印框線，避免依賴相容層 class。
const reportTableClass =
  'print:[&_td]:text-text text-[14px] leading-5 [&_tr]:border-0 [&_tr]:hover:bg-transparent [&_td]:border-0 [&_td]:[border-bottom:1px_solid_rgba(0,0,0,0.03)] [&_th]:border-0 [&_th]:[border-bottom:2px_solid_rgba(0,0,0,0.05)] print:[&_td]:!border-0 print:[&_th]:!border-0 print:[&_th]:![border-bottom:2px_solid_rgba(0,0,0,0.05)] print:[&_th]:bg-white print:[&_td]:![border-bottom:.5px_solid_black]'

// 原 emotion localStyles 逐值轉 Tailwind（原 `!important` 以 `!` 前綴保留）。
// 薪資條的螢幕間距與列印間距分別明確指定。
const localStyles = {
  card: 'leading-[normal] rounded-[16px] [box-shadow:none] border border-solid border-[rgb(var(--border))] bg-[rgb(var(--background))] overflow-hidden',
  cardHeader: '!p-[12px_24px] flex justify-between items-center',
  tableCell: '!p-[2px_16px] !text-[14px] [border-bottom:1px_solid_rgb(var(--border))]',
  boldCell:
    '!p-[2px_16px] !text-[14px] !font-bold !text-[rgb(var(--accent))] [border-bottom:1px_solid_rgb(var(--border))] !bg-[rgba(26,115,232,0.05)]',
  itemLabel: '!p-[4px_16px] !font-bold w-[120px] [border-bottom:1px_solid_rgb(var(--border))] bg-[rgb(var(--background))]',
  itemValue: '!p-[4px_16px] w-[100px] [border-bottom:1px_solid_rgb(var(--border))] text-left',
  eachSlip: 'mb-6 print:!mb-0',
}

function Results({ userSalaryReport, date, searchId, isDisplayFakePerformance, printStyle, detailDisplay, EPWDDisplay, payslipOptimization }) {
  const [displayUser, setDisplayUser] = useState([])
  useEffect(() => {
    const userSearch = userSalaryReport.filter(data => data.userId === searchId)
    if (searchId != null) {
      setDisplayUser(userSearch)
    } else {
      setDisplayUser(userSalaryReport)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（userSalaryReport）；只在 [searchId] 變動時呼叫，補上會每次 render 重跑
  }, [searchId])
  return displayUser.map((user, index) => {
    if (user.decreaseItem.length > 0 || user.increaseItem.length > 0) {
      return (
        <Fragment key={index}>
          {index > 0 && (
            <p
              className={clsx('merchantNamePrint', printStyle ? printStyle : 'SMALL')}
              style={{ display: 'flex', width: '100%', borderTop: '1px dashed black' }}
            ></p>
          )}
          <div className={clsx(payslipClass, localStyles.eachSlip)}>
            <Card className={`overflow-hidden text-text print:rounded-none print:shadow-none ${localStyles.card}`}>
              <div className={localStyles.cardHeader}>
                <div style={{ width: '33%' }}>
                  {detailDisplay && (
                    <div className="merchantNamePrint" style={{ width: '100%', fontWeight: 'normal', fontSize: '12px' }}>
                      {'列印時間： ' + format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                  <span className="m-0 text-[16px] leading-6 font-bold flex items-center" style={{ whiteSpace: 'nowrap' }}>
                    {`${JSON.parse(localStorage.getItem('userMerchant')).name} - ${format(date, 'yyyy/MM')} - ${user.name}`}
                  </span>
                </div>
                <div style={{ textAlign: 'end', width: '33%', fontWeight: 'bold', color: 'rgb(var(--accent))' }}>
                  {EPWDDisplay ? `天數: ${user.workingDays}` : ''}
                </div>
              </div>
              <hr className="m-0 shrink-0 border-0 border-b border-solid border-border" />
              <div
                className="ui-scroll-x w-full overflow-x-auto print:!pb-[15px] rounded-lg bg-background text-text print:rounded-none print:shadow-none"
                style={{ paddingBottom: '12px' }}
              >
                <Table className={reportTableClass}>
                  <TableBody className="renderItem">
                    {user.increaseItem.length > 0 ? (
                      user.increaseItem.map((item, i) => {
                        if (i % 6 === 0 && i !== 0) {
                          return (
                            <Fragment key={`increaseItem-${i}`}>
                              <TableRow style={{ borderTop: '1px solid rgb(var(--border))' }}></TableRow>
                              <TableCell className={clsx(reportCellClass, localStyles.itemLabel)}>
                                <span className={clsx(payslipOptimization && 'nowrap')}>{item.itemName}</span>
                              </TableCell>
                              <TableCell className={clsx(reportCellClass, localStyles.itemValue)}>{item.price}</TableCell>
                            </Fragment>
                          )
                        } else {
                          return (
                            <Fragment key={`increaseItem-${i}`}>
                              <TableCell className={clsx(reportCellClass, localStyles.itemLabel)}>
                                <span className={clsx(payslipOptimization && 'nowrap')}>{item.itemName}</span>
                              </TableCell>
                              <TableCell className={clsx(reportCellClass, localStyles.itemValue)}>{item.price}</TableCell>
                            </Fragment>
                          )
                        }
                      })
                    ) : (
                      <TableCell className={clsx(reportCellClass, localStyles.itemLabel)}>無加項</TableCell>
                    )}
                  </TableBody>
                  <TableBody className="renderItem">
                    {user.decreaseItem.length > 0 ? (
                      user.decreaseItem.map((item, i) => {
                        if (i % 6 === 0 && i !== 0) {
                          return (
                            <Fragment key={`decreaseItem-${i}`}>
                              <TableRow style={{ borderTop: '1px solid rgb(var(--border))' }}></TableRow>
                              <TableCell className={clsx(reportCellClass, localStyles.itemLabel)}>
                                <span className={clsx(payslipOptimization && 'nowrap')}>{item.itemName}</span>
                              </TableCell>
                              <TableCell className={clsx(reportCellClass, localStyles.itemValue)}>{item.price}</TableCell>
                            </Fragment>
                          )
                        } else {
                          return (
                            <Fragment key={`decreaseItem-${i}`}>
                              <TableCell className={clsx(reportCellClass, localStyles.itemLabel)}>
                                <span className={clsx(payslipOptimization && 'nowrap')}>{item.itemName}</span>
                              </TableCell>
                              <TableCell className={clsx(reportCellClass, localStyles.itemValue)}>{item.price}</TableCell>
                            </Fragment>
                          )
                        }
                      })
                    ) : (
                      <TableCell className={clsx(reportCellClass, localStyles.itemLabel)}>無扣項</TableCell>
                    )}
                  </TableBody>
                </Table>
                <Table className={reportTableClass}>
                  <TableBody>
                    <TableRow style={{ textAlign: 'center' }}>
                      <TableCell className={clsx(reportCellClass, localStyles.boldCell)}>加項合計</TableCell>
                      <TableCell className={clsx(reportCellClass, localStyles.boldCell)}>扣項合計</TableCell>
                      <TableCell className={clsx(reportCellClass, localStyles.boldCell)}>實領薪資</TableCell>
                      <TableCell className={clsx(reportCellClass, localStyles.boldCell)}>互助獲得(點)</TableCell>
                      <TableCell className={clsx(reportCellClass, localStyles.boldCell)}>指定實業績</TableCell>
                      <TableCell className={clsx(reportCellClass, localStyles.boldCell)}>不指定實業績</TableCell>
                      <TableCell className={clsx(reportCellClass, localStyles.boldCell)}>特抽總業績</TableCell>
                      <TableCell className={clsx(reportCellClass, localStyles.boldCell)}>總實業績</TableCell>
                      {isDisplayFakePerformance && (
                        <Fragment>
                          <TableCell className={reportCellClass} style={{ fontWeight: 'bold' }}>
                            總虛業績
                          </TableCell>
                          <TableCell className={reportCellClass} style={{ fontWeight: 'bold' }}>
                            扣項-扣業績
                          </TableCell>
                          <TableCell className={reportCellClass} style={{ fontWeight: 'bold' }}>
                            手續費-扣業績
                          </TableCell>
                        </Fragment>
                      )}
                      <TableCell className={clsx(reportCellClass, 'tableRemark', localStyles.boldCell)}>備註</TableCell>
                    </TableRow>
                    <TableRow style={{ textAlign: 'center' }}>
                      <TableCell className={clsx(reportCellClass, localStyles.tableCell)}>
                        {user.increaseItem.reduce((a, b) => a + b.price, 0)}
                      </TableCell>
                      <TableCell className={clsx(reportCellClass, localStyles.tableCell)}>
                        {user.decreaseItem.reduce((a, b) => a + b.price, 0)}
                      </TableCell>
                      <TableCell className={clsx(reportCellClass, localStyles.tableCell)}>{user.summary}</TableCell>
                      <TableCell className={clsx(reportCellClass, localStyles.tableCell)}>{Math.round(user.helperPointRetrieve * 10) / 10}</TableCell>
                      <TableCell className={clsx(reportCellClass, localStyles.tableCell)}>
                        {Math.round(user.designateTruthPerformance * 10) / 10}
                      </TableCell>
                      <TableCell className={clsx(reportCellClass, localStyles.tableCell)}>
                        {Math.round(user.nonDesignateTruthPerformance * 10) / 10}
                      </TableCell>
                      <TableCell className={clsx(reportCellClass, localStyles.tableCell)}>
                        {Math.round(user.specialTruthPerformance * 10) / 10}
                      </TableCell>
                      <TableCell className={clsx(reportCellClass, localStyles.tableCell)}>{Math.round(user.truthPerformance * 10) / 10}</TableCell>
                      {isDisplayFakePerformance && (
                        <Fragment>
                          <TableCell className={clsx(reportCellClass, localStyles.tableCell)}>
                            {Math.round(user.fakePerformanceTotal * 10) / 10}
                          </TableCell>
                          <TableCell className={clsx(reportCellClass, localStyles.tableCell)}>
                            {Math.round(user.performanceDecountItem * 10) / 10}
                          </TableCell>
                          <TableCell className={clsx(reportCellClass, localStyles.tableCell)}>
                            {Math.round(user.handlingFeeOnSales * 10) / 10}
                          </TableCell>
                        </Fragment>
                      )}
                      <TableCell className={clsx(reportCellClass, 'tableRemark', localStyles.tableCell)} style={{ whiteSpace: 'nowrap' }}>
                        {user.remark}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </Fragment>
      )
    } else {
      return (
        <Fragment key={index}>
          {index > 0 && (
            <p
              className={clsx('merchantNamePrint', printStyle ? printStyle : 'SMALL')}
              style={{ display: 'flex', width: '100%', borderTop: '1px dashed black' }}
            ></p>
          )}
          <div className={clsx(payslipClass, localStyles.eachSlip)}>
            <Card className={`overflow-hidden text-text print:rounded-none print:shadow-none ${localStyles.card}`}>
              <div className={localStyles.cardHeader}>
                <div style={{ width: '33%' }}>
                  {detailDisplay && (
                    <div className="merchantNamePrint" style={{ width: '100%', fontWeight: 'normal', fontSize: '12px' }}>
                      {'列印時間： ' + format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                  <span className="m-0 text-[16px] leading-6 font-bold flex items-center" style={{ whiteSpace: 'nowrap' }}>
                    {`${JSON.parse(localStorage.getItem('userMerchant')).name} - ${format(date, 'yyyy/MM')} - ${user.name}`}
                  </span>
                </div>
                <div style={{ textAlign: 'end', width: '33%', fontWeight: 'bold', color: 'rgb(var(--accent))' }}>天數: {user.workingDays}</div>
              </div>
              <hr className="m-0 shrink-0 border-0 border-b border-solid border-border" />
              <div className="ui-scroll-x w-full overflow-x-auto print:!pb-[15px] rounded-lg bg-background text-text print:rounded-none print:shadow-none">
                <Table className={reportTableClass}>
                  <TableHead>
                    <TableRow>
                      <ReportTableHead className={reportHeadClass}>無加項</ReportTableHead>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell className={reportCellClass}>0</TableCell>
                    </TableRow>
                  </TableBody>
                  <TableHead>
                    <TableRow>
                      <ReportTableHead className={reportHeadClass}>無扣項</ReportTableHead>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell className={reportCellClass}>0</TableCell>
                    </TableRow>
                  </TableBody>
                  <TableBody>
                    <TableRow>
                      <TableCell className={reportCellClass}> </TableCell>
                    </TableRow>
                  </TableBody>
                  <TableHead>
                    <TableRow style={{ textAlign: 'center' }}>
                      <ReportTableHead className={reportHeadClass}>實領薪資</ReportTableHead>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow style={{ textAlign: 'center' }}>
                      <TableCell className={reportCellClass}>{0}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
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
