import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_PARAMETER_ABOUT_CUSTOMER_SETTING = settingsQuery(gql`
  query GET_PARAMETER_ABOUT_CUSTOMER_SETTING {
    getParameterAboutCustomerSetting {
      customerSidePageDisplay {
        ServiceRecord
        TicketRecord
        WalletRecord
        BonusRecord
        CustomerMall
      }
      isCustomerProfileSync
      isArrowDisplayForLine
      isNRCDisplayForNewCus
      requiredColumnForNewCustomer
      isRemarkRequired
      isCusBookingPreferDesOnly
      isCusNonDesBookingUsing
      isBookingItemRequired
      closeCustomerBooking
      isBookingPeerDisplay
      isBookingItemPriceDisplay
      bookingMinumnTimeCost
    }
  }
`)

export default function useFetchGetParameterAboutCustomerSetting() {
  return useQuery(GET_PARAMETER_ABOUT_CUSTOMER_SETTING, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
