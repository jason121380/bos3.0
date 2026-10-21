import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_NONDESIGNATE_BOOKING_RECIOIENTS = settingsQuery(gql`
  query GET_NONDESIGNATE_BOOKING_RECIOIENTS {
    nonDesignateBookingRecipients {
      id
      name
    }
  }
`)

export default function useFetchGetNonDesignateBookingRecipients() {
  return useQuery(GET_NONDESIGNATE_BOOKING_RECIOIENTS, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}