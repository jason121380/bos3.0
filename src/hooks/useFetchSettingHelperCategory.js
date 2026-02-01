import { gql, useMutation } from '@apollo/client'

const SET_HELPER_CATEGORY = gql`
  mutation SET_HELPER_CATEGORY($input: [SetHelperCategoryInput!]) {
    setHelperCategory(input: $input)
  }
`

export default function useFetchSettingHelperCategory() {
  const [setHelperCategory] = useMutation(SET_HELPER_CATEGORY)
  return {
    setHelperCategory: ({ input }) =>
      setHelperCategory({
        variables: {
          input,
        },
      }),
  }
}
