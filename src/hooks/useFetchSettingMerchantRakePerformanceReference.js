import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_RAKE_PERFORMANCE_REFER = gql`
  mutation SET_MERCHANT_RAKE_PERFORMANCE_REFER($input: RakePerformanceReferenceEnum!) {
    setMerchantRakePerformanceReference(input: $input)
  }
`

export default function useFetchSettingMerchantRakePerformanceRefer() {
  const [setMerchantRakePerformanceRefer] = useMutation(SET_MERCHANT_RAKE_PERFORMANCE_REFER)
  return {
    setMerchantRakePerformanceRefer: ({ input }) =>
      setMerchantRakePerformanceRefer({
        variables: {
          input,
        },
      }),
  }
}
