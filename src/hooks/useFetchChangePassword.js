import { gql, useMutation } from '@apollo/client'

const FETCH_CHANGE_PASSWORD = gql`
  mutation CHANGE_PASSWORD($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`

export default function useFetchChangePassword() {
  const [changePassword] = useMutation(FETCH_CHANGE_PASSWORD)
  return {
    changePassword: input =>
      changePassword({
        variables: {
          input,
        },
      }),
  }
}
