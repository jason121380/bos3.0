import { gql, useLazyQuery } from '@apollo/client'

export const GET_CHECK_IS_CUSTOMER_NO_USED = gql`
  query GET_CHECK_IS_CUSTOMER_NO_USED($input: String, $customerId: ID) {
    checkIsCustomerNoUsed(input: $input, customerId: $customerId)
  }
`

export default function useFetchGetCheckIsCustomerNoUsed() {
  const [checkIsCustomerNoUsedLazy, checkIsCustomerNoUsedLazyData] = useLazyQuery(GET_CHECK_IS_CUSTOMER_NO_USED, {
    fetchPolicy: 'cache-and-network',
  })
  return [checkIsCustomerNoUsedLazy, checkIsCustomerNoUsedLazyData]
}
