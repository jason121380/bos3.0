import { gql, useMutation } from '@apollo/client'

const CUSTOMER_SELF_CREATE = gql`
  mutation CUSTOMER_SELF_CREATE($input: CustomerSelfCreateV2Input!) {
    customerSelfCreateV2(input: $input)
  }
`

export default function useFetchCustomerSelfCreate() {
  const [setCustomerCreate] = useMutation(CUSTOMER_SELF_CREATE)
  return {
    setCustomerCreate: input =>
      setCustomerCreate({
        variables: {
          input,
        },
      }),
  }
}