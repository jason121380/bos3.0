import { gql, useMutation } from '@apollo/client'

const UPDATE_PICKING = gql`
  mutation UPDATE_PICKING($id: ID!, $input: UpdatePickingInput!) {
    updatePicking(id: $id, input: $input)
  }
`

export default function useFetchUpdatePicking() {
  const [updatePicking] = useMutation(UPDATE_PICKING)
  return {
    updatePicking: ({ input, id }) =>
      updatePicking({
        variables: {
          id,
          input,
        },
      }),
  }
}
