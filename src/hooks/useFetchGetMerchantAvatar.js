import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_MERCHANT_AVATAR = settingsQuery(gql`
  query GET_MERCHANT_AVATAR($input: ID!) {
    getMerchantAvatar(input: $input)
  }
`)

export default function useFetchGetMerchantAvatar({ input }) {
  return useQuery(GET_MERCHANT_AVATAR, {
    variables: {
      input,
    },
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
