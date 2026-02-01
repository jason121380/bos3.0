import { gql, useMutation } from '@apollo/client'

const SET_PRODUCTS_CATEGORY = gql`
  mutation SET_PRODUCTS_CATEGORY($input: MultipleUpdateProductCategoryInput!) {
    multipleUpdateProductCategory(input: $input)
  }
`

export default function useFetchSettingMultipleUpdateProductCategory() {
  const [setProductsCategory] = useMutation(SET_PRODUCTS_CATEGORY)
  return {
    setProductsCategory: ({ input }) =>
      setProductsCategory({
        variables: {
          input,
        },
      }),
  }
}
