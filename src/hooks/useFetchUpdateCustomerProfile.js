import { gql, useMutation } from '@apollo/client'

const FETCH_UPDATE_CUSTOMER_PROFILE = gql`
  mutation UpdateCustomerProfile($input: UpdateCustomerProfileInput) {
    updateCustomerProfile(input: $input) {
      id
    }
  }
`

export default function useFetchUpdateCustomerProfile() {
  const [updateCustomer, updateCustomerResponse] = useMutation(FETCH_UPDATE_CUSTOMER_PROFILE)
  return {
    updateCustomer: input =>
      updateCustomer({
        variables: {
          input,
        },
      }),
    updateCustomerResponse,
  }
}
