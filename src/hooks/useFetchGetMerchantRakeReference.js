import { gql, useQuery } from '@apollo/client'

export const GET_MERCHANT_RAKE_REFERENCE = gql`
  query GET_MERCHANT_RAKE_REFERENCE {
    getMerchantRakeReference {
      designate
      nonDesignate
    }
  }
`

export default function useFetchGetMerchantRakeReference() {
  return useQuery(GET_MERCHANT_RAKE_REFERENCE, {
    fetchPolicy: 'cache-and-network',
  })
}
