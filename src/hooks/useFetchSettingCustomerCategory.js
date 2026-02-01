import { gql, useMutation } from '@apollo/client'

const SET_CUSTOMER_CATEGORY = gql`
  mutation SET_CUSTOMER_CATEGORY($input: [SettingCustomerCategoryInput]) {
    settingCustomerCategory(input: $input)
  }
`

export default function useFetchSettingCustomerCategory() {
  const [setCustomerCategory] = useMutation(SET_CUSTOMER_CATEGORY)
  return {
    setCustomerCategory: ({ input }) =>
      setCustomerCategory({
        variables: {
          input,
        },
      }),
  }
}
