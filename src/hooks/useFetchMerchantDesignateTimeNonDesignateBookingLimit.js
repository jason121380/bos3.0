import { gql, useQuery } from '@apollo/client'

const FETCH_NON_DESIGNATE_BOOKING_LIMIT = gql`
  query FETCH_NON_DESIGNATE_BOOKING_LIMIT($date: DateTime) {
    merchantDesignateTimeNonDesignateBookingLimit(date: $date) {
      date
      limit
    }
  }
`

export default function useFetchNonDesignateBookingLimit({ date }) {
  return useQuery(FETCH_NON_DESIGNATE_BOOKING_LIMIT, {
    variables: {
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}
