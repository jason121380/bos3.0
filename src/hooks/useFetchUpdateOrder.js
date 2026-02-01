import { gql, useMutation } from '@apollo/client'

const UPDATE_ORDER = gql`
  mutation UpdateOrder($input: OrderUpdateInput!) {
    updateOrder(input: $input) {
      id
      date
      isDesignate
      customer {
        id
        name
      }
    }
  }
`

export default function useFetchUpdateOrder() {
  const [updateOrder] = useMutation(UPDATE_ORDER)
  return {
    updateOrder: input =>
      updateOrder({
        variables: {
          input,
        },
      }),
  }
}
