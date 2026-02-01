import { gql, useMutation } from '@apollo/client'

export const UPDATE_PRODUCT_CATEGORY = gql`
  mutation UPDATE_PRODUCT_CATEGORY($input: UpdateProductCategoryInput!) {
    updateProductCategory(input: $input)
  }
`

export const mockedUpdateProductCategory = {
  data: {
    updateProductCategory: true,
  },
}

export default function useFetchUpdateProductCategory() {
  const [updateProductCategory] = useMutation(UPDATE_PRODUCT_CATEGORY)
  return {
    updateProductCategory: ({ input }) =>
      updateProductCategory({
        variables: {
          input,
        },
      }),
  }
}
