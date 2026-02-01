import { gql, useQuery } from '@apollo/client'

const GET_ORDER_WITHOUT_CUSTOMER_SETTING = gql`
  query GET_ORDER_WITHOUT_CUSTOMER_SETTING {
    orderWithoutCustomerDefault
  }
`

export default function useFetchOrderWithoutCustomerSetting() {
  return useQuery(GET_ORDER_WITHOUT_CUSTOMER_SETTING, {
    fetchPolicy: 'cache-and-network',
  })
}
