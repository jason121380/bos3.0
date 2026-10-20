import { Table, TableBody, TableCell, TableRow } from 'ui/table'
import idx from 'idx'
// import { useFetchMerchantStaticUserPerformReport } from 'hooks/useFetchMerchantStaticPerformanceReport'
import format from 'date-fns/format'

const DesignerSalaryReport = ({
  userSalary,
  designer,
}) => {
  const date = idx(userSalary, _ => _.data.user.salary.date)
  // const [personalSalaryReport, setPersonalSalaryReport] = useState([])
  let startDate
  let endDate
  let inputData
  const formattedDate = format(date, 'yyyy/MM')

  const transformDateForAPIInput = formattedDate => {
    switch (formattedDate.substring(5, 7)) {
      case '01':
        startDate = new Date(`${formattedDate.substring(0, 4)}-01-01T00:00:00`).getTime()
        endDate = new Date(`${formattedDate.substring(0, 4)}-02-01T00:00:00`).getTime()
        inputData = {
          startDate,
          endDate,
        }
        return inputData
      case '02':
        startDate = new Date(`${formattedDate.substring(0, 4)}-02-01T00:00:00`).getTime()
        endDate = new Date(`${formattedDate.substring(0, 4)}-03-01T00:00:00`).getTime()
        inputData = {
          startDate,
          endDate,
        }
        return inputData
      case '03':
        startDate = new Date(`${formattedDate.substring(0, 4)}-03-01T00:00:00`).getTime()
        endDate = new Date(`${formattedDate.substring(0, 4)}-04-01T00:00:00`).getTime()
        inputData = {
          startDate,
          endDate,
        }
        return inputData
      case '04':
        startDate = new Date(`${formattedDate.substring(0, 4)}-04-01T00:00:00`).getTime()
        endDate = new Date(`${formattedDate.substring(0, 4)}-05-01T00:00:00`).getTime()
        inputData = {
          startDate,
          endDate,
        }
        return inputData
      case '05':
        startDate = new Date(`${formattedDate.substring(0, 4)}-05-01T00:00:00`).getTime()
        endDate = new Date(`${formattedDate.substring(0, 4)}-06-01T00:00:00`).getTime()
        inputData = {
          startDate,
          endDate,
        }
        return inputData
      case '06':
        startDate = new Date(`${formattedDate.substring(0, 4)}-06-01T00:00:00`).getTime()
        endDate = new Date(`${formattedDate.substring(0, 4)}-07-01T00:00:00`).getTime()
        inputData = {
          startDate,
          endDate,
        }
        return inputData
      case '07':
        startDate = new Date(`${formattedDate.substring(0, 4)}-07-01T00:00:00`).getTime()
        endDate = new Date(`${formattedDate.substring(0, 4)}-08-01T00:00:00`).getTime()
        inputData = {
          startDate,
          endDate,
        }
        return inputData
      case '08':
        startDate = new Date(`${formattedDate.substring(0, 4)}-08-01T00:00:00`).getTime()
        endDate = new Date(`${formattedDate.substring(0, 4)}-09-01T00:00:00`).getTime()
        inputData = {
          startDate,
          endDate,
        }
        return inputData
      case '09':
        startDate = new Date(`${formattedDate.substring(0, 4)}-09-01T00:00:00`).getTime()
        endDate = new Date(`${formattedDate.substring(0, 4)}-10-01T00:00:00`).getTime()
        inputData = {
          startDate,
          endDate,
        }
        return inputData
      case '10':
        startDate = new Date(`${formattedDate.substring(0, 4)}-10-01T00:00:00`).getTime()
        endDate = new Date(`${formattedDate.substring(0, 4)}-11-01T00:00:00`).getTime()
        inputData = {
          startDate,
          endDate,
        }
        return inputData
      case '11':
        startDate = new Date(`${formattedDate.substring(0, 4)}-11-01T00:00:00`).getTime()
        endDate = new Date(`${formattedDate.substring(0, 4)}-10-01T00:00:00`).getTime()
        inputData = {
          startDate,
          endDate,
        }
        return inputData
      case '12':
        startDate = new Date(`${formattedDate.substring(0, 4)}-12-01T00:00:00`).getTime()
        endDate = new Date(`${formattedDate.substring(0, 4)}-01-01T00:00:00`).getTime()
        inputData = {
          startDate,
          endDate,
        }
        return inputData
      default:
        console.log('invalid date')
        break
    }
  }

  const dateForAPIInput = transformDateForAPIInput(formattedDate)

  // const designerSalesAnalyticsData = useFetchMerchantStaticUserPerformReport({
  //   input: dateForAPIInput,
  //   designerId,
  // })

  // useEffect(() => {
  //   if (!designerSalesAnalyticsData.loading && designerSalesAnalyticsData.data) {
  //     const designerSalesAnalytics = idx(
  //       designerSalesAnalyticsData,
  //       _ => _.data.merchantStaticPerformanceReport[0]
  //     )
  //     setPersonalSalaryReport([designerSalesAnalytics])
  //     setSalaryLoading(designerSalesAnalyticsData.loading)
  //   }
  // }, [designerSalesAnalyticsData.loading, designerSalesAnalyticsData.data])

  return designer !== undefined ? (
    <Table dense>
      <TableBody>
        <TableRow>
          <TableCell>服務虛業績</TableCell>
          <TableCell>
            {Math.round(
              designer.salesAnalytics.servicePerformanceFakeTotal +
              designer.salesAnalytics.ticketUsagePerformanceFakeTotal
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingLeft: '40px' }}>扣業績-第三方/其他支付方式 手續費</TableCell>
          <TableCell>
            {Math.round(designer.salesAnalytics.serviceThirdPartHandlingFeeOnSales) +
              Math.round(designer.salesAnalytics.ticketThirdPartHandlingFeeOnSales)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingLeft: '40px' }}>扣業績 - 扣項</TableCell>
          <TableCell>
            {Math.round(designer.salesAnalytics.servicePerformanceDecountItem) +
              Math.round(designer.salesAnalytics.ticketPerformanceDecountItem)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>服務實業績</TableCell>
          <TableCell>
            {Math.round(designer.salesAnalytics.truthPerformanceWithoutHelper)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingLeft: '40px' }}>實業績 - 指定</TableCell>
          <TableCell>
            {Math.round(
              designer.salesAnalytics.servicePerformanceDesignateTruthTotalBeforeHelperDecount
            ) + Math.round(designer.salesAnalytics.ticketDesignateTruthBeforeHelperDecount)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingLeft: '40px' }}>實業績 - 不指定</TableCell>
          <TableCell>
            {Math.round(
              designer.salesAnalytics.servicePerformanceNonDesignateTruthTotalBeforeHelperDecount
            ) + Math.round(designer.salesAnalytics.ticketNonDesignateTruthBeforeHelperDecount)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingLeft: '40px' }}>扣業績 - 使用互助</TableCell>
          <TableCell>
            {Math.round(designer.salesAnalytics.servicePerformanceDecountHelperUsagePrice) +
              Math.round(designer.salesAnalytics.ticketPerformanceDecountHelperUsage)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>服務實業績 扣使用互助後</TableCell>
          <TableCell>
            {Math.round(designer.salesAnalytics.servicePerformanceTruthTotal) +
              Math.round(designer.salesAnalytics.ticketUsagePerformanceTruthTotal)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingLeft: '40px' }}>實業績 扣使用互助後 - 指定</TableCell>
          <TableCell>
            {Math.round(designer.salesAnalytics.servicePerformanceDesignateTruthTotal) +
              Math.round(designer.salesAnalytics.ticketUsagePerformanceDesignateTruthTotal)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingLeft: '40px' }}>實業績 扣使用互助後 - 不指定</TableCell>
          <TableCell>
            {Math.round(designer.salesAnalytics.servicePerformanceNonDesignateTruthTotal) +
              Math.round(designer.salesAnalytics.ticketUsagePerformanceNonDesignateTruthTotal)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>服務換算抽成</TableCell>
          <TableCell>
            {Math.round(designer.salesAnalytics.servicePerformanceRake) +
              Math.round(designer.salesAnalytics.ticketPerformanceRake)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingLeft: '40px' }}>指定抽成</TableCell>
          <TableCell>
            {Math.round(designer.salesAnalytics.servicePerformanceDesignateRake) +
              Math.round(designer.salesAnalytics.ticketPerformanceDesignateRake)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingLeft: '40px' }}>不指定抽成</TableCell>
          <TableCell>
            {Math.round(designer.salesAnalytics.servicePerformanceNonDesignateRake) +
              Math.round(designer.salesAnalytics.ticketPerformanceNonDesignateRake)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingLeft: '40px' }}>特殊抽成</TableCell>
          <TableCell>{Math.round(designer.salesAnalytics.specialRake)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingLeft: '40px' }}>
            扣薪水 - 第三方/其他支付方式 手續費
          </TableCell>
          <TableCell>
            {Math.round(designer.salesAnalytics.serviceThirdPartHandlingFeeOnSalary) +
              Math.round(designer.salesAnalytics.ticketThirdPartHandlingFeeOnSalary)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingLeft: '40px' }}>扣薪水 - 扣項</TableCell>
          <TableCell>
            {Math.round(designer.salesAnalytics.serviceSalaryDecountItem) +
              Math.round(designer.salesAnalytics.ticketSalaryDecountItem)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingLeft: '40px' }}>扣薪水 - 使用互助 </TableCell>
          <TableCell>
            {Math.round(
              designer.salesAnalytics.serviceSalaryDecountHelperUsagePrice +
              designer.salesAnalytics.ticketSalaryDecountHelperUsagePrice
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>服務應領金額</TableCell>
          <TableCell>
            {Math.round(
              designer.salesAnalytics.serviceSalaryShouldBePaid +
              designer.salesAnalytics.ticketSalaryShouldBePaid
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>店販業績</TableCell>
          <TableCell>{Math.round(designer.salesAnalytics.productPerformanceFakeTotal)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingLeft: '40px' }}>
            扣業績 - 第三方/其他支付方式 手續費
          </TableCell>
          <TableCell>{Math.round(designer.salesAnalytics.productThirdPartHandlingFee)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingLeft: '40px' }}>店販業績 扣手續費後</TableCell>
          <TableCell>
            {Math.round(designer.salesAnalytics.productPerformanceTruthTotal)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>店販抽成</TableCell>
          <TableCell>
            {Math.round(
              designer.salesAnalytics.productRakeByCost +
              designer.salesAnalytics.productRakeByFixed +
              designer.salesAnalytics.productRakeByPrice
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>互助獲得</TableCell>
          <TableCell>
            {`${Math.round(designer.salesAnalytics.helperRetrievePrice)}/${designer.salesAnalytics.helperRetrievePoint
              }`}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>扣入金手續費</TableCell>
          <TableCell>
            {Math.round(designer.salesAnalytics.walletDepositHandlingFeeByDesigner)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ color: 'red', fontWeight: '500' }}>總應領薪資</TableCell>
          <TableCell style={{ color: 'red', fontWeight: '500' }}>
            {Math.round(designer.salesAnalytics.totalSalaryShouldBePaid)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ) : (
    // 先隱藏怕之後又改回來
    // !salaryLoading && (
    //   <TableContainer component={Paper} css={styles.designerSalaryReport}>
    //     <Table size="small">
    //       <TableBody>
    //         {personalSalaryReport.map((user, index) => (
    //           <Fragment key={index}>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 服務業績/指定/不指定(虛)
    //               </TableCell>
    //               <TableCell>
    //                 {`${Math.round(
    //                   user.merchantPerformanceReport.servicePerformanceFakeTotal
    //                 )}/${Math.round(
    //                   user.merchantPerformanceReport.servicePerformanceDesignateFakeTotal
    //                 )}/${Math.round(
    //                   user.merchantPerformanceReport.servicePerformanceNonDesignateFakeTotal
    //                 )}`}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 扣業績 - 第三方支付手續費
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.serviceThirdPartHandlingFeeOnSales)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 扣業績 - 項目扣項
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.servicePerformanceDecountItem)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 扣業績 - 互助使用 金額/點數
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(
    //                   user.merchantPerformanceReport.servicePerformanceDecountHelperUsagePrice
    //                 )}
    //                 /
    //                 {Math.round(
    //                   user.merchantPerformanceReport.servicePerformanceDecountHelperUsagePoint
    //                 )}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 服務業績/指定/不指定(實)
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.servicePerformanceTruthTotal)}/
    //                 {Math.round(
    //                   user.merchantPerformanceReport.servicePerformanceDesignateTruthTotal
    //                 )}
    //                 /
    //                 {Math.round(
    //                   user.merchantPerformanceReport.servicePerformanceNonDesignateTruthTotal
    //                 )}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 服務業績抽成
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.servicePerformanceRake)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 扣薪水 - 第三方支付手續費
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.serviceThirdPartHandlingFeeOnSalary)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 扣薪水 - 項目扣項
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.serviceSalaryDecountItem)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 扣薪水 - 互助使用 金額/點數
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(
    //                   user.merchantPerformanceReport.serviceSalaryDecountHelperUsagePrice
    //                 )}
    //                 /
    //                 {Math.round(
    //                   user.merchantPerformanceReport.serviceSalaryDecountHelperUsagePoint
    //                 )}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 服務應領薪資
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.serviceSalaryShouldBePaid)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell css={styles.spaces} />
    //               <TableCell css={styles.spaces} />
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 卡券使用業績(虛)
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.ticketUsagePerformanceFakeTotal)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 扣業績 - 扣第三方支付手續費
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.ticketThirdPartHandlingFeeOnSales)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 扣業績 - 項目扣項
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.ticketPerformanceDecountItem)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 扣業績 - 互助使用
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.ticketPerformanceDecountHelperUsage)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 卡券使用業績(實)
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.ticketUsagePerformanceTruthTotal)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 卡券業績抽成
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.ticketPerformanceRake)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 扣薪水 - 扣第三方支付手續費
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.ticketThirdPartHandlingFeeOnSalary)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 扣薪水 - 項目扣項
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.ticketSalaryDecountItem)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 扣薪水- 互助使用
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.ticketSalaryDecountHelperUsagePrice)}
    //                 /
    //                 {Math.round(user.merchantPerformanceReport.ticketSalaryDecountHelperUsagePoint)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 卡券應領薪資
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.ticketSalaryShouldBePaid)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell css={styles.spaces} />
    //               <TableCell css={styles.spaces} />
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 店販業績 (虛)
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.productPerformanceFakeTotal)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 扣第三方支付手續費
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.productThirdPartHandlingFee)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 店販業績 (實)
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.productPerformanceTruthTotal)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 抽成方式 - 固定業績
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.productRakeByFixed)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 抽成方式 - 售價%數
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.productRakeByCost)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 抽成方式 - 毛利%數
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.productRakeByPrice)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 店販應領薪資
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.productSalaryShouldBePaid)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell css={styles.spaces} />
    //               <TableCell css={styles.spaces} />
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row">
    //                 互助獲得 金額/點數
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.helperRetrievePrice)}/
    //                 {Math.round(user.merchantPerformanceReport.helperRetrievePoint)}
    //               </TableCell>
    //             </TableRow>
    //             <TableRow>
    //               <TableCell css={styles.spaces} />
    //               <TableCell css={styles.spaces} />
    //             </TableRow>
    //             <TableRow>
    //               <TableCell component="th" scope="row" css={styles.font}>
    //                 總應領薪資 (服務+卡券+ 店販+ 互助獲得)
    //               </TableCell>
    //               <TableCell>
    //                 {Math.round(user.merchantPerformanceReport.totalSalaryShouldBePaid)}
    //               </TableCell>
    //             </TableRow>
    //           </Fragment>
    //         ))}
    //       </TableBody>
    //     </Table>
    //   </TableContainer>
    <div className="mb-[0.35em] text-title font-bold text-text">
      無資料
    </div>
  )
}

export default DesignerSalaryReport
