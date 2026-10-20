import clsx from 'clsx'
import GenericMoreButton from 'components/GenericMoreButton'
import TableEditBar from 'components/TableEditBar'
import PropTypes from 'prop-types'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TablePagination } from 'ui/table'

function Results({
  className = '',
  pageSetting,
  users,
  handleOnChangePage,
  handleOnChangeRowsPerPage,
  ...rest
}) {
  return (
    <div {...rest} className={className}>
      <Card>
        <CardHeader className="items-center pb-4" action={<GenericMoreButton />}>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <CardTitle>加項總覽</CardTitle>
            <span className="whitespace-nowrap text-label tabular-nums text-text-secondary">
              共 {users.length} 筆資料, {pageSetting.pageOffset + 1}/{Math.ceil(users.length / pageSetting.pageLimit)} 頁
            </span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
              <Table dense className="min-w-[2400px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>代號</TableHead>
                    <TableHead>姓名</TableHead>
                    <TableHead>職稱</TableHead>
                    <TableHead numeric>實發金額</TableHead>
                    <TableHead numeric>工資</TableHead>
                    <TableHead numeric>伙食津貼</TableHead>
                    <TableHead numeric>職務加給</TableHead>
                    <TableHead numeric>勞健保勞退</TableHead>
                    <TableHead numeric>全勤獎金</TableHead>
                    <TableHead numeric>售貨獎金</TableHead>
                    <TableHead numeric>業績抽成</TableHead>
                    <TableHead numeric>特殊抽成</TableHead>
                    <TableHead numeric>洗髮抽成</TableHead>
                    <TableHead numeric>護髮抽成</TableHead>
                    <TableHead numeric>燙染抽成</TableHead>
                    <TableHead numeric>其它抽成</TableHead>
                    <TableHead numeric>其他津貼</TableHead>
                    <TableHead numeric>獎勵金</TableHead>
                    <TableHead numeric>顧客還單</TableHead>
                    <TableHead numeric>績效抽成</TableHead>
                    <TableHead numeric>加項合計</TableHead>
                    <TableHead numeric>指定業績</TableHead>
                    <TableHead numeric>不指定業績</TableHead>
                    <TableHead numeric>點數</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(data => (
                    <TableRow key={data.id}>
                      <TableCell>{data.designerNo}</TableCell>
                      <TableCell>{data.name}</TableCell>
                      <TableCell>{data.jobTitle}</TableCell>
                      <TableCell numeric>
                        {formatNumber(data.salary.wage +
                          data.salary.mealAllowance +
                          data.salary.additionOfDuties +
                          data.salary.laborhealthInsurance +
                          data.salary.attendanceBonus +
                          data.salary.salesBonus +
                          data.salary.salesCommission +
                          data.salary.specialCommission +
                          data.salary.shampooCommission +
                          data.salary.hairCareCommission +
                          data.salary.hotDyeingCommission +
                          data.salary.otherCommission +
                          data.salary.otherAllowance +
                          data.salary.reward +
                          data.salary.customerReturn +
                          data.salary.performanceCommission +
                          data.salary.designateSales +
                          data.salary.notDesignateSales)}
                      </TableCell>
                      <TableCell numeric>{formatNumber(data.salary.wage)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.mealAllowance)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.additionOfDuties)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.laborhealthInsurance)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.attendanceBonus)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.salesBonus)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.salesCommission)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.specialCommission)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.shampooCommission)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.hairCareCommission)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.hotDyeingCommission)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.otherCommission)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.otherAllowance)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.reward)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.customerReturn)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.performanceCommission)}</TableCell>
                      <TableCell numeric>
                        {formatNumber(data.salary.wage +
                          data.salary.mealAllowance +
                          data.salary.additionOfDuties +
                          data.salary.laborhealthInsurance +
                          data.salary.attendanceBonus +
                          data.salary.salesBonus +
                          data.salary.salesCommission +
                          data.salary.specialCommission +
                          data.salary.shampooCommission +
                          data.salary.hairCareCommission +
                          data.salary.hotDyeingCommission +
                          data.salary.otherCommission +
                          data.salary.otherAllowance +
                          data.salary.reward +
                          data.salary.customerReturn +
                          data.salary.performanceCommission)}
                      </TableCell>
                      <TableCell numeric>{formatNumber(data.salary.designateSales)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.notDesignateSales)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.points)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-surface font-medium hover:bg-surface">
                    <TableCell>合 計:</TableCell>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, item) =>
                        (total =
                          total +
                          item.salary.wage +
                          item.salary.mealAllowance +
                          item.salary.additionOfDuties +
                          item.salary.laborhealthInsurance +
                          item.salary.attendanceBonus +
                          item.salary.salesBonus +
                          item.salary.salesCommission +
                          item.salary.specialCommission +
                          item.salary.shampooCommission +
                          item.salary.hairCareCommission +
                          item.salary.hotDyeingCommission +
                          item.salary.otherCommission +
                          item.salary.otherAllowance +
                          item.salary.reward +
                          item.salary.customerReturn +
                          item.salary.performanceCommission +
                          item.salary.designateSales +
                          item.salary.notDesignateSales),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce((total, item) => (total = total + item.salary.wage), 0))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, item) => (total = total + item.salary.mealAllowance),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, item) => (total = total + item.salary.additionOfDuties),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, item) => (total = total + item.salary.laborhealthInsurance),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, item) => (total = total + item.salary.attendanceBonus),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce((total, item) => (total = total + item.salary.salesBonus), 0))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, item) => (total = total + item.salary.salesCommission),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, item) => (total = total + item.salary.specialCommission),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, item) => (total = total + item.salary.shampooCommission),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, item) => (total = total + item.salary.hairCareCommission),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, item) => (total = total + item.salary.hotDyeingCommission),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, item) => (total = total + item.salary.otherCommission),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, item) => (total = total + item.salary.otherAllowance),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce((total, item) => (total = total + item.salary.reward), 0))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, item) => (total = total + item.salary.customerReturn),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, item) => (total = total + item.salary.performanceCommission),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, item) =>
                        (total =
                          total +
                          item.salary.wage +
                          item.salary.mealAllowance +
                          item.salary.additionOfDuties +
                          item.salary.laborhealthInsurance +
                          item.salary.attendanceBonus +
                          item.salary.salesBonus +
                          item.salary.salesCommission +
                          item.salary.specialCommission +
                          item.salary.shampooCommission +
                          item.salary.hairCareCommission +
                          item.salary.hotDyeingCommission +
                          item.salary.otherCommission +
                          item.salary.otherAllowance +
                          item.salary.reward +
                          item.salary.customerReturn +
                          item.salary.performanceCommission),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, item) => (total = total + item.salary.designateSales),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, item) => (total = total + item.salary.notDesignateSales),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce((total, item) => (total = total + item.salary.points), 0))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
          <TablePagination
            count={pageSetting.totalCount}
            onPageChange={handleOnChangePage}
            onRowsPerPageChange={handleOnChangeRowsPerPage}
            page={pageSetting.pageOffset}
            rowsPerPage={pageSetting.pageLimit}
            rowsPerPageOptions={[5, 10, 20, 25, 1000]}
          />
        </div>
      </Card>
      <TableEditBar />
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.string,
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
