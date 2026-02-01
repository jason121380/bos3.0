import { gql, useLazyQuery } from '@apollo/client'

const GET_CUSTOMER_CONSUMPYION_LEADERBOARD = gql`
  query GET_CUSTOMER_CONSUMPYION_LEADERBOARD($input: CustomerConsumptionLeaderboardInput!) {
    customerConsumptionLeaderboard(input: $input) {
      customerId
      customerName
      customerPhone
      customerNo
      orderCount
      price {
        all
        wallet
        notWallet
        walletDeposit
      }
    }
  }
`

export default function useFetchGetCustomerConsumptionLeaderboard() {
  const [getCustomerConsumption, customerConsumptionData] = useLazyQuery(GET_CUSTOMER_CONSUMPYION_LEADERBOARD, {
    fetchPolicy: 'cache-and-network',
  })
  return [getCustomerConsumption, customerConsumptionData]
}
