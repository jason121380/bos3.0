import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_DESIGNER_NAME_FOR_REPORT_TYPE = settingsQuery(gql`
  query GET_DESIGNER_NAME_FOR_REPORT_TYPE {
    getDesignerNameForReportType
  }
`)

export default function useFetchGetDesignerNameForReportType() {
  return useQuery(GET_DESIGNER_NAME_FOR_REPORT_TYPE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
