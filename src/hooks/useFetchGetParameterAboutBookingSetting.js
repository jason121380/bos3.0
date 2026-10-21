import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_PARAMETER_ABOUT_BOOKING_SETTING = settingsQuery(gql`
  query GET_PARAMETER_ABOUT_BOOKING_SETTING {
    getParameterAboutBookingSetting {
      nonDesignationOrderLimit
      designationOrderLimit
      isBookingAutoAccept
      isNDBNeedVerify
      isCustomerBookedableInSameDay
      isRTCUsing
      isBookingRemarkDisplay
      isCusBookingRemarkDisplay
      isBirthdayIconDisplay
      bookingLimitPerCellphoneInSameDay
      disableBookingDayLimit
      createBookingDayLimit
      cancelBookingDayLimitByActionDate
      cancelBookingDayLimitByServiceDate
      bookingTimeSetting {
        openingHours
        closingHours
      }
      troubleShooting
      SMSAccount {
        account
        password
      }
      bookingNotificationPhone
      bookingNotificationLine {
        isUsing
        notifyDayCount
      }
      inviteRatingDayCount
      cusRatingDayLimit
      isBookingHistoryDisplay
      isDynamicBookingLimitUsing
      cusMaxBookingCount
      isNDBInLimitCount
    }
  }
`)

export default function useFetchGetParameterAboutBookingSetting() {
  return useQuery(GET_PARAMETER_ABOUT_BOOKING_SETTING, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

const GET_BOOKING_HISTORY_DISPLAY = settingsQuery(gql`
  query GET_BOOKING_HISTORY_DISPLAY {
    getParameterAboutBookingSetting {
      isBookingHistoryDisplay
    }
  }
`)

export function useFetchGetBookinHistoryDisplay() {
  return useQuery(GET_BOOKING_HISTORY_DISPLAY, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
