import { gql, useMutation } from '@apollo/client'

const FETCH_FORGOTPASSWORD_VERIFY = gql`
  mutation FORGOT_PASSWORD_VERFITY($input: ForgetPasswordVerifyInput!) {
    forgetPasswordVerify(input: $input) {
      id
      uid
      name
      status
      jobTitle
      userCode
      userGroup
      merchants {
        id
      }
      cellphone
      groupCategory
      isNeedChangePassword
    }
  }
`

export default function useForgotPasswordVerify() {
  const [forgotPasswordVerify] = useMutation(FETCH_FORGOTPASSWORD_VERIFY)
  return {
    forgotPasswordVerify: ({ cellphone, verifyCode }) =>
      forgotPasswordVerify({
        variables: {
          input: {
            cellphone,
            verifyCode,
          },
        },
      }),
  }
}
