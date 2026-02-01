import { gql, useMutation } from '@apollo/client'

export const UPDATE_SERVICE_CATEGORY = gql`
  mutation UPDATE_SERVICE_CATEGORY($category: UpdateServiceCategoryInput!) {
    updateServiceCategory(input: $category)
  }
`
export const updateServiceCategory = {
  data: {
    updateServiceCategory: true,
  },
}

export default function useFetchUpdateServiceCategory() {
  const [updateService, { data }] = useMutation(UPDATE_SERVICE_CATEGORY)
  return {
    updateService: ({ itemId, no, name, attribution, remark, isUsing }) =>
      updateService({
        variables: {
          category: { itemId, no, name, attribution, remark, isUsing },
        },
      }),
    data,
  }
}
