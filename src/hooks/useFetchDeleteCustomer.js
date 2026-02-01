import { gql, useMutation } from '@apollo/client'

const DELETE_CUSTOMERS = gql`
  mutation DELETE_CUSTOMERS($customerIds: [ID!], $password: String) {
    deleteCustomer(customerIds: $customerIds, password: $password)
  }
`
export default function useFetchDeleteCustomer() {
  const [deleteCustomers] = useMutation(DELETE_CUSTOMERS)
  return {
    deleteCustomers: ({ customerIds, password }) =>
      deleteCustomers({
        variables: {
          customerIds,
          password,
        },
      }),
  }
}
