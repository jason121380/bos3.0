import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_MERCHANT_EXTERNAL_LINK = settingsQuery(gql`
  query GET_MERCHANT_EXTERNAL_LINK {
    merchantExternalLink {
      id
      name
      url
      userAuth {
        id
        authorityName
      }
    }
  }
`)

export default function useFetchGetMerchantExternalLink() {
  return useQuery(GET_MERCHANT_EXTERNAL_LINK, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}