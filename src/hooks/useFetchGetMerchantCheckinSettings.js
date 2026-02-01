import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_CHECKIN_SETTING = gql`
  query GET_MERCHANT_CHECKIN_SETTING {
    getMerchantCheckinSettings {
      isBookingCheckinEnabled
      isDoneBookingAutoNotify
      isUnDoneBookingAutoNotify
      isUnDoneBookingManualNotify
    }
  }
`

export default function useFetchGetMerchantCheckinSettings() {
  return useQuery(GET_MERCHANT_CHECKIN_SETTING, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_CHECKIN_SETTING_FOR_MANAGEMENT_LIST = gql`
  query GET_CHECKIN_SETTING_FOR_MANAGEMENT_LIST {
    getMerchantCheckinSettings {
      isBookingCheckinEnabled
    }
  }
`

export function useFetchGetCheckinSettingsForManagementList() {
  return useQuery(GET_CHECKIN_SETTING_FOR_MANAGEMENT_LIST, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_CHECKIN_SETTING_FOR_CALENDAR = gql`
  query GET_CHECKIN_SETTING_FOR_CALENDAR {
    getMerchantCheckinSettings {
      isBookingCheckinEnabled
      isUnDoneBookingManualNotify
    }
  }
`

export function useFetchGetCheckinSettingsForCalendar() {
  return useQuery(GET_CHECKIN_SETTING_FOR_CALENDAR, {
    fetchPolicy: 'cache-and-network',
  })
}
