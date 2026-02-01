import { gql, useMutation } from '@apollo/client'

const DELETE_AUTHORITY = gql`
  mutation DELETE_AUTHORITY($authorityId: ID!) {
    deleteAuthority(authorityId: $authorityId)
  }
`

export default function useFetchDeleteAuthority() {
  const [deleteAuthority] = useMutation(DELETE_AUTHORITY)
  return {
    deleteAuthority: ({ authorityId }) => deleteAuthority({ variables: { authorityId } }),
  }
}
