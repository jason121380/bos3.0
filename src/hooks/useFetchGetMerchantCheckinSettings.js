import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_MERCHANT_CHECKIN_SETTING = settingsQuery(gql`
  query GET_MERCHANT_CHECKIN_SETTING {
    getMerchantCheckinSettings {
      isBookingCheckinEnabled
      isDoneBookingAutoNotify
      isUnDoneBookingAutoNotify
      isUnDoneBookingManualNotify
    }
  }
`)

export default function useFetchGetMerchantCheckinSettings() {
  return useQuery(GET_MERCHANT_CHECKIN_SETTING, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_CHECKIN_SETTING_FOR_MANAGEMENT_LIST = settingsQuery(gql`
  query GET_CHECKIN_SETTING_FOR_MANAGEMENT_LIST {
    getMerchantCheckinSettings {
      isBookingCheckinEnabled
    }
  }
`)

export function useFetchGetCheckinSettingsForManagementList() {
  return useQuery(GET_CHECKIN_SETTING_FOR_MANAGEMENT_LIST, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_CHECKIN_SETTING_FOR_CALENDAR = settingsQuery(gql`
  query GET_CHECKIN_SETTING_FOR_CALENDAR {
    getMerchantCheckinSettings {
      isBookingCheckinEnabled
      isUnDoneBookingManualNotify
    }
  }
`)

export function useFetchGetCheckinSettingsForCalendar() {
  return useQuery(GET_CHECKIN_SETTING_FOR_CALENDAR, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
