import { gql, useQuery } from '@apollo/client'

const GET_PRODUCT_LEADERBOAED = gql`
  query GET_PRODUCT_LEADERBOAED($startDay: DateTime, $endDay: DateTime, $merchantId: [ID]) {
    getProductLeaderBoard(startDay: $startDay, endDay: $endDay, merchantId: $merchantId) {
      merchantName
      productName
      productNo
      totalPrice
      totalCount
    }
  }
`

export default function useFetchProductLeaderBoard({ startDay, endDay, merchantId }) {
  return useQuery(GET_PRODUCT_LEADERBOAED, {
    variables: {
      startDay,
      endDay,
      merchantId,
    },
    fetchPolicy: 'cache-and-network',
  })
}
