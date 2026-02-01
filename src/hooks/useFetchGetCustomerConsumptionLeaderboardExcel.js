import { gql, useLazyQuery } from '@apollo/client'

const GET_CUSTOMER_CONSUMPYION_LEADERBOARD_EXECEL = gql`
  query GET_CUSTOMER_CONSUMPYION_LEADERBOARD_EXECEL($input: CustomerConsumptionLeaderboardInput!) {
    customerConsumptionLeaderboardExcel(input: $input) 
  }
`

export default function useFetchGetCustomerConsumptionLeaderboardExcel() {
  const [getCustomerConsumptionExcel, customerConsumptionDataExcel] = useLazyQuery(GET_CUSTOMER_CONSUMPYION_LEADERBOARD_EXECEL, {
    fetchPolicy: 'cache-and-network',
  })
  return [getCustomerConsumptionExcel, customerConsumptionDataExcel]
}
