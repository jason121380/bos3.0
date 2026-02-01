import { gql, useLazyQuery } from '@apollo/client'

const GET_CUSTOMERTICKETS = gql`
  query GET_CUSTOMERTICKETS($input: CustomerTicketsInput!) {
    customerTickets(input: $input) {
      id
      availableCount
      price
      originalCount
      isTicketCounted
      ticketName {
        id
        name
        price
        ticketAvailableCount
        isTicketCountNow
        updatedAt
        isUsing
        deletedAt
        creator {
          id
          name
        }
        ServiceCategory {
          id
          name
          attribution
          remark
          isUsing
          updatedAt
          creator {
            id
            name
          }
        }
      }
    }
  }
`

export default function useFetchCustomerTickets({ customerId }) {
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null
  const [fetchCustomerTickets, response] = useLazyQuery(GET_CUSTOMERTICKETS, {
    variables: {
      input: {
        customerId,
        merchantId,
      },
    },
  })
  return {
    fetchCustomerTickets,
    response,
  }
}
