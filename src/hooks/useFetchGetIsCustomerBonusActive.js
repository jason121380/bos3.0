import { gql, useQuery, useLazyQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_CUSTOMER_BONUS = settingsQuery(gql`
  query GET_CUSTOMER_BONUS {
    getIsCustomerBonusActive
  }
`)

export default function useFetchGetIsCustomerBonusActive() {
  return useQuery(GET_CUSTOMER_BONUS, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

export function useFetchGetIsCustomerBonusActiveLazy() {
  const [customerBonusActiveLazy, customerBonusActiveData] = useLazyQuery(GET_CUSTOMER_BONUS, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
  return [customerBonusActiveLazy, customerBonusActiveData]
}