import { gql, useLazyQuery } from '@apollo/client'

const FETCH_TICKET_SELL_OVERVIEW = gql`
  query FETCH_TICKET_SELL_OVERVIEW($input: TicketSellOverviewInput!) {
    ticketSellOverview(input: $input) {
      orderId
      orderDate
      orderNo
      customerName
      customerPhone
      designerName
      designerNo
      ticketName
      ticketNo
      price
      totalCount
      leftCount
    }
  }
`

export function useFetchTicketSellOverviewLazy() {
  const [ticketSellOverviewLazy, ticketSellOverviewData] = useLazyQuery(FETCH_TICKET_SELL_OVERVIEW, {
    fetchPolicy: 'cache-and-network',
  })
  return [ticketSellOverviewLazy, ticketSellOverviewData]
}
