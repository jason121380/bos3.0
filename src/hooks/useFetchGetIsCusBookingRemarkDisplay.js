import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_CUS_BOOKING_REMARK_DISPLAY = settingsQuery(gql`
  query GET_CUS_BOOKING_REMARK_DISPLAY {
    getIsCusBookingRemarkDisplay
  }
`)

export default function useFetchGetIsCusBookingRemarkDisplay() {
  return useQuery(GET_CUS_BOOKING_REMARK_DISPLAY, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
