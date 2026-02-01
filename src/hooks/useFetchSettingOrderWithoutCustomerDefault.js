import { gql, useMutation } from '@apollo/client'

const SET_ORDER_WITHOUT_CUSTOMER_DEFAULT = gql`
  mutation SET_ORDER_WITHOUT_CUSTOMER_DEFAULT($input: Boolean!) {
    setOrderWithoutCustomerDefault(input: $input)
  }
`

export default function useFetchSetOrderWithoutCustomer() {
  const [setOrderWithoutCustomer] = useMutation(SET_ORDER_WITHOUT_CUSTOMER_DEFAULT)
  return {
    setOrderWithoutCustomer: ({ input }) =>
      setOrderWithoutCustomer({
        variables: {
          input,
        },
      }),
  }
}
