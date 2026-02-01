import { gql, useQuery } from '@apollo/client'

const GET_BOOKING_TIME_SETTING = gql`
  query GET_BOOKING_TIME_SETTING {
    getBookingTimeSetting {
      openingHours
      closingHours
    }
  }
`

export default function useFetchGetBookingTimeSetting() {
  return useQuery(GET_BOOKING_TIME_SETTING, {
    fetchPolicy: 'cache-and-network',
  })
}