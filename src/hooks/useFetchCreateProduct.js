import { gql, useMutation } from '@apollo/client'

export const CREATE_PRODUCT = gql`
  mutation CREATE_PRODUCT($input: CreateProductInput!) {
    createProduct(input: $input)
  }
`

export const mockedCreateProduct = {
  data: {
    createProduct: true,
  },
}

export default function useFetchCreateProduct() {
  const [createProduct] = useMutation(CREATE_PRODUCT)
  return {
    createProduct: ({ input }) =>
      createProduct({
        variables: {
          input,
        },
      }),
  }
}
