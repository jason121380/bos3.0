import { gql, useMutation } from '@apollo/client'

const FETCH_ADD_CUSTOMER = gql`
  mutation FETCH_ADD_CUSTOMER($input: AddCustomerInput) {
    addCustomer(input: $input) {
      id
      category
      name
      cellphone
      gender
      birthday {
        year
        month
        day
      }
      preferDesigner {
        id
      }
      source
    }
  }
`

export default function useFetchAddCustomer() {
  const [addCustomer] = useMutation(FETCH_ADD_CUSTOMER)
  return {
    addCustomer: ({ input }) => addCustomer({ variables: { input } }),
  }
}
