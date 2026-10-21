import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { format } from 'date-fns'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { formatNumber } from 'ui/format'
import { Skeleton } from 'ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

// 加項／扣項以每列 6 組（名稱＋金額）排列，排列方式與舊版相同
const itemNameCell = 'w-[100px] font-medium'
const itemPriceCell = 'price w-[100px] tabular-nums'

function PaySlip({
  isDisplayFakePerformance,
  userPaySlip,
  setGetLastMonth,
  getLastMonth,
  isLoading,
  EPWDDisplay,
}) {
  return (
    <div className="flex flex-col gap-5">
      <MerchantSearchBar
        values={getLastMonth}
        onFilter={values => setGetLastMonth(values)}
        outside
        visible={['datePicker']}
        hideEndDate={true}
        onlyMonthYear={true}
        displayMonth={true}
      />
      {isLoading ?
        <Skeleton className="h-64 w-full" /> : userPaySlip !== undefined && userPaySlip.length > 0 ? (
          userPaySlip.map((user, key) => {
            if (user.decreaseItem.length > 0 || user.increaseItem.length > 0) {
              return (
                <Card key={key}>
                  <CardHeader
                    className="pb-4"
                    action={<span className="text-label tabular-nums text-text-secondary">{EPWDDisplay ? `天數: ${user.workingDays}` : ''}</span>}
                  >
                    <CardTitle>
                      {`${JSON.parse(localStorage.getItem('userMerchant')).name}  -  ${format(
                        getLastMonth.startDate,
                        'yyyy/MM'
                      )} - ${user.name}`}
                    </CardTitle>
                  </CardHeader>
                  <div className="flex flex-col gap-4 px-5 pb-5">
                    <Table aria-label="a dense table">
                      <TableBody className='renderItem'>
                        {user.increaseItem.length > 0 ? (
                          user.increaseItem.map((item, i) => {
                            if (i % 6 === 0 && i !== 0) {
                              return (
                                <Fragment key={`increaseItem-${i}`}>
                                  <TableRow></TableRow>
                                  <TableCell className={itemNameCell}>
                                    {item.itemName}
                                  </TableCell>
                                  <TableCell className={itemPriceCell}>
                                    {formatNumber(item.price)}
                                  </TableCell>
                                </Fragment>
                              )
                            } else {
                              return (
                                <Fragment key={`increaseItem-${i}`}>
                                  <TableCell className={itemNameCell}>
                                    {item.itemName}
                                  </TableCell>
                                  <TableCell className={itemPriceCell}>
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
                    </Table>
                    <Table>
                      <TableBody className='renderItem'>
                        {user.decreaseItem.length > 0 ? (
                          user.decreaseItem.map((item, i) => {
                            if (i % 6 === 0 && i !== 0) {
                              return (
                                <Fragment key={`decreaseItem-${i}`}>
                                  <TableRow></TableRow>
                                  <TableCell className="font-medium">
                                    {item.itemName}
                                  </TableCell>
                                  <TableCell className='price tabular-nums'>{formatNumber(item.price)}</TableCell>
                                </Fragment>
                              )
                            } else {
                              return (
                                <Fragment key={`decreaseItem-${i}`}>
                                  <TableCell className="font-medium">
                                    {item.itemName}
                                  </TableCell>
                                  <TableCell className='price tabular-nums'>{formatNumber(item.price)}</TableCell>
                                </Fragment>
                              )
                            }
                          })
                        ) : (
                          <TableCell></TableCell>
                        )}
                      </TableBody>
                    </Table>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead numeric>
                            加項合計
                          </TableHead>
                          <TableHead numeric>
                            扣項合計
                          </TableHead>
                          <TableHead numeric>
                            實領薪資
                          </TableHead>
                          <TableHead numeric>
                            互助獲得(點)
                          </TableHead>
                          <TableHead numeric>
                            指定實業績
                          </TableHead>
                          <TableHead numeric>
                            不指定實業績
                          </TableHead>
                          <TableHead numeric>
                            特抽總業績
                          </TableHead>
                          <TableHead numeric>
                            總實業績
                          </TableHead>
                          {isDisplayFakePerformance && (
                            <Fragment>
                              <TableHead numeric>
                                總虛業績
                              </TableHead>
                              <TableHead numeric>
                                扣項-扣業績
                              </TableHead>
                              <TableHead numeric>
                                手續費-扣業績
                              </TableHead>
                            </Fragment>
                          )}
                          <TableHead className='tableRemark'>
                            備註
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell numeric>{formatNumber(user.increaseItem.reduce((a, b) => a + b.price, 0))}</TableCell>
                          <TableCell numeric>{formatNumber(user.decreaseItem.reduce((a, b) => a + b.price, 0))}</TableCell>
                          <TableCell numeric className="font-medium">{formatNumber(user.summary)}</TableCell>
                          <TableCell numeric>
                            {formatNumber(Math.round(user.helperPointRetrieve * 10) / 10)}
                          </TableCell>
                          <TableCell numeric>
                            {formatNumber(Math.round(user.designateTruthPerformance * 10) / 10)}
                          </TableCell>
                          <TableCell numeric>
                            {formatNumber(Math.round(user.nonDesignateTruthPerformance * 10) / 10)}
                          </TableCell>
                          <TableCell numeric>
                            {formatNumber(Math.round(user.specialTruthPerformance * 10) / 10)}
                          </TableCell>
                          <TableCell numeric>
                            {formatNumber(Math.round(user.truthPerformance * 10) / 10)}
                          </TableCell>
                          {isDisplayFakePerformance && (
                            <Fragment>
                              <TableCell numeric>
                                {formatNumber(Math.round(user.fakePerformanceTotal * 10) / 10)}
                              </TableCell>
                              <TableCell numeric>
                                {formatNumber(Math.round(user.performanceDecountItem * 10) / 10)}
                              </TableCell>
                              <TableCell numeric>
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
                  <CardHeader className="pb-4">
                    <CardTitle>
                      {`${JSON.parse(localStorage.getItem('userMerchant')).name} - ${format(
                        getLastMonth.startDate,
                        'yyyy/MM'
                      )} - ${user.name}`}
                    </CardTitle>
                  </CardHeader>
                  <div className="px-5 pb-5">
                    <Table aria-label="a dense table">
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>無加項</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>0</TableCell>
                        </TableRow>
                      </TableBody>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>無扣項</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>0</TableCell>
                        </TableRow>
                      </TableBody>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>實領薪資</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">{0}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )
            }
          })
        ) : (
          <Card>
            <EmptyState title="無資料" />
          </Card>
        )}
    </div>
  )
}

PaySlip.propTypes = {
  className: PropTypes.string,
}

export default PaySlip
