import { gql, useMutation } from '@apollo/client'

const ADD_PICKING = gql`
  mutation addPicking($input: AddPickingInput!) {
    addPicking(input: $input)
  }
`

export default function useFetchAddPicking() {
  const [addPicking] = useMutation(ADD_PICKING)
  return {
    addPicking: ({ input }) =>
      addPicking({
        variables: {
          input,
        },
      }),
  }
}
