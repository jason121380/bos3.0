import { gql, useQuery } from '@apollo/client'

export const GET_IS_TICKET_SELL_SUB_ITEM = gql`
  query GET_IS_TICKET_SELL_SUB_ITEM {
    getIsTicketSellSubItem
  }
`

export default function useFetchGetIsTicketSellSubItem() {
  return useQuery(GET_IS_TICKET_SELL_SUB_ITEM, {
    fetchPolicy: 'cache-and-network',
  })
}