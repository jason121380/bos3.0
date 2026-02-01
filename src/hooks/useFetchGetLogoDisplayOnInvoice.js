import { gql, useQuery } from '@apollo/client'

const GET_LOGO_DISPLAY_INVOICE = gql`
  query GET_LOGO_DISPLAY_INVOICE {
    getLogoDisplayOnInvoice {
      isDisplay
      imageUrl
    }
  }
`

export default function useFetchGetLogoDisplayOnInvoice() {
  return useQuery(GET_LOGO_DISPLAY_INVOICE, {
    fetchPolicy: 'cache-and-network',
  })
}