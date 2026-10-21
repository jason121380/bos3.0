import { gql, useLazyQuery, useQuery } from '@apollo/client'

export const GET_PRODUCT_CATEGORIES = gql`
  query PRODUCT_CATEGORIES($input: ProductCategoriesInput!) {
    productCategories(input: $input) {
      id
      no
      name
      isUsing
      updatedAt
      creator {
        id
        name
      }
    }
  }
`

export const mockedProductCateResp = {
  data: {
    productCategories: [
      {
        id: '3cf154c1-8f13-4ccf-848c-e98e2e5af302',
        no: '122',
        name: '1221',
        isUsing: true,
        updatedAt: 1609844226794,
        creator: {
          id: 'b69fb0d9-bfbf-4814-81c9-c9081f0390cc',
          name: 'JohnWeng',
        },
      },
      {
        id: 'bb20ef7d-a7c2-45f2-bcf7-cfc1975b4bbc',
        no: 'cdcd',
        name: 'ccd',
        isUsing: true,
        updatedAt: 1610522889256,
        creator: {
          id: '6fc13a89-9d49-4fdd-a725-229ecb3ed093',
          name: 'Rick2 ',
        },
      },
      {
        id: '94fa7482-de4e-427f-b0d0-bda65a1c03e9',
        no: '2222ccdcd',
        name: 'Napla',
        isUsing: true,
        updatedAt: 1610593638708,
        creator: {
          id: '6fc13a89-9d49-4fdd-a725-229ecb3ed093',
          name: 'Rick2 ',
        },
      },
      {
        id: 'b2902861-3047-4cd4-928a-48373e677f9e',
        no: 'M',
        name: 'Masumi',
        isUsing: true,
        updatedAt: 1610591274164,
        creator: {
          id: '6fc13a89-9d49-4fdd-a725-229ecb3ed093',
          name: 'Rick2 ',
        },
      },
      {
        id: '871c18c2-2bda-459e-8a82-41e02ce5c4b4',
        no: 'J',
        name: 'JuliArt',
        isUsing: true,
        updatedAt: 1610591285525,
        creator: {
          id: '6fc13a89-9d49-4fdd-a725-229ecb3ed093',
          name: 'Rick2 ',
        },
      },
      {
        id: '2a03df30-433a-4515-b65e-e14deeee00dc',
        no: 'g',
        name: '哥德式',
        isUsing: true,
        updatedAt: 1610593382223,
        creator: {
          id: '6fc13a89-9d49-4fdd-a725-229ecb3ed093',
          name: 'Rick2 ',
        },
      },
      {
        id: '7fc77709-08b0-4d38-91ea-cc95adf4a8ea',
        no: '123',
        name: '212',
        isUsing: true,
        updatedAt: 1610955425694,
        creator: {
          id: '6fc13a89-9d49-4fdd-a725-229ecb3ed093',
          name: 'Rick2 ',
        },
      },
      {
        id: '7565556b-a38e-4871-8770-9ebadb97a17a',
        no: '1',
        name: '122',
        isUsing: true,
        updatedAt: 1610957179348,
        creator: {
          id: '6fc13a89-9d49-4fdd-a725-229ecb3ed093',
          name: 'Rick2 ',
        },
      },
      {
        id: '96576876-075e-4943-8eee-849c36d1163f',
        no: '0',
        name: '0',
        isUsing: true,
        updatedAt: 1610593708647,
        creator: {
          id: '6fc13a89-9d49-4fdd-a725-229ecb3ed093',
          name: 'Rick2 ',
        },
      },
      {
        id: '75ade9e0-f87e-455e-a309-6a267ad728e1',
        no: 'R',
        name: 'Renata',
        isUsing: true,
        updatedAt: 1610940148768,
        creator: {
          id: '6fc13a89-9d49-4fdd-a725-229ecb3ed093',
          name: 'Rick2 ',
        },
      },
    ],
  },
}

export default function useFetchProductCategories(
  input = {
    paranoid: true,
  }
) {
  return useQuery(GET_PRODUCT_CATEGORIES, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

export const GET_PRODUCT_CATEGORIES_IN_CREATE_PICKING = gql`
  query GET_PRODUCT_CATEGORIES_IN_CREATE_PICKING($input: ProductCategoriesInput!) {
    productCategories(input: $input) {
      id
      name
    }
  }
`

export function useFetchProductCategoriesInCreatePicking(
  input = {
    paranoid: true,
  }
) {
  return useQuery(GET_PRODUCT_CATEGORIES_IN_CREATE_PICKING, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const FETCH_PRODUCT_CATEGORIES_ANALYTICS = gql`
  query FETCH_PRODUCT_CATEGORIES_ANALYTICS(
    $input: ProductCategoriesInput!
    $date: ProductCategoryAnalyticsInput!
  ) {
    productCategories(input: $input) {
      id
      no
      name
      analytics(input: $date) {
        #店販業績
        productAmountTotal
        #客次
        customerCount
      }
    }
  }
`

export const useFetchProductCategoriesAnalytics = ({ input = { paranoid: true }, date }) =>
  useQuery(FETCH_PRODUCT_CATEGORIES_ANALYTICS, {
    variables: {
      input,
      date,
    },
    fetchPolicy: 'cache-and-network',
  })

const MERCHANT_SALES_ANALYTICS = gql`
  query MERCHANT_SALES_ANALYTICS(
    $input: ProductCategoriesInput!
    $analytics: ProductCategoryAnalyticsInput!
  ) {
    productCategories(input: $input) {
      id
      no
      name
      analytics(input: $analytics) {
        #店販業績
        productAmountTotal
        #客次
        customerCount
      }
    }
  }
`

export const useFetchMerchantSalesAnalytics = variables => {
  const [fetchMerchantSalesAnalytics, merchantSalesAnalytics] = useLazyQuery(
    MERCHANT_SALES_ANALYTICS,
    {
      variables,
    }
  )
  return {
    fetchMerchantSalesAnalytics,
    merchantSalesAnalytics,
  }
}
