import { gql, useLazyQuery } from '@apollo/client'

const GET_MMULTI_MERCHANTS_LEADER_BOARD = gql`
  query GET_MMULTI_MERCHANTS_LEADER_BOARD ($input: DateTimeInput!, $vendorUUId: ID, $merchantId: [ID]) {
    multiMerchantsLeaderBoard (input: $input, vendorUUId: $vendorUUId, merchantId: $merchantId) {
      sorting
      merchantName
      sellerName
      sellerNo
      totalPerformance
      totalCount
      productDetail {
        productName
        productNo
        performance
        count
        unit
      }
    }
  }
`

export default function useFetchGetMultiMerchantsLeaderBoard() {
  const [getMultiMerchantsLeaderBoardLazy, getMultiMerchantsLeaderBoardLazyData] =  useLazyQuery(GET_MMULTI_MERCHANTS_LEADER_BOARD, {
    fetchPolicy: 'cache-and-network',
  })
  return [getMultiMerchantsLeaderBoardLazy, getMultiMerchantsLeaderBoardLazyData]
}