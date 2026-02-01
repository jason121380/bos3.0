import { gql, useQuery } from '@apollo/client'

const GET_IS_BOOKING_LIMIT_PER_CELLPHONE_IN_SAME_DAY = gql`
  query getIsBookingLimitPerCellphoneInSameDay {
    getIsBookingLimitPerCellphoneInSameDay
  }
`

export default function useFetchGetIsBookingLimitPerCellphoneInSameDay() {
  return useQuery(GET_IS_BOOKING_LIMIT_PER_CELLPHONE_IN_SAME_DAY, {
    fetchPolicy: 'cache-and-network',
  })
}