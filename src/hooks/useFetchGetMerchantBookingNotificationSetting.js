import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_MERCHANT_BOOKINNG_NOTIFICATION_SETTING = settingsQuery(gql`
  query GET_MERCHANT_BOOKINNG_NOTIFICATION_SETTING {
    getMerchantBookingNotificationSetting {
      customerCreateBooking {
        customer
        designer
        merchant
      }
      customerCancelBooking {
        customer
        designer
        merchant
      }
      designerCreateBooking {
        customer
        designer
        merchant
      }
      designerCancelBooking {
        customer
        designer
        merchant
      }
      bookingUpdated {
        customer
        designer
        merchant
      }
    }
  }
`)

export default function useFetchGetMerchantBookingNotificationSetting() {
  return useQuery(GET_MERCHANT_BOOKINNG_NOTIFICATION_SETTING, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}