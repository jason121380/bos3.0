import { gql, useQuery, useLazyQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_IS_ZERO_VALUE_HIDDEN_ON_DAILY_REPORT = settingsQuery(gql`
  query GET_IS_ZERO_VALUE_HIDDEN_ON_DAILY_REPORT {
    getIsZeroValueHiddenOnDailyReport
  }
`)

export default function useFetchGetIsZeroValueHiddenOnDailyReport() {
  return useQuery(GET_IS_ZERO_VALUE_HIDDEN_ON_DAILY_REPORT, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
export function useFetchGetIsZeroValueHiddenOnDailyReportLazy() {
  const [
    fetchGetIsZeroValueHiddenOnDailyReportLazy,
    getIsZeroValueHiddenOnDailyReportLazyData,
  ] = useLazyQuery(GET_IS_ZERO_VALUE_HIDDEN_ON_DAILY_REPORT, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
  return { fetchGetIsZeroValueHiddenOnDailyReportLazy, getIsZeroValueHiddenOnDailyReportLazyData }
}
