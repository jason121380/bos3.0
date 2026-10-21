import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_THIRD_PART_DISPLAY = settingsQuery(gql`
  query GET_THIRD_PART_DISPLAY {
    getIsThirdPartTicketDisplay
  }
`)

export default function useFetchGetThirdPartTicketSetting() {
  return useQuery(GET_THIRD_PART_DISPLAY, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
