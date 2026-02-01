import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_PAYMENT = gql`
  query merchantPayWays {
    merchantPayWays {
      id
      type
      name
      fee
    }
  }
`

export default function useFetchMerchantPayWays() {
  return useQuery(GET_MERCHANT_PAYMENT)
}
