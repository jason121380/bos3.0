import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_PARTICIPATING_LIST = gql`
  query GET_MERCHANT_PARTICIPATING_LIST {
    merchantParticipatingList {
      id
      name
      merchantList {
        id
        name
        joinTime
      }
    }
}
`

export default function useFetchGetMerchantParticipatingList() {
  return useQuery(GET_MERCHANT_PARTICIPATING_LIST, {
    fetchPolicy: 'cache-and-network',
  })
}
