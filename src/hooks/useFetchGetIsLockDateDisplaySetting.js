import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_IS_LOCK_DATE_DISPLAY = settingsQuery(gql`
  query GET_IS_LOCK_DATE_DISPLAY {
    getIsDateLockDisplay
  }
`)

export default function useFetchGetIsLockDateDisplaySetting() {
  return useQuery(GET_IS_LOCK_DATE_DISPLAY, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
