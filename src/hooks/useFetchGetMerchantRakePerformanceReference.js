import { gql, useQuery } from '@apollo/client'

export const GET_MERCHANT_FAKE_PERFORMANCE_RAKE = gql`
  query GET_MERCHANT_FAKE_PERFORMANCE_RAKE {
    getMerchantRakePerformanceReference
  }
`

export default function useFetchMerchantFakePerformanceRake() {
  return useQuery(GET_MERCHANT_FAKE_PERFORMANCE_RAKE, {
    fetchPolicy: 'cache-and-network',
  })
}
