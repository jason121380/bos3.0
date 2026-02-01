import { gql, useQuery } from '@apollo/client'

export const GET_MERCHANT_FAKE_PERFORMANCE_REFER = gql`
  query GET_MERCHANT_FAKE_PERFORMANCE_REFER {
    getMerchantFakePerformanceReference
  }
`

export default function useFetchMerchantFakePerformanceRefer() {
  return useQuery(GET_MERCHANT_FAKE_PERFORMANCE_REFER, {
    fetchPolicy: 'cache-and-network',
  })
}
