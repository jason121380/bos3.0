import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_IS_CBRD_STYLIST = settingsQuery(gql`
  query GET_IS_CBRD_STYLIST {
    getIsCBRDStylist
  }
`)

export default function useFetchGetIsCBRDStylist() {
  return useQuery(GET_IS_CBRD_STYLIST, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
