import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'
const GET_MERCHANT_REVERVATION_TIME = settingsQuery(gql`
  query GET_MERCHANT_REVERVATION_TIME {
    getMerchantReservationTime {
      title
      useDay
      openingHours
      closingHours
    }
  }
`)

export default function useFetchGetMerchantReservationTime() {
  return useQuery(GET_MERCHANT_REVERVATION_TIME, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}