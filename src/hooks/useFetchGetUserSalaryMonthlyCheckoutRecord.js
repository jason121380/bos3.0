import { gql, useQuery } from '@apollo/client'

const FETCH_USER_SALARY_MONTHLY_CHECKOUT_RECORD = gql`
  query FETCH_USER_SALARY_MONTHLY_CHECKOUT_RECORD($date: DateTime!, $userId: ID!) {
    getUserSalaryMonthlyCheckoutRecord(date: $date, userId: $userId) {
      salaryMonthlyCheckoutRecord
      isHelperRetrireveAutoSet
    }
  }
`
export default function useFetchUserSalaryMonthlyCheckoutRecord({ date, userId }) {
  return useQuery(FETCH_USER_SALARY_MONTHLY_CHECKOUT_RECORD, {
    variables: {
      date,
      userId,
    },
    fetchPolicy: 'cache-and-network',
  })
}
