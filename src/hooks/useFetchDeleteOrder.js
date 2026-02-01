import { gql, useMutation } from '@apollo/client'

const DELETE_ORDERS = gql`
  mutation DELETE_ORDER($orderIds: [ID!], $password: String) {
    deleteOrder(orderIds: $orderIds, password: $password)
  }
`

export default function useFetchDeleteOrder() {
  const [deleteOrders] = useMutation(DELETE_ORDERS)
  return {
    deleteOrders: ({ orderIds, password }) =>
      deleteOrders({
        variables: {
          orderIds,
          password,
        },
      }),
  }
}
