import { gql, useQuery } from '@apollo/client'

const GET_THIRD_PART_DISPLAY = gql`
  query GET_THIRD_PART_DISPLAY {
    getIsThirdPartTicketDisplay
  }
`

export default function useFetchGetThirdPartTicketSetting() {
  return useQuery(GET_THIRD_PART_DISPLAY, {
    fetchPolicy: 'cache-and-network',
  })
}
