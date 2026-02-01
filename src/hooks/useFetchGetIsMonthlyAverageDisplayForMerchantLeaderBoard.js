import { gql, useQuery } from '@apollo/client'

export const GET_IS_MONTLY_AVERAGE_DISPLAY_FOR_MERCHANT_LEADER_REPORT = gql`
  query GET_IS_MONTLY_AVERAGE_DISPLAY_FOR_MERCHANT_LEADER_REPORT {
    getIsMonthlyAverageDisplayForMerchantLeaderBoard
  }
`

export default function useFetchGetIsMonthlyAverageDisplayForMerchantLeaderBoard() {
  return useQuery(GET_IS_MONTLY_AVERAGE_DISPLAY_FOR_MERCHANT_LEADER_REPORT, {
    fetchPolicy: 'cache-and-network',
  })
}
