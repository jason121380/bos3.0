import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_IS_BOOKING_TYPE_FOR_SOCKET = settingsQuery(gql`
  query GET_IS_BOOKING_TYPE_FOR_SOCKET {
    getBookingTypeForSocket
  }
`)

export default function useFetchGetBookingTypeForSocket() {
  return useQuery(GET_IS_BOOKING_TYPE_FOR_SOCKET, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
