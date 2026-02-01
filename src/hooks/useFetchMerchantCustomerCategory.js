import { gql, useQuery } from '@apollo/client'

export const GET_CUSTOMER_CATEGORY = gql`
  query CUSTOMER_CATEGORY($merchantId: ID!) {
    merchantCustomerCategory(merchantId: $merchantId) {
      name
    }
  }
`

export const mockedMerchantCustomerCategory = {
  data: {
    merchantCustomerCategory: [
      {
        name: '一般',
      },
      {
        name: '不一般',
      },
    ],
  },
}

export default function useFetchMerchantCustomerCategory() {
  return useQuery(GET_CUSTOMER_CATEGORY, {
    variables: {
      merchantId: localStorage.getItem('userMerchant')
        ? JSON.parse(localStorage.getItem('userMerchant')).id
        : null,
    },
    fetchPolicy: 'cache-and-network',
  })
}
