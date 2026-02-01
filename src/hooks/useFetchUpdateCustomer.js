import { gql, useMutation } from '@apollo/client'

const SET_CUSTOMER = gql`
  mutation SET_CUSTOMER($input: UpdateCustomerInput) {
    updateCustomer(input: $input)
  }
`

export default function useFetchUpdateCustomer() {
  const [updateCustomer] = useMutation(SET_CUSTOMER)
  return {
    updateCustomer: ({ input }) =>
      updateCustomer({
        variables: {
          input,
        },
      }),
  }
}
