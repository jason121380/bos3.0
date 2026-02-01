import { gql, useLazyQuery } from '@apollo/client'

const GET_PRODUCT_LEADERBOAED_V2 = gql`
  query GET_PRODUCT_LEADERBOAED_V2($input: ProductLeaderBoardV2Input!) {
    getProductLeaderBoardV2(input: $input) {
      merchantName
      productName
      productNo
      totalPrice
      totalCount
    }
  }
`

export default function useFetchGetProductLeaderBoardV2() {
  const [getProductLeaderBoardV2, productLeaderBoardV2Data] = useLazyQuery(GET_PRODUCT_LEADERBOAED_V2, {
    fetchPolicy: 'cache-and-network',
  })
  return [getProductLeaderBoardV2, productLeaderBoardV2Data]
}
