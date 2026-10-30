import { gql, useMutation } from '@apollo/client'

const SET_CUSTOMER_ISUNWELCOME = gql`
  mutation SET_CUSTOMER_ISUNWELCOME($customerId: ID!, $input: Boolean!) {
    setCustomerIsUnwelcome(customerId: $customerId, input: $input)
  }
`

export default function useFetchSetCustomerIsUnwelcome() {
  const [setCustomerIsUnwelcome] = useMutation(SET_CUSTOMER_ISUNWELCOME)
  return {
    setCustomerIsUnwelcome: ({ customerId, input }) =>
      setCustomerIsUnwelcome({
        variables: {
          customerId,
          input,
        },
      }),
  }
}
