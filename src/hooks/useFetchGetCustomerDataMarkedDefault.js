import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_CUSTOMER_DATA_MARKED = settingsQuery(gql`
  query GET_CUSTOMER_DATA_MARKED {
    getCustomerDataMarkedDefault
  }
`)

export default function useFetchCustomerDataMarked() {
  return useQuery(GET_CUSTOMER_DATA_MARKED, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
