import { gql, useMutation } from '@apollo/client'

const DELETE_INVENTORY = gql`
  mutation DELETE_INVENTORY($inventoryId: ID!) {
    deleteInventory(inventoryId: $inventoryId)
  }
`

export default function useFetchDeleteInventory() {
  const [deleteInventory] = useMutation(DELETE_INVENTORY)
  return {
    deleteInventory: ({ inventoryId }) =>
      deleteInventory({
        variables: {
          inventoryId,
        },
      }),
  }
}
