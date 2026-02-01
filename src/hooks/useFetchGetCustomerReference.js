import { gql, useQuery, useLazyQuery } from '@apollo/client'

const GET_CUSTOMER_REFERENCE = gql`
  query GET_CUSTOMER_REFERENCE {
    getCustomerReference
  }
`

export default function useFetchGetCustomerReference() {
  return useQuery(GET_CUSTOMER_REFERENCE, {
    fetchPolicy: 'cache-and-network',
  })
}

export function useFetchGetCustomerReferenceLazy() {
  const [ getReferenceLazy, referenceLazyData ] = useLazyQuery(GET_CUSTOMER_REFERENCE, {
    fetchPolicy: 'cache-and-network',
  })
  return [ getReferenceLazy, referenceLazyData ]
}