import { gql, useLazyQuery, useQuery } from '@apollo/client'

export const GET_PRODUCT_CATEGORIES_TREEVIEW = gql`
  query GET_PRODUCT_CATEGORIES_TREEVIEW($input: ProductCategoriesInput!) {
    productCategories(input: $input) {
      id
      name
      products {
        id
        no
        name
      }
    }
  }
`


export default function useFetchProductTreeview(
  input = {
    paranoid: true,
  }
) {
  return useQuery(GET_PRODUCT_CATEGORIES_TREEVIEW, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
