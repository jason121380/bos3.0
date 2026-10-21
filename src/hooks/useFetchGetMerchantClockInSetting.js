import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_MERCHANT_CLOCK_IN_SETTING = settingsQuery(gql`
  query GET_MERCHANT_CLOCK_IN_SETTING {
    getMerchantClockInSetting {
      name
      clockInHour
      clockInMinute
      isClockInUsing
      clockOutHour
      clockOutMinute
      isClockOutUsing
      breakTimeSetting {
        startHour
        startMinute
        isStartTimeUsing
        endHour
        endMinute
        isEndTimeHourUsing
      }
      allowedDelayMinutes
      color
      isWorkOverMinutesCalculated
      isClockOutBufferMinutesUsing
      clockOutBufferMinutes
    }
  }
`)

export default function useFetchGetMerchantClockInSetting() {
  return useQuery(GET_MERCHANT_CLOCK_IN_SETTING, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

export const GET_MERCHANT_CLOCK_IN_SCHEDULE = settingsQuery(gql`
  query GET_MERCHANT_CLOCK_IN_SCHEDULE {
    getMerchantClockInSetting {
      id
      name
      clockInHour
      clockInMinute
      clockOutHour
      clockOutMinute
      color
    }
  }
`)

export function useFetchGetMerchantClockInSchedule() {
  return useQuery(GET_MERCHANT_CLOCK_IN_SCHEDULE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
