import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_SPECIFIC_BOOKING_NOTIFICATION_DAY_COUNT = settingsQuery(gql`
  query GET_SPECIFIC_BOOKING_NOTIFICATION_DAY_COUNT {
    getSpecificBookingNotificationDayCount
  }
`)

export default function useFetchGetSpecificBookingNotificationDayCount() {
  return useQuery(GET_SPECIFIC_BOOKING_NOTIFICATION_DAY_COUNT, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
