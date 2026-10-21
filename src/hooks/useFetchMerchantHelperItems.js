import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_MERCHANT_HELPER_ITEMS = settingsQuery(gql`
  query MERCHANT_HELPER_ITEMS($merchantId: ID!) {
    merchantHelperItems(merchantId: $merchantId) {
      type
      name
    }
  }
`)

export default function useFetchMerchantHelperItems() {
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null
  return useQuery(GET_MERCHANT_HELPER_ITEMS, {
    variables: {
      merchantId,
    },
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
