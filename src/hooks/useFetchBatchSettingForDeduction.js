import { gql, useMutation } from '@apollo/client'

const SET_BATCH_SETTING_FOR_DEDUCTION = gql`
  mutation SET_BATCH_SETTING_FOR_DEDUCTION($input: BatchSettingForDeductionInput!) {
    batchSettingForDeduction(input: $input)
  }
`

export default function useFetchSettingBatchSettingForDeduction() {
  const [setBatchSettingForDeduction] = useMutation(SET_BATCH_SETTING_FOR_DEDUCTION)
  return {
    setBatchSettingForDeduction: ({ input }) =>
      setBatchSettingForDeduction({
        variables: {
          input,
        },
      }),
  }
}
