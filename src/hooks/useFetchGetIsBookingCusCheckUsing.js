import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_IS_BOOKING_CUS_CHECK_USING = settingsQuery(gql`
  query GET_IS_BOOKING_CUS_CHECK_USING {
    getIsBookingCusCheckUsing
  }
`)

export default function useFetchGetIsBookingCusCheckUsing() {
  return useQuery(GET_IS_BOOKING_CUS_CHECK_USING, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
