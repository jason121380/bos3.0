import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { format } from 'date-fns'
import MerchantSearchBar from 'components/MerchantSearchBar'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { formatNumber } from 'ui/format'
import { Skeleton } from 'ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function PaySlip({
  isDisplayFakePerformance,
  userPaySlip = [],
  setGetLastMonth,
  getSalaryReport,
  date,
  loading,
  EPWDDisplay,
  ...rest
}) {
  return (
    <div className="flex flex-col gap-4">
      <MerchantSearchBar
        values={date}
        onFilter={values => setGetLastMonth(values)}
        outside
        visible={['datePicker']}
        hideEndDate={true}
        onlyMonthYear={true}
        displayMonth={true}
      />
      {!loading ? (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="載入中">
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </div>
      ) : userPaySlip.length === 0 ? (
        <Card>
          <EmptyState title="無資料" />
        </Card>
      ) : (
        userPaySlip.map((user, key) => {
          if (user.decreaseItem.length > 0 || user.increaseItem.length > 0) {
            return (
              <Card key={key}>
                <div className="flex items-center justify-between gap-4 px-5 pt-5">
                  <CardTitle>
                    {`${JSON.parse(localStorage.getItem('userMerchant')).name}  -  ${format(
                      date.startDate,
                      'yyyy/MM'
                    )} - ${user.name}`}
                  </CardTitle>
                  <div className="text-label tabular-nums text-text-secondary">{EPWDDisplay ? `天數: ${user.workingDays}` : ''}</div>
                </div>
                <div className="flex flex-col gap-4 p-5">
                  <Table aria-label="a dense table">
                    <TableBody className='renderItem'>
                      {user.increaseItem.length > 0 ? (
                        user.increaseItem.map((item, i) => {
                          if (i % 6 === 0 && i !== 0) {
                            return (
                              <Fragment key={`increaseItem-${i}`}>
                                <TableRow></TableRow>
                                <TableCell className="w-[100px] font-medium text-text-secondary">
                                  {item.itemName}
                                </TableCell>
                                <TableCell numeric className='price w-[100px]'>
                                  {formatNumber(item.price)}
                                </TableCell>
                              </Fragment>
                            )
                          } else {
                            return (
                              <Fragment key={`increaseItem-${i}`}>
                                <TableCell className="w-[100px] font-medium text-text-secondary">
                                  {item.itemName}
                                </TableCell>
                                <TableCell numeric className='price w-[100px]'>
                                  {formatNumber(item.price)}
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
                          if (i % 6 === 0 && i !== 0) {
                            return (
                              <Fragment key={`decreaseItem-${i}`}>
                                <TableRow></TableRow>
                                <TableCell className="font-medium text-text-secondary">
                                  {item.itemName}
                                </TableCell>
                                <TableCell numeric className='price'>{formatNumber(item.price)}</TableCell>
                              </Fragment>
                            )
                          } else {
                            return (
                              <Fragment key={`decreaseItem-${i}`}>
                                <TableCell className="font-medium text-text-secondary">
                                  {item.itemName}
                                </TableCell>
                                <TableCell numeric className='price'>{formatNumber(item.price)}</TableCell>
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
                      <TableRow className="bg-surface text-center hover:bg-surface">
                        <TableCell className="text-label text-text-secondary">
                          加項合計
                        </TableCell>
                        <TableCell className="text-label text-text-secondary">
                          扣項合計
                        </TableCell>
                        <TableCell className="text-label text-text-secondary">
                          實領薪資
                        </TableCell>
                        <TableCell className="text-label text-text-secondary">
                          互助獲得(點)
                        </TableCell>
                        <TableCell className="text-label text-text-secondary">
                          指定實業績
                        </TableCell>
                        <TableCell className="text-label text-text-secondary">
                          不指定實業績
                        </TableCell>
                        <TableCell className="text-label text-text-secondary">
                          特抽總業績
                        </TableCell>
                        <TableCell className="text-label text-text-secondary">
                          總實業績
                        </TableCell>
                        {isDisplayFakePerformance && (
                          <Fragment>
                            <TableCell className="text-label text-text-secondary">
                              總虛業績
                            </TableCell>
                            <TableCell className="text-label text-text-secondary">
                              扣項-扣業績
                            </TableCell>
                            <TableCell className="text-label text-text-secondary">
                              手續費-扣業績
                            </TableCell>
                          </Fragment>
                        )}
                        <TableCell className='tableRemark text-label text-text-secondary'>
                          備註
                        </TableCell>
                      </TableRow>
                      <TableRow className="text-center tabular-nums">
                        <TableCell>{formatNumber(user.increaseItem.reduce((a, b) => a + b.price, 0))}</TableCell>
                        <TableCell>{formatNumber(user.decreaseItem.reduce((a, b) => a + b.price, 0))}</TableCell>
                        <TableCell>{formatNumber(user.summary)}</TableCell>
                        <TableCell>
                          {formatNumber(Math.round(user.helperPointRetrieve * 10) / 10)}
                        </TableCell>
                        <TableCell>
                          {formatNumber(Math.round(user.designateTruthPerformance * 10) / 10)}
                        </TableCell>
                        <TableCell>
                          {formatNumber(Math.round(user.nonDesignateTruthPerformance * 10) / 10)}
                        </TableCell>
                        <TableCell>
                          {formatNumber(Math.round(user.specialTruthPerformance * 10) / 10)}
                        </TableCell>
                        <TableCell>
                          {formatNumber(Math.round(user.truthPerformance * 10) / 10)}
                        </TableCell>
                        {isDisplayFakePerformance && (
                          <Fragment>
                            <TableCell>
                              {formatNumber(Math.round(user.fakePerformanceTotal * 10) / 10)}
                            </TableCell>
                            <TableCell>
                              {formatNumber(Math.round(user.performanceDecountItem * 10) / 10)}
                            </TableCell>
                            <TableCell>
                              {formatNumber(Math.round(user.handlingFeeOnSales * 10) / 10)}
                            </TableCell>
                          </Fragment>
                        )}
                        <TableCell className='tableRemark whitespace-nowrap'>
                          {user.remark}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )
          } else {
            return (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {`${JSON.parse(localStorage.getItem('userMerchant')).name} - ${format(
                      date,
                      'yyyy/MM'
                    )} - ${user.name}`}
                  </CardTitle>
                </CardHeader>
                <div className="p-5">
                  <Table aria-label="a dense table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>無加項</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>0</TableCell>
                      </TableRow>
                    </TableBody>
                    <TableHeader>
                      <TableRow>
                        <TableHead>無扣項</TableHead>
                      </TableRow>
                    </TableHeader>
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
                    <TableHeader>
                      <TableRow className="text-center">
                        <TableHead className="text-center">實領薪資</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="text-center">
                        <TableCell>{0}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )
          }
        })
      )}
    </div>
  )
}

PaySlip.propTypes = {
  className: PropTypes.string,
}

export default PaySlip
