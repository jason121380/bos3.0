import { gql, useLazyQuery } from '@apollo/client'

const GET_CUSTOMER_WALLET_LEADERBOARD = gql`
  query GET_CUSTOMER_WALLET_LEADERBOARD($input: CustomerWalletLeaderboardInput!) {
    customerWalletLeaderboard(input: $input) {
      customerId
      customerName
      customerPhone
      customerNo
      walletDeposit
      walletUse
    }
  }
`

export default function useFetchGetCustomerWalletLeaderboard() {
  const [getCustomerWallet, customerWalletData] = useLazyQuery(GET_CUSTOMER_WALLET_LEADERBOARD, {
    fetchPolicy: 'cache-and-network',
  })
  return [getCustomerWallet, customerWalletData]
}
