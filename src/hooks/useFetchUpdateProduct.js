import { gql, useMutation } from '@apollo/client'

const SET_PRODUCT = gql`
  mutation SET_PRODUCT($input: UpdateProductInput!) {
    updateProduct(input: $input)
  }
`

export default function useFetchUpdateProduct() {
  const [updateProduct] = useMutation(SET_PRODUCT)
  return {
    updateProduct: ({ input }) =>
      updateProduct({
        variables: {
          input,
        },
      }),
  }
}
