import { gql, useQuery } from '@apollo/client'

const GET_USER_PINNED_TABLE_SETTING = gql`
  query GET_USER_PINNED_TABLE_SETTING {
    getUserPinnedTableSettings {
      usingStoreIds
      pinnedSettings
    }
  }
`

export default function useFetchGetUserPinnedTableSettings() {
  return useQuery(GET_USER_PINNED_TABLE_SETTING, {
    fetchPolicy: 'cache-and-network',
  })
}
