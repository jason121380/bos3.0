import GenericMoreButton from 'components/GenericMoreButton'
import { format } from 'date-fns'
import PropTypes from 'prop-types'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TablePagination } from 'ui/table'

function Results({
  className,
  orders,
  results,
  handleOnChangeRowsPerPage,
  handleOnChangePage,
  ...rest
}) {
  return (
    <div {...rest} className="flex flex-col gap-2">
      <span className="text-label text-text-secondary tabular-nums">
        共 {results.totalCount} 筆, {results.pageOffset + 1} /{' '}
        {Math.ceil(results.totalCount / results.pageLimit)}
      </span>
      <Card>
        <CardHeader className="items-center pb-4" action={<GenericMoreButton />}>
          <CardTitle>收支科目明細</CardTitle>
        </CardHeader>
        <div className="px-5 pb-5">
              <Table className="min-w-[7000px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>時間</TableHead>
                    <TableHead numeric>收入合計</TableHead>
                    <TableHead numeric>支出合計</TableHead>
                    <TableHead numeric>結餘合計</TableHead>
                    <TableHead numeric>材料貨款(員購)收入</TableHead>
                    <TableHead numeric>包套卡收入</TableHead>
                    <TableHead numeric>集點卡兌換</TableHead>
                    <TableHead numeric>顧客還單</TableHead>
                    <TableHead numeric>租金收入</TableHead>
                    <TableHead numeric>活動促銷贈品收入</TableHead>
                    <TableHead numeric>營業收入</TableHead>
                    <TableHead numeric>售貨收入</TableHead>
                    <TableHead numeric>入金卡收入</TableHead>
                    <TableHead numeric>其他收入</TableHead>
                    <TableHead numeric>髮券銷售</TableHead>
                    <TableHead numeric>信用卡手續費</TableHead>
                    <TableHead numeric>信用卡收入</TableHead>
                    <TableHead numeric>暫收款</TableHead>
                    <TableHead numeric>音樂視訊費用</TableHead>
                    <TableHead numeric>文具用品(匯影印)</TableHead>
                    <TableHead numeric>活動廣告費(印刷、廣告)</TableHead>
                    <TableHead numeric>折舊費(互助費)</TableHead>
                    <TableHead numeric>營業稅(稅捐)</TableHead>
                    <TableHead numeric>職工福利</TableHead>
                    <TableHead numeric>活動促銷贈品支出</TableHead>
                    <TableHead numeric>交通費</TableHead>
                    <TableHead numeric>交際費(公關)</TableHead>
                    <TableHead numeric>店用器材設備</TableHead>
                    <TableHead numeric>年度大項支出</TableHead>
                    <TableHead numeric>短溢金</TableHead>
                    <TableHead numeric>紅利支出</TableHead>
                    <TableHead numeric>信用卡手續費(支出)</TableHead>
                    <TableHead numeric>髮片支出</TableHead>
                    <TableHead numeric>入金卡使用</TableHead>
                    <TableHead numeric>信用卡使用</TableHead>
                    <TableHead numeric>暫付款</TableHead>
                    <TableHead numeric>包套卡支出</TableHead>
                    <TableHead numeric>客戶欠單</TableHead>
                    <TableHead numeric>現金禮券</TableHead>
                    <TableHead numeric>行政幹部薪資</TableHead>
                    <TableHead numeric>設計師薪資</TableHead>
                    <TableHead numeric>助理薪資</TableHead>
                    <TableHead numeric>業績獎金</TableHead>
                    <TableHead numeric>員工借支</TableHead>
                    <TableHead numeric>員工獎勵</TableHead>
                    <TableHead numeric>伙食費</TableHead>
                    <TableHead numeric>髮券使用</TableHead>
                    <TableHead numeric>房屋租金(租賃稅)</TableHead>
                    <TableHead numeric>勞健保勞退費</TableHead>
                    <TableHead numeric>教育訓練費</TableHead>
                    <TableHead numeric>總公司管理費</TableHead>
                    <TableHead numeric>材料貨款(員購)支出</TableHead>
                    <TableHead numeric>水費</TableHead>
                    <TableHead numeric>電費</TableHead>
                    <TableHead numeric>瓦斯費</TableHead>
                    <TableHead numeric>電話費(網路)</TableHead>
                    <TableHead numeric>修繕費</TableHead>
                    <TableHead numeric>店用耗材</TableHead>
                    <TableHead numeric>其他(雜項)支出</TableHead>
                    <TableHead numeric>清潔費用(毛巾清洗)</TableHead>
                    <TableHead numeric>書報雜誌費</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.data.map((data, index) => (
                    <TableRow key={`account-detail-${index}`}>
                      <TableCell className="tabular-nums">{format(new Date(data.date), 'yyyy/MM/dd')}</TableCell>
                      <TableCell numeric>
                        {formatNumber(data.materialPaymentIncome +
                          data.packageCardRevenue +
                          data.rendezvousCardExchange +
                          data.customerReturn +
                          data.rentalIncome +
                          data.eventPromotionGiftIncome +
                          data.operatingIncome +
                          data.salesRevenue +
                          data.depositCardIncome +
                          data.otherIncome +
                          data.voucherSales +
                          data.creditCardFees +
                          data.creditCardIncome +
                          data.temporaryCollection)}
                      </TableCell>
                      <TableCell numeric>
                        {formatNumber(data.musicVideoFee +
                          data.stationery +
                          data.eventAdvertisingCosts +
                          data.depreciationFee +
                          data.businessTax +
                          data.employeeBenefits +
                          data.eventPromotionGifts +
                          data.transportation +
                          data.communicationFees +
                          data.shopEquipment +
                          data.annualMajorExpenditure +
                          data.shortPremium +
                          data.dividendPayout +
                          data.creditCardFee +
                          data.filmingExpenditure +
                          data.depositCardUse +
                          data.creditCardUse +
                          data.provisionalPayment +
                          data.packageCardExpenditure +
                          data.customerArrears +
                          data.cashCoupon +
                          data.administrativeCadreSalary +
                          data.designerSalary +
                          data.assistantSalary +
                          data.performanceBonus +
                          data.employeeLoan +
                          data.employeeRewards +
                          data.foodExpenses +
                          data.voucherUse +
                          data.houseRent +
                          data.laborHealthInsuranceLaborRefund +
                          data.educationAndTrainingFees +
                          data.headOfficeManagementFee +
                          data.materialPurchase +
                          data.waterFee +
                          data.electricityFee +
                          data.wasfer +
                          data.telephoneCharges +
                          data.repairFee +
                          data.shopSupplies +
                          data.otherExpenses +
                          data.cleaningFee +
                          data.booksMagazinesAndFees)}
                      </TableCell>
                      <TableCell numeric>
                        {formatNumber(data.materialPaymentIncome +
                          data.packageCardRevenue +
                          data.rendezvousCardExchange +
                          data.customerReturn +
                          data.rentalIncome +
                          data.eventPromotionGiftIncome +
                          data.operatingIncome +
                          data.salesRevenue +
                          data.depositCardIncome +
                          data.otherIncome +
                          data.voucherSales +
                          data.creditCardFees +
                          data.creditCardIncome +
                          data.temporaryCollection +
                          (data.musicVideoFee +
                            data.stationery +
                            data.eventAdvertisingCosts +
                            data.depreciationFee +
                            data.businessTax +
                            data.employeeBenefits +
                            data.eventPromotionGifts +
                            data.transportation +
                            data.communicationFees +
                            data.shopEquipment +
                            data.annualMajorExpenditure +
                            data.shortPremium +
                            data.dividendPayout +
                            data.creditCardFee +
                            data.filmingExpenditure +
                            data.depositCardUse +
                            data.creditCardUse +
                            data.provisionalPayment +
                            data.packageCardExpenditure +
                            data.customerArrears +
                            data.cashCoupon +
                            data.administrativeCadreSalary +
                            data.designerSalary +
                            data.assistantSalary +
                            data.performanceBonus +
                            data.employeeLoan +
                            data.employeeRewards +
                            data.foodExpenses +
                            data.voucherUse +
                            data.houseRent +
                            data.laborHealthInsuranceLaborRefund +
                            data.educationAndTrainingFees +
                            data.headOfficeManagementFee +
                            data.materialPurchase +
                            data.waterFee +
                            data.electricityFee +
                            data.wasfer +
                            data.telephoneCharges +
                            data.repairFee +
                            data.shopSupplies +
                            data.otherExpenses +
                            data.cleaningFee +
                            data.booksMagazinesAndFees))}
                      </TableCell>
                      <TableCell numeric>{formatNumber(data.materialPaymentIncome)}</TableCell>
                      <TableCell numeric>{formatNumber(data.packageCardRevenue)}</TableCell>
                      <TableCell numeric>{formatNumber(data.rendezvousCardExchange)}</TableCell>
                      <TableCell numeric>{formatNumber(data.customerReturn)}</TableCell>
                      <TableCell numeric>{formatNumber(data.rentalIncome)}</TableCell>
                      <TableCell numeric>{formatNumber(data.eventPromotionGiftIncome)}</TableCell>
                      <TableCell numeric>{formatNumber(data.operatingIncome)}</TableCell>
                      <TableCell numeric>{formatNumber(data.salesRevenue)}</TableCell>
                      <TableCell numeric>{formatNumber(data.depositCardIncome)}</TableCell>
                      <TableCell numeric>{formatNumber(data.otherIncome)}</TableCell>
                      <TableCell numeric>{formatNumber(data.voucherSales)}</TableCell>
                      <TableCell numeric>{formatNumber(data.creditCardFees)}</TableCell>
                      <TableCell numeric>{formatNumber(data.creditCardIncome)}</TableCell>
                      <TableCell numeric>{formatNumber(data.temporaryCollection)}</TableCell>
                      <TableCell numeric>{formatNumber(data.musicVideoFee)}</TableCell>
                      <TableCell numeric>{formatNumber(data.stationery)}</TableCell>
                      <TableCell numeric>{formatNumber(data.eventAdvertisingCosts)}</TableCell>
                      <TableCell numeric>{formatNumber(data.depreciationFee)}</TableCell>
                      <TableCell numeric>{formatNumber(data.businessTax)}</TableCell>
                      <TableCell numeric>{formatNumber(data.employeeBenefits)}</TableCell>
                      <TableCell numeric>{formatNumber(data.eventPromotionGifts)}</TableCell>
                      <TableCell numeric>{formatNumber(data.transportation)}</TableCell>
                      <TableCell numeric>{formatNumber(data.communicationFees)}</TableCell>
                      <TableCell numeric>{formatNumber(data.shopEquipment)}</TableCell>
                      <TableCell numeric>{formatNumber(data.annualMajorExpenditure)}</TableCell>
                      <TableCell numeric>{formatNumber(data.shortPremium)}</TableCell>
                      <TableCell numeric>{formatNumber(data.dividendPayout)}</TableCell>
                      <TableCell numeric>{formatNumber(data.creditCardFee)}</TableCell>
                      <TableCell numeric>{formatNumber(data.filmingExpenditure)}</TableCell>
                      <TableCell numeric>{formatNumber(data.depositCardUse)}</TableCell>
                      <TableCell numeric>{formatNumber(data.creditCardUse)}</TableCell>
                      <TableCell numeric>{formatNumber(data.provisionalPayment)}</TableCell>
                      <TableCell numeric>{formatNumber(data.packageCardExpenditure)}</TableCell>
                      <TableCell numeric>{formatNumber(data.customerArrears)}</TableCell>
                      <TableCell numeric>{formatNumber(data.cashCoupon)}</TableCell>
                      <TableCell numeric>{formatNumber(data.administrativeCadreSalary)}</TableCell>
                      <TableCell numeric>{formatNumber(data.designerSalary)}</TableCell>
                      <TableCell numeric>{formatNumber(data.assistantSalary)}</TableCell>
                      <TableCell numeric>{formatNumber(data.performanceBonus)}</TableCell>
                      <TableCell numeric>{formatNumber(data.employeeLoan)}</TableCell>
                      <TableCell numeric>{formatNumber(data.employeeRewards)}</TableCell>
                      <TableCell numeric>{formatNumber(data.foodExpenses)}</TableCell>
                      <TableCell numeric>{formatNumber(data.voucherUse)}</TableCell>
                      <TableCell numeric>{formatNumber(data.houseRent)}</TableCell>
                      <TableCell numeric>{formatNumber(data.laborHealthInsuranceLaborRefund)}</TableCell>
                      <TableCell numeric>{formatNumber(data.educationAndTrainingFees)}</TableCell>
                      <TableCell numeric>{formatNumber(data.headOfficeManagementFee)}</TableCell>
                      <TableCell numeric>{formatNumber(data.materialPurchase)}</TableCell>
                      <TableCell numeric>{formatNumber(data.waterFee)}</TableCell>
                      <TableCell numeric>{formatNumber(data.electricityFee)}</TableCell>
                      <TableCell numeric>{formatNumber(data.wasfer)}</TableCell>
                      <TableCell numeric>{formatNumber(data.telephoneCharges)}</TableCell>
                      <TableCell numeric>{formatNumber(data.repairFee)}</TableCell>
                      <TableCell numeric>{formatNumber(data.shopSupplies)}</TableCell>
                      <TableCell numeric>{formatNumber(data.otherExpenses)}</TableCell>
                      <TableCell numeric>{formatNumber(data.cleaningFee)}</TableCell>
                      <TableCell numeric>{formatNumber(data.booksMagazinesAndFees)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          <TablePagination
            count={results.totalCount}
            onPageChange={handleOnChangePage}
            onRowsPerPageChange={handleOnChangeRowsPerPage}
            page={results.pageOffset}
            rowsPerPage={results.pageLimit}
            rowsPerPageOptions={[5, 10, 20, 25, 1000]}
          />
        </div>
      </Card>
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.object,
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}

export default Results
