import { gql, useQuery, useLazyQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_IS_DISPLAY_FAKE_PERFORMANCE_IN_SALARY_REPORT = settingsQuery(gql`
  query GET_IS_DISPLAY_FAKE_PERFORMANCE_IN_SALARY_REPORT {
    getIsDisplayFakePerformanceInSalaryReport
  }
`)

export default function useFetchGetIsDisplayFakePerformanceInSalaryReport() {
  return useQuery(GET_IS_DISPLAY_FAKE_PERFORMANCE_IN_SALARY_REPORT, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

export function useFetchGetIsDisplayFakePerformanceInSalaryReportLazy() {
  const [fetchGetIsDisplayFakePerformanceInSalaryReportLazy, getIsDisplayFakePerformanceInSalaryReportLazyData] = useLazyQuery(
    GET_IS_DISPLAY_FAKE_PERFORMANCE_IN_SALARY_REPORT,
    {
      fetchPolicy: SETTINGS_FETCH_POLICY,
    }
  )
  return {
    fetchGetIsDisplayFakePerformanceInSalaryReportLazy,
    getIsDisplayFakePerformanceInSalaryReportLazyData,
  }
}
