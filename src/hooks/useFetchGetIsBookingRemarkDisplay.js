import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_BOOKING_REMARK_DISPLAY = settingsQuery(gql`
  query GET_BOOKING_REMARK_DISPLAY {
    getIsBookingRemarkDisplay
  }
`)

export default function useFetchGetIsBookingRemarkDisplay() {
  return useQuery(GET_BOOKING_REMARK_DISPLAY, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
