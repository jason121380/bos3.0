import { gql, useQuery } from '@apollo/client'

const FETCH_PICKING_RECORD = gql`
  query FETCH_PICKING_RECORD($input: PickingRecordInput!) {
    pickingRecords(input: $input) {
      PickingRecord {
        id
        date
        productName
        productNo
        price
        count
        total
        purpose
        remark
        Picker {
          id
          name
          designerNo
        }
        isClosed
      }
      pageLimit
      pageOffset
      totalCount
    }
  }
`

export default function useFetchGetPickingRecords({ input }) {
  return useQuery(FETCH_PICKING_RECORD, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
