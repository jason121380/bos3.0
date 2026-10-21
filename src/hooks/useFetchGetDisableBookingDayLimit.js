import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_DISABLE_BOOKING_DAY_LIMIT = settingsQuery(gql`
  query GET_DISABLE_BOOKING_DAY_LIMIT {
    getDisableBookingDayLimit
  }
`)

export default function useFetchGetDisableBookingDayLimit() {
  return useQuery(GET_DISABLE_BOOKING_DAY_LIMIT, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
