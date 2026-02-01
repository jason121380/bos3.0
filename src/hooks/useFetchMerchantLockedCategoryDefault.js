import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_LOCKED_CATEGORY_DEFAULT = gql`
  query GET_MERCHANT_LOCKED_CATEGORY_DEFAULT {
    merchantLockedCategoryDefault {
      service
      product
      ticket
    }
  }
`

export default function useFetchMerchantLockedDefault() {
  return useQuery(GET_MERCHANT_LOCKED_CATEGORY_DEFAULT, {
    fetchPolicy: 'cache-and-network',
  })
}
