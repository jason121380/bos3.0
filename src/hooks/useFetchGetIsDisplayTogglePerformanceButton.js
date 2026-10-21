import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON = settingsQuery(gql`
  query GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON {
    getIsDisplayTogglePerformanceButton
  }
`)

export default function useFetchGetIsDisplayTogglePerformanceButton() {
  return useQuery(GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}