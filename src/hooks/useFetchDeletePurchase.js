import { gql, useMutation } from '@apollo/client'

const DELETE_PURCHASE = gql`
  mutation DELETE_PURCHASE($purchaseUUIds: [ID]!) {
    deletePurchase(purchaseUUIds: $purchaseUUIds)
  }
`

export default function useFetchDeletePurchase() {
  const [deletePurchase] = useMutation(DELETE_PURCHASE)
  return {
    deletePurchase: ({ purchaseUUIds }) =>
      deletePurchase({
        variables: {
          purchaseUUIds,
        },
      }),
  }
}
