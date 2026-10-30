import { gql, useLazyQuery } from '@apollo/client'

const GET_MMULTI_MERCHANTS_LEADER_BOARD_EXCEL = gql`
  query GET_MMULTI_MERCHANTS_LEADER_BOARD_EXCEL ($input: DateTimeInput!, $vendorUUId: ID, $merchantId: [ID], $sortBy: sortByEnum!) {
    multiMerchantsLeaderBoardExcel (input: $input, vendorUUId: $vendorUUId, merchantId: $merchantId, sortBy: $sortBy)
  }
`

export default function useFetchGetMultiMerchantsLeaderBoardExcel() {
  const [getMultiMerchantsLeaderBoardExcelLazy, getMultiMerchantsLeaderBoardExcelLazyData] = useLazyQuery(GET_MMULTI_MERCHANTS_LEADER_BOARD_EXCEL, {
    fetchPolicy: 'cache-and-network',
  })
  return [getMultiMerchantsLeaderBoardExcelLazy, getMultiMerchantsLeaderBoardExcelLazyData]
}
