import { gql, useMutation } from '@apollo/client'

const SET_CREATE_NEW_AUTHORITY = gql`
  mutation SET_CREATE_NEW_AUTHORITY($input: String) {
    createNewAuthority(input: $input)
  }
`

export default function useFetchSetCreateNewAuthority() {
  const [createNewAuthority] = useMutation(SET_CREATE_NEW_AUTHORITY)
  return {
    createNewAuthority: ({ input }) =>
      createNewAuthority({
        variables: {
          input,
        },
      }),
  }
}
