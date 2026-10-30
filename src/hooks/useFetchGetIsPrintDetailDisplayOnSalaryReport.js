import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_PRINT_DETAIL_DISPLAY_ON_SALARY_REPORT = settingsQuery(gql`
  query GET_PRINT_DETAIL_DISPLAY_ON_SALARY_REPORT {
    getIsPrintDetailDisplayOnSalaryReport 
  }
`)

export default function useFetchGetIsPrintDetailDisplayOnSalaryReport() {
  return useQuery(GET_PRINT_DETAIL_DISPLAY_ON_SALARY_REPORT, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
