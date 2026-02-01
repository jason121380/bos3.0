import { gql, useQuery } from '@apollo/client'

const GET_USER_MERCHANTS = gql`
  query GET_USER_MERCHANTS {
    getUserMerchant 
  }
`

export default function useFetchGetGetUserMerchant() {
  return useQuery(GET_USER_MERCHANTS, {
    fetchPolicy: 'cache-and-network',
  })
}