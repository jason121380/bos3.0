/** @jsxImportSource @emotion/react */
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material'
import GenericMoreButton from 'components/GenericMoreButton'
import { format } from 'date-fns'
import PropTypes from 'prop-types'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  filterButton: css({
    marginRight: theme.spacing(2),
  }),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 7000,
  }),
  actions: css({
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  }),
}

function Results({
  className,
  orders,
  results,
  handleOnChangeRowsPerPage,
  handleOnChangePage,
  ...rest
}) {
  return (
    <div {...rest} css={css([styles.root, className])}>
      <Typography color="textSecondary" gutterBottom variant="body2">
        共 {results.totalCount} 筆, {results.pageOffset + 1} /{' '}
        {Math.ceil(results.totalCount / results.pageLimit)}
      </Typography>
      <Card>
        <CardHeader action={<GenericMoreButton />} title="收支科目明細" />
        <Divider />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>時間</TableCell>
                    <TableCell>收入合計</TableCell>
                    <TableCell>支出合計</TableCell>
                    <TableCell>結餘合計</TableCell>
                    <TableCell>材料貨款(員購)收入</TableCell>
                    <TableCell>包套卡收入</TableCell>
                    <TableCell>集點卡兌換</TableCell>
                    <TableCell>顧客還單</TableCell>
                    <TableCell>租金收入</TableCell>
                    <TableCell>活動促銷贈品收入</TableCell>
                    <TableCell>營業收入</TableCell>
                    <TableCell>售貨收入</TableCell>
                    <TableCell>入金卡收入</TableCell>
                    <TableCell>其他收入</TableCell>
                    <TableCell>髮券銷售</TableCell>
                    <TableCell>信用卡手續費</TableCell>
                    <TableCell>信用卡收入</TableCell>
                    <TableCell>暫收款</TableCell>
                    <TableCell>音樂視訊費用</TableCell>
                    <TableCell>文具用品(匯影印)</TableCell>
                    <TableCell>活動廣告費(印刷、廣告)</TableCell>
                    <TableCell>折舊費(互助費)</TableCell>
                    <TableCell>營業稅(稅捐)</TableCell>
                    <TableCell>職工福利</TableCell>
                    <TableCell>活動促銷贈品支出</TableCell>
                    <TableCell>交通費</TableCell>
                    <TableCell>交際費(公關)</TableCell>
                    <TableCell>店用器材設備</TableCell>
                    <TableCell>年度大項支出</TableCell>
                    <TableCell>短溢金</TableCell>
                    <TableCell>紅利支出</TableCell>
                    <TableCell>信用卡手續費(支出)</TableCell>
                    <TableCell>髮片支出</TableCell>
                    <TableCell>入金卡使用</TableCell>
                    <TableCell>信用卡使用</TableCell>
                    <TableCell>暫付款</TableCell>
                    <TableCell>包套卡支出</TableCell>
                    <TableCell>客戶欠單</TableCell>
                    <TableCell>現金禮券</TableCell>
                    <TableCell>行政幹部薪資</TableCell>
                    <TableCell>設計師薪資</TableCell>
                    <TableCell>助理薪資</TableCell>
                    <TableCell>業績獎金</TableCell>
                    <TableCell>員工借支</TableCell>
                    <TableCell>員工獎勵</TableCell>
                    <TableCell>伙食費</TableCell>
                    <TableCell>髮券使用</TableCell>
                    <TableCell>房屋租金(租賃稅)</TableCell>
                    <TableCell>勞健保勞退費</TableCell>
                    <TableCell>教育訓練費</TableCell>
                    <TableCell>總公司管理費</TableCell>
                    <TableCell>材料貨款(員購)支出</TableCell>
                    <TableCell>水費</TableCell>
                    <TableCell>電費</TableCell>
                    <TableCell>瓦斯費</TableCell>
                    <TableCell>電話費(網路)</TableCell>
                    <TableCell>修繕費</TableCell>
                    <TableCell>店用耗材</TableCell>
                    <TableCell>其他(雜項)支出</TableCell>
                    <TableCell>清潔費用(毛巾清洗)</TableCell>
                    <TableCell>書報雜誌費</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.data.map((data, index) => (
                    <TableRow key={`account-detail-${index}`}>
                      <TableCell>{format(new Date(data.date), 'MM/dd/yyyy')}</TableCell>
                      <TableCell>
                        {data.materialPaymentIncome +
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
                          data.temporaryCollection}
                      </TableCell>
                      <TableCell>
                        {data.musicVideoFee +
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
                          data.booksMagazinesAndFees}
                      </TableCell>
                      <TableCell>
                        {data.materialPaymentIncome +
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
                            data.booksMagazinesAndFees)}
                      </TableCell>
                      <TableCell>{data.materialPaymentIncome}</TableCell>
                      <TableCell>{data.packageCardRevenue}</TableCell>
                      <TableCell>{data.rendezvousCardExchange}</TableCell>
                      <TableCell>{data.customerReturn}</TableCell>
                      <TableCell>{data.rentalIncome}</TableCell>
                      <TableCell>{data.eventPromotionGiftIncome}</TableCell>
                      <TableCell>{data.operatingIncome}</TableCell>
                      <TableCell>{data.salesRevenue}</TableCell>
                      <TableCell>{data.depositCardIncome}</TableCell>
                      <TableCell>{data.otherIncome}</TableCell>
                      <TableCell>{data.voucherSales}</TableCell>
                      <TableCell>{data.creditCardFees}</TableCell>
                      <TableCell>{data.creditCardIncome}</TableCell>
                      <TableCell>{data.temporaryCollection}</TableCell>
                      <TableCell>{data.musicVideoFee}</TableCell>
                      <TableCell>{data.stationery}</TableCell>
                      <TableCell>{data.eventAdvertisingCosts}</TableCell>
                      <TableCell>{data.depreciationFee}</TableCell>
                      <TableCell>{data.businessTax}</TableCell>
                      <TableCell>{data.employeeBenefits}</TableCell>
                      <TableCell>{data.eventPromotionGifts}</TableCell>
                      <TableCell>{data.transportation}</TableCell>
                      <TableCell>{data.communicationFees}</TableCell>
                      <TableCell>{data.shopEquipment}</TableCell>
                      <TableCell>{data.annualMajorExpenditure}</TableCell>
                      <TableCell>{data.shortPremium}</TableCell>
                      <TableCell>{data.dividendPayout}</TableCell>
                      <TableCell>{data.creditCardFee}</TableCell>
                      <TableCell>{data.filmingExpenditure}</TableCell>
                      <TableCell>{data.depositCardUse}</TableCell>
                      <TableCell>{data.creditCardUse}</TableCell>
                      <TableCell>{data.provisionalPayment}</TableCell>
                      <TableCell>{data.packageCardExpenditure}</TableCell>
                      <TableCell>{data.customerArrears}</TableCell>
                      <TableCell>{data.cashCoupon}</TableCell>
                      <TableCell>{data.administrativeCadreSalary}</TableCell>
                      <TableCell>{data.designerSalary}</TableCell>
                      <TableCell>{data.assistantSalary}</TableCell>
                      <TableCell>{data.performanceBonus}</TableCell>
                      <TableCell>{data.employeeLoan}</TableCell>
                      <TableCell>{data.employeeRewards}</TableCell>
                      <TableCell>{data.foodExpenses}</TableCell>
                      <TableCell>{data.voucherUse}</TableCell>
                      <TableCell>{data.houseRent}</TableCell>
                      <TableCell>{data.laborHealthInsuranceLaborRefund}</TableCell>
                      <TableCell>{data.educationAndTrainingFees}</TableCell>
                      <TableCell>{data.headOfficeManagementFee}</TableCell>
                      <TableCell>{data.materialPurchase}</TableCell>
                      <TableCell>{data.waterFee}</TableCell>
                      <TableCell>{data.electricityFee}</TableCell>
                      <TableCell>{data.wasfer}</TableCell>
                      <TableCell>{data.telephoneCharges}</TableCell>
                      <TableCell>{data.repairFee}</TableCell>
                      <TableCell>{data.shopSupplies}</TableCell>
                      <TableCell>{data.otherExpenses}</TableCell>
                      <TableCell>{data.cleaningFee}</TableCell>
                      <TableCell>{data.booksMagazinesAndFees}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
        <CardActions css={styles.actions}>
          <TablePagination
            labelRowsPerPage='每頁顯示數量'
            component="div"
            count={results.totalCount}
            onPageChange={handleOnChangePage}
            onRowsPerPageChange={handleOnChangeRowsPerPage}
            page={results.pageOffset}
            rowsPerPage={results.pageLimit}
            rowsPerPageOptions={[5, 10, 20, 25, 1000]}
          />
        </CardActions>
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
