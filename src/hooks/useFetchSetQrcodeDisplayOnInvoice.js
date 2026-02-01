import { gql, useMutation } from '@apollo/client'

const SET_ORCODE_DISPLAY_ON_INVOICE = gql`
  mutation SET_ORCODE_DISPLAY_ON_INVOICE($input: QrcodeDisplayOnInvoiceInput) {
    setQrcodeDisplayOnInvoice(input: $input) 
  }
`

export default function useFetchSetQrcodeDisplayOnInvoice() {
  const [setQrcode] = useMutation(SET_ORCODE_DISPLAY_ON_INVOICE)
  return {
    setQrcode: ({ input }) =>
      setQrcode({
        variables: {
          input,
        },
      }),
  }
}