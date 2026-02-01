import { gql, useMutation } from '@apollo/client'

const FETCH_VERIFICATION_CODE = gql`
  mutation forgetPassword($cellphone: String!) {
    forgetPassword(cellphone: $cellphone)
  }
`

export default function useFetchVerificationCode() {
  const [fetchVerificationCode] = useMutation(FETCH_VERIFICATION_CODE)
  return {
    fetchVerificationCode: ({ cellphone }) =>
      fetchVerificationCode({
        variables: {
          cellphone,
        },
      }),
  }
}
