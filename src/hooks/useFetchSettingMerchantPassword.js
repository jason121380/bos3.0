import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_PASSWORD = gql`
  mutation SET_MERCHANT_PASSWORD($input: SetMerchantPasswordInput) {
    setMerchantPassword(input: $input) {
      status
      data {
        superPassword
      }
    }
  }
`

export default function useFetchSetMerchantPassword() {
  const [setMerchantPassword] = useMutation(SET_MERCHANT_PASSWORD)
  return {
    setMerchantPassword: ({ input }) =>
      setMerchantPassword({
        variables: {
          input,
        },
      }),
  }
}
