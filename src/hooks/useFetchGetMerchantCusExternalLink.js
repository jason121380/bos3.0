import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_MERCHANT_CUS_EXTERNAL_LINK = settingsQuery(gql`
  query MerchantCusExternalLink($isReplace: Boolean) {
    merchantCusExternalLink(isReplace: $isReplace) {
      id
      name
      url
      isTop
    }
  }
`)

export default function useFetchGetMerchantCusExternalLink() {
  return useQuery(GET_MERCHANT_CUS_EXTERNAL_LINK, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}