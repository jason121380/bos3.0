import { gql, useQuery } from '@apollo/client'

const GET_CUSTOMER_EVENT_TICKETS_FOR_MERCHANT = gql`
  query GET_CUSTOMER_EVENT_TICKETS_FOR_MERCHANT($input: ID!) {
    customerEventTicketsForMerchant(input: $input) {
      eventName
      tickets {
        serialNumber
        consumptionDate
        consumptionStoreName
      }
    }
  }
`

export default function useFetchGetCustomerEventTicketsForMerchant({ input }) {
  return useQuery(GET_CUSTOMER_EVENT_TICKETS_FOR_MERCHANT, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
