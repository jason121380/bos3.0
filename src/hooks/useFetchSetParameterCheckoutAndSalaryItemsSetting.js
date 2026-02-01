import { gql, useMutation } from '@apollo/client'

const SET_PARAMETER_CHECKOUT_AND_SALARY_ITEM_SETTING = gql`
  mutation SET_PARAMETER_CHECKOUT_AND_SALARY_ITEM_SETTING($input: CheckoutAndSalaryItemsSettingInput!) {
    setParameterCheckoutAndSalaryItemsSetting(input: $input)
  }
`

export default function useFetchSetParameterCheckoutAndSalaryItemsSetting() {
  const [setCheckoutAndSalaryItems] = useMutation(SET_PARAMETER_CHECKOUT_AND_SALARY_ITEM_SETTING)
  return {
    setCheckoutAndSalaryItems: ({ input }) =>
      setCheckoutAndSalaryItems({
        variables: {
          input,
        },
      }),
  }
}