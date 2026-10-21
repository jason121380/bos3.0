import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_IS_DISPLAY_HELPER_RETRIEVE_DAILY_REPORT = settingsQuery(gql`
  query GET_IS_DISPLAY_HELPER_RETRIEVE_DAILY_REPORT {
    getIsDisplayHelperRetrieveInDailyReport
  }
`)

export default function useFetchGetIsDisplayHelperRetrieveInDailyReport() {
  return useQuery(GET_IS_DISPLAY_HELPER_RETRIEVE_DAILY_REPORT, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
