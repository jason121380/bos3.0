import { gql, useQuery } from '@apollo/client'

const GET_BOOKING_REMARK_DISPLAY = gql`
  query GET_BOOKING_REMARK_DISPLAY {
    getIsBookingRemarkDisplay
  }
`

export default function useFetchGetIsBookingRemarkDisplay() {
  return useQuery(GET_BOOKING_REMARK_DISPLAY, {
    fetchPolicy: 'cache-and-network',
  })
}
