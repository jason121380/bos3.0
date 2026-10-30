import { gql, useLazyQuery } from '@apollo/client'

const GET_TICKET_RECORDS_FOR_ORDERS = gql`
  query GET_TICKET_RECORDS_FOR_ORDERS($customerId: ID!) {
    ticketRecordsForOrder (customerId: $customerId) {
      id
      name
      price
      remark
      helperSetting {
        type
        helperDeductionType
        nameList
      }
    }
  }
`

export default function useFetchGetTicketRecordsForOrder() {
  const [ticketRecordsForOrderLazy, ticketRecordsForOrderLazyData] = useLazyQuery(GET_TICKET_RECORDS_FOR_ORDERS, {
    fetchPolicy: 'cache-and-network',
  })
  return [ticketRecordsForOrderLazy, ticketRecordsForOrderLazyData]
}
