import { gql, useQuery } from '@apollo/client'

export const GET_PRODUCT_CATEGORY = gql`
  query GET_PRODUCT_CATEGORY($categoryId: ID!) {
    productCategory(categoryId: $categoryId) {
      id
      no
      name
    }
  }
`

export const mockedProductCategoryResp = {
  data: {
    productCategory: {
      id: 'id',
      no: 'no',
      name: 'name',
    },
  },
}

export default function useFetchProductCategory({ categoryId }) {
  const { data, loading, error, refetch } = useQuery(GET_PRODUCT_CATEGORY, {
    variables: {
      categoryId,
    },
  })
  return { data, loading, error, refetch }
}
