import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_SMS_ACCOUNT = gql`
  mutation SET_MERCHANT_SMS_ACCOUNT($input: SetMerchantSMSAccountInput!) {
    setMerchantSMSAccount(input: $input)
  }
`

export default function useFetchSetMerchantSMSAccount() {
  const [setMerchantSMSAccount] = useMutation(SET_MERCHANT_SMS_ACCOUNT)
  return {
    setMerchantSMSAccount: ({ input }) =>
    setMerchantSMSAccount({
        variables: {
          input,
        },
      }),
  }
}
