import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_IS_REPORT_LIST_EXTENDED = settingsQuery(gql`
  query GET_IS_REPORT_LIST_EXTENDED {
    getIsReportListExtended
  }
`)

export default function useFetchGetIsReportListExtended() {
  return useQuery(GET_IS_REPORT_LIST_EXTENDED, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}