import { gql, useQuery, useLazyQuery } from '@apollo/client'

const FETCH_USER_SALARY_REPORT = gql`
  query FETCH_USER_SALARY_REPORT($date: DateTime) {
    userSalaryReport(date: $date) {
      userId
      name
      summary
      increaseItem {
        itemName
        price
        type
      }
      decreaseItem {
        itemName
        price
        type
      }
      specialTruthPerformance
      designateTruthPerformance
      nonDesignateTruthPerformance
      truthPerformance
      helperPointRetrieve
      fakePerformanceTotal
      performanceDecountItem
      handlingFeeOnSales
      remark
      workingDays
    }
  }
`
export default function useFetchUserSalaryReport({ date }) {
  return useQuery(FETCH_USER_SALARY_REPORT, {
    variables: {
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}

export function useFetchUserSalaryReportLazy() {
  const [fetchUserSalaryReportLazy, userSalaryReportLazyData] = useLazyQuery(
    FETCH_USER_SALARY_REPORT,
    {
      fetchPolicy: 'cache-and-network',
    }
  )
  return { fetchUserSalaryReportLazy, userSalaryReportLazyData }
}
