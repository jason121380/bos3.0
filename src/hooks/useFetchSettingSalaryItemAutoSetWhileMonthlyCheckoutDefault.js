import { gql, useMutation } from '@apollo/client'

const SET_MONTH_CHECKOUT_AUTO_ADD_SALARY_ITEMS_DEFAULT = gql`
  mutation SET_MONTH_CHECKOUT_AUTO_ADD_SALARY_ITEMS_DEFAULT($input: Boolean!) {
    setSalaryItemAutoSetWhileMonthlyCheckoutDefault(input: $input)
  }
`

export default function useFetchSettingMonthCheckoutAutoAddSalaryItemsDefault() {
  const [setMonthCheckoutAutoAddSalaryItemsDefault] = useMutation(
    SET_MONTH_CHECKOUT_AUTO_ADD_SALARY_ITEMS_DEFAULT
  )
  return {
    setMonthCheckoutAutoAddSalaryItemsDefault: ({ input }) =>
      setMonthCheckoutAutoAddSalaryItemsDefault({
        variables: {
          input,
        },
      }),
  }
}
