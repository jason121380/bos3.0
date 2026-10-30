import { gql, useQuery, useLazyQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_IS_MEMBERSHIP_CARD_ACTIVE = settingsQuery(gql`
  query GET_IS_MEMBERSHIP_CARD_ACTIVE {
    getIsMemberShipCardActive
  }
`)

export default function useFetchGetIsMemberShipCardActive() {
  return useQuery(GET_IS_MEMBERSHIP_CARD_ACTIVE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

export function useFetchGetIsMemberShipCardActiveLazy() {
  const [memberActiveLazy, memberActiveLazyData] = useLazyQuery(GET_IS_MEMBERSHIP_CARD_ACTIVE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
  return { memberActiveLazy, memberActiveLazyData }
}
