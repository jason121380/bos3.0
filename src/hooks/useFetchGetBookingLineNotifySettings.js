import { gql, useQuery } from '@apollo/client'

const GET_BOOKING_LINE_NOTIFY_SETTINGS = gql`
  query GetBookingLineNotifySettings {
  getBookingLineNotifySettings {
    cusCreateBooking {
      customer
      designer
      merchant
    }
    cusCancelBooking {
      customer
      designer
      merchant
    }
    designerCreateBooking {
      customer
      designer
      merchant
    }
    designerCancelBooking {
      customer
      designer
      merchant
    }
    bookingUpdated {
      customer
      designer
      merchant
    }
  }
}
`

export default function useFetchGetBookingLineNotifySettings() {
  return useQuery(GET_BOOKING_LINE_NOTIFY_SETTINGS, {
    fetchPolicy: 'cache-and-network'
  })
}