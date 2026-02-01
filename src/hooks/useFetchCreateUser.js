import { gql, useMutation } from '@apollo/client'

const CREATE_USER = gql`
  mutation CREATE_USER($input: CreateUserInput!) {
    createUser(input: $input)
  }
`

export default function useFetchCreateUser() {
  const [createUser] = useMutation(CREATE_USER)
  return {
    createUser: ({ input }) =>
      createUser({
        variables: { input },
      }),
  }
}
