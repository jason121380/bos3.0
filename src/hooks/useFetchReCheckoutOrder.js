import { gql, useMutation } from '@apollo/client'

const FETCH_UPDATE_ORDER = gql`
  mutation reCheckoutOrder($input: OrderUpdateInput!) {
    reCheckoutOrder(input: $input) {
      id
    }
  }
`

export default function useFetchReCheckoutOrder() {
  const [fetchReCheckoutOrder] = useMutation(FETCH_UPDATE_ORDER)
  return {
    fetchReCheckoutOrder: input =>
      fetchReCheckoutOrder({
        variables: {
          input: input,
        },
      })
  }
}

// {
//   updateOrderId,
//   orderInput
// }
