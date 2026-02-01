import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_BOOKINNG_NOTIFICATION_SETTING = gql`
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
`

export default function useFetchGetMerchantBookingNotificationSetting() {
  return useQuery(GET_MERCHANT_BOOKINNG_NOTIFICATION_SETTING, {
    fetchPolicy: 'cache-and-network',
  })
}