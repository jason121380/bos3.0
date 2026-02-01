import { gql, useQuery } from '@apollo/client'

const FETCH_USER_SALARY_MONTHLY_CHECKOUT_RECORD_V2 = gql`
  query FETCH_USER_SALARY_MONTHLY_CHECKOUT_RECORD_V2($date: DateTime!, $userId: ID!) {
    getUserSalaryMonthlyCheckoutRecordV2(date: $date, userId: $userId) {
      salaryMonthlyCheckoutRecord {
        totalTruthPerformance
        designateTruthPerformance
        nonDesignateTruthPerformance
        specialTruthPerformance
        designateRake
        nonDesignateRake
        specialRake
        productPerformance
        productRake
        membershipPerformance
        membershipRake
        deductionItemOnSalary
        helperPaidPriceOnSales
        helperPaidPointOnSales
        helperPaidPriceOnSalary
        helperPaidPointOnSalary
        helperPaidPriceNonDecount
        helperPaidPointNonDecount
        helperRetrievePrice
        helperRetrievePoint
        otherPayHandlingFeeOnSalary
        walletDepositHandlingFee
      }
      isHelperRetrireveAutoSet
    }
  }
`
export default function useFetchUserSalaryMonthlyCheckoutRecordV2({ date, userId }) {
  return useQuery(FETCH_USER_SALARY_MONTHLY_CHECKOUT_RECORD_V2, {
    variables: {
      date,
      userId,
    },
    fetchPolicy: 'cache-and-network',
  })
}
