import { gql, useLazyQuery } from '@apollo/client'

const GET_CUSTOMER_WALLET_LEADERBOARD_EXECEL = gql`
  query GET_CUSTOMER_WALLET_LEADERBOARD_EXECEL($input: CustomerWalletLeaderboardInput!) {
    customerWalletLeaderboardExcel(input: $input) 
  }
`

export default function useFetchGetCustomerWalletLeaderboardExcel() {
  const [getCustomerWalletExcel, customerWalletDateExcel] = useLazyQuery(GET_CUSTOMER_WALLET_LEADERBOARD_EXECEL, {
    fetchPolicy: 'cache-and-network',
  })
  return [getCustomerWalletExcel, customerWalletDateExcel]
}
