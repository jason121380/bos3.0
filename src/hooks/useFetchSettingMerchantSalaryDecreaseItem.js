import { gql, useMutation } from '@apollo/client'

const SET_SALARY_DECREASE_ITEM = gql`
  mutation SET_MERCHANT_SALARY_DECREASE_ITEM($input: [MerchantSalaryItemInput]!) {
    setMerchantSalaryDecreaseItem(input: $input) {
      id
      type
      itemSetting
    }
  }
`

export default function useFetchSettingMerchantSalaryDecreaseItem() {
  const [setSalaryDecreaseItem] = useMutation(SET_SALARY_DECREASE_ITEM)
  return {
    setSalaryDecreaseItem: ({ input }) =>
      setSalaryDecreaseItem({
        variables: {
          input,
        },
      }),
  }
}
