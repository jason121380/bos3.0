import { gql, useMutation } from '@apollo/client'

export const REGISTER = gql`
  mutation SIGN_UP($input: UserSignupInput) {
    userSignup(input: $input)
  }
`

export default function useFetchRegister() {
  const [register] = useMutation(REGISTER)
  return {
    register: ({ cellphone }) =>
      register({
        variables: {
          input: { cellphone },
        },
      }),
  }
}
