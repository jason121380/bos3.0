import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_STATIC_PERFORM_REPORT = gql`
  query GET_MERCHANT_STATIC_PERFORM_REPORT($input: DateTimeInput!) {
    merchantStaticPerformanceReport(input: $input) {
      merchantPerformanceReport {
        servicePerformanceFakeTotal
        servicePerformanceDesignateFakeTotal
        servicePerformanceNonDesignateFakeTotal
        serviceThirdPartHandlingFeeOnSales
        servicePerformanceDecountItem
        servicePerformanceDecountHelperUsagePrice
        servicePerformanceDecountHelperUsagePoint
        servicePerformanceTruthTotal
        servicePerformanceDesignateTruthTotal
        servicePerformanceNonDesignateTruthTotal
        servicePerformanceRake
        serviceThirdPartHandlingFeeOnSalary
        serviceSalaryDecountItem
        serviceSalaryDecountHelperUsagePrice
        serviceSalaryDecountHelperUsagePoint
        serviceSalaryShouldBePaid
        ticketUsagePerformanceFakeTotal
        ticketUsagePerformanceDesignateFakeTotal
        ticketUsagePerformanceNonDesignateFakeTotal
        ticketThirdPartHandlingFeeOnSales
        ticketPerformanceDecountItem
        ticketPerformanceDecountHelperUsage
        ticketUsagePerformanceTruthTotal
        ticketUsagePerformanceDesignateTruthTotal
        ticketUsagePerformanceNonDesignateTruthTotal
        ticketPerformanceRake
        ticketThirdPartHandlingFeeOnSalary
        ticketSalaryDecountItem
        ticketSalaryDecountHelperUsagePrice
        ticketSalaryDecountHelperUsagePoint
        ticketSalaryShouldBePaid
        productPerformanceFakeTotal
        productThirdPartHandlingFee
        productPerformanceTruthTotal
        productRakeByFixed
        productRakeByCost
        productRakeByPrice
        productSalaryShouldBePaid
        helperRetrievePoint
        helperRetrievePrice
        totalSalaryShouldBePaid
        ticketSellingFake
        ticketSellingTruth
        walletDepositFake
        walletDepositTruth
        customerTotalCount
        customerMaleCount
        customerFemaleCount
        customerUnknownCount
        customerAveragePrice
        customerAveragePriceWithProduct
        orderTotalCount
        orderDesignateCount
        orderNonDesignateCount
        orderMaleCount
        orderFemaleCount
        orderUnknownCount
        orderAveragePrice
        orderAveragePriceWithProduct
        hairWashing
        hairWashingCount
        hairCutting
        hairCuttingCount
        permanent
        permanentCount
        hairDying
        hairDyingCount
        hairTreatment
        hairTreatmentCount
        scalpTreatment
        scalpTreatmentCount
        hairExtension
        hairExtensionCount
        hairStyling
        hairStylingCount
      }
      user {
        name
        id
      }
    }
  }
`

export default function useFetchMerchantStaticPerformReport({ input }) {
  return useQuery(GET_MERCHANT_STATIC_PERFORM_REPORT, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const GET_MERCHANT_STATIC_USER_PERFORM_REPORT = gql`
  query GET_MERCHANT_STATIC_USER_PERFORM_REPORT($input: DateTimeInput!, $designerId: ID) {
    merchantStaticPerformanceReport(input: $input, designerId: $designerId) {
      merchantPerformanceReport {
        servicePerformanceFakeTotal
        servicePerformanceDesignateFakeTotal
        servicePerformanceNonDesignateFakeTotal
        serviceThirdPartHandlingFeeOnSales
        servicePerformanceDecountItem
        servicePerformanceDecountHelperUsagePrice
        servicePerformanceDecountHelperUsagePoint
        servicePerformanceTruthTotal
        servicePerformanceDesignateTruthTotal
        servicePerformanceNonDesignateTruthTotal
        servicePerformanceRake
        serviceThirdPartHandlingFeeOnSalary
        serviceSalaryDecountItem
        serviceSalaryDecountHelperUsagePrice
        serviceSalaryDecountHelperUsagePoint
        serviceSalaryShouldBePaid
        ticketUsagePerformanceFakeTotal
        ticketUsagePerformanceDesignateFakeTotal
        ticketUsagePerformanceNonDesignateFakeTotal
        ticketThirdPartHandlingFeeOnSales
        ticketPerformanceDecountItem
        ticketPerformanceDecountHelperUsage
        ticketUsagePerformanceTruthTotal
        ticketUsagePerformanceDesignateTruthTotal
        ticketUsagePerformanceNonDesignateTruthTotal
        ticketPerformanceRake
        ticketThirdPartHandlingFeeOnSalary
        ticketSalaryDecountItem
        ticketSalaryDecountHelperUsagePrice
        ticketSalaryDecountHelperUsagePoint
        ticketSalaryShouldBePaid
        productPerformanceFakeTotal
        productThirdPartHandlingFee
        productPerformanceTruthTotal
        productRakeByFixed
        productRakeByCost
        productRakeByPrice
        productSalaryShouldBePaid
        helperRetrievePoint
        helperRetrievePrice
        totalSalaryShouldBePaid
        ticketSellingFake
        ticketSellingTruth
        walletDepositFake
        walletDepositTruth
        customerTotalCount
        customerMaleCount
        customerFemaleCount
        customerUnknownCount
        customerAveragePrice
        customerAveragePriceWithProduct
        orderTotalCount
        orderDesignateCount
        orderNonDesignateCount
        orderMaleCount
        orderFemaleCount
        orderUnknownCount
        orderAveragePrice
        orderAveragePriceWithProduct
        hairWashing
        hairWashingCount
        hairCutting
        hairCuttingCount
        permanent
        permanentCount
        hairDying
        hairDyingCount
        hairTreatment
        hairTreatmentCount
        scalpTreatment
        scalpTreatmentCount
        hairExtension
        hairExtensionCount
        hairStyling
        hairStylingCount
      }
    }
  }
`

export function useFetchMerchantStaticUserPerformReport({ input, designerId }) {
  return useQuery(GET_MERCHANT_STATIC_USER_PERFORM_REPORT, {
    variables: {
      input,
      designerId,
    },
    fetchPolicy: 'cache-and-network',
  })
}
