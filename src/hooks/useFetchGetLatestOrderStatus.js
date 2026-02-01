import { gql, useQuery } from '@apollo/client'

const GET_LAST_ORDER_STATUS = gql`
  query GET_LAST_ORDER_STATUS($date: DateTime!) {
    getLatestOrderStatus(date: $date) {
      orderNo
      isDesignate
    }
  }
`

export default function useFetchGetLatestOrderStatus({ date }) {
  return useQuery(GET_LAST_ORDER_STATUS, {
    variables: {
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}
