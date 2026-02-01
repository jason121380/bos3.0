import { gql, useQuery } from '@apollo/client'

export const GET_MERCHANT_CLOCK_IN_SETTING = gql`
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
`

export default function useFetchGetMerchantClockInSetting() {
  return useQuery(GET_MERCHANT_CLOCK_IN_SETTING, {
    fetchPolicy: 'cache-and-network',
  })
}

export const GET_MERCHANT_CLOCK_IN_SCHEDULE = gql`
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
`

export function useFetchGetMerchantClockInSchedule() {
  return useQuery(GET_MERCHANT_CLOCK_IN_SCHEDULE, {
    fetchPolicy: 'cache-and-network',
  })
}
