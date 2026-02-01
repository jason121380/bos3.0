import { gql, useMutation } from '@apollo/client'

const SET_DEDUCTION_ITEMS = gql`
  mutation SEIING_DEDUCTION_ITEMS($input: [SettingDeductionItemsInput!]) {
    settingDeductionItems(input: $input)
  }
`

export default function useFetchSettingDeductionItems() {
  const [setDeductionitems] = useMutation(SET_DEDUCTION_ITEMS)
  return {
    setDeductionitems: ({ input }) =>
      setDeductionitems({
        variables: { input },
      }),
  }
}
