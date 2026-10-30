import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING = settingsQuery(gql`
  query GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING {
    getBindedThirdPartTicketLockedSetting {
      service
      product
      membership
    }
  }
`)

export default function useFetchGetIsDisplayTogglePerformanceButton() {
  return useQuery(GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
