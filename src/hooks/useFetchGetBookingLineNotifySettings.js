import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_BOOKING_LINE_NOTIFY_SETTINGS = settingsQuery(gql`
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
`)

export default function useFetchGetBookingLineNotifySettings() {
  return useQuery(GET_BOOKING_LINE_NOTIFY_SETTINGS, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
