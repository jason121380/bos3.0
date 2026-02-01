import { gql, useQuery } from '@apollo/client'

const GET_BOOKING_MANAGEMENT = gql`
  query GET_BOOKING_MANAGEMENT($input: BookingManagementInput!) {
    bookingManagement(input: $input) {
      pageLimit
      pageOffset
      totalCount
      bookings {
        id
        isDesignate
        date
        status
        source
        isCheckin
        isCusCheckRequired
        customer {
          name
          cellphone
          isAlive
        }
        designer {
          name
          designerNo
        }
        no
        isDone
        createdOrderId
      }
    }
  }
`

export default function useFetchGetBookingManagement(input) {
  return useQuery(GET_BOOKING_MANAGEMENT, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}