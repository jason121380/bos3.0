import { gql, useMutation } from '@apollo/client'

export const DEL_SERVICE_CATEGORIES = gql`
  mutation DEL_SERVICE_CATEGORIES($categories: [ID!]) {
    deleteServiceCategory(itemIds: $categories)
  }
`

export const mockedDeleteServiceCategory = {
  data: {
    deleteServiceCategory: true,
  },
}

export default function useFetchDeleteServiceCategories() {
  const [delServiceCategories, { data }] = useMutation(DEL_SERVICE_CATEGORIES)

  return {
    data,
    delServiceCategories: ({ categories }) =>
      delServiceCategories({
        variables: {
          categories,
        },
      }),
  }
}
