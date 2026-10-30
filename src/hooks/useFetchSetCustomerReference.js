import { gql, useMutation } from '@apollo/client'

const SET_CUSTOMER_REFERENCE = gql`
  mutation SET_CUSTOMER_REFERENCE($references: [String]!) {
    setCustomerReference(references: $references)
  }
`

export default function useFetchSetCustomerReference() {
  const [setCustomerReference] = useMutation(SET_CUSTOMER_REFERENCE)
  return {
    setCustomerReference: ({ references }) =>
      setCustomerReference({
        variables: {
          references,
        },
      }),
  }
}
