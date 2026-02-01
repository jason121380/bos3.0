import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_FAKE_PERFORMANCE_REFER = gql`
  mutation SET_MERCHANT_FAKE_PERFORMANCE_REFER($input: MerchantFakePerformanceReferenceEnum!) {
    setMerchantFakePerformanceReference(input: $input)
  }
`

export default function useFetchSettingMerchantFakePerformanceRefer() {
  const [settingMerchantFakePerformanceRefer] = useMutation(SET_MERCHANT_FAKE_PERFORMANCE_REFER)
  return {
    settingMerchantFakePerformanceRefer: ({ input }) =>
      settingMerchantFakePerformanceRefer({
        variables: {
          input,
        },
      }),
  }
}
