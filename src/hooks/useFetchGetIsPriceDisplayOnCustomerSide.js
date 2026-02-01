import { gql, useQuery } from '@apollo/client'

const GET_IS_PRICE_DISPLAY_CUSTOMER_SIDE = gql`
  query GET_IS_PRICE_DISPLAY_CUSTOMER_SIDE {
    getIsPriceDisplayOnCustomerSide
  }
`

export default function useFetchGetIsPriceDisplayOnCustomerSide() {
  return useQuery(GET_IS_PRICE_DISPLAY_CUSTOMER_SIDE, {
    fetchPolicy: 'cache-and-network',
  })
}