import { gql, useMutation } from '@apollo/client'

export const CREATE_PRODUCT_CATEGORY = gql`
  mutation CREATE_PRODUCT_CATEGORY($input: CreateProductCategoryinput!) {
    createProductCategory(input: $input)
  }
`

export const mockedCreateProductCateResp = {
  data: {
    createProductCategory: true,
  },
}
export default function useFetchCreateProductCategory() {
  const [createProductCategory] = useMutation(CREATE_PRODUCT_CATEGORY)
  return {
    createProductCategory: ({ input }) =>
      createProductCategory({
        variables: {
          input,
        },
      }),
  }
}
