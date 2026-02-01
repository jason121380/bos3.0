import { gql, useLazyQuery } from '@apollo/client'

const CHECK_IS_CUSTOMER_EXIST = gql`
  query CHECK_IS_CUSTOMER_EXIST($input: ExistForOuterStoreInput) {
    checkIsCustomerExistForOuterStore(input: $input) {
      isExist
      customerName
    }
  }
`

export default function useFetchCheckIsCustomerExistForOuterStore() {
  const [checkExist, checkExistData] = useLazyQuery(CHECK_IS_CUSTOMER_EXIST, {
    fetchPolicy: 'cache-and-network',
  })
  return [checkExist, checkExistData]
}