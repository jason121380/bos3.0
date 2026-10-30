import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_CLOCK_IN_SETTING = gql`
  mutation SET_MERCHANT_CLOCK_IN_SETTING($input: [SetMerchantClockInSettingInput]!) {
    setMerchantClockInSetting(input: $input)
  }
`

export default function useFetchSetMerchantClockInSetting() {
  const [setMerchantClockInSetting] = useMutation(SET_MERCHANT_CLOCK_IN_SETTING)
  return {
    setMerchantClockInSetting: ({ input }) =>
      setMerchantClockInSetting({
        variables: {
          input,
        },
      }),
  }
}
