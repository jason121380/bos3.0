import { gql, useQuery } from '@apollo/client'

export const GET_MERCHANT_DEDUCTION_ITEMS = gql`
  query MERCHANT_DEDUCTION_ITEMS($merchantId: ID!) {
    merchantDeductionItems(merchantId: $merchantId) {
      type
      name
    }
  }
`

export default function useFetchMerchantDeductionItems() {
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null
  return useQuery(GET_MERCHANT_DEDUCTION_ITEMS, {
    variables: {
      merchantId,
    },
    fetchPolicy: 'cache-and-network',
  })
}
