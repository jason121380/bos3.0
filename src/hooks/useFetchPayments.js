import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_PAYMENTS = settingsQuery(gql`
  query PAYMENTS {
    merchantPayWays {
      id
      type
      name
      fee
      amountType
      isNoCash
    }
  }
`)

export default function useFetchPayments() {
  const { data, error, loading, refetch } = useQuery(GET_PAYMENTS, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
  return { data, error, loading, refetch }
}
