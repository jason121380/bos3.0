import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_CHECKIN_SETTING = gql`
  mutation SET_MERCHANT_CHECKIN_SETTING($input: SetMerchantCheckinSettingsInput!) {
    setMerchantCheckinSettings(input: $input)
  }
`

export default function useFetchSetMerchantCheckinSettings() {
  const [setMerchantCheckin] = useMutation(SET_MERCHANT_CHECKIN_SETTING)
  return {
    setMerchantCheckin: ({ input }) =>
      setMerchantCheckin({
        variables: {
          input,
        },
      }),
  }
}