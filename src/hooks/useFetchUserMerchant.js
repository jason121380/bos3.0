import { gql, useQuery } from '@apollo/client'

const FETCH_USER_MERCHANT = gql`
  {
    userMerchants {
      id
      name
      solmateKey
    }
  }
`

export default function useFetchUserMerchant() {
  return useQuery(FETCH_USER_MERCHANT)
}
