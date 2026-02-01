import { gql, useMutation } from '@apollo/client'

const SET_CREATE_INVENTORY = gql`
  mutation SET_CREATE_INVENTORY($input: SetInventoryInput!) {
    createInventory(input: $input)
  }
`

export default function useFetchSetCreateInventory() {
  const [createInventory] = useMutation(SET_CREATE_INVENTORY)
  return {
    createInventory: ({ input }) =>
      createInventory({
        variables: {
          input,
        },
      }),
  }
}
