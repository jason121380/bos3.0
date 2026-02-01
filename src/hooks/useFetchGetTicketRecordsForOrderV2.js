import { gql, useLazyQuery } from '@apollo/client'

const GET_TICKET_RECORDS_FOR_ORDERS_V2 = gql`
  query GET_TICKET_RECORDS_FOR_ORDERS_V2($customerId: ID!) {
    ticketRecordsForOrderV2(customerId: $customerId) {
      ticketName
      ticketRecordForOrder {
        id
        no
        name
        helperSetting {
          type
          helperDeductionType
          nameList
        }
        price
        remark
      }
      remark
      price
    }
  }
`

export default function useFetchGetTicketRecordsForOrderV2() {
  const [ticketRecordsForOrderLazyV2, ticketRecordsForOrderLazyDataV2] =  useLazyQuery(GET_TICKET_RECORDS_FOR_ORDERS_V2, {
    fetchPolicy: 'cache-and-network',
  })
  return [ticketRecordsForOrderLazyV2, ticketRecordsForOrderLazyDataV2]
}