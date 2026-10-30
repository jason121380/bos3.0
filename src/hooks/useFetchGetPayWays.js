import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_PAY_WAYS = settingsQuery(gql`
  query GET_PAY_WAYS {
    payWays {
      value
      label
    }
  }
`)

export default function useFetchGetPayWays() {
  return useQuery(GET_PAY_WAYS, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
