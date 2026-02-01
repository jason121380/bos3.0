import { gql, useMutation } from '@apollo/client'

const SET_IS_PRICE_DISPLAY_CUSTOMER_SIDE = gql`
  mutation SET_IS_PRICE_DISPLAY_CUSTOMER_SIDE($input: Boolean!) {
    setIsPriceDisplayOnCustomerSide(input: $input)
  }
`

export default function useFetchSetIsPriceDisplayOnCustomerSide() {
  const [setIsPriceDisplayOnCustomerSide] = useMutation(SET_IS_PRICE_DISPLAY_CUSTOMER_SIDE)
  return {
    setIsPriceDisplayOnCustomerSide: ({ input }) =>
    setIsPriceDisplayOnCustomerSide({
        variables: {
          input,
        },
      }),
  }
}
