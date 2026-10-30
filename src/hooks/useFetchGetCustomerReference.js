import { gql, useQuery, useLazyQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_CUSTOMER_REFERENCE = settingsQuery(gql`
  query GET_CUSTOMER_REFERENCE {
    getCustomerReference
  }
`)

export default function useFetchGetCustomerReference() {
  return useQuery(GET_CUSTOMER_REFERENCE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

export function useFetchGetCustomerReferenceLazy() {
  const [getReferenceLazy, referenceLazyData] = useLazyQuery(GET_CUSTOMER_REFERENCE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
  return [getReferenceLazy, referenceLazyData]
}
