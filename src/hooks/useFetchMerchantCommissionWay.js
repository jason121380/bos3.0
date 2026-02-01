import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_COMMISSION_ITEMS = gql`
  query MERCHANT_COMMISSION_WAY($merchantId: ID!) {
    merchantCommissionWay(merchantId: $merchantId) {
      id
      name
      basisForDeduction
    }
  }
`

export default function useFetchMerchantCommissionWay() {
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null

  return useQuery(GET_MERCHANT_COMMISSION_ITEMS, {
    variables: {
      merchantId,
    },
    fetchPolicy: 'cache-and-network',
  })
}
