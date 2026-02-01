import { gql, useMutation } from '@apollo/client'

const FETCH_CREATE_ORDER = gql`
  mutation FETCH_CREATE_ORDER($input: OrderInput!) {
    createOrder2(input: $input)
  }
`

const CHECK_ORDER = gql`
  mutation CHECK_ORDER($input: OrderInput!) {
    checkOrder(input: $input)
  }
`
export default function useFetchCreateOrder() {
  const [createOrder] = useMutation(FETCH_CREATE_ORDER)
  const [checkOrder] = useMutation(CHECK_ORDER)
  return {
    createOrder: input =>
      createOrder({
        variables: {
          input,
        },
      }),
    checkOrder: input =>
      checkOrder({
        variables: {
          input,
        },
      }),
  }
}
