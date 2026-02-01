import { gql, useQuery } from '@apollo/client'

const FETCH_WAIT_CLOSE_ORDER_DATE = gql`
  query waitCloseOrderDate($input: WaitCloseOrderDateInput!) {
    waitCloseOrderDate(input: $input) {
      data {
        date
        orders {
          id
          isDesignate
          date
        }
        pendingOrderCount
      }
      pageLimit
      pageOffset
      totalCount
    }
  }
`

export default function useFetchWaitCloseOrderDate(input) {
  return useQuery(FETCH_WAIT_CLOSE_ORDER_DATE, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
