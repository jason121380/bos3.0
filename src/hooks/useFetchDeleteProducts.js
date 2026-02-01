import { gql, useMutation } from '@apollo/client'

export const DEL_PRODUCTS = gql`
  mutation DEL_PRODUCTS($itemIds: [ID!], $password: String) {
    deleteProduct(itemIds: $itemIds, password: $password)
  }
`

export const mockedDeleteProduct = {
  data: {
    deleteProduct: true,
  },
}

export default function useFetchDeleteProducts() {
  const [delProducts] = useMutation(DEL_PRODUCTS)
  return {
    delProducts: ({ itemIds, password }) =>
      delProducts({
        variables: {
          itemIds,
          password,
        },
      }),
  }
}
