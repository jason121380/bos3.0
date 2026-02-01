import { gql, useLazyQuery, } from '@apollo/client'

const GET_CUSTOMER_CHECK_TICKET = gql`
  query GET_CUSTOMER_CHECK_TICKET($input: CustomerCheckTicketInput!) {
    customerCheckTicket(input: $input) {
      message
      customerEventTickets {
        eventName
        tickets {
          consumptionDate
          consumptionStoreName
          serialNumber
        }
      }
    }
  }
`

export default function useFetchGetCustomerCheckTicket() {
  const [getCustomerTicket, customerTicketData] = useLazyQuery(GET_CUSTOMER_CHECK_TICKET, {
    fetchPolicy: 'cache-and-network',
  })
  return [getCustomerTicket, customerTicketData]
}
