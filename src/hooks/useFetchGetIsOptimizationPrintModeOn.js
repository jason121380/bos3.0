import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_IS_OPTIMIZATION_PRINT_MODES = settingsQuery(gql`
  query GET_IS_OPTIMIZATION_PRINT_MODES {
    getIsOptimizationPrintModeOn
  }
`)

export default function useFetchGetIsOptimizationPrintModeOn() {
  return useQuery(GET_IS_OPTIMIZATION_PRINT_MODES, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
