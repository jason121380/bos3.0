import { gql, useMutation } from '@apollo/client'

const SET_SALARY_INCREASE_ITEM = gql`
  mutation SET_MERCHANT_SALARY_INCREASE_ITEM($input: [MerchantSalaryItemInput]!) {
    setMerchantSalaryIncreaseItem(input: $input) {
      id
      type
      itemSetting
    }
  }
`

export default function useFetchSettingMerchantSalaryIncreaseItem() {
  const [setSalaryIncreaseItem] = useMutation(SET_SALARY_INCREASE_ITEM)
  return {
    setSalaryIncreaseItem: ({ input }) =>
      setSalaryIncreaseItem({
        variables: {
          input,
        },
      }),
  }
}
