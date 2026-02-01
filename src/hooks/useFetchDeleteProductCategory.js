import { gql, useMutation } from '@apollo/client'

export const DEL_PRODUCT_CATEGORY = gql`
  mutation DEL_PRODUCT_CATEGORY($itemIds: [ID!]) {
    deleteProductCategory(itemIds: $itemIds)
  }
`

export const mockedDeleteProductCategory = {
  data: {
    deleteProductCategory: true,
  },
}

export default function useFetchDeleteProductCategory() {
  const [deleteProductCategory] = useMutation(DEL_PRODUCT_CATEGORY)
  return {
    deleteProductCategory: ({ itemIds }) =>
      deleteProductCategory({
        variables: {
          itemIds,
        },
      }),
  }
}
