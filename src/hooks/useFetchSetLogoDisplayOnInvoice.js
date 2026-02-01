import { gql, useMutation } from '@apollo/client'

const SET_LOGO_DISPLAY_ON_INVOICE = gql`
  mutation SET_LOGO_DISPLAY_ON_INVOICE($input: Boolean!) {
    setLogoDisplayOnInvoice(input: $input)
  }
`

export default function useFetchSetLogoDisplayOnInvoice() {
  const [setLogoDisplay] = useMutation(SET_LOGO_DISPLAY_ON_INVOICE)
  return {
    setLogoDisplay: ({ input }) =>
      setLogoDisplay({
        variables: {
          input,
        },
      }),
  }
}