import { gql, useMutation } from '@apollo/client'

const SET_UPDATE_INVENTORY = gql`
  mutation SET_UPDATE_INVENTORY($inventoryId: ID!, $input: SetInventoryInput!) {
    updateInventory(inventoryId: $inventoryId, input: $input)
  }
`

export default function useFetchUpdateInventory() {
  const [updateInventory] = useMutation(SET_UPDATE_INVENTORY)
  return {
    updateInventory: ({ input, inventoryId }) =>
      updateInventory({
        variables: {
          input,
          inventoryId,
        },
      }),
  }
}
