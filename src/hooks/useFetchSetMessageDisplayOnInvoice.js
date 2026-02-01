import { gql, useMutation } from '@apollo/client'

const SET_MESSAGE_DISPLAY_ON_INVOICE = gql`
  mutation SET_MESSAGE_DISPLAY_ON_INVOICE($input: MessageDisplayOnInvoiceInput) {
    setMessageDisplayOnInvoice(input: $input)
  }
`

export default function useFetchSetMessageDisplayOnInvoice() {
  const [setOrderDetailMessage] = useMutation(SET_MESSAGE_DISPLAY_ON_INVOICE)
  return {
    setOrderDetailMessage: ({ input }) =>
      setOrderDetailMessage({
        variables: {
          input,
        },
      }),
  }
}