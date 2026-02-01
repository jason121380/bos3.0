import { gql, useQuery } from '@apollo/client'

const GET_QRCODE_DISPLAY_ON_INVOICE = gql`
  query GET_QRCODE_DISPLAY_ON_INVOICE {
    getQrcodeDisplayOnInvoice {
      isDisplay
      url
      imageUrl
    }
  }
`

export default function useFetchGetQrcodeDisplayOnInvoice() {
  return useQuery(GET_QRCODE_DISPLAY_ON_INVOICE, {
    fetchPolicy: 'cache-and-network',
  })
}