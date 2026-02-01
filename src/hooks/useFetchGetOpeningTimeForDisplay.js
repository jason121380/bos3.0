import { gql, useQuery } from '@apollo/client'

const GET_OPENING_TIME_FOR_DISPLAY = gql`
  query GET_OPENING_TIME_FOR_DISPLAY {
    getOpeningTimeForDisplay {
      openingHoursForDisplay
      closingHoursForDisplay
    }
  }
`

export default function useFetchGetOpeningTimeForDisplay() {
  return useQuery(GET_OPENING_TIME_FOR_DISPLAY, {
    fetchPolicy: 'cache-and-network',
  })
}