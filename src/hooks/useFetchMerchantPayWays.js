import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_MERCHANT_PAYMENT = settingsQuery(gql`
  query merchantPayWays {
    merchantPayWays {
      id
      type
      name
      fee
    }
  }
`)

export default function useFetchMerchantPayWays() {
  return useQuery(GET_MERCHANT_PAYMENT, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
