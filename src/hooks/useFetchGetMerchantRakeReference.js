import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_MERCHANT_RAKE_REFERENCE = settingsQuery(gql`
  query GET_MERCHANT_RAKE_REFERENCE {
    getMerchantRakeReference {
      designate
      nonDesignate
    }
  }
`)

export default function useFetchGetMerchantRakeReference() {
  return useQuery(GET_MERCHANT_RAKE_REFERENCE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
