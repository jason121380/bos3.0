import { gql, useQuery, useLazyQuery } from '@apollo/client'

const FETCH_DESIGNER_RAKE_REPORT = gql`
  query FETCH_DESIGNER_RAKE_REPORT($input: UserRakeReportDateTimeInput!, $designerIds: [ID]) {
    userRakeReport(input: $input, designerIds: $designerIds) {
      user {
        name
        nickName
        id
        designerNo
      }
      salesAnalytics {
        servicePerformanceFakeTotal
        servicePerformanceTruthTotal
        serviceThirdPartHandlingFeeOnSales
        servicePerformanceDecountItem
        servicePerformanceDecountHelperUsagePrice
        servicePerformanceDecountHelperUsagePoint
        servicePerformanceRake
        servicePerformanceDesignateTruthTotal
        servicePerformanceNonDesignateTruthTotal
        servicePerformanceDesignateTruthTotalBeforeHelperDecount
        servicePerformanceNonDesignateTruthTotalBeforeHelperDecount
        servicePerformanceDesignateRake
        servicePerformanceNonDesignateRake
        serviceThirdPartHandlingFeeOnSalary
        serviceSalaryDecountItem
        serviceSalaryDecountHelperUsagePrice
        serviceSalaryDecountHelperUsagePoint
        serviceSalaryShouldBePaid
        productPerformanceFakeTotal
        productPerformanceTruthTotal
        helperRetrievePoint
        totalSalaryShouldBePaid
        ticketUsagePerformanceFakeTotal
        ticketThirdPartHandlingFeeOnSales
        ticketPerformanceDecountItem
        ticketUsagePerformanceTruthTotal
        ticketPerformanceRake
        ticketThirdPartHandlingFeeOnSalary
        ticketSalaryDecountItem
        ticketSalaryDecountHelperUsagePrice
        ticketSalaryDecountHelperUsagePoint
        ticketPerformanceDecountHelperUsage
        ticketPerformanceDecountHelperUsagePoint
        truthPerformanceWithoutHelper
        ticketSalaryShouldBePaid
        ticketDesignateTruthBeforeHelperDecount
        ticketNonDesignateTruthBeforeHelperDecount
        ticketPerformanceDesignateRake
        ticketPerformanceNonDesignateRake
        ticketUsagePerformanceDesignateTruthTotal
        ticketUsagePerformanceNonDesignateTruthTotal
        productRakeByFixed
        productRakeByCost
        productRakeByPrice
        walletDepositHandlingFeeByDesigner
        specialRake
        serviceThirdPartHandlingFeeOnSalary
        ticketThirdPartHandlingFeeOnSalary
        productThirdPartHandlingFeeOnSalary
        productThirdPartHandlingFeeOnSales
        helperRetrievePriceOnlyPoint
        helperRetrievePoint
        helperRetrievePriceNoPoint
        helperPricePaid
        helperPointPaid
        membershipPerformanceFakeTotal
        membershipThirdPartHandlingFeeOnSales
        membershipThirdPartHandlingFeeOnSalary
        membershipPerformanceTruthTotal
        membershipRakeByFixed
        membershipRakeByCost
        membershipRakeByPrice
        membershipSalaryShouldBePaid
      }
    }
  }
`
export default function useFetchDesignerRakeReport({ input, designerIds }) {
  return useQuery(FETCH_DESIGNER_RAKE_REPORT, {
    variables: {
      input,
      designerIds,
    },
    fetchPolicy: 'cache-and-network',
  })
}
export function useFetchDesignerRakeReportLazy() {
  const [fetchDesignerRakeReportLazy, designerRakeReportLazyData] = useLazyQuery(FETCH_DESIGNER_RAKE_REPORT, {
    fetchPolicy: 'cache-and-network',
  })
  return { fetchDesignerRakeReportLazy, designerRakeReportLazyData }
}
