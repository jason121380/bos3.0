import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_HELPER_ITEMS = gql`
  query MERCHANT_HELPER_ITEMS($merchantId: ID!) {
    merchantHelperItems(merchantId: $merchantId) {
      type
      name
    }
  }
`

export default function useFetchMerchantHelperItems() {
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null
  return useQuery(GET_MERCHANT_HELPER_ITEMS, {
    variables: {
      merchantId,
    },
    fetchPolicy: 'cache-and-network',
  })
}
