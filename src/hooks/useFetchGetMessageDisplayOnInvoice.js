import { gql, useQuery } from '@apollo/client'

const GET_MESSAGE_DISPLAY_ON_INVOICE = gql`
  query GET_MESSAGE_DISPLAY_ON_INVOICE {
    getMessageDisplayOnInvoice {
      isDisplay
      message
    }
  }
`

export default function useFetchGetMessageDisplayOnInvoice() {
  return useQuery(GET_MESSAGE_DISPLAY_ON_INVOICE, {
    fetchPolicy: 'cache-and-network',
  })
}