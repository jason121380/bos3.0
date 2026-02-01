import { gql, useQuery } from '@apollo/client'

const GET_INTO_PERFORMANCE_DISPLAY_FOR_TICKET_SELL = gql`
  query GET_INTO_PERFORMANCE_DISPLAY_FOR_TICKET_SELL {
    getIntoPerformanceDisplayForTicketSellDefault
  }
`

export default function useFetchIntoPerformanceDisplayForTicketSell() {
  return useQuery(GET_INTO_PERFORMANCE_DISPLAY_FOR_TICKET_SELL, {
    fetchPolicy: 'cache-and-network',
  })
}
