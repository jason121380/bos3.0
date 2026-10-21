import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_USER_PINNED_TABLE_SETTING = settingsQuery(gql`
  query GET_USER_PINNED_TABLE_SETTING {
    getUserPinnedTableSettings {
      usingStoreIds
      pinnedSettings
    }
  }
`)

export default function useFetchGetUserPinnedTableSettings() {
  return useQuery(GET_USER_PINNED_TABLE_SETTING, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
