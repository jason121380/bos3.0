import { gql, useQuery } from '@apollo/client'

const GET_IS_CUSTOMER_PROFILE_SYNC = gql`
  query GET_IS_CUSTOMER_PROFILE_SYNC {
    getIsCustomerProfileSync
  }
`

export default function useFetchGetIsCustomerProfileSync() {
  return useQuery(GET_IS_CUSTOMER_PROFILE_SYNC, {
    fetchPolicy: 'cache-and-network',
  })
}