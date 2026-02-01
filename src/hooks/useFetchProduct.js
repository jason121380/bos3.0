import { gql, useQuery } from '@apollo/client'

const FETCH_PRODUCT = gql`
  query FETCH_PRODUCT($productId: ID!) {
    product(productId: $productId) {
      id
      no
      name
      isAvailableForSale
      isPublished
      productCategory {
        id
        name
      }
      cost
      sellPrice
      employeePrice
      stockUnit
      safeHigh
      safeLow
      commissionWay
      commission
      customerSellSetting {
        category
        price
      }
      isLocked
      isLockedOriginalValue
      merchantVendor {
        merchantVendorUUId
      }
    }
  }
`

export default function useFetchProduct({ productId }) {
  return useQuery(FETCH_PRODUCT, {
    variables: {
      productId,
    },
    fetchPolicy: 'cache-and-network',
  })
}
