import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_BANKS_SETTINGS = gql`
  mutation SET_MERCHANT_BANKS_SETTINGS($input: MerchantBankSettingInput!) {
    setMerchantBankSettings(input: $input) {
      remitterName
    }
  }
`

export default function useFetchSettingMerchantBankSettings() {
  const [setMerchantBankSetting] = useMutation(SET_MERCHANT_BANKS_SETTINGS)
  return {
    setMerchantBankSetting: ({ input }) =>
      setMerchantBankSetting({
        variables: {
          input,
        },
      }),
  }
}
