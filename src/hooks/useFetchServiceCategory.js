import { gql, useQuery } from '@apollo/client'

export const GET_SERVICE_CATEGORY = gql`
  query GET_SERVICE_CATEGORY($categoryId: ID!) {
    serviceCategory(categoryId: $categoryId) {
      id
      no
      name
      attribution
      remark
      isUsing
      updatedAt
      creator {
        id
        name
      }
    }
  }
`
export const mockedServiceCategoryResp = {
  data: {
    serviceCategory: {
      id: '9f5db918-9af4-47a4-a9b2-cac7d96cfe30',
      no: 'test222',
      name: 'cdc222',
      attribution: '燙',
      remark: 'cd',
      isUsing: true,
      updatedAt: 1611212908120,
      creator: {
        id: '6fc13a89-9d49-4fdd-a725-229ecb3ed093',
        name: 'Rick2 ',
      },
    },
  },
}

export default function useFetchServiceCategory({ categoryId }) {
  return useQuery(GET_SERVICE_CATEGORY, {
    variables: {
      categoryId,
    },
    fetchPolicy: 'cache-and-network',
  })
}
