import { gql, useLazyQuery, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_PRODUCT_CATEGORIES_TREEVIEW = settingsQuery(gql`
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
`)


export default function useFetchProductTreeview(
  input = {
    paranoid: true,
  }
) {
  return useQuery(GET_PRODUCT_CATEGORIES_TREEVIEW, {
    variables: {
      input,
    },
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
