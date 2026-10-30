import { gql, useLazyQuery, useQuery } from '@apollo/client'

export const FETCH_SERVICE_CATEGORY = gql`
  query ServiceCategories {
    serviceCategories {
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

export const mockedServiceCateResp = {
  data: {
    serviceCategories: [
      {
        id: 'bc676423-4aae-4d65-9286-49728490a9af',
        no: 'ㄑ',
        name: 'ㄑ',
        attrubution: '剪',
        remark: 'ㄑ',
        isUsing: true,
        updatedAt: 1587019835684,
        creator: {
          id: '30c6bf73-164c-4970-90fa-172f7344cc21',
          name: '姓氏名字',
        },
      },
      {
        id: '8660dd8d-a752-470b-8250-96e79fdb867a',
        no: 'A',
        name: '剪髮Rick測試',
        attrubution: '剪',
        remark: '',
        isUsing: true,
        updatedAt: 1587347007967,
        creator: {
          id: '6fc13a89-9d49-4fdd-a725-229ecb3ed093',
          name: 'Rick2 ',
        },
      },
      {
        id: '8334f452-4083-4025-ae42-375bbaaa7f69',
        no: 'AA',
        name: 'A',
        attrubution: '染',
        remark: '',
        isUsing: true,
        updatedAt: 1595399052885,
        creator: {
          id: '6fc13a89-9d49-4fdd-a725-229ecb3ed093',
          name: 'Rick2 ',
        },
      },
      {
        id: '9f5db918-9af4-47a4-a9b2-cac7d96cfe30',
        no: 'test222',
        name: 'cdc222',
        attrubution: '燙',
        remark: 'cd',
        isUsing: true,
        updatedAt: 1611212908120,
        creator: {
          id: '6fc13a89-9d49-4fdd-a725-229ecb3ed093',
          name: 'Rick2 ',
        },
      },
    ],
  },
}

export default function useFetchServiceCategories() {
  return useQuery(FETCH_SERVICE_CATEGORY, {
    fetchPolicy: 'cache-and-network',
  })
}

const FETCH_SERVICE_CATEGORY_ANALYTICS = gql`
  query FETCH_SERVICE_CATEGORY_ANALYTICS($input: ServiceCategoryAnalyticsInput!) {
    serviceCategories {
      id
      no
      name
      analytics(input: $input) {
        #服務業績
        serviceFakeTotal
        #卷使用業績
        useTicketTotal
        #客次
        customerCount
        #指定客次
        designateCount
        #不指定客次
        notDesignateCustomer
      }
    }
  }
`

export const useLazyFetchServiceCategoriesAnalytics = input => {
  const [fetchServiceCategoriesAnalytics, serviceCategoriesAnalytics] = useLazyQuery(FETCH_SERVICE_CATEGORY_ANALYTICS, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
  return {
    fetchServiceCategoriesAnalytics,
    serviceCategoriesAnalytics,
  }
}
