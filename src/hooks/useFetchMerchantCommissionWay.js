import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_MERCHANT_COMMISSION_ITEMS = settingsQuery(gql`
  query MERCHANT_COMMISSION_WAY($merchantId: ID!) {
    merchantCommissionWay(merchantId: $merchantId) {
      id
      name
      basisForDeduction
    }
  }
`)

export default function useFetchMerchantCommissionWay() {
  const merchantId = localStorage.getItem('userMerchant') ? JSON.parse(localStorage.getItem('userMerchant')).id : null

  return useQuery(GET_MERCHANT_COMMISSION_ITEMS, {
    variables: {
      merchantId,
    },
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
