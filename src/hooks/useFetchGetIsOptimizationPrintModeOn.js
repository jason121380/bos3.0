import { gql, useQuery } from '@apollo/client'

const GET_IS_OPTIMIZATION_PRINT_MODES = gql`
  query GET_IS_OPTIMIZATION_PRINT_MODES {
    getIsOptimizationPrintModeOn
  }
`

export default function useFetchGetIsOptimizationPrintModeOn() {
  return useQuery(GET_IS_OPTIMIZATION_PRINT_MODES, {
    fetchPolicy: 'cache-and-network',
  })
}
