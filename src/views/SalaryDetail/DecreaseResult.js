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
            <CardTitle>扣項總覽</CardTitle>
            <span className="whitespace-nowrap text-label tabular-nums text-text-secondary">
              共 {pageSetting.totalCount} 筆資料, {pageSetting.pageOffset + 1}/{Math.ceil(pageSetting.totalCount / pageSetting.pageLimit)} 頁
            </span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
              <Table dense className="min-w-[2300px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>代號</TableHead>
                    <TableHead>姓名</TableHead>
                    <TableHead>職稱</TableHead>
                    <TableHead numeric>學費</TableHead>
                    <TableHead numeric>教育費</TableHead>
                    <TableHead numeric>旅遊基金</TableHead>
                    <TableHead numeric>儲蓄金</TableHead>
                    <TableHead numeric>福利金</TableHead>
                    <TableHead numeric>勞健費</TableHead>
                    <TableHead numeric>自購材料</TableHead>
                    <TableHead numeric>員工借支</TableHead>
                    <TableHead numeric>事病假</TableHead>
                    <TableHead numeric>違規扣款</TableHead>
                    <TableHead numeric>遲退未刷</TableHead>
                    <TableHead numeric>未達扣款</TableHead>
                    <TableHead numeric>贈品扣款</TableHead>
                    <TableHead numeric>管理處用具</TableHead>
                    <TableHead numeric>互助扣款</TableHead>
                    <TableHead numeric>代墊款</TableHead>
                    <TableHead numeric>宿舍費用</TableHead>
                    <TableHead numeric>信用卡手續費</TableHead>
                    <TableHead numeric>薪資欠款</TableHead>
                    <TableHead numeric>顧客欠單</TableHead>
                    <TableHead numeric>曠職扣款</TableHead>
                    <TableHead numeric>減項合計</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(data => (
                    <TableRow key={data.id}>
                      <TableCell>{data.designerNo}</TableCell>
                      <TableCell>{data.name}</TableCell>
                      <TableCell>{data.jobTitle}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.tuition)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.educationFee)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.tourismFund)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.savings)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.welfare)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.laborHealthPremium)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.selfPurchasedMaterials)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.employeeLoan)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.deductionForSickLeave)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.illegalCharge)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.lateRetreat)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.DeductionOfLiabilityDue)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.giftdeduction)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.managementOfficeEquipment)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.mutualDeduction)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.advances)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.dormitoryCosts)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.creditCardFee)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.salaryArrears)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.customerArrears)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salary.derelictionOfDuty)}</TableCell>
                      <TableCell numeric>
                        {formatNumber(data.salary.tuition +
                          data.salary.educationFee +
                          data.salary.tourismFund +
                          data.salary.savings +
                          data.salary.welfare +
                          data.salary.laborHealthPremium +
                          data.salary.selfPurchasedMaterials +
                          data.salary.employeeLoan +
                          data.salary.deductionForSickLeave +
                          data.salary.illegalCharge +
                          data.salary.lateRetreat +
                          data.salary.DeductionOfLiabilityDue +
                          data.salary.giftdeduction +
                          data.salary.managementOfficeEquipment +
                          data.salary.mutualDeduction +
                          data.salary.advances +
                          data.salary.dormitoryCosts +
                          data.salary.creditCardFee +
                          data.salary.salaryArrears +
                          data.salary.customerArrears +
                          data.salary.derelictionOfDuty)}
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow className="bg-surface font-medium hover:bg-surface">
                    <TableCell>合 計:</TableCell>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce((total, data) => (total = total + data.salary.tuition), 0))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce((total, data) => (total = total + data.salary.educationFee), 0))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce((total, data) => (total = total + data.salary.tourismFund), 0))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce((total, data) => (total = total + data.salary.savings), 0))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce((total, data) => (total = total + data.salary.welfare), 0))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, data) => (total = total + data.salary.laborHealthPremium),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, data) => (total = total + data.salary.selfPurchasedMaterials),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce((total, data) => (total = total + data.salary.employeeLoan), 0))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, data) => (total = total + data.salary.deductionForSickLeave),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, data) => (total = total + data.salary.illegalCharge),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce((total, data) => (total = total + data.salary.lateRetreat), 0))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, data) => (total = total + data.salary.DeductionOfLiabilityDue),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, data) => (total = total + data.salary.giftdeduction),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, data) => (total = total + data.salary.managementOfficeEquipment),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, data) => (total = total + data.salary.mutualDeduction),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce((total, data) => (total = total + data.salary.advances), 0))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, data) => (total = total + data.salary.dormitoryCosts),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, data) => (total = total + data.salary.creditCardFee),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, data) => (total = total + data.salary.salaryArrears),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, data) => (total = total + data.salary.customerArrears),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, data) => (total = total + data.salary.derelictionOfDuty),
                        0
                      ))}
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(users.reduce(
                        (total, data) =>
                        (total =
                          total +
                          data.salary.tuition +
                          data.salary.educationFee +
                          data.salary.tourismFund +
                          data.salary.savings +
                          data.salary.welfare +
                          data.salary.laborHealthPremium +
                          data.salary.selfPurchasedMaterials +
                          data.salary.employeeLoan +
                          data.salary.deductionForSickLeave +
                          data.salary.illegalCharge +
                          data.salary.lateRetreat +
                          data.salary.DeductionOfLiabilityDue +
                          data.salary.giftdeduction +
                          data.salary.managementOfficeEquipment +
                          data.salary.mutualDeduction +
                          data.salary.advances +
                          data.salary.dormitoryCosts +
                          data.salary.creditCardFee +
                          data.salary.salaryArrears +
                          data.salary.customerArrears +
                          data.salary.derelictionOfDuty),
                        0
                      ))}
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
