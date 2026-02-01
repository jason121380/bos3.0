import { gql, useQuery } from '@apollo/client'

export const GET_DESIGNER_NAME_DISPLAY_ON_INVOICE = gql`
  query GET_DESIGNER_NAME_DISPLAY_ON_INVOICE {
    getDesignerNameDisplayOnInvoice
  }
`

export default function useFetchGetDesignerNameDisplayOnInvoice() {
  return useQuery(GET_DESIGNER_NAME_DISPLAY_ON_INVOICE, {
    fetchPolicy: 'cache-and-network',
  })
}