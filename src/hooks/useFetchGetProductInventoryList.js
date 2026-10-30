import { gql, useQuery, useLazyQuery } from '@apollo/client'

const GET_PRODUCT_INVENTORY_LIST = gql`
  query GET_PRODUCT_INVENTORY_LIST {
    productInventoryList {
      vendorName
      productNo
      productName
      productCategory
      count
    }
  }
`

export default function useFetchGetProductInventoryList() {
  return useQuery(GET_PRODUCT_INVENTORY_LIST, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_PRODUCT_INVENTORY = gql`
  query GET_PRODUCT_INVENTORY {
    productInventoryList {
      productId
      productNo
      productName
      productCategoryId
      count
    }
  }
`

export function useFetchGetProductInventory() {
  return useQuery(GET_PRODUCT_INVENTORY, {
    fetchPolicy: 'cache-and-network',
  })
}

export function useFetchGetProductInventoryLazy() {
  const [getProductInventory, productInventoryData] = useLazyQuery(GET_PRODUCT_INVENTORY, {
    fetchPolicy: 'cache-and-network',
  })
  return [getProductInventory, productInventoryData]
}
