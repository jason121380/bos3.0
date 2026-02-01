import { gql, useMutation } from '@apollo/client'

const FETCH_CUSTOMER_CANCEL_ORDER = gql`
  mutation CustomerCancelOrder($orderId: ID!) {
    customerCancelOrder(orderId: $orderId)
  }
`

export default function useFetchCustomerCancelOrder() {
  const [cancelOrder] = useMutation(FETCH_CUSTOMER_CANCEL_ORDER)

  return {
    cancelOrder: orderId =>
      cancelOrder({
        variables: {
          orderId,
        },
      }),
  }
}
