import { gql, useQuery } from '@apollo/client'

export const GET_IS_BOOKING_CUS_CHECK_USING = gql`
  query GET_IS_BOOKING_CUS_CHECK_USING {
    getIsBookingCusCheckUsing
  }
`

export default function useFetchGetIsBookingCusCheckUsing() {
  return useQuery(GET_IS_BOOKING_CUS_CHECK_USING, {
    fetchPolicy: 'cache-and-network',
  })
}
