import { gql, useMutation } from '@apollo/client'

export const DELETE_PICKING = gql`
  mutation deletePicking($id: [ID]!) {
    deletePicking(id: $id)
  }
`

export default function useFetchDeletePicking() {
  const [deletePicking] = useMutation(DELETE_PICKING)

  return {
    deletePicking: id =>
      deletePicking({
        variables: {
          id,
        },
      }),
  }
}
