import { gql, useMutation } from '@apollo/client'

const LOGIN_SMS = gql`
  mutation LoginSMS($input: CustomerLoginSMSInput!) {
    customerLoginSMS(input: $input)
  }
`

export default function useFetchLoginSMS() {
  const [loginSMS] = useMutation(LOGIN_SMS)
  return {
    loginSMS: input =>
      loginSMS({
        variables: {
          input,
        },
      }),
  }
}
