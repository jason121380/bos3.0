import { gql, useMutation } from '@apollo/client'

const SET_DESIGNER_NAME_DISPLAY_ON_INVOICE = gql`
  mutation SET_DESIGNER_NAME_DISPLAY_ON_INVOICE($input: designerNameDisplayOnInvoiceEnum!) {
    setDesignerNameDisplayOnInvoice(input: $input)
  }
`

export default function useFetchSetDesignerNameDisplayOnInvoice() {
  const [setDesignerNameDisplayOnInvoice] = useMutation(
    SET_DESIGNER_NAME_DISPLAY_ON_INVOICE
  )
  return {
    setDesignerNameDisplayOnInvoice: ({ input }) =>
      setDesignerNameDisplayOnInvoice({
        variables: {
          input,
        },
      }),
  }
}