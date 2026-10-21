import { gql, useQuery, useLazyQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_IS_EPWD_DISPLAY = settingsQuery(gql`
  query GET_IS_EPWD_DISPLAY {
    getIsEPWDDisplay
  }
`)

export default function useFetchGetIsEPWDDisplay() {
  return useQuery(GET_IS_EPWD_DISPLAY, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
export function useFetchGetIsEPWDDisplayLazy() {
  const [getIsEPWDDisplayLazy, getIsEPWDDisplayLazyData] = useLazyQuery(GET_IS_EPWD_DISPLAY, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
  return [getIsEPWDDisplayLazy, getIsEPWDDisplayLazyData]
}
