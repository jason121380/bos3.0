import { gql, useMutation } from '@apollo/client'

const SET_DESIGNER_NAME_FOR_CUSTOMER_SIDE  = gql`
  mutation SET_DESIGNER_NAME_FOR_CUSTOMER_SIDE($input: DesignerNameForCustomerSideEnum!) {
    setDesignerNameForCustomerSide(input: $input)
  }
`

export default function useFetchSetDesignerNameForCustomerSide() {
  const [setDesignerNameForCustomerSide] = useMutation(SET_DESIGNER_NAME_FOR_CUSTOMER_SIDE)
  return {
    setDesignerNameForCustomerSide: ({ input }) =>
    setDesignerNameForCustomerSide({
        variables: {
          input,
        },
      }),
  }
}
