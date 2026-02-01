import { gql, useQuery, useLazyQuery } from '@apollo/client'

export const GET_IS_DISPLAY_FAKE_PERFORMANCE_IN_SALARY_REPORT = gql`
  query GET_IS_DISPLAY_FAKE_PERFORMANCE_IN_SALARY_REPORT {
    getIsDisplayFakePerformanceInSalaryReport
  }
`

export default function useFetchGetIsDisplayFakePerformanceInSalaryReport() {
  return useQuery(GET_IS_DISPLAY_FAKE_PERFORMANCE_IN_SALARY_REPORT, {
    fetchPolicy: 'cache-and-network',
  })
}

export function useFetchGetIsDisplayFakePerformanceInSalaryReportLazy() {
  const [
    fetchGetIsDisplayFakePerformanceInSalaryReportLazy,
    getIsDisplayFakePerformanceInSalaryReportLazyData,
  ] = useLazyQuery(GET_IS_DISPLAY_FAKE_PERFORMANCE_IN_SALARY_REPORT, {
    fetchPolicy: 'cache-and-network',
  })
  return {
    fetchGetIsDisplayFakePerformanceInSalaryReportLazy,
    getIsDisplayFakePerformanceInSalaryReportLazyData,
  }
}
