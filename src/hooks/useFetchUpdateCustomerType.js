import { gql, useMutation } from '@apollo/client'

const UPDATE_CUSTOMER_TYPE = gql`
  mutation UpdateCustomerType($recommandCode: String!) {
    updateCustomerType(recommandCode: $recommandCode) {
      id
      type
    }
  }
`

export default function useFetchUpdateCustomerType() {
  const [updateCustomer] = useMutation(UPDATE_CUSTOMER_TYPE)
  return {
    updateCustomer: recommandCode =>
      updateCustomer({
        variables: {
          recommandCode,
        },
      }),
  }
}
