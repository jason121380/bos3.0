import { gql, useQuery } from '@apollo/client'

const GET_NONDESIGNATE_BOOKING_RECIOIENTS = gql`
  query GET_NONDESIGNATE_BOOKING_RECIOIENTS {
    nonDesignateBookingRecipients {
      id
      name
    }
  }
`

export default function useFetchGetNonDesignateBookingRecipients() {
  return useQuery(GET_NONDESIGNATE_BOOKING_RECIOIENTS, {
    fetchPolicy: 'cache-and-network',
  })
}