import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_MERCHANT_FAKE_PERFORMANCE_REFER = settingsQuery(gql`
  query GET_MERCHANT_FAKE_PERFORMANCE_REFER {
    getMerchantFakePerformanceReference
  }
`)

export default function useFetchMerchantFakePerformanceRefer() {
  return useQuery(GET_MERCHANT_FAKE_PERFORMANCE_REFER, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
