import { gql, useQuery } from '@apollo/client'

const GET_CUS_BOOKING_REMARK_DISPLAY = gql`
  query GET_CUS_BOOKING_REMARK_DISPLAY {
    getIsCusBookingRemarkDisplay
  }
`

export default function useFetchGetIsCusBookingRemarkDisplay() {
  return useQuery(GET_CUS_BOOKING_REMARK_DISPLAY, {
    fetchPolicy: 'cache-and-network',
  })
}
