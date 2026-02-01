import { gql, useMutation } from '@apollo/client'

const SET_BATCH_SETTING_FOR_HELPER = gql`
  mutation SET_BATCH_SETTING_FOR_HELPER($input: BatchSettingForHelperInput!) {
    batchSettingForHelper(input: $input)
  }
`

export default function useFetchSettingBatchSettingForHelper() {
  const [setBatchSettingForHelper] = useMutation(SET_BATCH_SETTING_FOR_HELPER)
  return {
    setBatchSettingForHelper: ({ input }) =>
      setBatchSettingForHelper({
        variables: {
          input,
        },
      }),
  }
}
