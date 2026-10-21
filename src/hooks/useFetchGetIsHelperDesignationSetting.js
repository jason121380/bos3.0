import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_HELPER_DESIGNATION_DISPLAY = settingsQuery(gql`
  query GET_HELPER_DESIGNATION_DISPLAY {
    getIsHelperDesignationDisplay
  }
`)

export default function useFetchGetIsHelperDesignationSetting() {
  return useQuery(GET_HELPER_DESIGNATION_DISPLAY, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
