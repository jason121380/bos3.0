import { gql, useQuery } from '@apollo/client'

const GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING = gql`
  query GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING {
    getBindedThirdPartTicketLockedSetting {
      service
      product
      membership
    }
  }
`

export default function useFetchGetIsDisplayTogglePerformanceButton() {
  return useQuery(GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING, {
    fetchPolicy: 'cache-and-network',
  })
}